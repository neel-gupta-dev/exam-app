"use client";

import React, { useEffect, useState } from "react";
import { Calendar, ChevronRight, ExternalLink } from "lucide-react";
import api from "@/lib/api";

interface Exam {
  _id: string;
  name: string;
  date: string;
  category: string;
  registrationLink?: string;
  description?: string;
}

export default function ExamTrackerWidget() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await api.get("/exams");
        setExams(data);
      } catch (err) {
        console.error("Failed to fetch upcoming exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const calculateDaysLeft = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="bg-surface-container p-6 rounded-xl animate-pulse">
        <div className="h-4 w-24 bg-surface-variant rounded mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-surface-variant rounded-lg" />
          <div className="h-12 bg-surface-variant rounded-lg" />
        </div>
      </div>
    );
  }

  if (exams.length === 0) return null;

  return (
    <div className="bg-surface-container p-6 rounded-xl border border-outline-variant/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.15em]">
          Upcoming Exams
        </h3>
        <Calendar className="w-4 h-4 text-primary opacity-50" />
      </div>

      <div className="space-y-3">
        {exams.slice(0, 3).map((exam) => {
          const daysLeft = calculateDaysLeft(exam.date);
          const isSoon = daysLeft <= 30;

          return (
            <div 
              key={exam._id}
              className="group p-3 rounded-xl bg-surface-container-highest/30 border border-white/5 hover:border-primary/20 transition-all"
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                  exam.category === 'Engineering' ? 'bg-blue-500/10 text-blue-500' : 
                  exam.category === 'Medical' ? 'bg-red-500/10 text-red-500' : 
                  'bg-surface-variant text-on-surface-variant'
                }`}>
                  {exam.category}
                </span>
                <span className={`text-[10px] font-bold ${isSoon ? 'text-error animate-pulse' : 'text-on-surface-variant opacity-60'}`}>
                  {daysLeft} days left
                </span>
              </div>
              
              <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                {exam.name}
              </h4>
              
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-on-surface-variant opacity-60">
                  {new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                {exam.registrationLink && (
                  <a 
                    href={exam.registrationLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Register <ExternalLink className="w-2 h-2" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {exams.length > 3 && (
        <button className="w-full mt-4 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
          View All Exams <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
