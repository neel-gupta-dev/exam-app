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
  // Determine styles dynamically to match the 3 states from code.html
  let wrapperClass = "bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between group";
  
  if (state === 'locked') {
    wrapperClass += " opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0";
  }

  let badgeClass = "px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ";
  if (state === 'in-progress') {
    badgeClass += "bg-tertiary-container/20 text-tertiary";
  } else if (state === 'locked') {
    badgeClass += "bg-slate-800 text-slate-400";
  } else {
    badgeClass += "bg-indigo-500/20 text-indigo-400";
  }

  let buttonClass = "w-full md:w-auto px-8 py-3 rounded-lg flex items-center justify-center font-bold cursor-pointer transition-all ";
  if (state === 'in-progress') {
    buttonClass += "bg-indigo-500 text-on-primary shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 border-none";
  } else {
    buttonClass += "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/40";
  }

  let statusIconClass = "material-symbols-outlined text-sm mr-2 opacity-60 ";
  if (state === 'in-progress') {
    statusIconClass += "text-indigo-400";
  } else {
    statusIconClass += "text-error";
  }

  return (
    <div className={wrapperClass}>
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <span className={badgeClass}>{badge}</span>
          <span className="text-xs text-on-surface-variant font-medium">{subject}</span>
        </div>
        <h3 className="text-xl font-bold text-on-surface font-headline mb-4">{title}</h3>
        <div className="flex items-center space-x-6 text-sm text-on-surface-variant">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-2 opacity-60">schedule</span>
            {duration} mins
          </div>
          <div className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-2 opacity-60">grade</span>
            {marks} Marks
          </div>
          <div className="flex items-center">
            <span className={statusIconClass}>{statusIcon}</span>
            {status}
          </div>
        </div>
      </div>
      <div className="mt-6 md:mt-0 md:ml-8">
        <button onClick={onAction} disabled={state === 'locked'} className={buttonClass}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
