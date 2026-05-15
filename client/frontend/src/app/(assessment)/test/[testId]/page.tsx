"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Info, User as UserIcon, List, Globe } from "lucide-react";
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
  
  // Interruption / Cheat Tracking State
  const [interruptions, setInterruptions] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  
  const router = useRouter();

  // Disable right-click & Context Menu (Anti-cheat)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  // Detect window switching, minimizing, or tabbing out
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setInterruptions((prev) => {
          const nextCount = prev + 1;
          if (nextCount >= 3) {
            // Lock exam and auto-submit
            setIsBlocked(true);
          } else {
            // Issue strict system alert warning
            alert(`WARNING: System records every single interruption during the Assessment.\n\nAttempt ${nextCount} of 3 detected.\nNavigating away, minimizing, or toggling windows is NOT allowed.\nYour exam will be AUTO-SUBMITTED on the 3rd interruption!`);
          }
          return nextCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
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

  // Auto-Submit / Block Screen Replica Render Gate
  if (isBlocked) {
    const computerImgBase64 = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xIFRpbnkvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEtdGlueS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGJhc2VQcm9maWxlPSJ0aW55IiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayINCgkgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyNTBweCIgaGVpZ2h0PSIxNjFweCIgdmlld0JveD0iMCAwIDI1MCAxNjEiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGZpbGw9IiNGMEY5RkMiIGQ9Ik03MS4xNDYsMTU4LjI2N2MtNS4xMDQtMC44MTktNjYuNDMxLTguMjAxLTYxLjkxNy02Mi42NDJjNC41MTUtNTQuNDQsMTAuMTgxLTcwLjgxMiwzNC4wMjQtNzYuODAyDQoJCQljMjMuODQzLTUuOTksODEuODAxLTM0LjMzMywxMjcuMjgxLTcuMzgzYzQ1LjQ4LDI2Ljk1LDk0LjU1Nyw1MS4xMjIsNzUuMDgyLDk0LjE1MmMtMTkuNDc2LDQzLjAzMS0yMi42NjQsNTcuMzg2LTczLjQ3Nyw1NS4xODkNCgkJCUMxMjEuMzI4LDE1OC41ODUsOTUuNDE3LDE2Mi4xNjMsNzEuMTQ2LDE1OC4yNjd6Ii8+DQoJPC9nPg0KCTxnIGlkPSJYTUxJRF8xOV8iPg0KCQk8ZyBpZD0iWE1MSURfMjRfIj4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0yMzMuNTc1LDY1LjU0NGgtNjguNTY0Yy0zLjA2NCwwLTUuNTcyLTIuNTA4LTUuNTcyLTUuNTcybDAsMGMwLTMuMDY0LDIuNTA4LTUuNTcyLDUuNTcyLTUuNTcyaDY4LjU2NA0KCQkJCWMzLjA2NCwwLDUuNTcyLDIuNTA4LDUuNTcyLDUuNTcybDAsMEMyMzkuMTQ3LDYzLjAzNywyMzYuNjQsNjUuNTQ0LDIzMy41NzUsNjUuNTQ0eiIvPg0KCQk8L2c+DQoJCTxnIGlkPSJYTUxJRF8yM18iPg0KCQkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTI0MC4yNzEsNTAuNTUyaC0yOC4yMzVjLTIuNDQ0LDAtNC40NDQtMi00LjQ0NC00LjQ0NWwwLDBjMC0yLjQ0NCwyLTQuNDQ0LDQuNDQ0LTQuNDQ0aDI4LjIzNQ0KCQkJCWMyLjQ0NCwwLDQuNDQ1LDIsNC40NDUsNC40NDRsMCwwQzI0NC43MTcsNDguNTUyLDI0Mi43MTYsNTAuNTUyLDI0MC4yNzEsNTAuNTUyeiIvPg0KCQk8L2c+DQoJCTxnIGlkPSJYTUxJRF8yMl8iPg0KCQkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTI0NS41NTUsNzcuODgzaC0yOC4yMzVjLTIuNDQ0LDAtNC40NDQtMi00LjQ0NC00LjQ0NGwwLDBjMC0yLjQ0NCwyLTQuNDQ0LDQuNDQ0LTQuNDQ0aDI4LjIzNQ0KCQkJCWMyLjQ0NCwwLDQuNDQ1LDIsNC40NDUsNC40NDRsMCwwQzI1MCw3NS44ODMsMjQ3Ljk5OSw3Ny44ODMsMjQ1LjU1NSw3Ny44ODN6Ii8+DQoJCTwvZz4NCgkJPGcgaWQ9IlhNTElEXzIxXyI+DQoJCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMjMwLjcyMyw2OS4zNDhjLTEuMzc2LDAtMi40OTItMC44NTItMi40OTItMS45MDJjMC0xLjA1LDEuMTE2LTEuOTAxLDIuNDkyLTEuOTAxaC0xMC44NzUNCgkJCQljMS4zNzcsMCwyLjQ5MiwwLjg1MiwyLjQ5MiwxLjkwMWMwLDEuMDUxLTEuMTE1LDEuOTAyLTIuNDkyLDEuOTAySDIzMC43MjN6Ii8+DQoJCTwvZz4NCgkJPGcgaWQ9IlhNTElEXzIwXyI+DQoJCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMjM0LjI0Niw1NC41MjJjLTEuNDM4LDAtMi42MDItMC44ODktMi42MDItMS45ODRjMC0xLjA5NywxLjE2NC0xLjk4NSwyLjYwMi0xLjk4NWgtMTEuMzUzDQoJCQkJYzEuNDM4LDAsMi42MDMsMC44ODksMi42MDMsMS45ODVjMCwxLjA5Ni0xLjE2NSwxLjk4NC0yLjYwMywxLjk4NEgyMzQuMjQ2eiIvPg0KCQk8L2c+DQoJPC9nPg0KCTxnIGlkPSJYTUxJRF8xMV8iPg0KCQk8ZyBpZD0iWE1MSURfMThfIj4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNi40MjQsMTAwLjIxOWg2OC41NjRjMy4wNjUsMCw1LjU3MywyLjUwOCw1LjU3Myw1LjU3MmwwLDBjMCwzLjA2NS0yLjUwOCw1LjU3My01LjU3Myw1LjU3M0gxNi40MjQNCgkJCQljLTMuMDY0LDAtNS41NzItMi41MDgtNS41NzItNS41NzNsMCwwQzEwLjg1MiwxMDIuNzI3LDEzLjM1OSwxMDAuMjE5LDE2LjQyNCwxMDAuMjE5eiIvPg0KCQk8L2c+DQoJCTxnIGlkPSJYTUxJRF8xN18iPg0KCQkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTkuNzI4LDExNS4yMTFoMjguMjM1YzIuNDQ1LDAsNC40NDUsMi4wMDEsNC40NDUsNC40NDVsMCwwYzAsMi40NDQtMiw0LjQ0NC00LjQ0NSw0LjQ0NEg5LjcyOA0KCQkJCWMtMi40NDQsMC00LjQ0NC0yLTQuNDQ0LTQuNDQ0bDAsMEM1LjI4MywxMTcuMjEyLDcuMjgzLDExNS4yMTEsOS43MjgsMTE1LjIxMXoiLz4NCgkJPC9nPg0KCQk8ZyBpZD0iWE1MSURfMTZfIj4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik00LjQ0NCw4Ny44OEgzMi42OGMyLjQ0NSwwLDQuNDQ1LDIsNC40NDUsNC40NDVsMCwwYzAsMi40NDQtMiw0LjQ0NC00LjQ0NSw0LjQ0NEg0LjQ0NA0KCQkJCUMyLDk2Ljc3LDAsOTQuNzcsMCw5Mi4zMjVsMCwwQzAsODkuODgsMiw4Ny44OCw0LjQ0NCw4Ny44OHoiLz4NCgkJPC9nPg0KCQk8ZyBpZD0iWE1MSURfMTVfIj4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xOS4yNzYsOTYuNDE2YzEuMzc2LDAsMi40OTIsMC44NTEsMi40OTIsMS45MDFjMCwxLjA1LTEuMTE2LDEuOTAxLTIuNDkyLDEuOTAxaDEwLjg3NQ0KCQkJCWMtMS4zNzcsMC0yLjQ5Mi0wLjg1Mi0yLjQ5Mi0xLjkwMWMwLTEuMDUxLDEuMTE1LTEuOTAxLDIuNDkyLTEuOTAxSDE5LjI3NnoiLz4NCgkJPC9nPg0KCQk8ZyBpZD0iWE1MSURfMTJfIj4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xNS43NTMsMTExLjI0MWMxLjQzOCwwLDIuNjAzLDAuODg5LDIuNjAzLDEuOTg1YzAsMS4wOTYtMS4xNjUsMS45ODQtMi42MDMsMS45ODRoMTEuMzUzDQoJCQkJYy0xLjQzOCwwLTIuNjAyLTAuODg5LTIuNjAyLTEuOTg0YzAtMS4wOTcsMS4xNjQtMS45ODUsMi42MDItMS45ODVIMTUuNzUzeiIvPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjRkZGRkZGIiBkPSJNODguNzUsNDIuMjVoNzIuNWMxLjY1NywwLDMsMS4zNDQsMywzdjU0LjVjMCwxLjY1Ni0xLjM0MywzLTMsM2gtNzIuNQ0KCWMtMS42NTYsMC0zLTEuMzQ0LTMtM3YtNTQuNUM4NS43NSw0My41OTQsODcuMDk0LDQyLjI1LDg4Ljc1LDQyLjI1eiIvPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjNzNDM0REIiBkPSJNMTMwLjg3OSw3OC44NTJjLTEyLjc4OSwxMC4wMjgtNDIuNDQ2LDI0LjQ2OC00My40MDEsMjQuOTFsNzYuMzEyLDAuMzMybC0wLjA1My02MS41NjQNCglsLTguNDQ3LDAuOTNDMTU1LjI5LDQzLjQ1OSwxNDMuNzU3LDY4Ljc1MiwxMzAuODc5LDc4Ljg1MiIvPg0KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjNzk4N0IxIiBkPSJNMTYxLjc5MiwxMDYuMDRoLTE5LjgzOWwwLjAwNywwLjIwMmw0LjQsOC43NWwtNDIuNjgsMC4wMmw0LjQyMS04Ljk2Nmw3LjI1NC0wLjAwNg0KCUg4OC4xNTNjLTEuODI1LDAtMy4wNTUtMS40NzktMy4wNTUtMy4zMDZWNDUuNDE1YzAtMS44MjUsMS4yMy0zLjMwNiwzLjA1NS0zLjMwNmg3My42MzljMS44MjUsMCwzLjMwNiwxLjQ4LDMuMzA2LDMuMzA2djU3LjMxOQ0KCUMxNjUuMDk4LDEwNC41NjEsMTYzLjYxNywxMDYuMDQsMTYxLjc5MiwxMDYuMDR6IE0xNjMuMDMzLDQzLjkyNEg4Ny4xNjF2NTguMTM1aDc1Ljg3MlY0My45MjR6IE04Ni4yNTIsMTE2LjA4MWg3Ny40OTYNCgljMC43NzUsMCwxLjQwNCwwLjYyOSwxLjQwNCwxLjQwNWMwLDAuNzc1LTAuNjI5LDEuNDA0LTEuNDA0LDEuNDA0SDg2LjI1MmMtMC43NzYsMC0xLjQwNS0wLjYyOS0xLjQwNS0xLjQwNA0KCUM4NC44NDgsMTE2LjcxLDg1LjQ3NywxMTYuMDgxLDg2LjI1MiwxMTYuMDgxeiIvPg0KPGc+DQoJPHBhdGggZmlsbD0iI0ZGNTg1OCIgZD0iTTEzNS4zOTUsODcuMjQ5Yy0xLjU4LDAuMDAxLTE4LjI0MiwwLjAwMi0yMC45NDUsMC4wMDNjLTQuNTg4LDAtNS4wOTYtNC40ODktNC4yMjctNi4wMzINCgkJYzAuOTY5LTEuNzIsMTEuNDAxLTIxLjg3LDEyLjQ0Ni0yMy45MTljMS4yNjgtMi40ODcsMy41ODctMS42MDYsNC41MDIsMGMwLjkzMSwxLjYzLDExLjg1OCwyMi42MSwxMi41LDIzLjczNQ0KCQlDMTQwLjUwMyw4Mi40OTIsMTQwLjc2Miw4Ny4yNDksMTM1LjM5NSw4Ny4yNDl6IE0xMjQuODUyLDgzLjEzMWMtMS4zNTEsMC0yLjQ0My0xLjA5NC0yLjQ0My0yLjQ0NGMwLTEuMzUsMS4wOTQtMi40NDQsMi40NDMtMi40NDQNCgkJYzEuMzUsMCwyLjQ0NSwxLjA5NSwyLjQ0NSwyLjQ0NEMxMjcuMjk3LDgyLjAzNywxMjYuMjAyLDgzLjEzMSwxMjQuODUyLDgzLjEzMXogTTEyMy4zMDcsNjkuMDY2YzAsMCwwLjIzLTEuODM4LDEuNTAyLTEuODM4DQoJCWMxLjEyMSwwLDEuNTM5LDEuODM4LDEuNTM5LDEuODM4bC0wLjE2Miw2LjkxOWwtMi45MjEsMC4xMjVMMTIzLjMwNyw2OS4wNjZ6Ii8+DQoJPGNpcmNsZSBmaWxsPSIjRkZGRkZGIiBjeD0iMTI1IiBjeT0iODAuNjg2IiByPSIyLjQ0NSIvPg0KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xMjMuNSw2OS4wNjZjMCwwLTAuMTUtMS44MzgsMS41MDItMS44MzhjMS42OTEsMCwxLjUzOSwxLjgzOCwxLjUzOSwxLjgzOGwwLjAwMiw3LjA4M2wtMy4wODUtMC4wMzkNCgkJTDEyMy41LDY5LjA2NnoiLz4NCjwvZz4NCjwvc3ZnPg0K";

    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white select-none relative font-sans text-[#555] leading-relaxed z-[9999]">
        {/* Top Right Language Indicator */}
        <div className="absolute top-4 right-6 flex items-center gap-1.5 text-[12.5px] text-[#597d96] font-medium">
          <Globe className="w-3.5 h-3.5 text-[#597d96]" />
          <span>Change Language</span>
          <select className="border border-gray-300 rounded px-1.5 py-0.5 text-[12.5px] text-black bg-white font-normal focus:outline-none ml-1">
            <option>English</option>
          </select>
        </div>

        <div className="max-w-4xl w-full px-6 flex flex-col items-center -mt-10">
          {/* Centered Alert Illustration */}
          <div className="relative mb-12 mt-4 flex justify-center">
            <img src={computerImgBase64} alt="Assessment Interruption Alert" className="w-[250px] h-[161px] object-contain" />
          </div>

          {/* Main Note in RED */}
          <div className="text-center mb-8 px-4">
            <h2 className="text-[15px] font-bold text-[#d93025] mb-5">
              Note : System records every single interruption during the Assessment.
            </h2>
            
            {/* Reason Descriptions */}
            <p className="text-[13.5px] text-[#666] mb-1 text-center leading-[1.7]">
              Interruption is recorded in the system due one of the following possible reasons:
            </p>
            <div className="text-[13.5px] text-[#666] space-y-0.5 mb-5 text-center leading-[1.7]">
              <p>1) You were trying to minimize OR toggle Assessment Console.</p>
              <p>2) You have pressed special keys from your keyboard which are not allowed during Assessment.</p>
              <p>3) You have tried to move out of Assessment Console which is not allowed.</p>
              <p>4) You have tried to refresh the page.</p>
            </div>
            
            {/* Detailed instruction paragraph */}
            <p className="text-[13.5px] text-[#666] max-w-[95%] mx-auto leading-[1.8] text-center">
              This window will close down and you have to re-launch the Assessment only after it is unlocked. Please be advised not to move out of console during the assessment and not to navigate to other applications during the assessment.
            </p>
          </div>

          {/* Light horizontal divider */}
          <div className="w-[75%] border-t border-[#eeeeee] my-4" />

          {/* Bottom guidance */}
          <div className="text-center px-4">
            <h3 className="text-[15.5px] font-bold text-[#333333] mb-3">How to proceed</h3>
            <p className="text-[13.5px] text-[#666] mb-1 leading-[1.7]">This window will close down now.</p>
            <p className="text-[13.5px] text-[#666] leading-[1.7]">
              Please ensure that you do not move out of Assessment window during the assessment. Use only mouse to navigate.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Operator Footer Controls (Pixel-perfect Real Exam Scale) */}
          <div className="h-[52px] border-t border-[#dddddd] bg-white flex justify-between items-center px-3 z-10 shrink-0 select-none">
            {/* Left Control Group */}
            <div className="flex gap-[12px]">
              <button className="h-[34px] flex items-center justify-center bg-white border border-[#b5b5b5] hover:border-[#999] text-[#333333] px-4 text-[13px] font-normal rounded-none transition-colors active:bg-[#f9f9f9]">
                Mark for Review & Next
              </button>
              <button className="h-[34px] flex items-center justify-center bg-white border border-[#b5b5b5] hover:border-[#999] text-[#333333] px-4 text-[13px] font-normal rounded-none transition-colors active:bg-[#f9f9f9]">
                Clear Response
              </button>
            </div>
            
            {/* Right Control Group */}
            <div className="flex gap-[12px]">
              <button className="h-[34px] flex items-center justify-center bg-white border border-[#b5b5b5] hover:border-[#999] text-[#333333] px-[20px] text-[13px] font-normal rounded-none transition-colors active:bg-[#f9f9f9]">
                Previous
              </button>
              <button className="h-[34px] flex items-center justify-center bg-[#1f75b3] border border-[#186194] text-white px-[18px] text-[13px] font-bold rounded-none hover:bg-[#1a6399] transition-colors">
                Save & Next
              </button>
            </div>
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

          {/* Submit Footer (Aligned Real Exam Scale) */}
          <div className="h-[52px] border-t border-[#dddddd] bg-[#edf5f9] flex items-center justify-center border-l shrink-0">
            <button className="h-[34px] w-[96px] flex items-center justify-center bg-[#63a6cb] border border-[#548faf] text-white text-[13px] font-bold rounded-none select-none transition-opacity hover:bg-[#5997ba]">
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
