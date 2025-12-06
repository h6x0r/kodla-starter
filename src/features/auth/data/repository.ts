
import { User } from '../../../types';
import { STORAGE_KEYS } from '../../../config/constants';

const DEFAULT_PREFERENCES = {
  editorFontSize: 14,
  editorMinimap: false,
  editorVimMode: false,
  editorLineNumbers: true,
  editorTheme: 'vs-dark' as const,
  notifications: {
    emailDigest: true,
    newCourses: true,
    marketing: false,
    securityAlerts: true
  }
};

const DEFAULT_USER: User = {
  id: 'u1',
  name: 'Alex Developer',
  email: 'alex@example.com',
  avatarUrl: 'https://picsum.photos/seed/alex/200',
  isPremium: true,
  plan: {
    name: 'Pro Annual',
    expiresAt: '2024-12-31'
  },
  preferences: DEFAULT_PREFERENCES
};

// Simulate a database by persisting the mock user to local storage
const loadUserFromStorage = (): User => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_MOCK_DB);
  if (stored) {
    return JSON.parse(stored);
  }
  return DEFAULT_USER;
};

const saveUserToStorage = (user: User) => {
  localStorage.setItem(STORAGE_KEYS.USER_MOCK_DB, JSON.stringify(user));
};

export const authRepository = {
  getUser: async (): Promise<User> => {
    return loadUserFromStorage();
  },

  updateUser: async (updates: Partial<User>): Promise<User> => {
    const currentUser = loadUserFromStorage();
    const updatedUser = { ...currentUser, ...updates };
    
    // Deep merge preferences if provided
    if (updates.preferences) {
        updatedUser.preferences = {
            ...currentUser.preferences,
            ...updates.preferences,
            notifications: {
                ...currentUser.preferences.notifications,
                ...(updates.preferences.notifications || {})
            }
        };
    }

    saveUserToStorage(updatedUser);
    return updatedUser;
  }
};
