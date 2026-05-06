"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PhysicsCanvas, { PhysicsCanvasHandle } from '@/components/PhysicsLab/PhysicsCanvas';
import PhysicsControls from '@/components/PhysicsLab/PhysicsControls';
import { Mail } from 'lucide-react';

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
  const [restitution, setRestitution] = useState(0.6);
  const [nextMass, setNextMass] = useState(1);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [key, setKey] = useState(0);

  // New Experiment States
  const [cradleCount, setCradleCount] = useState(5);
  const [massA, setMassA] = useState(1);
  const [massB, setMassB] = useState(1);
  const [velA, setVelA] = useState(5);
  const [velB, setVelB] = useState(-5);
  const [rampAngle, setRampAngle] = useState(30);
  const [rampFriction, setRampFriction] = useState(0.1);

  const handleLaunch = () => {
    canvasRef.current?.launch(launchVelocity, launchAngle);
  };

  const handleReset = () => {
    setStopwatchTime(0);
    setIsStopwatchRunning(false);
    setKey(prev => prev + 1);
  };

  const handleClear = () => {
    canvasRef.current?.clearDynamic();
  };

  return (
    <main className="h-screen bg-surface flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <nav className="h-20 border-b border-outline-variant/10 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center relative">
            <Image src="/vayl-logo.png" alt="Vayl" fill className="object-cover" sizes="40px" />
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
        </div>
      </nav>

      {/* Main Laboratory Floor */}
      <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 max-w-[1600px] mx-auto w-full overflow-hidden">
        
        {/* The Physics Engine Workspace */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-on-surface tracking-tight">Kinematics Sandbox</h2>
              <p className="text-xs text-on-surface-variant font-medium">Drag objects to interact. Use vectors to visualize forces.</p>
            </div>
            <div className="flex items-center gap-4 bg-surface-container-high/50 p-1.5 rounded-2xl border border-white/5">
              <div className="px-3 py-1.5 rounded-xl bg-primary/10 text-[10px] font-black text-primary uppercase">Active Session</div>
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
            restitution={restitution}
            nextMass={nextMass}
            isStopwatchRunning={isStopwatchRunning}
            stopwatchTime={stopwatchTime}
            onStopwatchUpdate={setStopwatchTime}
            setIsStopwatchRunning={setIsStopwatchRunning}
            activePreset={activePreset}
            cradleCount={cradleCount}
            massA={massA}
            massB={massB}
            velA={velA}
            velB={velB}
            rampAngle={rampAngle}
            rampFriction={rampFriction}
          />
        </div>

        {/* The Control Panel Sidebar — scrollable */}
        <div className="w-full lg:w-80 overflow-y-auto flex-shrink-0 pb-2">
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
          restitution={restitution}
          setRestitution={setRestitution}
          nextMass={nextMass}
          setNextMass={setNextMass}
          stopwatchTime={stopwatchTime}
          isStopwatchRunning={isStopwatchRunning}
          onStopwatchToggle={() => setIsStopwatchRunning(!isStopwatchRunning)}
          onStopwatchReset={() => { setStopwatchTime(0); setIsStopwatchRunning(false); }}
          activePreset={activePreset}
          setActivePreset={setActivePreset}
          launchVelocity={launchVelocity}
          setLaunchVelocity={setLaunchVelocity}
          launchAngle={launchAngle}
          setLaunchAngle={setLaunchAngle}
          onLaunch={handleLaunch}
          onReset={handleReset}
          onClear={handleClear}
          cradleCount={cradleCount}
          setCradleCount={setCradleCount}
          massA={massA}
          setMassA={setMassA}
          massB={massB}
          setMassB={setMassB}
          velA={velA}
          setVelA={setVelA}
          velB={velB}
          setVelB={setVelB}
          rampAngle={rampAngle}
          setRampAngle={setRampAngle}
          rampFriction={rampFriction}
          setRampFriction={setRampFriction}
        />
        </div>
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
