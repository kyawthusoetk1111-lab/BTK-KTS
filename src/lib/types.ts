export type QuestionType =
  | 'multiple-choice'
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

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  points: number;
  options: Option[];
  matchingPairs: MatchingPair[];
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
  sections: Section[];
}
