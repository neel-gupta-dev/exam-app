'use client';

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';

/**
 * Login Page Wrapper
 * Wraps the main login content in a Suspense boundary because we use
 * `useSearchParams` to capture tokens from OAuth redirects.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface flex items-center justify-center text-primary font-black uppercase tracking-widest animate-pulse">Initializing Vault...</div>}>
      <LoginContent />
    </Suspense>
  );
}

/**
 * Main Login Component
 * Handles traditional email/password login, Google OAuth redirects,
 * and automatically diverts authenticated users to the dashboard.
 */
function LoginContent() {
  // Global auth state
  const { user, isLoading, login, loginWithToken } = useAuth();
  
  // Local form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Hydration and redirect state
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // URL and Navigation
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Post-Mount Authentication Check
   * If the user is already perfectly authenticated (token exists and verified),
   * instantly push them to the dashboard preventing manual re-login.
   */
  useEffect(() => {
    if (mounted && !isLoading && !initialCheckDone) {
      if (user) {
        toast.info('You are already logged in.');
        router.replace('/');
      }
      setInitialCheckDone(true);
    }
  }, [user, isLoading, initialCheckDone, router, mounted]);

  /**
   * OAuth Token Interceptor
   * When Google auth redirects back to this page, it appends a `?token=XYZ` query.
   * We intercept this, save the token, and finish the login sequence via AuthContext.
   */
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setGoogleLoading(true);
      
      // Clear old session/token data to prevent pre-migration conflicts
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kv_token');
        localStorage.removeItem('kv_sessionId');
        sessionStorage.removeItem('kv_token');
        sessionStorage.removeItem('kv_sessionId');
      }

      // loginWithToken handles redirect to '/' on success and re-throws on failure
      loginWithToken(token).catch(() => {
        setGoogleLoading(false);
      });
    }
  }, [searchParams, loginWithToken]);

  if (!mounted) return null;

  /**
   * Google OAuth Trigger
   * This MUST go directly to Railway — it is a full browser navigation,
   * not an Axios request, so the Next.js proxy cannot handle it.
   */
  const handleGoogleLogin = () => {
    // Always use the hardcoded production URL as the most reliable fallback.
    // NEXT_PUBLIC_API_URL is read at build time; if it's missing or malformed
    // (e.g., missing https://), we fall back gracefully.
    let apiBase: string;
    if (process.env.NODE_ENV === 'production') {
      const envUrl = process.env.NEXT_PUBLIC_API_URL || '';
      // Guard: ensure the value starts with https:// — if someone set the
      // env var without the protocol, the browser would treat it as a relative
      // path and produce a 404 like /exam-app-production.../api/auth/google.
      apiBase = envUrl.startsWith('http') ? envUrl : 'https://api.vayl.in';
    } else {
      apiBase = 'http://localhost:5000';
    }
    window.location.href = `${apiBase}/auth/google`;
  };

  /**
   * Email/Password Submission
   * Logs in a traditional account using the global `login` method.
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password, remember);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-body text-on-surface antialiased min-h-screen flex flex-col items-center justify-center relative overflow-hidden mesh-grid">
      {/* Dynamic Background Orbs */}
      <div className="orb bg-primary w-[500px] h-[500px] -top-48 -left-24 animate-pulse"></div>
      <div className="orb bg-on-primary-fixed-variant w-[400px] h-[400px] bottom-0 -right-20" style={{ animationDelay: '2s' }}></div>
      <div className="orb bg-tertiary w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"></div>

      {/* Header / Brand */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-2 text-xl font-headline font-bold tracking-tight text-on-surface">
          <Image src="/vayl-logo.png" alt="Vayl Logo" width={32} height={32} className="object-contain " />
          Vayl
        </div>
      </header>
 
      <main className="w-full max-w-[480px] px-6 py-20 z-10">
        {/* The Central Login Card */}
        <section className="glass-card w-full rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          {/* Social Logins */}
          <div className="flex justify-center mb-10">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-surface-container-low/40 border border-outline-variant/20 rounded-xl hover:bg-surface-bright/60 hover:border-outline-variant/40 transition-all text-on-surface text-sm font-medium"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-4 bg-surface backdrop-blur-md rounded-full text-on-surface-variant font-black tracking-widest uppercase border border-outline-variant/10">Or use email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="font-label text-xs font-bold text-on-surface-variant ml-1 uppercase tracking-widest" htmlFor="email">Email Address</label>
              <div className="relative group/input">
                <input
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  id="email"
                  name="email"
                  placeholder="scholar@vault.io"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">Password</label>
                <Link className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors" href="/forgot-password">Forgot password?</Link>
              </div>
              <div className="relative group/input">
                <input
                  className="w-full bg-surface-container-highest/50 border border-outline-variant/30 rounded-xl py-3.5 px-4 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {/* Remember Me */}
            <div className="flex items-center space-x-3 py-1 ml-1 cursor-pointer select-none group" onClick={() => setRemember(!remember)}>
              <div className="relative flex items-center justify-center">
                {/* Hidden input for accessibility/form state */}
                <input 
                  type="checkbox" 
                  checked={remember}
                  readOnly
                  className="sr-only" 
                  id="remember"
                  name="remember"
                />
                {/* Custom UI Wrapper */}
                <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center shadow-sm ${
                  remember ? 'bg-blue-600 border-blue-600' : 'bg-surface-container-highest border-outline-variant/30'
                } group-hover:border-primary/50`}>
                  {remember && (
                    <svg 
                      className="w-3.5 h-3.5 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <label className="text-xs font-black text-on-surface-variant cursor-pointer group-hover:text-on-surface transition-colors uppercase tracking-[0.15em] font-interface">
                Keep session active
              </label>
            </div>
            {/* Primary CTA */}
            <button
              className="w-full bg-primary text-on-primary font-headline font-black uppercase tracking-widest py-4 rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-dim hover:-translate-y-0.5 active:scale-[0.98] transition-all flex justify-center items-center gap-3 group/btn disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Unlock Vault
                  <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform font-bold">key</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Global Loading Overlay (City of Lakes theme) */}
        {googleLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-6 p-10 rounded-3xl bg-surface-container/30 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center animate-pulse">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="text-center relative z-10">
                <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Verifying Vault Credentials...</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:-0.3s]"></span>
                </div>
                <p className="mt-4 text-[10px] text-outline uppercase tracking-[0.2em] font-bold">
                  City of Lakes Security Node
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer / Redirect */}
        <div className="mt-10 text-center">
          <p className="text-sm text-on-surface-variant">
            First time here?
            <Link className="text-primary font-bold hover:text-primary-dim transition-colors underline underline-offset-8 ml-1" href="/signup">Request Access</Link>
          </p>
        </div>
      </main>

      {/* Page Footer Information */}
      <footer className="mt-auto w-full py-8 px-12 flex flex-col md:flex-row justify-between items-center gap-6 z-20">
        <div className="text-[10px] font-headline font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
          Vayl Secure Node
        </div>
        <div className="flex gap-8">
          <Link className="font-inter text-xs text-on-surface-variant/60 hover:text-primary transition-colors" href="/privacy-policy">Privacy</Link>
          <Link className="font-inter text-xs text-on-surface-variant/60 hover:text-primary transition-colors" href="/terms">Terms</Link>
          <Link className="font-inter text-xs text-on-surface-variant/60 hover:text-primary transition-colors" href="/contact">Support</Link>
        </div>
        <div className="font-inter text-[10px] text-on-surface-variant/40 font-medium">
          © 2026 Vayl. Encrypted Protocol.
        </div>
      </footer>
    </div>
  );
}

