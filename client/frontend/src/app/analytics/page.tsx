"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Resource } from "@/types";
import {
  Clock,
  Flame,
  CheckCircle,
  Trophy,
  ChevronRight,
  Download,
  ArrowRight,
  Zap,
  Lightbulb,
  Coffee,
  BookOpen,
  FolderOpen
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  clock: <BookOpen className="w-5 h-5" />,
  flame: <FolderOpen className="w-5 h-5" />,
  "check-circle": <CheckCircle className="w-5 h-5" />,
  trophy: <Trophy className="w-5 h-5" />,
};

function getHeatmapClass(level: number) {
  if (level === -1) return "bg-surface-bright opacity-30";
  if (level === 0) return "bg-surface-bright";
  if (level <= 1) return "bg-indigo-500/20";
  if (level <= 2) return "bg-indigo-500/40";
  if (level <= 3) return "bg-indigo-500/60";
  if (level <= 4) return "bg-indigo-500/80";
  if (level === 5) return "bg-indigo-500";
  return "bg-primary border-2 border-white ring-2 ring-primary/30 scale-110";
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllResources = async () => {
      try {
        const { data } = await api.get('/resources?page=1&limit=1000');
        setResources(data.resources || []);
      } catch (error) {
        console.error("Failed to fetch resources for analytics", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchAllResources();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <LoadingSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  const totalResources = resources.length;
  
  // Calculate unique folders
  const folders = Array.from(new Set(resources.map((r) => r.folderName).filter(Boolean))) as string[];
  const uniqueFoldersCount = folders.length;

  // Process folder distribution for "Subject Mastery"
  const folderCounts: Record<string, number> = {};
  resources.forEach(r => {
    if (r.folderName) {
      folderCounts[r.folderName] = (folderCounts[r.folderName] || 0) + 1;
    }
  });

  const subjectMastery = Object.entries(folderCounts)
    .sort((a, b) => b[1] - a[1]) // highest first
    .slice(0, 5) // top 5
    .map(([name, count], index) => {
      const percent = totalResources > 0 ? Math.round((count / totalResources) * 100) : 0;
      const colors = ["bg-blue-400", "bg-indigo-400", "bg-emerald-400", "bg-orange-400", "bg-purple-400"];
      return { 
        name, 
        percent, 
        count,
        color: colors[index % colors.length] 
      };
    });

  // Real Level and Streak from AuthContext
  const realLevel = user?.levelData?.currentLevel || user?.level || 1;
  const currentStreak = user?.currentStreak || 0;
  const totalActiveSeconds = user?.totalActiveSeconds || 0;
  const xpRemaining = user?.levelData?.xpRemaining || 0;
  const progressToNext = user?.levelData?.progressToNext || 0;
  
  const formatActiveTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  let levelName = "Novice";
  if (realLevel >= 50) levelName = "Grandmaster";
  else if (realLevel >= 25) levelName = "Master";
  else if (realLevel >= 10) levelName = "Scholar";
  else if (realLevel >= 5) levelName = "Aspirant";

  const analyticsStats = [
    { label: "Total Resources", value: totalResources.toString(), unit: "saved", icon: "clock", iconColor: "text-primary", iconBg: "bg-primary/10", change: "↑ Active", changeColor: "text-green-400", note: "Keep saving" },
    { label: "Active Time", value: formatActiveTime(totalActiveSeconds), unit: "total", icon: "flame", iconColor: "text-orange-400", iconBg: "bg-orange-500/10", change: "★ Consistent", changeColor: "text-primary", note: `${currentStreak} day streak` },
    { label: "Vault Usage", value: Math.min((totalResources / 100) * 100, 100).toFixed(1), unit: "%", icon: "check-circle", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10", change: "Growing", changeColor: "text-emerald-400", note: "of 100 goal" },
    { label: "Scholar Level", value: `Lvl ${realLevel}`, unit: levelName, icon: "trophy", iconColor: "text-purple-400", iconBg: "bg-purple-500/10", change: user?.isVerifiedStudent ? "Verified" : "Unverified", changeColor: user?.isVerifiedStudent ? "text-primary" : "text-surface-variant", note: "Status" },
  ];

  const recentSessions = resources.slice(0, 3).map((r, i) => {
    const colors = ["bg-blue-400", "bg-indigo-400", "bg-orange-400"];
    const dates = ["Today", "Yesterday", "Recently"];
    return {
      title: r.title,
      type: r.type,
      folder: r.folderName || "Uncategorized",
      dotColor: colors[i % colors.length],
      time: new Date(r.createdAt).toLocaleDateString(),
    };
  });

  const analyticsHeatmap = new Array(21).fill(0).map((_, i) => ({ day: i + 1, level: i > 15 ? 3 : i % 2 })); // mockup static heatmap still since we don't have historical progression yet

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Vault Analytics</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Vault Analytics
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
            Personalized intelligence based on your saved resources and topics.
            You are a <span className="text-primary font-bold">{levelName}</span> level scholar.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold transition-all hover:bg-primary-dim">
            <Download className="w-4 h-4" />
            EXPORT REPORT
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {analyticsStats.map((stat) => (
          <div key={stat.label} className="bg-surface-container/50 border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center ${stat.iconColor}`}>
                {iconMap[stat.icon]}
              </div>
              <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className={`font-extrabold text-on-surface ${stat.value.length > 5 ? 'text-xl' : 'text-3xl'}`}>{stat.value}</span>
              <span className="text-xs text-on-surface-variant mb-1.5">{stat.unit}</span>
            </div>
            {stat.label === "Scholar Level" && (
              <div className="mt-3 space-y-1.5">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${progressToNext}%` }} />
                </div>
                <div className="flex justify-between text-[8px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <span>{Math.round(progressToNext)}% Complete</span>
                  <span>{Math.round(xpRemaining)} XP Left</span>
                </div>
              </div>
            )}
            <div className={`mt-4 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[10px] ${stat.label === "Scholar Level" ? 'mt-2' : ''}`}>
              <span className={`${stat.changeColor} font-bold`}>{stat.change}</span>
              <span className="text-on-surface-variant font-medium">{stat.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Subject Mastery / Folder Distribution */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-2xl p-8 border border-white/5 flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold tracking-tight">Folder Distribution</h3>
            <p className="text-xs text-on-surface-variant mt-1">Which subjects you are saving the most resources for</p>
          </div>
          
          {subjectMastery.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant italic text-sm">
              <FolderOpen className="w-8 h-8 text-primary/30 mb-2" />
              Not enough folders to calculate distribution.
            </div>
          ) : (
            <div className="space-y-6 flex-1">
              {subjectMastery.map((subject) => (
                <div key={subject.name} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${subject.color}`} />
                      <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{subject.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-on-surface-variant">{subject.count} resources</span>
                      <span className="text-xs font-bold text-primary w-8 text-right">{subject.percent}%</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${subject.color} rounded-full transition-all duration-1000`} style={{ width: `${subject.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Streaks Heatmap */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-2xl p-8 border border-white/5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Daily Streaks</h3>
              <p className="text-xs text-on-surface-variant mt-1">Vault activity consistency</p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {["M","T","W","T","F","S","S"].map((d,i) => (
              <div key={i} className="text-center text-[8px] font-bold text-on-surface-variant opacity-50 uppercase">{d}</div>
            ))}
            {analyticsHeatmap.map((item) => (
              <div key={item.day} className={`aspect-square rounded flex items-center justify-center text-[10px] font-bold border border-white/5 ${getHeatmapClass(item.level)} ${item.level >= 5 ? "text-white" : item.level >= 1 ? "text-on-surface" : "text-on-surface-variant"}`}>
                {item.day}
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            <span>Less Active</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded bg-surface-bright border border-white/5" />
              <div className="w-3 h-3 rounded bg-indigo-500/30" />
              <div className="w-3 h-3 rounded bg-indigo-500/60" />
              <div className="w-3 h-3 rounded bg-indigo-500" />
            </div>
            <span>Highly Active</span>
          </div>
        </div>

      </div>

      {/* Recent Sessions Table */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight">Recent Additions</h3>
          <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View Vault</button>
        </div>
        <div className="bg-surface-container/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-on-surface-variant border-b border-white/5">
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Title</th>
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Folder</th>
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Type</th>
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-8 text-center text-on-surface-variant italic text-sm">
                    No resources added yet. Check out the Quick Save feature!
                  </td>
                </tr>
              ) : (
                recentSessions.map((session, j) => (
                  <tr key={j} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${session.dotColor}`} />
                        <span className="font-bold text-on-surface line-clamp-1">{session.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant text-xs">{session.folder}</td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 rounded bg-surface-bright text-[10px] font-black uppercase text-on-surface">
                        {session.type}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-on-surface-variant text-xs">{session.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
