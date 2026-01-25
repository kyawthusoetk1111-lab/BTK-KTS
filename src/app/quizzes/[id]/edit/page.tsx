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

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const quizDocRef = useMemoFirebase(() => {
    if (id === 'new' || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'quizzes', id);
  }, [id, user, firestore]);
  
  const { data: quizFromDb, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

  if (isAuthLoading || (id !== 'new' && isQuizLoading)) {
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
  } else {
    quiz = quizFromDb;
  }

  if (!quiz) {
    if (id !== 'new' && !isQuizLoading) {
      // If we are not loading and there's no quiz, it's a 404
      notFound();
    }
    // If it's a new quiz, or still loading, don't 404 yet
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <QuizEditor initialQuiz={quiz} />;
}
