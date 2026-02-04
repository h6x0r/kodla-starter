import { api } from "@/lib/api";
import type {
  DashboardStats,
  CourseAnalyticsResponse,
  TaskAnalyticsResponse,
  SubmissionStatsResponse,
  SubscriptionStats,
  AnalyticsTimelineResponse,
  AiUsageStats,
} from "../types";

export const adminAnalyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await api.get<DashboardStats>("/admin/analytics/dashboard");
  },

  getCourseAnalytics: async (): Promise<CourseAnalyticsResponse> => {
    return await api.get<CourseAnalyticsResponse>("/admin/analytics/courses");
  },

  getTaskAnalytics: async (): Promise<TaskAnalyticsResponse> => {
    return await api.get<TaskAnalyticsResponse>("/admin/analytics/tasks");
  },

  getSubmissionStats: async (): Promise<SubmissionStatsResponse> => {
    return await api.get<SubmissionStatsResponse>("/admin/analytics/submissions");
  },

  getSubscriptionStats: async (): Promise<SubscriptionStats> => {
    return await api.get<SubscriptionStats>("/admin/analytics/subscriptions");
  },

  getAiUsageStats: async (): Promise<AiUsageStats> => {
    return await api.get<AiUsageStats>("/admin/analytics/ai-usage");
  },

  getAnalyticsTimeline: async (days: number = 30): Promise<AnalyticsTimelineResponse> => {
    return await api.get<AnalyticsTimelineResponse>(`/admin/analytics/timeline?days=${days}`);
  },
};
