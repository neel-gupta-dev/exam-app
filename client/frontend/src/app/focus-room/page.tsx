"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { BookOpen, Droplets, AudioLines, Volume2, Timer, Mic2, CloudRain, Headphones, Trees, X, Bell } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function FocusRoomPage() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [autoStart, setAutoStart] = useState(false);

  // Session Tracking Refs
  const sessionIdRef = useRef<string | null>(null);
  const interruptionCountRef = useRef(0);

  // Distraction Tracking Effect
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isBreak) {
        interruptionCountRef.current += 1;
        console.log("Distraction detected! Interruption count:", interruptionCountRef.current);
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, isBreak]);

  // Beacon Fail-safe for Tab Closure
  useEffect(() => {
    const handleUnload = () => {
      if (sessionIdRef.current) {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/focus/end/${sessionIdRef.current}?token=${localStorage.getItem('kv_token')}`;
        const actualDuration = initialTime - timeLeft;
        const data = JSON.stringify({
          status: 'abandoned',
          interruptionCount: interruptionCountRef.current,
          actualDuration: Math.max(0, actualDuration)
        });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  const startSession = async (type: 'focus' | 'short-break' | 'long-break') => {
    try {
      const { data } = await api.post('/focus/start', {
        type,
        plannedDuration: type === 'focus' ? focusLength * 60 : breakLength * 60
      });
      sessionIdRef.current = data.sessionId;
      interruptionCountRef.current = 0;
    } catch (error) {
      console.error("Failed to start focus session", error);
    }
  };

  const endSession = async (status: 'completed' | 'abandoned') => {
    if (!sessionIdRef.current) return;
    try {
      const actualDuration = status === 'completed' ? initialTime : (initialTime - timeLeft);
      
      const { data } = await api.patch(`/focus/end/${sessionIdRef.current}`, {
        status,
        interruptionCount: interruptionCountRef.current,
        actualDuration: Math.max(0, actualDuration)
      });
      if (status === 'completed' && !isBreak) {
        toast.success(`Session complete! +${data.xpEarned} XP earned.`);
        // Refresh user context to show new level/XP
        window.dispatchEvent(new Event("focusSessionCompleted"));
      }
      sessionIdRef.current = null;
    } catch (error) {
      console.error("Failed to end focus session", error);
    }
  };

  // Timer Engine
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Session Completed
      endSession('completed');
      
      // Switch modes
      if (!isBreak) {
        setIsBreak(true);
        const newTime = breakLength * 60;
        setTimeLeft(newTime);
        setInitialTime(newTime);
        if (autoStart) startSession('short-break');
      } else {
        setIsBreak(false);
        const newTime = focusLength * 60;
        setTimeLeft(newTime);
        setInitialTime(newTime);
        if (autoStart) startSession('focus');
      }
      setIsRunning(autoStart);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, breakLength, focusLength, autoStart]);

  const toggleTimer = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    
    if (nextRunning) {
      startSession(isBreak ? 'short-break' : 'focus');
    } else {
      // Manual pause - for simplicity here, we don't 'end' it yet.
      // If they resume, the same session continues.
      // If they RESET, we abandon it.
    }
  };
  
  const resetTimer = useCallback(() => {
    if (isRunning) {
      endSession('abandoned');
    }
    setIsRunning(false);
    setTimeLeft(initialTime);
  }, [isRunning, initialTime]);

  const skipBreak = useCallback(() => {
    if (isRunning && isBreak) {
      endSession('abandoned');
    }
    setIsBreak(false);
    const newTime = focusLength * 60;
    setTimeLeft(newTime);
    setInitialTime(newTime);
    setIsRunning(true);
    startSession('focus');
  }, [isRunning, isBreak, focusLength]);

  // Handle settings save
  const saveSettings = () => {
    // only apply immediately if not running
    if (!isRunning) {
      setTimeLeft(focusLength * 60);
      setInitialTime(focusLength * 60);
      setIsBreak(false);
    }
    setIsSettingsOpen(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30 flex">
      <Sidebar />
      <TopNav />
      {/* Main Content Canvas */}
      <main className="ml-64 pt-16 flex-1 relative flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden bg-surface h-screen">
        {/* Ambient Background Element */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isBreak ? "bg-tertiary/5" : "bg-primary/5"} rounded-full blur-[100px] transition-colors duration-1000`}></div>
        </div>

        {/* Central Focus Timer */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center mt-[-3rem]">
          <h2 className="text-on-surface-variant font-headline text-sm tracking-[0.2em] uppercase font-bold">
            {isBreak ? "Break Session" : "Deep Work Session"}
          </h2>
          <div 
            className="font-[family-name:var(--font-headline)] font-extrabold text-[6.5rem] leading-none tracking-tighter drop-shadow-2xl transition-all"
            style={{
              background: "linear-gradient(180deg, #dde6f2 0%, rgba(221, 230, 242, 0.4) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFeatureSettings: '"tnum"',
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.05em",
            }}
          >
            {formatTime(timeLeft)}
          </div>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={toggleTimer}
              className={`px-8 py-2 ${isRunning ? "bg-surface-container-highest text-on-surface" : "bg-primary-container text-on-primary-container"} rounded-xl font-bold font-headline text-xs tracking-wide transition-all hover:scale-105 active:scale-95`}
            >
              {isRunning ? "PAUSE" : isBreak ? "START BREAK" : "START SESSION"}
            </button>

            {!isRunning && isBreak && (
              <button 
                onClick={skipBreak}
                className="px-8 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold font-headline text-xs tracking-wide transition-all hover:bg-primary/20 active:scale-95 shadow-sm"
              >
                START SESSION
              </button>
            )}
            <button 
              onClick={resetTimer}
              className="px-8 py-2 bg-surface-container-highest text-on-surface-variant rounded-xl font-bold font-headline text-xs tracking-wide transition-all hover:bg-surface-bright active:scale-95"
            >
              RESET
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 bg-surface-container/50 text-on-surface-variant hover:text-on-surface border border-outline-variant/10 rounded-xl transition-all hover:bg-surface-container active:scale-95"
            >
              <Timer className="w-4 h-4" />
            </button>
          </div>
          
          {/* Upcoming Objective */}
          <div className="w-full max-w-sm p-4 bg-surface-container/40 backdrop-blur-xl rounded-2xl border border-outline-variant/10 mt-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Upcoming Objective
              </h3>
              <span className="text-[10px] text-primary/80 font-medium">Priority High</span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-on-surface">Microeconomics Proofs</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">Section 4.2 • Mathematical Foundations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Audio Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2.5 bg-surface-container/30 backdrop-blur-md rounded-full border border-outline-variant/10 z-10">
          <button className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            <CloudRain className="w-3.5 h-3.5 text-primary opacity-80" />
            Rain
          </button>
          <div className="w-[1px] h-3 bg-outline-variant/20" />
          <button className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            <Headphones className="w-3.5 h-3.5 text-tertiary-dim opacity-80" />
            Lo-Fi
          </button>
          <div className="w-[1px] h-3 bg-outline-variant/20" />
          <button className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            <Volume2 className="w-3.5 h-3.5 opacity-80" />
            60%
          </button>
        </div>

        {/* FLOATING SETTINGS MENU OVERLAY */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <div className="bg-surface-container-high/90 backdrop-blur-2xl w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-2xl shadow-black/50 border border-white/5 zoom-in-95 animate-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-lg text-primary">Focus Settings</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-white/5">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Focus Timer Setting */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <Timer className="w-4 h-4" />
                    Focus Timer
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setFocusLength(25)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${focusLength === 25 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}
                    >
                      25:00
                    </button>
                    <button 
                      onClick={() => setFocusLength(50)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${focusLength === 50 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}
                    >
                      50:00
                    </button>
                    <div className="relative">
                      <input 
                        type="number" 
                        min="1"
                        max="120"
                        value={focusLength}
                        onChange={(e) => setFocusLength(Number(e.target.value) || 25)}
                        className="w-full py-2 bg-surface-container-highest border-none text-on-surface text-sm rounded-lg placeholder:text-slate-600 focus:ring-1 focus:ring-primary/40 text-center" 
                      />
                    </div>
                  </div>
                </div>

                {/* Ambient Sound Setting */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <AudioLines className="w-4 h-4" />
                    Ambient Sound
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-2 flex items-center justify-center gap-2 bg-primary/10 text-primary border border-primary/30 rounded-lg text-sm font-medium transition-colors hover:bg-primary/20">
                      <CloudRain className="w-4 h-4" /> Rain
                    </button>
                    <button className="py-2 flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright rounded-lg text-sm font-medium transition-colors border border-transparent">
                      <Headphones className="w-4 h-4" /> Lo-Fi
                    </button>
                    <button className="py-2 flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright rounded-lg text-sm font-medium transition-colors border border-transparent">
                      <Trees className="w-4 h-4" /> Forest
                    </button>
                    <button className="py-2 flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright rounded-lg text-sm font-medium transition-colors border border-transparent">
                      Off
                    </button>
                  </div>
                  <div className="pt-2 px-1">
                    <input type="range" className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" />
                  </div>
                </div>

                {/* Break Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <Mic2 className="w-4 h-4" />
                    Break Settings
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-on-surface-variant text-sm font-medium">Auto-start next session</span>
                    <button 
                      onClick={() => setAutoStart(!autoStart)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${autoStart ? 'bg-primary/40' : 'bg-surface-variant'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${autoStart ? 'right-0.5 bg-primary' : 'left-0.5 bg-on-surface-variant'}`}></span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant text-sm font-medium">Length:</span>
                    <button 
                      onClick={() => setBreakLength(5)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${breakLength === 5 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}
                    >
                      5M
                    </button>
                    <button 
                      onClick={() => setBreakLength(15)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${breakLength === 15 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}
                    >
                      15M
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </div>
                  <select className="w-full bg-surface-container-highest border-none text-on-surface text-sm rounded-lg p-3 focus:ring-1 focus:ring-primary/40 appearance-none font-medium">
                    <option>Crystal Chime</option>
                    <option>Deep Gong</option>
                    <option>Soft Digital</option>
                    <option>None</option>
                  </select>
                </div>
              </div>

              <div className="mt-10">
                <button 
                  onClick={saveSettings}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold font-headline rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 tracking-wide"
                >
                  SAVE CONFIGURATION
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
