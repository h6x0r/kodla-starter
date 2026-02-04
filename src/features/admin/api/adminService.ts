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
  isBanned: boolean;
  bannedAt: string | null;
  bannedReason: string | null;
  createdAt: string;
  lastActivityAt: string | null;
  submissionsCount: number;
  coursesCount: number;
}

// User Details (full profile)
export interface UserDetails extends UserSearchResult {
  bannedBy: string | null;
  xp: number;
  level: number;
  currentStreak: number;
  bugReportsCount: number;
}

// Banned Users Response
export interface BannedUsersResponse {
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    bannedAt: string;
    bannedReason: string | null;
    bannedBy: string | null;
    createdAt: string;
  }>;
  total: number;
}

// Ban User Response
export interface BanUserResponse {
  id: string;
  email: string;
  name: string | null;
  isBanned: boolean;
  bannedAt: string;
  bannedReason: string;
}

// ============================================
// PAYMENTS MANAGEMENT (Admin Panel Phase 2.2)
// ============================================

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

  /**
   * Get user details by ID
   * GET /admin/analytics/users/:id
   */
  getUserById: async (userId: string): Promise<UserDetails> => {
    return await api.get<UserDetails>(`/admin/analytics/users/${userId}`);
  },

  /**
   * Get list of banned users
   * GET /admin/analytics/users/banned/list
   */
  getBannedUsers: async (
    limit = 50,
    offset = 0,
  ): Promise<BannedUsersResponse> => {
    return await api.get<BannedUsersResponse>(
      `/admin/analytics/users/banned/list?limit=${limit}&offset=${offset}`,
    );
  },

  /**
   * Ban a user
   * POST /admin/analytics/users/:id/ban
   */
  banUser: async (userId: string, reason: string): Promise<BanUserResponse> => {
    return await api.post<BanUserResponse>(
      `/admin/analytics/users/${userId}/ban`,
      { reason },
    );
  },

  /**
   * Unban a user
   * POST /admin/analytics/users/:id/unban
   */
  unbanUser: async (
    userId: string,
  ): Promise<{ id: string; isBanned: boolean }> => {
    return await api.post<{ id: string; isBanned: boolean }>(
      `/admin/analytics/users/${userId}/unban`,
      {},
    );
  },

  // ============================================
  // PAYMENTS MANAGEMENT (Admin Panel Phase 2.2)
  // ============================================

  /**
   * Get all payments with filtering
   * GET /admin/analytics/payments
   */
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
    return await api.get<PaymentsListResponse>(
      `/admin/analytics/payments${query}`,
    );
  },

  /**
   * Get revenue analytics
   * GET /admin/analytics/payments/revenue
   */
  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    return await api.get<RevenueAnalytics>("/admin/analytics/payments/revenue");
  },

  /**
   * Get payment details by ID
   * GET /admin/analytics/payments/:id
   */
  getPaymentById: async (paymentId: string): Promise<PaymentDetails> => {
    return await api.get<PaymentDetails>(
      `/admin/analytics/payments/${paymentId}`,
    );
  },

  /**
   * Refund a payment
   * POST /admin/analytics/payments/:id/refund
   */
  refundPayment: async (
    paymentId: string,
    reason: string,
  ): Promise<PaymentItem> => {
    return await api.post<PaymentItem>(
      `/admin/analytics/payments/${paymentId}/refund`,
      { reason },
    );
  },

  /**
   * Get all one-time purchases
   * GET /admin/analytics/purchases
   */
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
    return await api.get<PurchasesListResponse>(
      `/admin/analytics/purchases${query}`,
    );
  },

  /**
   * Get all subscriptions with filtering
   * GET /admin/analytics/subscriptions/list
   */
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
    return await api.get<SubscriptionsListResponse>(
      `/admin/analytics/subscriptions/list${query}`,
    );
  },

  /**
   * Get all subscription plans
   * GET /admin/analytics/subscriptions/plans
   */
  getSubscriptionPlans: async (): Promise<SubscriptionPlanItem[]> => {
    return await api.get<SubscriptionPlanItem[]>(
      "/admin/analytics/subscriptions/plans",
    );
  },

  /**
   * Extend subscription manually
   * POST /admin/analytics/subscriptions/:id/extend
   */
  extendSubscription: async (
    subscriptionId: string,
    days: number,
  ): Promise<SubscriptionItem> => {
    return await api.post<SubscriptionItem>(
      `/admin/analytics/subscriptions/${subscriptionId}/extend`,
      { days },
    );
  },

  /**
   * Cancel subscription manually
   * POST /admin/analytics/subscriptions/:id/cancel
   */
  cancelSubscription: async (
    subscriptionId: string,
  ): Promise<SubscriptionItem> => {
    return await api.post<SubscriptionItem>(
      `/admin/analytics/subscriptions/${subscriptionId}/cancel`,
      {},
    );
  },
};
