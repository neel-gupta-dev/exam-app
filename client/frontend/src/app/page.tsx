import DashboardLayout from "@/components/DashboardLayout";
import { recentResources, progressData } from "@/lib/mockData";
import {
  FileText,
  Play,
  Clock,
  ChevronRight,
  Timer,
  Lightbulb,
  Sparkles,
  Star,
} from "lucide-react";
import Image from "next/image";

function ResourceCard({ resource }: { resource: (typeof recentResources)[0] }) {
  return (
    <div className="group bg-surface-container hover:bg-surface-container-high transition-colors p-5 rounded-xl flex items-center gap-5 cursor-pointer">
      {resource.type === "video" && resource.thumbnailUrl ? (
        <div className="relative w-14 h-14 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={resource.thumbnailUrl}
            alt="Video Thumbnail"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
      ) : (
        <div
          className={`w-14 h-14 ${resource.iconBg} rounded-lg flex items-center justify-center ${resource.iconColor} shrink-0`}
        >
          <FileText className="w-7 h-7" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-on-surface group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-2 py-0.5 rounded bg-surface-bright text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            {resource.tag}
          </span>
          <span className="text-xs text-on-surface-variant flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {resource.timeAgo}
          </span>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

function ProgressWidget() {
  const heatmapOpacities: Record<number, string> = {
    0: "bg-surface-variant/50",
    20: "bg-primary/20",
    40: "bg-primary/40",
    60: "bg-primary/60",
    80: "bg-primary/80",
    100: "bg-primary",
  };

  return (
    <div className="bg-surface-container p-6 rounded-xl">
      <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">
        Focus & Progress
      </h3>

      {/* Study Time */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">
            Study Time Today
          </p>
          <h4 className="text-2xl font-extrabold text-on-surface mt-1">
            {progressData.studyTimeToday}
          </h4>
        </div>
        <div className="relative w-16 h-16">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle
              className="stroke-surface-variant"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
            />
            <circle
              className="stroke-primary"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
              strokeDasharray={`${progressData.percentage}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-on-surface">
              {progressData.percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-[10px] text-on-surface-variant font-bold uppercase">
            Learning Streak
          </p>
          <span className="text-[10px] text-primary font-bold">
            {progressData.streakDays} Days
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {progressData.heatmap.map((level, i) => (
            <div
              key={i}
              className={`aspect-square rounded-[2px] ${
                heatmapOpacities[level] || "bg-surface-variant/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Start Focus Button */}
      <button className="w-full mt-8 py-3 bg-primary text-on-primary rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
        <Timer className="w-4 h-4" />
        Start Focus Session
      </button>
    </div>
  );
}

function QuickTipCard() {
  return (
    <div className="bg-surface-bright p-5 rounded-xl border border-outline-variant/10">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-4 h-4 text-primary" />
        <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">
          Quick Tip
        </span>
      </div>
      <p className="text-xs leading-relaxed text-on-surface-variant">
        Reviewing your chemistry notes within 24 hours can increase retention by
        up to 60%. Try a 10-minute flashcard session now.
      </p>
    </div>
  );
}

export default function HomePage() {
  const visibleResources = recentResources.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto flex gap-8">
        {/* Left Column (70%) */}
        <section className="w-[70%] space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-on-surface">
                Recent Resources
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Your latest focused study materials.
              </p>
            </div>
            <button className="text-xs font-medium text-primary hover:underline">
              View All
            </button>
          </div>

          {/* Resource Cards */}
          <div className="grid grid-cols-1 gap-4">
            {visibleResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {/* Bento Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* AI Synthesis */}
            <div className="bg-surface-container p-6 rounded-xl aspect-[16/9] flex flex-col justify-between">
              <div>
                <Sparkles className="w-5 h-5 text-primary mb-4" />
                <h3 className="font-bold text-lg text-on-surface">
                  AI Synthesis
                </h3>
                <p className="text-sm text-on-surface-variant mt-2">
                  Generate summary cards from your handwritten Physics notes.
                </p>
              </div>
              <button className="w-fit text-xs font-semibold px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-bright transition-colors">
                Launch Assistant
              </button>
            </div>

            {/* Weekly Goal */}
            <div className="bg-primary/5 p-6 rounded-xl aspect-[16/9] flex flex-col justify-center items-center text-center">
              <Star className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-bold text-lg text-primary">Weekly Goal</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-[200px]">
                Complete 25 Calculus problems by Sunday.
              </p>
              <div className="w-full bg-surface-container rounded-full h-1 mt-6">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${progressData.weeklyGoalPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-on-surface-variant mt-2">
                {progressData.weeklyGoalPercent}% Achieved
              </span>
            </div>
          </div>
        </section>

        {/* Right Column (30%) */}
        <aside className="w-[30%] space-y-6">
          <ProgressWidget />
          <QuickTipCard />
        </aside>
      </div>
    </DashboardLayout>
  );
}
