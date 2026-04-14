import React, { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForcePasswordChange({ isDark, user, onPasswordChanged, onLogout }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ 
          newPassword: password 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update password');
      
      onPasswordChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md ${isDark ? 'bg-slate-950/80' : 'bg-slate-900/60'}`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${isDark ? 'bg-surface-container border border-outline-variant/30' : 'bg-white'}`}>
        
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/10 text-orange-500 mb-4">
            <span className="material-symbols-outlined text-2xl">shield_lock</span>
          </div>
          <h2 className={`text-xl font-bold font-headline ${isDark ? 'text-on-surface' : 'text-slate-900'}`}>
            Security Update Required
          </h2>
          <p className={`mt-2 text-sm ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
            For your security, please change your default coaching password before accessing your dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center">
            <span className="material-symbols-outlined text-base mr-2">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isDark ? 'bg-surface-container-low border-outline-variant/30 text-on-surface placeholder:text-outline' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-on-surface-variant' : 'text-slate-500'}`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={`w-full px-4 py-3 rounded-xl text-sm font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${isDark ? 'bg-surface-container-low border-outline-variant/30 text-on-surface placeholder:text-outline' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>

          <div className="mt-6 pt-2 flex gap-3">
            <button
              type="button"
              onClick={onLogout}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-colors border ${isDark ? 'bg-transparent text-on-surface border-outline-variant/30 hover:bg-surface-container-high' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed border-none"
            >
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
