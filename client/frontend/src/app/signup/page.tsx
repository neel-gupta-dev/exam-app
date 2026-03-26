'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';

export default function SignupPage() {
  const { user, isLoading, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !isLoading && !initialCheckDone) {
      if (user) {
        toast.info('You are already logged in.');
        router.replace('/');
      }
      setInitialCheckDone(true);
    }
  }, [user, isLoading, initialCheckDone, router, mounted]);

  if (!mounted) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="font-body selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background Elements */}
      <div className="orb bg-indigo-600 w-[500px] h-[500px] -top-48 -left-48"></div>
      <div className="orb bg-primary w-[400px] h-[400px] -bottom-32 -right-32"></div>
      <div className="orb bg-indigo-900 w-[300px] h-[300px] top-1/2 left-1/4 -translate-y-1/2 opacity-10"></div>
      <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40"></div>

      {/* Header / Brand */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16">
        <div className="flex items-center gap-2 text-xl font-headline font-bold tracking-tight text-white">
          <span className="material-symbols-outlined text-indigo-500 text-2xl">account_balance_wallet</span>
          Knowledge Vault
        </div>
      </header>

      <main className="w-full max-w-[480px] px-6 py-20 z-10">
        {/* Signup Card */}
        <div className="bg-surface-container/60 backdrop-blur-2xl rounded-2xl p-8 md:p-10 shadow-2xl relative border border-white/5">
          <div className="mb-8 text-center">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-2">Create your vault</h1>
            <p className="text-on-surface-variant text-sm">Secure your knowledge in the digital age.</p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Google Login Handler */}
            {(() => {
              const handleGoogleLogin = () => {
                window.location.href = `${API_BASE_URL}/auth/google`;
              };
              return null;
            })()}
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="name">Full Name</label>
              <input
                className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm"
                id="name"
                placeholder="John Doe"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="email">Email Address</label>
              <input
                className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm"
                id="email"
                placeholder="john@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="password">Password</label>
              <input
                className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm"
                id="password"
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface-variant" htmlFor="confirm_password">Confirm Password</label>
              <input
                className="w-full bg-surface-container-highest/50 border border-white/5 text-on-surface placeholder:text-outline/50 p-3.5 rounded-xl focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none text-sm"
                id="confirm_password"
                placeholder="••••••••"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {/* Action Button */}
            <button
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-headline font-bold py-4 rounded-xl transition-all transform active:scale-[0.98] shadow-xl shadow-indigo-600/20 mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Unlock Access'
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#141a20] px-4 text-[10px] font-label text-outline uppercase tracking-[0.2em] rounded-full">Social Integration</span>
              </div>
            </div>

            {/* Social Options */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors py-3 rounded-xl border border-white/5" 
                type="button"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                <span className="font-label text-xs font-medium">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 transition-colors py-3 rounded-xl border border-white/5" type="button">
                <svg fill="#000000" width="22px" height="22px" viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg"><path d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z" /></svg>
                <span className="font-label text-xs font-medium">GitHub</span>
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-on-surface-variant text-sm">
              Already part of the network?
              <Link className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors ml-1" href="/login">Login here</Link>
            </p>
          </div>
        </div>

        {/* System Message */}
        <div className="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-3 items-center">
          <span className="material-symbols-outlined text-indigo-400 text-sm">verified_user</span>
          <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-wider">
            End-to-end encrypted protocol active
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto w-full py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center px-12 gap-4 z-10">
        <div className="text-xs font-headline font-bold text-slate-500 uppercase tracking-widest">
          © 2024 Knowledge Vault Systems.
        </div>
        <div className="flex gap-8">
          <Link className="font-inter text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors" href="#">Terms</Link>
          <Link className="font-inter text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors" href="#">Privacy</Link>
          <Link className="font-inter text-[10px] uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors" href="#">Support</Link>
        </div>
      </footer>
    </div>
  );
}
