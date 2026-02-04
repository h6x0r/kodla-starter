import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import * as crypto from "crypto";

/**
 * Click Action Types
 */
export enum ClickAction {
  PREPARE = 0, // Validate order before payment
  COMPLETE = 1, // Complete payment after card debit
}

/**
 * Click Error Codes
 */
export enum ClickErrorCode {
  SUCCESS = 0,
  SIGN_CHECK_FAILED = -1,
  INVALID_AMOUNT = -2,
  ACTION_NOT_FOUND = -3,
  ALREADY_PAID = -4,
  USER_NOT_FOUND = -5,
  TRANSACTION_NOT_FOUND = -6,
  FAILED_TO_UPDATE = -7,
  INVALID_REQUEST = -8,
  TRANSACTION_CANCELLED = -9,
}

/**
 * Click Shop API Provider
 * Implements payment processing via Click system
 *
 * @see https://docs.click.uz/en/click-api/
 */
@Injectable()
export class ClickProvider {
  private readonly logger = new Logger(ClickProvider.name);
  private readonly serviceId: string;
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly merchantUserId: string;
  private readonly testMode: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.serviceId = this.configService.get<string>("CLICK_SERVICE_ID") || "";
    this.merchantId = this.configService.get<string>("CLICK_MERCHANT_ID") || "";
    this.secretKey = this.configService.get<string>("CLICK_SECRET_KEY") || "";
    this.merchantUserId =
      this.configService.get<string>("CLICK_MERCHANT_USER_ID") || "";
    this.testMode =
      this.configService.get<string>("CLICK_TEST_MODE") === "true";

