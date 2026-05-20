import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE } from "./config/api";

export default function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleScholarLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google?origin=test`;
  };

  const features = [
    { icon: 'monitor', label: 'NTA CBT Engine', sub: 'Authentic interface' },
    { icon: 'layers', label: 'Live Tests', sub: 'Real-time tracking' },
    { icon: 'insights', label: 'Deep Analytics', sub: 'Section & topic data' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 lg:grid-cols-[1fr_440px]">

        {/* Left hero panel */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg">
                <img src="/vayl-logo.png" alt="Vayl" className="h-7 w-7 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                <span className="text-sm font-black text-slate-900 hidden">V</span>
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">Vayl</p>
                <p className="text-xs font-semibold text-slate-400">CBT Platform</p>
              </div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-16 max-w-lg text-5xl font-black leading-tight tracking-tight font-headline"
            >
              A focused workspace for serious test practice.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-5 max-w-md text-base leading-7 text-slate-300"
            >
              Attempt mocks, review mistakes, and track performance from one clean student dashboard.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="relative grid grid-cols-3 gap-3"
          >
            {features.map(({ icon, label, sub }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm hover:bg-white/10 transition">
                <span className="material-symbols-outlined text-indigo-300 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                <p className="mt-2 text-sm font-black">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Right form panel */}
        <section className="flex flex-col justify-center p-7 sm:p-10">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-200">
              <span className="text-sm font-black text-white">V</span>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-900">Vayl</p>
              <p className="text-xs font-semibold text-slate-400">CBT Platform</p>
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Student Login</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 font-headline">Welcome back</h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">Sign in to continue your tests and analytics.</p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mt-5 flex items-center gap-2 overflow-hidden rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
              >
                <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-7 space-y-4">
            {/* Google login */}
            <motion.button
              whileHover={{ scale: 1.015, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09a7.18 7.18 0 010-4.18V7.07H2.18A11.98 11.98 0 001 12c0 1.94.46 3.77 1.18 5.41l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </motion.button>

            {/* Dev-only email/password */}
            {import.meta.env.MODE !== 'production' && (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">or</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <form onSubmit={handleScholarLogin} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Email</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">mail</span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Password</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">lock</span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                      >
                        <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </span>
                    ) : 'Sign In'}
                  </motion.button>
                </form>
              </>
            )}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            By continuing, you agree to Vayl's terms of service.
          </p>
        </section>
      </div>
    </div>
  );
}
