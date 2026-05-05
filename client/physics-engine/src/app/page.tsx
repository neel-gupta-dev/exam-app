"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import PhysicsCanvas, { PhysicsCanvasHandle } from '@/components/PhysicsLab/PhysicsCanvas';
import PhysicsControls from '@/components/PhysicsLab/PhysicsControls';
import { FlaskConical, Share2, Info, Mail } from 'lucide-react';

export default function PhysicsLabPage() {
  const canvasRef = useRef<PhysicsCanvasHandle>(null);
  const [gravity, setGravity] = useState(9.79457);
  const [timeScale, setTimeScale] = useState(1);
  const [showVectors, setShowVectors] = useState(true);
  const [launchVelocity, setLaunchVelocity] = useState(15);
  const [launchAngle, setLaunchAngle] = useState(45);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [friction, setFriction] = useState(0.1);
  const [airResistance, setAirResistance] = useState(0.01);
  const [key, setKey] = useState(0);

  const handleLaunch = () => {
    canvasRef.current?.launch(launchVelocity, launchAngle);
  };

  const handleReset = () => {
    setKey(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Premium Navigation Header */}
      <nav className="h-20 border-b border-outline-variant/10 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            <img src="/vayl-logo.png" alt="Vayl" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-on-surface">VAYL Lab</h1>
            <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Experimental Physics v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/contact"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            Contact
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-white/5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant transition-all">
            <Info className="w-3.5 h-3.5" />
            Theory
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
            <Share2 className="w-3.5 h-3.5" />
            Share Sim
          </button>
        </div>
      </nav>

      {/* Main Laboratory Floor */}
      <div className="flex-1 p-8 flex flex-col lg:flex-row gap-8 max-w-[1600px] mx-auto w-full overflow-hidden">
        
        {/* The Physics Engine Workspace */}
        <div className="flex-1 flex flex-col gap-6 h-[450px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-on-surface tracking-tight">Kinematics Sandbox</h2>
              <p className="text-xs text-on-surface-variant font-medium">Drag objects to interact. Use vectors to visualize forces.</p>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-high/50 p-1.5 rounded-2xl border border-white/5">
              <div className="px-3 py-1.5 rounded-xl bg-primary/10 text-[10px] font-black text-primary uppercase">Active Session</div>
              <div className="px-3 text-[10px] font-bold text-on-surface-variant/40">Lat: 12ms</div>
            </div>
          </div>

          <PhysicsCanvas 
            ref={canvasRef}
            key={key}
            gravity={gravity}
            timeScale={timeScale}
            showVectors={showVectors}
            isDeleteMode={isDeleteMode}
            friction={friction}
            airResistance={airResistance}
            preset={activePreset || undefined}
          />
        </div>

        {/* The Control Panel Sidebar */}
        <PhysicsControls 
          gravity={gravity}
          setGravity={setGravity}
          timeScale={timeScale}
          setTimeScale={setTimeScale}
          showVectors={showVectors}
          setShowVectors={setShowVectors}
          isDeleteMode={isDeleteMode}
          setIsDeleteMode={setIsDeleteMode}
          friction={friction}
          setFriction={setFriction}
          airResistance={airResistance}
          setAirResistance={setAirResistance}
          activePreset={activePreset}
          setActivePreset={setActivePreset}
          launchVelocity={launchVelocity}
          setLaunchVelocity={setLaunchVelocity}
          launchAngle={launchAngle}
          setLaunchAngle={setLaunchAngle}
          onLaunch={handleLaunch}
          onReset={handleReset}
        />
      </div>

      {/* Global Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 mesh-grid opacity-[0.03]" />
      </div>
    </main>
  );
}
