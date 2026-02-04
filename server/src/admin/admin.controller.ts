import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@Controller("admin/analytics")
@UseGuards(JwtAuthGuard, AdminGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 requests per minute for admin endpoints
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/analytics/dashboard
   * Returns dashboard statistics including total users, new users, and active users
   */
  @Get("dashboard")
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  /**
   * GET /admin/analytics/courses
   * Returns course analytics including popularity, completion rates, and average progress
   */
  @Get("courses")
  async getCourseAnalytics() {
    return this.adminService.getCourseAnalytics();
  }

  /**
   * GET /admin/analytics/tasks
   * Returns task analytics including hardest tasks and most popular tasks
   */
  @Get("tasks")
  async getTaskAnalytics() {
    return this.adminService.getTaskAnalytics();
  }

  /**
   * GET /admin/analytics/submissions
   * Returns submission statistics including total submissions, by status, and daily trends
   */
  @Get("submissions")
  async getSubmissionStats() {
    return this.adminService.getSubmissionStats();
  }

  /**
   * GET /admin/analytics/subscriptions
   * Returns subscription statistics including active subscriptions, new subscriptions, and revenue
   */
  @Get("subscriptions")
  async getSubscriptionStats() {
    return this.adminService.getSubscriptionStats();
  }

  /**
   * GET /admin/analytics/ai-usage
   * Returns AI usage statistics including total usage and daily trends
   */
  @Get("ai-usage")
  async getAiUsageStats() {
    return this.adminService.getAiUsageStats();
  }

  /**
   * GET /admin/analytics/users/search?q=query
   * Search users by email or name
   */
  @Get("users/search")
  async searchUsers(@Query("q") query: string) {
    return this.adminService.searchUsers(query);
  }

  /**
   * GET /admin/analytics/users/:id
   * Get user details by ID
   */
  @Get("users/:id")
  async getUserById(@Param("id") userId: string) {
    const user = await this.adminService.getUserById(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  /**
   * GET /admin/analytics/users/banned
   * Get list of banned users
   */
  @Get("users/banned/list")
  async getBannedUsers(
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.adminService.getBannedUsers(
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * POST /admin/analytics/users/:id/ban
   * Ban a user
   */
  @Post("users/:id/ban")
  async banUser(
    @Param("id") userId: string,
    @Body("reason") reason: string,
    @Request() req: { user: { userId: string } },
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("Ban reason is required");
    }
    try {
      return await this.adminService.banUser(
        userId,
        reason.trim(),
        req.user.userId,
      );
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Failed to ban user",
      );
    }
  }

  /**
   * POST /admin/analytics/users/:id/unban
   * Unban a user
   */
  @Post("users/:id/unban")
  async unbanUser(@Param("id") userId: string, @Request() req) {
    try {
      return await this.adminService.unbanUser(userId, req.user.userId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Failed to unban user",
      );
    }
  }

  // ============================================
  // PAYMENTS MANAGEMENT (Admin Panel Phase 2.2)
  // ============================================

  /**
   * GET /admin/analytics/payments
   * Get all payments with filtering
   */
  @Get("payments")
  async getPayments(
    @Query("status") status?: string,
    @Query("provider") provider?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.adminService.getPayments({
      status,
      provider,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  /**
   * GET /admin/analytics/payments/revenue
   * Get revenue analytics
   */
  @Get("payments/revenue")
  async getRevenueAnalytics() {
    return this.adminService.getRevenueAnalytics();
  }

  /**
   * GET /admin/analytics/payments/:id
   * Get payment details by ID
   */
  @Get("payments/:id")
  async getPaymentById(@Param("id") paymentId: string) {
    const payment = await this.adminService.getPaymentById(paymentId);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return payment;
  }

  /**
   * POST /admin/analytics/payments/:id/refund
   * Refund a payment
   */
  @Post("payments/:id/refund")
  async refundPayment(
    @Param("id") paymentId: string,
    @Body("reason") reason: string,
  ) {
    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("Refund reason is required");
    }
    try {
      return await this.adminService.refundPayment(paymentId, reason.trim());
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : "Failed to refund payment",
      );
    }
  }

  /**
   * GET /admin/analytics/purchases
   * Get all one-time purchases
   */
  @Get("purchases")
  async getPurchases(
    @Query("status") status?: string,
    @Query("type") type?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.adminService.getPurchases({
      status,
      type,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  /**
   * GET /admin/analytics/subscriptions/list
   * Get all subscriptions with filtering
   */
  @Get("subscriptions/list")
  async getSubscriptions(
    @Query("status") status?: string,
    @Query("planId") planId?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.adminService.getSubscriptions({
      status,
      planId,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  /**
   * GET /admin/analytics/subscriptions/plans
   * Get all subscription plans
   */
  @Get("subscriptions/plans")
  async getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  /**
   * GET /admin/analytics/subscriptions/:id
   * Get subscription details by ID
   */
  @Get("subscriptions/:id")
  async getSubscriptionById(@Param("id") subscriptionId: string) {
    const subscription =
      await this.adminService.getSubscriptionById(subscriptionId);
    if (!subscription) {
      throw new NotFoundException("Subscription not found");
    }
    return subscription;
  }

  /**
   * POST /admin/analytics/subscriptions/:id/extend
   * Extend subscription manually
   */
  @Post("subscriptions/:id/extend")
  async extendSubscription(
    @Param("id") subscriptionId: string,
    @Body("days") days: number,
  ) {
    if (!days || days <= 0 || days > 365) {
      throw new BadRequestException("Days must be between 1 and 365");
    }
    try {
      return await this.adminService.extendSubscription(subscriptionId, days);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : "Failed to extend subscription",
      );
    }
  }

  /**
   * POST /admin/analytics/subscriptions/:id/cancel
   * Cancel subscription manually
   */
  @Post("subscriptions/:id/cancel")
  async cancelSubscription(@Param("id") subscriptionId: string) {
    try {
      return await this.adminService.cancelSubscription(subscriptionId);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : "Failed to cancel subscription",
      );
    }
  }

  // ============================================
  // ANALYTICS TIMELINE (DAU/MAU, Revenue)
  // ============================================

  /**
   * GET /admin/analytics/timeline?days=30
   * Get analytics timeline with DAU, new users, and revenue per day
   */
  @Get("timeline")
  async getAnalyticsTimeline(@Query("days") days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
      throw new BadRequestException("Days must be between 1 and 365");
    }
    return this.adminService.getAnalyticsTimeline(daysNum);
  }
}
