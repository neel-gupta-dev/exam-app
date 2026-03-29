const isProd = process.env.NODE_ENV === 'production';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (isProd ? 'https://exam-app-production-7f5d.up.railway.app/api' : 'http://localhost:5000/api');

