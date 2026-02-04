/**
 * Payment feature types
 */

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type PurchaseType =
  | "roadmap_generation"
  | "ai_credits"
  | "course_access";

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

export interface PaymentProvider {
  id: string;
  name: string;
  configured: boolean;
}

export interface SubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  nameRu?: string;
  type: "global" | "course";
  courseId?: string;
  course?: {
    id: string;
    slug: string;
    title: string;
    icon: string;
  };
  priceMonthly: number;
  currency: string;
  isActive: boolean;
}

/**
 * Course pricing for one-time purchase (lifetime access)
 * Price = 3x monthly subscription price
 */
export interface CoursePricing {
  courseId: string;
  courseSlug: string;
  courseName: string;
  price: number; // in tiyn
  currency: string;
  priceFormatted: string;
  hasAccess: boolean; // User already has access (subscription or purchase)
}

/**
 * User's purchased course (one-time purchase with lifetime access)
 */
export interface UserCourseAccess {
  courseId: string;
  courseSlug: string;
  courseName: string;
  purchasedAt: string;
  expiresAt: string | null; // null = lifetime access
}
