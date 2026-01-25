import type { Quiz } from './types';

export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    name: 'General Knowledge Challenge',
    description: 'A fun quiz to test your general knowledge across various domains.',
    subject: 'General Knowledge',
    timerInMinutes: 10,
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
    timerInMinutes: 60,
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

    