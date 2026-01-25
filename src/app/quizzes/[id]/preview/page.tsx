'use client';

import { useParams, notFound } from 'next/navigation';
import { QuizPreview } from '@/components/quiz-preview';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Quiz } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function PreviewQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const isNewQuiz = id === 'new';

    const [localQuiz, setLocalQuiz] = useState<Quiz | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(true);

    const { isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    // Data fetching for existing quiz
    const quizDocRef = useMemoFirebase(() => {
        if (isNewQuiz || !firestore || !id) return null;
        return doc(firestore, 'quizzes', id);
    }, [isNewQuiz, firestore, id]);

    const { data: quizFromDb, isLoading: isDbLoading } = useDoc<Quiz>(quizDocRef);

    // Effect for loading new quiz draft from localStorage
    useEffect(() => {
        if (isNewQuiz) {
            try {
                const storedQuizPreview = localStorage.getItem('quiz-preview');
                if (storedQuizPreview) {
                    const parsedQuiz = JSON.parse(storedQuizPreview);
                    if (parsedQuiz && parsedQuiz.id && parsedQuiz.name) {
                         setLocalQuiz(parsedQuiz);
                    }
                }
            } catch (error) {
                console.error("Failed to parse quiz preview from localStorage", error);
                setLocalQuiz(null);
            } finally {
                setIsLocalLoading(false);
            }
        } else {
            setIsLocalLoading(false);
        }
    }, [isNewQuiz]);

    if (isAuthLoading || isDbLoading || isLocalLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (isNewQuiz) {
        if (!localQuiz) {
            // If someone navigates to /new/preview directly without having a draft.
            notFound();
        }
        return <QuizPreview quiz={localQuiz!} />;
    }

    if (!quizFromDb) {
        notFound();
    }

    return <QuizPreview quiz={quizFromDb} />;
}
