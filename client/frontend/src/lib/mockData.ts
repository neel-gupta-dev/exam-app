// ─── Resource Types ─────────────────────────────────────
export type ResourceType = "pdf" | "video" | "document";

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  tag: string;
  timeAgo: string;
  thumbnailUrl?: string;
  iconColor: string;
  iconBg: string;
}

export const recentResources: Resource[] = [
  {
    id: "1",
    title: "JEE Advanced 2024 - Physics Notes",
    type: "pdf",
    tag: "Physics",
    timeAgo: "2h ago",
    iconColor: "text-red-400",
    iconBg: "bg-red-500/10",
  },
  {
    id: "2",
    title: "UGEE Preparation Strategy",
    type: "video",
    tag: "Strategy",
    timeAgo: "5h ago",
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAC5eucfqTcwWA33WfP60gZdR3IF_5M8FmUUEpWHatCrBjfPL8Wu4Sn-K6zj_2y4-Ly70QvTjCqlDTIW0tNX2sWM1Uen099W6ijqdxW-0D6nTgHt2sk17D42YpHDDytrA8jY5nTAZ-92Wysik2jGDqa9drkk_VSfY6uF6DAZKQnj_fteLSJ0CbdJjjfeXcxyPGgIiYoRdgQ360_adbP-jEyYBQ3RjNLrSHXIPrwCnGRbzWFXj4OqBay0EiO-cy7_idBo8IFS9Ay_Py6",
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
  },
  {
    id: "3",
    title: "Organic Chemistry Mechanisms",
    type: "document",
    tag: "Chemistry",
    timeAgo: "Yesterday",
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/10",
  },
  {
    id: "4",
    title: "Calculus Integration Techniques",
    type: "pdf",
    tag: "Maths",
    timeAgo: "2 days ago",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    id: "5",
    title: "Electromagnetism Lecture Series",
    type: "video",
    tag: "Physics",
    timeAgo: "3 days ago",
    thumbnailUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAC5eucfqTcwWA33WfP60gZdR3IF_5M8FmUUEpWHatCrBjfPL8Wu4Sn-K6zj_2y4-Ly70QvTjCqlDTIW0tNX2sWM1Uen099W6ijqdxW-0D6nTgHt2sk17D42YpHDDytrA8jY5nTAZ-92Wysik2jGDqa9drkk_VSfY6uF6DAZKQnj_fteLSJ0CbdJjjfeXcxyPGgIiYoRdgQ360_adbP-jEyYBQ3RjNLrSHXIPrwCnGRbzWFXj4OqBay0EiO-cy7_idBo8IFS9Ay_Py6",
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    id: "6",
    title: "Thermodynamics Problem Set",
    type: "pdf",
    tag: "Physics",
    timeAgo: "Last week",
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
  },
];

// ─── Progress Data ──────────────────────────────────────
export const progressData = {
  studyTimeToday: "4h 30m",
  percentage: 75,
  streakDays: 12,
  weeklyGoalPercent: 65,
  heatmap: [
    0, 20, 40, 20, 60, 80, 100,
    40, 20, 0, 20, 40, 20, 60,
    80, 100, 40, 20, 0, 20, 40,
    20, 60, 80, 100, 40, 20, 0,
  ],
};

// ─── Flashcard Decks ────────────────────────────────────
export interface FlashcardDeck {
  id: string;
  title: string;
  icon: string;
  iconColor: string;
  dueToday: boolean;
  lastStudied: string;
  totalCards: number;
  dueCards: number;
  mastered: number;
  progressColor: string;
}

export const flashcardDecks: FlashcardDeck[] = [
  {
    id: "1",
    title: "Physics: Kinematics",
    icon: "cyclone",
    iconColor: "text-primary",
    dueToday: true,
    lastStudied: "2 days ago",
    totalCards: 248,
    dueCards: 42,
    mastered: 68,
    progressColor: "bg-primary",
  },
  {
    id: "2",
    title: "Chemistry: Organic",
    icon: "flask",
    iconColor: "text-tertiary",
    dueToday: false,
    lastStudied: "4 hours ago",
    totalCards: 156,
    dueCards: 0,
    mastered: 92,
    progressColor: "bg-tertiary",
  },
  {
    id: "3",
    title: "Maths: Calculus",
    icon: "functions",
    iconColor: "text-secondary",
    dueToday: true,
    lastStudied: "Yesterday",
    totalCards: 312,
    dueCards: 82,
    mastered: 41,
    progressColor: "bg-primary-dim",
  },
];

