
import { useState, useEffect } from 'react';
import { Task, Submission } from '../../../types';
import { taskService } from '../api/taskService';
import { MOCK_SUBMISSIONS } from '../data/mockData';

export const useTaskRunner = (task: Task | null) => {
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'solution'>('editor');
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [isRunning, setIsRunning] = useState(false);

  // Initialize code when task loads
  useEffect(() => {
    if (task) {
      setCode(task.initialCode);
    }
  }, [task]);

  const runCode = async () => {
    if (!task) return;
    setIsRunning(true);
    
    // Auto-switch to history tab to show progress/result
    setActiveTab('history');

    try {
      const newSub = await taskService.submitCode(code);
      
      setSubmissions(prev => [newSub, ...prev]);
      setIsRunning(false);
      
      if (newSub.status === 'passed') {
        taskService.markTaskAsCompleted(task.id);
      }
    } catch (e) {
      setIsRunning(false);
      // In a real app, we might append an 'error' submission here
    }
  };

  return {
    code,
    setCode,
    activeTab,
    setActiveTab,
    submissions,
    isRunning,
    runCode
  };
};