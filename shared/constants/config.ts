/**
 * Centralized Configuration for Vayl
 * Shared between Frontend and Backend
 */

export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://vayl-app.vercel.app';
export const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://exam-app-production-7f5d.up.railway.app/api';

export const GOOGLE_OAUTH_CONFIG = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'https://exam-app-production-7f5d.up.railway.app/api/auth/google/callback',
};
