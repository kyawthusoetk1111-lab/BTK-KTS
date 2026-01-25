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

        if (isNewQuiz) {
            const storedQuizPreview = localStorage.getItem('quiz-preview');
            if (storedQuizPreview) {
                try {
                    setQuiz(JSON.parse(storedQuizPreview));
                } catch (error) {
                    console.error("Failed to parse quiz preview from localStorage", error);
                    setQuiz(null);
                }
            } else {
                setQuiz(null);
            }
            setIsLoading(false);
        } else { // Existing quiz
            if (isQuizLoading) {
                setIsLoading(true);
            } else {
                setQuiz(quizFromDb);
                setIsLoading(false);
            }
        }
    }, [isNewQuiz, isAuthLoading, isQuizLoading, quizFromDb, id]);

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

    return <QuizPreview quiz={quiz} />;
}
