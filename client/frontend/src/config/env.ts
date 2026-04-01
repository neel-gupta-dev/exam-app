const isProd = process.env.NODE_ENV === 'production';

/**
 * API Base URL
 *
 * In PRODUCTION: Use '/api' (relative path).
 *   Vercel's rewrite in next.config.js proxies all /api/* calls to Railway server-side.
 *   This means the browser never makes a cross-origin request → ZERO CORS issues.
 *
 * In DEVELOPMENT: Point directly to the local Express server.
 */
export const API_BASE_URL = isProd
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');
