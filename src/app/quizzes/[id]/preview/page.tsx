'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { QuizPreview } from '@/components/quiz-preview';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Quiz } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function PreviewQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const isNewQuiz = id === 'new';

    // Separate state for the quiz loaded from local storage for previews
    const [localQuiz, setLocalQuiz] = useState<Quiz | null | undefined>(undefined);
    const [isLocalLoading, setIsLocalLoading] = useState(true);

    const quizDocRef = useMemoFirebase(() => {
        // A new quiz doesn't exist in Firestore, so we don't need a ref for it.
        // Also wait for user and firestore to be available.
        if (isNewQuiz || !user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'quizzes', id);
    }, [id, user, firestore, isNewQuiz]);

    // Hook to fetch existing quiz data from Firestore
    const { data: dbQuiz, isLoading: isDbLoading } = useDoc<Quiz>(quizDocRef);

    // Effect for handling new quiz preview from local storage
    useEffect(() => {
        if (isNewQuiz) {
            try {
                const storedQuizPreview = localStorage.getItem('quiz-preview');
                if (storedQuizPreview) {
                    setLocalQuiz(JSON.parse(storedQuizPreview));
                } else {
                    // If there's no stored preview for a 'new' quiz, it's an invalid link.
                    setLocalQuiz(null);
                }
            } catch (error) {
                console.error("Failed to parse quiz preview from localStorage", error);
                setLocalQuiz(null);
            } finally {
                setIsLocalLoading(false);
            }
        }
    }, [isNewQuiz]);
    
    // Determine the overall loading state based on whether it's a new or existing quiz
    const isLoading = isNewQuiz ? isLocalLoading : (isAuthLoading || isDbLoading);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    // After loading is complete, determine which quiz data to use
    const quiz = isNewQuiz ? localQuiz : dbQuiz;
    
    // If we've finished loading and there's no quiz data, the page is not found.
    if (!quiz) {
        notFound();
    }
    
    // The !quiz check above ensures quiz is not null here.
    return <QuizPreview quiz={quiz!} />;
}
