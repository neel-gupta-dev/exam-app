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

  // Dev fallback — local Express server
  if (!isProd) {
    return envUrl || 'http://localhost:5000';
  }

  // Production: NEXT_PUBLIC_API_URL must be a valid absolute URL.
  // Guard against common mistake of setting it without https://
  if (envUrl.startsWith('http')) {
    return envUrl;
  }

  // If we reach here, NEXT_PUBLIC_API_URL is not set or malformed in production.
  // Log a clear error so the deployment issue is visible.
  console.error(
    '[env] NEXT_PUBLIC_API_URL is not set or invalid in production!',
    'Set it in your Vercel dashboard to your backend URL (e.g. https://api.vayl.in).'
  );
  return ''; // Will cause requests to fail visibly rather than hit a stale domain
}

export const API_BASE_URL = resolveApiUrl();
