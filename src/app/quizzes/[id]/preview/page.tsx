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

    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const quizDocRef = useMemoFirebase(() => {
        if (isNewQuiz || !firestore || !id || !user) return null;
        return doc(firestore, 'quizzes', id);
    }, [isNewQuiz, firestore, id, user]);

    const { data: quizFromDb, isLoading: isDbLoading } = useDoc<Quiz>(quizDocRef);

    useEffect(() => {
        if (isNewQuiz) {
            try {
                const storedQuizPreview = localStorage.getItem('quiz-preview');
                if (storedQuizPreview) {
                    setLocalQuiz(JSON.parse(storedQuizPreview));
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

    if (isAuthLoading || (!isNewQuiz && isDbLoading) || (isNewQuiz && isLocalLoading)) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        notFound();
        return null;
    }
    
    if (isNewQuiz) {
        if (!localQuiz) {
            notFound();
            return null;
        }
        return <QuizPreview quiz={localQuiz} />;
    }

    if (!quizFromDb) {
        notFound();
        return null;
    }

    return <QuizPreview quiz={quizFromDb} />;
}
