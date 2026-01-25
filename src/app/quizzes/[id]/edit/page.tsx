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
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const isNewQuiz = id === 'new';

  const quizDocRef = useMemoFirebase(() => {
    if (isNewQuiz || !user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'quizzes', id);
  }, [id, user, firestore, isNewQuiz]);

  const { data: quiz, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

  // Handle loading states first. This will show a spinner until both auth and data fetching are settled.
  if (isAuthLoading || (!isNewQuiz && isQuizLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // After loading, check for user. If not logged in, redirect.
  // This check is safe now because isAuthLoading is false.
  if (!user) {
    router.push('/login');
    return null; // Return null while redirecting
  }

  // Handle the 'new' quiz case
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

  // Handle existing quizzes.
  // If we are done loading (`isQuizLoading` is false) and there's still no quiz data,
  // then the quiz does not exist.
  if (!quiz) {
    notFound();
  }

  // Render the editor for the existing quiz. The `!quiz` check above ensures `quiz` is not null here.
  return <QuizEditor initialQuiz={quiz!} />;
}
