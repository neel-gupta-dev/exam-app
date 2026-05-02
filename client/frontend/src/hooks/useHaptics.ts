'use client';

import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Global single audio context to prevent crashing limit of hardware contexts (usually ~6 allowed)
let globalAudioCtx: AudioContext | null = null;

type WebAudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function isAppleDevice() {
  if (typeof window === 'undefined') return false;
  const platform = window.navigator.platform?.toLowerCase() || '';
  const userAgent = window.navigator.userAgent?.toLowerCase() || '';
  const isIpadOS = platform === 'macintel' && navigator.maxTouchPoints > 1;
  return (
    platform.includes('mac') ||
    platform.includes('iphone') ||
    platform.includes('ipad') ||
    platform.includes('ipod') ||
    userAgent.includes('mac') ||
    userAgent.includes('iphone') ||
    isIpadOS
  );
}

export function useHaptics() {
  const { hapticsEnabled } = useAuth();
  const [isApple] = useState(isAppleDevice);

  const playTapticClick = useCallback((duration: number = 0.1) => {
    try {
      if (!globalAudioCtx) {
        const AudioContextCtor = window.AudioContext || (window as WebAudioWindow).webkitAudioContext;
        if (!AudioContextCtor) return;
        globalAudioCtx = new AudioContextCtor();
      }
      
      // Resume if browser suspended it due to lack of initial user interaction
      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }

      const oscillator = globalAudioCtx.createOscillator();
      const gainNode = globalAudioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, globalAudioCtx.currentTime); // Low frequency for tactile feel
      oscillator.frequency.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0.3, globalAudioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(globalAudioCtx.destination);

      oscillator.start();
      oscillator.stop(globalAudioCtx.currentTime + duration);
    } catch {
      // Ignore: audio context may be completely blocked by strict browser policy 
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!hapticsEnabled) return;

    // Standard Android/PC Web Vibration API
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }

    // Fallback Apple Taptic Audio Simulation
    if (isApple) {
      // If pattern is array and long, it's a success/warning. Give it slightly more duration
      const isLong = Array.isArray(pattern) ? pattern.length > 1 : pattern > 50;
      playTapticClick(isLong ? 0.3 : 0.05);
    }
  }, [hapticsEnabled, isApple, playTapticClick]);

  const vibrateSuccess = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const vibrateClick = useCallback(() => vibrate(10), [vibrate]);
  const vibrateWarning = useCallback(() => vibrate(400), [vibrate]);

  return { vibrateSuccess, vibrateClick, vibrateWarning };
}
