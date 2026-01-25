'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { QuizTaker } from '@/components/quiz-taker';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { collectionGroup, query, where, limit } from 'firebase/firestore';
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

    const quizQuery = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return query(collectionGroup(firestore, 'quizzes'), where('id', '==', id), limit(1));
    }, [firestore, id]);

    const { data: quizzes, isLoading: isQuizLoading } = useCollection<Quiz>(quizQuery);
    
    if (isUserLoading || isQuizLoading) {
        return (
          <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
          </div>
        );
    }
      
    const quiz = quizzes?.[0];

    if (!quiz) {
        notFound();
    }

    return <QuizTaker quiz={quiz} />;
}
