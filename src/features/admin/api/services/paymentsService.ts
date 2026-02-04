import { api } from "@/lib/api";
import type {
  PaymentsListResponse,
  PaymentDetails,
  PaymentItem,
  PurchasesListResponse,
  SubscriptionsListResponse,
  SubscriptionItem,
  SubscriptionPlanItem,
  RevenueAnalytics,
} from "../types";

export const adminPaymentsService = {
  getPayments: async (params?: {
    status?: string;
    provider?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaymentsListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.provider) searchParams.append("provider", params.provider);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await api.get<PaymentsListResponse>(`/admin/analytics/payments${query}`);
  },

  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    return await api.get<RevenueAnalytics>("/admin/analytics/payments/revenue");
  },

  getPaymentById: async (paymentId: string): Promise<PaymentDetails> => {
    return await api.get<PaymentDetails>(`/admin/analytics/payments/${paymentId}`);
  },

  refundPayment: async (paymentId: string, reason: string): Promise<PaymentItem> => {
    return await api.post<PaymentItem>(
      `/admin/analytics/payments/${paymentId}/refund`,
      { reason }
    );
  },

  getPurchases: async (params?: {
    status?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<PurchasesListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.type) searchParams.append("type", params.type);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await api.get<PurchasesListResponse>(`/admin/analytics/purchases${query}`);
  },

  getSubscriptionsList: async (params?: {
    status?: string;
    planId?: string;
    limit?: number;
    offset?: number;
  }): Promise<SubscriptionsListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.planId) searchParams.append("planId", params.planId);
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await api.get<SubscriptionsListResponse>(`/admin/analytics/subscriptions/list${query}`);
  },

  getSubscriptionPlans: async (): Promise<SubscriptionPlanItem[]> => {
    return await api.get<SubscriptionPlanItem[]>("/admin/analytics/subscriptions/plans");
  },

  extendSubscription: async (subscriptionId: string, days: number): Promise<SubscriptionItem> => {
    return await api.post<SubscriptionItem>(
      `/admin/analytics/subscriptions/${subscriptionId}/extend`,
      { days }
    );
  },

  cancelSubscription: async (subscriptionId: string): Promise<SubscriptionItem> => {
    return await api.post<SubscriptionItem>(
      `/admin/analytics/subscriptions/${subscriptionId}/cancel`,
      {}
    );
  },
};
