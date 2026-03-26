export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://exam-app-production-7f5d.up.railway.app/api'
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api';
