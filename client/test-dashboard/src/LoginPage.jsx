import React, { useState } from "react";
import { API_BASE } from "./config/api";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import { faComputer } from '@fortawesome/free-solid-svg-icons';
// import { byPrefixAndName } from '@awesome.me/kit-KIT_CODE/icons'

export default function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState("scholar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Coaching login is intentionally commented out in the UI for now.
  // const [username, setUsername] = useState('');
  // const [coachingPassword, setCoachingPassword] = useState('');

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

  /*
  const handleCoachingLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: coachingPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  */

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google?origin=test`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <main className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_440px]">
        <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-slate-950">
                <img src="/vayl-logo.png" alt="Vayl_Logo" srcset="" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest">
                  Vayl
                </p>
                <p className="text-xs font-bold text-slate-400">CBT Platform</p>
              </div>
            </div>
            <h1 className="mt-20 max-w-lg text-5xl font-black leading-tight tracking-tight">
              A focused workspace for serious test practice.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
              Attempt mocks, review mistakes, and track performance from one
              clean student dashboard.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              ["NTA CBT", "Engine", <FontAwesomeIcon icon={faComputer} />],
              ["Live", "Tests"],
              ["Deep", "Analytics", <FontAwesomeIcon icon={faArrowTrendUp} />],
            ].map(([top, bottom, icon]) => (
              <div
                key={top}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-lg font-black flex items-center gap-2">
                  {top} {icon}
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {bottom}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">
                V
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-slate-950">
                  Vayl
                </p>
                <p className="text-xs font-bold text-slate-400">CBT Platform</p>
              </div>
            </div>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
            Student Login
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            Welcome back
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sign in to continue your tests and analytics.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => {
                setActiveTab("scholar");
                setError("");
              }}
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-black transition ${
                activeTab === "scholar"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              Scholar Login
            </button>
            {/* Coaching login tab is commented out for now. */}
          </div>

          {error && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          {activeTab === "scholar" && (
            <form onSubmit={handleScholarLogin} className="mt-6 space-y-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09a7.18 7.18 0 010-4.18V7.07H2.18A11.98 11.98 0 001 12c0 1.94.46 3.77 1.18 5.41l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                  or
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    mail
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    lock
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border border-slate-950 bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Coaching login form is commented out for now. */}
        </section>
      </main>
    </div>
  );
}
