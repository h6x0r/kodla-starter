
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import Editor, { loader } from '@monaco-editor/react';
import { IconClock, IconSparkles, IconChevronDown } from '../../../../components/Icons';
import { Submission, Task } from '../../../../types';
import { AuthContext } from '../../../../components/Layout';

// Configure Monaco Loader to use a stable CDN version to avoid worker loading issues
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs' }
});

interface CodeEditorPanelProps {
  activeTab: 'editor' | 'history' | 'solution';
  setActiveTab: (tab: 'editor' | 'history' | 'solution') => void;
  code: string;
  setCode: (code: string) => void;
  isGo: boolean;
  fileExt: string;
  isPremium: boolean;
  submissions: Submission[];
  task: Task;
}

export const CodeEditorPanel = ({
  activeTab, setActiveTab,
  code, setCode,
  isGo, fileExt, isPremium,
  submissions, task
}: CodeEditorPanelProps) => {

  const { user } = useContext(AuthContext);
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  // Apply User Preferences or defaults
  const editorOptions = {
    minimap: { enabled: user?.preferences?.editorMinimap ?? false },
    fontSize: user?.preferences?.editorFontSize || 14,
    lineNumbers: (user?.preferences?.editorLineNumbers ? 'on' : 'off') as 'on' | 'off',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    lineHeight: 24,
    renderLineHighlight: 'all' as const,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
  };

  const solutionCode = task.solutionCode || '// Solution is not available for this task.';

  const toggleSubmission = (id: string) => {
      setExpandedSubmissionId(expandedSubmissionId === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] border-l border-gray-800 h-full">
          
      {/* File Tabs */}
      <div className="flex bg-[#252526] border-b border-[#1e1e1e] select-none flex-shrink-0">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2.5 text-xs flex items-center gap-2 border-t-2 transition-colors ${
              activeTab === 'editor' 
                ? 'bg-[#1e1e1e] text-white border-brand-500' 
                : 'bg-[#2d2d2d] text-gray-500 border-transparent hover:bg-[#333]'
            }`}
          >
            <span className={isGo ? "text-cyan-400" : "text-orange-400"}>
              {isGo ? "GO" : "J"}
            </span> 
            Solution{fileExt}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-xs flex items-center gap-2 border-t-2 transition-colors ${
            activeTab === 'history' 
              ? 'bg-[#1e1e1e] text-white border-brand-500' 
              : 'bg-[#2d2d2d] text-gray-500 border-transparent hover:bg-[#333]'
            }`}
          >
            <IconClock className="w-3 h-3" />
            Submissions
          </button>
          <button 
            onClick={() => setActiveTab('solution')}
            className={`px-4 py-2.5 text-xs flex items-center gap-2 border-t-2 transition-colors ${
              activeTab === 'solution' 
                ? 'bg-[#1e1e1e] text-white border-brand-500' 
                : 'bg-[#2d2d2d] text-gray-500 border-transparent hover:bg-[#333]'
            }`}
          >
            <IconSparkles className={`w-3 h-3 ${isPremium ? 'text-green-500' : 'text-amber-500'}`} />
            {isPremium ? 'Canonical Solution' : 'Solution (Locked)'}
          </button>
      </div>

      <div className="flex-1 relative flex flex-col min-h-0">
        {activeTab === 'editor' && (
          <div className="flex-1 relative bg-[#1e1e1e]">
            <Editor
            height="100%"
            language={isGo ? "go" : "java"}
            theme={user?.preferences?.editorTheme || "vs-dark"}
            value={code}
            onChange={(value) => setCode(value || '')}
            options={editorOptions}
            loading={
                <div className="flex h-full items-center justify-center text-gray-500 text-sm">
                    <span className="animate-pulse">Loading Editor Engine...</span>
                </div>
            }
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex-1 bg-white dark:bg-dark-surface p-6 overflow-auto">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Submission History</h3>
              <div className="space-y-3">
                {submissions.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">No submissions yet.</div>
                ) : (
                    submissions.map((sub) => {
                        const isExpanded = expandedSubmissionId === sub.id;
                        return (
                            <div key={sub.id} className="rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg overflow-hidden transition-all">
                                <div 
                                    onClick={() => toggleSubmission(sub.id)}
                                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full shadow-sm ${sub.status === 'passed' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{sub.status}</div>
                                            <div className="text-xs text-gray-500 mt-1">{new Date(sub.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div className="hidden sm:block">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">Runtime</div>
                                            <div className="text-sm font-mono text-gray-900 dark:text-white">{sub.runtime}</div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="text-[10px] text-gray-400 uppercase font-bold">Score</div>
                                            <div className="text-sm font-mono text-gray-900 dark:text-white">{sub.score}</div>
                                        </div>
                                        <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>
                                {isExpanded && sub.message && (
                                    <div className="p-4 bg-[#1e1e1e] border-t border-gray-200 dark:border-dark-border">
                                        <div className="text-[10px] font-bold text-gray-500 uppercase mb-2">Execution Output</div>
                                        <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{sub.message}</pre>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
              </div>
          </div>
        )}

        {activeTab === 'solution' && (
          <div className="flex-1 bg-[#1e1e1e] flex flex-col relative overflow-hidden">
            {isPremium ? (
              <div className="flex-1 relative">
                <Editor
                    height="100%"
                    language={isGo ? "go" : "java"}
                    theme={user?.preferences?.editorTheme || "vs-dark"}
                    value={solutionCode}
                    options={{ ...editorOptions, readOnly: true }}
                    loading={<div className="text-gray-500 p-4">Loading Solution...</div>}
                />
              </div>
            ) : (
              <div className="flex-1 bg-white dark:bg-dark-surface flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-500/5 backdrop-blur-sm z-0"></div>
                  <div className="text-center relative z-10 max-w-sm p-8 bg-white dark:bg-dark-surface rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border">
                    <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                      <IconSparkles className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Solution Locked</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 leading-relaxed">
                      Upgrade to <span className="text-brand-600 font-bold">Premium</span> to view the optimal O(n) solution, complexity analysis, and line-by-line explanation.
                    </p>
                    <Link to="/premium" className="inline-block mt-8 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/30 transition-all transform hover:-translate-y-0.5">
                      Unlock Now
                    </Link>
                  </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};