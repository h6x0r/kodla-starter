import React, { useState, useEffect, useCallback } from "react";
import {
  adminService,
  AuditLogEntry,
  AuditAction,
  AuditLogsFilters,
} from "../api/adminService";
import { useUITranslation } from "@/contexts/LanguageContext";
import { createLogger } from "@/lib/logger";

const log = createLogger("AuditLogsPanel");

const ACTION_COLORS: Record<AuditAction, string> = {
  user_ban: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  user_unban:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  settings_update:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  promo_code_create:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  promo_code_update:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  promo_code_delete:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  bug_report_update:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  payment_refund:
    "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  subscription_cancel:
    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const ACTION_ICONS: Record<AuditAction, string> = {
  user_ban: "🚫",
  user_unban: "✅",
  settings_update: "⚙️",
  promo_code_create: "🎟️",
  promo_code_update: "✏️",
  promo_code_delete: "🗑️",
  bug_report_update: "🐛",
  payment_refund: "💰",
  subscription_cancel: "❌",
};

const ALL_ACTIONS: AuditAction[] = [
  "user_ban",
  "user_unban",
  "settings_update",
  "promo_code_create",
  "promo_code_update",
  "promo_code_delete",
  "bug_report_update",
  "payment_refund",
  "subscription_cancel",
];

const AuditLogsPanel: React.FC = () => {
  const { tUI } = useUITranslation();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: AuditLogsFilters = {};
      if (actionFilter) filters.action = actionFilter;
      const data = await adminService.getAuditLogs(filters, page, limit);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err) {
      log.error("Failed to load audit logs", err);
      setError(tUI("admin.auditLogs.loadError"));
    } finally {
      setLoading(false);
    }
  }, [actionFilter, page, tUI]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatActionName = (action: AuditAction): string => {
    return tUI(`admin.auditLogs.actions.${action}`);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && logs.length === 0) {
    return (
      <div
        className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm"
        data-testid="audit-logs-loading"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-dark-bg rounded w-1/3" />
          <div className="h-12 bg-gray-200 dark:bg-dark-bg rounded" />
          <div className="h-12 bg-gray-200 dark:bg-dark-bg rounded" />
          <div className="h-12 bg-gray-200 dark:bg-dark-bg rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm"
      data-testid="audit-logs-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-6 h-6 text-indigo-500"
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
            {tUI("admin.auditLogs.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {tUI("admin.auditLogs.subtitle")} ({total})
          </p>
        </div>

        {/* Filter */}
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value as AuditAction | "");
            setPage(1);
          }}
          className="px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm"
          data-testid="audit-logs-filter"
        >
          <option value="">{tUI("admin.auditLogs.allActions")}</option>
          {ALL_ACTIONS.map((a) => (
            <option key={a} value={a}>
              {formatActionName(a)}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
          data-testid="audit-logs-error"
        >
          {error}
        </div>
      )}

      {/* Logs List */}
      {logs.length === 0 ? (
        <div
          className="text-center py-12 text-gray-500 dark:text-gray-400"
          data-testid="audit-logs-empty"
        >
          {tUI("admin.auditLogs.noLogs")}
        </div>
      ) : (
        <>
          <div
            className="space-y-3 max-h-[500px] overflow-y-auto"
            data-testid="audit-logs-list"
          >
            {logs.map((logEntry) => (
              <div
                key={logEntry.id}
                className="border border-gray-100 dark:border-dark-border rounded-xl overflow-hidden"
                data-testid={`audit-log-${logEntry.id}`}
              >
                {/* Log Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                  onClick={() =>
                    setExpandedId(
                      expandedId === logEntry.id ? null : logEntry.id
                    )
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {ACTION_ICONS[logEntry.action]}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${ACTION_COLORS[logEntry.action]}`}
                        >
                          {formatActionName(logEntry.action)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {logEntry.entity}
                          {logEntry.entityId && ` #${logEntry.entityId.slice(0, 8)}`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {tUI("admin.auditLogs.byAdmin")}:{" "}
                        <span className="font-medium">
                          {logEntry.admin.name || logEntry.admin.email}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(logEntry.createdAt)}
                      </div>
                    </div>

                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === logEntry.id ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === logEntry.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/30">
                    <div className="pt-4 space-y-3">
                      {logEntry.details &&
                        Object.keys(logEntry.details).length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                              {tUI("admin.auditLogs.details")}
                            </div>
                            <pre className="text-xs bg-gray-100 dark:bg-dark-bg p-2 rounded overflow-x-auto">
                              {JSON.stringify(logEntry.details, null, 2)}
                            </pre>
                          </div>
                        )}

                      {logEntry.ipAddress && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          IP: {logEntry.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-dark-bg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
              >
                {tUI("admin.auditLogs.prevPage")}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-dark-bg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
              >
                {tUI("admin.auditLogs.nextPage")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AuditLogsPanel;
