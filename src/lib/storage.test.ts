import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing storage
const mockStorage: Record<string, string> = {};

// Create localStorage mock with Proxy to support Object.keys()
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  }),
  get length() {
    return Object.keys(mockStorage).length;
  },
  key: vi.fn((index: number) => Object.keys(mockStorage)[index] || null),
};

// Use a Proxy to make Object.keys(localStorage) return mockStorage keys
const localStorageProxy = new Proxy(localStorageMock, {
  ownKeys: () => Object.keys(mockStorage),
  getOwnPropertyDescriptor: (_, key) => {
    if (key in mockStorage) {
      return { enumerable: true, configurable: true, value: mockStorage[key as string] };
    }
    return Object.getOwnPropertyDescriptor(localStorageMock, key);
  },
});

vi.stubGlobal('localStorage', localStorageProxy);

import { storage } from './storage';

describe('storage utility', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    vi.clearAllMocks();
  });

  describe('getTaskCode / setTaskCode', () => {
    it('should save and retrieve task code', () => {
      storage.setTaskCode('hello-world', 'package main');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'practix_task_code_hello-world',
        'package main',
      );

      const result = storage.getTaskCode('hello-world');
      expect(result).toBe('package main');
    });

    it('should return null for non-existent task code', () => {
      const result = storage.getTaskCode('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('getCompletedTasks / addCompletedTask', () => {
    it('should add and retrieve completed tasks', () => {
      storage.addCompletedTask('task-1');
      storage.addCompletedTask('task-2');

      const result = storage.getCompletedTasks();
      expect(result).toContain('task-1');
      expect(result).toContain('task-2');
    });

    it('should not add duplicate completed tasks', () => {
      storage.addCompletedTask('task-1');
      storage.addCompletedTask('task-1');

      const result = storage.getCompletedTasks();
      expect(result.filter((t) => t === 'task-1')).toHaveLength(1);
    });

    it('should return empty array when no completed tasks', () => {
      const result = storage.getCompletedTasks();
      expect(result).toEqual([]);
    });
  });

  describe('getLanguage / setLanguage', () => {
    it('should save and retrieve language preference', () => {
      storage.setLanguage('ru');

      expect(localStorage.setItem).toHaveBeenCalledWith('practix_language', 'ru');

      const result = storage.getLanguage();
      expect(result).toBe('ru');
    });

    it('should return null when no language set', () => {
      const result = storage.getLanguage();
      expect(result).toBeNull();
    });
  });

  describe('getTheme / setTheme', () => {
    it('should save and retrieve theme preference', () => {
      storage.setTheme('dark');

      expect(localStorage.setItem).toHaveBeenCalledWith('practix_theme', 'dark');

      const result = storage.getTheme();
      expect(result).toBe('dark');
    });

    it('should return dark as default when no theme set', () => {
      const result = storage.getTheme();
      expect(result).toBe('dark');
    });

    it('should save and retrieve light theme', () => {
      storage.setTheme('light');

      const result = storage.getTheme();
      expect(result).toBe('light');
    });
  });

  describe('getToken / setToken / removeToken', () => {
    it('should save and retrieve token', () => {
      storage.setToken('jwt-token-123');

      expect(localStorage.setItem).toHaveBeenCalledWith('practix_token', 'jwt-token-123');

      const result = storage.getToken();
      expect(result).toBe('jwt-token-123');
    });

    it('should return null when no token', () => {
      const result = storage.getToken();
      expect(result).toBeNull();
    });

    it('should remove token', () => {
      storage.setToken('token-to-remove');
      storage.removeToken();

      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_token');
    });
  });

  describe('removeTaskCode', () => {
    it('should remove task code', () => {
      storage.setTaskCode('task-1', 'some code');
      storage.removeTaskCode('task-1');

      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_task_code_task-1');
    });
  });

  describe('getMockUser / setMockUser', () => {
    it('should save and retrieve mock user', () => {
      const mockUser = { id: 'user-1', email: 'test@test.com', name: 'Test' };
      storage.setMockUser(mockUser);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'practix_mock_db_user',
        JSON.stringify(mockUser)
      );

      const result = storage.getMockUser();
      expect(result).toEqual(mockUser);
    });

    it('should return null when no mock user', () => {
      const result = storage.getMockUser();
      expect(result).toBeNull();
    });
  });

  describe('getStartedCourses / setStartedCourses / addStartedCourse', () => {
    it('should save and retrieve started courses', () => {
      storage.setStartedCourses(['go-basics', 'java-core']);

      const result = storage.getStartedCourses();
      expect(result).toEqual(['go-basics', 'java-core']);
    });

    it('should add started course', () => {
      storage.addStartedCourse('go-basics');
      storage.addStartedCourse('java-core');

      const result = storage.getStartedCourses();
      expect(result).toContain('go-basics');
      expect(result).toContain('java-core');
    });

    it('should not add duplicate started course', () => {
      storage.addStartedCourse('go-basics');
      storage.addStartedCourse('go-basics');

      const result = storage.getStartedCourses();
      expect(result.filter(c => c === 'go-basics')).toHaveLength(1);
    });

    it('should return empty array when no started courses', () => {
      const result = storage.getStartedCourses();
      expect(result).toEqual([]);
    });

    it('should handle invalid JSON gracefully', () => {
      mockStorage['practix_started_courses'] = 'invalid json';

      const result = storage.getStartedCourses();
      expect(result).toEqual([]);
    });
  });

  describe('setCompletedTasks', () => {
    it('should set completed tasks array', () => {
      storage.setCompletedTasks(['task-1', 'task-2']);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'practix_completed_tasks',
        JSON.stringify(['task-1', 'task-2'])
      );
    });

    it('should handle invalid JSON gracefully for getCompletedTasks', () => {
      mockStorage['practix_completed_tasks'] = 'invalid json';

      const result = storage.getCompletedTasks();
      expect(result).toEqual([]);
    });
  });

  describe('getRoadmapPrefs / setRoadmapPrefs / removeRoadmapPrefs', () => {
    it('should save and retrieve roadmap preferences', () => {
      const prefs = { role: 'developer', level: 'junior', goal: 'learn go' };
      storage.setRoadmapPrefs(prefs);

      const result = storage.getRoadmapPrefs();
      expect(result).toEqual(prefs);
    });

    it('should return default prefs when none set', () => {
      const result = storage.getRoadmapPrefs();
      expect(result).toEqual({ role: '', level: '', goal: '' });
    });

    it('should remove roadmap prefs', () => {
      storage.setRoadmapPrefs({ role: 'dev', level: 'mid', goal: 'test' });
      storage.removeRoadmapPrefs();

      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_roadmap_prefs');
    });

    it('should handle invalid JSON gracefully', () => {
      mockStorage['practix_roadmap_prefs'] = 'invalid json';

      const result = storage.getRoadmapPrefs();
      expect(result).toEqual({ role: '', level: '', goal: '' });
    });
  });

  describe('getSidebarCollapsed / setSidebarCollapsed', () => {
    it('should save and retrieve sidebar collapsed state', () => {
      storage.setSidebarCollapsed(true);

      expect(localStorage.setItem).toHaveBeenCalledWith('practix_sidebar_collapsed', 'true');

      const result = storage.getSidebarCollapsed();
      expect(result).toBe(true);
    });

    it('should return false when not set', () => {
      const result = storage.getSidebarCollapsed();
      expect(result).toBe(false);
    });

    it('should handle false value', () => {
      storage.setSidebarCollapsed(false);

      const result = storage.getSidebarCollapsed();
      expect(result).toBe(false);
    });
  });

  describe('getTimerState / setTimerState / removeTimerState', () => {
    it('should save and retrieve timer state', () => {
      const timerState = { elapsed: 120, isRunning: true, mode: 'stopwatch' };
      storage.setTimerState(timerState as any);

      const result = storage.getTimerState();
      expect(result).toEqual(timerState);
    });

    it('should return null when no timer state', () => {
      const result = storage.getTimerState();
      expect(result).toBeNull();
    });

    it('should remove timer state', () => {
      storage.setTimerState({ elapsed: 100, isRunning: false, mode: 'timer' } as any);
      storage.removeTimerState();

      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_timer_state');
    });

    it('should handle invalid JSON gracefully', () => {
      mockStorage['practix_timer_state'] = 'invalid json';

      const result = storage.getTimerState();
      expect(result).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all practix storage keys', () => {
      // Set some values
      storage.setToken('token');
      storage.setTheme('dark');
      storage.setTaskCode('task-1', 'code');
      storage.setLanguage('en');

      // Clear all
      storage.clearAll();

      // Verify removeItem was called for various keys
      expect(localStorage.removeItem).toHaveBeenCalled();
    });

    it('should clear task code keys with dynamic prefix', () => {
      // Manually populate mockStorage with task code keys to test the filter/forEach branch
      mockStorage['practix_task_code_task-1'] = 'code1';
      mockStorage['practix_task_code_task-2'] = 'code2';
      mockStorage['practix_task_code_another-task'] = 'code3';

      // Clear all
      storage.clearAll();

      // Verify task code keys were cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_task_code_task-1');
      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_task_code_task-2');
      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_task_code_another-task');
    });

    it('should clear language and timer state', () => {
      mockStorage['practix_language'] = 'ru';
      mockStorage['practix_timer_state'] = JSON.stringify({ elapsed: 100 });

      storage.clearAll();

      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_language');
      expect(localStorage.removeItem).toHaveBeenCalledWith('practix_timer_state');
    });
  });
});
