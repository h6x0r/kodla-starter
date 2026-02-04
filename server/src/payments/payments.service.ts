import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaymeProvider } from "./providers/payme.provider";
import { ClickProvider } from "./providers/click.provider";
import {
  CreateCheckoutDto,
  CheckoutResponse,
  PaymentProvider,
  OrderType,
  PurchaseType,
  PaymentHistoryItem,
  CoursePricingDto,
  UserCourseAccessDto,
} from "./dto/payment.dto";

/**
 * Pricing configuration (in tiyn - 1 UZS = 100 tiyn)
 */
export const PRICING: Record<
  string,
  { price: number; name: string; nameRu: string }
> = {
  // Course subscriptions - prices set in SubscriptionPlan table
  // Global premium - price set in SubscriptionPlan table

  // One-time purchases
  roadmap_generation: {
    price: 15000 * 100, // 15,000 UZS in tiyn
    name: "Roadmap Generation",
    nameRu: "Генерация Roadmap",
  },
  ai_credits: {
    price: 10000 * 100, // 10,000 UZS per 50 credits
    name: "AI Credits (50)",
    nameRu: "AI кредиты (50)",
  },
  // course_access pricing is dynamic - based on course subscription plan price * 3
};

/**
 * Course access price multiplier (lifetime = 3x monthly subscription price)
 */
