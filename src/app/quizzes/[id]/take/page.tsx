'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { QuizTaker } from '@/components/quiz-taker';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { doc } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';

export default function TakeQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    useEffect(() => {
        if (!isUserLoading && !user) {
          router.push('/login');
        }
      }, [user, isUserLoading, router]);

    const quizDocRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, 'quizzes', id);
    }, [firestore, id]);

    const { data: quiz, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);
    
    if (isUserLoading || isQuizLoading) {
        return (
          <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
          </div>
        );
    }
      
    if (!quiz) {
        notFound();
    }

    return <QuizTaker quiz={quiz} />;
}