    if (!this.serviceId || !this.merchantId) {
      this.logger.warn("CLICK_SERVICE_ID or CLICK_MERCHANT_ID not configured");
    }
  }

  /**
   * Check if Click is configured
   */
  isConfigured(): boolean {
    return !!this.serviceId && !!this.merchantId && !!this.secretKey;
  }

  /**
   * Generate payment URL for Click checkout
   *
   * @param orderId - Internal order ID
   * @param amount - Amount in UZS (not tiyn!)
   * @param returnUrl - URL to redirect after payment
   */
  generatePaymentLink(
    orderId: string,
    amount: number,
    returnUrl?: string,
  ): string {
    const baseUrl = "https://my.click.uz/services/pay";

    const params = new URLSearchParams({
      service_id: this.serviceId,
      merchant_id: this.merchantId,
      amount: amount.toString(),
      transaction_param: orderId,
      merchant_user_id: this.merchantUserId || "1",
    });

    if (returnUrl) {
      params.append("return_url", returnUrl);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Handle webhook request from Click
   * Routes to Prepare or Complete based on action
   */
  async handleWebhook(params: {
    click_trans_id: number;
    service_id: number;
    merchant_trans_id: string;
    merchant_prepare_id?: number;
    amount: number;
    action: number;
    sign_time: string;
    sign_string: string;
    error?: number;
    error_note?: string;
  }): Promise<{
    click_trans_id: number;
    merchant_trans_id: string;
    merchant_prepare_id?: number;
    merchant_confirm_id?: number;
    error: number;
    error_note: string;
  }> {
    this.logger.debug(`Click webhook action=${params.action}`, params);

    // Verify signature
    if (!this.verifySignature(params)) {
      return this.errorResponse(
        params,
        ClickErrorCode.SIGN_CHECK_FAILED,
        "Invalid signature",
      );
    }

    // Check if error from Click
    if (params.error && params.error !== 0) {
      await this.handleClickError(params);
      return this.errorResponse(
        params,
        params.error,
        params.error_note || "Click error",
      );
    }

    try {
      switch (params.action) {
        case ClickAction.PREPARE:
          return await this.prepare(params);
        case ClickAction.COMPLETE:
          return await this.complete(params);
        default:
          return this.errorResponse(
            params,
            ClickErrorCode.ACTION_NOT_FOUND,
            "Unknown action",
          );
      }
    } catch (error) {
      this.logger.error("Click webhook error", error);
      return this.errorResponse(
        params,
        ClickErrorCode.FAILED_TO_UPDATE,
        "Internal error",
      );
    }
  }

  /**
   * Prepare - Validate order before payment
   * Called by Click before debiting the card
   */
  private async prepare(params: {
    click_trans_id: number;
    service_id: number;
    merchant_trans_id: string;
    amount: number;
    sign_time: string;
  }): Promise<{
    click_trans_id: number;
    merchant_trans_id: string;
    merchant_prepare_id: number;
    error: number;
    error_note: string;
  }> {
    const orderId = params.merchant_trans_id;
    const amount = params.amount * 100; // Click sends amount in UZS, we store in tiyn

    // Find order
    const order = await this.findOrder(orderId);

    if (!order) {
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: orderId,
        merchant_prepare_id: 0,
        error: ClickErrorCode.USER_NOT_FOUND,
        error_note: "Order not found",
      };
    }

    if (order.status === "completed") {
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: orderId,
        merchant_prepare_id: 0,
        error: ClickErrorCode.ALREADY_PAID,
        error_note: "Order already paid",
      };
    }

    if (order.amount !== amount) {
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: orderId,
        merchant_prepare_id: 0,
        error: ClickErrorCode.INVALID_AMOUNT,
        error_note: `Invalid amount: expected ${order.amount}, got ${amount}`,
      };
    }

    // Create transaction record
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId,
        orderType: order.type,
        provider: "click",
        providerTxId: params.click_trans_id.toString(),
        amount: order.amount,
        state: 0, // Prepare state
        action: "prepare",
        request: params as unknown as object,
      },
    });

    return {
      click_trans_id: params.click_trans_id,
      merchant_trans_id: orderId,
      merchant_prepare_id:
        parseInt(transaction.id.slice(0, 8), 16) || Date.now(), // Use part of UUID as prepare_id
      error: ClickErrorCode.SUCCESS,
      error_note: "Success",
    };
  }

  /**
   * Complete - Finalize payment after card debit
   * Called by Click after successful payment
   */
  private async complete(params: {
    click_trans_id: number;
    service_id: number;
    merchant_trans_id: string;
    merchant_prepare_id?: number;
    amount: number;
    sign_time: string;
    error?: number;
  }): Promise<{
    click_trans_id: number;
    merchant_trans_id: string;
    merchant_confirm_id: number;
    error: number;
    error_note: string;
  }> {
    const orderId = params.merchant_trans_id;

    // Find existing transaction
    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: {
        orderId,
        provider: "click",
        action: "prepare",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!transaction) {
      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: orderId,
        merchant_confirm_id: 0,
        error: ClickErrorCode.TRANSACTION_NOT_FOUND,
        error_note: "Transaction not found",
      };
    }

    // Check for cancellation from Click
    if (params.error && params.error < 0) {
      await this.cancelOrder(orderId, transaction.orderType);

      await this.prisma.paymentTransaction.create({
        data: {
          orderId,
          orderType: transaction.orderType,
          provider: "click",
          providerTxId: params.click_trans_id.toString(),
          amount: transaction.amount,
          state: -1, // Cancelled
          action: "cancel",
          errorCode: params.error,
          errorMessage: "Cancelled by Click",
          request: params as unknown as object,
        },
      });

      return {
        click_trans_id: params.click_trans_id,
        merchant_trans_id: orderId,
        merchant_confirm_id: 0,
        error: ClickErrorCode.TRANSACTION_CANCELLED,
        error_note: "Transaction cancelled",
      };
    }

    // Complete the order
    await this.completeOrder(
      orderId,
      transaction.orderType,
      params.click_trans_id.toString(),
    );

    // Log completion
    await this.prisma.paymentTransaction.create({
      data: {
        orderId,
        orderType: transaction.orderType,
        provider: "click",
        providerTxId: params.click_trans_id.toString(),
        amount: transaction.amount,
        state: 1, // Completed
        action: "complete",
        request: params as unknown as object,
      },
    });

    return {
      click_trans_id: params.click_trans_id,
      merchant_trans_id: orderId,
      merchant_confirm_id: Date.now(),
      error: ClickErrorCode.SUCCESS,
      error_note: "Success",
    };
  }

  /**
   * Verify Click signature
   *
   * Prepare signature: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
   * Complete signature: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
   */
  private verifySignature(params: {
    click_trans_id: number;
    service_id: number;
    merchant_trans_id: string;
    merchant_prepare_id?: number;
    amount: number;
    action: number;
    sign_time: string;
    sign_string: string;
  }): boolean {
    let signString: string;

    if (params.action === ClickAction.PREPARE) {
      signString = [
        params.click_trans_id,
        params.service_id,
        this.secretKey,
        params.merchant_trans_id,
        params.amount,
        params.action,
        params.sign_time,
      ].join("");
    } else {
      signString = [
        params.click_trans_id,
        params.service_id,
        this.secretKey,
        params.merchant_trans_id,
        params.merchant_prepare_id || "",
        params.amount,
        params.action,
        params.sign_time,
      ].join("");
    }

    const expectedSign = crypto
      .createHash("md5")
      .update(signString)
      .digest("hex");

    return expectedSign === params.sign_string;
  }

  /**
   * Handle error from Click
   */
  private async handleClickError(params: {
    merchant_trans_id: string;
    error?: number;
    error_note?: string;
  }): Promise<void> {
    const orderId = params.merchant_trans_id;

    await this.prisma.paymentTransaction.create({
      data: {
        orderId,
        orderType: "unknown",
        provider: "click",
        amount: 0,
        state: -1,
        action: "error",
        errorCode: params.error,
        errorMessage: params.error_note,
        request: params as unknown as object,
      },
    });
  }

  /**
   * Helper: Find order by ID
   */
  private async findOrder(orderId: string): Promise<{
    id: string;
    type: "subscription" | "purchase";
    amount: number;
    status: string;
  } | null> {
    // Try to find as payment (subscription)
    const payment = await this.prisma.payment.findUnique({
      where: { id: orderId },
    });

    if (payment) {
      return {
        id: payment.id,
        type: "subscription",
        amount: payment.amount,
        status: payment.status,
      };
    }

    // Try to find as purchase
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: orderId },
    });

    if (purchase) {
      return {
        id: purchase.id,
        type: "purchase",
        amount: purchase.amount,
        status: purchase.status,
      };
    }

    return null;
  }

  /**
   * Helper: Complete order after successful payment
   */
  private async completeOrder(
    orderId: string,
    orderType: string,
    providerTxId: string,
  ): Promise<void> {
    if (orderType === "subscription") {
      await this.prisma.payment.update({
        where: { id: orderId },
        data: {
          status: "completed",
          provider: "click",
          providerTxId,
        },
      });

      // Also activate the subscription
      const payment = await this.prisma.payment.findUnique({
        where: { id: orderId },
        include: { subscription: true },
      });

      if (payment?.subscription) {
        await this.prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: "active" },
        });

        // Update user isPremium status
        await this.prisma.user.update({
          where: { id: payment.subscription.userId },
          data: { isPremium: true },
        });
      }
    } else if (orderType === "purchase") {
      const purchase = await this.prisma.purchase.update({
        where: { id: orderId },
        data: {
          status: "completed",
          provider: "click",
          providerTxId,
        },
      });

      // Grant purchased items based on type
      if (purchase.type === "roadmap_generation") {
        await this.prisma.user.update({
          where: { id: purchase.userId },
          data: {
            roadmapGenerations: {
              increment: purchase.quantity,
            },
          },
        });
      } else if (purchase.type === "course_access") {
        // Grant lifetime course access
        const metadata = purchase.metadata as { courseId?: string } | null;
        if (metadata?.courseId) {
          await this.prisma.courseAccess.upsert({
            where: {
              userId_courseId: {
                userId: purchase.userId,
                courseId: metadata.courseId,
              },
            },
            create: {
              userId: purchase.userId,
              courseId: metadata.courseId,
              purchaseId: purchase.id,
              expiresAt: null, // Lifetime access
            },
            update: {
              purchaseId: purchase.id,
              expiresAt: null, // Extend to lifetime
            },
          });
          this.logger.log(
            `Granted course access: userId=${purchase.userId}, courseId=${metadata.courseId}`,
          );
        }
      }
    }
  }

  /**
   * Helper: Cancel order
   */
  private async cancelOrder(orderId: string, orderType: string): Promise<void> {
    if (orderType === "subscription") {
      await this.prisma.payment.update({
        where: { id: orderId },
        data: { status: "failed" },
      });
    } else if (orderType === "purchase") {
      await this.prisma.purchase.update({
        where: { id: orderId },
        data: { status: "failed" },
      });
    }
  }

  /**
   * Helper: Format error response
   */
  private errorResponse(
    params: { click_trans_id: number; merchant_trans_id: string },
    error: number,
    errorNote: string,
  ): {
    click_trans_id: number;
    merchant_trans_id: string;
    error: number;
    error_note: string;
  } {
    return {
      click_trans_id: params.click_trans_id,
      merchant_trans_id: params.merchant_trans_id,
      error,
      error_note: errorNote,
    };
  }
}
