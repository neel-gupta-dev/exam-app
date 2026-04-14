import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function LoginPage({ isDark, onLogin }) {
  const [activeTab, setActiveTab] = useState('scholar'); // 'scholar' | 'coaching'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Scholar form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Coaching form
  const [username, setUsername] = useState('');
  const [coachingPassword, setCoachingPassword] = useState('');

  const handleScholarLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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

  const handleCoachingLogin = async (e) => {
    e.preventDefault();
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

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? 'bg-background' : 'bg-slate-50'}`}>
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] ${isDark ? 'bg-indigo-500/8' : 'bg-indigo-200/40'}`}></div>
        <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[150px] ${isDark ? 'bg-purple-500/5' : 'bg-purple-200/30'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
            <span className="text-3xl">📐</span>
          </div>
          <h1 className={`text-3xl font-extrabold font-headline tracking-tight ${isDark ? 'text-on-background' : 'text-slate-900'}`}>
            Focused Scholar
          </h1>
          <p className={`mt-2 text-sm font-medium ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
            Your exam preparation platform
          </p>
        </div>

        {/* Login Card */}
        <div className={`rounded-2xl p-8 transition-all duration-300 ${isDark ? 'bg-surface-container border border-outline-variant/30' : 'bg-white shadow-2xl border border-slate-100'}`}>
          
          {/* Tabs */}
          <div className={`flex rounded-xl p-1 mb-8 ${isDark ? 'bg-surface-container-low' : 'bg-slate-100'}`}>
            <button
              onClick={() => { setActiveTab('scholar'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer border-none ${
                activeTab === 'scholar'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : isDark ? 'text-on-surface-variant hover:text-on-surface bg-transparent' : 'text-slate-500 hover:text-slate-900 bg-transparent'
              }`}
            >
              🎓 Scholar Login
            </button>
            <button
              onClick={() => { setActiveTab('coaching'); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer border-none ${
                activeTab === 'coaching'
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : isDark ? 'text-on-surface-variant hover:text-on-surface bg-transparent' : 'text-slate-500 hover:text-slate-900 bg-transparent'
              }`}
            >
              🏢 Coaching Login
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center">
              <span className="material-symbols-outlined text-base mr-2">error</span>
              {error}
            </div>
          )}

          {/* Scholar Login Form */}
          {activeTab === 'scholar' && (
            <form onSubmit={handleScholarLogin}>
              <div className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-outline' : 'text-slate-400'}`}>mail</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isDark ? 'bg-surface-container-low border-outline-variant/30 text-on-surface placeholder:text-outline' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-outline' : 'text-slate-400'}`}>lock</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isDark ? 'bg-surface-container-low border-outline-variant/30 text-on-surface placeholder:text-outline' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer border-none w-full py-4 bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className={`flex-1 h-px ${isDark ? 'bg-outline-variant/30' : 'bg-slate-200'}`}></div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-outline' : 'text-slate-400'}`}>or</span>
                  <div className={`flex-1 h-px ${isDark ? 'bg-outline-variant/30' : 'bg-slate-200'}`}></div>
                </div>

                {/* Google Login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className={`cursor-pointer w-full py-3.5 flex items-center justify-center gap-3 rounded-xl text-sm font-bold transition-all border ${isDark ? 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container-high' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09a7.18 7.18 0 010-4.18V7.07H2.18A11.98 11.98 0 001 12c0 1.94.46 3.77 1.18 5.41l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
              </div>
            </form>
          )}

          {/* Coaching Login Form */}
          {activeTab === 'coaching' && (
            <form onSubmit={handleCoachingLogin}>
              <div className="space-y-5">
                {/* Info Banner */}
                <div className={`px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2 ${isDark ? 'bg-indigo-500/5 border border-indigo-500/10 text-indigo-300' : 'bg-indigo-50 border border-indigo-100 text-indigo-600'}`}>
                  <span className="material-symbols-outlined text-sm mt-0.5">info</span>
                  <span>Use the username and password provided by your coaching institute.</span>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                    Username
                  </label>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-outline' : 'text-slate-400'}`}>person</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="rahulgupta_rst_001"
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isDark ? 'bg-surface-container-low border-outline-variant/30 text-on-surface placeholder:text-outline' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg ${isDark ? 'text-outline' : 'text-slate-400'}`}>lock</span>
                    <input
                      type="password"
                      value={coachingPassword}
                      onChange={(e) => setCoachingPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isDark ? 'bg-surface-container-low border-outline-variant/30 text-on-surface placeholder:text-outline' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer border-none w-full py-4 bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Signing in...
                    </span>
                  ) : 'Sign In to Coaching'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className={`text-center mt-8 text-xs font-medium ${isDark ? 'text-outline' : 'text-slate-400'}`}>
          {activeTab === 'scholar' ? (
            <>Don't have an account? <button onClick={() => {}} className={`cursor-pointer border-none bg-transparent font-bold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>Sign Up</button></>
          ) : (
            <>Need an account? Contact your coaching institute admin.</>
          )}
        </p>
      </div>
    </div>
  );
}
