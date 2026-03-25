"use client";

import React, { useState } from "react";
import { Play, Pause, Volume2, RotateCcw, AlertCircle } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function FocusAudioPlayer() {
  const { 
    isPlaying, 
    volume, 
    isLooping, 
    isBlocked, 
    currentTrack,
    togglePlay, 
    setVolume, 
    toggleLoop,
    unmute
  } = useAudio();

  const [showVolume, setShowVolume] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 group">
      {/* Unmute Tooltip/Alert if Blocked */}
      {isBlocked && (
        <button
          onClick={unmute}
          className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg animate-bounce transition-all hover:bg-rose-600 shadow-lg shadow-rose-500/20"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          UNMUTE AUDIO
        </button>
      )}

      {/* Main Player Widget */}
      <div className="flex items-center gap-4 px-4 py-3 bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 transition-all hover:bg-black/30">
        
        {/* Visualizer & Track Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-[3px] h-4 w-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 bg-primary/70 rounded-full transition-all duration-300 ${
                  isPlaying ? "animate-visualizer" : "h-1"
                }`}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  height: isPlaying ? undefined : '4px'
                }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest hidden sm:block">
            {currentTrack}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>

          <button
            onClick={toggleLoop}
            className={`p-1.5 rounded-lg transition-colors ${
              isLooping ? "text-primary bg-primary/10" : "text-white/40 hover:text-white/60"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex items-center gap-2 ml-1">
            <button
              onMouseEnter={() => setShowVolume(true)}
              onClick={() => setShowVolume(!showVolume)}
              className="p-1.5 text-white/60 hover:text-white transition-colors"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            
            {/* Custom Premium Slider */}
            <div 
              className={`absolute bottom-full right-0 mb-4 px-3 py-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-xl transition-all duration-300 origin-bottom ${
                showVolume ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
              }`}
              onMouseLeave={() => setShowVolume(false)}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="h-24 appearance-none bg-transparent cursor-pointer vertical-slider"
                style={{
                  writingMode: "bt-lr", /* IE */
                  WebkitAppearance: "slider-vertical", /* WebKit */
                } as any}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .vertical-slider {
          width: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.1);
          accent-color: var(--primary);
        }
        @keyframes visualizer {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-visualizer {
          animation: visualizer 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
