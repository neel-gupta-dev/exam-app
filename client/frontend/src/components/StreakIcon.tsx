import React from 'react';

const StreakIcon = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker {
          0%, 100% { transform: scale(1) rotate(-1deg); opacity: 0.9; }
          25% { transform: scale(1.1) rotate(1deg); opacity: 1; }
          50% { transform: scale(0.95) rotate(-2deg); opacity: 0.8; }
          75% { transform: scale(1.05) rotate(2deg); opacity: 0.95; }
        }
        @keyframes rise {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          100% { transform: translateY(-10px) scale(0.5); opacity: 0; }
        }
        .fire-inner { animation: flicker 0.2s ease-in-out infinite; }
        .fire-middle { animation: flicker 0.3s ease-in-out infinite reverse; }
        .fire-outer { animation: flicker 0.5s ease-in-out infinite; }
        .particle { animation: rise 1s ease-in infinite; }
      `}} />
      
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
        {/* Outer Flame (Darker Red) */}
        <path 
          className="fire-outer fill-red-600/60" 
          d="M50,95 C30,95 15,80 15,60 C15,40 35,20 50,5 C65,20 85,40 85,60 C85,80 70,95 50,95 Z" 
        />
        
        {/* Middle Flame (Orange-Red) */}
        <path 
          className="fire-middle fill-orange-500" 
          d="M50,90 C35,90 25,80 25,65 C25,50 40,35 50,20 C60,35 75,50 75,65 C75,80 65,90 50,90 Z" 
        />
        
        {/* Inner Flame (Yellow-Gold) */}
        <path 
          className="fire-inner fill-yellow-400" 
          d="M50,85 C40,85 35,78 35,70 C35,60 45,50 50,40 C55,50 65,60 65,70 C65,78 60,85 50,85 Z" 
        />

        {/* Floating Particles */}
        <circle className="particle fill-yellow-200" cx="45" cy="40" r="2" style={{ animationDelay: '0.1s' }} />
        <circle className="particle fill-orange-300" cx="55" cy="30" r="1.5" style={{ animationDelay: '0.4s' }} />
        <circle className="particle fill-red-400" cx="50" cy="20" r="1" style={{ animationDelay: '0.7s' }} />
      </svg>
    </div>
  );
};

export default StreakIcon;
