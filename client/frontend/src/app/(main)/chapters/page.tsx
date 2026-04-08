"use client";

import { useState } from "react";
import ChapterTable from "./ChapterTable";
import DashboardLayout from "@/components/DashboardLayout";

const SUBJECTS = ["Physics", "Chemistry", "Mathematics"];

export default function ChapterListPage() {
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full w-full max-w-7xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-black font-heading text-on-surface mb-2 tracking-tight">
            Chapter List & Tracker
          </h1>
          <p className="text-sm font-interface text-on-surface-variant">
            Plan, track, and master your syllabus.
          </p>
        </div>

        {/* Subject Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-outline-variant/30 pb-1 overflow-x-auto hide-scrollbar">
          {SUBJECTS.map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`px-5 py-2.5 rounded-t-xl font-interface font-semibold text-sm transition-all whitespace-nowrap ${
                activeSubject === subject
                  ? "bg-surface-variant text-primary border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 border-b-2 border-transparent"
              }`}
            >
              {subject}
            </button>
          ))}
        </div>

        {/* Active Table Instance */}
        <div className="flex-1 bg-surface rounded-xl flex flex-col min-h-[500px]">
          {/* Force re-mount of table when subject changes to cleanly isolate state */}
          <ChapterTable key={activeSubject} subject={activeSubject} />
        </div>
      </div>
    </DashboardLayout>
  );
}
