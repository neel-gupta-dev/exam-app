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
