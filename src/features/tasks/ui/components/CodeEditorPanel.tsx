
import React, { useContext, useState, useRef, useCallback, memo } from 'react';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { IconRefresh } from '@/components/Icons';
import { Task } from '@/types';
import { AuthContext, ThemeContext } from '@/components/Layout';
import { useUITranslation } from '@/contexts/LanguageContext';
import { EditorSettingsDropdown } from './EditorSettingsDropdown';
import { TimerStopwatch } from './TimerStopwatch';
import { storage } from '@/lib/storage';

// Configure Monaco Loader to use a stable CDN version to avoid worker loading issues
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs' }
});

// Define custom dark theme with darker background matching the description panel
const defineCustomTheme = (monaco: Monaco) => {
  monaco.editor.defineTheme('practix-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0d1117',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#484f58',
      'editorLineNumber.activeForeground': '#8b949e',
      'editor.selectionBackground': '#264f78',
      'editorCursor.foreground': '#c9d1d9',
    }
  });
};

interface CodeEditorPanelProps {
  code: string;
  setCode: (code: string) => void;
  isGo: boolean;
  fileExt: string;
  isPremium: boolean;
  canSeeSolution?: boolean;
  task: Task;
  language?: string;
}

export const CodeEditorPanel = memo(({
  code, setCode,
  isGo, fileExt, isPremium,
  canSeeSolution = false,
  task,
  language
}: CodeEditorPanelProps) => {

  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const { tUI } = useUITranslation();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Reset code to initial state
  const handleResetCode = useCallback(() => {
    if (task?.initialCode) {
      setCode(task.initialCode);
      storage.removeTaskCode(task.slug);
      setShowResetConfirm(false);
    }
  }, [task, setCode]);

  // Determine language for Monaco editor
  const editorLanguage = language || (isGo ? 'go' : 'java');

  // Handle editor mount
  const handleEditorMount = useCallback((editorInstance: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editorInstance;
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {});

    // Expose editor on window for E2E testing
    (window as any).monacoEditor = editorInstance;
  }, []);

  // Editor options
  const editorOptions = {
    minimap: { enabled: user?.preferences?.editorMinimap ?? false },
    fontSize: user?.preferences?.editorFontSize || 14,
    lineNumbers: (user?.preferences?.editorLineNumbers ? 'on' : 'off') as 'on' | 'off',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    fontFamily: user?.preferences?.editorFontFamily || "'JetBrains Mono', 'Courier New', monospace",
    lineHeight: 24,
    renderLineHighlight: 'all' as const,
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
  };

  // Get language display info
  const getLangDisplay = () => {
    if (language === 'python' || language === 'py') return { label: 'PY', color: 'text-yellow-400' };
    if (isGo) return { label: 'GO', color: 'text-cyan-400' };
    return { label: 'J', color: 'text-orange-400' };
  };
  const langDisplay = getLangDisplay();

  return (
    <div data-testid="code-editor" className="flex flex-col bg-white dark:bg-[#0d1117] border-l border-gray-200 dark:border-gray-800 h-full overflow-hidden">
      {/* File Tab */}
      <div className="flex bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#21262d] select-none flex-shrink-0">
        <div className="px-4 py-2.5 text-xs flex items-center gap-2 border-t-2 bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white border-brand-500">
          <span className={langDisplay.color}>{langDisplay.label}</span>
          main{fileExt}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1 px-2">
          <TimerStopwatch />
          {/* Reset Code Button */}
          <div className="relative">
            <button
              onClick={() => setShowResetConfirm(true)}
              data-testid="reset-code-button"
              className="w-8 h-8 flex items-center justify-center rounded-md transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333]"
              title={tUI('task.resetCode') || 'Reset to initial code'}
            >
              <IconRefresh className="w-4 h-4" />
            </button>
            {/* Reset Confirmation Popup */}
            {showResetConfirm && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-[#21262d] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-56">
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                  {tUI('task.resetConfirm') || 'Reset to initial code? Your current code will be lost.'}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {tUI('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    onClick={handleResetCode}
                    className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                  >
                    {tUI('task.reset') || 'Reset'}
                  </button>
                </div>
              </div>
            )}
          </div>
          <EditorSettingsDropdown />
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 relative bg-gray-50 dark:bg-[#0d1117] min-h-0">
        <Editor
          height="100%"
          language={editorLanguage}
          theme={isDark ? "practix-dark" : "light"}
          beforeMount={defineCustomTheme}
          onMount={handleEditorMount}
          value={code}
          onChange={(value) => setCode(value || '')}
          options={editorOptions}
          loading={
            <div className="flex h-full items-center justify-center text-gray-500 text-sm bg-gray-50 dark:bg-[#0d1117]">
              <span className="animate-pulse">{tUI('task.loadingEditor')}</span>
            </div>
          }
        />
      </div>
    </div>
  );
});
