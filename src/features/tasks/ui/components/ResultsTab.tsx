import React, { memo, useState, useEffect } from 'react';
import { IconCheck, IconX, IconClock, IconChevronDown, IconCode } from '@/components/Icons';
import { useUITranslation } from '@/contexts/LanguageContext';
import { Submission, TestCaseResult } from '../../model/types';
import { RunTestsResult } from '../../api/taskService';

interface ResultsTabProps {
  // Run Results
  runResult: RunTestsResult | null;
  isRunLoading: boolean;
  // Submissions History
  submissions: Submission[];
  isLoadingSubmissions: boolean;
  onLoadSubmissionCode?: (code: string) => void;
}

// Format date helper
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export const ResultsTab: React.FC<ResultsTabProps> = memo(({
  runResult,
  isRunLoading,
  submissions,
  isLoadingSubmissions,
  onLoadSubmissionCode,
}) => {
  const { tUI } = useUITranslation();
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  // Track expanded tests per submission: { submissionId: testIndex | null }
  const [expandedSubmissionTests, setExpandedSubmissionTests] = useState<Record<string, number | null>>({});

  const toggleTest = (idx: number) => {
    setExpandedTest(expandedTest === idx ? null : idx);
  };

  const toggleSubmission = (id: string) => {
    setExpandedSubmissionId(expandedSubmissionId === id ? null : id);
  };

  const toggleSubmissionTest = (submissionId: string, testIdx: number) => {
    setExpandedSubmissionTests(prev => ({
      ...prev,
      [submissionId]: prev[submissionId] === testIdx ? null : testIdx
    }));
  };

  // Run result helpers
  const isPassed = runResult?.status === 'passed';
  const isError = runResult?.status === 'error';

  // Auto-expand first failed test when results change
  useEffect(() => {
    if (runResult?.testCases) {
      const firstFailed = runResult.testCases.findIndex(tc => !tc.passed);
      if (firstFailed >= 0) {
        setExpandedTest(firstFailed);
      } else {
        setExpandedTest(null);
      }
    } else {
      setExpandedTest(null);
    }
  }, [runResult]);

  return (
    <div className="flex flex-col h-full overflow-hidden" data-testid="test-results">
      {/* Run Results Section */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-dark-border">
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {tUI('task.latestRun')}
            </span>

            {isRunLoading && (
              <span className="text-xs text-gray-500 animate-pulse flex items-center gap-1">
                <IconClock className="w-3 h-3 animate-spin" />
                {tUI('task.running')}
              </span>
            )}

            {!isRunLoading && runResult && (
              <>
                {/* Status Badge */}
                <span
                  data-testid="run-status-badge"
                  data-status={isPassed ? 'passed' : isError ? 'error' : 'failed'}
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  isPassed
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : isError
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {isPassed ? tUI('task.passed') : isError ? tUI('task.error') : tUI('task.failed')}
                </span>

                {/* Test Count */}
                <span
                  data-testid="tests-count"
                  data-passed={runResult.testsPassed}
                  data-total={runResult.testsTotal}
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  {runResult.testsPassed}/{runResult.testsTotal} {tUI('task.testsPassed')}
                </span>

                {/* Runtime */}
                {runResult.runtime && runResult.runtime !== '-' && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    {runResult.runtime}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Run Results Content */}
        <div className="max-h-[300px] overflow-y-auto p-3 bg-white dark:bg-[#0d1117]">
          {isRunLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-pulse text-gray-500 text-sm">
                {tUI('task.executingCode')}
              </div>
            </div>
          )}

          {!isRunLoading && !runResult && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <IconCode className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-sm">{tUI('task.noRunYet')}</span>
            </div>
          )}

          {!isRunLoading && runResult && (
            <div className="space-y-2">
              {/* Success Message */}
              {isPassed && (
                <div data-testid="all-tests-passed" className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-3">
                  <IconCheck className="w-5 h-5" />
                  <span className="text-sm font-medium">{tUI('task.allTestsPassed')}</span>
                </div>
              )}

              {/* Error Message */}
              {isError && runResult.message && (
                <div className="mb-3">
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">⚠️</span>
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                        {tUI('task.executionError')}
                      </span>
                    </div>
                    <pre data-testid="stderr" className="text-[11px] font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap break-all">
                      {runResult.message}
                    </pre>
                  </div>
                </div>
              )}

              {/* Test Cases */}
              {runResult.testCases && runResult.testCases.length > 0 && (
                <div className="space-y-1.5">
                  {runResult.testCases.map((tc, idx) => {
                    const isExpanded = expandedTest === idx;
                    const hasDetails = tc.input || tc.expectedOutput || tc.actualOutput || tc.error;

                    return (
                      <div
                        key={idx}
                        data-testid={`test-case-${idx + 1}`}
                        data-passed={tc.passed}
                        className={`rounded-lg border overflow-hidden transition-all ${
                          tc.passed
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                            : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                        }`}
                      >
                        <button
                          data-testid={`test-case-${idx + 1}-toggle`}
                          onClick={() => hasDetails && toggleTest(idx)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left ${hasDetails ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : ''}`}
                        >
                          {tc.passed ? (
                            <IconCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" data-testid={`test-case-${idx + 1}-passed-icon`} />
                          ) : (
                            <IconX className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" data-testid={`test-case-${idx + 1}-failed-icon`} />
                          )}
                          <span data-testid={`test-case-${idx + 1}-label`} className={`text-xs font-bold ${tc.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            Test {idx + 1}
                          </span>
                          {hasDetails && (
                            <IconChevronDown data-testid={`test-case-${idx + 1}-chevron`} className={`w-3.5 h-3.5 ml-auto text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          )}
                        </button>

                        {isExpanded && hasDetails && (
                          <div data-testid={`test-case-${idx + 1}-details`} className="px-3 pb-3 pt-1 border-t border-gray-200 dark:border-gray-700/50 space-y-2">
                            {tc.input && (
                              <div data-testid={`test-case-${idx + 1}-input`}>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                  Input
                                </div>
                                <div className="bg-white dark:bg-[#0d1117] rounded border border-gray-200 dark:border-gray-700 p-2">
                                  <code data-testid={`test-case-${idx + 1}-input-value`} className="text-[11px] font-mono text-gray-800 dark:text-gray-200 break-all whitespace-pre-wrap">
                                    {tc.input}
                                  </code>
                                </div>
                              </div>
                            )}
                            {tc.expectedOutput && (
                              <div data-testid={`test-case-${idx + 1}-expected`}>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                  Expected Output
                                </div>
                                <div className="bg-white dark:bg-[#0d1117] rounded border border-green-200 dark:border-green-800/50 p-2">
                                  <code data-testid={`test-case-${idx + 1}-expected-value`} className="text-[11px] font-mono text-green-700 dark:text-green-400 break-all">
                                    {tc.expectedOutput}
                                  </code>
                                </div>
                              </div>
                            )}
                            {tc.actualOutput && (
                              <div data-testid={`test-case-${idx + 1}-actual`}>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                  Actual Output
                                </div>
                                <div className={`bg-white dark:bg-[#0d1117] rounded border p-2 ${
                                  tc.passed
                                    ? 'border-green-200 dark:border-green-800/50'
                                    : 'border-red-200 dark:border-red-800/50'
                                }`}>
                                  <code data-testid={`test-case-${idx + 1}-actual-value`} className={`text-[11px] font-mono break-all ${
                                    tc.passed
                                      ? 'text-green-700 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {tc.actualOutput}
                                  </code>
                                </div>
                              </div>
                            )}
                            {tc.error && !tc.actualOutput && (
                              <div data-testid={`test-case-${idx + 1}-error`}>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                  Error
                                </div>
                                <div className="bg-white dark:bg-[#0d1117] rounded border border-red-200 dark:border-red-800/50 p-2">
                                  <code data-testid={`test-case-${idx + 1}-error-value`} className="text-[11px] font-mono text-red-600 dark:text-red-400 break-all">
                                    {tc.error}
                                  </code>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submissions History Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-700 sticky top-0">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {tUI('task.submissionHistory')}
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-[#0d1117]">
          {isLoadingSubmissions ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-14" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">{tUI('task.noSubmissions')}</div>
          ) : (
            <div className="space-y-2">
              {submissions.map((sub) => {
                const isExpanded = expandedSubmissionId === sub.id;
                const hasTests = sub.testsTotal !== undefined && sub.testsTotal > 0;
                const testsPassed = sub.testsPassed ?? 0;
                const testsTotal = sub.testsTotal ?? 0;

                const subIsError = sub.status === 'error';
                const subIsPassed = sub.status === 'passed';
                const subIsFailed = sub.status === 'failed';

                const getStatusInfo = () => {
                  if (subIsPassed) return { label: 'Passed', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' };
                  if (subIsError) return { label: 'Error', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' };
                  return { label: 'Failed', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };
                };
                const statusInfo = getStatusInfo();

                const allTests = sub.testCases || [];
                const hasExpandableContent = allTests.length > 0 || sub.message;

                return (
                  <div key={sub.id} data-testid="submission-result" className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div
                      onClick={() => hasExpandableContent && toggleSubmission(sub.id)}
                      className={`flex items-center gap-2.5 p-2.5 transition-colors ${hasExpandableContent ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusInfo.dot}`} />
                      <span className={`text-xs font-semibold uppercase ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      {hasTests && (
                        <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                          subIsPassed
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {testsPassed}/{testsTotal}
                        </span>
                      )}
                      <div className="flex-1" />
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                        {sub.runtime && sub.runtime !== '-' && <span>{sub.runtime}</span>}
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500">{formatDate(sub.createdAt)}</span>
                      {hasExpandableContent && (
                        <IconChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </div>

                    {/* Load Code Button - only show if code exists */}
                    {onLoadSubmissionCode && sub.code && (
                      <div className="px-2.5 pb-2 flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (sub.code) {
                              onLoadSubmissionCode(sub.code);
                            }
                          }}
                          className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-medium"
                        >
                          {tUI('task.loadCode')}
                        </button>
                      </div>
                    )}

                    {/* Expanded Details - Similar to Latest Run */}
                    {isExpanded && hasExpandableContent && (
                      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#161b22]">
                        {subIsError && sub.message && (
                          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                              {sub.message.toLowerCase().includes('compile') ? 'Compilation Error' :
                               sub.message.toLowerCase().includes('timeout') ? 'Time Limit Exceeded' :
                               'Runtime Error'}
                            </div>
                          </div>
                        )}

                        {/* All Tests List - Collapsible like Latest Run */}
                        {allTests.length > 0 && (
                          <div className="p-3 space-y-1.5 max-h-[250px] overflow-y-auto">
                            {allTests.map((tc, idx) => {
                              const hasDetails = tc.input || tc.expectedOutput || tc.actualOutput || tc.error;
                              const isTestExpanded = expandedSubmissionTests[sub.id] === idx;

                              return (
                                <div
                                  key={idx}
                                  className={`rounded-lg border overflow-hidden transition-all ${
                                    tc.passed
                                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
                                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50'
                                  }`}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      hasDetails && toggleSubmissionTest(sub.id, idx);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left ${hasDetails ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5' : ''}`}
                                  >
                                    {tc.passed ? (
                                      <IconCheck className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    ) : (
                                      <IconX className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    )}
                                    <span className={`text-xs font-bold ${tc.passed ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                                      Test {idx + 1}
                                    </span>
                                    {hasDetails && (
                                      <IconChevronDown className={`w-3.5 h-3.5 ml-auto text-gray-400 transition-transform ${isTestExpanded ? 'rotate-180' : ''}`} />
                                    )}
                                  </button>

                                  {isTestExpanded && hasDetails && (
                                    <div className={`px-3 pb-3 pt-1 border-t space-y-2 ${
                                      tc.passed
                                        ? 'border-green-200 dark:border-green-800/50'
                                        : 'border-red-200 dark:border-red-800/50'
                                    }`}>
                                      {tc.input && (
                                        <div>
                                          <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                            Input
                                          </div>
                                          <div className="bg-white dark:bg-[#0d1117] rounded border border-gray-200 dark:border-gray-700 p-2">
                                            <code className="text-[11px] font-mono text-gray-800 dark:text-gray-200 break-all whitespace-pre-wrap">
                                              {tc.input}
                                            </code>
                                          </div>
                                        </div>
                                      )}
                                      {tc.expectedOutput && (
                                        <div>
                                          <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                            Expected Output
                                          </div>
                                          <div className="bg-white dark:bg-[#0d1117] rounded border border-green-200 dark:border-green-800/50 p-2">
                                            <code className="text-[11px] font-mono text-green-700 dark:text-green-400 break-all">
                                              {tc.expectedOutput}
                                            </code>
                                          </div>
                                        </div>
                                      )}
                                      {tc.actualOutput && (
                                        <div>
                                          <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                            Actual Output
                                          </div>
                                          <div className={`bg-white dark:bg-[#0d1117] rounded border p-2 ${
                                            tc.passed
                                              ? 'border-green-200 dark:border-green-800/50'
                                              : 'border-red-200 dark:border-red-800/50'
                                          }`}>
                                            <code className={`text-[11px] font-mono break-all ${
                                              tc.passed
                                                ? 'text-green-700 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                            }`}>
                                              {tc.actualOutput}
                                            </code>
                                          </div>
                                        </div>
                                      )}
                                      {tc.error && !tc.actualOutput && (
                                        <div>
                                          <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-semibold">
                                            Error
                                          </div>
                                          <div className="bg-white dark:bg-[#0d1117] rounded border border-red-200 dark:border-red-800/50 p-2">
                                            <code className="text-[11px] font-mono text-red-600 dark:text-red-400 break-all">
                                              {tc.error}
                                            </code>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {subIsFailed && allTests.length === 0 && sub.message && (
                          <div className="p-3">
                            <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                              Error
                            </div>
                            <div className="bg-white dark:bg-[#0d1117] rounded border border-gray-200 dark:border-gray-700 p-2.5">
                              <code className="text-[12px] font-mono text-red-600 dark:text-red-400">
                                {sub.message}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
