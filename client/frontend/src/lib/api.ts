import axios from 'axios';

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  if (typeof window !== 'undefined') {
    // Fallback for development if env is missing
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) return 'http://localhost:5000/api';
  }
  
  return ''; // Relative path fallback (will likely fail on production if not configured)
};

const baseURL = getBaseURL();

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  console.error("[API] NEXT_PUBLIC_API_URL is NOT defined! API calls may fail.");
}

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kv_token');
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
      localStorage.removeItem('kv_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
