'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { QuizPreview } from '@/components/quiz-preview';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import type { Quiz } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function PreviewExistingQuiz({ id }: { id: string }) {
    const { user, isUserLoading: isAuthLoading } = useUser();
    const firestore = useFirestore();

    const quizDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid, 'quizzes', id);
    }, [id, user, firestore]);

    const { data: quiz, isLoading: isDbLoading } = useDoc<Quiz>(quizDocRef);

    if (isAuthLoading || isDbLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    
    if (!quiz) {
        notFound();
    }

    return <QuizPreview quiz={quiz!} />;
}

function PreviewNewQuiz() {
    const [localQuiz, setLocalQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedQuizPreview = localStorage.getItem('quiz-preview');
            if (storedQuizPreview) {
                setLocalQuiz(JSON.parse(storedQuizPreview));
            }
        } catch (error) {
            console.error("Failed to parse quiz preview from localStorage", error);
            setLocalQuiz(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!localQuiz) {
        notFound();
    }

    return <QuizPreview quiz={localQuiz!} />;
}

export default function PreviewQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const isNewQuiz = id === 'new';

    if (isNewQuiz) {
        return <PreviewNewQuiz />;
    }

    return <PreviewExistingQuiz id={id} />;
}
