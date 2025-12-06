
import { api } from './api';
import { User } from '../types';
import { STORAGE_KEYS } from '../config/constants';

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

export const authService = {
  login: async (creds: LoginPayload): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/login', creds);
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    }
    return data;
  },

  register: async (creds: RegisterPayload): Promise<AuthResponse> => {
    const data = await api.post<AuthResponse>('/auth/register', creds);
    if (data.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    }
    return data;
  },

  getMe: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  upgrade: async (): Promise<User> => {
    return api.post<User>('/users/upgrade', {});
  }
};
