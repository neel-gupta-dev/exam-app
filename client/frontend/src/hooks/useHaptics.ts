'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

// Global single audio context to prevent crashing limit of hardware contexts (usually ~6 allowed)
let globalAudioCtx: AudioContext | null = null;

export function useHaptics() {
  const { hapticsEnabled } = useAuth();
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    // Determine if device is Apple (Mac, iPhone, iPad, iPod) because they block navigator.vibrate
    const platform = window.navigator.platform?.toLowerCase() || '';
    const userAgent = window.navigator.userAgent?.toLowerCase() || '';
    
    // iPadOS 13+ platform returns "MacIntel" but maxTouchPoints > 0
    const isIpadOS = platform === 'macintel' && navigator.maxTouchPoints > 1;
    
    if (
      platform.includes('mac') || 
      platform.includes('iphone') || 
      platform.includes('ipad') || 
      platform.includes('ipod') ||
      userAgent.includes('mac') ||
      userAgent.includes('iphone') ||
      isIpadOS
    ) {
      setIsApple(true);
    }
  }, []);

  const playTapticClick = useCallback((duration: number = 0.1) => {
    try {
      if (!globalAudioCtx) {
        globalAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
    } catch (error) {
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
