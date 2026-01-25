'use client';

import { useParams, notFound } from 'next/navigation';
import { QuizPreview } from '@/components/quiz-preview';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useEffect, useState } from 'react';
import type { Quiz } from '@/lib/types';
import { doc } from 'firebase/firestore';

export default function PreviewQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();
    const isNewQuiz = id === 'new';
    
    // For new quizzes, we need client-side state to read from localStorage
    const [localQuiz, setLocalQuiz] = useState<Quiz | null | undefined>(undefined);

    const quizDocRef = useMemoFirebase(() => {
        if (isNewQuiz || !user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'quizzes', id);
    }, [id, user, firestore, isNewQuiz]);
  
    const { data: quizFromDb, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

    useEffect(() => {
        if (isNewQuiz) {
            const storedQuizPreview = localStorage.getItem('quiz-preview');
            if (storedQuizPreview) {
                try {
                    setLocalQuiz(JSON.parse(storedQuizPreview) as Quiz);
                } catch (error) {
                    console.error("Failed to parse quiz preview from localStorage", error);
                    setLocalQuiz(null);
                }
            } else {
                setLocalQuiz(null); // No preview data found
            }
        }
    }, [isNewQuiz]);
    
    const isLoading = isAuthLoading || (!isNewQuiz && isQuizLoading) || (isNewQuiz && localQuiz === undefined);
    
    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    const quiz = isNewQuiz ? localQuiz : quizFromDb;

    if (!quiz) {
        notFound();
    }

    return <QuizPreview quiz={quiz} />;
}
