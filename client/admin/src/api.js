import axios from 'axios';

const DEFAULT_API_BASE = import.meta.env.DEV ? '/api' : '/';
const API_BASE = import.meta.env.VITE_API_URL || DEFAULT_API_BASE;

const adminBasePath = () => {
  const base = import.meta.env.VITE_ADMIN_BASE || import.meta.env.BASE_URL || '/sys-9f3k-ctrl/';
  return base.endsWith('/') ? base : `${base}/`;
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const baseURL = String(config.baseURL || '').replace(/\/$/, '');
  if (baseURL.endsWith('/api') && typeof config.url === 'string' && config.url.startsWith('/api/')) {
    config.url = config.url.slice(4);
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      const currentPath = window.location.pathname;
      const basePath = adminBasePath();
      const normalizedBasePath = basePath.replace(/\/$/, '');
      const isOnLoginPage = currentPath.endsWith('/login') || currentPath === basePath || currentPath === normalizedBasePath || currentPath === '/';
      
      if (!isOnLoginPage) {
        window.location.href = basePath;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
