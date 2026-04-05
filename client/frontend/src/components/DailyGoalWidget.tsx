"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Target, CheckCircle2, X } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

const PRESETS = [240, 360, 480, 600]; // minutes

function GoalRing({
  progress,
  size = 64,
  strokeWidth = 5,
  achieved,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  achieved: boolean;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - Math.min(1, progress) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={strokeWidth}
        className="text-surface-container-highest opacity-50" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className={achieved ? "text-emerald-400" : "text-primary"}
        style={{ transition: "stroke-dashoffset 0.7s ease" }}
      />
    </svg>
  );
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function formatGoal(minutes: number) {
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`;
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${minutes}m`;
}

interface GoalStats {
  todayFocusSeconds: number;
  dailyGoalMinutes: number;
  goalAchievedToday: boolean;
}

interface Props {
  /** 'compact' = sidebar/settings card, 'full' = standalone banner */
  variant?: "compact" | "full";
  className?: string;
}

/**
 * DailyGoalWidget
 * A reusable card that shows today's study time vs the daily goal,
 * lets users set/change the goal inline, and decorates achievement.
 *
 * Used on: Home (dashboard) right sidebar, Settings page.
 */
export default function DailyGoalWidget({ variant = "compact", className = "" }: Props) {
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/focus/stats");
      setStats({
        todayFocusSeconds: data.todayFocusSeconds ?? 0,
        dailyGoalMinutes: data.dailyGoalMinutes ?? 0,
        goalAchievedToday: data.goalAchievedToday ?? false,
      });
      setGoalInput(data.dailyGoalMinutes ?? 0);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    window.addEventListener("focusSessionCompleted", fetchStats);
    return () => window.removeEventListener("focusSessionCompleted", fetchStats);
  }, [fetchStats]);

  const saveGoal = async (minutes: number) => {
    setSaving(true);
    try {
      await api.patch("/focus/goal", { minutes });
      setStats((prev) =>
        prev ? { ...prev, dailyGoalMinutes: minutes } : prev
      );
      setGoalInput(minutes);
      setEditing(false);
      toast.success(
        minutes === 0 ? "Daily goal removed." : `Daily goal set to ${formatGoal(minutes)}.`
      );
    } catch {
      toast.error("Failed to save goal.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading skeleton ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`bg-surface-container p-6 rounded-xl border border-white/5 animate-pulse ${className}`}>
        <div className="h-3 w-24 bg-surface-container-highest rounded mb-4" />
        <div className="h-16 bg-surface-container-highest rounded" />
      </div>
    );
  }

  const hasGoal = (stats?.dailyGoalMinutes ?? 0) > 0;
  const progress =
    hasGoal && stats
      ? stats.todayFocusSeconds / (stats.dailyGoalMinutes * 60)
      : 0;
  const achieved = stats?.goalAchievedToday ?? false;
  const todaySecs = stats?.todayFocusSeconds ?? 0;
  const goalMins = stats?.dailyGoalMinutes ?? 0;
  const remainingSecs = Math.max(0, goalMins * 60 - todaySecs);

  // ── No-goal empty state ──────────────────────────────────────────
  if (!hasGoal && !editing) {
    return (
      <div className={`bg-surface-container p-6 rounded-xl border border-white/5 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-sm">Daily Study Goal</h4>
          <Target className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-on-surface-variant mb-4">
          Set a daily study time goal to track your progress and stay accountable.
        </p>
        <button
          onClick={() => setEditing(true)}
          className="w-full py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          + Set Daily Goal
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-surface-container p-6 rounded-xl border border-white/5 space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm">Daily Study Goal</h4>
        <div className="flex items-center gap-2">
          {hasGoal && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-[10px] text-on-surface-variant hover:text-primary transition-colors font-semibold uppercase tracking-wide"
            >
              Edit
            </button>
          )}
          <Target className={`w-4 h-4 ${achieved ? "text-emerald-400" : "text-primary"}`} />
        </div>
      </div>

      {/* Goal Editor */}
      {editing ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs text-on-surface-variant">Choose a daily goal:</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setGoalInput(m)}
                className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                  goalInput === m
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-bright border border-transparent"
                }`}
              >
                {m / 60}h
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              max={1440}
              value={goalInput || ""}
              onChange={(e) => setGoalInput(Number(e.target.value))}
              placeholder="Custom (mins)"
              className="flex-1 py-2 px-3 bg-surface-container-highest border-none text-on-surface text-sm rounded-lg focus:ring-1 focus:ring-primary/40"
            />
            <button
              onClick={() => saveGoal(goalInput)}
              disabled={saving}
              className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {saving ? "..." : "Set"}
            </button>
            {hasGoal && (
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-2 bg-surface-container-highest text-on-surface-variant rounded-lg hover:bg-surface-bright transition-colors"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {hasGoal && (
            <button
              onClick={() => saveGoal(0)}
              disabled={saving}
              className="w-full py-1.5 text-xs text-on-surface-variant hover:text-error transition-colors"
            >
              Remove goal
            </button>
          )}
        </div>
      ) : (
        /* Progress display */
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <GoalRing progress={progress} achieved={achieved} />
            {achieved && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-base font-extrabold ${achieved ? "text-emerald-400" : "text-on-surface"}`}>
              {formatDuration(todaySecs)}
              <span className="text-on-surface-variant font-normal text-xs ml-1">
                / {formatGoal(goalMins)}
              </span>
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {achieved
                ? "Goal achieved! Outstanding work. 🏆"
                : `${formatDuration(remainingSecs)} remaining`}
            </p>
            {/* Linear progress bar */}
            <div className="w-full h-1 bg-surface-container-highest rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${achieved ? "bg-emerald-400" : "bg-primary"}`}
                style={{ width: `${Math.min(100, progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Link to focus room */}
      {!editing && (
        <Link
          href="/focus-room"
          className="block w-full py-2.5 bg-primary/10 text-primary text-xs font-bold text-center rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors"
        >
          {achieved ? "Keep Going →" : "Start Focusing →"}
        </Link>
      )}
    </div>
  );
}
