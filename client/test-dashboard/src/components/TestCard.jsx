import React from 'react';
import { motion } from 'framer-motion';

export default function TestCard({
  badge,
  subject,
  title,
  duration,
  marks,
  status,
  statusIcon,
  buttonText,
  state,
  onAction,
}) {
  const disabled = state === 'locked' || state === 'upcoming' || state === 'missed';

  const getOrbColor = () => {
    if (state === 'completed') return 'bg-emerald-400';
    if (state === 'missed') return 'bg-rose-400';
    if (state === 'in-progress') return 'bg-amber-400';
    return 'bg-indigo-400';
  };

  const getBadgeColor = () => {
    if (state === 'completed') return 'bg-emerald-100 text-emerald-700';
    if (state === 'missed') return 'bg-rose-100 text-rose-700';
    if (state === 'in-progress') return 'bg-amber-100 text-amber-700';
    return 'bg-indigo-100 text-indigo-700';
  };

  return (
    <motion.article 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -20px 0px" }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)', borderColor: '#e2e8f0' }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors"
    >
      <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl opacity-20 ${getOrbColor()}`} />
      
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${getBadgeColor()}`}>{badge}</span>
            <span className="truncate text-xs font-bold text-slate-500">{subject}</span>
          </div>
          <h3 className="truncate text-xl font-black text-slate-950">{title}</h3>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-slate-400">schedule</span>
              {duration} mins
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-slate-400">grade</span>
              {marks} marks
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-slate-400">{statusIcon}</span>
              {status}
            </span>
          </div>
        </div>
        <motion.button
          whileHover={disabled ? {} : { scale: 1.04, y: -1 }}
          whileTap={disabled ? {} : { scale: 0.97 }}
          onClick={onAction}
          disabled={disabled}
          className={`shrink-0 rounded-2xl px-6 py-3 text-sm font-black transition-all ${
            disabled
              ? 'border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'border border-slate-950 bg-slate-950 text-white hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-300'
          }`}
        >
          {buttonText}
        </motion.button>
      </div>
    </motion.article>
  );
}
