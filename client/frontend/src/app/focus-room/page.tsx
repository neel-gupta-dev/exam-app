"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AudioLines, Volume2, Timer, Mic2, CloudRain, Headphones, Trees, X, Bell, Target, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAudio } from "@/context/AudioContext";
import { useHaptics } from "@/hooks/useHaptics";
import { trackFocusStart, trackFocusComplete } from "@/lib/analytics";

// Motivational messages shown when goal is achieved
const GOAL_MESSAGES = [
  { headline: "Goal Crushed. 🔥", sub: "The gap between you and average just widened." },
  { headline: "You Earned It. ⚡", sub: "Exceptional focus today. Go rest like a champion." },
  { headline: "Mission Complete. 🏆", sub: "Every minute you put in compounds. Keep building." },
  { headline: "Outstanding Work. 🎯", sub: "You set the bar. Today you cleared it." },
  { headline: "Hard Work Pays. 💪", sub: "Your future self is grateful for today." },
];

// localStorage key to prevent showing celebration twice on same day
const todayKey = () => `vayl_goal_celebrated_${new Date().toISOString().slice(0, 10)}`;

interface GoalStats {
  todayFocusSeconds: number;
  dailyGoalMinutes: number;
  goalAchievedToday: boolean;
}

/**
 * Circular progress ring SVG component
 */
