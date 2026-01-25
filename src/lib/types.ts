import type { LucideIcon } from "lucide-react";

export type QuestionType =
  | 'multiple-choice'
  | 'true-false'
  | 'short-answer'
  | 'essay'
  | 'matching'
  | 'dropdown'
  | 'passage';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  ownerId?: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
  ownerId?: string;
}

export interface InlineDropdown {
  id: string;
  options: Option[];
  ownerId?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  options: Option[];
  matchingPairs: MatchingPair[];
  dropdowns?: InlineDropdown[];
  passageId?: string;
  ownerId?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Section {
  id: string;
  name: string;
  questions: Question[];
  ownerId?: string;
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  ownerId?: string;
  examCode?: string;
  sections: Section[];
  subject?: string;
  startDate?: string;
  endDate?: string;
  timerInMinutes?: number;
  showInstantFeedback?: boolean;
  isPremium?: boolean;
  price?: number;
  enableAntiCheat?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  userType: 'teacher' | 'student' | 'admin';
  name: string;
  email: string;
  accountTier?: 'free' | 'pro';
  createdAt: string;
  updatedAt: string;
  badges?: Badge[];
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  quizId: string;
  answers: Record<string, any>;
  autoScore: number;
  manualScore: number;
  totalScore: number;
  totalPossibleScore: number;
  status: 'Graded' | 'Needs Grading';
  submissionTime: string;
}

export interface ExamResult {
  id: string;
  quizId: string;
  quizName: string;
  score: number;
  totalPossibleScore: number;
  grade: string;
  submissionTime: string;
  createdAt: string;
  updatedAt: string;
  answers: Record<string, any>;
}

export interface LeaderboardEntry {
  rank: number;
  studentName: string;
  score: number;
  time: string; // e.g., "5m 32s"
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  itemId: string; // e.g. quizId or 'pro-upgrade'
  itemDescription: string;
  amount: number;
  currency: string;
  screenshotUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'quiz' | 'subscription';
  itemDescription: string;
  amountPaid: number;
  purchaseDate: string;
}

    