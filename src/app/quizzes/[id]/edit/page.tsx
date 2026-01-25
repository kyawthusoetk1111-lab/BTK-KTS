'use client';

import { QuizEditor } from '@/components/quiz-editor';
import { mockQuizzes } from '@/lib/data';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function EditQuizPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

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

  if (id === 'new') {
    quiz = {
      id: crypto.randomUUID(),
      name: 'Untitled Quiz',
      description: 'Enter a description for your new quiz.',
      examCode: crypto.randomUUID().slice(0, 6).toUpperCase(),
      sections: [
        {
          id: crypto.randomUUID(),
          name: 'Section 1',
          questions: [],
        },
      ],
    };
  } else {
    quiz = mockQuizzes.find((q) => q.id === id);
  }

  if (!quiz) {
    notFound();
  }

  return <QuizEditor initialQuiz={quiz} />;
}
