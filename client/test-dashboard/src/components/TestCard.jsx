import React from 'react';

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

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-indigo-700">{badge}</span>
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
        <button
          onClick={onAction}
          disabled={disabled}
          className={`rounded-2xl px-5 py-3 text-sm font-black transition ${
            disabled
              ? 'border border-slate-200 bg-slate-100 text-slate-500'
              : 'border border-slate-950 bg-slate-950 text-white hover:bg-slate-800'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </article>
  );
}
