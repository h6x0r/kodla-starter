import React, { ReactNode } from "react";

export interface StatsCardProps {
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
  icon: ReactNode;
}

/**
 * Reusable stats card component for admin dashboard
 */
const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  color,
  bgColor,
  icon,
}) => {
  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      <div>
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
          {label}
        </div>
        <div className="text-3xl font-display font-bold text-gray-900 dark:text-white">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </div>
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${bgColor} ${color}`}
      >
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
