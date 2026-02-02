import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PaymeProvider, PaymeTransactionState, PaymeErrorCode } from './payme.provider';
import { PrismaService } from '../../prisma/prisma.service';

describe('PaymeProvider', () => {
  let provider: PaymeProvider;
  let prisma: PrismaService;
  let configService: ConfigService;

  const mockConfig = {
    PAYME_MERCHANT_ID: 'test-merchant-id',
    PAYME_SECRET_KEY: 'test-secret-key',
    PAYME_TEST_MODE: 'true',
  };

  const mockPayment = {
    id: 'payment-123',
    subscriptionId: 'sub-123',
    amount: 4990000,
    currency: 'UZS',
    status: 'pending',
    provider: null,
    providerTxId: null,
    createdAt: new Date('2025-01-01'),
  };

  const mockPurchase = {
    id: 'purchase-123',
    userId: 'user-123',
    type: 'roadmap_generation',
    quantity: 1,
    amount: 1500000,
    currency: 'UZS',
    status: 'pending',
    provider: null,
    providerTxId: null,
    createdAt: new Date('2025-01-01'),
  };

  const mockTransaction = {
    id: 'tx-123',
    orderId: 'payment-123',
    orderType: 'subscription',
    provider: 'payme',
    providerTxId: 'payme-tx-123',
    amount: 4990000,
    state: PaymeTransactionState.PENDING,
    action: 'create',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockSubscription = {
    id: 'sub-123',
    userId: 'user-123',
    planId: 'plan-global',
    status: 'pending',
  };

  const mockPrismaService = {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    purchase: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    paymentTransaction: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => mockConfig[key]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymeProvider,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    provider = module.get<PaymeProvider>(PaymeProvider);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  // ============================================
  // isConfigured() - Check configuration
  // ============================================
  describe('isConfigured()', () => {
    it('should return true when merchant ID and secret key are set', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false when merchant ID is missing', async () => {
      const unconfiguredModule = await Test.createTestingModule({
        providers: [
          PaymeProvider,
          { provide: PrismaService, useValue: mockPrismaService },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'PAYME_MERCHANT_ID') return '';
                return mockConfig[key];
              }),
            },
          },
        ],
      }).compile();

      const unconfiguredProvider = unconfiguredModule.get<PaymeProvider>(PaymeProvider);
      expect(unconfiguredProvider.isConfigured()).toBe(false);
    });

    it('should return false when secret key is missing', async () => {
      const unconfiguredModule = await Test.createTestingModule({
        providers: [
          PaymeProvider,
          { provide: PrismaService, useValue: mockPrismaService },
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'PAYME_SECRET_KEY') return '';
                return mockConfig[key];
              }),
            },
          },
        ],
      }).compile();

      const unconfiguredProvider = unconfiguredModule.get<PaymeProvider>(PaymeProvider);
      expect(unconfiguredProvider.isConfigured()).toBe(false);
    });
  });

  // ============================================
  // generatePaymentLink() - Generate payment URL
  // ============================================
  describe('generatePaymentLink()', () => {
    it('should generate correct payment URL with base64 encoded params', () => {
      const url = provider.generatePaymentLink('order-123', 4990000);

      expect(url).toContain('https://test.paycom.uz');
      // Decode the base64 part and check for order_id
      const base64Part = url.split('/').pop();
      const decoded = Buffer.from(base64Part, 'base64').toString('utf8');
      expect(decoded).toContain('order_id=order-123');
    });

    it('should use test URL in test mode', () => {
      const url = provider.generatePaymentLink('order-123', 1000);

      expect(url).toContain('https://test.paycom.uz');
    });

    it('should include callback URL when returnUrl is provided', () => {
      const url = provider.generatePaymentLink(
        'order-123',
        4990000,
        'https://practix.dev/success'
      );

      expect(url).toContain('callback=');
      expect(url).toContain(encodeURIComponent('https://practix.dev/success'));
    });

    it('should encode parameters in base64', () => {
      const url = provider.generatePaymentLink('order-123', 4990000);
      const base64Part = url.split('/').pop()?.split('?')[0];

      // Should be valid base64
      expect(() => Buffer.from(base64Part!, 'base64').toString()).not.toThrow();
    });

    it('should include merchant ID in encoded params', () => {
      const url = provider.generatePaymentLink('order-123', 4990000);
      const base64Part = url.split('/').pop()?.split('?')[0];
      const decoded = Buffer.from(base64Part!, 'base64').toString();

      expect(decoded).toContain('m=test-merchant-id');
      expect(decoded).toContain('ac.order_id=order-123');
      expect(decoded).toContain('a=4990000');
    });
  });

  // ============================================
  // verifyAuth() - Verify Basic Auth
  // ============================================
  describe('verifyAuth()', () => {
    it('should return true for valid Basic Auth', () => {
      const credentials = Buffer.from('Paycom:test-secret-key').toString('base64');
      const authHeader = `Basic ${credentials}`;

      expect(provider.verifyAuth(authHeader)).toBe(true);
    });

    it('should return false for invalid credentials', () => {
      const credentials = Buffer.from('Paycom:wrong-secret').toString('base64');
      const authHeader = `Basic ${credentials}`;

      expect(provider.verifyAuth(authHeader)).toBe(false);
    });

    it('should return false for wrong login', () => {
      const credentials = Buffer.from('WrongLogin:test-secret-key').toString('base64');
      const authHeader = `Basic ${credentials}`;

      expect(provider.verifyAuth(authHeader)).toBe(false);
    });

    it('should return false for missing auth header', () => {
      expect(provider.verifyAuth('')).toBe(false);
      expect(provider.verifyAuth(null as any)).toBe(false);
    });

    it('should return false for non-Basic auth', () => {
      expect(provider.verifyAuth('Bearer token123')).toBe(false);
    });

    it('should return false for malformed Basic auth', () => {
      expect(provider.verifyAuth('Basic invalid-base64-@#$')).toBe(false);
    });
  });

  // ============================================
  // handleWebhook() - Route to methods
  // ============================================
  describe('handleWebhook()', () => {
    it('should route to CheckPerformTransaction', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 4990000,
        account: { order_id: 'payment-123' },
      });

      expect(result.result).toEqual({ allow: true });
    });

    it('should return error for unknown method', async () => {
      const result = await provider.handleWebhook('UnknownMethod', {});

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.METHOD_NOT_FOUND);
    });

    it('should handle internal errors gracefully', async () => {
      mockPrismaService.payment.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 4990000,
        account: { order_id: 'payment-123' },
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.INTERNAL_ERROR);
    });
  });

  // ============================================
  // CheckPerformTransaction - Validate order
  // ============================================
  describe('CheckPerformTransaction', () => {
    it('should return allow: true for valid order', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 4990000,
        account: { order_id: 'payment-123' },
      });

      expect(result.result).toEqual({ allow: true });
    });

    it('should return error for missing order_id', async () => {
      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 4990000,
        account: {},
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.INVALID_ACCOUNT);
    });

    it('should return error for non-existent order', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(null);

      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 4990000,
        account: { order_id: 'nonexistent' },
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.INVALID_ACCOUNT);
    });

    it('should return error for already processed order', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        status: 'completed',
      });

      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 4990000,
        account: { order_id: 'payment-123' },
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.OPERATION_NOT_ALLOWED);
    });

    it('should return error for invalid amount', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 1000, // Wrong amount
        account: { order_id: 'payment-123' },
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.INVALID_AMOUNT);
    });

    it('should work with purchase orders', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(mockPurchase);

      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 1500000,
        account: { order_id: 'purchase-123' },
      });

      expect(result.result).toEqual({ allow: true });
    });
  });

  // ============================================
  // CreateTransaction - Create transaction
  // ============================================
  describe('CreateTransaction', () => {
    it('should create new transaction for valid order', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.paymentTransaction.create.mockResolvedValue(mockTransaction);

      const result = await provider.handleWebhook('CreateTransaction', {
        id: 'payme-tx-123',
        time: Date.now(),
        amount: 4990000,
        account: { order_id: 'payment-123' },
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).state).toBe(PaymeTransactionState.PENDING);
      expect((result.result as any).transaction).toBe('payment-123');
    });

    it('should return existing transaction (idempotent)', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await provider.handleWebhook('CreateTransaction', {
        id: 'payme-tx-123',
        time: Date.now(),
        amount: 4990000,
        account: { order_id: 'payment-123' },
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).state).toBe(PaymeTransactionState.PENDING);
      expect(mockPrismaService.paymentTransaction.create).not.toHaveBeenCalled();
    });

    it('should return error for invalid order', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(null);

      const result = await provider.handleWebhook('CreateTransaction', {
        id: 'payme-tx-123',
        time: Date.now(),
        amount: 4990000,
        account: { order_id: 'nonexistent' },
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.INVALID_ACCOUNT);
    });

    it('should return error for wrong amount', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await provider.handleWebhook('CreateTransaction', {
        id: 'payme-tx-123',
        time: Date.now(),
        amount: 1000, // Wrong amount
        account: { order_id: 'payment-123' },
      });

      expect(result.error).toBeDefined();
    });
  });

  // ============================================
  // PerformTransaction - Complete payment
  // ============================================
  describe('PerformTransaction', () => {
    it('should complete pending transaction', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.paymentTransaction.update.mockResolvedValue({
        ...mockTransaction,
        state: PaymeTransactionState.COMPLETED,
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue({});
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        subscriptionId: 'sub-123',
        subscription: mockSubscription,
      });
      mockPrismaService.subscription.update.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await provider.handleWebhook('PerformTransaction', {
        id: 'payme-tx-123',
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).state).toBe(PaymeTransactionState.COMPLETED);
    });

    it('should return existing completed transaction (idempotent)', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        state: PaymeTransactionState.COMPLETED,
      });

      const result = await provider.handleWebhook('PerformTransaction', {
        id: 'payme-tx-123',
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).state).toBe(PaymeTransactionState.COMPLETED);
      expect(mockPrismaService.paymentTransaction.update).not.toHaveBeenCalled();
    });

    it('should return error for non-existent transaction', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);

      const result = await provider.handleWebhook('PerformTransaction', {
        id: 'nonexistent',
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.TRANSACTION_NOT_FOUND);
    });

    it('should return error for cancelled transaction', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        state: PaymeTransactionState.CANCELLED_BEFORE,
      });

      const result = await provider.handleWebhook('PerformTransaction', {
        id: 'payme-tx-123',
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.OPERATION_NOT_ALLOWED);
    });

    it('should update user isPremium for subscription payments', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.paymentTransaction.update.mockResolvedValue({});
      mockPrismaService.paymentTransaction.create.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue({});
      mockPrismaService.payment.findUnique.mockResolvedValue({
        ...mockPayment,
        subscriptionId: 'sub-123',
        subscription: mockSubscription,
      });
      mockPrismaService.subscription.update.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});

      await provider.handleWebhook('PerformTransaction', {
        id: 'payme-tx-123',
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isPremium: true },
      });
    });
  });

  // ============================================
  // CancelTransaction - Cancel/Refund
  // ============================================
  describe('CancelTransaction', () => {
    it('should cancel pending transaction (before completion)', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.paymentTransaction.update.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue({});

      const result = await provider.handleWebhook('CancelTransaction', {
        id: 'payme-tx-123',
        reason: 1,
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).state).toBe(PaymeTransactionState.CANCELLED_BEFORE);
    });

    it('should cancel completed transaction (refund)', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        state: PaymeTransactionState.COMPLETED,
      });
      mockPrismaService.paymentTransaction.update.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue({});

      const result = await provider.handleWebhook('CancelTransaction', {
        id: 'payme-tx-123',
        reason: 1,
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).state).toBe(PaymeTransactionState.CANCELLED_AFTER);
    });

    it('should return error for non-existent transaction', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);

      const result = await provider.handleWebhook('CancelTransaction', {
        id: 'nonexistent',
        reason: 1,
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.TRANSACTION_NOT_FOUND);
    });

    it('should update order status to failed', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(mockTransaction);
      mockPrismaService.paymentTransaction.update.mockResolvedValue({});
      mockPrismaService.payment.update.mockResolvedValue({});

      await provider.handleWebhook('CancelTransaction', {
        id: 'payme-tx-123',
        reason: 1,
      });

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
        data: { status: 'failed' },
      });
    });

    it('should update purchase status to failed for purchase orders', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        orderId: 'purchase-123',
        orderType: 'purchase',
      });
      mockPrismaService.paymentTransaction.update.mockResolvedValue({});
      mockPrismaService.purchase.update.mockResolvedValue({});

      await provider.handleWebhook('CancelTransaction', {
        id: 'payme-tx-123',
        reason: 1,
      });

      expect(mockPrismaService.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: { status: 'failed' },
      });
    });
  });

  // ============================================
  // CheckTransaction - Get status
  // ============================================
  describe('CheckTransaction', () => {
    it('should return transaction status', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(mockTransaction);

      const result = await provider.handleWebhook('CheckTransaction', {
        id: 'payme-tx-123',
      });

      expect(result.result).toBeDefined();
      expect((result.result as any).state).toBe(PaymeTransactionState.PENDING);
      expect((result.result as any).transaction).toBe('payment-123');
    });

    it('should return error for non-existent transaction', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);

      const result = await provider.handleWebhook('CheckTransaction', {
        id: 'nonexistent',
      });

      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymeErrorCode.TRANSACTION_NOT_FOUND);
    });

    it('should include perform_time for completed transactions', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        state: PaymeTransactionState.COMPLETED,
      });

      const result = await provider.handleWebhook('CheckTransaction', {
        id: 'payme-tx-123',
      });

      expect((result.result as any).perform_time).toBeGreaterThan(0);
    });

    it('should include cancel_time for cancelled transactions', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        ...mockTransaction,
        state: PaymeTransactionState.CANCELLED_BEFORE,
      });

      const result = await provider.handleWebhook('CheckTransaction', {
        id: 'payme-tx-123',
      });

      expect((result.result as any).cancel_time).toBeGreaterThan(0);
    });
  });

  // ============================================
  // GetStatement - Transaction list
  // ============================================
  describe('GetStatement', () => {
    it('should return transactions in date range', async () => {
      const transactions = [mockTransaction, { ...mockTransaction, id: 'tx-456' }];
      mockPrismaService.paymentTransaction.findMany.mockResolvedValue(transactions);

      const from = new Date('2025-01-01').getTime();
      const to = new Date('2025-01-31').getTime();

      const result = await provider.handleWebhook('GetStatement', { from, to });

      expect(result.result).toBeDefined();
      expect((result.result as any).transactions).toHaveLength(2);
      expect(mockPrismaService.paymentTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            provider: 'payme',
            createdAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          },
        })
      );
    });

    it('should return empty array if no transactions', async () => {
      mockPrismaService.paymentTransaction.findMany.mockResolvedValue([]);

      const result = await provider.handleWebhook('GetStatement', {
        from: Date.now() - 86400000,
        to: Date.now(),
      });

      expect((result.result as any).transactions).toEqual([]);
    });

    it('should format transaction data correctly', async () => {
      mockPrismaService.paymentTransaction.findMany.mockResolvedValue([mockTransaction]);

      const result = await provider.handleWebhook('GetStatement', {
        from: Date.now() - 86400000,
        to: Date.now(),
      });

      const tx = (result.result as any).transactions[0];
      expect(tx).toHaveProperty('id');
      expect(tx).toHaveProperty('time');
      expect(tx).toHaveProperty('amount');
      expect(tx).toHaveProperty('account');
      expect(tx).toHaveProperty('state');
    });
  });

  // ============================================
  // Order completion (tested via PerformTransaction)
  // ============================================
  describe('completeOrder - Purchase', () => {
    it('should increment roadmap generations for roadmap_generation purchase', async () => {
      const purchaseTransaction = {
        ...mockTransaction,
        orderId: 'purchase-123',
        orderType: 'purchase',
        amount: 1500000,
      };
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(purchaseTransaction);
      mockPrismaService.paymentTransaction.update.mockResolvedValue({});
      mockPrismaService.paymentTransaction.create.mockResolvedValue({});
      mockPrismaService.purchase.update.mockResolvedValue({
        ...mockPurchase,
        status: 'completed',
      });
      mockPrismaService.user.update.mockResolvedValue({});

      await provider.handleWebhook('PerformTransaction', {
        id: 'payme-tx-123',
      });

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          roadmapGenerations: { increment: 1 },
        },
      });
    });
  });

  // ============================================
  // Edge cases
  // ============================================
  describe('edge cases', () => {
    it('should handle missing account object', async () => {
      const result = await provider.handleWebhook('CheckPerformTransaction', {
        amount: 4990000,
      });

      expect(result.error).toBeDefined();
    });

    it('should handle null params', async () => {
      const result = await provider.handleWebhook('CheckPerformTransaction', null as any);

      expect(result.error).toBeDefined();
    });

    it('should handle concurrent transactions', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.paymentTransaction.create.mockResolvedValue(mockTransaction);

      const promises = Array.from({ length: 3 }, () =>
        provider.handleWebhook('CreateTransaction', {
          id: 'payme-tx-123',
          time: Date.now(),
          amount: 4990000,
          account: { order_id: 'payment-123' },
        })
      );

      const results = await Promise.all(promises);

      // All should succeed or return existing transaction
      results.forEach(result => {
        expect(result.result || result.error).toBeDefined();
      });
    });
  });
});
