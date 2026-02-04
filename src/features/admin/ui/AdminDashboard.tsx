import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  adminService,
  DashboardStats,
  CourseAnalyticsItem,
  TaskAnalyticsItem,
  SubmissionStatusStat,
  SubscriptionStats,
} from "../api/adminService";

// Subscription plan stats interface
interface PlanStat {
  planId: string;
  planName: string;
  planSlug: string;
  planType: string;
  count: number;
  monthlyRevenue: number;
}
import { AuthContext } from "@/components/Layout";
import { Link, Navigate } from "react-router-dom";
import { createLogger } from "@/lib/logger";
import { useUITranslation, useLanguage } from "@/contexts/LanguageContext";
import AiSettingsPanel from "./AiSettingsPanel";
import BugReportsPanel from "./BugReportsPanel";
import UserSearchPanel from "./UserSearchPanel";
import PaymentsPanel from "./PaymentsPanel";

const log = createLogger("AdminDashboard");

// Status colors for submissions (matches backend status values)
const STATUS_COLORS: Record<string, string> = {
  passed: "#22c55e", // Green
  failed: "#ef4444", // Red
  error: "#f97316", // Orange
  timeout: "#eab308", // Yellow
  compileError: "#a855f7", // Purple
  pending: "#6b7280", // Gray
};

// Status label keys for translations
const STATUS_LABEL_KEYS: Record<string, string> = {
  passed: "admin.statusPassed",
  failed: "admin.statusFailed",
  error: "admin.statusError",
  timeout: "admin.statusTimeout",
  compileError: "admin.statusCompileError",
  pending: "admin.statusPending",
};

