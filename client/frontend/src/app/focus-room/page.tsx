import Sidebar from "@/components/Sidebar";
import { Play, Settings, BookOpen, Droplets, AudioLines, Volume2 } from "lucide-react";

export default function FocusRoomPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface overflow-hidden">
      <Sidebar />

      {/* Top Bar */}
      <header className="fixed top-0 right-0 left-64 h-16 z-40 flex items-center justify-between px-10 border-b border-outline-variant/5">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="text-xs font-medium tracking-tight">Session #12 today</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-16 h-screen relative flex flex-col items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(11, 14, 17, 0.8) 100%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

        {/* Timer */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-2xl text-center">
          <div className="mb-2">
            <span className="text-[11px] font-bold tracking-[0.4em] text-primary/60 uppercase">
              Deep Focus
            </span>
          </div>
          <div
            className="font-[family-name:var(--font-headline)] text-[12rem] font-extrabold leading-none mb-12 drop-shadow-2xl"
            style={{
              background: "linear-gradient(180deg, #dde6f2 0%, rgba(221, 230, 242, 0.4) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFeatureSettings: '"tnum"',
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.05em",
            }}
          >
            25:00
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex items-center gap-6">
              <button className="group relative px-10 py-4 bg-primary text-on-primary font-bold rounded-2xl transition-all hover:scale-105 active:scale-95" style={{ boxShadow: "0 0 100px -20px rgba(192, 193, 255, 0.1)" }}>
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Session</span>
                </div>
              </button>
              <button className="p-4 text-on-surface-variant hover:text-on-surface transition-colors bg-surface-container/50 rounded-2xl hover:bg-surface-container border border-outline-variant/10">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Upcoming Objective */}
            <div className="w-full max-w-md p-6 bg-surface-container/40 backdrop-blur-xl rounded-2xl border border-outline-variant/10 mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Upcoming Objective
                </h3>
                <span className="text-[10px] text-primary/80 font-medium">Priority High</span>
              </div>
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-surface">Microeconomics Proofs</p>
                  <p className="text-xs text-on-surface-variant">Section 4.2 • Mathematical Foundations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Audio Bar */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-3 bg-surface-container/30 backdrop-blur-md rounded-full border border-outline-variant/10">
          <button className="flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            <Droplets className="w-4 h-4" />
            Rain
          </button>
          <div className="w-[1px] h-4 bg-outline-variant/20" />
          <button className="flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            <AudioLines className="w-4 h-4" />
            Lo-Fi
          </button>
          <div className="w-[1px] h-4 bg-outline-variant/20" />
          <button className="flex items-center gap-2 text-[11px] font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
            <Volume2 className="w-4 h-4" />
            60%
          </button>
        </div>
      </main>
    </div>
  );
}
