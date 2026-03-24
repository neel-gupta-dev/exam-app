"use client";

import DashboardLayout from "@/components/DashboardLayout";
import DashboardGrid from "@/components/DashboardGrid";
import {
  Timer,
  Lightbulb,
  Sparkles,
  Star,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/lib/api";

function ProgressWidget({ resourceCount }: { resourceCount: number }) {
  const heatmapOpacities: Record<number, string> = {
    0: "bg-surface-variant/50",
    20: "bg-primary/20",
    40: "bg-primary/40",
    60: "bg-primary/60",
    80: "bg-primary/80",
    100: "bg-primary",
  };

  const streakDays = 0;
  const heatmap = new Array(28).fill(0);

  return (
    <div className="bg-surface-container p-6 rounded-xl">
      <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">
        Focus & Progress
      </h3>

      {/* Resources Saved */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">
            Resources Saved
          </p>
          <div className="flex items-center gap-2 mt-1">
            <BookOpen className="w-6 h-6 text-primary" />
            <h4 className="text-2xl font-extrabold text-on-surface">
              {resourceCount}
            </h4>
          </div>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle
              className="stroke-surface-variant"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
            />
            <circle
              className="stroke-primary"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
              strokeDasharray={`${Math.min((resourceCount / 10) * 100, 100)}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-on-surface">
              {resourceCount}/10
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">
            Learning Streak
          </p>
          <span className="text-[10px] text-primary font-bold">
            {streakDays} Days
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {heatmap.map((level, i) => (
            <div
              key={i}
              className={`aspect-square rounded-[2px] ${
                heatmapOpacities[level] || "bg-surface-variant/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Start Focus Button */}
      <button className="w-full mt-8 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Timer className="w-4 h-4" />
        Start Focus Session
      </button>
    </div>
  );
}

function QuickTipCard() {
  return (
    <div className="bg-surface-bright p-5 rounded-xl border border-outline-variant/10">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">
          Quick Tip
        </span>
      </div>
      <p className="text-xs leading-relaxed text-on-surface-variant">
        Reviewing your chemistry notes within 24 hours can increase retention by
        up to 60%. Try a 10-minute flashcard session now.
      </p>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [resourceCount, setResourceCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/resources?page=1&limit=1');
        setResourceCount(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch aggregate stats:", error);
      }
    };
    if (user) {
      fetchStats();
      const handleResourceAdded = () => fetchStats();
      window.addEventListener("resourceAdded", handleResourceAdded);
      return () => window.removeEventListener("resourceAdded", handleResourceAdded);
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex gap-8">
        {/* Left Column (70%) */}
        <section className="w-[70%] space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
                Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Your Vault has {resourceCount} resources ready for review.
              </p>
            </div>
          </div>

          {/* Resource Cards */}
          <DashboardGrid />

          {/* Bento Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* AI Synthesis */}
            <div className="bg-surface-container p-6 rounded-xl aspect-[16/9] flex flex-col justify-between">
              <div>
                <Sparkles className="w-5 h-5 text-primary mb-4" />
                <h3 className="font-bold text-lg text-on-surface">
                  AI Synthesis
                </h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  Generate summary cards from your handwritten Physics notes.
                </p>
              </div>
              <button className="w-fit text-xs font-semibold px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-bright transition-colors">
                Launch Assistant
              </button>
            </div>

            {/* Weekly Goal */}
            <div className="bg-primary/5 p-6 rounded-xl aspect-[16/9] flex flex-col justify-center items-center text-center">
              <Star className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-bold text-lg text-primary">Resource Goal</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-[200px]">
                Save 10 high-yield resources for {user?.targetExam?.[0] || 'your exam'}.
              </p>
              <div className="w-full bg-surface-container rounded-full h-1 mt-6">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.min((resourceCount / 10) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2">
                {Math.min(Math.round((resourceCount / 10) * 100), 100)}% Achieved
              </span>
            </div>
          </div>
        </section>

        {/* Right Column (30%) */}
        <aside className="w-[30%] space-y-6">
          <ProgressWidget resourceCount={resourceCount} />
          <QuickTipCard />
        </aside>
      </div>
    </DashboardLayout>
  );
}
