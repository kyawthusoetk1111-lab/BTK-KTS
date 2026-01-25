'use client';

import { QuizEditor } from '@/components/quiz-editor';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc } from 'firebase/firestore';

export default function EditQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const isNewQuiz = id === 'new';
  const router = useRouter();
  
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const quizDocRef = useMemoFirebase(() => {
    if (isNewQuiz || !firestore || !id || !user) return null;
    return doc(firestore, 'quizzes', id);
  }, [isNewQuiz, firestore, id, user]);

  const { data: quiz, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }
  
  if (isNewQuiz) {
    const newQuizData: Quiz = {
      id: crypto.randomUUID(),
      name: 'Untitled Quiz',
      ownerId: user.uid,
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
  
  if (isQuizLoading) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!quiz) {
    notFound();
    return null;
  }
  
  if (quiz.ownerId !== user.uid) {
    notFound();
    return null;
  }
  
  return <QuizEditor initialQuiz={quiz} />;
}
