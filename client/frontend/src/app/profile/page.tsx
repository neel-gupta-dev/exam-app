"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
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
  BadgeCheck,
  ExternalLink,
  Share2
} from "lucide-react";
import LevelBadge from "@/components/LevelBadge";
import LevelProgressBar from "@/components/LevelProgressBar";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [resourceCount, setResourceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/resources?page=1&limit=1');
        setResourceCount(data.total || 0);
      } catch (error) {
        console.error("Failed to fetch aggregate stats:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-[1400px] mx-auto p-10">
          <LoadingSkeleton count={3} />
        </div>
      </DashboardLayout>
    );
  }

  // Level and Streak from AuthContext
  const level = user?.levelData?.currentLevel || 1;
  const currentStreak = user?.currentStreak || 0;

  let title = "Novice";
  if (level >= 50) title = "Grandmaster";
  else if (level >= 25) title = "Master";
  else if (level >= 10) title = "Scholar";
  else if (level >= 5) title = "Aspirant";

  const name = user?.name || "Student";
  const email = user?.email || "student@example.com";
  const targetExam = user?.targetExam?.[0] || "Preparation";
  const initials = name.substring(0, 2).toUpperCase();

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
              <LevelBadge level={user?.levelData?.currentLevel || 1} className="w-40 h-40" />
              <div className="absolute -bottom-3 -right-3 bg-primary text-on-primary w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-surface-container shadow-xl animate-pulse">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                <h2 className="text-5xl font-extrabold tracking-tight text-white">{name}</h2>
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg border border-primary/30 uppercase tracking-widest">
                    {title}
                  </span>
                  {user?.isVerifiedStudent && (
                    <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/30 uppercase tracking-widest ml-2">
                      <BadgeCheck className="w-3 h-3" />
                      Verified Aspirant
                    </span>
                  )}
                </div>
              </div>

              {user?.levelData && (
                <div className="mb-8 max-w-md">
                  <LevelProgressBar
                    progress={user.levelData.progressToNext}
                    xpRemaining={user.levelData.xpRemaining}
                    currentLevel={user.levelData.currentLevel}
                  />
                  <div className="mt-4 flex items-center gap-3">
                    <div className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        {user.levelData.totalXP} Total XP
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-on-surface-variant max-w-xl mb-8 leading-relaxed text-lg font-medium">
                {user?.bio || (
                  <>
                    Dedicated <span className="text-white">{targetExam}</span> Aspirant. Maintaining a steady collection of{" "}
                    <span className="text-primary">{resourceCount} saved materials</span> in the Vault.
                  </>
                )}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link href="/settings">
                  <button className="cursor-pointer bg-white text-black px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2 shadow-xl shadow-black/20">
                    <Pen className="w-4 h-4" />
                    Edit Profile
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="bg-surface-container-highest/80 backdrop-blur-md text-on-surface border border-outline-variant/30 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-error/20 hover:text-error hover:border-error/50 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Digital ID Card (Passport Style) */}
          <div className="col-span-12 lg:col-span-4 mx-auto w-full max-w-sm aspect-[2.125/3.37] bg-gradient-to-br from-indigo-900/20 to-surface-container rounded-[2rem] p-8 flex flex-col justify-between border border-primary/20 relative group overflow-hidden shadow-2xl shadow-primary/5">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
            <div className="z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-primary text-[10px] tracking-[0.25em] uppercase">Student Passport</h3>
                  <div className="flex items-center gap-2 group/id">
                    <div className="font-mono text-[11px] text-on-surface-variant tracking-tighter bg-surface-container-highest/50 px-3 py-1.5 rounded-lg border border-outline-variant/10">
                      ID: #{user?.vaultId?.replace('#', '') || "PROTOCOL_PENDING"}
                    </div>
                    {user?.vaultId && (
                      <Link 
                        href={`/p/${user.vaultId.replace('#', '')}`} 
                        target="_blank"
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/20"
                        title="View Public Profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
                <div className="bg-primary shadow-lg shadow-primary/20 p-2.5 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-highest border border-outline-variant/20 flex items-center justify-center font-black text-xl text-white shadow-inner">
                    {user?.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white tracking-tight">{user?.name}</h4>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{targetExam} Aspirant</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-outline-variant/10 flex justify-between items-end">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.15em] block mb-1">Mastery Progress</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{Math.min(resourceCount * 10, 100)}</span>
                        <span className="text-xs font-bold text-on-surface-variant">%</span>
                      </div>
                    </div>
                    <div className="w-32 h-1.5 bg-surface-variant/30 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(resourceCount * 10, 100)}%` }} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="bg-white p-1.5 rounded-xl shadow-xl shadow-black/40 rotate-1 flex items-center justify-center w-16 h-16 shrink-0 opacity-90 overflow-hidden">
                      {user?.vaultId && origin ? (
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${origin}/p/${user.vaultId.replace('#', '')}`)}`}
                          alt="ID QR"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-variant/20 animate-pulse rounded" />
                      )}
                    </div>
                    {user?.vaultId && (
                      <Link 
                        href={`/p/${user.vaultId.replace('#', '')}`}
                        target="_blank"
                        className="p-2 rounded-2xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/5 active:scale-95 group/share"
                        title="Share Public Card"
                      >
                        <Share2 className="w-4 h-4 group-hover/share:rotate-12 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
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
                { icon: <Award className="w-12 h-12 text-primary" />, name: "Early Adopter", sub: "Joined Beta", locked: false },
                { icon: <BookOpen className="w-12 h-12 text-tertiary" />, name: "Vault Builder", sub: `${resourceCount} Files`, locked: resourceCount === 0 },
                { icon: <Brain className="w-12 h-12 text-on-surface-variant" />, name: "Master Mind", sub: "Locked", locked: title !== "Master" },
                { icon: <Flame className="w-12 h-12 text-error" />, name: "Focused", sub: "Onboarded", locked: !user?.isOnboarded },
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
                { icon: <Clock className="w-7 h-7" />, label: "Total Resources", value: resourceCount, unit: "saved", iconBg: "bg-primary/10 text-primary" },
                { icon: <CheckCircle className="w-7 h-7" />, label: "Onboarding", value: user?.isOnboarded ? "100" : "50", unit: "%", iconBg: "bg-tertiary/10 text-tertiary" },
                { icon: <TrendingUp className="w-7 h-7" />, label: "Global Level", value: level, unit: "", iconBg: "bg-error/10 text-error" },
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
                  <div className="text-white font-bold text-lg">{email}</div>
                  <span className="bg-surface-variant px-3 py-1 rounded text-[10px] text-on-surface-variant font-bold">
                    {user?.isVerifiedStudent ? "VERIFIED ACADEMIC" : "BASIC ACCOUNT"}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Membership Plan</label>
                <div className="flex items-center gap-4">
                  <div className="text-white font-bold text-lg">Knowledge Vault Initial</div>
                  <span className="bg-gradient-to-r from-tertiary/20 to-tertiary/10 text-tertiary text-[10px] font-black px-3 py-1.5 rounded-lg border border-tertiary/20 uppercase tracking-widest">Active</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-2 font-medium italic">Your account is active since {new Date().getFullYear()}.</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Academic Affiliation</label>
                <div className="flex items-center gap-3 p-4 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm block">{targetExam} Preparation</span>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Independent Learner</span>
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
                    Your research data is protected by <span className="text-white">secure backend encryption</span>. Sync active across <span className="text-white">your authorized devices</span>.
                  </p>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-3">Account Security</label>
                <div className="flex items-center gap-3 text-green-400 font-bold text-sm bg-green-400/5 px-4 py-3 rounded-xl border border-green-400/10">
                  <CheckCircle className="w-5 h-5" />
                  Standard Authentication Active
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
        {/* <div className="pt-10 pb-16 flex flex-col items-center gap-4">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full" />
          <div className="text-center">
            <p className="text-on-surface-variant text-[11px] font-black tracking-[0.3em] uppercase opacity-60">Knowledge Vault · Version 1.0.0</p>
            <p className="text-[10px] text-on-surface-variant/40 mt-2 font-medium">© {new Date().getFullYear()} Academic Excellence Built on Discipline</p>
          </div>
        </div> */}
      </div>
    </DashboardLayout>
  );
}
