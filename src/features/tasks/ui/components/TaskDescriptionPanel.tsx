
import React from 'react';
import { Task } from '../../../../types';
import { DescriptionRenderer } from './DescriptionRenderer';

interface TaskDescriptionPanelProps {
  task: Task;
}

export const TaskDescriptionPanel = ({ task }: TaskDescriptionPanelProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <DescriptionRenderer text={task.description} />
      <div className="mt-10 pt-6 border-t border-gray-100 dark:border-dark-border">
          <h4 className="text-xs uppercase font-bold text-gray-400 mb-3 tracking-wider">Related Topics</h4>
          <div className="flex flex-wrap gap-2">
            {task.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full border border-gray-200 dark:border-dark-border">
                {tag}
              </span>
            ))}
          </div>
      </div>
    </div>
  );
};
