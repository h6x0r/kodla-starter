import React, { useState } from "react";
import { adminService } from "../api/adminService";
import { useUITranslation } from "@/contexts/LanguageContext";
import { createLogger } from "@/lib/logger";

const log = createLogger("ExportPanel");

type ExportEntity = "users" | "payments" | "subscriptions" | "audit-logs";
type ExportFormat = "csv" | "json";

const EXPORT_ENTITIES: { value: ExportEntity; labelKey: string }[] = [
  { value: "users", labelKey: "admin.export.users" },
  { value: "payments", labelKey: "admin.export.payments" },
  { value: "subscriptions", labelKey: "admin.export.subscriptions" },
  { value: "audit-logs", labelKey: "admin.export.auditLogs" },
];

const ExportPanel: React.FC = () => {
  const { tUI } = useUITranslation();
  const [entity, setEntity] = useState<ExportEntity>("users");
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await adminService.downloadExport(entity, format, {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      log.error("Export failed", err);
      setError(tUI("admin.export.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm"
      data-testid="export-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {tUI("admin.export.title")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {tUI("admin.export.subtitle")}
          </p>
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-4">
        {/* Entity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {tUI("admin.export.dataType")}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {EXPORT_ENTITIES.map((e) => (
              <button
                key={e.value}
                onClick={() => setEntity(e.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  entity === e.value
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border"
                }`}
                data-testid={`export-entity-${e.value}`}
              >
                {tUI(e.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {tUI("admin.export.format")}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFormat("csv")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                format === "csv"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border"
              }`}
              data-testid="export-format-csv"
            >
              CSV
            </button>
            <button
              onClick={() => setFormat("json")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                format === "json"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 dark:bg-dark-bg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-border"
              }`}
              data-testid="export-format-json"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {tUI("admin.export.startDate")}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm"
              data-testid="export-start-date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {tUI("admin.export.endDate")}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg text-sm"
              data-testid="export-end-date"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
            data-testid="export-error"
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm"
            data-testid="export-success"
          >
            {tUI("admin.export.success")}
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-green-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          data-testid="export-button"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {tUI("admin.export.exporting")}
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {tUI("admin.export.download")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExportPanel;
