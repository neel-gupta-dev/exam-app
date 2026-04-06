import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      
      // Determine if we are already on the login page to avoid redirect loops
      const currentPath = window.location.pathname;
      const isOnLoginPage = currentPath.endsWith('/login') || currentPath.endsWith('/sys-9f3k-ctrl/') || currentPath === '/';
      
      if (!isOnLoginPage) {
        // Redirect to the Admin Panel root relative to the current domain
        // This ensures we stay within the admin panel context.
        window.location.href = './'; 
      }
    }
    return Promise.reject(err);
  }
);

export default api;
