export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerifiedStudent: boolean;
  targetExam: string[];
  targetYear: number | null;
  isOnboarded: boolean;
  bio?: string;
  targetScore?: string;
  currentStreak?: number;
  level?: number;
  totalActiveSeconds?: number;
  profile?: {
    dreamColleges: string[];
    currentCoaching: string;
    academicLevel: string;
  };
  analytics?: {
    subjectDistribution: Record<string, number>;
    searchHistory: { term: string; timestamp: string }[];
    studyConfidence: number;
    studyConfidenceCount: number;
    resourceCount: number;
  };
  level: number;
  levelData?: {
    currentLevel: number;
    totalXP: number;
    progressToNext: number;
    xpRemaining: number;
  };
  preferences?: {
    preferredResourceType: string;
  };
}

export interface Resource {
  _id: string;
  userId: string;
  title: string;
  url: string;
  type: 'pdf' | 'video' | 'link' | 'other';
  folderName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  userId: string;
  resourceId: string;
  content: string;
  pageNumber?: number;
  timestamp?: number;
  createdAt: string;
  updatedAt: string;
}
