import React, { useEffect, useState } from 'react';

interface LevelProgressBarProps {
  progress: number;
  xpRemaining: number;
  currentLevel: number;
  className?: string;
}

const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ 
  progress, 
  xpRemaining, 
  currentLevel,
  className = "" 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    // Smooth initial fill animation
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`space-y-3 w-full ${className}`}>
      <div className="flex items-end justify-between px-1">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Level Progression</span>
          <h5 className="text-2xl font-black text-on-surface leading-none mt-1">Level {currentLevel}</h5>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant block mb-1">Effort Reward</span>
          <span className="text-sm font-bold text-primary">{Math.round(xpRemaining)} XP to level up</span>
        </div>
      </div>
      
      {/* Progress Track */}
      <div className="relative h-3 bg-surface-container-highest rounded-full overflow-hidden border border-white/5 shadow-inner">
        {/* Glow effect */}
        <div 
          className="absolute inset-y-0 left-0 bg-primary/20 blur-[10px] transition-all duration-1000 ease-out" 
          style={{ width: `${animatedProgress}%` }}
        />
        
        {/* Main Bar */}
        <div 
          className="h-full bg-gradient-to-r from-primary-container via-primary-dim to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(192,193,255,0.4)] relative" 
          style={{ width: `${animatedProgress}%` }}
        >
          {/* Animated Shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export default LevelProgressBar;
