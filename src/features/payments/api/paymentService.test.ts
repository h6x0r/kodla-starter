import { describe, it, expect, beforeEach, vi } from 'vitest';
import { paymentService } from './paymentService';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProviders', () => {
    it('should fetch available payment providers', async () => {
      const mockProviders = [
        { id: 'payme', name: 'Payme', configured: true },
        { id: 'click', name: 'Click', configured: true },
      ];

      vi.mocked(api.get).mockResolvedValueOnce(mockProviders);

      const result = await paymentService.getProviders();

      expect(api.get).toHaveBeenCalledWith('/payments/providers');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('payme');
    });

    it('should handle no configured providers', async () => {
      vi.mocked(api.get).mockResolvedValueOnce([]);

      const result = await paymentService.getProviders();

      expect(result).toHaveLength(0);
    });

    it('should throw on API error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Service unavailable'));

      await expect(paymentService.getProviders()).rejects.toThrow('Service unavailable');
    });
  });

  describe('getPricing', () => {
    it('should fetch pricing for purchases', async () => {
      const mockPricing = [
        {
          type: 'roadmap_generation',
          price: 50000,
          name: 'Roadmap Generation',
          nameRu: 'Генерация роадмапа',
          priceFormatted: '50,000 UZS',
        },
        {
          type: 'ai_credits',
          price: 25000,
          name: 'AI Credits Pack',
          nameRu: 'Пакет AI кредитов',
          priceFormatted: '25,000 UZS',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce(mockPricing);

      const result = await paymentService.getPricing();

      expect(api.get).toHaveBeenCalledWith('/payments/pricing');
      expect(result).toHaveLength(2);
    });

    it('should throw on API error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(paymentService.getPricing()).rejects.toThrow('Network error');
    });
  });

  describe('getRoadmapCredits', () => {
    it('should fetch roadmap credits', async () => {
      const mockCredits = {
        used: 2,
        available: 3,
        canGenerate: true,
      };

      vi.mocked(api.get).mockResolvedValueOnce(mockCredits);

      const result = await paymentService.getRoadmapCredits();

      expect(api.get).toHaveBeenCalledWith('/payments/roadmap-credits');
      expect(result.canGenerate).toBe(true);
    });

    it('should handle no credits available', async () => {
      const mockCredits = {
        used: 5,
        available: 0,
        canGenerate: false,
      };

      vi.mocked(api.get).mockResolvedValueOnce(mockCredits);

      const result = await paymentService.getRoadmapCredits();

      expect(result.canGenerate).toBe(false);
    });

    it('should throw on API error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(paymentService.getRoadmapCredits()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getPaymentHistory', () => {
    it('should fetch payment history', async () => {
      const mockHistory = [
        {
          id: 'payment-1',
          type: 'subscription' as const,
          description: 'Global Premium Monthly',
          amount: 100000,
          currency: 'UZS',
          status: 'completed',
          provider: 'payme',
          createdAt: '2025-01-15T10:00:00Z',
        },
        {
          id: 'payment-2',
          type: 'purchase' as const,
          description: 'Roadmap Generation',
          amount: 50000,
          currency: 'UZS',
          status: 'completed',
          provider: 'click',
          createdAt: '2025-01-10T15:30:00Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce(mockHistory);

      const result = await paymentService.getPaymentHistory();

      expect(api.get).toHaveBeenCalledWith('/payments/history');
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('subscription');
    });

    it('should handle empty payment history', async () => {
      vi.mocked(api.get).mockResolvedValueOnce([]);

      const result = await paymentService.getPaymentHistory();

      expect(result).toHaveLength(0);
    });

    it('should throw on API error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Forbidden'));

      await expect(paymentService.getPaymentHistory()).rejects.toThrow('Forbidden');
    });
  });

  describe('getPaymentStatus', () => {
    it('should fetch payment status', async () => {
      const mockStatus = {
        status: 'completed',
        orderType: 'subscription' as const,
        amount: 100000,
      };

      vi.mocked(api.get).mockResolvedValueOnce(mockStatus);

      const result = await paymentService.getPaymentStatus('order-123');

      expect(api.get).toHaveBeenCalledWith('/payments/status/order-123');
      expect(result.status).toBe('completed');
    });

    it('should handle pending status', async () => {
      const mockStatus = {
        status: 'pending',
        orderType: 'purchase' as const,
        amount: 50000,
      };

      vi.mocked(api.get).mockResolvedValueOnce(mockStatus);

      const result = await paymentService.getPaymentStatus('order-456');

      expect(result.status).toBe('pending');
    });

    it('should throw on API error', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Order not found'));

      await expect(paymentService.getPaymentStatus('invalid')).rejects.toThrow('Order not found');
    });
  });

  describe('createCheckout', () => {
    it('should create subscription checkout', async () => {
      const mockResponse = {
        orderId: 'order-789',
        paymentUrl: 'https://payme.uz/checkout/xyz',
        amount: 100000,
        currency: 'UZS',
        provider: 'payme',
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const result = await paymentService.createCheckout({
        orderType: 'subscription',
        planId: 'global-premium',
        provider: 'payme',
        returnUrl: 'https://practix.dev/payments/success',
      });

      expect(api.post).toHaveBeenCalledWith('/payments/checkout', {
        orderType: 'subscription',
        planId: 'global-premium',
        provider: 'payme',
        returnUrl: 'https://practix.dev/payments/success',
      });
      expect(result.paymentUrl).toContain('payme.uz');
    });

    it('should create purchase checkout', async () => {
      const mockResponse = {
        orderId: 'order-abc',
        paymentUrl: 'https://click.uz/checkout/abc',
        amount: 50000,
        currency: 'UZS',
        provider: 'click',
      };

      vi.mocked(api.post).mockResolvedValueOnce(mockResponse);

      const result = await paymentService.createCheckout({
        orderType: 'purchase',
        purchaseType: 'roadmap_generation',
        quantity: 1,
        provider: 'click',
      });

      expect(api.post).toHaveBeenCalledWith('/payments/checkout', {
        orderType: 'purchase',
        purchaseType: 'roadmap_generation',
        quantity: 1,
        provider: 'click',
      });
      expect(result.provider).toBe('click');
    });

    it('should throw on invalid request', async () => {
      vi.mocked(api.post).mockRejectedValueOnce(new Error('Invalid plan'));

      await expect(
        paymentService.createCheckout({
          orderType: 'subscription',
          planId: 'invalid-plan',
          provider: 'payme',
        })
      ).rejects.toThrow('Invalid plan');
    });
  });
});
