import React, { useState, useEffect, useContext } from "react";
import {
  adminService,
  DashboardStats,
  CourseAnalyticsItem,
  TaskAnalyticsItem,
  SubmissionStatusStat,
} from "../api/adminService";
import { AuthContext } from "@/components/Layout";
import { Link, Navigate } from "react-router-dom";
import { createLogger } from "@/lib/logger";
import { useUITranslation } from "@/contexts/LanguageContext";

// Panels
import AiSettingsPanel from "./AiSettingsPanel";
import BugReportsPanel from "./BugReportsPanel";
import UserSearchPanel from "./UserSearchPanel";
import PaymentsPanel from "./PaymentsPanel";
import PromoCodesPanel from "./PromoCodesPanel";
import AnalyticsPanel from "./AnalyticsPanel";
import AuditLogsPanel from "./AuditLogsPanel";
import ExportPanel from "./ExportPanel";

// Extracted components
import {
  StatsCard,
  SubscriptionStatsSection,
  SubmissionsChartsRow,
  CoursePopularityTable,
  TaskAnalyticsTablesRow,
} from "./components";

const log = createLogger("AdminDashboard");

// Subscription plan stats interface
interface PlanStat {
  planId: string;
  planName: string;
  planSlug: string;
  planType: string;
  count: number;
  monthlyRevenue: number;
}

interface SubscriptionStats {
  activeSubscriptions: number;
  newSubscriptionsThisMonth: number;
  byPlan: PlanStat[];
  totalMonthlyRevenue: number;
}

// Stats card configuration
const getStatsCardsConfig = (
  tUI: (key: string) => string,
  dashboardStats: DashboardStats | null,
  totalSubmissions: number,
) => [
  {
    label: tUI("admin.totalUsers"),
    value: dashboardStats?.totalUsers ?? 0,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
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
    value: dashboardStats?.newUsers ?? 0,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
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
    value: dashboardStats?.activeUsers.monthly ?? 0,
    color: "text-brand-500",
    bgColor: "bg-brand-500/10",
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
    value: totalSubmissions,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
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
];

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { tUI } = useUITranslation();
  const [loading, setLoading] = useState(true);

  // Data States
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalyticsItem[]>(
    [],
  );
  const [hardestTasks, setHardestTasks] = useState<TaskAnalyticsItem[]>([]);
  const [submissionsByStatus, setSubmissionsByStatus] = useState<
    SubmissionStatusStat[]
  >([]);
  const [dailySubmissions, setDailySubmissions] = useState<
    { date: string; count: number }[]
  >([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [subscriptionStats, setSubscriptionStats] =
    useState<SubscriptionStats | null>(null);

  // Check admin access
  if (!user) {
    return <LoginRequiredView tUI={tUI} />;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  // Load all analytics data
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [
        stats,
        coursesResponse,
        tasksResponse,
        submissionsResponse,
        subscriptionsResponse,
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getCourseAnalytics(),
        adminService.getTaskAnalytics(),
        adminService.getSubmissionStats(),
        adminService.getSubscriptionStats(),
      ]);

      setDashboardStats(stats);
      setCourseAnalytics(coursesResponse.courses || []);
      setHardestTasks(tasksResponse.hardestTasks || []);
      setSubmissionsByStatus(submissionsResponse.byStatus || []);
      setTotalSubmissions(submissionsResponse.totalSubmissions || 0);
      setSubscriptionStats(subscriptionsResponse as SubscriptionStats);

      // Convert dailySubmissions object to array
      const dailyData = Object.entries(
        submissionsResponse.dailySubmissions || {},
      )
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setDailySubmissions(dailyData);
    } catch (error) {
      log.error("Failed to load admin analytics", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 animate-pulse">
        {tUI("admin.loading")}
      </div>
    );
  }

  const statsCards = getStatsCardsConfig(tUI, dashboardStats, totalSubmissions);

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

      {/* Promo Codes */}
      <PromoCodesPanel />

      {/* Audit Logs & Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AuditLogsPanel />
        <ExportPanel />
      </div>

      {/* Analytics Timeline (DAU/WAU/MAU, Revenue) */}
      <AnalyticsPanel dashboardStats={dashboardStats} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, i) => (
          <StatsCard
            key={i}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            bgColor={stat.bgColor}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Subscription Statistics */}
      {subscriptionStats && (
        <SubscriptionStatsSection stats={subscriptionStats} />
      )}

      {/* Submissions Charts Row */}
      <SubmissionsChartsRow
        byStatus={submissionsByStatus}
        dailySubmissions={dailySubmissions}
      />

      {/* Course Popularity Table */}
      <CoursePopularityTable courses={courseAnalytics} />

      {/* Task Analytics Tables Row */}
      <TaskAnalyticsTablesRow
        hardestTasks={hardestTasks}
        courses={courseAnalytics}
      />
    </div>
  );
};

// Login required view component
const LoginRequiredView: React.FC<{ tUI: (key: string) => string }> = ({
  tUI,
}) => (
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

export default AdminDashboard;
