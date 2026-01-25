'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { mockQuizzes } from '@/lib/data';
import { QuizTaker } from '@/components/quiz-taker';
import { useUser } from '@/firebase';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function TakeQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { user, isUserLoading } = useUser();

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

    const quiz = mockQuizzes.find(q => q.id === id);

    if (!quiz) {
        notFound();
    }

    return <QuizTaker quiz={quiz} />;
}

    