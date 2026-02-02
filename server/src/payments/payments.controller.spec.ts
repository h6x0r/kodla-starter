import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import {
  OrderType,
  PaymentProvider,
  PurchaseType,
} from './dto/payment.dto';

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let paymentsService: PaymentsService;

  const mockPaymentsService = {
    getAvailableProviders: jest.fn(),
    getPurchasePricing: jest.fn(),
    getRoadmapCredits: jest.fn(),
    getPaymentHistory: jest.fn(),
    getPaymentStatus: jest.fn(),
    createCheckout: jest.fn(),
    handlePaymeWebhook: jest.fn(),
    handleClickWebhook: jest.fn(),
  };

  const mockProviders = [
    { id: 'payme', name: 'Payme', configured: true },
    { id: 'click', name: 'Click', configured: true },
  ];

  const mockPricing = [
    {
      type: 'roadmap_generation',
      price: 1500000,
      name: 'Roadmap Generation',
      priceFormatted: '15,000 UZS',
    },
    {
      type: 'ai_credits',
      price: 1000000,
      name: 'AI Credits (50)',
      priceFormatted: '10,000 UZS',
    },
  ];

  const mockRoadmapCredits = {
    used: 1,
    available: 3,
    canGenerate: true,
  };

  const mockPaymentHistory = [
    {
      id: 'payment-123',
      type: 'subscription',
      description: 'Premium Global - Monthly',
      amount: 4990000,
      currency: 'UZS',
      status: 'completed',
      provider: 'payme',
      createdAt: new Date('2025-01-01'),
    },
    {
      id: 'purchase-123',
      type: 'purchase',
      description: 'Roadmap Generation',
      amount: 1500000,
      currency: 'UZS',
      status: 'completed',
      provider: 'click',
      createdAt: new Date('2025-01-02'),
    },
  ];

  const mockCheckoutResponse = {
    orderId: 'payment-456',
    paymentUrl: 'https://payme.uz/checkout/abc123',
    amount: 4990000,
    currency: 'UZS',
    provider: PaymentProvider.PAYME,
  };

  const mockPaymentStatus = {
    status: 'completed',
    orderType: 'subscription',
    amount: 4990000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentsController>(PaymentsController);
    paymentsService = module.get<PaymentsService>(PaymentsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ============================================
  // GET /providers - Get payment providers
  // ============================================
  describe('GET /providers', () => {
    it('should return available payment providers', () => {
      mockPaymentsService.getAvailableProviders.mockReturnValue(mockProviders);

      const result = controller.getProviders();

      expect(result).toEqual(mockProviders);
      expect(mockPaymentsService.getAvailableProviders).toHaveBeenCalled();
    });

    it('should show unconfigured providers', () => {
      const unconfiguredProviders = [
        { id: 'payme', name: 'Payme', configured: false },
        { id: 'click', name: 'Click', configured: true },
      ];
      mockPaymentsService.getAvailableProviders.mockReturnValue(unconfiguredProviders);

      const result = controller.getProviders();

      expect(result[0].configured).toBe(false);
      expect(result[1].configured).toBe(true);
    });
  });

  // ============================================
  // GET /pricing - Get purchase pricing
  // ============================================
  describe('GET /pricing', () => {
    it('should return purchase pricing', () => {
      mockPaymentsService.getPurchasePricing.mockReturnValue(mockPricing);

      const result = controller.getPricing();

      expect(result).toEqual(mockPricing);
      expect(mockPaymentsService.getPurchasePricing).toHaveBeenCalled();
    });

    it('should include formatted prices', () => {
      mockPaymentsService.getPurchasePricing.mockReturnValue(mockPricing);

      const result = controller.getPricing();

      result.forEach(item => {
        expect(item.priceFormatted).toBeDefined();
        expect(item.priceFormatted).toContain('UZS');
      });
    });
  });

  // ============================================
  // GET /roadmap-credits - Get roadmap credits (auth required)
  // ============================================
  describe('GET /roadmap-credits', () => {
    it('should return roadmap credits for authenticated user', async () => {
      mockPaymentsService.getRoadmapCredits.mockResolvedValue(mockRoadmapCredits);

      const result = await controller.getRoadmapCredits({
        user: { userId: 'user-123' },
      });

      expect(result).toEqual(mockRoadmapCredits);
      expect(mockPaymentsService.getRoadmapCredits).toHaveBeenCalledWith('user-123');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPaymentsService.getRoadmapCredits.mockRejectedValue(
        new NotFoundException('User not found')
      );

      await expect(
        controller.getRoadmapCredits({ user: { userId: 'nonexistent' } })
      ).rejects.toThrow(NotFoundException);
    });

    it('should show canGenerate false when no credits available', async () => {
      mockPaymentsService.getRoadmapCredits.mockResolvedValue({
        used: 1,
        available: 1,
        canGenerate: false,
      });

      const result = await controller.getRoadmapCredits({
        user: { userId: 'user-123' },
      });

      expect(result.canGenerate).toBe(false);
    });
  });

  // ============================================
  // GET /history - Get payment history (auth required)
  // ============================================
  describe('GET /history', () => {
    it('should return payment history for authenticated user', async () => {
      mockPaymentsService.getPaymentHistory.mockResolvedValue(mockPaymentHistory);

      const result = await controller.getHistory({
        user: { userId: 'user-123' },
      });

      expect(result).toEqual(mockPaymentHistory);
      expect(mockPaymentsService.getPaymentHistory).toHaveBeenCalledWith('user-123');
    });

    it('should return empty array for user with no payments', async () => {
      mockPaymentsService.getPaymentHistory.mockResolvedValue([]);

      const result = await controller.getHistory({
        user: { userId: 'new-user' },
      });

      expect(result).toEqual([]);
    });

    it('should include both subscription payments and purchases', async () => {
      mockPaymentsService.getPaymentHistory.mockResolvedValue(mockPaymentHistory);

      const result = await controller.getHistory({
        user: { userId: 'user-123' },
      });

      const subscriptions = result.filter(p => p.type === 'subscription');
      const purchases = result.filter(p => p.type === 'purchase');

      expect(subscriptions.length).toBeGreaterThan(0);
      expect(purchases.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // GET /status/:orderId - Get payment status (auth required)
  // ============================================
  describe('GET /status/:orderId', () => {
    it('should return payment status', async () => {
      mockPaymentsService.getPaymentStatus.mockResolvedValue(mockPaymentStatus);

      const result = await controller.getStatus('payment-123');

      expect(result).toEqual(mockPaymentStatus);
      expect(mockPaymentsService.getPaymentStatus).toHaveBeenCalledWith('payment-123');
    });

    it('should throw NotFoundException for non-existent order', async () => {
      mockPaymentsService.getPaymentStatus.mockRejectedValue(
        new NotFoundException('Order not found')
      );

      await expect(controller.getStatus('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should return pending status for new orders', async () => {
      mockPaymentsService.getPaymentStatus.mockResolvedValue({
        status: 'pending',
        orderType: 'subscription',
        amount: 4990000,
      });

      const result = await controller.getStatus('new-order');

      expect(result.status).toBe('pending');
    });
  });

  // ============================================
  // POST /checkout - Create checkout (auth required)
  // ============================================
  describe('POST /checkout', () => {
    it('should create checkout for subscription', async () => {
      mockPaymentsService.createCheckout.mockResolvedValue(mockCheckoutResponse);

      const result = await controller.createCheckout(
        { user: { userId: 'user-123' } },
        {
          orderType: OrderType.SUBSCRIPTION,
          planId: 'plan-global',
          provider: PaymentProvider.PAYME,
        }
      );

      expect(result).toEqual(mockCheckoutResponse);
      expect(mockPaymentsService.createCheckout).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          orderType: OrderType.SUBSCRIPTION,
          planId: 'plan-global',
        })
      );
    });

    it('should create checkout for purchase', async () => {
      const purchaseCheckout = {
        ...mockCheckoutResponse,
        orderId: 'purchase-789',
        amount: 1500000,
      };
      mockPaymentsService.createCheckout.mockResolvedValue(purchaseCheckout);

      const result = await controller.createCheckout(
        { user: { userId: 'user-123' } },
        {
          orderType: OrderType.PURCHASE,
          purchaseType: PurchaseType.ROADMAP_GENERATION,
          provider: PaymentProvider.CLICK,
        }
      );

      expect(result.orderId).toBe('purchase-789');
    });

    it('should handle checkout with returnUrl', async () => {
      mockPaymentsService.createCheckout.mockResolvedValue(mockCheckoutResponse);

      await controller.createCheckout(
        { user: { userId: 'user-123' } },
        {
          orderType: OrderType.SUBSCRIPTION,
          planId: 'plan-global',
          provider: PaymentProvider.PAYME,
          returnUrl: 'https://practix.dev/payments/success',
        }
      );

      expect(mockPaymentsService.createCheckout).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({
          returnUrl: 'https://practix.dev/payments/success',
        })
      );
    });

    it('should throw BadRequestException for missing planId', async () => {
      mockPaymentsService.createCheckout.mockRejectedValue(
        new BadRequestException('planId is required for subscription')
      );

      await expect(
        controller.createCheckout(
          { user: { userId: 'user-123' } },
          {
            orderType: OrderType.SUBSCRIPTION,
            provider: PaymentProvider.PAYME,
          }
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for unconfigured provider', async () => {
      mockPaymentsService.createCheckout.mockRejectedValue(
        new BadRequestException('Payme is not configured')
      );

      await expect(
        controller.createCheckout(
          { user: { userId: 'user-123' } },
          {
            orderType: OrderType.SUBSCRIPTION,
            planId: 'plan-global',
            provider: PaymentProvider.PAYME,
          }
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // POST /webhook/payme - Payme webhook (no auth)
  // ============================================
  describe('POST /webhook/payme', () => {
    it('should handle Payme webhook and return JSON-RPC response', async () => {
      mockPaymentsService.handlePaymeWebhook.mockResolvedValue({
        result: { allow: true },
      });

      const result = await controller.handlePaymeWebhook(
        {
          method: 'CheckPerformTransaction',
          params: { account: { order_id: 'payment-123' } },
          id: 1,
        },
        'Basic dXNlcjpwYXNz'
      );

      expect(result).toEqual({
        jsonrpc: '2.0',
        id: 1,
        result: { allow: true },
      });
    });

    it('should return auth error for invalid authorization', async () => {
      mockPaymentsService.handlePaymeWebhook.mockResolvedValue({
        error: { code: -32504, message: 'Unauthorized' },
      });

      const result = await controller.handlePaymeWebhook(
        {
          method: 'CheckPerformTransaction',
          params: {},
          id: 2,
        },
        'invalid-auth'
      );

      expect(result).toEqual({
        jsonrpc: '2.0',
        id: 2,
        error: { code: -32504, message: 'Unauthorized' },
      });
    });

    it('should handle missing params', async () => {
      mockPaymentsService.handlePaymeWebhook.mockResolvedValue({
        result: { success: true },
      });

      const result = await controller.handlePaymeWebhook(
        {
          method: 'GetStatement',
          id: 3,
        },
        'Basic dXNlcjpwYXNz'
      );

      expect(mockPaymentsService.handlePaymeWebhook).toHaveBeenCalledWith(
        'GetStatement',
        {},
        'Basic dXNlcjpwYXNz'
      );
    });

    it('should handle missing authorization header', async () => {
      mockPaymentsService.handlePaymeWebhook.mockResolvedValue({
        error: { code: -32504, message: 'Unauthorized' },
      });

      const result = await controller.handlePaymeWebhook(
        {
          method: 'CheckPerformTransaction',
          id: 4,
        },
        undefined // No auth header
      );

      expect(mockPaymentsService.handlePaymeWebhook).toHaveBeenCalledWith(
        'CheckPerformTransaction',
        {},
        ''
      );
    });

    it('should handle CreateTransaction method', async () => {
      mockPaymentsService.handlePaymeWebhook.mockResolvedValue({
        result: {
          create_time: Date.now(),
          transaction: 'trans-123',
          state: 1,
        },
      });

      const result = await controller.handlePaymeWebhook(
        {
          method: 'CreateTransaction',
          params: {
            id: 'trans-123',
            time: Date.now(),
            amount: 4990000,
            account: { order_id: 'payment-123' },
          },
          id: 5,
        },
        'Basic dXNlcjpwYXNz'
      );

      expect(result.result).toHaveProperty('transaction');
    });
  });

  // ============================================
  // POST /webhook/click - Click webhook (no auth)
  // ============================================
  describe('POST /webhook/click', () => {
    const clickPrepareBody = {
      click_trans_id: 123456,
      service_id: 12345,
      merchant_trans_id: 'purchase-123',
      amount: 15000,
      action: 0,
      sign_time: '2025-01-01 12:00:00',
      sign_string: 'valid-signature',
    };

    it('should handle Click prepare action (action=0)', async () => {
      mockPaymentsService.handleClickWebhook.mockResolvedValue({
        click_trans_id: 123456,
        merchant_trans_id: 'purchase-123',
        merchant_prepare_id: 1,
        error: 0,
        error_note: 'Success',
      });

      const result = await controller.handleClickWebhook(clickPrepareBody);

      expect(result.error).toBe(0);
      expect(result.merchant_prepare_id).toBeDefined();
      expect(mockPaymentsService.handleClickWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 0,
          merchant_trans_id: 'purchase-123',
        })
      );
    });

    it('should handle Click complete action (action=1)', async () => {
      const completeBody = {
        ...clickPrepareBody,
        action: 1,
        merchant_prepare_id: 1,
      };

      mockPaymentsService.handleClickWebhook.mockResolvedValue({
        click_trans_id: 123456,
        merchant_trans_id: 'purchase-123',
        error: 0,
        error_note: 'Success',
      });

      const result = await controller.handleClickWebhook(completeBody);

      expect(result.error).toBe(0);
    });

    it('should handle Click error response', async () => {
      mockPaymentsService.handleClickWebhook.mockResolvedValue({
        click_trans_id: 123456,
        merchant_trans_id: 'purchase-123',
        error: -5,
        error_note: 'Order not found',
      });

      const result = await controller.handleClickWebhook({
        ...clickPrepareBody,
        merchant_trans_id: 'nonexistent',
      });

      expect(result.error).toBe(-5);
      expect(result.error_note).toBe('Order not found');
    });

    it('should pass all parameters to service', async () => {
      const fullBody = {
        click_trans_id: 123456,
        service_id: 12345,
        merchant_trans_id: 'purchase-123',
        merchant_prepare_id: 1,
        amount: 15000,
        action: 1,
        sign_time: '2025-01-01 12:00:00',
        sign_string: 'valid-signature',
        error: 0,
        error_note: 'Success',
      };

      mockPaymentsService.handleClickWebhook.mockResolvedValue({
        click_trans_id: 123456,
        merchant_trans_id: 'purchase-123',
        error: 0,
      });

      await controller.handleClickWebhook(fullBody);

      expect(mockPaymentsService.handleClickWebhook).toHaveBeenCalledWith({
        click_trans_id: 123456,
        service_id: 12345,
        merchant_trans_id: 'purchase-123',
        merchant_prepare_id: 1,
        amount: 15000,
        action: 1,
        sign_time: '2025-01-01 12:00:00',
        sign_string: 'valid-signature',
        error: 0,
        error_note: 'Success',
      });
    });
  });

  // ============================================
  // Edge cases
  // ============================================
  describe('edge cases', () => {
    it('should handle service errors gracefully', async () => {
      mockPaymentsService.getPaymentHistory.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        controller.getHistory({ user: { userId: 'user-123' } })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle concurrent checkout requests', async () => {
      mockPaymentsService.createCheckout.mockResolvedValue(mockCheckoutResponse);

      const promises = Array.from({ length: 3 }, () =>
        controller.createCheckout(
          { user: { userId: 'user-123' } },
          {
            orderType: OrderType.SUBSCRIPTION,
            planId: 'plan-global',
            provider: PaymentProvider.PAYME,
          }
        )
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
    });

    it('should handle orderId with special format', async () => {
      mockPaymentsService.getPaymentStatus.mockResolvedValue(mockPaymentStatus);

      await controller.getStatus('clu3xyz123abc-def456-ghi789');

      expect(mockPaymentsService.getPaymentStatus).toHaveBeenCalledWith(
        'clu3xyz123abc-def456-ghi789'
      );
    });
  });
});
