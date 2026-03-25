'use client';

import { useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useModifierKey } from './useModifierKey';

export function useHaptics() {
  const { hapticsEnabled } = useAuth();
  const { isMac } = useModifierKey();
  
  // Audio for macOS simulation
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  const playTapticClick = useCallback(() => {
    if (!clickAudioRef.current) {
      // Create a very subtle "click" using a base64 sine wave or similar if you don't have an asset.
      // For now, we'll use a very short 0.1s synthesized click via Web Audio API for maximum compatibility.
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // Low frequency for tactile feel
      oscillator.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (!hapticsEnabled) return;

    if ("vibrate" in navigator) {
      navigator.vibrate(pattern);
    }

    if (isMac) {
      playTapticClick();
    }
  }, [hapticsEnabled, isMac, playTapticClick]);

  const vibrateSuccess = useCallback(() => {
    vibrate([100, 50, 100]);
  }, [vibrate]);

  const vibrateClick = useCallback(() => {
    vibrate(10);
  }, [vibrate]);

  const vibrateWarning = useCallback(() => {
    vibrate(400);
  }, [vibrate]);

  return { vibrateSuccess, vibrateClick, vibrateWarning };
}
