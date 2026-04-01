import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kv_token') || sessionStorage.getItem('kv_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Only auto-redirect to /login if:
      // 1. We are NOT already on the login page (prevents redirect loop), AND
      // 2. There was actually a stored token that silently expired (not a fresh OAuth init)
      const isOnLoginPage = window.location.pathname === '/login';
      const hadStoredToken =
        !!localStorage.getItem('kv_token') || !!sessionStorage.getItem('kv_token');

      if (!isOnLoginPage && hadStoredToken) {
        localStorage.removeItem('kv_token');
        localStorage.removeItem('kv_sessionId');
        sessionStorage.removeItem('kv_token');
        sessionStorage.removeItem('kv_sessionId');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
