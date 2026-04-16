"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Info, User as UserIcon, List } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

// --- Mock Data ---
const MOCK_QUESTION = {
  id: "q1",
  type: "Numerical Answer Type",
  positiveMarks: 3,
  negativeMarks: 0,
  text: "What is the shortest distance (in cm) for the red dot to reach the position x? The dot can travel only along the grid lines shown.",
  image: "https://placehold.co/600x400/transparent/333?text=Maze+Question" // Placeholder for maze image
};

export default function AssessmentTestPage() {
  const [timeLeft, setTimeLeft] = useState(79 * 60 + 43); // 79:43
  const [activePart, setActivePart] = useState("A");
  const [activeSection, setActiveSection] = useState("Section 1 - NAT");
  const [activeQuestionId, setActiveQuestionId] = useState(1);
  const router = useRouter();

  // Disable right-click & Context Menu (Anti-cheat)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Timer simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-white text-black font-sans overflow-hidden select-none">
      {/* 1. Header (System Info) */}
      <div className="h-7 bg-[#212121] text-white flex items-center px-4 text-xs">
        <span>Assessment Examination Center</span>
      </div>

      {/* 2. Subheader (Exam Info & Controls) */}
      <div className="flex justify-between items-stretch border-b border-[#ccc] h-12">
        {/* Left: Exam Name */}
        <div className="bg-[#4a89dc] text-white font-bold px-4 flex items-center flex-1">
          CEED Mock Test
        </div>
        
        {/* Right Controls */}
        <div className="flex bg-[#4a89dc] items-stretch">
          <button className="flex items-center gap-1 px-4 text-white hover:bg-white/10 text-sm font-semibold border-r border-white/20">
            <Info className="w-4 h-4" fill="white" stroke="#4a89dc" /> Instructions
          </button>
          <button className="flex items-center gap-1 px-4 text-white hover:bg-white/10 text-sm font-semibold border-r border-[#ccc]">
            <List className="w-4 h-4" /> Question Paper
          </button>
        </div>

        {/* Profile Area */}
        <div className="w-[200px] bg-[#f8f8f8] flex items-center px-2 py-1 gap-2 border-l border-[#ccc]">
          <div className="w-10 h-10 rounded bg-[#e0e0e0] flex items-center justify-center overflow-hidden shrink-0 border border-[#ccc]">
            <UserIcon className="w-8 h-8 text-[#999] mt-2" />
          </div>
          <span className="text-[14px] font-bold text-[#333]">John Smith</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Column (Content Canvas) */}
        <div className="flex-1 flex flex-col relative w-[calc(100%-250px)]">
          
          {/* Top Sections Bar */}
          <div className="bg-[#f2f2f2] border-b border-[#ccc] px-2 py-1.5 flex items-center relative">
            <button className="bg-white border-t-2 border-t-[#3b82f6] border-x border-b border-b-transparent border-x-[#ccc] px-4 py-1 text-sm font-bold text-[#333] flex items-center gap-1 rounded-t-sm z-10 -mb-[1.5px]">
              PART A <Info className="w-3.5 h-3.5 text-[#3b82f6]" />
            </button>
            <button className="px-4 py-1 text-sm text-[#333] flex items-center gap-1 ml-1 border border-transparent hover:bg-[#e6e6e6] rounded-sm">
              PART B <Info className="w-3.5 h-3.5 text-[#3b82f6]" />
            </button>
            
            <div className="absolute right-0 top-0 bottom-0 flex">
              <button className="w-5 flex items-center justify-center bg-transparent text-[#999] opacity-50 cursor-not-allowed border-l border-[#ccc]">
                ▶
              </button>
            </div>
          </div>

          {/* Sub-sections & Timer Row */}
          <div className="flex justify-between items-center px-4 py-1 border-b border-[#ccc] bg-white">
            <span className="text-xs font-bold text-[#333]">Sections</span>
            <span className="text-[13px] font-bold text-[#333]">
              Time Left : {formatTime(timeLeft)}
            </span>
          </div>

          {/* Inner Sections Bar */}
          <div className="bg-[#e6f0fa] border-b border-[#ccc] px-2 py-1 flex items-center gap-1 relative z-0">
            <button className="bg-[#3b82f6] text-white px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1">
              Section 1 - NAT <Info className="w-3 h-3 text-white" />
            </button>
            <button className="bg-white border border-[#ccc] text-[#333] px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 hover:bg-[#f8f8f8]">
              Section 2 - MSQ <Info className="w-3 h-3 text-[#3b82f6]" />
            </button>
            <button className="bg-white border border-[#ccc] text-[#333] px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1 hover:bg-[#f8f8f8]">
              Section 3 - MCQ <Info className="w-3 h-3 text-[#3b82f6]" />
            </button>
          </div>

          {/* Marking Scheme Header */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-[#ccc] bg-white">
            <span className="text-sm font-bold text-[#333]">Question Type: {MOCK_QUESTION.type}</span>
            <div className="text-xs">
              <span className="text-green-600 font-bold">Marks for correct answer: {MOCK_QUESTION.positiveMarks}</span>
              <span className="mx-1 text-[#ccc]">|</span>
              <span className="text-red-500 font-bold">Negative Marks: {MOCK_QUESTION.negativeMarks}</span>
            </div>
          </div>

          {/* Question Render Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-white">
            <h3 className="text-[15px] font-bold mb-4 text-[#333]">Question No. {activeQuestionId}</h3>
            <p className="text-[14px] text-black pr-10 mb-6 font-serif">
              {MOCK_QUESTION.text}
            </p>
            {/* Simulation of the Maze Drawing */}
            <div className="max-w-2xl border border-gray-400 p-2 relative h-64 bg-white flex items-center justify-center">
               <span className="text-gray-400 italic">Central Image / Canvas Render Area</span>
            </div>
          </div>

          {/* Operator Footer Controls */}
          <div className="border-t border-[#ccc] bg-white flex justify-between items-center py-2 px-4 shadow-[0_-2px_5px_rgba(0,0,0,0.02)] z-10 shrink-0">
            <div className="flex gap-2">
              <button className="border border-[#ccc] hover:bg-[#f5f5f5] text-[#333] px-4 py-1.5 text-[13px] font-bold rounded shadow-sm">
                Mark for Review & Next
              </button>
              <button className="border border-[#ccc] hover:bg-[#f5f5f5] text-[#333] px-4 py-1.5 text-[13px] font-bold rounded shadow-sm">
                Clear Response
              </button>
            </div>
            <button className="bg-[#2481c4] hover:bg-[#1a5f91] text-white px-6 py-1.5 text-[13px] font-bold rounded shadow-sm">
              Save & Next
            </button>
          </div>
        </div>

        {/* Right Column (Palette) */}
        <div className="w-[250px] bg-[#eef3f6] flex flex-col border-l border-[#ccc] shrink-0">
          
          {/* Legend Grid */}
          <div className="p-3 bg-white border-b border-[#ccc] shrink-0">
            <div className="grid grid-cols-2 gap-y-2 gap-x-1 text-[11px] font-medium leading-tight text-[#333]">
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/answered.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">0</div>
                <span>Answered</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/not-answered.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">1</div>
                <span>Not<br/>Answered</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/not-visited.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-[#333] pb-[2px]">3</div>
                <span>Not<br/>Visited</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <div className="w-8 h-7 bg-[url('/tcs/marked.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">0</div>
                <span>Marked<br/>for Review</span>
              </div>
            </div>
            <div className="flex gap-1.5 items-center mt-2 text-[11px] font-medium text-[#333]">
               <div className="w-8 h-7 bg-[url('/tcs/answered-marked.svg')] bg-contain bg-no-repeat bg-center flex items-center justify-center text-white pb-[2px]">0</div>
               <span className="leading-tight">Answered & Marked for<br/>Review (will also be evaluated)</span>
            </div>
          </div>

          {/* Section Banner */}
          <div className="bg-[#2481c4] text-white text-[13px] font-bold px-3 py-1.5 shrink-0">
            Section 1 - NAT
          </div>

          {/* Palette Grid Area */}
          <div className="flex-1 overflow-y-auto p-3 bg-white">
            <div className="text-[12px] font-bold mb-3 text-[#333]">Choose a Question</div>
            <div className="flex flex-wrap gap-2">
              <button className="w-[34px] h-[30px] flex items-center justify-center text-white text-[13px] font-bold bg-[url('/tcs/not-answered.svg')] bg-contain bg-no-repeat bg-center pb-[2px]">1</button>
              <button className="w-[34px] h-[30px] flex items-center justify-center text-[#333] text-[13px] font-bold bg-[url('/tcs/not-visited.svg')] bg-contain bg-no-repeat bg-center pb-[2px]">2</button>
              <button className="w-[34px] h-[30px] flex items-center justify-center text-[#333] text-[13px] font-bold bg-[url('/tcs/not-visited.svg')] bg-contain bg-no-repeat bg-center pb-[2px]">3</button>
              <button className="w-[34px] h-[30px] flex items-center justify-center text-[#333] text-[13px] font-bold bg-[url('/tcs/not-visited.svg')] bg-contain bg-no-repeat bg-center pb-[2px]">4</button>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="h-[46px] border-t border-[#ccc] bg-[#f2f2f2] flex items-center justify-center border-l shrink-0">
            <button className="bg-[#6db5d1] text-white font-bold text-sm px-8 py-1.5 rounded" disabled>
              Submit
            </button>
          </div>
        </div>

      </div>

      {/* 3. Global Footer Banner */}
      <div className="h-[22px] bg-[#425d76] shrink-0 w-full flex items-center justify-center text-white text-[11px] font-semibold tracking-wider">
        Version : 17.07.00
      </div>

    </div>
  );
}
