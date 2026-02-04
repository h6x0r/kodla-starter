import React, { useState, useCallback } from "react";
import { adminService, UserSearchResult } from "../api/adminService";
import { useUITranslation } from "@/contexts/LanguageContext";
import { createLogger } from "@/lib/logger";

const log = createLogger("UserSearchPanel");

const UserSearchPanel: React.FC = () => {
  const { tUI } = useUITranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (query.length < 2) {
      setError(tUI("admin.userSearch.minChars"));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await adminService.searchUsers(query);
      setResults(data);
      setSearched(true);
    } catch (err) {
      log.error("Failed to search users", err);
      setError(tUI("admin.userSearch.searchError"));
    } finally {
      setLoading(false);
    }
  }, [query, tUI]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <svg
            className="w-6 h-6 text-brand-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {tUI("admin.userSearch.title")}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {tUI("admin.userSearch.subtitle")}
        </p>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tUI("admin.userSearch.placeholder")}
            className="w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-5 w-5 text-brand-500"
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
            </div>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
        >
          {tUI("admin.userSearch.search")}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {searched && results.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {tUI("admin.userSearch.noResults")}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {results.map((user) => (
            <div
              key={user.id}
              className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl hover:bg-gray-100 dark:hover:bg-dark-bg/80 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.name || tUI("admin.userSearch.noName")}
                    </span>
                    {user.role === "ADMIN" && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium rounded">
                        Admin
                      </span>
                    )}
                    {user.isPremium && (
                      <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded">
                        Premium
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {tUI("admin.userSearch.registered")}: {formatDate(user.createdAt)}
                    {user.lastActivityAt && (
                      <> • {tUI("admin.userSearch.lastActive")}: {formatDate(user.lastActivityAt)}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {user.submissionsCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tUI("admin.userSearch.submissions")}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {user.coursesCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {tUI("admin.userSearch.courses")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Initial State */}
      {!searched && !loading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          {tUI("admin.userSearch.hint")}
        </div>
      )}
    </div>
  );
};

export default UserSearchPanel;
