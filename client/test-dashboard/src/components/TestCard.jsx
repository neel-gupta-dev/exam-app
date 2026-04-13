import React from 'react';

export const TestCard = ({ 
  badge, 
  subject, 
  title, 
  duration, 
  marks, 
  status, 
  statusIcon,
  buttonText,
  buttonVariant 
}) => {
  return (
    <div className="test-card bg-surface-container hover:bg-surface-container-high transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group border border-transparent hover:border-outline-variant">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <span className="badge-pill text-[10px] font-bold rounded uppercase tracking-wider">
            {badge}
          </span>
          <span className="text-xs text-on-surface-variant font-medium">{subject}</span>
        </div>
        <h3 className="text-xl font-bold text-on-surface font-headline mb-4 md:mb-0">{title}</h3>
        <div className="flex items-center space-x-4 text-sm text-on-surface-variant mt-3 md:mt-1">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-2 opacity-60">schedule</span>
            {duration} mins
          </div>
          <div className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-2 opacity-60">grade</span>
            {marks} Marks
          </div>
          <div className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-2 text-on-surface-variant">{statusIcon}</span>
            {status}
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-0 md:ml-8 md:flex md:items-center md:justify-end shrink-0 cta-wrapper">
        <button className={`w-full md:w-auto btn-${buttonVariant} font-bold min-w-[140px]`}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};
