'use client';

import { QuizEditor } from '@/components/quiz-editor';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc } from 'firebase/firestore';

export default function EditQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const isNewQuiz = id === 'new';

  const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const quizDocRef = useMemoFirebase(() => {
    if (isNewQuiz || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'quizzes', id);
  }, [id, user, firestore, isNewQuiz]);

  const { data: quizFromDb, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

  useEffect(() => {
    if (isAuthLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    if (isNewQuiz) {
      const newQuizData: Quiz = {
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
        updatedAt: new Date().toISOString(),
      };
      setQuiz(newQuizData);
      setIsLoading(false);
    } else {
      // Existing quiz
      if (isQuizLoading) {
        setIsLoading(true);
      } else {
        setQuiz(quizFromDb);
        setIsLoading(false);
      }
    }
  }, [isNewQuiz, isAuthLoading, isQuizLoading, quizFromDb, user, router, id]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!quiz) {
    notFound();
  }

  return <QuizEditor initialQuiz={quiz} />;
}
