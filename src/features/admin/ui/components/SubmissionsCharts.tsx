import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUITranslation } from "@/contexts/LanguageContext";
import { SubmissionStatusStat } from "../../api/adminService";

// Status colors for submissions
const STATUS_COLORS: Record<string, string> = {
  passed: "#22c55e",
  failed: "#ef4444",
  error: "#f97316",
  timeout: "#eab308",
  compileError: "#a855f7",
  pending: "#6b7280",
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

interface SubmissionsByStatusCardProps {
  data: SubmissionStatusStat[];
}

/**
 * Submissions by status - card grid visualization
 */
export const SubmissionsByStatusCard: React.FC<SubmissionsByStatusCardProps> = ({
  data,
}) => {
  const { tUI } = useUITranslation();

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {tUI("admin.submissionsByStatus")}
      </h2>
      {data.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {data.map((stat) => {
            const color = STATUS_COLORS[stat.status] || "#6366f1";
            const labelKey = STATUS_LABEL_KEYS[stat.status];
            const label = labelKey ? tUI(labelKey) : stat.status;
            const bgColor = `${color}15`;
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
  );
};

interface DailySubmissionsChartProps {
  data: { date: string; count: number }[];
}

/**
 * Daily submissions line chart
 */
export const DailySubmissionsChart: React.FC<DailySubmissionsChartProps> = ({
  data,
}) => {
  const { tUI } = useUITranslation();

  return (
    <div className="lg:col-span-2 bg-white dark:bg-dark-surface p-6 rounded-3xl border border-gray-100 dark:border-dark-border shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        {tUI("admin.submissionsByDay")}
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
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
  );
};

interface SubmissionsChartsRowProps {
  byStatus: SubmissionStatusStat[];
  dailySubmissions: { date: string; count: number }[];
}

/**
 * Combined submissions charts row
 */
const SubmissionsChartsRow: React.FC<SubmissionsChartsRowProps> = ({
  byStatus,
  dailySubmissions,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <SubmissionsByStatusCard data={byStatus} />
      <DailySubmissionsChart data={dailySubmissions} />
    </div>
  );
};

export default SubmissionsChartsRow;
