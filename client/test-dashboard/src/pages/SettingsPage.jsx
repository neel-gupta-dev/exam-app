export default function SettingsPage({ user, onLogout }) {
  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Student Settings</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
          Manage your account and dashboard preferences. The student app is light mode only for now.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Account</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ['Name', user?.name || user?.username || 'Student'],
              ['Email', user?.email || 'Not available'],
              ['Login Type', user?.authMethod === 'b2b' ? 'Coaching' : 'Scholar'],
              ['Institution', user?.tenantId?.name || 'Independent'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</p>
                <p className="mt-2 truncate text-sm font-bold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="material-symbols-outlined rounded-2xl bg-indigo-50 p-3 text-indigo-600">light_mode</span>
            <h2 className="mt-5 text-lg font-black text-slate-950">Appearance</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Light mode is enabled across the student dashboard.
            </p>
          </div>
          <button onClick={onLogout} className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100">
            Logout
          </button>
        </aside>
      </div>
    </div>
  );
}
