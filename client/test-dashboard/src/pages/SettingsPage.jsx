import { motion } from 'framer-motion';

export default function SettingsPage({ user, onLogout }) {
  const fields = [
    ['Name', user?.name || user?.username || 'Student', 'person'],
    ['Email', user?.email || 'Not available', 'mail'],
    ['Login Type', user?.authMethod === 'b2b' ? 'Coaching Member' : 'Scholar (Google)', 'login'],
    ['Institution', user?.tenantId?.name || 'Independent', 'school'],
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-64 bg-gradient-to-bl from-indigo-50 to-transparent rounded-3xl" />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl font-headline">Settings</h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
            Manage your account details and preferences. The student app is light mode only.
          </p>
        </div>
      </motion.section>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Account details */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {/* Profile avatar */}
          <div className="mb-7 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl font-black text-indigo-700 ring-2 ring-white ring-offset-2 shadow-md">
              {user?.profilePic
                ? <img src={user.profilePic} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                : user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <p className="text-lg font-black text-slate-900">{user?.name || user?.username}</p>
              <p className="text-sm text-slate-500">{user?.email || ''}</p>
              <span className="mt-1 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-600">
                {user?.authMethod === 'b2b' ? 'Coaching Member' : 'Scholar'}
              </span>
            </div>
          </div>

          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">Account Info</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {fields.map(([label, value, icon], idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.06 }}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <span className="material-symbols-outlined text-base text-slate-500">{icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                  <p className="truncate text-sm font-bold text-slate-800">{value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          {/* Appearance */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 mb-4">
              <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>light_mode</span>
            </div>
            <h2 className="text-base font-black text-slate-900">Appearance</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Light mode is enabled across the student dashboard.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="text-sm font-bold text-slate-700">Light Mode</span>
              <div className="flex h-6 w-11 items-center rounded-full bg-indigo-600 px-0.5">
                <div className="h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm transition" />
              </div>
            </div>
          </div>

          {/* XP / Level */}
          {user?.levelData && (
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-black text-indigo-900">Level {user.levelData.currentLevel}</h2>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{user.levelData.totalXP} XP</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-indigo-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, user.levelData.progressToNext || 0)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
              <p className="mt-2 text-xs text-indigo-500">{user.levelData.progressToNext?.toFixed(0) ?? 0}% to next level</p>
            </div>
          )}

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-black text-rose-700 transition hover:bg-rose-100"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">logout</span>
              Logout
            </span>
          </motion.button>
        </motion.aside>
      </div>
    </div>
  );
}
