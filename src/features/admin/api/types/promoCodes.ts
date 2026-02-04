export type PromoCodeType = "PERCENTAGE" | "FIXED" | "FREE_TRIAL";
export type PromoCodeApplicableTo = "ALL" | "SUBSCRIPTIONS" | "PURCHASES" | "COURSES";

export interface PromoCodeItem {
  id: string;
  code: string;
  type: PromoCodeType;
  discount: number;
  maxUses: number | null;
  maxUsesPerUser: number;
  usesCount: number;
  minPurchaseAmount: number | null;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableTo: PromoCodeApplicableTo;
  courseIds: string[];
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  _count?: { usages: number };
}

export interface PromoCodesListResponse {
  promoCodes: PromoCodeItem[];
  total: number;
}

export interface PromoCodeUsageItem {
  id: string;
  orderId: string;
  orderType: string;
  discountAmount: number;
  createdAt: string;
  user: { id: string; email: string; name: string | null };
}

export interface PromoCodeDetails extends PromoCodeItem {
  usages: PromoCodeUsageItem[];
}

export interface PromoCodeStats {
  total: number;
  active: number;
  expired: number;
  totalUsages: number;
  totalDiscountGiven: number;
}

export interface CreatePromoCodeDto {
  code: string;
  type: PromoCodeType;
  discount: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  minPurchaseAmount?: number;
  validFrom: string;
  validUntil: string;
  applicableTo?: PromoCodeApplicableTo;
  courseIds?: string[];
  description?: string;
}
