"use client";

import React from 'react';
import { 
  Play, Pause, RotateCcw, Settings2, 
  Wind, Weight, Gauge, ArrowRightCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PhysicsControlsProps {
  gravity: number;
  setGravity: (v: number) => void;
  timeScale: number;
  setTimeScale: (v: number) => void;
  showVectors: boolean;
  setShowVectors: (v: boolean) => void;
  onReset: () => void;
}

const PhysicsControls: React.FC<PhysicsControlsProps> = ({
  gravity, setGravity,
  timeScale, setTimeScale,
  showVectors, setShowVectors,
  onReset
}) => {
  return (
    <div className="w-full lg:w-80 flex flex-col gap-6">
      {/* Simulation Controls */}
      <div className="p-6 rounded-3xl bg-surface-container border border-white/5 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Control Deck
          </h3>
          <button 
            onClick={onReset}
            className="p-2 rounded-xl bg-surface-container-highest hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-all active:scale-95"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Gravity Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <Weight className="w-3 h-3" />
              Gravity (g)
            </label>
            <span className="text-xs font-mono font-bold text-primary">{gravity.toFixed(1)} m/s²</span>
          </div>
          <input 
            type="range" 
            min="-2" 
            max="5" 
            step="0.1" 
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Time Scale Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-3 h-3" />
              Time Dilation
            </label>
            <span className="text-xs font-mono font-bold text-indigo-400">{(timeScale * 100).toFixed(0)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.05" 
            value={timeScale}
            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Toggles */}
        <div className="pt-2 flex flex-col gap-3">
          <button 
            onClick={() => setShowVectors(!showVectors)}
            className={`w-full py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              showVectors 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "bg-surface-container-highest border-white/5 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <ArrowRightCircle className="w-4 h-4" />
            {showVectors ? "Vectors: Visible" : "Vectors: Hidden"}
          </button>
        </div>
      </div>

      {/* Presets Card */}
      <div className="p-6 rounded-3xl bg-surface-container border border-white/5 space-y-4">
        <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
          Experiment Presets
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {['Projectile Motion', 'Elastic Collisions', 'Free Fall Lab', 'Chaos Pendulum'].map((p) => (
            <button 
              key={p}
              className="w-full text-left p-3 rounded-xl bg-surface-container-highest/50 hover:bg-surface-container-highest border border-white/5 hover:border-primary/20 transition-all group"
            >
              <span className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{p}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhysicsControls;
