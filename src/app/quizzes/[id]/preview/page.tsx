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
    
    // State to hold the quiz data, whether from DB or localStorage
    const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);

    // Fetching logic for existing quizzes from Firestore
    const quizDocRef = useMemoFirebase(() => {
        if (id === 'new' || !user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'quizzes', id);
    }, [id, user, firestore]);
  
    const { data: quizFromDb, isLoading: isQuizLoading } = useDoc<Quiz>(quizDocRef);

    useEffect(() => {
        if (id === 'new') {
            const storedQuizPreview = localStorage.getItem('quiz-preview');
            if (storedQuizPreview) {
                try {
                    const parsedQuiz = JSON.parse(storedQuizPreview) as Quiz;
                    setQuiz(parsedQuiz);
                } catch (error) {
                    console.error("Failed to parse quiz preview from localStorage", error);
                    setQuiz(null); // Set to null on parsing error
                }
            } else {
                setQuiz(null); // No preview data found
            }
        } else {
            // For existing quizzes, rely on the data from the useDoc hook
            if (!isQuizLoading) {
                 setQuiz(quizFromDb || null);
            }
        }
    }, [id, quizFromDb, isQuizLoading]);


    if (isAuthLoading || (quiz === undefined && id !== 'new')) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (quiz === null && !isQuizLoading) {
        notFound();
    }

    if (!quiz) {
         return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return <QuizPreview quiz={quiz} />;
}
