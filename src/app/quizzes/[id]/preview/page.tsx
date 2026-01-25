'use client';

import { useParams, notFound } from 'next/navigation';
import { QuizPreview } from '@/components/quiz-preview';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Quiz } from '@/lib/types';
import { collectionGroup, query, where, limit } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function PreviewQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const isNewQuiz = id === 'new';

    const [localQuiz, setLocalQuiz] = useState<Quiz | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(true);

    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    // Data fetching for existing quiz
    const quizQuery = useMemoFirebase(() => {
        if (isNewQuiz || !firestore || !id || !user) return null;
        return query(collectionGroup(firestore, 'quizzes'), where('id', '==', id), limit(1));
    }, [isNewQuiz, firestore, id, user]);

    const { data: quizzes, isLoading: isDbLoading } = useCollection<Quiz>(quizQuery);

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

    const quiz = quizzes?.[0];

    if (!quiz) {
        notFound();
    }

    return <QuizPreview quiz={quiz} />;
}
