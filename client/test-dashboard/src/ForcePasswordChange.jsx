import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from './config/api';

export default function ForcePasswordChange({ user, onPasswordChanged, onLogout }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ newPassword: password }),
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-slate-200"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
            <span className="material-symbols-outlined text-3xl text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>shield_lock</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-headline">Security Update Required</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Change your default coaching password before accessing the dashboard.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 flex items-center gap-2 overflow-hidden rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">New Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">lock</span>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                <span className="material-symbols-outlined text-lg">{showPw ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">Confirm New Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">lock</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition">
                <span className="material-symbols-outlined text-lg">{showConfirm ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          {/* Strength indicator */}
          {password && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => {
                  const strength = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
                    : password.length >= 8 && /[A-Z0-9]/.test(password) ? 3
                    : password.length >= 6 ? 2 : 1;
                  return (
                    <div key={level} className={`h-1.5 flex-1 rounded-full transition ${level <= strength ? strength >= 3 ? 'bg-emerald-500' : strength === 2 ? 'bg-amber-500' : 'bg-rose-500' : 'bg-slate-200'}`} />
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onLogout}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-black text-white shadow-md shadow-indigo-200 transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Update Password'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
