'use client';

import type { Quiz } from '@/lib/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { QuestionNavigation } from './quiz/question-navigation';
import { QuestionRenderer } from './quiz/question-renderer';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';

interface QuizPreviewProps {
    quiz: Quiz;
}

export function QuizPreview({ quiz }: QuizPreviewProps) {
    const router = useRouter();

    const allQuestions = quiz.sections.flatMap(s => 
        s.questions.map(q => ({...q, sectionName: s.name}))
    );
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleNext = () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleQuestionSelect = (index: number) => {
        setCurrentQuestionIndex(index);
    }

    const currentQuestion = allQuestions[currentQuestionIndex];

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold font-headline text-primary">{quiz.name} (Preview)</h1>
                            <p className="text-sm text-muted-foreground">{quiz.subject}</p>
                        </div>
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <div className="md:col-span-2 lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
                                <CardDescription>{currentQuestion.sectionName} - {currentQuestion.points} points</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <QuestionRenderer 
                                    question={currentQuestion}
                                    answer={null} // No answer state in preview
                                    onAnswerChange={() => {}} // No-op
                                />
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Button>
                                <Button onClick={handleNext} disabled={currentQuestionIndex === allQuestions.length - 1}>
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Questions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <QuestionNavigation
                                    questions={allQuestions}
                                    currentQuestionIndex={currentQuestionIndex}
                                    answers={{}} // No answers in preview
                                    onQuestionSelect={handleQuestionSelect}
                                />
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    )
}
