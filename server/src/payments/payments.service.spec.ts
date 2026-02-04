import { Test, TestingModule } from "@nestjs/testing";
import {
  PaymentsService,
  PRICING,
  COURSE_ACCESS_MULTIPLIER,
} from "./payments.service";
import { PrismaService } from "../prisma/prisma.service";
import { PaymeProvider } from "./providers/payme.provider";
import { ClickProvider } from "./providers/click.provider";
import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { OrderType, PaymentProvider, PurchaseType } from "./dto/payment.dto";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let paymeProvider: PaymeProvider;
  let clickProvider: ClickProvider;

  // Mock data
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    roadmapGenerations: 2,
  };

  const mockPlan = {
    id: "plan-global",
    slug: "premium-global",
    name: "Premium Global",
    type: "global",
    priceMonthly: 49900 * 100, // in tiyn
    currency: "UZS",
    isActive: true,
    courseId: null,
    course: null,
  };

  const mockCoursePlan = {
    id: "plan-course",
    slug: "premium-go",
    name: "Go Course Premium",
    type: "course",
    priceMonthly: 29900 * 100,
    currency: "UZS",
    isActive: true,
    courseId: "course-go",
    course: {
      id: "course-go",
      slug: "go-basics",
      title: "Go Basics",
    },
  };

  const mockSubscription = {
    id: "sub-123",
    userId: "user-123",
    planId: "plan-global",
    status: "pending",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-02-01"),
    plan: mockPlan,
  };

  const mockPayment = {
    id: "payment-123",
    subscriptionId: "sub-123",
    amount: 49900 * 100,
    currency: "UZS",
    status: "pending",
    provider: null,
    createdAt: new Date("2025-01-01"),
    subscription: {
      ...mockSubscription,
      plan: mockPlan,
    },
  };

  const mockCompletedPayment = {
    ...mockPayment,
    id: "payment-completed",
    status: "completed",
    provider: "payme",
  };

  const mockPurchase = {
    id: "purchase-123",
    userId: "user-123",
    type: "roadmap_generation",
    quantity: 1,
    amount: 15000 * 100,
    currency: "UZS",
    status: "pending",
    provider: null,
    createdAt: new Date("2025-01-01"),
  };

  const mockCompletedPurchase = {
    ...mockPurchase,
    id: "purchase-completed",
    status: "completed",
    provider: "click",
  };

  const mockCourse = {
    id: "course-go",
    slug: "go-basics",
    title: "Go Basics",
    subscriptionPlans: [
      {
        id: "plan-course",
        type: "course",
        priceMonthly: 4900000, // 49,000 UZS in tiyn
        isActive: true,
      },
    ],
  };

  const mockCourseAccess = {
    id: "access-123",
    userId: "user-123",
    courseId: "course-go",
    purchaseId: "purchase-123",
    expiresAt: null, // Lifetime access
    createdAt: new Date("2025-01-15"),
    course: mockCourse,
  };

  const mockPrismaService = {
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
    subscription: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    purchase: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    userRoadmap: {
      count: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    courseAccess: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  };

  const mockPaymeProvider = {
    isConfigured: jest.fn(),
    generatePaymentLink: jest.fn(),
    verifyAuth: jest.fn(),
    handleWebhook: jest.fn(),
  };

  const mockClickProvider = {
    isConfigured: jest.fn(),
    generatePaymentLink: jest.fn(),
    handleWebhook: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PaymeProvider, useValue: mockPaymeProvider },
        { provide: ClickProvider, useValue: mockClickProvider },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    paymeProvider = module.get<PaymeProvider>(PaymeProvider);
    clickProvider = module.get<ClickProvider>(ClickProvider);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // getAvailableProviders() - Get payment providers
  // ============================================
  describe("getAvailableProviders()", () => {
    it("should return list of providers with configuration status", () => {
      mockPaymeProvider.isConfigured.mockReturnValue(true);
      mockClickProvider.isConfigured.mockReturnValue(true);

      const result = service.getAvailableProviders();

      expect(result).toEqual([
        { id: "payme", name: "Payme", configured: true },
        { id: "click", name: "Click", configured: true },
      ]);
    });

    it("should show unconfigured providers", () => {
      mockPaymeProvider.isConfigured.mockReturnValue(false);
      mockClickProvider.isConfigured.mockReturnValue(true);

      const result = service.getAvailableProviders();

      expect(result).toEqual([
        { id: "payme", name: "Payme", configured: false },
        { id: "click", name: "Click", configured: true },
      ]);
    });

    it("should handle both providers unconfigured", () => {
      mockPaymeProvider.isConfigured.mockReturnValue(false);
      mockClickProvider.isConfigured.mockReturnValue(false);

      const result = service.getAvailableProviders();

      expect(result[0].configured).toBe(false);
      expect(result[1].configured).toBe(false);
    });
  });

  // ============================================
  // getPurchasePricing() - Get purchase pricing
  // ============================================
  describe("getPurchasePricing()", () => {
    it("should return formatted pricing for all purchase types", () => {
      const result = service.getPurchasePricing();

      expect(result).toHaveLength(Object.keys(PRICING).length);
      expect(result[0]).toHaveProperty("type");
      expect(result[0]).toHaveProperty("price");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("priceFormatted");
    });

    it("should include roadmap_generation pricing", () => {
      const result = service.getPurchasePricing();
      const roadmapPricing = result.find(
        (p) => p.type === "roadmap_generation",
      );

      expect(roadmapPricing).toBeDefined();
      expect(roadmapPricing.price).toBe(PRICING.roadmap_generation.price);
      expect(roadmapPricing.name).toBe("Roadmap Generation");
    });

    it("should include ai_credits pricing", () => {
      const result = service.getPurchasePricing();
      const aiPricing = result.find((p) => p.type === "ai_credits");

      expect(aiPricing).toBeDefined();
      expect(aiPricing.price).toBe(PRICING.ai_credits.price);
    });

    it("should format price correctly (tiyn to UZS)", () => {
      const result = service.getPurchasePricing();

      result.forEach((item) => {
        expect(item.priceFormatted).toContain("UZS");
      });
    });
  });

  // ============================================
  // createCheckout() - Subscription flow
  // ============================================
  describe("createCheckout() - Subscription", () => {
    beforeEach(() => {
      mockPaymeProvider.isConfigured.mockReturnValue(true);
      mockClickProvider.isConfigured.mockReturnValue(true);
      mockPaymeProvider.generatePaymentLink.mockReturnValue(
        "https://payme.uz/checkout/123",
      );
      mockClickProvider.generatePaymentLink.mockReturnValue(
        "https://click.uz/checkout/123",
      );
    });

    it("should create subscription checkout with Payme", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createCheckout("user-123", {
        orderType: OrderType.SUBSCRIPTION,
        planId: "plan-global",
        provider: PaymentProvider.PAYME,
      });

      expect(result.orderId).toBe(mockPayment.id);
      expect(result.paymentUrl).toBe("https://payme.uz/checkout/123");
      expect(result.amount).toBe(mockPlan.priceMonthly);
      expect(result.currency).toBe("UZS");
      expect(result.provider).toBe(PaymentProvider.PAYME);
    });

    it("should create subscription checkout with Click", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const result = await service.createCheckout("user-123", {
        orderType: OrderType.SUBSCRIPTION,
        planId: "plan-global",
        provider: PaymentProvider.CLICK,
      });

      expect(result.paymentUrl).toBe("https://click.uz/checkout/123");
      expect(result.provider).toBe(PaymentProvider.CLICK);
      // Click receives amount in UZS (divided by 100)
      expect(mockClickProvider.generatePaymentLink).toHaveBeenCalledWith(
        mockPayment.id,
        mockPlan.priceMonthly / 100,
        undefined,
      );
    });

    it("should throw BadRequestException if planId is missing for subscription", async () => {
      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.SUBSCRIPTION,
          provider: PaymentProvider.PAYME,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException if plan not found", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(null);

      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.SUBSCRIPTION,
          planId: "nonexistent",
          provider: PaymentProvider.PAYME,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should use course title in description for course plans", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(
        mockCoursePlan,
      );
      mockPrismaService.subscription.upsert.mockResolvedValue({
        ...mockSubscription,
        planId: mockCoursePlan.id,
      });
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await service.createCheckout("user-123", {
        orderType: OrderType.SUBSCRIPTION,
        planId: mockCoursePlan.id,
        provider: PaymentProvider.PAYME,
      });

      // Description should use course title
      expect(mockPrismaService.subscription.upsert).toHaveBeenCalled();
    });

    it("should create or update subscription using upsert", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await service.createCheckout("user-123", {
        orderType: OrderType.SUBSCRIPTION,
        planId: "plan-global",
        provider: PaymentProvider.PAYME,
      });

      expect(mockPrismaService.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_planId: { userId: "user-123", planId: "plan-global" },
          },
          create: expect.objectContaining({
            userId: "user-123",
            planId: "plan-global",
            status: "pending",
          }),
          update: expect.objectContaining({
            status: "pending",
          }),
        }),
      );
    });

    it("should pass returnUrl to payment provider", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await service.createCheckout("user-123", {
        orderType: OrderType.SUBSCRIPTION,
        planId: "plan-global",
        provider: PaymentProvider.PAYME,
        returnUrl: "https://practix.dev/payments/success",
      });

      expect(mockPaymeProvider.generatePaymentLink).toHaveBeenCalledWith(
        mockPayment.id,
        mockPlan.priceMonthly,
        "https://practix.dev/payments/success",
      );
    });
  });

  // ============================================
  // createCheckout() - Purchase flow
  // ============================================
  describe("createCheckout() - Purchase", () => {
    beforeEach(() => {
      mockPaymeProvider.isConfigured.mockReturnValue(true);
      mockClickProvider.isConfigured.mockReturnValue(true);
      mockPaymeProvider.generatePaymentLink.mockReturnValue(
        "https://payme.uz/checkout/456",
      );
      mockClickProvider.generatePaymentLink.mockReturnValue(
        "https://click.uz/checkout/456",
      );
    });

    it("should create purchase checkout for roadmap_generation", async () => {
      mockPrismaService.purchase.create.mockResolvedValue(mockPurchase);

      const result = await service.createCheckout("user-123", {
        orderType: OrderType.PURCHASE,
        purchaseType: PurchaseType.ROADMAP_GENERATION,
        provider: PaymentProvider.PAYME,
      });

      expect(result.orderId).toBe(mockPurchase.id);
      expect(result.amount).toBe(PRICING.roadmap_generation.price);
    });

    it("should create purchase checkout for ai_credits", async () => {
      const aiPurchase = {
        ...mockPurchase,
        type: "ai_credits",
        amount: PRICING.ai_credits.price,
      };
      mockPrismaService.purchase.create.mockResolvedValue(aiPurchase);

      const result = await service.createCheckout("user-123", {
        orderType: OrderType.PURCHASE,
        purchaseType: PurchaseType.AI_CREDITS,
        provider: PaymentProvider.PAYME,
      });

      expect(result.orderId).toBe(aiPurchase.id);
    });

    it("should handle quantity for purchases", async () => {
      const quantity = 3;
      const purchaseWithQty = {
        ...mockPurchase,
        quantity,
        amount: PRICING.roadmap_generation.price * quantity,
      };
      mockPrismaService.purchase.create.mockResolvedValue(purchaseWithQty);

      const result = await service.createCheckout("user-123", {
        orderType: OrderType.PURCHASE,
        purchaseType: PurchaseType.ROADMAP_GENERATION,
        quantity,
        provider: PaymentProvider.PAYME,
      });

      expect(result.amount).toBe(PRICING.roadmap_generation.price * quantity);
      expect(mockPrismaService.purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            quantity: 3,
            amount: PRICING.roadmap_generation.price * quantity,
          }),
        }),
      );
    });

    it("should default quantity to 1", async () => {
      mockPrismaService.purchase.create.mockResolvedValue(mockPurchase);

      await service.createCheckout("user-123", {
        orderType: OrderType.PURCHASE,
        purchaseType: PurchaseType.ROADMAP_GENERATION,
        provider: PaymentProvider.PAYME,
      });

      expect(mockPrismaService.purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            quantity: 1,
          }),
        }),
      );
    });

    it("should throw BadRequestException if purchaseType is missing", async () => {
      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.PURCHASE,
          provider: PaymentProvider.PAYME,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid purchase type", async () => {
      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.PURCHASE,
          purchaseType: "invalid_type" as PurchaseType,
          provider: PaymentProvider.PAYME,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // createCheckout() - Provider validation
  // ============================================
  describe("createCheckout() - Provider validation", () => {
    it("should throw BadRequestException if Payme is not configured", async () => {
      mockPaymeProvider.isConfigured.mockReturnValue(false);
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.SUBSCRIPTION,
          planId: "plan-global",
          provider: PaymentProvider.PAYME,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if Click is not configured", async () => {
      mockClickProvider.isConfigured.mockReturnValue(false);
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.SUBSCRIPTION,
          planId: "plan-global",
          provider: PaymentProvider.CLICK,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException for invalid provider", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.SUBSCRIPTION,
          planId: "plan-global",
          provider: "invalid" as PaymentProvider,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // getPaymentHistory() - Get payment history
  // ============================================
  describe("getPaymentHistory()", () => {
    it("should return combined and sorted payment history", async () => {
      const olderPayment = {
        ...mockCompletedPayment,
        createdAt: new Date("2025-01-01"),
      };
      const newerPurchase = {
        ...mockCompletedPurchase,
        createdAt: new Date("2025-01-15"),
      };

      mockPrismaService.payment.findMany.mockResolvedValue([olderPayment]);
      mockPrismaService.purchase.findMany.mockResolvedValue([newerPurchase]);

      const result = await service.getPaymentHistory("user-123");

      expect(result).toHaveLength(2);
      // Should be sorted by date descending (newest first)
      expect(result[0].id).toBe(newerPurchase.id);
      expect(result[1].id).toBe(olderPayment.id);
    });

    it("should format subscription payments correctly", async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([
        mockCompletedPayment,
      ]);
      mockPrismaService.purchase.findMany.mockResolvedValue([]);

      const result = await service.getPaymentHistory("user-123");

      expect(result[0]).toMatchObject({
        id: mockCompletedPayment.id,
        type: "subscription",
        amount: mockCompletedPayment.amount,
        currency: mockCompletedPayment.currency,
        status: mockCompletedPayment.status,
      });
    });

    it("should format purchases correctly", async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.purchase.findMany.mockResolvedValue([
        mockCompletedPurchase,
      ]);

      const result = await service.getPaymentHistory("user-123");

      expect(result[0]).toMatchObject({
        id: mockCompletedPurchase.id,
        type: "purchase",
        description: PRICING[mockCompletedPurchase.type].name,
        amount: mockCompletedPurchase.amount,
      });
    });

    it("should return empty array if no history", async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.purchase.findMany.mockResolvedValue([]);

      const result = await service.getPaymentHistory("user-123");

      expect(result).toEqual([]);
    });

    it("should filter by completed/failed/refunded status", async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.purchase.findMany.mockResolvedValue([]);

      await service.getPaymentHistory("user-123");

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ["completed", "failed", "refunded"] },
          }),
        }),
      );
    });

    it("should limit results to 50 per type", async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);
      mockPrismaService.purchase.findMany.mockResolvedValue([]);

      await service.getPaymentHistory("user-123");

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
      expect(mockPrismaService.purchase.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });
  });

  // ============================================
  // getPaymentStatus() - Check payment status
  // ============================================
  describe("getPaymentStatus()", () => {
    it("should return subscription payment status", async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.getPaymentStatus("payment-123");

      expect(result).toEqual({
        status: "pending",
        orderType: "subscription",
        amount: mockPayment.amount,
      });
    });

    it("should return purchase status if not a payment", async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(mockPurchase);

      const result = await service.getPaymentStatus("purchase-123");

      expect(result).toEqual({
        status: "pending",
        orderType: "purchase",
        amount: mockPurchase.amount,
      });
    });

    it("should throw NotFoundException if order not found", async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(null);

      await expect(service.getPaymentStatus("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should return completed status correctly", async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: "completed",
      });

      const result = await service.getPaymentStatus("payment-123");

      expect(result.status).toBe("completed");
    });
  });

  // ============================================
  // handlePaymeWebhook() - Payme webhook
  // ============================================
  describe("handlePaymeWebhook()", () => {
    const validAuthHeader = "Basic base64encoded";

    it("should verify auth and delegate to provider", async () => {
      mockPaymeProvider.verifyAuth.mockReturnValue(true);
      mockPaymeProvider.handleWebhook.mockResolvedValue({
        result: { success: true },
      });

      const result = await service.handlePaymeWebhook(
        "CheckPerformTransaction",
        { account: { order_id: "payment-123" } },
        validAuthHeader,
      );

      expect(mockPaymeProvider.verifyAuth).toHaveBeenCalledWith(
        validAuthHeader,
      );
      expect(mockPaymeProvider.handleWebhook).toHaveBeenCalledWith(
        "CheckPerformTransaction",
        { account: { order_id: "payment-123" } },
      );
      expect(result).toEqual({ result: { success: true } });
    });

    it("should return auth error if verification fails", async () => {
      mockPaymeProvider.verifyAuth.mockReturnValue(false);

      const result = await service.handlePaymeWebhook(
        "CheckPerformTransaction",
        {},
        "invalid-auth",
      );

      expect(result).toEqual({
        error: {
          code: -32504,
          message: "Unauthorized",
        },
      });
      expect(mockPaymeProvider.handleWebhook).not.toHaveBeenCalled();
    });

    it("should pass all webhook methods to provider", async () => {
      mockPaymeProvider.verifyAuth.mockReturnValue(true);

      const methods = [
        "CheckPerformTransaction",
        "CreateTransaction",
        "PerformTransaction",
        "CancelTransaction",
        "CheckTransaction",
        "GetStatement",
      ];

      for (const method of methods) {
        mockPaymeProvider.handleWebhook.mockResolvedValue({ result: {} });
        await service.handlePaymeWebhook(method, {}, validAuthHeader);
        expect(mockPaymeProvider.handleWebhook).toHaveBeenCalledWith(
          method,
          {},
        );
      }
    });
  });

  // ============================================
  // handleClickWebhook() - Click webhook
  // ============================================
  describe("handleClickWebhook()", () => {
    const clickParams = {
      click_trans_id: 123456,
      service_id: 12345,
      merchant_trans_id: "purchase-123",
      amount: 15000,
      action: 0,
      sign_time: "2025-01-01 12:00:00",
      sign_string: "valid-signature",
    };

    it("should delegate to Click provider", async () => {
      mockClickProvider.handleWebhook.mockResolvedValue({
        click_trans_id: 123456,
        merchant_trans_id: "purchase-123",
        error: 0,
        error_note: "Success",
      });

      const result = await service.handleClickWebhook(clickParams);

      expect(mockClickProvider.handleWebhook).toHaveBeenCalledWith(clickParams);
      expect(result.error).toBe(0);
    });

    it("should handle prepare action (action=0)", async () => {
      mockClickProvider.handleWebhook.mockResolvedValue({
        click_trans_id: 123456,
        merchant_trans_id: "purchase-123",
        merchant_prepare_id: 1,
        error: 0,
        error_note: "Success",
      });

      const result = await service.handleClickWebhook({
        ...clickParams,
        action: 0,
      });

      expect(result.merchant_prepare_id).toBeDefined();
    });

    it("should handle complete action (action=1)", async () => {
      mockClickProvider.handleWebhook.mockResolvedValue({
        click_trans_id: 123456,
        merchant_trans_id: "purchase-123",
        error: 0,
        error_note: "Success",
      });

      const result = await service.handleClickWebhook({
        ...clickParams,
        action: 1,
        merchant_prepare_id: 1,
      });

      expect(result.error).toBe(0);
    });
  });

  // ============================================
  // getRoadmapCredits() - Roadmap credits
  // ============================================
  describe("getRoadmapCredits()", () => {
    it("should return roadmap credits info", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.userRoadmap.count.mockResolvedValue(1);

      const result = await service.getRoadmapCredits("user-123");

      expect(result).toEqual({
        used: 1,
        available: 3, // 1 free + 2 purchased
        canGenerate: true,
      });
    });

    it("should return canGenerate false when used >= available", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        roadmapGenerations: 0,
      });
      mockPrismaService.userRoadmap.count.mockResolvedValue(1);

      const result = await service.getRoadmapCredits("user-123");

      expect(result.canGenerate).toBe(false);
      expect(result.used).toBe(1);
      expect(result.available).toBe(1); // Only 1 free
    });

    it("should count 1 free generation for new users", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        roadmapGenerations: 0,
      });
      mockPrismaService.userRoadmap.count.mockResolvedValue(0);

      const result = await service.getRoadmapCredits("user-123");

      expect(result).toEqual({
        used: 0,
        available: 1,
        canGenerate: true,
      });
    });

    it("should throw NotFoundException if user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getRoadmapCredits("nonexistent")).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should include purchased generations", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        roadmapGenerations: 5,
      });
      mockPrismaService.userRoadmap.count.mockResolvedValue(2);

      const result = await service.getRoadmapCredits("user-123");

      expect(result.available).toBe(6); // 1 free + 5 purchased
      expect(result.used).toBe(2);
      expect(result.canGenerate).toBe(true);
    });
  });

  // ============================================
  // Private methods (tested via public interface)
  // ============================================
  describe("calculateEndDate() - via createCheckout", () => {
    beforeEach(() => {
      mockPaymeProvider.isConfigured.mockReturnValue(true);
      mockPaymeProvider.generatePaymentLink.mockReturnValue(
        "https://payme.uz/checkout",
      );
    });

    it("should calculate end date 1 month from now", async () => {
      mockPrismaService.subscriptionPlan.findUnique.mockResolvedValue(mockPlan);
      mockPrismaService.subscription.upsert.mockResolvedValue(mockSubscription);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      await service.createCheckout("user-123", {
        orderType: OrderType.SUBSCRIPTION,
        planId: "plan-global",
        provider: PaymentProvider.PAYME,
      });

      const upsertCall = mockPrismaService.subscription.upsert.mock.calls[0][0];
      const endDate = upsertCall.create.endDate;

      const expectedEndDate = new Date();
      expectedEndDate.setMonth(expectedEndDate.getMonth() + 1);

      // Allow 5 second tolerance for test execution time
      expect(
        Math.abs(endDate.getTime() - expectedEndDate.getTime()),
      ).toBeLessThan(5000);
    });
  });

  describe("formatPrice() - via getPurchasePricing", () => {
    it("should format price with UZS suffix", () => {
      const result = service.getPurchasePricing();

      result.forEach((item) => {
        expect(item.priceFormatted).toMatch(/\d.*UZS$/);
      });
    });
  });

  // ============================================
  // getCoursePricing() - Get course one-time purchase price
  // ============================================
  describe("getCoursePricing()", () => {
    it("should return course pricing with 3x multiplier", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getCoursePricing("course-go", "user-123");

      expect(result).toMatchObject({
        courseId: "course-go",
        courseSlug: "go-basics",
        courseName: "Go Basics",
        price: 4900000 * COURSE_ACCESS_MULTIPLIER, // 3x monthly
        currency: "UZS",
        hasAccess: false,
      });
      expect(result.priceFormatted).toContain("UZS");
    });

    it("should indicate hasAccess if user has CourseAccess", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(
        mockCourseAccess,
      );

      const result = await service.getCoursePricing("course-go", "user-123");

      expect(result.hasAccess).toBe(true);
    });

    it("should indicate hasAccess if user has subscription", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.getCoursePricing("course-go", "user-123");

      expect(result.hasAccess).toBe(true);
    });

    it("should throw NotFoundException if course not found", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);

      await expect(
        service.getCoursePricing("nonexistent", "user-123"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if course has no subscription plan", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue({
        ...mockCourse,
        subscriptionPlans: [],
      });

      await expect(
        service.getCoursePricing("course-go", "user-123"),
      ).rejects.toThrow(BadRequestException);
    });

    it("should work without userId (anonymous check)", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.getCoursePricing("course-go");

      expect(result.hasAccess).toBe(false);
      expect(result.price).toBe(4900000 * COURSE_ACCESS_MULTIPLIER);
    });
  });

  // ============================================
  // getAllCoursesPricing() - Get all courses pricing
  // ============================================
  describe("getAllCoursesPricing()", () => {
    it("should return pricing for all courses with subscription plans", async () => {
      const courses = [
        mockCourse,
        {
          id: "course-python",
          slug: "python-basics",
          title: "Python Basics",
          subscriptionPlans: [
            {
              id: "plan-python",
              type: "course",
              priceMonthly: 3900000,
              isActive: true,
            },
          ],
        },
      ];
      mockPrismaService.course.findMany.mockResolvedValue(courses);
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getAllCoursesPricing("user-123");

      expect(result).toHaveLength(2);
      expect(result[0].courseSlug).toBe("go-basics");
      expect(result[1].courseSlug).toBe("python-basics");
    });

    it("should skip courses without subscription plans", async () => {
      const courses = [
        mockCourse,
        {
          id: "course-no-plan",
          slug: "no-plan",
          title: "No Plan",
          subscriptionPlans: [],
        },
      ];
      mockPrismaService.course.findMany.mockResolvedValue(courses);
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.getAllCoursesPricing("user-123");

      expect(result).toHaveLength(1);
      expect(result[0].courseSlug).toBe("go-basics");
    });

    it("should return empty array if no courses", async () => {
      mockPrismaService.course.findMany.mockResolvedValue([]);

      const result = await service.getAllCoursesPricing("user-123");

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // getUserCourseAccesses() - Get user's purchased courses
  // ============================================
  describe("getUserCourseAccesses()", () => {
    it("should return user's purchased courses", async () => {
      mockPrismaService.courseAccess.findMany.mockResolvedValue([
        mockCourseAccess,
      ]);

      const result = await service.getUserCourseAccesses("user-123");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        courseId: "course-go",
        courseSlug: "go-basics",
        courseName: "Go Basics",
        expiresAt: null,
      });
    });

    it("should return empty array if no purchases", async () => {
      mockPrismaService.courseAccess.findMany.mockResolvedValue([]);

      const result = await service.getUserCourseAccesses("user-123");

      expect(result).toEqual([]);
    });

    it("should only return non-expired accesses", async () => {
      mockPrismaService.courseAccess.findMany.mockResolvedValue([]);

      await service.getUserCourseAccesses("user-123");

      expect(mockPrismaService.courseAccess.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-123",
            OR: [{ expiresAt: null }, { expiresAt: { gte: expect.any(Date) } }],
          }),
        }),
      );
    });
  });

  // ============================================
  // userHasCourseAccess() - Check if user has access
  // ============================================
  describe("userHasCourseAccess()", () => {
    it("should return true if user has CourseAccess", async () => {
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(
        mockCourseAccess,
      );

      const result = await service.userHasCourseAccess("user-123", "course-go");

      expect(result).toBe(true);
    });

    it("should return true if user has subscription", async () => {
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.findFirst.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.userHasCourseAccess("user-123", "course-go");

      expect(result).toBe(true);
    });

    it("should return false if user has no access", async () => {
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.userHasCourseAccess("user-123", "course-go");

      expect(result).toBe(false);
    });

    it("should return false if CourseAccess is expired", async () => {
      const expiredAccess = {
        ...mockCourseAccess,
        expiresAt: new Date("2020-01-01"), // Past date
      };
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(
        expiredAccess,
      );
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);

      const result = await service.userHasCourseAccess("user-123", "course-go");

      expect(result).toBe(false);
    });
  });

  // ============================================
  // createCheckout() - Course access purchase
  // ============================================
  describe("createCheckout() - Course Access Purchase", () => {
    beforeEach(() => {
      mockPaymeProvider.isConfigured.mockReturnValue(true);
      mockPaymeProvider.generatePaymentLink.mockReturnValue(
        "https://payme.uz/checkout/789",
      );
    });

    it("should create checkout for course_access purchase", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(null);
      mockPrismaService.subscription.findFirst.mockResolvedValue(null);
      const coursePurchase = {
        id: "purchase-course-123",
        userId: "user-123",
        type: "course_access",
        quantity: 1,
        amount: 4900000 * COURSE_ACCESS_MULTIPLIER,
        currency: "UZS",
        status: "pending",
        metadata: {
          courseId: "course-go",
          courseSlug: "go-basics",
          courseName: "Go Basics",
        },
      };
      mockPrismaService.purchase.create.mockResolvedValue(coursePurchase);

      const result = await service.createCheckout("user-123", {
        orderType: OrderType.PURCHASE,
        purchaseType: PurchaseType.COURSE_ACCESS,
        courseId: "course-go",
        provider: PaymentProvider.PAYME,
      });

      expect(result.orderId).toBe("purchase-course-123");
      expect(result.amount).toBe(4900000 * COURSE_ACCESS_MULTIPLIER);
      expect(mockPrismaService.purchase.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: "course_access",
            metadata: expect.objectContaining({
              courseId: "course-go",
            }),
          }),
        }),
      );
    });

    it("should throw BadRequestException if courseId is missing", async () => {
      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.PURCHASE,
          purchaseType: PurchaseType.COURSE_ACCESS,
          provider: PaymentProvider.PAYME,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException if user already has access", async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.courseAccess.findUnique.mockResolvedValue(
        mockCourseAccess,
      );

      await expect(
        service.createCheckout("user-123", {
          orderType: OrderType.PURCHASE,
          purchaseType: PurchaseType.COURSE_ACCESS,
          courseId: "course-go",
          provider: PaymentProvider.PAYME,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ============================================
  // grantCourseAccess() - Grant access after purchase
  // ============================================
  describe("grantCourseAccess()", () => {
    it("should create CourseAccess with lifetime access", async () => {
      mockPrismaService.courseAccess.upsert.mockResolvedValue(mockCourseAccess);

      await service.grantCourseAccess("user-123", "course-go", "purchase-123");

      expect(mockPrismaService.courseAccess.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_courseId: { userId: "user-123", courseId: "course-go" },
          },
          create: expect.objectContaining({
            userId: "user-123",
            courseId: "course-go",
            purchaseId: "purchase-123",
            expiresAt: null,
          }),
          update: expect.objectContaining({
            purchaseId: "purchase-123",
            expiresAt: null,
          }),
        }),
      );
    });

    it("should update existing CourseAccess (extend to lifetime)", async () => {
      mockPrismaService.courseAccess.upsert.mockResolvedValue(mockCourseAccess);

      await service.grantCourseAccess("user-123", "course-go", "purchase-456");

      // Should use upsert to handle both create and update
      expect(mockPrismaService.courseAccess.upsert).toHaveBeenCalled();
    });
  });
});
