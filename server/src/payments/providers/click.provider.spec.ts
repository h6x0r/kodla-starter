import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClickProvider, ClickAction, ClickErrorCode } from './click.provider';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

// Helper to generate valid Click signature
function generateClickSignature(
  clickTransId: number,
  serviceId: number,
  secretKey: string,
  merchantTransId: string,
  amount: number,
  action: number,
  signTime: string,
  merchantPrepareId?: number,
): string {
  let signString: string;

  if (action === ClickAction.PREPARE) {
    signString = [
      clickTransId,
      serviceId,
      secretKey,
      merchantTransId,
      amount,
      action,
      signTime,
    ].join('');
  } else {
    signString = [
      clickTransId,
      serviceId,
      secretKey,
      merchantTransId,
      merchantPrepareId || '',
      amount,
      action,
      signTime,
    ].join('');
  }

  return crypto.createHash('md5').update(signString).digest('hex');
}

describe('ClickProvider', () => {
  let provider: ClickProvider;
  let prisma: jest.Mocked<PrismaService>;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigValues = {
    CLICK_SERVICE_ID: 'test-service-id',
    CLICK_MERCHANT_ID: 'test-merchant-id',
    CLICK_SECRET_KEY: 'test-secret-key',
    CLICK_MERCHANT_USER_ID: 'test-user-id',
    CLICK_TEST_MODE: 'true',
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
    paymentTransaction: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    subscription: {
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClickProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfigValues[key]),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    provider = module.get<ClickProvider>(ClickProvider);
    prisma = module.get(PrismaService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  // ============================================
  // isConfigured() - Check provider configuration
  // ============================================
  describe('isConfigured()', () => {
    it('should return true when all credentials are set', () => {
      expect(provider.isConfigured()).toBe(true);
    });

    it('should return false when service ID is missing', async () => {
      const module = await Test.createTestingModule({
        providers: [
          ClickProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) =>
                key === 'CLICK_SERVICE_ID' ? '' : mockConfigValues[key],
              ),
            },
          },
          { provide: PrismaService, useValue: mockPrismaService },
        ],
      }).compile();

      const unconfiguredProvider = module.get<ClickProvider>(ClickProvider);
      expect(unconfiguredProvider.isConfigured()).toBe(false);
    });

    it('should return false when merchant ID is missing', async () => {
      const module = await Test.createTestingModule({
        providers: [
          ClickProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) =>
                key === 'CLICK_MERCHANT_ID' ? '' : mockConfigValues[key],
              ),
            },
          },
          { provide: PrismaService, useValue: mockPrismaService },
        ],
      }).compile();

      const unconfiguredProvider = module.get<ClickProvider>(ClickProvider);
      expect(unconfiguredProvider.isConfigured()).toBe(false);
    });

    it('should return false when secret key is missing', async () => {
      const module = await Test.createTestingModule({
        providers: [
          ClickProvider,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) =>
                key === 'CLICK_SECRET_KEY' ? '' : mockConfigValues[key],
              ),
            },
          },
          { provide: PrismaService, useValue: mockPrismaService },
        ],
      }).compile();

      const unconfiguredProvider = module.get<ClickProvider>(ClickProvider);
      expect(unconfiguredProvider.isConfigured()).toBe(false);
    });
  });

  // ============================================
  // generatePaymentLink() - Generate payment URL
  // ============================================
  describe('generatePaymentLink()', () => {
    it('should generate correct payment URL', () => {
      const url = provider.generatePaymentLink('order-123', 49900);

      expect(url).toContain('https://my.click.uz/services/pay');
      expect(url).toContain('service_id=test-service-id');
      expect(url).toContain('merchant_id=test-merchant-id');
      expect(url).toContain('amount=49900');
      expect(url).toContain('transaction_param=order-123');
    });

    it('should include merchant_user_id in URL', () => {
      const url = provider.generatePaymentLink('order-123', 49900);

      expect(url).toContain('merchant_user_id=test-user-id');
    });

    it('should include return_url when provided', () => {
      const url = provider.generatePaymentLink(
        'order-123',
        49900,
        'https://practix.dev/success',
      );

      expect(url).toContain('return_url=');
      expect(url).toContain(encodeURIComponent('https://practix.dev/success'));
    });

    it('should work without return_url', () => {
      const url = provider.generatePaymentLink('order-123', 49900);

      expect(url).not.toContain('return_url=');
    });
  });

  // ============================================
  // handleWebhook() - Route webhook requests
  // ============================================
  describe('handleWebhook()', () => {
    const signTime = '2026-01-16 15:00:00';

    it('should reject invalid signature', async () => {
      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: 'order-123',
        amount: 49900,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: 'invalid-signature',
      });

      expect(result.error).toBe(ClickErrorCode.SIGN_CHECK_FAILED);
      expect(result.error_note).toBe('Invalid signature');
    });

    it('should handle Click error in webhook params', async () => {
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-1' });

      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        'order-123',
        49900,
        ClickAction.PREPARE,
        signTime,
      );

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: 'order-123',
        amount: 49900,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
        error: -9,
        error_note: 'Transaction cancelled by user',
      });

      expect(result.error).toBe(-9);
      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'error',
            errorCode: -9,
          }),
        }),
      );
    });

    it('should return error for unknown action', async () => {
      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        'order-123',
        49900,
        99, // Unknown action
        signTime,
      );

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: 'order-123',
        amount: 49900,
        action: 99,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.ACTION_NOT_FOUND);
      expect(result.error_note).toBe('Unknown action');
    });
  });

  // ============================================
  // Prepare - Order validation phase
  // ============================================
  describe('Prepare (action=0)', () => {
    const signTime = '2026-01-16 15:00:00';

    const createPrepareParams = (orderId: string, amount: number) => {
      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        orderId,
        amount,
        ClickAction.PREPARE,
        signTime,
      );

      return {
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: orderId,
        amount,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
      };
    };

    it('should successfully prepare valid subscription order', async () => {
      const orderId = 'payment-123';

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: orderId,
        amount: 4990000, // 49900 UZS * 100 = tiyn
        status: 'pending',
      });
      mockPrismaService.purchase.findUnique.mockResolvedValue(null);
      mockPrismaService.paymentTransaction.create.mockResolvedValue({
        id: 'abc12345-6789-0123-4567-890123456789',
      });

      const result = await provider.handleWebhook(createPrepareParams(orderId, 49900));

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
      expect(result.merchant_prepare_id).toBeDefined();
      expect(result.merchant_trans_id).toBe(orderId);
      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId,
            provider: 'click',
            action: 'prepare',
            state: 0,
          }),
        }),
      );
    });

    it('should successfully prepare valid purchase order', async () => {
      const orderId = 'purchase-123';

      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue({
        id: orderId,
        amount: 1990000, // 19900 UZS * 100
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({
        id: 'def12345-6789-0123-4567-890123456789',
      });

      const result = await provider.handleWebhook(createPrepareParams(orderId, 19900));

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalled();
    });

    it('should return error for non-existent order', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(null);

      const result = await provider.handleWebhook(
        createPrepareParams('non-existent-order', 49900),
      );

      expect(result.error).toBe(ClickErrorCode.USER_NOT_FOUND);
      expect(result.error_note).toBe('Order not found');
    });

    it('should return error for already paid order', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 4990000,
        status: 'completed', // Already paid
      });

      const result = await provider.handleWebhook(createPrepareParams('order-123', 49900));

      expect(result.error).toBe(ClickErrorCode.ALREADY_PAID);
      expect(result.error_note).toBe('Order already paid');
    });

    it('should return error for incorrect amount', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 4990000, // Expected 49900 UZS
        status: 'pending',
      });

      // Send wrong amount (29900 UZS instead of 49900)
      const result = await provider.handleWebhook(createPrepareParams('order-123', 29900));

      expect(result.error).toBe(ClickErrorCode.INVALID_AMOUNT);
      expect(result.error_note).toContain('Invalid amount');
    });

    it('should handle internal errors gracefully', async () => {
      mockPrismaService.payment.findUnique.mockRejectedValue(new Error('DB error'));

      const result = await provider.handleWebhook(createPrepareParams('order-123', 49900));

      expect(result.error).toBe(ClickErrorCode.FAILED_TO_UPDATE);
      expect(result.error_note).toBe('Internal error');
    });
  });

  // ============================================
  // Complete - Payment finalization phase
  // ============================================
  describe('Complete (action=1)', () => {
    const signTime = '2026-01-16 15:00:00';
    const merchantPrepareId = 12345678;

    const createCompleteParams = (orderId: string, amount: number, error?: number) => {
      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        orderId,
        amount,
        ClickAction.COMPLETE,
        signTime,
        merchantPrepareId,
      );

      return {
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: orderId,
        merchant_prepare_id: merchantPrepareId,
        amount,
        action: ClickAction.COMPLETE,
        sign_time: signTime,
        sign_string: validSignature,
        ...(error !== undefined && { error }),
      };
    };

    it('should successfully complete subscription payment', async () => {
      const orderId = 'payment-123';

      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        orderId,
        orderType: 'subscription',
        amount: 4990000,
      });
      mockPrismaService.payment.update.mockResolvedValue({ id: orderId });
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: orderId,
        subscriptionId: 'sub-123',
        subscription: { userId: 'user-123' },
      });
      mockPrismaService.subscription.update.mockResolvedValue({ id: 'sub-123' });
      mockPrismaService.user.update.mockResolvedValue({ id: 'user-123' });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-2' });

      const result = await provider.handleWebhook(createCompleteParams(orderId, 49900));

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
      expect(result.merchant_confirm_id).toBeDefined();

      // Should update payment status
      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: expect.objectContaining({
          status: 'completed',
          provider: 'click',
        }),
      });

      // Should activate subscription
      expect(mockPrismaService.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        data: { status: 'active' },
      });

      // Should set user as premium
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isPremium: true },
      });
    });

    it('should successfully complete purchase payment', async () => {
      const orderId = 'purchase-123';

      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        orderId,
        orderType: 'purchase',
        amount: 1990000,
      });
      mockPrismaService.purchase.update.mockResolvedValue({
        id: orderId,
        userId: 'user-123',
        type: 'roadmap_generation',
        quantity: 5,
      });
      mockPrismaService.user.update.mockResolvedValue({ id: 'user-123' });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-2' });

      const result = await provider.handleWebhook(createCompleteParams(orderId, 19900));

      expect(result.error).toBe(ClickErrorCode.SUCCESS);

      // Should update purchase status
      expect(mockPrismaService.purchase.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: expect.objectContaining({
          status: 'completed',
          provider: 'click',
        }),
      });

      // Should increment roadmap generations
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          roadmapGenerations: { increment: 5 },
        },
      });
    });

    it('should return error for non-existent transaction', async () => {
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);

      const result = await provider.handleWebhook(
        createCompleteParams('non-existent-order', 49900),
      );

      expect(result.error).toBe(ClickErrorCode.TRANSACTION_NOT_FOUND);
      expect(result.error_note).toBe('Transaction not found');
    });

    it('should handle cancellation from Click (error in params)', async () => {
      const orderId = 'payment-123';

      // When error is passed, handleWebhook returns early with the error
      // It logs the error but doesn't cancel the order through complete()
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-error' });

      const result = await provider.handleWebhook(
        createCompleteParams(orderId, 49900, -9),
      );

      // Should return the Click error directly
      expect(result.error).toBe(-9);
      expect(result.error_note).toBe('Click error');

      // Should log error transaction
      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'error',
            state: -1,
            errorCode: -9,
          }),
        }),
      );
    });

    it('should log error for purchase order on Click error', async () => {
      const orderId = 'purchase-123';

      // When error is passed in params, handleWebhook logs it and returns early
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-error' });

      const result = await provider.handleWebhook(
        createCompleteParams(orderId, 19900, -9),
      );

      // Should return the Click error
      expect(result.error).toBe(-9);
      expect(result.error_note).toBe('Click error');

      // Should log error transaction
      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalled();
    });

    it('should log complete transaction', async () => {
      const orderId = 'payment-123';

      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        orderId,
        orderType: 'subscription',
        amount: 4990000,
      });
      mockPrismaService.payment.update.mockResolvedValue({ id: orderId });
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: orderId,
        subscription: null,
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-2' });

      await provider.handleWebhook(createCompleteParams(orderId, 49900));

      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            orderId,
            action: 'complete',
            state: 1,
            provider: 'click',
          }),
        }),
      );
    });
  });

  // ============================================
  // Signature verification
  // ============================================
  describe('Signature verification', () => {
    const signTime = '2026-01-16 15:00:00';

    it('should accept valid prepare signature', async () => {
      const orderId = 'order-123';
      const amount = 49900;

      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        orderId,
        amount,
        ClickAction.PREPARE,
        signTime,
      );

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: orderId,
        amount: amount * 100,
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({
        id: 'tx-1',
      });

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: orderId,
        amount,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
    });

    it('should accept valid complete signature with merchant_prepare_id', async () => {
      const orderId = 'order-123';
      const amount = 49900;
      const merchantPrepareId = 12345678;

      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        orderId,
        amount,
        ClickAction.COMPLETE,
        signTime,
        merchantPrepareId,
      );

      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        orderId,
        orderType: 'subscription',
        amount: amount * 100,
      });
      mockPrismaService.payment.update.mockResolvedValue({ id: orderId });
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: orderId,
        subscription: null,
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-2' });

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: orderId,
        merchant_prepare_id: merchantPrepareId,
        amount,
        action: ClickAction.COMPLETE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
    });

    it('should reject tampered amount', async () => {
      const orderId = 'order-123';
      // Generate signature with amount 49900
      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        orderId,
        49900,
        ClickAction.PREPARE,
        signTime,
      );

      // But send different amount
      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: orderId,
        amount: 99900, // Different amount
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.SIGN_CHECK_FAILED);
    });

    it('should reject tampered order ID', async () => {
      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        'order-123',
        49900,
        ClickAction.PREPARE,
        signTime,
      );

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: 'different-order', // Tampered
        amount: 49900,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.SIGN_CHECK_FAILED);
    });
  });

  // ============================================
  // Edge cases
  // ============================================
  describe('Edge cases', () => {
    const signTime = '2026-01-16 15:00:00';

    it('should handle zero amount', async () => {
      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        'order-123',
        0,
        ClickAction.PREPARE,
        signTime,
      );

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 0,
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-1' });

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: 'order-123',
        amount: 0,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      // Zero amount should be processed if order amount matches
      expect(result.error).toBe(ClickErrorCode.SUCCESS);
    });

    it('should handle large transaction IDs', async () => {
      const largeClickTransId = 9999999999999;

      const validSignature = generateClickSignature(
        largeClickTransId,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        'order-123',
        49900,
        ClickAction.PREPARE,
        signTime,
      );

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 4990000,
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-1' });

      const result = await provider.handleWebhook({
        click_trans_id: largeClickTransId,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: 'order-123',
        amount: 49900,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
      expect(result.click_trans_id).toBe(largeClickTransId);
    });

    it('should handle special characters in order ID', async () => {
      const specialOrderId = 'order-with-special_chars.123';

      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        specialOrderId,
        49900,
        ClickAction.PREPARE,
        signTime,
      );

      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: specialOrderId,
        amount: 4990000,
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-1' });

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: specialOrderId,
        amount: 49900,
        action: ClickAction.PREPARE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
      expect(result.merchant_trans_id).toBe(specialOrderId);
    });

    it('should handle payment without subscription', async () => {
      const orderId = 'payment-123';

      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        orderId,
        orderType: 'subscription',
        amount: 4990000,
      });
      mockPrismaService.payment.update.mockResolvedValue({ id: orderId });
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: orderId,
        subscriptionId: null,
        subscription: null, // No subscription linked
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-2' });

      const validSignature = generateClickSignature(
        12345,
        parseInt(mockConfigValues.CLICK_SERVICE_ID),
        mockConfigValues.CLICK_SECRET_KEY,
        orderId,
        49900,
        ClickAction.COMPLETE,
        signTime,
        12345678,
      );

      const result = await provider.handleWebhook({
        click_trans_id: 12345,
        service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
        merchant_trans_id: orderId,
        merchant_prepare_id: 12345678,
        amount: 49900,
        action: ClickAction.COMPLETE,
        sign_time: signTime,
        sign_string: validSignature,
      });

      expect(result.error).toBe(ClickErrorCode.SUCCESS);
      // Should not try to update subscription/user
      expect(mockPrismaService.subscription.update).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
