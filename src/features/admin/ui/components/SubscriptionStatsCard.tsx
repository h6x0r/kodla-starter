import React from "react";
import { useUITranslation } from "@/contexts/LanguageContext";

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

interface SubscriptionStatsCardProps {
  stats: SubscriptionStats;
}

/**
 * Active subscriptions count card
 */
export const ActiveSubscriptionsCard: React.FC<
  Pick<SubscriptionStats, "activeSubscriptions" | "newSubscriptionsThisMonth">
> = ({ activeSubscriptions, newSubscriptionsThisMonth }) => {
  const { tUI } = useUITranslation();

  return (
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
        {activeSubscriptions}
      </div>
      <div className="text-sm text-gray-500 mt-1">
        +{newSubscriptionsThisMonth} {tUI("admin.thisMonth")}
      </div>
    </div>
  );
};

/**
 * Subscriptions breakdown by plan type
 */
export const SubscriptionsByPlanCard: React.FC<{ plans: PlanStat[] }> = ({
  plans,
}) => {
  const { tUI } = useUITranslation();

  const globalPlans = plans.filter((p) => p.planType === "global");
  const coursePlans = plans
    .filter((p) => p.planType === "course")
    .sort((a, b) => b.count - a.count);

  return (
    <div
      className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm flex flex-col"
      style={{ height: "280px" }}
    >
      <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex-shrink-0">
        {tUI("admin.subscriptionsByPlan")}
      </h3>
      {plans.length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {/* Global Plans */}
          {globalPlans.length > 0 && (
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
          )}

          {/* Course Plans */}
          {coursePlans.length > 0 && (
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
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          {tUI("admin.noActiveSubscriptions")}
        </div>
      )}
    </div>
  );
};

/**
 * Monthly revenue card with gradient background
 */
export const MonthlyRevenueCard: React.FC<{ totalMonthlyRevenue: number }> = ({
  totalMonthlyRevenue,
}) => {
  const { tUI } = useUITranslation();

  return (
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
        {(totalMonthlyRevenue / 100).toLocaleString()}{" "}
        <span className="text-lg">UZS</span>
      </div>
      <div className="text-sm text-white/70 mt-1">
        {tUI("admin.estimatedMonthly")}
      </div>
    </div>
  );
};

/**
 * Combined subscription stats section
 */
const SubscriptionStatsSection: React.FC<SubscriptionStatsCardProps> = ({
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <ActiveSubscriptionsCard
        activeSubscriptions={stats.activeSubscriptions}
        newSubscriptionsThisMonth={stats.newSubscriptionsThisMonth}
      />
      <SubscriptionsByPlanCard plans={stats.byPlan} />
      <MonthlyRevenueCard totalMonthlyRevenue={stats.totalMonthlyRevenue} />
    </div>
  );
};

export default SubscriptionStatsSection;
