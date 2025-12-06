
import { ENV, getHeaders } from '../config/env';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Global callback registry for auth failures (e.g. 401)
let onUnauthorizedCallback: (() => void) | null = null;

export const setupInterceptors = (onUnauthorized: () => void) => {
  onUnauthorizedCallback = onUnauthorized;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (res.status === 401) {
    if (onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new ApiError('Session expired', 401);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return {} as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.message || data.error || res.statusText, res.status, data);
  }
  
  return data as T;
};

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${ENV.API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse<T>(res);
  },

  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${ENV.API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },
  
  patch: async <T>(endpoint: string, body: any): Promise<T> => {
    const res = await fetch(`${ENV.API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${ENV.API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<T>(res);
  }
};
