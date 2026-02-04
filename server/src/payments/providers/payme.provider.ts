import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Payme Transaction States
 * @see https://developer.help.paycom.uz/protokol-merchant-api/
 */
export enum PaymeTransactionState {
  PENDING = 1, // Transaction created, awaiting payment
  COMPLETED = 2, // Transaction successfully completed
  CANCELLED_BEFORE = -1, // Cancelled before completion
  CANCELLED_AFTER = -2, // Cancelled after completion (refund)
}

/**
 * Payme Error Codes
 */
export enum PaymeErrorCode {
  INVALID_AMOUNT = -31001,
  INVALID_ACCOUNT = -31050,
  TRANSACTION_NOT_FOUND = -31003,
  OPERATION_NOT_ALLOWED = -31008,
  INTERNAL_ERROR = -32400,
  INVALID_JSON_RPC = -32600,
  METHOD_NOT_FOUND = -32601,
}

/**
 * Payme Merchant API Provider
 * Implements JSON-RPC 2.0 protocol for payment processing
 *
 * @see https://developer.help.paycom.uz/
 */
@Injectable()
export class PaymeProvider {
  private readonly logger = new Logger(PaymeProvider.name);
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly testMode: boolean;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.merchantId = this.configService.get<string>("PAYME_MERCHANT_ID") || "";
    this.secretKey = this.configService.get<string>("PAYME_SECRET_KEY") || "";
    this.testMode =
      this.configService.get<string>("PAYME_TEST_MODE") === "true";

