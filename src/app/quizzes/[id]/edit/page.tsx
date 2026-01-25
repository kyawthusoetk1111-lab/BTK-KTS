'use client';

import { QuizEditor } from '@/components/quiz-editor';
import type { Quiz } from '@/lib/types';
import { notFound, useRouter, useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc } from 'firebase/firestore';

function EditExistingQuiz({ id }: { id: string }) {
  const router = useRouter();
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const quizDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid, 'quizzes', id);
  }, [id, user, firestore]);

  const { data: quiz, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

  if (isAuthLoading || isQuizLoading) {
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

  if (!quiz) {
    notFound();
  }

  return <QuizEditor initialQuiz={quiz!} />;
}

function CreateNewQuiz() {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const router = useRouter();

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


export default function EditQuizPage() {
  const params = useParams();
  const id = params.id as string;
  const isNewQuiz = id === 'new';

  if (isNewQuiz) {
      return <CreateNewQuiz />;
  }

  return <EditExistingQuiz id={id} />;
}
