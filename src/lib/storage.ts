import { STORAGE_KEYS } from '@/config/constants';
import { MockUser, RoadmapPreferences, TimerState } from './storage.types';

/**
 * Type-safe storage abstraction layer for localStorage
 * Centralizes all localStorage operations for better maintainability
 */
export const storage = {
  // Auth
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // Theme
  getTheme(): 'dark' | 'light' {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return (theme as 'dark' | 'light') || 'dark';
  },

  setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  // Task Code (per task)
  getTaskCode(taskSlug: string): string | null {
    return localStorage.getItem(`${STORAGE_KEYS.TASK_CODE_PREFIX}${taskSlug}`);
  },

  setTaskCode(taskSlug: string, code: string): void {
    localStorage.setItem(`${STORAGE_KEYS.TASK_CODE_PREFIX}${taskSlug}`, code);
  },

  removeTaskCode(taskSlug: string): void {
    localStorage.removeItem(`${STORAGE_KEYS.TASK_CODE_PREFIX}${taskSlug}`);
  },

  // User mock data (for development)
  getMockUser(): MockUser | null {
    const data = localStorage.getItem(STORAGE_KEYS.USER_MOCK_DB);
    return data ? JSON.parse(data) : null;
  },

  setMockUser(user: MockUser): void {
    localStorage.setItem(STORAGE_KEYS.USER_MOCK_DB, JSON.stringify(user));
  },

  // Started courses
  getStartedCourses(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STARTED_COURSES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setStartedCourses(courses: string[]): void {
    localStorage.setItem(STORAGE_KEYS.STARTED_COURSES, JSON.stringify(courses));
  },

  addStartedCourse(courseId: string): void {
    const courses = this.getStartedCourses();
    if (!courses.includes(courseId)) {
      courses.push(courseId);
      this.setStartedCourses(courses);
    }
  },

  // Completed tasks
  getCompletedTasks(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLETED_TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  setCompletedTasks(tasks: string[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPLETED_TASKS, JSON.stringify(tasks));
  },

  addCompletedTask(taskId: string): void {
    const tasks = this.getCompletedTasks();
    if (!tasks.includes(taskId)) {
      tasks.push(taskId);
      this.setCompletedTasks(tasks);
    }
  },

  // Roadmap preferences
  getRoadmapPrefs(): RoadmapPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ROADMAP_PREFS);
      return data ? JSON.parse(data) : { role: '', level: '', goal: '' };
    } catch {
      return { role: '', level: '', goal: '' };
    }
  },

  setRoadmapPrefs(prefs: RoadmapPreferences): void {
    localStorage.setItem(STORAGE_KEYS.ROADMAP_PREFS, JSON.stringify(prefs));
  },

  removeRoadmapPrefs(): void {
    localStorage.removeItem(STORAGE_KEYS.ROADMAP_PREFS);
  },

  // Sidebar collapsed state
  getSidebarCollapsed(): boolean {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  },

  setSidebarCollapsed(collapsed: boolean): void {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(collapsed));
  },

  // Language preference
  getLanguage(): string | null {
    return localStorage.getItem('practix_language');
  },

  setLanguage(lang: string): void {
    localStorage.setItem('practix_language', lang);
  },

  // Timer/Stopwatch state
  getTimerState(): TimerState | null {
    try {
      const data = localStorage.getItem('practix_timer_state');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setTimerState(state: TimerState): void {
    localStorage.setItem('practix_timer_state', JSON.stringify(state));
  },

  removeTimerState(): void {
    localStorage.removeItem('practix_timer_state');
  },

  // Clear all Practix-related storage
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      if (!key.endsWith('_')) {
        localStorage.removeItem(key);
      }
    });

    // Clear task codes (they have dynamic keys)
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_KEYS.TASK_CODE_PREFIX))
      .forEach(key => localStorage.removeItem(key));

    // Clear other storage keys
    localStorage.removeItem('practix_language');
    localStorage.removeItem('practix_timer_state');
  }
};

export default storage;
