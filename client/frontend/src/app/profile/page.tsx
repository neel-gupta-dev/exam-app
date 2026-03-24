import DashboardLayout from "@/components/DashboardLayout";
import { profileData } from "@/lib/mockData";
import Image from "next/image";
import {
  Zap,
  Pen,
  LogOut,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  BookOpen,
  Brain,
  Flame,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto space-y-10">
        {/* Hero Section */}
        <div className="grid grid-cols-12 gap-8 items-stretch">
          {/* Profile Identity */}
          <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-[2rem] p-10 flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden border border-white/[0.03]">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[80px]" />
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] p-1 bg-gradient-to-br from-primary via-outline-variant to-tertiary shadow-2xl overflow-hidden group-hover:rotate-2 transition-transform duration-500">
                <Image
                  src={profileData.avatarUrl}
                  alt="Profile"
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rounded-[2.25rem]"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-primary text-on-primary w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-surface-container shadow-xl animate-pulse">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                <h2 className="text-5xl font-extrabold tracking-tight text-white">{profileData.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-black text-2xl uppercase">Level {profileData.level}</span>
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg border border-primary/30 uppercase tracking-widest">
                    {profileData.title}
                  </span>
                </div>
              </div>
              <p className="text-on-surface-variant max-w-xl mb-8 leading-relaxed text-lg font-medium">
                Dedicated Scholar specializing in <span className="text-white">Theoretical Physics</span>. Maintaining a consistent{" "}
                <span className="text-primary">114-day deep work streak</span>.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button className="bg-white text-black px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-xl shadow-black/20">
                  <Pen className="w-4 h-4" />
                  Edit Profile
                </button>
                <button className="bg-surface-container-highest/80 backdrop-blur-md text-on-surface border border-outline-variant/30 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-surface-bright transition-all flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Exam Target */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-surface-container-low to-surface-container rounded-[2rem] p-10 flex flex-col justify-between border border-primary/20 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:w-2 transition-all duration-300" />
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-on-surface-variant text-xs tracking-[0.2em] uppercase">Target Goal</h3>
                <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-widest">2024 Cycle</span>
                </div>
              </div>
              <div className="mb-10">
                <div className="text-5xl font-black text-white mb-2 tracking-tight">{profileData.targetExam}</div>
                <p className="text-on-surface-variant text-sm font-medium">{profileData.targetExamFull}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-1">Preparation Readiness</span>
                  <span className="text-3xl font-black text-primary">{profileData.preparationReadiness}<span className="text-xl">%</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-1">Target Score</span>
                  <span className="text-xl font-bold text-white">{profileData.targetScore}</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-variant/50 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full" style={{ width: `${profileData.preparationReadiness}%`, boxShadow: "0 0 15px rgba(192,193,255,0.4)" }} />
              </div>
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <p className="text-xs text-on-surface-variant/90 leading-relaxed font-medium">
                  <span className="text-primary font-bold">Tip:</span> Focus on <span className="text-white">Electromagnetism</span> and <span className="text-white">Organic Synthesis</span> to boost your score by 12% next week.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Metrics */}
        <div className="grid grid-cols-12 gap-8">
          {/* Achievements */}
          <div className="col-span-12 md:col-span-8 bg-surface-container rounded-[2rem] p-10 border border-white/[0.03]">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="font-extrabold text-2xl text-white mb-1">Scholar Achievements</h3>
                <p className="text-sm text-on-surface-variant font-medium">Recognition for your academic dedication</p>
              </div>
              <button className="text-primary text-sm font-bold bg-primary/10 px-5 py-2.5 rounded-xl hover:bg-primary hover:text-on-primary transition-all">
                View Hall of Fame
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
              {[
                { icon: <Award className="w-12 h-12 text-primary" />, name: "Centurion Streak", sub: "114 Days", locked: false },
                { icon: <BookOpen className="w-12 h-12 text-tertiary" />, name: "Deep Diver", sub: "500+ Hours", locked: false },
                { icon: <Brain className="w-12 h-12 text-on-surface-variant" />, name: "Master Mind", sub: "Locked", locked: true },
                { icon: <Flame className="w-12 h-12 text-error" />, name: "Night Owl", sub: "Late Scholar", locked: false },
              ].map((badge) => (
                <div key={badge.name} className={`flex flex-col items-center group ${badge.locked ? "opacity-40" : ""}`}>
                  <div className={`w-24 h-24 rounded-3xl ${badge.locked ? "bg-surface-variant/30 border border-outline-variant/10" : "bg-surface-container-high border border-outline-variant/20"} flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-black/20`}>
                    {badge.icon}
                  </div>
                  <span className={`text-sm font-bold text-center ${badge.locked ? "text-on-surface-variant" : "text-white"}`}>{badge.name}</span>
                  <span className="text-[11px] text-on-surface-variant font-black uppercase tracking-widest mt-1">{badge.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="col-span-12 md:col-span-4 bg-surface-container rounded-[2rem] p-10 flex flex-col gap-6 border border-white/[0.03]">
            <h3 className="font-extrabold text-2xl text-white mb-2">Key Metrics</h3>
            <div className="flex flex-col gap-4">
              {[
                { icon: <Clock className="w-7 h-7" />, label: "Total Focus Time", value: profileData.totalFocusTime, unit: "h", iconBg: "bg-primary/10 text-primary" },
                { icon: <CheckCircle className="w-7 h-7" />, label: "Quiz Accuracy", value: profileData.quizAccuracy, unit: "%", iconBg: "bg-tertiary/10 text-tertiary" },
                { icon: <TrendingUp className="w-7 h-7" />, label: "Global Rank", value: profileData.globalRank, unit: "", iconBg: "bg-error/10 text-error" },
              ].map((metric) => (
                <div key={metric.label} className="group flex items-center gap-5 bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/10 p-5 rounded-2xl transition-all duration-300">
                  <div className={`w-14 h-14 rounded-xl ${metric.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {metric.icon}
                  </div>
                  <div>
                    <div className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.15em] mb-1">{metric.label}</div>
                    <div className="text-2xl font-black text-white">
                      {metric.value}
                      {metric.unit && <span className="text-sm text-primary-dim ml-1 font-bold">{metric.unit}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Configuration */}
        <div className="bg-surface-container rounded-[2rem] overflow-hidden border border-white/[0.03]">
          <div className="px-10 py-8 border-b border-outline-variant/10 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-2xl text-white">Account Configuration</h3>
              <p className="text-sm text-on-surface-variant font-medium mt-1">Manage your academic identity and security</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Systems Online</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 space-y-10">
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Primary Email</label>
                <div className="flex items-center gap-4">
                  <div className="text-white font-bold text-lg">{profileData.email}</div>
                  <span className="bg-surface-variant px-3 py-1 rounded text-[10px] text-on-surface-variant font-bold">VERIFIED</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Membership Plan</label>
                <div className="flex items-center gap-4">
                  <div className="text-white font-bold text-lg">{profileData.membership}</div>
                  <span className="bg-gradient-to-r from-tertiary/20 to-tertiary/10 text-tertiary text-[10px] font-black px-3 py-1.5 rounded-lg border border-tertiary/20 uppercase tracking-widest">Annual Elite</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2 font-medium italic">Next billing cycle: Nov 14, 2024</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Academic Affiliation</label>
                <div className="flex items-center gap-3 p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block">{profileData.affiliation}</span>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{profileData.department}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-10 bg-surface-container-high/30 space-y-10 border-l border-outline-variant/5">
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Security Infrastructure</label>
                <div className="p-5 bg-surface-container rounded-2xl border border-outline-variant/10 flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    Your research data is protected by <span className="text-white">AES-256 end-to-end encryption</span>. Sync active across <span className="text-white">3 authorized devices</span>.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Account Security</label>
                <div className="flex items-center gap-3 text-green-400 font-bold text-sm bg-green-400/5 px-4 py-3 rounded-xl border border-green-400/10">
                  <CheckCircle className="w-5 h-5" />
                  Multi-Factor Authentication Active
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <button className="text-error-dim text-sm font-bold hover:text-error hover:bg-error-container/20 px-6 py-3 rounded-2xl transition-all border border-transparent hover:border-error/20">
                    Deactivate Account
                  </button>
                  <button className="text-on-surface-variant text-xs font-bold hover:text-white transition-colors">Privacy Policy</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-10 pb-16 flex flex-col items-center gap-4">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
          <div className="text-center">
            <p className="text-on-surface-variant text-[11px] font-black tracking-[0.3em] uppercase opacity-60">The Focused Scholar · Version 4.2.0</p>
            <p className="text-[10px] text-on-surface-variant/40 mt-2 font-medium">© 2024 Academic Excellence Built on Discipline</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
