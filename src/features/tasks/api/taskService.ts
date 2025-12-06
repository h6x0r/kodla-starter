
import { Task, Submission, Topic } from '../../../types';
import { MOCK_TASK, MOCK_SUBMISSIONS, RECENT_TASKS } from '../data/mockData';
import { getTopicsForCourse } from '../../courses/data/mockData';
import { STORAGE_KEYS } from '../../../config/constants';

export const taskService = {
  
  fetchTask: async (slug: string): Promise<Task> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if it's a known task from our generated topics
            let foundTask: Task | undefined;
            
            // Search in all courses -> topics -> tasks
            const allCourses = ['c_go', 'c_java', 'c_algo', 'c_sys'];
            for (const cId of allCourses) {
                const topics = getTopicsForCourse(cId);
                for (const t of topics) {
                    const match = t.tasks.find(tk => tk.slug === slug);
                    if (match) {
                        foundTask = match;
                        break;
                    }
                }
                if (foundTask) break;
            }

            if (foundTask) {
                resolve(foundTask);
            } else {
                // Fallback to generic mock if not found in structured data
                resolve({ ...MOCK_TASK, slug, title: slug });
            }
        }, 300);
    });
  },

  getRecentTasks: async (): Promise<Task[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(RECENT_TASKS), 400);
    });
  },

  submitCode: async (code: string): Promise<Submission> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isSuccess = Math.random() > 0.3; // Random success/fail
        const message = isSuccess 
            ? `> Build Successful\n> Running Tests...\n> Test Case 1: PASSED (2ms)\n> Test Case 2: PASSED (1ms)\n> Test Case 3: PASSED (5ms)\n\n[SUCCESS] All test cases passed!`
            : `> Build Successful\n> Running Tests...\n> Test Case 1: PASSED (2ms)\n> Test Case 2: FAILED\n   Input:    [2,7,11,15], 9\n   Expected: [0,1]\n   Output:   []\n\n[FAILED] Wrong Answer.`;

        resolve({
          id: Math.random().toString(36).substr(2, 9),
          status: isSuccess ? 'passed' : 'failed',
          score: isSuccess ? 100 : 0,
          runtime: Math.floor(Math.random() * 50) + 'ms',
          createdAt: new Date().toISOString(),
          code,
          message
        });
      }, 1500);
    });
  },

  /**
   * Get list of all completed task IDs from local storage
   */
  getCompletedTaskIds: (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS) || '[]');
    } catch {
      return [];
    }
  },

  /**
   * Mark a task as completed
   */
  markTaskAsCompleted: (taskId: string) => {
    const current = taskService.getCompletedTaskIds();
    if (!current.includes(taskId)) {
      const updated = [...current, taskId];
      localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(updated));
    }
  },
  
  isResourceCompleted: (resourceId: string, type: 'task' | 'topic'): boolean => {
      const completedIds = taskService.getCompletedTaskIds();
      
      if (type === 'task') {
        return completedIds.includes(resourceId);
      }
      
      return false;
  }
};
