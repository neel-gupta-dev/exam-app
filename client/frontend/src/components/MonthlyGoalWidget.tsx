"use client";

import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import api from "@/lib/api";

export interface Milestone {
  id: string;
  label: string;
  isCompleted: boolean;
}

export interface MonthlyStats {
  focusProgress: {
    current: number;
    target: number;
    percent: number;
  };
  milestones: Milestone[];
}

/**
 * Monthly Goal Widget
 * Displays the user's progress towards a monthly focus time target and recent milestones.
 * Listens for `focusSessionCompleted` and `resourceAdded` window events to refresh its data live.
 */
export default function MonthlyGoalWidget({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/analytics/monthly-stats');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch monthly stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    
    // Listen for updates
    window.addEventListener('focusSessionCompleted', fetchStats);
    window.addEventListener('resourceAdded', fetchStats);
    
    return () => {
      window.removeEventListener('focusSessionCompleted', fetchStats);
      window.removeEventListener('resourceAdded', fetchStats);
    };
  }, []);

  if (loading) {
    return (
      <div className={`bg-surface-container p-6 rounded-xl border border-white/5 animate-pulse ${className}`}>
        <div className="h-4 w-24 bg-surface-container-highest rounded mb-6"></div>
        <div className="h-12 bg-surface-container-highest rounded mb-4"></div>
        <div className="space-y-3 pt-4 border-t border-outline-variant/30">
          <div className="h-3 w-32 bg-surface-container-highest rounded"></div>
          <div className="h-4 w-full bg-surface-container-highest rounded"></div>
          <div className="h-4 w-full bg-surface-container-highest rounded"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`bg-surface-container p-6 rounded-xl border border-white/5 space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm">Monthly Goal</h4>
        <Flag className="w-4 h-4 text-primary" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-on-surface-variant">Focus Progress</span>
          <span className="font-bold text-primary">
            {Math.round(stats.focusProgress.current / 60)} / {Math.round(stats.focusProgress.target / 60)}h
          </span>
        </div>
        <div className="w-full bg-surface-variant h-1 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-1000" 
            style={{ width: `${stats.focusProgress.percent}%` }}
          ></div>
        </div>
      </div>

      <div className="pt-4 border-t border-outline-variant/30">
        <p className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold mb-3">Recent Progress</p>
        <ul className="space-y-3">
          {stats.milestones.map((milestone) => (
            <li key={milestone.id} className="flex items-center gap-3">
              <div 
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${
                  milestone.isCompleted ? 'bg-primary' : 'bg-primary/20'
                }`}
              ></div>
              <span className={`text-xs transition-colors duration-500 ${
                milestone.isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
              }`}>
                {milestone.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
