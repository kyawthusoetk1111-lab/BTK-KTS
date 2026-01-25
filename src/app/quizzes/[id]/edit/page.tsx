'use client';

import { QuizEditor } from '@/components/quiz-editor';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc } from 'firebase/firestore';

export default function EditQuizPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const isNewQuiz = id === 'new';

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const quizDocRef = useMemoFirebase(() => {
    if (isNewQuiz || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'quizzes', id);
  }, [id, user, firestore, isNewQuiz]);
  
  const { data: quizFromDb, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

  const isLoading = isAuthLoading || (!isNewQuiz && isQuizLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isNewQuiz) {
    const newQuiz: Quiz = {
      id: crypto.randomUUID(),
      name: 'Untitled Quiz',
      description: 'Enter a description for your new quiz.',
      examCode: crypto.randomUUID().slice(0, 6).toUpperCase(),
      showInstantFeedback: false,
      sections: [
        {
          id: crypto.randomUUID(),
          name: 'Section 1',
          questions: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return <QuizEditor initialQuiz={newQuiz} />;
  }

  if (!quizFromDb) {
    notFound();
  }

  return <QuizEditor initialQuiz={quizFromDb} />;
}
