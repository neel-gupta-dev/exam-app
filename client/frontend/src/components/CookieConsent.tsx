'use client';

import React, { useState, useEffect } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

/**
 * CookieConsent Component
 * Ensures compliance with GDPR/CCPA and other privacy regulations,
 * which is a critical requirement for Google AdSense approval.
 */
export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('vayl_cookie_consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vayl_cookie_consent', 'accepted');
    setIsVisible(false);
    sendGAEvent({ event: 'cookie_consent_accepted', value: 'all' });
  };

  const handleDecline = () => {
    localStorage.setItem('vayl_cookie_consent', 'declined');
    setIsVisible(false);
    sendGAEvent({ event: 'cookie_consent_declined', value: 'all' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-6 right-6 md:bottom-6 md:left-auto md:right-8 md:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="glass-card p-6 rounded-[2rem] border border-primary/20 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-xl">cookie</span>
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Privacy Protocol</h3>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed mb-6 opacity-80">
            We use cookies to optimize your deep-work intervals and analyze vault traffic. By accepting, you consent to our high-security data protocol.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 bg-primary text-on-primary py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 bg-surface-container-highest border border-white/5 text-on-surface py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Necessary Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