// ─── Analytics Data ─────────────────────────────────────
export const analyticsStats = [
  { label: "Focus Time", value: "124.5", unit: "hrs", icon: "clock", iconColor: "text-primary", iconBg: "bg-primary/10", change: "↑ 14%", changeColor: "text-green-400", note: "vs last month" },
  { label: "Current Streak", value: "18", unit: "days", icon: "flame", iconColor: "text-orange-400", iconBg: "bg-orange-500/10", change: "★ Best: 24", changeColor: "text-primary", note: "Maintain until Friday" },
  { label: "Retention Rate", value: "84.2", unit: "%", icon: "check-circle", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/10", change: "Optimal", changeColor: "text-emerald-400", note: "+2.1% improvement" },
  { label: "Global Rank", value: "#412", unit: "/ 12k", icon: "trophy", iconColor: "text-purple-400", iconBg: "bg-purple-500/10", change: "Elite Tier", changeColor: "text-purple-400", note: "Top 4% worldwide" },
];

export const subjectMastery = [
  { name: "Organic Chemistry", percent: 88, color: "bg-blue-400" },
  { name: "Discrete Maths", percent: 95, color: "bg-indigo-400" },
  { name: "Cognitive Psych", percent: 62, color: "bg-emerald-400" },
  { name: "Modern History", percent: 74, color: "bg-orange-400" },
  { name: "Macroeconomics", percent: 42, color: "bg-purple-400" },
];

export const recentSessions = [
  { subject: "Advanced Physics II", dotColor: "bg-blue-400", time: "Today, 08:30 — 10:45 AM", intensity: 4, efficiency: "92% High", effColor: "text-emerald-400", effBg: "bg-emerald-500/10" },
  { subject: "Data Structures", dotColor: "bg-indigo-400", time: "Yesterday, 14:15 — 16:00 PM", intensity: 5, efficiency: "98% Ultra", effColor: "text-emerald-400", effBg: "bg-emerald-500/10" },
  { subject: "Modern History", dotColor: "bg-orange-400", time: "Yesterday, 19:30 — 20:15 PM", intensity: 2, efficiency: "45% Low", effColor: "text-orange-400", effBg: "bg-orange-500/10" },
];

// ─── Heatmap Data for Analytics ─────────────────────────
export const analyticsHeatmap = [
  { day: 1, level: 0 }, { day: 2, level: 1 }, { day: 3, level: 2 },
  { day: 4, level: 0 }, { day: 5, level: 3 }, { day: 6, level: 4 },
  { day: 7, level: 1 }, { day: 8, level: 5 }, { day: 9, level: 5 },
  { day: 10, level: 3 }, { day: 11, level: 5 }, { day: 12, level: 5 },
  { day: 13, level: 2 }, { day: 14, level: 1 }, { day: 15, level: 5 },
  { day: 16, level: 5 }, { day: 17, level: 5 }, { day: 18, level: 6 },
  { day: 19, level: -1 }, { day: 20, level: -1 }, { day: 21, level: -1 },
];

// ─── Physics Folder Data ────────────────────────────────
export const physicsUnits = [
  { id: "01", title: "Classical Mechanics", resources: 14, size: "2.4 GB", icon: "cog" },
  { id: "02", title: "Optics & Waves", resources: 8, size: "412 MB", icon: "lightbulb" },
  { id: "03", title: "Thermodynamics", resources: 21, size: "1.1 GB", icon: "thermometer" },
];

export const physicsResources = [
  { name: "Quantum Mechanics Intro.pdf", size: "12.4 MB", unit: "Unit 04: Quantum", type: "Lecture Notes", modified: "2 hours ago", iconColor: "text-red-400", iconBg: "bg-red-500/10" },
  { name: "General Relativity Lecture.mp4", size: "1.2 GB", unit: "Unit 01: Classical", type: "Video Lecture", modified: "Yesterday", iconColor: "text-indigo-400", iconBg: "bg-indigo-500/10" },
  { name: "Experiment_Result_V2.png", size: "4.8 MB", unit: "Unit 03: Thermo", type: "Diagram", modified: "3 days ago", iconColor: "text-orange-400", iconBg: "bg-orange-500/10" },
];

// ─── Profile Data ───────────────────────────────────────
export const profileData = {
  name: "Alex Sterling",
  level: 42,
  title: "Grandmaster",
  bio: 'Dedicated Scholar specializing in Theoretical Physics. Maintaining a consistent 114-day deep work streak.',
  targetExam: "JEE 2024",
  targetExamFull: "Joint Entrance Examination (Advanced)",
  preparationReadiness: 68,
  targetScore: "99.5+",
  totalFocusTime: "1,240",
  quizAccuracy: "84.2",
  globalRank: "#2,410",
  email: "a.sterling@scholarship.edu",
  membership: "Scholar Pro Plus",
  affiliation: "International Academy of Science",
  department: "Physics Department",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf56VGvlSHQnwtUe9SXU-mqZqqYpFbsSAfUQgDDrZnfjuxOlv27FDb-F_pLixsUWW2gO918ASQr9XlxXUoHoebYB_DzzGMrpqLHkoypFrJN3Dq0LsyK8rn73ul09uReqozAIlZ_-wj1uAUnYBNhDqs861JyfUv2E2xR1EDQ8E-QGB1Q_3fkMHptPX40O5pNCZJFU84eXEm-8pusfdWrAI-s8GUvoQDUCSeZhh82jENNDL5B9N5lypdGzwG_rVKQtQv9IEKdZVsF6ng",
};

// ─── User Profile (Sidebar) ────────────────────────────
export const userProfile = {
  name: "Aryan Sharma",
  role: "Premium Scholar",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA24x4nNUrfkQqiaJffG-0wDGOyJK6iCfOYRDiHv-qf3Ut1bNi1PU-q_vN6hTfdNWrgYMgdldoe3-r5vslGyC2jeXy5b5yso2qWyYN7nwSqZdHIuqiEAVWHE8s1dndj_QwJ4FLGWVm8lzN11iMxo3vpq0XSIhKzdmWbiPzAb6uj0ZBTY3D8szOzIa24Gj0GYmak42WtiKWNg9x1xvvF22uY6mKc9wREqqOLaRxNlyXR-dzXFR5Q3t3WiJTbnRo1xKmVGFN5zWOPZx8B",
};
