import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  IpWhitelistGuard,
  IpWhitelist,
} from "../common/guards/ip-whitelist.guard";
import { PaymentsService } from "./payments.service";
import {
  CreateCheckoutDto,
  PaymeWebhookDto,
  ClickWebhookDto,
} from "./dto/payment.dto";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Get available payment providers
   */
  @Get("providers")
  getProviders() {
    return this.paymentsService.getAvailableProviders();
  }

  /**
   * Get pricing for one-time purchases
   */
  @Get("pricing")
  getPricing() {
    return this.paymentsService.getPurchasePricing();
  }

  /**
   * Get pricing for all courses (one-time purchase prices)
   * Price = 3x monthly subscription price
   */
  @Get("courses/pricing")
  @UseGuards(JwtAuthGuard)
  getCoursesPricing(@Request() req) {
    return this.paymentsService.getAllCoursesPricing(req.user.userId);
  }

  /**
   * Get pricing for a specific course
   */
  @Get("courses/pricing/:courseId")
  @UseGuards(JwtAuthGuard)
  getCoursePricing(@Request() req, @Param("courseId") courseId: string) {
    return this.paymentsService.getCoursePricing(courseId, req.user.userId);
  }

  /**
   * Get user's purchased courses (one-time purchases with lifetime access)
   */
  @Get("courses/purchased")
  @UseGuards(JwtAuthGuard)
  getPurchasedCourses(@Request() req) {
    return this.paymentsService.getUserCourseAccesses(req.user.userId);
  }

  /**
   * Get user's roadmap credits
   */
  @Get("roadmap-credits")
  @UseGuards(JwtAuthGuard)
  getRoadmapCredits(@Request() req) {
    return this.paymentsService.getRoadmapCredits(req.user.userId);
  }

  /**
   * Get user's payment history
   */
  @Get("history")
  @UseGuards(JwtAuthGuard)
  getHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.userId);
  }

  /**
   * Check payment status
   */
  @Get("status/:orderId")
  @UseGuards(JwtAuthGuard)
  getStatus(@Param("orderId") orderId: string) {
    return this.paymentsService.getPaymentStatus(orderId);
  }

  /**
   * Create checkout session
   * Returns payment URL to redirect user
   */
  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  createCheckout(@Request() req, @Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createCheckout(req.user.userId, dto);
  }

  /**
   * Payme webhook endpoint
   * Receives JSON-RPC 2.0 requests from Payme
   *
   * Security layers:
   * 1. IP Whitelist - Only Payme's servers can call this endpoint
   * 2. Basic Auth - Verified in PaymentsService
   */
  @Post("webhook/payme")
  @UseGuards(IpWhitelistGuard)
  @IpWhitelist("payme")
  @HttpCode(HttpStatus.OK)
  async handlePaymeWebhook(
    @Body() body: PaymeWebhookDto,
    @Headers("authorization") authHeader: string,
  ) {
    const response = await this.paymentsService.handlePaymeWebhook(
      body.method,
      body.params || {},
      authHeader || "",
    );

    // JSON-RPC 2.0 response format
    return {
      jsonrpc: "2.0",
      id: body.id,
      ...response,
    };
  }

  /**
   * Click webhook endpoint
   * Receives POST requests from Click
   *
   * Security layers:
   * 1. IP Whitelist - Only Click's servers can call this endpoint
   * 2. HMAC Signature - Verified in PaymentsService
   */
  @Post("webhook/click")
  @UseGuards(IpWhitelistGuard)
  @IpWhitelist("click")
  @HttpCode(HttpStatus.OK)
  async handleClickWebhook(@Body() body: ClickWebhookDto) {
    return this.paymentsService.handleClickWebhook({
      click_trans_id: body.click_trans_id,
      service_id: body.service_id,
      merchant_trans_id: body.merchant_trans_id,
      merchant_prepare_id: body.merchant_prepare_id,
      amount: body.amount,
      action: body.action,
      sign_time: body.sign_time,
      sign_string: body.sign_string,
      error: body.error,
      error_note: body.error_note,
    });
  }
}
