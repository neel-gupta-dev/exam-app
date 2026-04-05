/**
 * Centralized Configuration for Vayl
 * Shared between Frontend and Backend
 */

const isProd = process.env.NODE_ENV === 'production';

export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 
  (isProd ? 'https://vayl.in' : 'http://localhost:3000');

export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 
  (isProd ? 'https://exam-app-production-7f5d.up.railway.app/api' : 'http://localhost:5000/api');

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 
    (isProd 
      ? 'https://exam-app-production-7f5d.up.railway.app/api/auth/google/callback' 
      : 'http://localhost:5000/api/auth/google/callback'),
};

