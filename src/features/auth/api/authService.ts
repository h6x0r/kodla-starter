import { User, UserPreferences } from '../../../types';
import { authRepository } from '../data/repository';
import { STORAGE_KEYS } from '../../../config/constants';
// import { api } from '../../../services/api'; // Uncomment when backend is fully ready

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

/**
 * Auth Service
 * 
 * Currently operating in Simulation Mode using Repository pattern.
 * To switch to Real API, implement the api.post calls instead of repository calls.
 */
export const authService = {
  
  login: async (creds: LoginPayload): Promise<AuthResponse> => {
    // Simulation: Fetch user from local mock repository
    const user = await new Promise<User>((resolve) => {
        setTimeout(async () => {
            resolve(await authRepository.getUser());
        }, 800);
    });

    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(7);
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    return { token, user };
  },

  register: async (creds: RegisterPayload): Promise<AuthResponse> => {
    // Simulation: Create user in local mock repository
    const user = await new Promise<User>((resolve) => {
        setTimeout(async () => {
             const u = await authRepository.getUser();
             const newUser = { 
               ...u, 
               name: creds.name, 
               email: creds.email, 
               id: 'u_' + Date.now() 
             };
             resolve(newUser);
        }, 800);
    });

    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(7);
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    
    return { token, user };
  },

  resetPassword: async (email: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 1000);
    });
  },

  getMe: async (): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(async () => resolve(await authRepository.getUser()), 400);
    });
  },

  updatePreferences: async (prefs: Partial<UserPreferences>): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(async () => {
            const updated = await authRepository.updateUser({ preferences: prefs as any });
            resolve(updated);
        }, 600);
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  upgrade: async (): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(async () => resolve(await authRepository.getUser()), 600);
    });
  }
};