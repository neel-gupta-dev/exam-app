import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

/**
 * Resolve the base URL for the Axios instance at runtime.
 *
 * API_BASE_URL is a NEXT_PUBLIC_* variable baked at build time.
 * If a stale build has the old '/api' relative path, we detect that
 * at runtime using window.location.hostname and fall back to the
 * canonical production URL. This makes login/auth immune to stale builds.
 */
function resolveBaseURL(): string {
  // If API_BASE_URL is an absolute URL (starts with http), trust it directly.
  if (API_BASE_URL && API_BASE_URL.startsWith('http')) {
    return API_BASE_URL;
  }

  // Runtime fallback: check if we're running in a browser in production.
  // This check is evaluated when the JS bundle runs in the browser — NOT at build time.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // Deployed site (vayl.in or any preview URL) — always use the canonical API.
    return 'https://api.vayl.in';
  }

  // SSR / server-side: return the env var as-is.
  return API_BASE_URL || 'https://api.vayl.in';
}

const resolvedBaseURL = resolveBaseURL();

const api = axios.create({
  baseURL: resolvedBaseURL,
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
