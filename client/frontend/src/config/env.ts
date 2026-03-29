const isProd = process.env.NODE_ENV === 'production';

let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 
  (isProd ? 'https://exam-app-production-7f5d.up.railway.app/api' : 'http://localhost:5000/api');

if (rawApiUrl && !rawApiUrl.startsWith('http') && !rawApiUrl.startsWith('/')) {
  rawApiUrl = `https://${rawApiUrl}`;
}

export const API_BASE_URL = rawApiUrl;

