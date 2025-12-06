
import { useState, useEffect } from 'react';
import { Task } from '../../../types';
import { taskService } from '../api/taskService';

export const useTaskState = (slug?: string) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    setIsLoading(true);
    setTask(null);
    
    taskService.fetchTask(slug).then(t => {
      setTask(t);
      setIsLoading(false);
    });
  }, [slug]);

  return { task, isLoading };
};
