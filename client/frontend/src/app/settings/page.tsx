"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [focusTarget, setFocusTarget] = useState(6);

  return (
    <DashboardLayout>
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-2 max-w-lg">
          Refine your cognitive environment. Configure your study parameters and interface preferences for maximum focus.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Category Nav */}
        <div className="col-span-3 space-y-2">
          {["Account", "Study Goals", "Notifications", "Theme", "Security", "Integrations"].map((item, i) => (
            <button
              key={item}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                i === 0 ? "bg-surface-container text-primary font-semibold" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="col-span-9 space-y-10">
          {/* Account Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-on-surface border-b border-outline-variant/20 pb-4">Account Profile</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  defaultValue="Alexander Vance"
                  className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 ring-primary/30 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  defaultValue="alexander.v@scholar.io"
                  className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 ring-primary/30 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* Study Goals */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-on-surface border-b border-outline-variant/20 pb-4">Study Goals</h2>
            <div className="bg-surface-container rounded-xl p-6 space-y-8">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="font-medium text-on-surface">Daily Focus Target</h3>
                  <p className="text-sm text-on-surface-variant">Set your desired deep work hours per day.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setFocusTarget(Math.max(1, focusTarget - 1))}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface-variant text-on-surface hover:bg-surface-bright transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold w-12 text-center">{focusTarget}h</span>
                  <button
                    onClick={() => setFocusTarget(Math.min(16, focusTarget + 1))}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-on-primary hover:opacity-90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface">Weekly Milestone</span>
                  <span className="text-primary font-bold">42 Hours</span>
                </div>
                <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-2/3" />
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-on-surface border-b border-outline-variant/20 pb-4">Notifications</h2>
            <div className="space-y-4">
              {[
                { title: "Pomodoro Reminders", desc: "Alerts when session phases complete.", defaultChecked: true },
                { title: "Weekly Summary", desc: "Performance analytics delivered via email.", defaultChecked: false },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary-container flex items-center justify-center text-primary">
                      <span className="text-sm">🔔</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-on-surface text-sm">{item.title}</h3>
                      <p className="text-xs text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.defaultChecked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Theme Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-bold text-on-surface border-b border-outline-variant/20 pb-4">Theme & Appearance</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: "Deep Focus", bg: "#0b0e11", active: true },
                { name: "Obsidian", bg: "#1a1c20", active: false },
                { name: "Midnight Blue", bg: "#282c34", active: false },
              ].map((theme) => (
                <button
                  key={theme.name}
                  className={`relative aspect-video rounded-xl overflow-hidden group ${
                    theme.active ? "border-2 border-primary ring-4 ring-primary/10" : "border border-outline-variant/30"
                  }`}
                  style={{ backgroundColor: theme.bg }}
                >
                  <div className="absolute inset-0 flex flex-col p-3">
                    <div className="h-2 w-8 bg-primary/40 rounded-full mb-2" />
                    <div className="h-4 w-full bg-surface-variant/40 rounded-lg mb-1" />
                    <div className="h-4 w-2/3 bg-surface-variant/40 rounded-lg" />
                  </div>
                  {theme.active && (
                    <div className="absolute bottom-2 right-2 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-[10px] text-on-primary font-bold">✓</span>
                    </div>
                  )}
                  <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest transition-opacity">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Interface Scaling</label>
              <select className="w-full bg-surface-container border-none rounded-xl px-4 py-3 text-on-surface focus:ring-1 ring-primary/30 outline-none appearance-none cursor-pointer">
                <option>Compact (Default)</option>
                <option>Standard</option>
                <option>Comfortable</option>
              </select>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-10 flex items-center justify-end gap-4">
            <button className="px-6 py-3 rounded-xl text-on-surface-variant font-medium hover:bg-surface-container transition-all">
              Discard Changes
            </button>
            <button className="px-8 py-3 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
              Save Preferences
            </button>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}
