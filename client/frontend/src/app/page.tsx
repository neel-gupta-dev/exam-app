"use client";

import DashboardLayout from "@/components/DashboardLayout";
import DashboardGrid from "@/components/DashboardGrid";
import {
  Timer,
  Lightbulb,
  Star,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import LevelProgressBar from "@/components/LevelProgressBar";
import { User } from "@/types";

function ProgressWidget({ resourceCount, heatmapData, currentStreak, user }: { resourceCount: number, heatmapData: number[], currentStreak: number, user: User | null }) {
  const getHeatmapClass = (count: number, maxCount: number) => {
    if (count === 0) return "bg-surface-variant/50";
    const ratio = count / (maxCount || 1);
    if (ratio <= 0.25) return "bg-primary/20";
    if (ratio <= 0.5) return "bg-primary/40";
    if (ratio <= 0.75) return "bg-primary/60";
    if (ratio < 1) return "bg-primary/80";
    return "bg-primary";
  };

  const streakDays = currentStreak || 0;
  const maxContributions = Math.max(...heatmapData, 4);

  return (
    <div className="bg-surface-container p-6 rounded-xl">
      <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">
        Focus & Progress
      </h3>

      {user?.levelData && (
        <div className="mb-8 p-4 bg-surface-container-highest/30 rounded-xl border border-white/5">
          <LevelProgressBar 
            currentLevel={user.levelData.currentLevel}
            progress={user.levelData.progressToNext}
            xpRemaining={user.levelData.xpRemaining}
          />
        </div>
      )}

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
          {heatmapData.map((count, i) => (
            <div
              key={i}
              title={`${count} resources`}
              className={`aspect-square rounded-[2px] transition-colors ${getHeatmapClass(count, maxContributions)}`}
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
  const [heatmapData, setHeatmapData] = useState<number[]>(new Array(28).fill(0));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/resources?limit=200'); // fetch up to 200 to build heatmap
        setResourceCount(data.total || 0);

        // Calculate heatmap for the last 28 days
        const heatmapObj = new Array(28).fill(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (data.resources && Array.isArray(data.resources)) {
          data.resources.forEach((res: any) => {
            const d = new Date(res.createdAt);
            d.setHours(0, 0, 0, 0);
            const diffTime = today.getTime() - d.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays < 28) {
              const index = 27 - diffDays;
              heatmapObj[index]++;
            }
          });
        }
        setHeatmapData(heatmapObj);

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
          <div className="grid grid-cols-1 gap-4">
            {/* Weekly Goal */}
            <div className="bg-primary/5 p-8 rounded-xl aspect-[21/9] flex flex-col justify-center items-center text-center">
              <Star className="w-12 h-12 text-primary mb-4" />
              <h3 className="font-bold text-xl text-primary">Resource Goal</h3>
              <p className="text-sm text-on-surface-variant mt-2 max-w-sm">
                Save 10 high-yield resources for {user?.targetExam?.[0] || 'your exam'}.
              </p>
              <div className="w-full max-w-md bg-surface-container rounded-full h-1.5 mt-8">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${Math.min((resourceCount / 10) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-on-surface-variant mt-3 font-medium">
                {Math.min(Math.round((resourceCount / 10) * 100), 100)}% Achieved
              </span>
            </div>
          </div>
        </section>

        {/* Right Column (30%) */}
        <aside className="w-[30%] space-y-6">
          <ProgressWidget 
            resourceCount={resourceCount} 
            heatmapData={heatmapData} 
            currentStreak={user?.currentStreak || 0} 
            user={user}
          />
          <QuickTipCard />
        </aside>
      </div>
    </DashboardLayout>
  );
}
