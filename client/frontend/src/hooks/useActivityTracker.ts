import { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

/**
 * useActivityTracker Hook
 * Tracks user activity across the platform and sends a heartbeat to the backend.
 * Increments totalActiveSeconds in 30-second pulses.
 * 
 */
export function useActivityTracker() {
  const { user, token } = useAuth();
  const [isFocusingGlobal, setIsFocusingGlobal] = useState(false);
  const lastActivityRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Throttle heartbeat to every 30 seconds
  const PULSE_INTERVAL = 30000;
  // Consider user idle after 2 minutes of no interaction
  const IDLE_THRESHOLD = 120000;

  useEffect(() => {
    if (!token || !user) return;
    lastActivityRef.current = Date.now();

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const startFocus = () => setIsFocusingGlobal(true);
    const stopFocus = () => setIsFocusingGlobal(false);

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('VAYL_FOCUS_START', startFocus);
    window.addEventListener('VAYL_FOCUS_STOP', stopFocus);

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      const isWindowVisible = document.visibilityState === 'visible';

      // Send heartbeat ONLY if the tab is visible
      // This stops tracking if the user switches to a different tab or minimizes the browser
      if (isWindowVisible && (isFocusingGlobal || timeSinceLastActivity < IDLE_THRESHOLD)) {
        try {
          await api.post('/users/heartbeat', { duration: PULSE_INTERVAL / 1000 });
          console.debug('Activity Heartbeat Sent');
        } catch (error) {
          console.error('Failed to send activity heartbeat', error);
        }
      }
    }, PULSE_INTERVAL);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('VAYL_FOCUS_START', startFocus);
      window.removeEventListener('VAYL_FOCUS_STOP', stopFocus);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, user, isFocusingGlobal]);

  return null;
}
