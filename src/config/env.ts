import { storage } from "../lib/storage";

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || "",
  IS_DEV: import.meta.env.DEV,
};

export const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = storage.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};
