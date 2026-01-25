'use client';

import { useParams, notFound } from 'next/navigation';
import { mockQuizzes } from '@/lib/data';
import { QuizPreview } from '@/components/quiz-preview';
import { useUser } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useEffect, useState } from 'react';
import type { Quiz } from '@/lib/types';

export default function PreviewQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const { isUserLoading } = useUser();
    const [quiz, setQuiz] = useState<Quiz | null | undefined>(undefined);

    useEffect(() => {
        // This effect should only run on the client where localStorage is available.
        let quizData: Quiz | undefined;

        if (id === 'new') {
            const storedQuizPreview = localStorage.getItem('quiz-preview');
            if (storedQuizPreview) {
                try {
                    quizData = JSON.parse(storedQuizPreview) as Quiz;
                } catch (error) {
                    console.error("Failed to parse quiz preview from localStorage", error);
                }
            }
        } else {
            quizData = mockQuizzes.find(q => q.id === id);
        }

        setQuiz(quizData || null); // Set to null if not found
    }, [id]);


    if (isUserLoading || quiz === undefined) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (quiz === null) {
        notFound();
    }

    return <QuizPreview quiz={quiz} />;
}
