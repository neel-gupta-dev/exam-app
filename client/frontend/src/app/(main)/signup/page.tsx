'use client';

import React, { useState, FormEvent, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';
import { sendGAEvent } from '@next/third-parties/google';
import api from '@/lib/api';

type Step = 'form' | 'otp';

/**
 * Signup Page Component — two-step registration:
 * Step 1: Fill in details → send OTP to email.
 * Step 2: Enter OTP → email verified → account created.
 */
export default function SignupPage() {
  const { user, isLoading, register } = useAuth();
  const router = useRouter();

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // OTP step
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [mounted, setMounted] = React.useState(false);
  const [initialCheckDone, setInitialCheckDone] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);
  React.useEffect(() => {
    if (mounted && !isLoading && !initialCheckDone) {
      if (user) { toast.info('You are already logged in.'); router.replace('/'); }
      setInitialCheckDone(true);
    }
  }, [user, isLoading, initialCheckDone, router, mounted]);

  if (!mounted) return null;

  // ── Step 1: Send OTP ──────────────────────────────────────────────────
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields'); return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    if (!termsAccepted || !privacyAccepted) {
      toast.error('Please accept the Terms and Privacy Policy'); return;
    }

    setLoading(true);
    try {
      await api.post('/auth/send-signup-otp', { email });
      toast.success(`Verification code sent to ${email}`);
      setStep('otp');
      startResendCooldown();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to send verification code. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & Create Account ───────────────────────────────
  const handleVerifyAndRegister = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      toast.error('Please enter the complete 6-digit code'); return;
    }

    setLoading(true);
    try {
      // Verify the OTP first
      await api.post('/auth/verify-signup-otp', { email, code });
      // Now create the account
      await register(name, email, password);
      sendGAEvent({ event: 'signup_success', value: 'email' });
    } catch (err: unknown) {
      sendGAEvent({ event: 'signup_error', value: 'email' });
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Verification failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Input Handling ─────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await api.post('/auth/send-signup-otp', { email });
      toast.success('New verification code sent!');
      setOtp(['', '', '', '', '', '']);
      startResendCooldown();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to resend code.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    sendGAEvent({ event: 'login_attempt', value: 'google' });
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="font-body selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="orb bg-indigo-600 w-[500px] h-[500px] -top-48 -left-48"></div>
      <div className="orb bg-primary w-[400px] h-[400px] -bottom-32 -right-32"></div>
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40"></div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-2 text-xl font-headline font-bold tracking-tight text-on-surface">
          <Image src="/vayl-logo.png" alt="Vayl Logo" width={32} height={32} className="object-contain" />
          Vayl
        </div>
      </header>

      <main className="w-full max-w-[480px] px-6 py-20 z-10">
        <div className="bg-surface-container/60 w-full backdrop-blur-2xl rounded-2xl p-8 md:p-10 shadow-2xl relative border border-outline-variant/10">

          {/* ── STEP 1: Registration Form ── */}
          {step === 'form' && (
            <>
              <div className="mb-8 text-center">
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Create your vault</h1>
                <p className="text-on-surface-variant text-sm">Secure your knowledge in the digital age.</p>
              </div>
              <form className="space-y-5" onSubmit={handleSendOtp}>
                {/* Google */}
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-2.5 bg-surface-container-low/40 hover:bg-surface-bright/60 transition-colors py-3 rounded-xl border border-outline-variant/10"
                    type="button"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                    <span className="font-label text-xs font-medium">Continue with Google</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-white/10"></div></div>
                  <div className="relative flex justify-center">
                    <span className="bg-surface-container/60 backdrop-blur-md px-4 text-[10px] font-label text-on-surface-variant font-bold uppercase tracking-[0.2em] rounded-full">Or use email</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="name">Full Name</label>
                  <input className="w-full bg-surface-container-highest/50 border border-outline-variant/10 text-on-surface placeholder:text-on-surface-variant/40 p-3.5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm" id="name" placeholder="John Doe" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="email">Email Address</label>
                  <input className="w-full bg-surface-container-highest/50 border border-outline-variant/10 text-on-surface placeholder:text-on-surface-variant/40 p-3.5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm" id="email" placeholder="john@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
                  <input className="w-full bg-surface-container-highest/50 border border-outline-variant/10 text-on-surface placeholder:text-on-surface-variant/40 p-3.5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm" id="password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="confirm_password">Confirm Password</label>
                  <input className="w-full bg-surface-container-highest/50 border border-outline-variant/10 text-on-surface placeholder:text-on-surface-variant/40 p-3.5 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm" id="confirm_password" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>

                {/* Compliance */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-outline-variant/10 rounded-lg bg-surface-container-highest/50 checked:bg-primary checked:border-primary transition-all cursor-pointer" />
                      <span className="material-symbols-outlined absolute text-[14px] text-on-primary-fixed opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold">check</span>
                    </div>
                    <span className="text-xs text-on-surface-variant leading-relaxed">I agree to the <Link href="/terms" className="text-indigo-400 hover:underline">Terms of Service</Link></span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center mt-1">
                      <input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-outline-variant/10 rounded-lg bg-surface-container-highest/50 checked:bg-primary checked:border-primary transition-all cursor-pointer" />
                      <span className="material-symbols-outlined absolute text-[14px] text-on-primary-fixed opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold">check</span>
                    </div>
                    <span className="text-xs text-on-surface-variant leading-relaxed">I have read and accept the <Link href="/privacy-policy" className="text-indigo-400 hover:underline">Privacy Policy</Link></span>
                  </label>
                </div>

                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-headline font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-xl shadow-indigo-600/20 mt-4 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  type="submit"
                  disabled={loading || !termsAccepted || !privacyAccepted}
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Send Verification Code <span className="material-symbols-outlined text-[18px]">send</span></>
                  }
                </button>
              </form>

              <div className="mt-8 text-center border-t border-white/5 pt-6">
                <p className="text-on-surface-variant text-sm">
                  Already part of the network?
                  <Link className="text-primary hover:text-primary-dim font-semibold transition-colors ml-1" href="/login">Login here</Link>
                </p>
              </div>
            </>
          )}

          {/* ── STEP 2: OTP Verification ── */}
          {step === 'otp' && (
            <>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">mark_email_unread</span>
                </div>
                <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface mb-2">Check your inbox</h1>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  We sent a 6-digit code to<br />
                  <span className="text-primary font-semibold">{email}</span>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleVerifyAndRegister}>
                {/* OTP boxes */}
                <div className="flex gap-3 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-black text-on-surface bg-surface-container-highest/50 border-2 border-outline-variant/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  ))}
                </div>

                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-headline font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-xl shadow-indigo-600/20 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Verify & Create Account <span className="material-symbols-outlined text-[18px]">lock_open</span></>
                  }
                </button>

                {/* Resend + Back */}
                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className="text-xs font-semibold text-primary disabled:text-on-surface-variant/40 disabled:cursor-not-allowed transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStep('form'); setOtp(['', '', '', '', '', '']); }}
                    className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    ← Back to edit details
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div className="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 items-center">
          <span className="material-symbols-outlined text-indigo-400 text-sm">verified_user</span>
          <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">End-to-end encrypted protocol active</p>
        </div>
      </main>

      <footer className="mt-auto w-full py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center px-12 gap-4 z-10">
        <div className="text-xs font-headline font-bold text-on-surface-variant/40 uppercase tracking-widest">© 2026 Vayl Systems.</div>
        <div className="flex gap-8">
          <Link className="font-inter text-[10px] uppercase tracking-widest text-on-surface-variant/50 hover:text-primary transition-colors" href="/terms">Terms</Link>
          <Link className="font-inter text-[10px] uppercase tracking-widest text-on-surface-variant/50 hover:text-primary transition-colors" href="/privacy-policy">Privacy</Link>
          <Link className="font-inter text-[10px] uppercase tracking-widest text-on-surface-variant/50 hover:text-primary transition-colors" href="/contact">Support</Link>
        </div>
      </footer>
    </div>
  );
}
