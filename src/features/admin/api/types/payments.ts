// Payment item in list
export interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  provider: string | null;
  providerTxId: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; name: string | null };
  plan: { id: string; name: string; slug: string; type: string };
  subscriptionId: string;
}

export interface PaymentsListResponse {
  payments: PaymentItem[];
  total: number;
}

// Purchase item (one-time payments)
export interface PurchaseItem {
  id: string;
  userId: string;
  type: "roadmap_generation" | "ai_credits" | "course_access";
  quantity: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "refunded";
  provider: string | null;
  providerTxId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; name: string | null };
}

export interface PurchasesListResponse {
  purchases: PurchaseItem[];
  total: number;
}

// Subscription item in list
export interface SubscriptionItem {
  id: string;
  status: "active" | "cancelled" | "expired" | "pending";
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  createdAt: string;
  user: { id: string; email: string; name: string | null; isPremium: boolean };
  plan: {
    id: string;
    name: string;
    slug: string;
    type: string;
    priceMonthly: number;
  };
  paymentsCount: number;
}

export interface SubscriptionsListResponse {
  subscriptions: SubscriptionItem[];
  total: number;
}

// Subscription plan
export interface SubscriptionPlanItem {
  id: string;
  slug: string;
  name: string;
  nameRu: string | null;
  type: string;
  priceMonthly: number;
  currency: string;
  isActive: boolean;
  course: { id: string; title: string; slug: string } | null;
  subscriptionsCount: number;
  createdAt: string;
}

// Revenue analytics
export interface RevenueAnalytics {
  thisMonth: { revenue: number; count: number };
  lastMonth: { revenue: number; count: number };
  total: { revenue: number; count: number };
  byProvider: Array<{ provider: string; revenue: number; count: number }>;
  refunded: { amount: number; count: number };
  purchases: { revenue: number; count: number };
  dailyRevenue: Array<{ date: string; amount: number }>;
}

// Payment transaction (audit log)
export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderType: string;
  provider: string;
  providerTxId: string | null;
  amount: number;
  state: number;
  action: string;
  request: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  errorCode: number | null;
  errorMessage: string | null;
  createdAt: string;
}

// Payment details (with transactions)
export interface PaymentDetails extends PaymentItem {
  subscription: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    user: {
      id: string;
      email: string;
      name: string | null;
      isPremium: boolean;
    };
    plan: SubscriptionPlanItem;
  };
  transactions: PaymentTransaction[];
}
