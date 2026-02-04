import { api } from "@/lib/api";

// Dashboard Stats (matches backend response)
export interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  premiumUsers: number;
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// Course Analytics (matches backend response)
export interface CourseAnalyticsItem {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  category: string;
  totalEnrolled: number;
  completed: number;
  completionRate: number;
  averageProgress: number;
  translations?: Record<
    string,
    { title?: string; description?: string }
  > | null;
}

export interface CourseAnalyticsResponse {
  courses: CourseAnalyticsItem[];
  totalCourses: number;
}

// Task Analytics (matches backend response)
export interface TaskAnalyticsItem {
  taskId: string;
  taskSlug: string;
  taskTitle: string;
  difficulty: string;
  isPremium: boolean;
  totalSubmissions: number;
  acceptedSubmissions: number;
  uniqueUsers: number;
  passRate: number;
}

export interface TaskAnalyticsResponse {
  hardestTasks: TaskAnalyticsItem[];
  mostPopularTasks: TaskAnalyticsItem[];
  totalTasks: number;
  tasksWithSubmissions: number;
}

// Submission Stats (matches backend response)
export interface SubmissionStatusStat {
  status: string;
  count: number;
  percentage: number;
}

export interface SubmissionStatsResponse {
  totalSubmissions: number;
  recentSubmissions: number;
  byStatus: SubmissionStatusStat[];
  dailySubmissions: Record<string, number>;
}

// Plan stat from backend
export interface PlanStat {
  planId: string;
  planName: string;
  planSlug: string;
  planType: string;
  count: number;
  monthlyRevenue: number;
}

// Subscription Stats (matches backend response)
export interface SubscriptionStats {
  activeSubscriptions: number;
  newSubscriptionsThisMonth: number;
  byPlan: PlanStat[];
  totalMonthlyRevenue: number;
  completedPayments: number;
  totalRevenue: number;
}

// AI Usage Stats
export interface AiUsageStats {
  totalQueries: number;
  avgQueriesPerUser: number;
  topicBreakdown: Array<{
    topic: string;
    count: number;
  }>;
  dailyUsage: Array<{
    date: string;
    count: number;
  }>;
}

// AI Settings (matches backend SettingsService)
export interface AiLimits {
  free: number;
  course: number;
  premium: number;
  promptEngineering: number;
}

export interface AiSettings {
  enabled: boolean;
  limits: AiLimits;
}

export interface UpdateAiSettingsDto {
  enabled?: boolean;
  limits?: Partial<AiLimits>;
}

// Bug Reports
export type BugCategory =
  | "description"
  | "solution"
  | "editor"
  | "hints"
  | "ai-tutor"
  | "other";
export type BugSeverity = "low" | "medium" | "high";
export type BugStatus =
  | "open"
  | "in-progress"
  | "resolved"
  | "closed"
  | "wont-fix";

export interface BugReport {
  id: string;
  userId: string;
  taskId: string | null;
  category: BugCategory;
  severity: BugSeverity;
  status: BugStatus;
  title: string;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
  task: { title: string; slug: string } | null;
}

// User Search Result
export interface UserSearchResult {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isPremium: boolean;
  createdAt: string;
  lastActivityAt: string | null;
  submissionsCount: number;
  coursesCount: number;
}

/**
 * Admin Analytics Service - Connected to Backend Admin API
 *
 * All endpoints require admin role authentication
 */
export const adminService = {
  /**
   * Get dashboard overview stats
   * GET /admin/analytics/dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    return await api.get<DashboardStats>("/admin/analytics/dashboard");
  },

  /**
   * Get course analytics
   * GET /admin/analytics/courses
   */
  getCourseAnalytics: async (): Promise<CourseAnalyticsResponse> => {
    return await api.get<CourseAnalyticsResponse>("/admin/analytics/courses");
  },

  /**
   * Get task analytics
   * GET /admin/analytics/tasks
   */
  getTaskAnalytics: async (): Promise<TaskAnalyticsResponse> => {
    return await api.get<TaskAnalyticsResponse>("/admin/analytics/tasks");
  },

  /**
   * Get submission statistics
   * GET /admin/analytics/submissions
   */
  getSubmissionStats: async (): Promise<SubmissionStatsResponse> => {
    return await api.get<SubmissionStatsResponse>(
      "/admin/analytics/submissions",
    );
  },

  /**
   * Get subscription statistics
   * GET /admin/analytics/subscriptions
   */
  getSubscriptionStats: async (): Promise<SubscriptionStats> => {
    return await api.get<SubscriptionStats>("/admin/analytics/subscriptions");
  },

  /**
   * Get AI usage statistics
   * GET /admin/analytics/ai-usage
   */
  getAiUsageStats: async (): Promise<AiUsageStats> => {
    return await api.get<AiUsageStats>("/admin/analytics/ai-usage");
  },

  /**
   * Get AI Tutor settings
   * GET /admin/settings/ai
   */
  getAiSettings: async (): Promise<AiSettings> => {
    return await api.get<AiSettings>("/admin/settings/ai");
  },

  /**
   * Update AI Tutor settings
   * PUT /admin/settings/ai
   */
  updateAiSettings: async (dto: UpdateAiSettingsDto): Promise<AiSettings> => {
    return await api.put<AiSettings>("/admin/settings/ai", dto);
  },

  /**
   * Get all bug reports
   * GET /bugreports
   */
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

  /**
   * Update bug report status
   * PATCH /bugreports/:id/status
   */
  updateBugReportStatus: async (
    id: string,
    status: BugStatus,
  ): Promise<BugReport> => {
    return await api.patch<BugReport>(`/bugreports/${id}/status`, { status });
  },

  /**
   * Search users by email or name
   * GET /admin/analytics/users/search?q=query
   */
  searchUsers: async (query: string): Promise<UserSearchResult[]> => {
    if (!query || query.length < 2) return [];
    return await api.get<UserSearchResult[]>(
      `/admin/analytics/users/search?q=${encodeURIComponent(query)}`,
    );
  },
};
