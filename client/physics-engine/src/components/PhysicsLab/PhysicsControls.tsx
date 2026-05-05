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
  isDeleteMode: boolean;
  setIsDeleteMode: (v: boolean) => void;
  friction: number;
  setFriction: (v: number) => void;
  airResistance: number;
  setAirResistance: (v: number) => void;
  activePreset: string | null;
  setActivePreset: (v: string | null) => void;
  launchVelocity: number;
  setLaunchVelocity: (v: number) => void;
  launchAngle: number;
  setLaunchAngle: (v: number) => void;
  onLaunch: () => void;
  onReset: () => void;
}

const PhysicsControls: React.FC<PhysicsControlsProps> = ({
  gravity, setGravity,
  timeScale, setTimeScale,
  showVectors, setShowVectors,
  isDeleteMode, setIsDeleteMode,
  friction, setFriction,
  airResistance, setAirResistance,
  activePreset, setActivePreset,
  launchVelocity, setLaunchVelocity,
  launchAngle, setLaunchAngle,
  onLaunch, onReset
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
          <div className="flex gap-2">
            <button 
              onClick={() => {
                // We'll need a way to clear all dynamic bodies
                // I'll add an onClear prop
                onReset(); // For now, just reset
              }}
              className="p-2 rounded-xl bg-surface-container-highest hover:bg-error/20 text-on-surface-variant hover:text-error transition-all active:scale-95"
              title="Clear All Objects"
            >
              <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
            </button>
            <button 
              onClick={onReset}
              className="p-2 rounded-xl bg-surface-container-highest hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-all active:scale-95"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gravity Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <Weight className="w-3 h-3" />
              Gravity (g)
            </label>
            <span className="text-xs font-mono font-bold text-primary">{gravity.toFixed(5)} m/s²</span>
          </div>
          <input 
            type="range" 
            min="-10" 
            max="20" 
            step="0.00001" 
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

        {/* Friction Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <Wind className="w-3 h-3" />
              Ground Friction (μ)
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">{friction.toFixed(2)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={friction}
            onChange={(e) => setFriction(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Air Resistance Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">air</span>
              Air Resistance (drag)
            </label>
            <span className="text-xs font-mono font-bold text-sky-400">{airResistance.toFixed(3)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="0.2" 
            step="0.001" 
            value={airResistance}
            onChange={(e) => setAirResistance(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-sky-500"
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

          <button 
            onClick={() => setIsDeleteMode(!isDeleteMode)}
            className={`w-full py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              isDeleteMode 
                ? "bg-error/10 border-error/20 text-error shadow-lg shadow-error/10" 
                : "bg-surface-container-highest border-white/5 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
            {isDeleteMode ? "Delete Mode: ON" : "Delete Mode: OFF"}
          </button>
        </div>
      </div>

      {/* Projectile Settings - Only shown if Projectile Preset is selected */}
      {activePreset === 'Projectile Motion' && (
        <div className="p-6 rounded-3xl bg-surface-container border border-white/5 space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
          <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-400" />
            Projectile Lab
          </h3>

          {/* Velocity Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Launch Velocity (u)
              </label>
              <span className="text-xs font-mono font-bold text-emerald-400">{launchVelocity} m/s</span>
            </div>
            <input 
              type="range" min="1" max="50" step="1" 
              value={launchVelocity}
              onChange={(e) => setLaunchVelocity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Angle Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Launch Angle (θ)
              </label>
              <span className="text-xs font-mono font-bold text-orange-400">{launchAngle}°</span>
            </div>
            <input 
              type="range" min="0" max="90" step="1" 
              value={launchAngle}
              onChange={(e) => setLaunchAngle(parseInt(e.target.value))}
              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <button 
            onClick={onLaunch}
            className="w-full py-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Launch Projectile
          </button>
        </div>
      )}

      {/* Presets Card */}
      <div className="p-6 rounded-3xl bg-surface-container border border-white/5 space-y-4">
        <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
          Experiment Presets
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {['Projectile Motion', 'Elastic Collisions', 'Free Fall Lab', 'Chaos Pendulum'].map((p) => (
            <button 
              key={p}
              onClick={() => setActivePreset(activePreset === p ? null : p)}
              className={`w-full text-left p-3 rounded-xl border transition-all group ${
                activePreset === p 
                  ? "bg-primary/10 border-primary/20" 
                  : "bg-surface-container-highest/50 hover:bg-surface-container-highest border-white/5 hover:border-primary/20"
              }`}
            >
              <span className={`text-xs font-bold transition-colors ${
                activePreset === p ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"
              }`}>{p}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhysicsControls;