export const COURSE_ACCESS_MULTIPLIER = 3;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private paymeProvider: PaymeProvider,
    private clickProvider: ClickProvider,
  ) {}

  /**
   * Get available payment providers
   */
  getAvailableProviders(): { id: string; name: string; configured: boolean }[] {
    return [
      {
        id: "payme",
        name: "Payme",
        configured: this.paymeProvider.isConfigured(),
      },
      {
        id: "click",
        name: "Click",
        configured: this.clickProvider.isConfigured(),
      },
    ];
  }

  /**
   * Get pricing for one-time purchases
   */
  getPurchasePricing() {
    return Object.entries(PRICING).map(([type, data]) => ({
      type,
      ...data,
      priceFormatted: this.formatPrice(data.price),
    }));
  }

  /**
   * Create checkout session and return payment URL
   */
  async createCheckout(
    userId: string,
    dto: CreateCheckoutDto,
  ): Promise<CheckoutResponse> {
    let orderId: string;
    let amount: number;
    let description: string;

    if (dto.orderType === OrderType.SUBSCRIPTION) {
      // Subscription purchase
      if (!dto.planId) {
        throw new BadRequestException("planId is required for subscription");
      }

      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id: dto.planId },
        include: { course: true },
      });

      if (!plan) {
        throw new NotFoundException("Subscription plan not found");
      }

      // Create or get existing subscription
      const subscription = await this.prisma.subscription.upsert({
        where: {
          userId_planId: { userId, planId: dto.planId },
        },
        create: {
          userId,
          planId: dto.planId,
          status: "pending",
          startDate: new Date(),
          endDate: this.calculateEndDate(),
        },
        update: {
          status: "pending",
        },
      });

      // Create payment record
      const payment = await this.prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.priceMonthly,
          currency: plan.currency,
          status: "pending",
        },
      });

      orderId = payment.id;
      amount = plan.priceMonthly;
      description = plan.course
        ? `${plan.course.title} - Monthly`
        : `${plan.name} - Monthly`;
    } else {
      // One-time purchase
      if (!dto.purchaseType) {
        throw new BadRequestException("purchaseType is required for purchase");
      }

      // Handle course_access purchase separately (dynamic pricing)
      if (dto.purchaseType === PurchaseType.COURSE_ACCESS) {
        if (!dto.courseId) {
          throw new BadRequestException(
            "courseId is required for course_access purchase",
          );
        }

        // Get course and its subscription plan for pricing
        const coursePricing = await this.getCoursePricing(dto.courseId, userId);
        if (coursePricing.hasAccess) {
          throw new ConflictException("User already has access to this course");
        }

        amount = coursePricing.price;

        // Create purchase record with courseId in metadata
        const purchase = await this.prisma.purchase.create({
          data: {
            userId,
            type: dto.purchaseType,
            quantity: 1,
            amount,
            currency: "UZS",
            status: "pending",
            metadata: {
              courseId: dto.courseId,
              courseSlug: coursePricing.courseSlug,
              courseName: coursePricing.courseName,
            },
          },
        });

        orderId = purchase.id;
        description = `${coursePricing.courseName} - Lifetime Access`;
      } else {
        // Standard one-time purchases (roadmap, ai_credits)
        const pricing = PRICING[dto.purchaseType];
        if (!pricing) {
          throw new BadRequestException("Invalid purchase type");
        }

        const quantity = dto.quantity || 1;
        amount = pricing.price * quantity;

        // Create purchase record
        const purchase = await this.prisma.purchase.create({
          data: {
            userId,
            type: dto.purchaseType,
            quantity,
            amount,
            currency: "UZS",
            status: "pending",
          },
        });

        orderId = purchase.id;
        description = `${pricing.name} x${quantity}`;
      }
    }

    // Generate payment URL based on provider
    let paymentUrl: string;

    if (dto.provider === PaymentProvider.PAYME) {
      if (!this.paymeProvider.isConfigured()) {
        throw new BadRequestException("Payme is not configured");
      }
      paymentUrl = this.paymeProvider.generatePaymentLink(
        orderId,
        amount,
        dto.returnUrl,
      );
    } else if (dto.provider === PaymentProvider.CLICK) {
      if (!this.clickProvider.isConfigured()) {
        throw new BadRequestException("Click is not configured");
      }
      // Click uses UZS, not tiyn
      paymentUrl = this.clickProvider.generatePaymentLink(
        orderId,
        amount / 100,
        dto.returnUrl,
      );
    } else {
      throw new BadRequestException("Invalid payment provider");
    }

    this.logger.log(
      `Checkout created: ${orderId}, amount: ${amount}, provider: ${dto.provider}`,
    );

    return {
      orderId,
      paymentUrl,
      amount,
      currency: "UZS",
      provider: dto.provider,
    };
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(userId: string): Promise<PaymentHistoryItem[]> {
    // Get subscription payments
    const subscriptionPayments = await this.prisma.payment.findMany({
      where: {
        subscription: {
          userId,
        },
        status: { in: ["completed", "failed", "refunded"] },
      },
      include: {
        subscription: {
          include: {
            plan: {
              include: { course: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get purchases
    const purchases = await this.prisma.purchase.findMany({
      where: {
        userId,
        status: { in: ["completed", "failed", "refunded"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Combine and format
    const history: PaymentHistoryItem[] = [
      ...subscriptionPayments.map((p) => ({
        id: p.id,
        type: "subscription" as const,
        description: p.subscription.plan.course
          ? `${p.subscription.plan.course.title} - Monthly`
          : `${p.subscription.plan.name} - Monthly`,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        provider: p.provider || undefined,
        createdAt: p.createdAt,
      })),
      ...purchases.map((p) => ({
        id: p.id,
        type: "purchase" as const,
        description: PRICING[p.type]?.name || p.type,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        provider: p.provider || undefined,
        createdAt: p.createdAt,
      })),
    ];

    // Sort by date descending
    return history.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  /**
   * Check payment status
   */
  async getPaymentStatus(orderId: string): Promise<{
    status: string;
    orderType: "subscription" | "purchase" | null;
    amount?: number;
  }> {
    // Check if it's a subscription payment
    const payment = await this.prisma.payment.findUnique({
      where: { id: orderId },
    });

    if (payment) {
      return {
        status: payment.status,
        orderType: "subscription",
        amount: payment.amount,
      };
    }

    // Check if it's a purchase
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: orderId },
    });

    if (purchase) {
      return {
        status: purchase.status,
        orderType: "purchase",
        amount: purchase.amount,
      };
    }

    throw new NotFoundException("Order not found");
  }

  /**
   * Handle Payme webhook
   */
  async handlePaymeWebhook(
    method: string,
    params: Record<string, unknown>,
    authHeader: string,
  ): Promise<{ result?: unknown; error?: unknown; id?: number }> {
    // Verify auth
    if (!this.paymeProvider.verifyAuth(authHeader)) {
      return {
        error: {
          code: -32504,
          message: "Unauthorized",
        },
      };
    }

    return this.paymeProvider.handleWebhook(method, params);
  }

  /**
   * Handle Click webhook
   */
  async handleClickWebhook(params: {
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
  }) {
    return this.clickProvider.handleWebhook(params);
  }

  /**
   * Get user's roadmap generations count
   */
  async getRoadmapCredits(userId: string): Promise<{
    used: number;
    available: number;
    canGenerate: boolean;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { roadmapGenerations: true },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // First generation is free, then need to purchase
    const freeGenerations = 1;
    const purchasedGenerations = user.roadmapGenerations;
    const totalAvailable = freeGenerations + purchasedGenerations;

    // Count used generations (roadmaps created)
    const usedGenerations = await this.prisma.userRoadmap.count({
      where: { userId },
    });

    return {
      used: usedGenerations,
      available: totalAvailable,
      canGenerate: usedGenerations < totalAvailable,
    };
  }

  /**
   * Helper: Calculate subscription end date (1 month from now)
   */
  private calculateEndDate(): Date {
    const endDate = new Date();
    const currentDay = endDate.getDate();
    endDate.setMonth(endDate.getMonth() + 1);

    // Handle month overflow (e.g., Jan 31 -> Feb 28)
    if (endDate.getDate() !== currentDay) {
      endDate.setDate(0);
    }

    return endDate;
  }

  /**
   * Helper: Format price for display
   */
  private formatPrice(priceInTiyn: number): string {
    const uzs = priceInTiyn / 100;
    return new Intl.NumberFormat("uz-UZ").format(uzs) + " UZS";
  }

  /**
   * Get pricing for a specific course (one-time purchase)
   * Price = monthly subscription price * COURSE_ACCESS_MULTIPLIER
   */
  async getCoursePricing(
    courseId: string,
    userId?: string,
  ): Promise<CoursePricingDto> {
    // Get course with its subscription plan
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        subscriptionPlans: {
          where: { type: "course", isActive: true },
          take: 1,
        },
      },
    });

    if (!course) {
      throw new NotFoundException("Course not found");
    }

    // Get subscription plan price for the course
    const plan = course.subscriptionPlans[0];
    if (!plan) {
      throw new BadRequestException(
        "Course does not have an active subscription plan",
      );
    }

    // Calculate one-time purchase price (3x monthly subscription)
    const price = plan.priceMonthly * COURSE_ACCESS_MULTIPLIER;

    // Check if user already has access
    let hasAccess = false;
    if (userId) {
      hasAccess = await this.userHasCourseAccess(userId, courseId);
    }

    return {
      courseId: course.id,
      courseSlug: course.slug,
      courseName: course.title,
      price,
      currency: "UZS",
      priceFormatted: this.formatPrice(price),
      hasAccess,
    };
  }

  /**
   * Get pricing for all courses (for catalog display)
   */
  async getAllCoursesPricing(userId?: string): Promise<CoursePricingDto[]> {
    const courses = await this.prisma.course.findMany({
      include: {
        subscriptionPlans: {
          where: { type: "course", isActive: true },
          take: 1,
        },
      },
      orderBy: { order: "asc" },
    });

    const pricingList: CoursePricingDto[] = [];

    for (const course of courses) {
      const plan = course.subscriptionPlans[0];
      if (!plan) continue; // Skip courses without subscription plans

      const price = plan.priceMonthly * COURSE_ACCESS_MULTIPLIER;

      let hasAccess = false;
      if (userId) {
        hasAccess = await this.userHasCourseAccess(userId, course.id);
      }

      pricingList.push({
        courseId: course.id,
        courseSlug: course.slug,
        courseName: course.title,
        price,
        currency: "UZS",
        priceFormatted: this.formatPrice(price),
        hasAccess,
      });
    }

    return pricingList;
  }

  /**
   * Get user's purchased courses (CourseAccess records)
   */
  async getUserCourseAccesses(userId: string): Promise<UserCourseAccessDto[]> {
    const accesses = await this.prisma.courseAccess.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      include: {
        course: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return accesses.map((access) => ({
      courseId: access.courseId,
      courseSlug: access.course.slug,
      courseName: access.course.title,
      purchasedAt: access.createdAt,
      expiresAt: access.expiresAt,
    }));
  }

  /**
   * Check if user has access to a course (via subscription OR one-time purchase)
   */
  async userHasCourseAccess(
    userId: string,
    courseId: string,
  ): Promise<boolean> {
    // Check one-time purchase (CourseAccess)
    const courseAccess = await this.prisma.courseAccess.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (courseAccess) {
      // Check if not expired (null = lifetime)
      if (!courseAccess.expiresAt || courseAccess.expiresAt >= new Date()) {
        return true;
      }
    }

    // Check subscription (handled by AccessControlService, but duplicated here for convenience)
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
        endDate: { gte: new Date() },
        OR: [
          { plan: { type: "global" } },
          { plan: { type: "course", courseId } },
        ],
      },
    });

    return !!subscription;
  }

  /**
   * Grant course access after successful purchase
   * Called by payment providers after completing course_access purchase
   */
  async grantCourseAccess(
    userId: string,
    courseId: string,
    purchaseId: string,
  ): Promise<void> {
    await this.prisma.courseAccess.upsert({
      where: {
        userId_courseId: { userId, courseId },
      },
      create: {
        userId,
        courseId,
        purchaseId,
        expiresAt: null, // Lifetime access
      },
      update: {
        purchaseId,
        expiresAt: null, // Extend to lifetime if re-purchased
      },
    });

    this.logger.log(
      `Granted course access: userId=${userId}, courseId=${courseId}`,
    );
  }
}
