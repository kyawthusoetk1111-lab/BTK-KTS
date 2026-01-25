'use client';

import { QuizEditor } from '@/components/quiz-editor';
import { mockQuizzes } from '@/lib/data';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function EditQuizPage({ params }: { params: { id: string } }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
