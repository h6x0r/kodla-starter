
export const ENV = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  GEMINI_API_KEY: process.env.API_KEY || '',
  IS_DEV: process.env.NODE_ENV === 'development',
};

export const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('kodla_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
