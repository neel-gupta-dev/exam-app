'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL } from '@/config/env';

export default function ForgotPasswordPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center relative overflow-hidden mesh-grid">
      {/* Dynamic Background Orbs */}
      <div className="orb bg-primary w-[500px] h-[500px] -top-48 -left-24 animate-pulse"></div>
      <div className="orb bg-on-primary-fixed-variant w-[400px] h-[400px] bottom-0 -right-20" style={{ animationDelay: '2s' }}></div>
      <div className="orb bg-tertiary w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"></div>

      {/* Header / Brand */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-2 text-xl font-headline font-bold tracking-tight text-white">
          <Image src="/vayl-logo.png" alt="Vayl Logo" width={32} height={32} className="object-contain" />
          Vayl
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-[480px] px-6 py-20">
        <div className="glass-card w-full rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-xl shadow-black/20 text-primary">
              <span className="material-symbols-outlined text-3xl">lock_reset</span>
            </div>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-white mb-3">
              Secure your vault
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              If you have used an email to sign in and have a Google account associated with it, 
              we recommend using that to log in now—it&apos;s the fastest way to recover access.
            </p>
          </div>

          {/* Recommended Path: Google */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-primary-container text-primary-fixed font-headline font-bold rounded-xl shadow-lg shadow-primary-container/20 hover:bg-on-primary-fixed-variant hover:-translate-y-0.5 active:scale-[0.98] transition-all group/btn"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor"></path>
              </svg>
              Fast Tracking via Google
            </button>

            <div className="relative my-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-4 bg-[#141a20]/60 backdrop-blur-md rounded-full text-outline font-bold tracking-widest uppercase">Other options</span>
              </div>
            </div>

            {/* Manual Path */}
            <Link 
              href="/login" 
              className="w-full flex items-center justify-center py-3.5 px-4 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl hover:bg-surface-bright/60 hover:border-outline-variant/40 transition-all text-on-surface text-sm font-medium"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Footer / Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-sm text-on-surface-variant">
            Still need help? 
            <Link className="text-primary font-bold hover:text-white transition-colors underline underline-offset-8 ml-2" href="/support">Contact Support</Link>
          </p>
        </div>
      </main>

      {/* Page Footer Information */}
      <footer className="mt-auto w-full py-8 px-12 flex flex-col md:flex-row justify-between items-center gap-6 z-20">
        <div className="text-[10px] font-headline font-bold text-outline uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
          Vayl Secure Node
        </div>
        <div className="flex gap-8">
          <Link className="font-inter text-xs text-slate-500 hover:text-primary transition-colors" href="/privacy-policy">Privacy</Link>
          <Link className="font-inter text-xs text-slate-500 hover:text-primary transition-colors" href="/terms">Terms</Link>
        </div>
        <div className="font-inter text-[10px] text-slate-600 font-medium">
          © 2024 Vayl. Encrypted Protocol.
        </div>
      </footer>
    </div>
  );
}
