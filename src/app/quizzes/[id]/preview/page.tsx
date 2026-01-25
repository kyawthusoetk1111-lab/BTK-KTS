'use client';

import { useParams, notFound } from 'next/navigation';
import { mockQuizzes } from '@/lib/data';
import { QuizPreview } from '@/components/quiz-preview';
import { useUser } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';

export default function PreviewQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const { isUserLoading } = useUser();

    // Although public, we can wait for user loading to not have layout shifts if we add user-specific things later.
    if (isUserLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const quiz = mockQuizzes.find(q => q.id === id);

    if (!quiz) {
        notFound();
    }

    return <QuizPreview quiz={quiz} />;
}
