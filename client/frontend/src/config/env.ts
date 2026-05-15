/**
 * API Base URL — resolved at RUNTIME, not build time.
 *
 * NEXT_PUBLIC_* variables are embedded at build time.
 * In production, NEXT_PUBLIC_API_URL MUST be set in the Vercel dashboard
 * to point to the correct backend (e.g. https://api.vayl.in).
 *
 * In DEVELOPMENT: Falls back to the local Express server.
 */
const isProd = process.env.NODE_ENV === 'production';

function resolveApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const normalizedEnvUrl = envUrl.replace(/\/$/, '');

  // Dev fallback — local Express server
  if (!isProd) {
    return normalizedEnvUrl || 'http://localhost:5000';
  }

  // Production: NEXT_PUBLIC_API_URL must be a valid absolute URL.
  // Guard against common mistake of setting it without https://
  if (normalizedEnvUrl.startsWith('http')) {
    return normalizedEnvUrl;
  }

  return 'https://api.vayl.in';
}

export const API_BASE_URL = resolveApiUrl();
