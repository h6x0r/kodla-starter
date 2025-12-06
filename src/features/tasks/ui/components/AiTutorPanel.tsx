
import React from 'react';
import { IconSparkles, IconChevronDown } from '../../../../components/Icons';
import { AiChatMessage } from '../../../../types';

interface AiTutorPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  chat: AiChatMessage[];
  question: string;
  onQuestionChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isPremium: boolean;
}

export const AiTutorPanel = ({ isOpen, onToggle, chat, question, onQuestionChange, onSend, isLoading, isPremium }: AiTutorPanelProps) => {
  return (
    <div className="border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-black/50 backdrop-blur-sm">
        <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
        <span className="flex items-center gap-2">
            <IconSparkles className="w-4 h-4 text-purple-500" /> 
            <span className="bg-gradient-to-r from-purple-500 to-brand-500 bg-clip-text text-transparent font-black">AI TUTOR</span>
        </span>
        <IconChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
        <div className="h-72 flex flex-col border-t border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chat.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <IconSparkles className="w-10 h-10 mb-3 text-purple-400" />
                <p className="text-xs max-w-[200px]">Ask for a hint, debugging help, or complexity analysis.</p>
                </div>
            )}
            {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-br-none' 
                    : 'bg-gray-100 dark:bg-dark-bg text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-dark-border'
                }`}>
                    {msg.text}
                </div>
                </div>
            ))}
            {isLoading && <div className="text-xs text-gray-400 animate-pulse pl-2">Thinking...</div>}
            </div>
            <div className="p-3 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-dark-border">
            <div className="relative">
                <input 
                type="text" 
                value={question}
                onChange={(e) => onQuestionChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSend()}
                disabled={!isPremium || isLoading}
                placeholder={isPremium ? "Ask AI..." : "Unlock Premium to chat"}
                className="w-full bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl pl-4 pr-10 py-3 text-xs focus:ring-2 focus:ring-brand-500 outline-none dark:text-white shadow-sm transition-all"
                />
                <button 
                onClick={onSend}
                disabled={!isPremium || isLoading}
                className="absolute right-1.5 top-1.5 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
                >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
};
