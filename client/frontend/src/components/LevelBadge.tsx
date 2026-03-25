import React from 'react';

interface LevelBadgeProps {
  level: number;
  className?: string;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({ level, className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      {/* Hexagonal stylized background */}
      <div className="absolute inset-0 bg-primary/20 rotate-45 transform rounded-xl border border-primary/30 blur-[2px]" />
      <div className="relative z-10 w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary to-primary-container rounded-xl shadow-lg shadow-primary/20 border border-white/20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/10" />
        <span className="text-xl font-black text-on-primary drop-shadow-md leading-none">
          {level}
        </span>
      </div>
      
      {/* Decorative pulse ring */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary/20 animate-ping opacity-20" />
    </div>
  );
};

export default LevelBadge;
