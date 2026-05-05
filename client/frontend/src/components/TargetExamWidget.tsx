"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, Target, Clock, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

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

  const userTarget = user?.targetExam?.[0];

  useEffect(() => {
    if (!userTarget) {
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
  }, [userTarget]);

  if (!userTarget) return null;

  const calculateCountdown = () => {
    if (!targetExamData) return null;
    const diff = new Date(targetExamData.date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysLeft = calculateCountdown();

  return (
    <div className="relative overflow-hidden bg-primary p-6 rounded-3xl text-on-primary shadow-2xl shadow-primary/20 group">
      {/* Background Decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-black/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Mission Active</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
            Primary Target
          </h3>
          <h2 className="text-3xl font-black tracking-tighter leading-tight">
            {userTarget}
          </h2>
        </div>

        <div className="mt-8 flex items-end justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[28px] font-black leading-none">
                  {daysLeft !== null ? daysLeft : '--'}
                </span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  Days to Go
                </span>
              </div>
              <div className="h-8 w-px bg-white/10 mx-1" />
              <div className="flex flex-col">
                <span className="text-[28px] font-black leading-none">
                  {user?.levelData?.currentLevel || 0}
                </span>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                  Readiness
                </span>
              </div>
            </div>
          </div>
          
          <button className="p-3 bg-white text-primary rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar Mini */}
        <div className="mt-6 w-full bg-black/10 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-white h-full rounded-full transition-all duration-1000" 
            style={{ width: `${Math.min((user?.levelData?.currentLevel || 0) * 4, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
