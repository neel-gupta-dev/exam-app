import DashboardLayout from "@/components/DashboardLayout";
import { analyticsStats, subjectMastery, recentSessions, analyticsHeatmap } from "@/lib/mockData";
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
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  clock: <Clock className="w-5 h-5" />,
  flame: <Flame className="w-5 h-5" />,
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
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">
            <span>Dashboard</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-primary">Performance Analytics</span>
          </nav>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            Performance Analytics
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-sm leading-relaxed">
            Personalized intelligence based on your last <span className="text-white font-bold">28 days</span> of activity.
            You&apos;re currently in the <span className="text-primary font-bold">top 4%</span> of learners this month.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-container p-1 rounded-lg">
            <button className="px-4 py-1.5 text-[11px] font-bold rounded-md bg-surface-bright text-on-surface shadow-sm">WEEKLY</button>
            <button className="px-4 py-1.5 text-[11px] font-bold rounded-md text-on-surface-variant hover:text-on-surface">MONTHLY</button>
          </div>
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
              <span className="text-3xl font-extrabold text-on-surface">{stat.value}</span>
              <span className="text-xs text-on-surface-variant mb-1.5">{stat.unit}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-1.5 text-[10px]">
              <span className={`${stat.changeColor} font-bold`}>{stat.change}</span>
              <span className="text-on-surface-variant font-medium">{stat.note}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Focus Distribution Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-2xl p-8 border border-white/5">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Focus Distribution</h3>
              <p className="text-xs text-on-surface-variant mt-1">Average hourly concentration levels over 24 hours</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/10" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Fatigue</span>
              </div>
            </div>
          </div>
          <div className="h-64 relative mt-10">
            <div className="absolute -left-8 inset-y-0 flex flex-col justify-between text-[10px] font-bold text-on-surface-variant opacity-50 py-1">
              <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
            </div>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0,1,2,3,4].map(i => <div key={i} className="border-t border-white/5 w-full" />)}
            </div>
            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 200" style={{ filter: "drop-shadow(0 0 8px rgba(192, 193, 255, 0.3))" }}>
              <defs>
                <linearGradient id="focusGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#c0c1ff", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#c0c1ff", stopOpacity: 0 }} />
                </linearGradient>
              </defs>
              <path d="M 0 180 Q 80 160 150 120 T 250 140 T 350 40 T 450 80 T 550 30 T 650 60 T 800 40 V 200 H 0 Z" fill="url(#focusGradient)" opacity="0.15" />
              <path d="M 0 180 Q 80 160 150 120 T 250 140 T 350 40 T 450 80 T 550 30 T 650 60 T 800 40" fill="none" stroke="#c0c1ff" strokeLinecap="round" strokeWidth="3" />
              <circle cx="350" cy="40" fill="#c0c1ff" r="4" stroke="#0b0e11" strokeWidth="2" />
              <circle cx="550" cy="30" fill="#c0c1ff" r="4" stroke="#0b0e11" strokeWidth="2" />
            </svg>
            <div className="absolute -bottom-8 w-full flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">
              <span>06:00</span><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>21:00</span><span>00:00</span>
            </div>
            <div className="absolute top-[10%] left-[42%] transform -translate-x-1/2 -translate-y-full mb-4 px-3 py-1.5 bg-surface-bright border border-white/10 rounded-lg shadow-xl z-10">
              <p className="text-[10px] font-bold text-primary mb-0.5">Peak Concentration</p>
              <p className="text-xs font-bold">14:20 PM — 94%</p>
            </div>
          </div>
        </div>

        {/* Subject Mastery */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-2xl p-8 border border-white/5 flex flex-col">
          <div className="mb-8">
            <h3 className="text-lg font-bold tracking-tight">Subject Mastery</h3>
            <p className="text-xs text-on-surface-variant mt-1">Syllabus completion & recall strength</p>
          </div>
          <div className="space-y-6 flex-1">
            {subjectMastery.map((subject) => (
              <div key={subject.name} className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${subject.color}`} />
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{subject.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant">{subject.percent}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${subject.color} rounded-full transition-all duration-1000`} style={{ width: `${subject.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2.5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:bg-white/5 transition-all">
            View Detailed Syllabus
          </button>
        </div>

        {/* Daily Streaks Heatmap */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-2xl p-8 border border-white/5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Daily Streaks</h3>
              <p className="text-xs text-on-surface-variant mt-1">Consistency heatmap for June</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold text-primary">18</p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant">Current</p>
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

        {/* Optimization Insight */}
        <div className="col-span-12 lg:col-span-8 rounded-2xl p-8 relative overflow-hidden" style={{ background: "rgba(30, 39, 47, 0.4)", backdropFilter: "blur(24px)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight text-on-surface mb-3">Optimization Insight</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Your cognitive performance peaks between <span className="font-bold text-on-surface">08:30 AM — 11:15 AM</span>.
                Sessions longer than <span className="text-primary font-bold">90 mins</span> show a 24% drop in retention.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-primary-dim uppercase tracking-wider">#MorningBird</span>
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold text-primary-dim uppercase tracking-wider">#DeepWork</span>
              </div>
            </div>
            <div className="space-y-4 bg-surface/40 p-6 rounded-2xl border border-white/5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface mb-0.5">Recommended Schedule</p>
                  <p className="text-[10px] text-on-surface-variant">Move &quot;Organic Chemistry&quot; to your 08:30 AM slot for 1.4x faster learning.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-on-surface mb-0.5">Break Interval</p>
                  <p className="text-[10px] text-on-surface-variant">Insert a 12-min walk at 10:15 AM to reset cognitive load.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px]" />
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold tracking-tight">Recent Focus Sessions</h3>
          <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">View History</button>
        </div>
        <div className="bg-surface-container/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-on-surface-variant border-b border-white/5">
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Subject</th>
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Time Range</th>
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Intensity</th>
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px]">Efficiency</th>
                <th className="px-8 py-4 font-bold uppercase tracking-widest text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {recentSessions.map((session) => (
                <tr key={session.subject} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${session.dotColor}`} />
                      <span className="font-bold text-on-surface">{session.subject}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-on-surface-variant text-xs">{session.time}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < session.intensity ? "bg-primary" : "bg-white/10"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded ${session.effBg} ${session.effColor} text-[10px] font-black uppercase`}>
                      {session.efficiency}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 rounded-lg bg-surface-bright text-on-surface-variant group-hover:text-primary transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
