import type { Quiz, LeaderboardEntry, Badge } from './types';
import { Award, Rocket, BrainCircuit } from 'lucide-react';

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    name: 'General Knowledge Challenge',
    description: 'A fun quiz to test your general knowledge across various domains.',
    subject: 'General Knowledge',
    examCode: 'GKC-101',
    timerInMinutes: 10,
    showInstantFeedback: false,
    sections: [
      {
        id: 'sec-1-1',
        name: 'History',
        questions: [
          {
            id: 'q-1-1-1',
            type: 'multiple-choice',
            text: 'In which year did World War II end?',
            points: 10,
            options: [
              { id: 'opt-1', text: '1943', isCorrect: false },
              { id: 'opt-2', text: '1945', isCorrect: true },
              { id: 'opt-3', text: '1947', isCorrect: false },
              { id: 'opt-4', text: '1950', isCorrect: false },
            ],
            matchingPairs: [],
            dropdowns: [],
          },
          {
            id: 'q-1-1-2',
            type: 'true-false',
            text: 'The Great Wall of China is visible from the moon.',
            points: 5,
            options: [
                { id: 'opt-tf-1', text: 'True', isCorrect: false },
                { id: 'opt-tf-2', text: 'False', isCorrect: true },
            ],
            matchingPairs: [],
            dropdowns: [],
          }
        ],
      },
      {
        id: 'sec-1-2',
        name: 'Science',
        questions: [
          {
            id: 'q-1-2-1',
            type: 'short-answer',
            text: 'What is the chemical symbol for water?',
            points: 5,
            options: [],
            matchingPairs: [],
            dropdowns: [],
          },
        ],
      },
    ],
  },
  {
    id: 'quiz-2',
    name: 'Advanced Mathematics',
    description: 'A challenging quiz for math enthusiasts focusing on calculus and algebra.',
    subject: 'Mathematics',
    examCode: 'MATH-202',
    timerInMinutes: 60,
    showInstantFeedback: false,
    sections: [
      {
        id: 'sec-2-1',
        name: 'Calculus',
        questions: [
          {
            id: 'q-2-1-1',
            type: 'essay',
            text: 'Explain the fundamental theorem of calculus.',
            points: 25,
            options: [],
            matchingPairs: [],
            dropdowns: [],
          },
        ],
      },
    ],
  },
];

export const mockLeaderboard: Record<string, LeaderboardEntry[]> = {
  'Mathematics': [
    { rank: 1, studentName: 'Alice Johnson', score: 100, time: '8m 15s' },
    { rank: 2, studentName: 'Bob Williams', score: 95, time: '9m 02s' },
    { rank: 3, studentName: 'Charlie Brown', score: 95, time: '9m 45s' },
    { rank: 4, studentName: 'David Miller', score: 92, time: '10m 30s' },
    { rank: 5, studentName: 'Eve Davis', score: 90, time: '11m 05s' },
    { rank: 6, studentName: 'Frank Garcia', score: 88, time: '12m 00s' },
    { rank: 7, studentName: 'Grace Rodriguez', score: 85, time: '12m 15s' },
    { rank: 8, studentName: 'Henry Wilson', score: 82, time: '13m 40s' },
    { rank: 9, studentName: 'Isabella Martinez', score: 80, time: '14m 22s' },
    { rank: 10, studentName: 'Jack Anderson', score: 78, time: '15m 01s' },
  ],
  'General Knowledge': [
    { rank: 1, studentName: 'Diana Prince', score: 98, time: '5m 30s' },
    { rank: 2, studentName: 'Bruce Wayne', score: 96, time: '6m 10s' },
    { rank: 3, studentName: 'Clark Kent', score: 95, time: '6m 12s' },
    { rank: 4, studentName: 'Barry Allen', score: 94, time: '4m 55s' },
  ]
};

export const mockUserBadges: Badge[] = [
    { id: 'badge-1', name: 'Math Whiz', description: 'Achieved 100% in a Mathematics quiz.', icon: Award },
    { id: 'badge-2', name: 'Speedster', description: 'Finished a quiz in under 5 minutes.', icon: Rocket },
    { id: 'badge-3', name: 'Knowledge Guru', description: 'Mastered the General Knowledge category.', icon: BrainCircuit },
];
