"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, Target, Clock, ArrowUpRight, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";

interface Exam {
  _id: string;
  name: string;
  date: string;
  category: string;
}

export default function TargetExamWidget() {
  const { user } = useAuth();
  const [targetExamData, setTargetExamData] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  const userTarget = user?.targetExam?.[0];
  const isOther = !userTarget || userTarget === 'Other';

  useEffect(() => {
    // Check if user has dismissed the widget
    const dismissed = localStorage.getItem('hide_target_widget');
    if (dismissed === 'true') {
      setIsHidden(true);
    }

    if (isOther) {
      setLoading(false);
      return;
    }

    const fetchTargetData = async () => {
      try {
        const { data } = await api.get("/exams");
        const found = data.find((e: Exam) => 
          e.name.toLowerCase().includes(userTarget.toLowerCase()) ||
          userTarget.toLowerCase().includes(e.name.toLowerCase())
        );
        setTargetExamData(found || null);
      } catch (err) {
        console.error("Failed to fetch target exam details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTargetData();
  }, [userTarget, isOther]);

  const handleDismiss = () => {
    localStorage.setItem('hide_target_widget', 'true');
    setIsHidden(true);
  };

  if (isHidden) return null;

  const calculateCountdown = () => {
    if (!targetExamData) return null;
    const diff = new Date(targetExamData.date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = calculateCountdown();

  // State for "Other" or "No Target"
  if (isOther) {
    return (
      <div className="relative overflow-hidden bg-surface-container p-6 rounded-3xl border border-outline-variant/20 group">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <button onClick={handleDismiss} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-lg font-black text-on-surface tracking-tight">Set Your Goal</h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Choose a target exam to see your countdown and readiness score.
          </p>
          <Link 
            href="/profile" 
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all"
          >
            Configure Goal <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-primary p-6 rounded-3xl text-on-primary shadow-2xl shadow-primary/20 group">
      {/* Background Decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Mission Active</span>
            </div>
            <button onClick={handleDismiss} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
            Primary Target
          </h3>
          <h2 className="text-2xl font-black tracking-tighter leading-tight truncate">
            {userTarget}
          </h2>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black leading-none">
                {daysLeft !== null ? daysLeft : '--'}
              </span>
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                Days Left
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xl font-black leading-none">
                {user?.levelData?.currentLevel || 1}
              </span>
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                Readiness
              </span>
            </div>
          </div>
          
          <Link href="/performance" className="p-2.5 bg-white text-primary rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mini Progress Bar */}
        <div className="mt-6 w-full bg-black/10 rounded-full h-1 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min(((user?.levelData?.currentLevel || 1) / 10) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
