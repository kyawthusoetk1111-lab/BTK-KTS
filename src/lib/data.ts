import type { Quiz, LeaderboardEntry, Badge, StudentSubmission } from './types';
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
    showInstantFeedback: true,
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
          {
            id: 'q-2-1-2',
            type: 'multiple-choice',
            text: 'What is the derivative of $x^2$?',
            points: 10,
            options: [
              { id: 'opt-m-1', text: '$2x$', isCorrect: true },
              { id: 'opt-m-2', text: '$x$', isCorrect: false },
              { id: 'opt-m-3', text: '$x^2/2$', isCorrect: false },
            ],
            matchingPairs: [],
            dropdowns: [],
          },
        ],
      },
    ],
  },
];

export const mockSubmissions: StudentSubmission[] = [
    {
      id: 'sub-1',
      studentId: 'student-1',
      studentName: 'Alice Johnson',
      quizId: 'quiz-1',
      answers: {
        'q-1-1-1': 'opt-2', // Correct
        'q-1-1-2': 'False', // Correct
        'q-1-2-1': 'H2O',
      },
      autoScore: 15,
      manualScore: 0,
      totalScore: 15,
      totalPossibleScore: 20,
      status: 'Needs Grading',
      submissionTime: '2024-05-20T10:30:00Z',
    },
    {
      id: 'sub-2',
      studentId: 'student-2',
      studentName: 'Bob Williams',
      quizId: 'quiz-1',
      answers: {
        'q-1-1-1': 'opt-3', // Incorrect
        'q-1-1-2': 'True', // Incorrect
        'q-1-2-1': 'Water',
      },
      autoScore: 0,
      manualScore: 4,
      totalScore: 4,
      totalPossibleScore: 20,
      status: 'Graded',
      submissionTime: '2024-05-20T11:00:00Z',
    },
    {
        id: 'sub-3',
        studentId: 'student-3',
        studentName: 'Charlie Brown',
        quizId: 'quiz-2',
        answers: {
            'q-2-1-1': 'The fundamental theorem of calculus is a theorem that links the concept of differentiating a function with the concept of integrating a function.',
            'q-2-1-2': 'opt-m-1', // Correct
        },
        autoScore: 10,
        manualScore: 0,
        totalScore: 10,
        totalPossibleScore: 35,
        status: 'Needs Grading',
        submissionTime: '2024-05-21T14:00:00Z',
    }
  ];

export const mockLeaderboard: Record<string, LeaderboardEntry[]> = {
  'Global': [
    { rank: 1, studentName: 'Alice Johnson', score: 100, time: '8m 15s', avatarUrl: 'https://i.pravatar.cc/150?u=alice', trend: 'up' },
    { rank: 2, studentName: 'Diana Prince', score: 98, time: '5m 30s', avatarUrl: 'https://i.pravatar.cc/150?u=diana', trend: 'up' },
    { rank: 3, studentName: 'Bruce Wayne', score: 96, time: '6m 10s', avatarUrl: 'https://i.pravatar.cc/150?u=bruce', trend: 'up' },
    { rank: 4, studentName: 'Bob Williams', score: 95, time: '9m 02s', avatarUrl: 'https://i.pravatar.cc/150?u=bob', trend: 'stable' },
    { rank: 5, studentName: 'Clark Kent', score: 95, time: '6m 12s', avatarUrl: 'https://i.pravatar.cc/150?u=clark', trend: 'down' },
  ],
  'Mathematics': [
    { rank: 1, studentName: 'Alice Johnson', score: 100, time: '8m 15s', avatarUrl: 'https://i.pravatar.cc/150?u=alice', trend: 'up' },
    { rank: 2, studentName: 'Bob Williams', score: 95, time: '9m 02s', avatarUrl: 'https://i.pravatar.cc/150?u=bob', trend: 'stable' },
    { rank: 3, studentName: 'Charlie Brown', score: 95, time: '9m 45s', avatarUrl: 'https://i.pravatar.cc/150?u=charlie', trend: 'down' },
    { rank: 4, studentName: 'David Miller', score: 92, time: '10m 30s', trend: 'up' },
    { rank: 5, studentName: 'Eve Davis', score: 90, time: '11m 05s', trend: 'down' },
    { rank: 6, studentName: 'Frank Garcia', score: 88, time: '12m 00s', trend: 'stable' },
    { rank: 7, studentName: 'Grace Rodriguez', score: 85, time: '12m 15s', trend: 'up' },
    { rank: 8, studentName: 'Henry Wilson', score: 82, time: '13m 40s', trend: 'stable' },
    { rank: 9, studentName: 'Isabella Martinez', score: 80, time: '14m 22s', trend: 'down' },
    { rank: 10, studentName: 'Jack Anderson', score: 78, time: '15m 01s', trend: 'up' },
  ],
  'General Knowledge': [
    { rank: 1, studentName: 'Diana Prince', score: 98, time: '5m 30s', avatarUrl: 'https://i.pravatar.cc/150?u=diana', trend: 'up' },
    { rank: 2, studentName: 'Bruce Wayne', score: 96, time: '6m 10s', avatarUrl: 'https://i.pravatar.cc/150?u=bruce', trend: 'up' },
    { rank: 3, studentName: 'Clark Kent', score: 95, time: '6m 12s', avatarUrl: 'https://i.pravatar.cc/150?u=clark', trend: 'down' },
    { rank: 4, studentName: 'Barry Allen', score: 94, time: '4m 55s', trend: 'stable' },
  ]
};

export const mockUserBadges: Badge[] = [
    { id: 'badge-1', name: 'Math Whiz', description: 'Achieved 100% in a Mathematics quiz.', icon: Award },
    { id: 'badge-2', name: 'Speedster', description: 'Finished a quiz in under 5 minutes.', icon: Rocket },
    { id: 'badge-3', name: 'Knowledge Guru', description: 'Mastered the General Knowledge category.', icon: BrainCircuit },
];
