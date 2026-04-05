const isProd = process.env.NODE_ENV === 'production';

/**
 * API Base URL
 *
 * In PRODUCTION: Reads from NEXT_PUBLIC_API_URL env var (set to https://api.vayl.in).
 *   The browser calls api.vayl.in directly — CORS is handled by the backend's
 *   *.vayl.in allow-rule. No Vercel proxy needed.
 *
 * In DEVELOPMENT: Points directly to the local Express server (no /api suffix).
 */
export const API_BASE_URL = isProd
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
