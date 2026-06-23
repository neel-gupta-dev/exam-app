'use client';

import { useEffect, useRef } from 'react';

/**
 * useBattleActivityTracker Hook
 *
 * Tracks user activity during a live JEE Battle and sends heartbeat
 * pings to increment totalActiveSeconds on the backend.
 *
 * Only sends heartbeats when:
 * - The user has a valid auth token
 * - The battle is actively in progress (status === 'active')
 * - The browser tab is visible
 * - The user has interacted within the last 2 minutes
 *
 * @param token - The user's JWT auth token from localStorage
 * @param battleStatus - Current battle status ('waiting' | 'active' | 'finished')
 */
export function useBattleActivityTracker(
  token: string | null,
  battleStatus: string | null
) {
  const lastActivityRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Heartbeat every 30 seconds
  const PULSE_INTERVAL = 30000;
  // Consider user idle after 2 minutes of no interaction
  const IDLE_THRESHOLD = 120000;

  useEffect(() => {
    // Only track study time during an active battle
    if (!token || battleStatus !== 'active') {
      // Clean up any existing interval if battle is no longer active
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vayl.in';
    lastActivityRef.current = Date.now();

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Listen for user interaction events
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const isWindowVisible = document.visibilityState === 'visible';

      // Only send heartbeat if tab is visible AND user is actively interacting
      if (isWindowVisible && timeSinceLastActivity < IDLE_THRESHOLD) {
        try {
          await fetch(`${apiUrl}/users/heartbeat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ duration: PULSE_INTERVAL / 1000 }),
          });
        } catch {
          // Silently fail — non-critical telemetry
        }
      }
    }, PULSE_INTERVAL);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, battleStatus]);
}
