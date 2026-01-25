import { QuizEditor } from '@/components/quiz-editor';
import { mockQuizzes } from '@/lib/data';
import type { Quiz } from '@/lib/types';
import { notFound } from 'next/navigation';

export default function EditQuizPage({ params }: { params: { id: string } }) {
  let quiz: Quiz | undefined | null;

  if (params.id === 'new') {
    quiz = {
      id: crypto.randomUUID(),
      name: 'Untitled Quiz',
      description: 'Enter a description for your new quiz.',
      sections: [
        {
          id: crypto.randomUUID(),
          name: 'Section 1',
          questions: [],
        },
      ],
    };
  } else {
    quiz = mockQuizzes.find((q) => q.id === params.id);
  }

  if (!quiz) {
    notFound();
  }

  return <QuizEditor initialQuiz={quiz} />;
}
