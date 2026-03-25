export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerifiedStudent: boolean;
  isOnboarded: boolean;
  targetExam: string[];
  targetYear: number | string | null;
  targetScore: string;
  vaultId?: string;
  bio: string;
  currentStreak: number;
  totalActiveSeconds: number;
  profile: {
    dreamColleges: string[];
    currentCoaching: string;
    academicLevel: '11th' | '12th' | 'Dropper' | '';
  };
  analytics: {
    subjectDistribution: Record<string, number>;
    resourceCount: number;
    studyConfidence: number;
    studyConfidenceCount: number;
    searchHistory: {
      term: string;
      timestamp: Date | string;
    }[];
  };
  preferences: {
    preferredResourceType: 'video' | 'pdf' | 'mixed' | '';
  };
  levelData?: {
    currentLevel: number;
    totalXP: number;
    progressToNext: number;
    xpRemaining: number;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Resource {
  _id: string;
  userId: string;
  title: string;
  url: string;
  type: 'pdf' | 'video' | 'link' | 'other';
  folderName: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Note {
  _id: string;
  userId: string;
  resourceId: string;
  content: string;
  pageNumber?: number;
  timestamp?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Session {
  _id: string;
  userId: string;
  startTime: string | Date;
  endTime?: string | Date;
  isActive: boolean;
  activeDuration: number;
  lastPing: string | Date;
  devicePublicIp?: string;
}