function GoalRing({ progress, size = 56, strokeWidth = 4, achieved }: {
  progress: number; size?: number; strokeWidth?: number; achieved: boolean;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.min(1, progress) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={strokeWidth}
        className="text-surface-container-highest opacity-40" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={achieved ? "text-emerald-400" : "text-primary"}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

/**
 * Goal completion celebration modal
 */
function GoalCelebrationModal({ onClose }: { onClose: () => void }) {
  const msg = GOAL_MESSAGES[Math.floor(Math.random() * GOAL_MESSAGES.length)];

  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-surface-container-high/95 backdrop-blur-2xl w-full max-w-sm rounded-3xl p-8 shadow-2xl shadow-black/60 border border-white/5 animate-in zoom-in-95 duration-300 text-center">
        {/* Glow orb */}
        <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
          <CheckCircle2 className="relative w-10 h-10 text-emerald-400" />
        </div>

        <h2 className="font-headline font-black text-2xl text-on-surface tracking-tight mb-2">
          {msg.headline}
        </h2>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
          {msg.sub}
        </p>

        {/* Progress bar decoration */}
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full animate-[grow_1s_ease_forwards]" style={{ width: "100%" }} />
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold font-headline text-sm tracking-wide hover:bg-emerald-500/20 transition-colors active:scale-95"
        >
          KEEP GOING →
        </button>
        <p className="text-on-surface-variant/40 text-xs mt-3">Auto-closes in 8s</p>
      </div>
    </div>
  );
}

/**
 * Focus Room Page
 * The core "Deep Work" environment for Vayl. Features a customizable Pomodoro
 * timer, ambient soundscapes, haptic feedback, distraction tracking,
 * and a daily study time goal with progress tracking.
 */
export default function FocusRoomPage() {
  // Timer Core State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const audio = useAudio();
  const { vibrateSuccess, vibrateWarning } = useHaptics();

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [focusLength, setFocusLength] = useState(25);
  const [breakLength, setBreakLength] = useState(5);
  const [autoStart, setAutoStart] = useState(false);

  // ── Daily Goal State ─────────────────────────────────────────────
  const [goalStats, setGoalStats] = useState<GoalStats>({
    todayFocusSeconds: 0,
    dailyGoalMinutes: 0,
    goalAchievedToday: false,
  });
  const [goalInput, setGoalInput] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [goalLoading, setGoalLoading] = useState(false);
  const celebratedRef = useRef(false);

  // Session Tracking Refs
  const sessionIdRef = useRef<string | null>(null);
  const interruptionCountRef = useRef(0);

  /**
   * Fetch today's goal progress from the backend.
   * Called on mount and after every completed focus session.
   */
  const fetchGoalStats = useCallback(async () => {
    try {
      const { data } = await api.get('/focus/stats');
      const stats: GoalStats = {
        todayFocusSeconds: data.todayFocusSeconds ?? 0,
        dailyGoalMinutes: data.dailyGoalMinutes ?? 0,
        goalAchievedToday: data.goalAchievedToday ?? false,
      };
      setGoalStats(stats);
      setGoalInput(stats.dailyGoalMinutes);

      // Show celebration only once per day, only when goal is set & achieved
      if (
        stats.goalAchievedToday &&
        stats.dailyGoalMinutes > 0 &&
        !celebratedRef.current &&
        !localStorage.getItem(todayKey())
      ) {
        celebratedRef.current = true;
        setShowCelebration(true);
        localStorage.setItem(todayKey(), '1');
      }
    } catch {
      // Silently fail — goal is non-critical
    }
  }, []);

  useEffect(() => { fetchGoalStats(); }, [fetchGoalStats]);

  /**
   * Save the daily goal to the backend.
   */
  const saveGoal = async (minutes: number) => {
    setGoalLoading(true);
    try {
      await api.patch('/focus/goal', { minutes });
      setGoalStats(prev => ({ ...prev, dailyGoalMinutes: minutes }));
      toast.success(minutes === 0 ? 'Daily goal removed.' : `Daily goal set to ${minutes} min.`);
    } catch {
      toast.error('Failed to save goal.');
    } finally {
      setGoalLoading(false);
    }
  };

  // ── Format helpers ──────────────────────────────────────────────

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // ── Distraction tracking ────────────────────────────────────────

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isBreak) {
        interruptionCountRef.current += 1;
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, isBreak]);

  // ── Beacon fail-safe ────────────────────────────────────────────

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
        navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ── Session API calls ──────────────────────────────────────────

  const startSession = async (type: 'focus' | 'short-break' | 'long-break') => {
    try {
      const { data } = await api.post('/focus/start', {
        type,
        plannedDuration: type === 'focus' ? focusLength * 60 : breakLength * 60
      });
      sessionIdRef.current = data.sessionId;
      interruptionCountRef.current = 0;
      if (type === 'focus') {
        window.dispatchEvent(new Event("VAYL_FOCUS_START"));
        trackFocusStart(type, focusLength);
      }
    } catch (error) {
      console.error("Failed to start focus session", error);
    }
  };

  const endSession = async (status: 'completed' | 'abandoned') => {
    if (!sessionIdRef.current) return;
    try {
      const actualDuration = status === 'completed' ? initialTime : (initialTime - timeLeft);
      window.dispatchEvent(new Event("VAYL_FOCUS_STOP"));

      const { data } = await api.patch(`/focus/end/${sessionIdRef.current}`, {
        status,
        interruptionCount: interruptionCountRef.current,
        actualDuration: Math.max(0, actualDuration)
      });

      if (status === 'completed' && !isBreak) {
        toast.success(`Session complete! +${data.xpEarned} XP earned.`);
        vibrateSuccess();
        window.dispatchEvent(new Event("focusSessionCompleted"));
        trackFocusComplete("focus", actualDuration / 60);
        // Re-fetch goal progress after a completed focus session
        fetchGoalStats();
      }
      sessionIdRef.current = null;
    } catch (error) {
      console.error("Failed to end focus session", error);
    }
  };

  // ── Timer Engine ────────────────────────────────────────────────

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      endSession('completed');
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
      if (!isBreak) audio.fadeIn(2000);
    }
  };

  const resetTimer = useCallback(() => {
    if (isRunning) { vibrateWarning(); endSession('abandoned'); }
    setIsRunning(false);
    setTimeLeft(initialTime);
  }, [isRunning, initialTime]);

  const skipBreak = useCallback(() => {
    if (isRunning && isBreak) { vibrateWarning(); endSession('abandoned'); }
    setIsBreak(false);
    const newTime = focusLength * 60;
    setTimeLeft(newTime);
    setInitialTime(newTime);
    setIsRunning(true);
    startSession('focus');
  }, [isRunning, isBreak, focusLength]);

  const saveSettings = () => {
    if (!isRunning) {
      setTimeLeft(focusLength * 60);
      setInitialTime(focusLength * 60);
      setIsBreak(false);
    }
    setIsSettingsOpen(false);
  };

  // ── Derived goal data ───────────────────────────────────────────
  const { todayFocusSeconds, dailyGoalMinutes, goalAchievedToday } = goalStats;
  const goalProgress = dailyGoalMinutes > 0 ? todayFocusSeconds / (dailyGoalMinutes * 60) : 0;
  const hasGoal = dailyGoalMinutes > 0;

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body selection:bg-primary/30">
      {/* Sidebar and TopNav are provided by AppShell in layout.tsx */}

      {/* Celebration modal */}
      {showCelebration && (
        <GoalCelebrationModal onClose={() => setShowCelebration(false)} />
      )}

      {/* Main Content Canvas */}
      <main className="ml-0 md:ml-64 pt-16 flex-1 relative flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden bg-surface h-screen">

        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${isBreak ? "bg-tertiary/5" : "bg-primary/5"} rounded-full blur-[100px] transition-colors duration-1000`} />
        </div>

        {/* ── Daily Goal Widget ─────────────────────────────────── */}
        {hasGoal && (
          <div className="absolute top-20 right-6 z-10 hidden md:flex items-center gap-3 px-4 py-2.5 bg-surface-container/40 backdrop-blur-md rounded-2xl border border-outline-variant/10">
            <div className="relative">
              <GoalRing progress={goalProgress} achieved={goalAchievedToday} />
              {goalAchievedToday && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-[80px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Today&apos;s Goal
              </span>
              <span className={`text-sm font-bold font-headline ${goalAchievedToday ? "text-emerald-400" : "text-on-surface"}`}>
                {formatDuration(todayFocusSeconds)}
                <span className="text-on-surface-variant font-normal text-xs">
                  {" "}/ {dailyGoalMinutes >= 60 ? `${Math.floor(dailyGoalMinutes / 60)}h${dailyGoalMinutes % 60 > 0 ? ` ${dailyGoalMinutes % 60}m` : ""}` : `${dailyGoalMinutes}m`}
                </span>
              </span>
              {goalAchievedToday && (
                <span className="text-[10px] text-emerald-400 font-semibold">Goal achieved! 🎉</span>
              )}
            </div>
          </div>
        )}

        {/* Mobile goal bar */}
        {hasGoal && (
          <div className="absolute top-[72px] left-0 right-0 z-10 px-4 md:hidden">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container/50 backdrop-blur-md rounded-xl border border-outline-variant/10">
              <GoalRing progress={goalProgress} size={32} strokeWidth={3} achieved={goalAchievedToday} />
              <span className="text-xs font-semibold text-on-surface-variant">
                {formatDuration(todayFocusSeconds)} / {dailyGoalMinutes}m
              </span>
              {goalAchievedToday && <span className="text-xs text-emerald-400 font-bold ml-auto">Goal ✓</span>}
            </div>
          </div>
        )}

        {/* ── Central Focus Timer ────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center mt-[-3rem]">
          <h2 className="text-on-surface-variant font-headline text-sm tracking-[0.2em] uppercase font-bold">
            {isBreak ? "Break Session" : "Deep Work Session"}
          </h2>
          <div
            className="font-[family-name:var(--font-headline)] font-extrabold text-[8rem] sm:text-[10rem] leading-none tracking-tighter drop-shadow-2xl transition-all duration-700"
            style={{
              color: isBreak ? "var(--tertiary)" : "var(--on-surface)",
              fontFeatureSettings: '"tnum"',
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.05em",
              filter: isBreak
                ? "drop-shadow(0 0 40px rgba(var(--tertiary-rgb, 16, 185, 129), 0.1))"
                : "none"
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
        </div>

        {/* ── Floating Audio Bar ─────────────────────────────────── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2.5 bg-surface-container/30 backdrop-blur-md rounded-full border border-outline-variant/10 z-10">
          <button
            onClick={() => { if (audio.currentTrack !== 'rain') audio.setTrack('rain'); audio.togglePlay(); }}
            className={`flex items-center gap-2 text-[10px] font-semibold transition-colors ${audio.isPlaying && audio.currentTrack === 'rain' ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Rain
          </button>
          <div className="w-[1px] h-3 bg-outline-variant/20" />
          <button
            onClick={() => { if (audio.currentTrack !== 'forest') audio.setTrack('forest'); audio.togglePlay(); }}
            className={`flex items-center gap-2 text-[10px] font-semibold transition-colors ${audio.isPlaying && audio.currentTrack === 'forest' ? "text-tertiary-dim" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <Trees className="w-3.5 h-3.5" /> Forest
          </button>
          <div className="w-[1px] h-3 bg-outline-variant/20" />
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 text-[10px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 opacity-80" />
            {Math.round(audio.volume * 100)}%
          </button>
        </div>

        {/* ── Settings Modal ─────────────────────────────────────── */}
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
                    <Timer className="w-4 h-4" /> Focus Timer
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setFocusLength(25)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${focusLength === 25 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}>
                      25:00
                    </button>
                    <button onClick={() => setFocusLength(50)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${focusLength === 50 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}>
                      50:00
                    </button>
                    <input type="number" min="1" max="120" value={focusLength}
                      onChange={(e) => setFocusLength(Number(e.target.value) || 25)}
                      className="w-full py-2 bg-surface-container-highest border-none text-on-surface text-sm rounded-lg focus:ring-1 focus:ring-primary/40 text-center"
                    />
                  </div>
                </div>

                {/* ── Daily Goal (read-only, set in Settings) ──────── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <Target className="w-4 h-4" /> Daily Study Goal
                  </div>
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${goalAchievedToday ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-surface-container-highest border-transparent'}`}>
                    <GoalRing progress={goalProgress} size={40} strokeWidth={3.5} achieved={goalAchievedToday} />
                    <div className="flex-1">
                      {hasGoal ? (
                        <>
                          <p className="text-xs font-bold text-on-surface">
                            {formatDuration(todayFocusSeconds)} / {dailyGoalMinutes >= 60 ? `${Math.floor(dailyGoalMinutes/60)}h` : `${dailyGoalMinutes}m`}
                          </p>
                          <p className={`text-[10px] font-medium ${goalAchievedToday ? 'text-emerald-400' : 'text-on-surface-variant'}`}>
                            {goalAchievedToday ? "Goal achieved! 🏆" : `${Math.max(0, Math.ceil(dailyGoalMinutes - todayFocusSeconds / 60))} min remaining`}
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-on-surface-variant">No daily goal set</p>
                      )}
                    </div>
                    <a href="/settings" className="text-[10px] text-primary font-bold hover:underline shrink-0">
                      Edit →
                    </a>
                  </div>
                </div>

                {/* Ambient Sound */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <AudioLines className="w-4 h-4" /> Ambient Sound
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { audio.setTrack('rain'); if (!audio.isPlaying) audio.togglePlay(); }}
                      className={`py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${audio.isPlaying && audio.currentTrack === 'rain' ? "bg-primary/10 text-primary border border-primary/30" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent"}`}>
                      <CloudRain className="w-4 h-4" /> Rain
                    </button>
                    <button onClick={() => { audio.setTrack('forest'); if (!audio.isPlaying) audio.togglePlay(); }}
                      className={`py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${audio.isPlaying && audio.currentTrack === 'forest' ? "bg-tertiary/10 text-tertiary border border-tertiary/30" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent"}`}>
                      <Trees className="w-4 h-4" /> Forest
                    </button>
                    <button onClick={() => toast.info("Lo-Fi track coming soon!")}
                      className="py-2 flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright rounded-lg text-sm font-medium transition-colors border border-transparent">
                      <Headphones className="w-4 h-4" /> Lo-Fi
                    </button>
                    <button onClick={() => audio.isPlaying && audio.togglePlay()}
                      className={`py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors ${!audio.isPlaying ? "bg-primary/10 text-primary border border-primary/30" : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent"}`}>
                      Off
                    </button>
                  </div>
                  <div className="pt-2 px-1">
                    <input type="range" min="0" max="1" step="0.01" value={audio.volume}
                      onChange={(e) => audio.setVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>

                {/* Break Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <Mic2 className="w-4 h-4" /> Break Settings
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-on-surface-variant text-sm font-medium">Auto-start next session</span>
                    <button onClick={() => setAutoStart(!autoStart)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${autoStart ? 'bg-primary/40' : 'bg-surface-variant'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${autoStart ? 'right-0.5 bg-primary' : 'left-0.5 bg-on-surface-variant'}`} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-on-surface-variant text-sm font-medium">Length:</span>
                    <button onClick={() => setBreakLength(5)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${breakLength === 5 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}>
                      5M
                    </button>
                    <button onClick={() => setBreakLength(15)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${breakLength === 15 ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent'}`}>
                      15M
                    </button>
                  </div>
                </div>

                {/* Notifications */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-on-surface-variant text-sm font-bold font-headline uppercase tracking-wide">
                    <Bell className="w-4 h-4" /> Notifications
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
                <button onClick={saveSettings}
                  className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold font-headline rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/20 tracking-wide">
                  SAVE CONFIGURATION
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {(!isRunning || isBreak) && <MobileBottomNav />}
    </div>
  );
}