// Abbreviate long course names for chart labels
const abbreviateCourseName = (name: string): string => {
  // Map of common words to abbreviations
  const abbrevMap: Record<string, string> = {
    Fundamentals: "Fund.",
    Advanced: "Adv.",
    Engineering: "Eng.",
    Patterns: "Pat.",
    Production: "Prod.",
    Concurrency: "Conc.",
    Inference: "Inf.",
  };

  let result = name;

  // Apply abbreviations
  Object.entries(abbrevMap).forEach(([full, abbr]) => {
    result = result.replace(full, abbr);
  });

  // If still too long (>20 chars), truncate with ellipsis
  if (result.length > 20) {
    result = result.substring(0, 17) + "...";
  }

  return result;
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { tUI } = useUITranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);

  // Helper to get localized course title
  const getLocalizedTitle = (course: CourseAnalyticsItem): string => {
    if (language === "en") return course.courseTitle;
    const translations = course.translations;
    if (translations && translations[language]?.title) {
      return translations[language].title;
    }
    return course.courseTitle; // Fallback to English
  };

  // Data States
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalyticsItem[]>(
    [],
  );
  const [hardestTasks, setHardestTasks] = useState<TaskAnalyticsItem[]>([]);
  const [mostPopularTasks, setMostPopularTasks] = useState<TaskAnalyticsItem[]>(
    [],
  );
  const [submissionsByStatus, setSubmissionsByStatus] = useState<
    SubmissionStatusStat[]
  >([]);
  const [dailySubmissions, setDailySubmissions] = useState<
    { date: string; count: number }[]
  >([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [subscriptionStats, setSubscriptionStats] = useState<{
    activeSubscriptions: number;
    newSubscriptionsThisMonth: number;
    byPlan: PlanStat[];
    totalMonthlyRevenue: number;
  } | null>(null);

  // Check admin access
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-dark-surface rounded-2xl flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {tUI("admin.loginRequired")}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
          {tUI("admin.loginRequiredDesc")}
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
        >
          {tUI("nav.login")}
        </Link>
      </div>
    );
  }

  // Redirect if not admin
  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Load all analytics data
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      setLoading(true);
      Promise.all([
        adminService.getDashboardStats(),
        adminService.getCourseAnalytics(),
        adminService.getTaskAnalytics(),
        adminService.getSubmissionStats(),
        adminService.getSubscriptionStats(),
      ])
        .then(
          ([
            stats,
            coursesResponse,
            tasksResponse,
            submissionsResponse,
            subscriptionsResponse,
          ]) => {
            setDashboardStats(stats);
            setCourseAnalytics(coursesResponse.courses || []);
            setHardestTasks(tasksResponse.hardestTasks || []);
            setMostPopularTasks(tasksResponse.mostPopularTasks || []);
            setSubmissionsByStatus(submissionsResponse.byStatus || []);
            setTotalSubmissions(submissionsResponse.totalSubmissions || 0);
            setSubscriptionStats(subscriptionsResponse as any);

            // Convert dailySubmissions object to array
            const dailyData = Object.entries(
              submissionsResponse.dailySubmissions || {},
            )
              .map(([date, count]) => ({ date, count }))
              .sort((a, b) => a.date.localeCompare(b.date));
            setDailySubmissions(dailyData);

            setLoading(false);
          },
        )
        .catch((error) => {
          log.error("Failed to load admin analytics", error);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        {tUI("admin.loading")}
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
          {tUI("admin.title")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {tUI("admin.subtitle")}
        </p>
      </div>

      {/* Settings & Reports Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiSettingsPanel />
        <BugReportsPanel />
      </div>

      {/* User Search */}
      <UserSearchPanel />

      {/* Payments Management */}
      <PaymentsPanel />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: tUI("admin.totalUsers"),
            value: dashboardStats?.totalUsers.toLocaleString() || "0",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ),
          },
          {
            label: tUI("admin.newUsers"),
            value: dashboardStats?.newUsers.toLocaleString() || "0",
            color: "text-green-500",
            bg: "bg-green-500/10",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            ),
          },
          {
            label: tUI("admin.activeUsers"),
            value: dashboardStats?.activeUsers.monthly.toLocaleString() || "0",
            color: "text-brand-500",
            bg: "bg-brand-500/10",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            ),
          },
          {
            label: tUI("admin.totalSubmissions"),
            value: totalSubmissions.toLocaleString(),
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ),
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                {stat.label}
              </div>
              <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Statistics */}
      {subscriptionStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.activeSubscriptions")}
              </h3>
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
              {subscriptionStats.activeSubscriptions}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              +{subscriptionStats.newSubscriptionsThisMonth}{" "}
              {tUI("admin.thisMonth")}
            </div>
          </div>

          {/* Subscriptions by Type - Grouped with fixed height scroll */}
          <div
            className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
            style={{ height: "280px" }}
          >
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex-shrink-0">
              {tUI("admin.subscriptionsByPlan")}
            </h3>
            {subscriptionStats.byPlan.length > 0 ? (
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {/* Global Plans */}
                {(() => {
                  const globalPlans = subscriptionStats.byPlan.filter(
                    (p) => p.planType === "global",
                  );
                  if (globalPlans.length === 0) return null;
                  return (
                    <div>
                      <div className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-2 flex items-center gap-2 sticky top-0 bg-white dark:bg-dark-surface py-1">
                        <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                        {tUI("admin.globalAccess")} (
                        {globalPlans.reduce((sum, p) => sum + p.count, 0)})
                      </div>
                      <div className="space-y-2">
                        {globalPlans.map((plan) => (
                          <div
                            key={plan.planId}
                            className="flex items-center justify-between p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">
                              {plan.planName}
                            </div>
                            <div className="font-bold text-brand-600 dark:text-brand-400">
                              {plan.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Course Plans - All visible with scroll */}
                {(() => {
                  const coursePlans = subscriptionStats.byPlan
                    .filter((p) => p.planType === "course")
                    .sort((a, b) => b.count - a.count);
                  if (coursePlans.length === 0) return null;
                  return (
                    <div>
                      <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-2 sticky top-0 bg-white dark:bg-dark-surface py-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        {tUI("admin.courseAccess")} (
                        {coursePlans.reduce((sum, p) => sum + p.count, 0)})
                      </div>
                      <div className="space-y-2">
                        {coursePlans.map((plan) => (
                          <div
                            key={plan.planId}
                            className="flex items-center justify-between p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
                          >
                            <div
                              className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[200px]"
                              title={plan.planName}
                            >
                              {plan.planName}
                            </div>
                            <div className="font-bold text-purple-600 dark:text-purple-400 text-sm">
                              {plan.count}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                {tUI("admin.noActiveSubscriptions")}
              </div>
            )}
          </div>

          {/* Monthly Revenue */}
          <div className="bg-gradient-to-br from-brand-600 to-purple-600 p-6 rounded-2xl shadow-lg text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/80 uppercase tracking-wider">
                {tUI("admin.monthlyRevenue")}
              </h3>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-display font-bold">
              {(subscriptionStats.totalMonthlyRevenue / 100).toLocaleString()}{" "}
              <span className="text-lg">UZS</span>
            </div>
            <div className="text-sm text-white/70 mt-1">
              {tUI("admin.estimatedMonthly")}
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions by Status - Modern Card Grid */}
        <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {tUI("admin.submissionsByStatus")}
          </h2>
          {submissionsByStatus.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {submissionsByStatus.map((stat) => {
                const color = STATUS_COLORS[stat.status] || "#6366f1";
                const labelKey = STATUS_LABEL_KEYS[stat.status];
                const label = labelKey ? tUI(labelKey) : stat.status;
                const bgColor = `${color}15`; // 15% opacity
                return (
                  <div
                    key={stat.status}
                    className="relative p-4 rounded-2xl transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: bgColor }}
                  >
                    <div
                      className="absolute top-3 right-3 w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div
                      className="text-2xl font-display font-bold"
                      style={{ color }}
                    >
                      {stat.count.toLocaleString()}
                    </div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      {label}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {stat.percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {tUI("admin.noSubmissions")}
            </div>
          )}
        </div>

        {/* Submissions by Day (Line Chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {tUI("admin.submissionsByDay")}
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySubmissions}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#3f3f46"
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ stroke: "#FF6B35", strokeWidth: 2 }}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderRadius: "12px",
                    border: "1px solid #27272a",
                    color: "#fff",
                  }}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: "#FF6B35", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Course Popularity - Modern Table with fixed height scroll */}
      <div
        className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
        style={{ height: "420px" }}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex-shrink-0">
          {tUI("admin.coursePopularity")}
        </h2>
        {courseAnalytics.length > 0 ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header Row */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3 mb-2 pr-4">
              <div className="flex items-center gap-4">
                <div className="w-10" /> {/* Spacer for rank */}
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {tUI("admin.course")}
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-20 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {tUI("admin.enrolled")}
                </div>
                <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {tUI("admin.completed")}
                </div>
              </div>
            </div>
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {[...courseAnalytics]
                  .sort((a, b) => {
                    // Primary: by total enrolled (descending)
                    if (b.totalEnrolled !== a.totalEnrolled) {
                      return b.totalEnrolled - a.totalEnrolled;
                    }
                    // Secondary: by completion rate (descending) for equal enrollments
                    return b.completionRate - a.completionRate;
                  })
                  .map((course, index) => {
                    const medal =
                      index === 0
                        ? "🥇"
                        : index === 1
                          ? "🥈"
                          : index === 2
                            ? "🥉"
                            : null;
                    return (
                      <div
                        key={course.courseId}
                        className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/30 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          {/* Rank */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              index < 3
                                ? "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-amber-700 dark:text-amber-400"
                                : "bg-gray-100 dark:bg-dark-bg text-gray-500"
                            }`}
                          >
                            {medal || index + 1}
                          </div>
                          {/* Course Info */}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                              {getLocalizedTitle(course)}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {course.category}
                            </span>
                          </div>
                        </div>
                        {/* Stats */}
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="w-20 text-center text-lg font-bold text-brand-500">
                            {course.totalEnrolled}
                          </div>
                          <div
                            className={`w-24 text-center text-lg font-bold ${course.completionRate >= 50 ? "text-green-500" : "text-amber-500"}`}
                          >
                            {course.completionRate.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {tUI("admin.noEnrollmentData")}
          </div>
        )}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Courses by Completion - with fixed height scroll */}
        <div
          className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
          style={{ height: "380px" }}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex-shrink-0">
            {tUI("admin.topCoursesByCompletion")}
          </h2>
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header Row */}
            <div className="flex items-center border-b border-gray-100 dark:border-dark-border pb-3 mb-2">
              <div className="flex-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.course")}
              </div>
              <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.completions")}
              </div>
              <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.rate")}
              </div>
            </div>
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {[...courseAnalytics]
                  .sort((a, b) => b.completionRate - a.completionRate)
                  .map((course) => (
                    <div
                      key={course.courseId}
                      className="flex items-center py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors -mx-2 px-2 rounded-lg"
                    >
                      <div className="flex-1 text-sm text-gray-900 dark:text-white font-medium truncate pr-4">
                        {getLocalizedTitle(course)}
                      </div>
                      <div className="w-24 text-center text-sm text-gray-600 dark:text-gray-300">
                        {course.completed}
                      </div>
                      <div className="w-24 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          {course.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Hardest Tasks - with fixed height scroll */}
        <div
          className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
          style={{ height: "380px" }}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex-shrink-0">
            {tUI("admin.hardestTasks")}
          </h2>
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header Row */}
            <div className="flex items-center border-b border-gray-100 dark:border-dark-border pb-3 mb-2">
              <div className="flex-1 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.task")}
              </div>
              <div className="w-24 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.submissions")}
              </div>
              <div className="w-28 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {tUI("admin.passRate")}
              </div>
            </div>
            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {[...hardestTasks]
                  .sort((a, b) => {
                    // Primary: by pass rate (ascending - lowest first)
                    if (a.passRate !== b.passRate) {
                      return a.passRate - b.passRate;
                    }
                    // Secondary: by total submissions (descending - more data = more reliable)
                    return b.totalSubmissions - a.totalSubmissions;
                  })
                  .map((task) => (
                    <div
                      key={task.taskId}
                      className="flex items-center py-3 hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors -mx-2 px-2 rounded-lg"
                    >
                      <div className="flex-1 text-sm text-gray-900 dark:text-white font-medium truncate pr-4">
                        {task.taskTitle}
                      </div>
                      <div className="w-24 text-center text-sm text-gray-600 dark:text-gray-300">
                        {task.totalSubmissions}
                      </div>
                      <div className="w-28 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            task.passRate < 30
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : task.passRate < 60
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          }`}
                        >
                          {task.passRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
