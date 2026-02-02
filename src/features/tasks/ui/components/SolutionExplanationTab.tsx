import React, { useState, useEffect, useRef } from 'react';
import { Task } from '@/types';
import { IconChevronDown, IconPlay, IconCopy, IconCheck } from '@/components/Icons';
import { useUITranslation } from '@/contexts/LanguageContext';
import { DescriptionRenderer } from './DescriptionRenderer';
import { createLogger } from '@/lib/logger';

const log = createLogger('SolutionTab');

interface SolutionExplanationTabProps {
  task: Task;
}

// Syntax highlighter for Go code with inline comments
const highlightGoCode = (code: string): React.ReactNode[] => {
  const lines = code.split('\n');
  const keywords = ['func', 'return', 'if', 'else', 'for', 'range', 'select', 'case', 'default', 'go', 'defer', 'chan', 'make', 'var', 'const', 'type', 'struct', 'interface', 'package', 'import', 'nil', 'true', 'false'];
  const types = ['int', 'string', 'bool', 'error', 'context', 'Context', 'time', 'Duration', 'sync', 'WaitGroup', 'Mutex'];

  return lines.map((line, lineIndex) => {
    const trimmedLine = line.trim();

    // Full comment line
    if (trimmedLine.startsWith('//')) {
      return (
        <div key={lineIndex} className="flex">
          <span className="select-none text-gray-500 w-8 text-right pr-4 flex-shrink-0 text-xs">
            {lineIndex + 1}
          </span>
          <span className="text-green-500 dark:text-green-400">{line}</span>
        </div>
      );
    }

    // Line with inline comment
    const commentIndex = line.indexOf('//');
    if (commentIndex > 0) {
      const codePart = line.slice(0, commentIndex);
      const commentPart = line.slice(commentIndex);

      return (
        <div key={lineIndex} className="flex">
          <span className="select-none text-gray-500 w-8 text-right pr-4 flex-shrink-0 text-xs">
            {lineIndex + 1}
          </span>
          <span>
            {highlightCodePart(codePart, keywords, types)}
            <span className="text-green-500 dark:text-green-400">{commentPart}</span>
          </span>
        </div>
      );
    }

    // Code only
    return (
      <div key={lineIndex} className="flex">
        <span className="select-none text-gray-500 w-8 text-right pr-4 flex-shrink-0 text-xs">
          {lineIndex + 1}
        </span>
        <span>{highlightCodePart(line, keywords, types)}</span>
      </div>
    );
  });
};

const highlightCodePart = (code: string, keywords: string[], types: string[]): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = code;
  let key = 0;

  while (remaining.length > 0) {
    // String literals
    const stringMatch = remaining.match(/^"[^"]*"/);
    if (stringMatch) {
      parts.push(<span key={key++} className="text-amber-500 dark:text-amber-400">{stringMatch[0]}</span>);
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    // Keywords
    let foundKeyword = false;
    for (const kw of keywords) {
      const kwRegex = new RegExp(`^\\b${kw}\\b`);
      if (kwRegex.test(remaining)) {
        parts.push(<span key={key++} className="text-purple-500 dark:text-purple-400 font-medium">{kw}</span>);
        remaining = remaining.slice(kw.length);
        foundKeyword = true;
        break;
      }
    }
    if (foundKeyword) continue;

    // Types
    let foundType = false;
    for (const t of types) {
      const tRegex = new RegExp(`^\\b${t}\\b`);
      if (tRegex.test(remaining)) {
        parts.push(<span key={key++} className="text-cyan-500 dark:text-cyan-400">{t}</span>);
        remaining = remaining.slice(t.length);
        foundType = true;
        break;
      }
    }
    if (foundType) continue;

    // Numbers
    const numMatch = remaining.match(/^\d+/);
    if (numMatch) {
      parts.push(<span key={key++} className="text-orange-500 dark:text-orange-400">{numMatch[0]}</span>);
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Default character
    parts.push(<span key={key++} className="text-gray-300">{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return <>{parts}</>;
};

// Extract YouTube video ID from various URL formats
const getVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.pathname.includes('/embed/')) {
      return urlObj.pathname.split('/embed/')[1];
    }
    return null;
  } catch {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
};

export const SolutionExplanationTab = ({ task }: SolutionExplanationTabProps) => {
  const { tUI } = useUITranslation();
  const solutionCode = task.solutionCode || '// Solution not available';
  const whyItMatters = task.whyItMatters;
  const [isVideoOpen, setIsVideoOpen] = useState(true); // Open by default
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const videoId = task.youtubeUrl ? getVideoId(task.youtubeUrl) : null;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopyCode = async () => {
    try {
      // Try modern Clipboard API first (requires HTTPS)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(solutionCode);
      } else {
        // Fallback for HTTP: use textarea + execCommand
        const textArea = document.createElement('textarea');
        textArea.value = solutionCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      timeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      log.error('Failed to copy to clipboard', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Why It Matters - Clean card design */}
      {whyItMatters && (
        <div className="relative overflow-hidden">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm tracking-wide">
              {tUI('task.whyItMatters')}
            </h3>
          </div>
          {/* Content - Use DescriptionRenderer for proper markdown */}
          <div className="pl-11">
            <DescriptionRenderer text={whyItMatters} />
          </div>
        </div>
      )}

      {/* Video Explanation Section - Collapsible, open by default */}
      {videoId && (
        <div className="rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden bg-white dark:bg-dark-surface">
          <button
            onClick={() => setIsVideoOpen(!isVideoOpen)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-md">
                <IconPlay className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{tUI('task.videoExplanation')}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tUI('task.videoDesc')}</p>
              </div>
            </div>
            <IconChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isVideoOpen ? 'rotate-180' : ''}`} />
          </button>

          {isVideoOpen && (
            <div className="px-5 pb-5">
              <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-black shadow-lg">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Video Explanation"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tUI('task.poweredByYoutube')}</span>
                <a
                  href={task.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-bold text-brand-600 hover:underline"
                >
                  {tUI('task.openNewTab')}
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Solution Code with Inline Comments */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {tUI('task.canonicalSolution')}
        </h3>
        <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#1e1e1e] border-b border-gray-700">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span className="ml-3 text-xs text-gray-400 font-mono">solution.go</span>
            {/* Copy Button */}
            <button
              onClick={handleCopyCode}
              className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all hover:bg-gray-700"
              title={tUI('common.copy')}
            >
              {isCopied ? (
                <>
                  <IconCheck className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">{tUI('common.copied')}</span>
                </>
              ) : (
                <>
                  <IconCopy className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-400">{tUI('common.copy')}</span>
                </>
              )}
            </button>
          </div>
          {/* Code with syntax highlighting */}
          <pre className="p-4 bg-[#0d1117] overflow-x-auto font-mono text-[13px] leading-6">
            {highlightGoCode(solutionCode)}
          </pre>
        </div>
      </div>

      {/* Related Patterns */}
      <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
        <h4 className="text-xs uppercase font-bold text-gray-400 mb-3 tracking-wider">{tUI('task.relatedConcepts')}</h4>
        <div className="flex flex-wrap gap-2">
          {task.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs font-medium rounded-lg border border-gray-200 dark:border-dark-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
