import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as crypto from 'crypto';
import { PaymentsController } from '../payments.controller';
import { PaymentsService } from '../payments.service';
import { PaymeProvider } from '../providers/payme.provider';
import { ClickProvider, ClickAction, ClickErrorCode } from '../providers/click.provider';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

/**
 * Integration tests for Payment Webhooks
 *
 * These tests verify the full flow from HTTP request to response,
 * including controller, service, and provider interactions.
 */
describe('Payment Webhooks Integration', () => {
  let app: INestApplication;
  let prisma: jest.Mocked<PrismaService>;

  const mockConfigValues = {
    PAYME_MERCHANT_ID: 'test-payme-merchant',
    PAYME_SECRET_KEY: 'test-payme-secret',
    PAYME_TEST_MODE: 'true',
    CLICK_SERVICE_ID: '12345',
    CLICK_MERCHANT_ID: 'test-click-merchant',
    CLICK_SECRET_KEY: 'test-click-secret',
    CLICK_MERCHANT_USER_ID: '1',
    CLICK_TEST_MODE: 'true',
    APP_URL: 'https://practix.dev',
  };

  const mockPrismaService = {
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    purchase: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    paymentTransaction: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    subscription: {
      update: jest.fn(),
    },
    subscriptionPlan: {
      findUnique: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        PaymentsService,
        PaymeProvider,
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

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Payme Webhook Integration Tests
  // ============================================
  describe('Payme Webhooks (/payments/webhook/payme)', () => {
    const validAuthHeader = `Basic ${Buffer.from(`Paycom:${mockConfigValues.PAYME_SECRET_KEY}`).toString('base64')}`;

    it('should reject request without auth header', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/webhook/payme')
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'CheckPerformTransaction',
          params: { account: { order_id: 'order-123' }, amount: 4990000 },
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(-32504); // Authentication failed
    });

    it('should reject request with invalid auth', async () => {
      const invalidAuth = `Basic ${Buffer.from('Paycom:wrong-secret').toString('base64')}`;

      const response = await request(app.getHttpServer())
        .post('/payments/webhook/payme')
        .set('Authorization', invalidAuth)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'CheckPerformTransaction',
          params: { account: { order_id: 'order-123' }, amount: 4990000 },
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(-32504);
    });

    it('should handle CheckPerformTransaction for valid order', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 4990000,
        status: 'pending',
      });

      const response = await request(app.getHttpServer())
        .post('/payments/webhook/payme')
        .set('Authorization', validAuthHeader)
        .send({
          jsonrpc: '2.0',
          id: 1,
          method: 'CheckPerformTransaction',
          params: { account: { order_id: 'order-123' }, amount: 4990000 },
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.allow).toBe(true);
      expect(response.body.id).toBe(1);
    });

    it('should handle CreateTransaction and log to database', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 4990000,
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);
      mockPrismaService.paymentTransaction.create.mockResolvedValue({
        id: 'tx-1',
        createdAt: new Date('2026-01-16T15:00:00Z'),
      });

      const response = await request(app.getHttpServer())
        .post('/payments/webhook/payme')
        .set('Authorization', validAuthHeader)
        .send({
          jsonrpc: '2.0',
          id: 2,
          method: 'CreateTransaction',
          params: {
            id: 'payme-tx-123',
            time: Date.now(),
            amount: 4990000,
            account: { order_id: 'order-123' },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.result).toBeDefined();
      expect(response.body.result.transaction).toBeDefined();

      // Should log transaction to database
      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalled();
    });

    it('should return JSON-RPC 2.0 format', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/payments/webhook/payme')
        .set('Authorization', validAuthHeader)
        .send({
          jsonrpc: '2.0',
          id: 999,
          method: 'CheckPerformTransaction',
          params: { account: { order_id: 'non-existent' }, amount: 1000 },
        });

      expect(response.status).toBe(200);
      expect(response.body.jsonrpc).toBe('2.0');
      expect(response.body.id).toBe(999);
      // Either result or error should be present
      expect(response.body.result !== undefined || response.body.error !== undefined).toBe(
        true,
      );
    });
  });

  // ============================================
  // Click Webhook Integration Tests
  // ============================================
  describe('Click Webhooks (/payments/webhook/click)', () => {
    const signTime = '2026-01-16 15:00:00';

    const generateClickSignature = (
      clickTransId: number,
      merchantTransId: string,
      amount: number,
      action: number,
      merchantPrepareId?: number,
    ): string => {
      let signString: string;
      const serviceId = parseInt(mockConfigValues.CLICK_SERVICE_ID);
      const secretKey = mockConfigValues.CLICK_SECRET_KEY;

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
    };

    it('should reject request with invalid signature', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/webhook/click')
        .send({
          click_trans_id: 12345,
          service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
          merchant_trans_id: 'order-123',
          amount: 49900,
          action: ClickAction.PREPARE,
          sign_time: signTime,
          sign_string: 'invalid-signature',
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBe(ClickErrorCode.SIGN_CHECK_FAILED);
    });

    it('should handle Prepare request for valid order', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 4990000, // 49900 * 100
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({
        id: 'abc12345-6789-0123-4567-890123456789',
      });

      const signature = generateClickSignature(12345, 'order-123', 49900, ClickAction.PREPARE);

      const response = await request(app.getHttpServer())
        .post('/payments/webhook/click')
        .send({
          click_trans_id: 12345,
          service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
          merchant_trans_id: 'order-123',
          amount: 49900,
          action: ClickAction.PREPARE,
          sign_time: signTime,
          sign_string: signature,
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBe(ClickErrorCode.SUCCESS);
      expect(response.body.merchant_prepare_id).toBeDefined();

      // Should log transaction
      expect(mockPrismaService.paymentTransaction.create).toHaveBeenCalled();
    });

    it('should handle Complete request and activate subscription', async () => {
      const merchantPrepareId = 12345678;

      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        orderId: 'order-123',
        orderType: 'subscription',
        amount: 4990000,
      });
      mockPrismaService.payment.update.mockResolvedValue({ id: 'order-123' });
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        subscriptionId: 'sub-123',
        subscription: { userId: 'user-123' },
      });
      mockPrismaService.subscription.update.mockResolvedValue({ id: 'sub-123' });
      mockPrismaService.user.update.mockResolvedValue({ id: 'user-123' });
      mockPrismaService.paymentTransaction.create.mockResolvedValue({ id: 'tx-2' });

      const signature = generateClickSignature(
        12345,
        'order-123',
        49900,
        ClickAction.COMPLETE,
        merchantPrepareId,
      );

      const response = await request(app.getHttpServer())
        .post('/payments/webhook/click')
        .send({
          click_trans_id: 12345,
          service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
          merchant_trans_id: 'order-123',
          merchant_prepare_id: merchantPrepareId,
          amount: 49900,
          action: ClickAction.COMPLETE,
          sign_time: signTime,
          sign_string: signature,
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBe(ClickErrorCode.SUCCESS);

      // Should update payment and subscription
      expect(mockPrismaService.payment.update).toHaveBeenCalled();
      expect(mockPrismaService.subscription.update).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isPremium: true },
      });
    });

    it('should return error for non-existent order in Prepare', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.purchase.findUnique.mockResolvedValue(null);

      const signature = generateClickSignature(
        12345,
        'non-existent',
        49900,
        ClickAction.PREPARE,
      );

      const response = await request(app.getHttpServer())
        .post('/payments/webhook/click')
        .send({
          click_trans_id: 12345,
          service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
          merchant_trans_id: 'non-existent',
          amount: 49900,
          action: ClickAction.PREPARE,
          sign_time: signTime,
          sign_string: signature,
        });

      expect(response.status).toBe(200);
      expect(response.body.error).toBe(ClickErrorCode.USER_NOT_FOUND);
    });
  });

  // ============================================
  // Cross-provider Integration Tests
  // ============================================
  describe('Cross-provider scenarios', () => {
    it('should handle concurrent requests from different providers', async () => {
      // Set up shared order
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'order-123',
        amount: 4990000,
        status: 'pending',
      });
      mockPrismaService.paymentTransaction.findFirst.mockResolvedValue(null);
      mockPrismaService.paymentTransaction.create.mockResolvedValue({
        id: 'tx-1',
        createdAt: new Date(),
      });

      const paymeAuth = `Basic ${Buffer.from(`Paycom:${mockConfigValues.PAYME_SECRET_KEY}`).toString('base64')}`;
      const clickSignature = crypto
        .createHash('md5')
        .update(
          [
            12345,
            parseInt(mockConfigValues.CLICK_SERVICE_ID),
            mockConfigValues.CLICK_SECRET_KEY,
            'order-456',
            49900,
            ClickAction.PREPARE,
            '2026-01-16 15:00:00',
          ].join(''),
        )
        .digest('hex');

      // Send both requests "simultaneously"
      const [paymeResponse, clickResponse] = await Promise.all([
        request(app.getHttpServer())
          .post('/payments/webhook/payme')
          .set('Authorization', paymeAuth)
          .send({
            jsonrpc: '2.0',
            id: 1,
            method: 'CheckPerformTransaction',
            params: { account: { order_id: 'order-123' }, amount: 4990000 },
          }),
        request(app.getHttpServer())
          .post('/payments/webhook/click')
          .send({
            click_trans_id: 12345,
            service_id: parseInt(mockConfigValues.CLICK_SERVICE_ID),
            merchant_trans_id: 'order-456',
            amount: 49900,
            action: ClickAction.PREPARE,
            sign_time: '2026-01-16 15:00:00',
            sign_string: clickSignature,
          }),
      ]);

      // Both should complete without error (assuming different orders)
      expect(paymeResponse.status).toBe(200);
      expect(clickResponse.status).toBe(200);
    });
  });
});
