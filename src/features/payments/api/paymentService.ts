import { api } from "@/lib/api";

export interface PaymentProvider {
  id: string;
  name: string;
  configured: boolean;
}

export interface PurchasePricing {
  type: string;
  price: number;
  name: string;
  nameRu: string;
  priceFormatted: string;
}

export interface RoadmapCredits {
  used: number;
  available: number;
  canGenerate: boolean;
}

export interface PaymentHistoryItem {
  id: string;
  type: "subscription" | "purchase";
  description: string;
  amount: number;
  currency: string;
  status: string;
  provider?: string;
  createdAt: string;
}

export interface CheckoutRequest {
  orderType: "subscription" | "purchase";
  planId?: string;
  purchaseType?: "roadmap_generation" | "ai_credits" | "course_access";
  courseId?: string; // For course_access purchases
  quantity?: number;
  provider: "payme" | "click";
  returnUrl?: string;
}

export interface CoursePricing {
  courseId: string;
  courseSlug: string;
  courseName: string;
  price: number; // in tiyn
  currency: string;
  priceFormatted: string;
  hasAccess: boolean;
}

export interface UserCourseAccess {
  courseId: string;
  courseSlug: string;
  courseName: string;
  purchasedAt: string;
  expiresAt: string | null; // null = lifetime
}

export interface CheckoutResponse {
  orderId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  provider: string;
}

export interface PaymentStatus {
  status: string;
  orderType: "subscription" | "purchase" | null;
  amount?: number;
}

export const paymentService = {
  /**
   * Get available payment providers
   */
  getProviders: async (): Promise<PaymentProvider[]> => {
    return api.get<PaymentProvider[]>("/payments/providers");
  },

  /**
   * Get pricing for one-time purchases
   */
  getPricing: async (): Promise<PurchasePricing[]> => {
    return api.get<PurchasePricing[]>("/payments/pricing");
  },

  /**
   * Get user's roadmap credits
   */
  getRoadmapCredits: async (): Promise<RoadmapCredits> => {
    return api.get<RoadmapCredits>("/payments/roadmap-credits");
  },

  /**
   * Get payment history
   */
  getPaymentHistory: async (): Promise<PaymentHistoryItem[]> => {
    return api.get<PaymentHistoryItem[]>("/payments/history");
  },

  /**
   * Check payment status
   */
  getPaymentStatus: async (orderId: string): Promise<PaymentStatus> => {
    return api.get<PaymentStatus>(`/payments/status/${orderId}`);
  },

  /**
   * Create checkout session
   * Returns payment URL for redirect
   */
  createCheckout: async (
    request: CheckoutRequest,
  ): Promise<CheckoutResponse> => {
    return api.post<CheckoutResponse>("/payments/checkout", request);
  },

  /**
   * Get pricing for all courses (one-time purchase prices)
   * Price = 3x monthly subscription price
   */
  getCoursesPricing: async (): Promise<CoursePricing[]> => {
    return api.get<CoursePricing[]>("/payments/courses/pricing");
  },

  /**
   * Get pricing for a specific course
   */
  getCoursePricing: async (courseId: string): Promise<CoursePricing> => {
    return api.get<CoursePricing>(`/payments/courses/pricing/${courseId}`);
  },

  /**
   * Get user's purchased courses (one-time purchases with lifetime access)
   */
  getPurchasedCourses: async (): Promise<UserCourseAccess[]> => {
    return api.get<UserCourseAccess[]>("/payments/courses/purchased");
  },

  /**
   * Create checkout for one-time course purchase
   */
  purchaseCourse: async (
    courseId: string,
    provider: "payme" | "click",
    returnUrl?: string,
  ): Promise<CheckoutResponse> => {
    return api.post<CheckoutResponse>("/payments/checkout", {
      orderType: "purchase",
      purchaseType: "course_access",
      courseId,
      provider,
      returnUrl,
    });
  },
};
