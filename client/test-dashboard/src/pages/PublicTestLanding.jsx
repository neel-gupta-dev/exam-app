import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE } from '../config/api';

export default function PublicTestLanding({ testId, onLogin }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/tests/${testId}/share-details`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load test details');
        setTest(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [testId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm"
        >
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm font-black uppercase tracking-widest text-slate-400">Preparing assessment</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 mb-5">
            <span className="material-symbols-outlined text-4xl text-rose-500" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Unable to Open Test</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <a
            href="/"
            className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-lg"
          >
            Return Home
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-md shadow-indigo-200/50">
              <img src="/vayl-logo.png" alt="Vayl" className="h-7 w-7 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <span className="text-sm font-black text-slate-900 hidden">V</span>
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-900">Vayl</p>
              <p className="text-[11px] font-semibold text-slate-400">Shared Test</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogin}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm transition hover:shadow-md"
          >
            Sign In
          </motion.button>
        </motion.nav>

        <main className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Test info */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-48 w-64 bg-gradient-to-bl from-indigo-50/70 to-transparent rounded-3xl" />
            <div className="relative">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-600">
                {test.category || 'Mock Test'}
              </span>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 md:text-5xl font-headline">{test.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                {test.description || 'Sign in to start this assessment, save your attempt, and unlock detailed performance analytics after submission.'}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  ['Duration', `${test.durationMinutes || 0} mins`, 'schedule'],
                  ['Total Marks', test.totalMarks || 0, 'grade'],
                  ['Questions', test.questionCount || (test.sections?.reduce((sum, s) => sum + (s.questionCount || 0), 0)) || 0, 'format_list_numbered'],
                ].map(([label, value, icon], idx) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.07 }}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <span className="material-symbols-outlined text-indigo-400" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
                    <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA aside */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 mb-5">
              <span className="material-symbols-outlined text-indigo-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-headline">Begin Assessment</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use your student account so your response, timing, result, and review data are saved correctly.
            </p>

            <div className="mt-6 space-y-3">
              {[
                ['check_circle', 'Real-time answer saving', 'text-emerald-600'],
                ['analytics', 'Deep analytics after submission', 'text-indigo-600'],
                ['emoji_events', 'Leaderboard ranking', 'text-amber-500'],
              ].map(([icon, text, color]) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <span className={`material-symbols-outlined text-base ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={onLogin}
              className="mt-7 w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09a7.18 7.18 0 010-4.18V7.07H2.18A11.98 11.98 0 001 12c0 1.94.46 3.77 1.18 5.41l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </span>
            </motion.button>
            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              By continuing, you agree to the platform <a href="/terms" className="underline hover:text-slate-600 transition">terms</a> and <a href="/privacy-policy" className="underline hover:text-slate-600 transition">privacy policy</a>.
            </p>
          </motion.aside>
        </main>
      </div>
    </div>
  );
}
