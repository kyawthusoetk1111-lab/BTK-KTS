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
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface InlineDropdown {
  id: string;
  options: Option[];
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
}

export interface Section {
  id: string;
  name: string;
  questions: Question[];
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  examCode?: string;
  sections: Section[];
  subject?: string;
  startDate?: string;
  endDate?: string;
  timerInMinutes?: number;
  showInstantFeedback?: boolean;
}

export interface UserProfile {
  id: string;
  userType: 'teacher' | 'student';
  name: string;
  email: string;
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