    if (!this.merchantId) {
      this.logger.warn("PAYME_MERCHANT_ID not configured");
    }
  }

  /**
   * Check if Payme is configured
   */
  isConfigured(): boolean {
    return !!this.merchantId && !!this.secretKey;
  }

  /**
   * Get checkout base URL
   */
  private getCheckoutUrl(): string {
    return this.testMode
      ? "https://test.paycom.uz"
      : "https://checkout.paycom.uz";
  }

  /**
   * Generate payment link for checkout redirect
   *
   * @param orderId - Internal order ID
   * @param amount - Amount in tiyn (1 UZS = 100 tiyn)
   * @param returnUrl - URL to redirect after payment
   */
  generatePaymentLink(
    orderId: string,
    amount: number,
    returnUrl?: string,
  ): string {
    // Payme uses base64 encoded parameters
    // Format: m=merchant_id;ac.order_id=123;a=50000
    const params = `m=${this.merchantId};ac.order_id=${orderId};a=${amount}`;
    const encoded = Buffer.from(params).toString("base64");

    let url = `${this.getCheckoutUrl()}/${encoded}`;

    if (returnUrl) {
      url += `?callback=${encodeURIComponent(returnUrl)}`;
    }

    return url;
  }

  /**
   * Verify Basic Auth header from Payme webhooks
   */
  verifyAuth(authHeader: string): boolean {
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return false;
    }

    const base64Credentials = authHeader.slice(6);
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8",
    );
    const [login, password] = credentials.split(":");

    // Payme sends: Paycom:{secret_key}
    return login === "Paycom" && password === this.secretKey;
  }

  /**
   * Handle webhook request from Payme
   * Routes to appropriate method handler
   */
  async handleWebhook(
    method: string,
    params: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: unknown }> {
    this.logger.debug(`Payme webhook: ${method}`, params);

    try {
      switch (method) {
        case "CheckPerformTransaction":
          return await this.checkPerformTransaction(params);
        case "CreateTransaction":
          return await this.createTransaction(params);
        case "PerformTransaction":
          return await this.performTransaction(params);
        case "CancelTransaction":
          return await this.cancelTransaction(params);
        case "CheckTransaction":
          return await this.checkTransaction(params);
        case "GetStatement":
          return await this.getStatement(params);
        default:
          return this.error(
            PaymeErrorCode.METHOD_NOT_FOUND,
            "Method not found",
          );
      }
    } catch (error) {
      this.logger.error(`Payme webhook error: ${method}`, error);
      return this.error(PaymeErrorCode.INTERNAL_ERROR, "Internal server error");
    }
  }

  /**
   * CheckPerformTransaction - Verify if payment can be made
   * Called before CreateTransaction to validate order
   */
  private async checkPerformTransaction(
    params: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: unknown }> {
    const account = params.account as Record<string, unknown>;
    const orderId = account?.order_id as string;
    const amount = params.amount as number;

    if (!orderId) {
      return this.error(PaymeErrorCode.INVALID_ACCOUNT, "Order ID is required");
    }

    // Try to find the order (subscription payment or purchase)
    const order = await this.findOrder(orderId);

    if (!order) {
      return this.error(PaymeErrorCode.INVALID_ACCOUNT, "Order not found");
    }

    if (order.status !== "pending") {
      return this.error(
        PaymeErrorCode.OPERATION_NOT_ALLOWED,
        "Order already processed",
      );
    }

    if (order.amount !== amount) {
      return this.error(PaymeErrorCode.INVALID_AMOUNT, "Invalid amount");
    }

    return { result: { allow: true } };
  }

  /**
   * CreateTransaction - Create payment transaction
   * Called when user initiates payment
   */
  private async createTransaction(
    params: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: unknown }> {
    const id = params.id as string;
    const time = params.time as number;
    const amount = params.amount as number;
    const account = params.account as Record<string, unknown>;
    const orderId = account?.order_id as string;

    // Check if transaction already exists
    const existing = await this.prisma.paymentTransaction.findFirst({
      where: { providerTxId: id, provider: "payme" },
    });

    if (existing) {
      // Return existing transaction info
      return {
        result: {
          create_time: existing.createdAt.getTime(),
          transaction: existing.orderId,
          state: existing.state,
        },
      };
    }

    // Verify order
    const order = await this.findOrder(orderId);
    if (!order || order.status !== "pending" || order.amount !== amount) {
      return this.error(PaymeErrorCode.INVALID_ACCOUNT, "Invalid order");
    }

    // Create transaction record
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        orderId,
        orderType: order.type,
        provider: "payme",
        providerTxId: id,
        amount,
        state: PaymeTransactionState.PENDING,
        action: "create",
        request: params as object,
      },
    });

    return {
      result: {
        create_time: transaction.createdAt.getTime(),
        transaction: orderId,
        state: PaymeTransactionState.PENDING,
      },
    };
  }

  /**
   * PerformTransaction - Complete the payment
   * Called after successful card debit
   */
  private async performTransaction(
    params: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: unknown }> {
    const id = params.id as string;

    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: { providerTxId: id, provider: "payme" },
    });

    if (!transaction) {
      return this.error(
        PaymeErrorCode.TRANSACTION_NOT_FOUND,
        "Transaction not found",
      );
    }

    if (transaction.state === PaymeTransactionState.COMPLETED) {
      // Already completed
      return {
        result: {
          transaction: transaction.orderId,
          perform_time: transaction.updatedAt?.getTime() || Date.now(),
          state: PaymeTransactionState.COMPLETED,
        },
      };
    }

    if (transaction.state !== PaymeTransactionState.PENDING) {
      return this.error(
        PaymeErrorCode.OPERATION_NOT_ALLOWED,
        "Invalid transaction state",
      );
    }

    const performTime = Date.now();

    // Update transaction
    await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        state: PaymeTransactionState.COMPLETED,
        action: "perform",
      },
    });

    // Complete the order
    await this.completeOrder(transaction.orderId, transaction.orderType, id);

    // Log the perform action
    await this.prisma.paymentTransaction.create({
      data: {
        orderId: transaction.orderId,
        orderType: transaction.orderType,
        provider: "payme",
        providerTxId: id,
        amount: transaction.amount,
        state: PaymeTransactionState.COMPLETED,
        action: "perform",
        request: params as object,
      },
    });

    return {
      result: {
        transaction: transaction.orderId,
        perform_time: performTime,
        state: PaymeTransactionState.COMPLETED,
      },
    };
  }

  /**
   * CancelTransaction - Cancel/refund payment
   */
  private async cancelTransaction(
    params: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: unknown }> {
    const id = params.id as string;
    const reason = params.reason as number;

    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: { providerTxId: id, provider: "payme" },
      orderBy: { createdAt: "desc" },
    });

    if (!transaction) {
      return this.error(
        PaymeErrorCode.TRANSACTION_NOT_FOUND,
        "Transaction not found",
      );
    }

    const cancelState =
      transaction.state === PaymeTransactionState.COMPLETED
        ? PaymeTransactionState.CANCELLED_AFTER
        : PaymeTransactionState.CANCELLED_BEFORE;

    const cancelTime = Date.now();

    // Update transaction
    await this.prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        state: cancelState,
        action: "cancel",
      },
    });

    // Cancel the order
    await this.cancelOrder(transaction.orderId, transaction.orderType);

    return {
      result: {
        transaction: transaction.orderId,
        cancel_time: cancelTime,
        state: cancelState,
      },
    };
  }

  /**
   * CheckTransaction - Get transaction status
   */
  private async checkTransaction(
    params: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: unknown }> {
    const id = params.id as string;

    const transaction = await this.prisma.paymentTransaction.findFirst({
      where: { providerTxId: id, provider: "payme" },
      orderBy: { createdAt: "desc" },
    });

    if (!transaction) {
      return this.error(
        PaymeErrorCode.TRANSACTION_NOT_FOUND,
        "Transaction not found",
      );
    }

    return {
      result: {
        create_time: transaction.createdAt.getTime(),
        perform_time:
          transaction.state === PaymeTransactionState.COMPLETED
            ? transaction.createdAt.getTime()
            : 0,
        cancel_time:
          transaction.state < 0 ? transaction.createdAt.getTime() : 0,
        transaction: transaction.orderId,
        state: transaction.state,
        reason: null,
      },
    };
  }

  /**
   * GetStatement - Get transaction list for reconciliation
   */
  private async getStatement(
    params: Record<string, unknown>,
  ): Promise<{ result?: unknown; error?: unknown }> {
    const from = params.from as number;
    const to = params.to as number;

    const transactions = await this.prisma.paymentTransaction.findMany({
      where: {
        provider: "payme",
        createdAt: {
          gte: new Date(from),
          lte: new Date(to),
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      result: {
        transactions: transactions.map((tx) => ({
          id: tx.providerTxId,
          time: tx.createdAt.getTime(),
          amount: tx.amount,
          account: { order_id: tx.orderId },
          create_time: tx.createdAt.getTime(),
          perform_time:
            tx.state === PaymeTransactionState.COMPLETED
              ? tx.createdAt.getTime()
              : 0,
          cancel_time: tx.state < 0 ? tx.createdAt.getTime() : 0,
          transaction: tx.orderId,
          state: tx.state,
          reason: null,
        })),
      },
    };
  }

  /**
   * Helper: Find order by ID (subscription payment or purchase)
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
          provider: "payme",
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
          provider: "payme",
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
  private error(code: PaymeErrorCode, message: string): { error: unknown } {
    return {
      error: {
        code,
        message: { ru: message, uz: message, en: message },
      },
    };
  }
}
