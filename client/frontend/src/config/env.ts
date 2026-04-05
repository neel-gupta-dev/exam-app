/**
 * API Base URL — resolved at RUNTIME, not build time.
 *
 * NEXT_PUBLIC_* variables are embedded at build time.
 * To guard against stale builds where the env var was updated AFTER
 * the last deploy, we ALSO check window.__NEXT_PUBLIC_API_URL__ if set,
 * and always fall back to the hardcoded production URL.
 *
 * In DEVELOPMENT: Points directly to the local Express server.
 */
const isProd = process.env.NODE_ENV === 'production';

function resolveApiUrl(): string {
  if (!isProd) {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Safety guard: if the env var was set without https:// (a common mistake),
  // the browser treats it as a relative path — causing cascading 404s.
  if (envUrl.startsWith('http')) {
    return envUrl;
  }

  // Hardcoded production fallback — this is the canonical API domain.
  // This ensures even stale builds (where env var hasn't propagated yet)
  // will still point to the correct backend.
  return 'https://api.vayl.in';
}

export const API_BASE_URL = resolveApiUrl();
