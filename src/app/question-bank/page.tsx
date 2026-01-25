'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { mockQuizzes } from '@/lib/data';
import type { Question, Quiz } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

type BankQuestion = Question & {
    quizName: string;
    quizId: string;
    sectionName: string;
};

export default function QuestionBankPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
        router.push('/login');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user) {
        return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
        </div>
        );
    }

    const allQuestions: BankQuestion[] = mockQuizzes.flatMap((quiz: Quiz) =>
        quiz.sections.flatMap(section =>
            section.questions.map(question => ({
                ...question,
                quizName: quiz.name,
                quizId: quiz.id,
                sectionName: section.name,
            }))
        )
    );

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" passHref>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold font-headline text-primary">
                        Question Bank
                        </h1>
                        {/* Placeholder for potential actions like "Add New Question" directly to bank */}
                        <div className="w-[180px]"></div>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-2 mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">All Questions</h2>
                    <p className="text-muted-foreground">
                        Browse and manage all questions from your quizzes. This is a centralized location to see every question you've created.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {allQuestions.map(q => (
                        <Card key={q.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="text-base font-medium line-clamp-3">{q.text || '[No Question Text]'}</CardTitle>
                                <CardDescription className="text-xs">From: {q.quizName}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex justify-between items-center text-sm text-muted-foreground pt-0">
                                <Badge variant="outline" className="capitalize">{q.type.replace('-', ' ')}</Badge>
                                <span className="font-semibold">{q.points} pts</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
