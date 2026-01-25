'use client';

import { QuizEditor } from '@/components/quiz-editor';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { collectionGroup, query, where, limit } from 'firebase/firestore';

export default function EditQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const isNewQuiz = id === 'new';
  const router = useRouter();
  
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  // Data fetching for existing quiz
  const quizQuery = useMemoFirebase(() => {
    if (isNewQuiz || !firestore || !id || !user) return null;
    // We use a collectionGroup query to find the quiz first.
    return query(collectionGroup(firestore, 'quizzes'), where('id', '==', id), limit(1));
  }, [isNewQuiz, firestore, id, user]);

  const { data: quizzes, isLoading: isQuizLoading } = useCollection<Quiz>(quizQuery);

  // Loading state
  if (isAuthLoading || (!isNewQuiz && isQuizLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Auth check
  if (!user) {
    router.push('/login');
    return null;
  }
  
  // Handle new quiz creation
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
    return <QuizEditor initialQuiz={newQuizData} />;
  }

  // Handle existing quiz
  const quiz = quizzes?.[0];

  if (!quiz) {
    // This will be hit if the query completes but finds no quiz
    notFound();
  }
  
  return <QuizEditor initialQuiz={quiz} />;
}
