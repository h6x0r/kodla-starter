import { api } from "@/lib/api";
import type {
  PromoCodesListResponse,
  PromoCodeDetails,
  PromoCodeItem,
  PromoCodeStats,
  CreatePromoCodeDto,
} from "../types";

export const adminPromoCodesService = {
  getPromoCodes: async (params?: {
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<PromoCodesListResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.offset) searchParams.append("offset", params.offset.toString());
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return await api.get<PromoCodesListResponse>(`/admin/promocodes${query}`);
  },

  getPromoCodeStats: async (): Promise<PromoCodeStats> => {
    return await api.get<PromoCodeStats>("/admin/promocodes/stats");
  },

  getPromoCodeById: async (promoCodeId: string): Promise<PromoCodeDetails> => {
    return await api.get<PromoCodeDetails>(`/admin/promocodes/${promoCodeId}`);
  },

  createPromoCode: async (dto: CreatePromoCodeDto): Promise<PromoCodeItem> => {
    return await api.post<PromoCodeItem>("/admin/promocodes", dto);
  },

  updatePromoCode: async (
    promoCodeId: string,
    updates: Partial<Omit<CreatePromoCodeDto, "code">>
  ): Promise<PromoCodeItem> => {
    return await api.post<PromoCodeItem>(
      `/admin/promocodes/${promoCodeId}/update`,
      updates
    );
  },

  activatePromoCode: async (promoCodeId: string): Promise<PromoCodeItem> => {
    return await api.post<PromoCodeItem>(
      `/admin/promocodes/${promoCodeId}/activate`,
      {}
    );
  },

  deactivatePromoCode: async (promoCodeId: string): Promise<PromoCodeItem> => {
    return await api.post<PromoCodeItem>(
      `/admin/promocodes/${promoCodeId}/deactivate`,
      {}
    );
  },

  deletePromoCode: async (promoCodeId: string): Promise<{ success: boolean }> => {
    return await api.delete<{ success: boolean }>(`/admin/promocodes/${promoCodeId}`);
  },
};
