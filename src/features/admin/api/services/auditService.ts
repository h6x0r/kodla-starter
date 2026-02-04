import { api } from "@/lib/api";
import type { AuditLogsResponse, AuditLogsFilters, AuditLogEntry } from "../types";

export const adminAuditService = {
  getAuditLogs: async (
    filters?: AuditLogsFilters,
    page: number = 1,
    limit: number = 50
  ): Promise<AuditLogsResponse> => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    if (filters?.action) params.append("action", filters.action);
    if (filters?.entity) params.append("entity", filters.entity);
    if (filters?.adminId) params.append("adminId", filters.adminId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    return await api.get<AuditLogsResponse>(`/admin/audit/logs?${params.toString()}`);
  },

  getRecentAuditLogs: async (limit: number = 10): Promise<AuditLogEntry[]> => {
    return await api.get<AuditLogEntry[]>(`/admin/audit/recent?limit=${limit}`);
  },
};
