import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config/api';

export default function PublicTestLanding({ testId, onLogin }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`${API_BASE}/tests/share/${testId}`);
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
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined animate-spin text-4xl text-indigo-500">sync</span>
          <p className="mt-3 text-sm font-black uppercase tracking-widest text-slate-500">Preparing assessment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="material-symbols-outlined rounded-2xl bg-rose-50 p-4 text-4xl text-rose-600">error_outline</span>
          <h1 className="mt-5 text-2xl font-black text-slate-950">Unable to Open Test</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <a href="/" className="mt-7 inline-flex w-full items-center justify-center rounded-2xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">V</div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-slate-950">Vayl</p>
              <p className="text-xs font-bold text-slate-400">Shared Test</p>
            </div>
          </div>
          <button onClick={onLogin} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50">
            Sign In
          </button>
        </nav>

        <main className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700">
              {test.category || 'Mock Test'}
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{test.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500">
              {test.description || 'Sign in to start this assessment, save your attempt, and unlock detailed performance analytics after submission.'}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Duration', `${test.durationMinutes || 0} mins`, 'timer'],
                ['Marks', test.totalMarks || 0, 'grade'],
                ['Sections', test.sections?.length || 1, 'splitscreen'],
              ].map(([label, value, icon]) => (
                <div key={label} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                  <span className="material-symbols-outlined text-slate-400">{icon}</span>
                  <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">Begin Assessment</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use your student account so your response, timing, result, and review data are saved correctly.
            </p>
            <button onClick={onLogin} className="mt-6 w-full rounded-2xl border border-slate-950 bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800">
              Continue with Google
            </button>
            <p className="mt-5 text-xs leading-5 text-slate-400">
              By continuing, you agree to the platform terms and privacy policy.
            </p>
          </aside>
        </main>
      </div>
    </div>
  );
}
