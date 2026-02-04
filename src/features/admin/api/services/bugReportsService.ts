import { api } from "@/lib/api";
import type { BugReport, BugStatus, BugSeverity, BugCategory } from "../types";

export const adminBugReportsService = {
  getBugReports: async (filters?: {
    status?: BugStatus;
    severity?: BugSeverity;
    category?: BugCategory;
  }): Promise<BugReport[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.severity) params.append("severity", filters.severity);
    if (filters?.category) params.append("category", filters.category);
    const query = params.toString() ? `?${params.toString()}` : "";
    return await api.get<BugReport[]>(`/bugreports${query}`);
  },

  updateBugReportStatus: async (id: string, status: BugStatus): Promise<BugReport> => {
    return await api.patch<BugReport>(`/bugreports/${id}/status`, { status });
  },
};
