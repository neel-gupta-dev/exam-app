import { useEffect, useRef } from 'react';
import { API_BASE } from '../config/api';

/**
 * useTestActivityTracker Hook
 * 
 * Tracks user activity while taking a test on tests.vayl.in and sends
 * heartbeat pings to increment totalActiveSeconds on the backend.
 * 
 * Only sends heartbeats when:
 * - The user has a valid auth token
 * - The browser tab is visible (not minimized/switched)
 * - The user has interacted within the last 2 minutes (not AFK)
 * 
 * @param {string|null} token - The user's JWT auth token
 */
export default function useTestActivityTracker(token) {
  const lastActivityRef = useRef(0);
  const intervalRef = useRef(null);

  // Heartbeat every 30 seconds
  const PULSE_INTERVAL = 30000;
  // Consider user idle after 2 minutes of no interaction
  const IDLE_THRESHOLD = 120000;

  useEffect(() => {
    if (!token) return;

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
          await fetch(`${API_BASE}/users/heartbeat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ duration: PULSE_INTERVAL / 1000 }),
          });
        } catch (err) {
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
  }, [token]);
}
