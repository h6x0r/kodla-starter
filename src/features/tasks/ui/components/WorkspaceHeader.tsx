
import React from 'react';
import { Link } from 'react-router-dom';
import { IconX, IconPlay } from '../../../../components/Icons';
import { Task } from '../../../../types';

interface WorkspaceHeaderProps {
  task: Task;
  backLink: string;
  langLabel: string;
  isRunning: boolean;
  onRun: () => void;
  onSubmit: () => void;
}

export const WorkspaceHeader = ({ task, backLink, langLabel, isRunning, onRun, onSubmit }: WorkspaceHeaderProps) => {
  return (
    <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to={backLink} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg text-gray-500 transition-colors">
            <IconX className="w-5 h-5" />
          </Link>
          <div className="h-6 w-px bg-gray-200 dark:bg-dark-border"></div>
          <div>
            <h2 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              {task.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
               <span className={`px-1.5 rounded-sm uppercase font-bold tracking-wider ${
                 task.difficulty === 'easy' ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 
                 task.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
               }`}>
                 {task.difficulty}
               </span>
               <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
               <span className="font-medium text-gray-600 dark:text-gray-400">{langLabel}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-5 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-md transition-all shadow-lg shadow-green-900/20 ${
              isRunning ? 'opacity-75 cursor-wait' : ''
            }`}
          >
            {isRunning ? <span className="animate-spin">⟳</span> : <IconPlay className="w-3 h-3" />}
            RUN CODE
          </button>
          <button onClick={onSubmit} className="px-5 py-1.5 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 text-xs font-bold rounded-md hover:bg-gray-50 dark:hover:border-gray-600 transition-all">
            SUBMIT
          </button>
        </div>
      </div>
  );
};
