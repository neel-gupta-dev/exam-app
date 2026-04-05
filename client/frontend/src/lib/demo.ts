/**
 * DEMO_ALLOWED_PATHS
 * Paths that unauthenticated visitors can access in "demo mode".
 * These pages show mock data instead of API data.
 * All other dashboard paths will show the DemoSignupModal.
 */
export const DEMO_ALLOWED_PATHS = [
  '/',
  '/focus-room',
  '/flashcards',
  '/analytics',
  '/performance',
  '/profile',
] as const;

export type DemoAllowedPath = typeof DEMO_ALLOWED_PATHS[number];

export function isDemoAllowedPath(pathname: string): boolean {
  return DEMO_ALLOWED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}
