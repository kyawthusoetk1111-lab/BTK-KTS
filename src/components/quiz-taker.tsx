'use client';

import type { Quiz, Question } from '@/lib/types';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Timer } from './quiz/timer';
import { QuestionNavigation } from './quiz/question-navigation';
import { QuestionRenderer } from './quiz/question-renderer';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuizTakerProps {
    quiz: Quiz;
}

export function QuizTaker({ quiz }: QuizTakerProps) {
    const { toast } = useToast();
    const allQuestions = quiz.sections.flatMap(s => 
        s.questions.map(q => ({...q, sectionName: s.name}))
    );
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});

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
    
    const handleAnswerChange = (questionId: string, answer: any) => {
        setAnswers(prev => ({...prev, [questionId]: answer}));
    }

    const handleSubmit = () => {
        // In a real app, you would save the answers to the backend
        console.log("Submitting answers:", answers);
        toast({
            title: "Quiz Submitted!",
            description: "Your answers have been successfully submitted.",
        });
    }

    const currentQuestion = allQuestions[currentQuestionIndex];

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold font-headline text-primary">{quiz.name}</h1>
                            <p className="text-sm text-muted-foreground">{quiz.subject}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {quiz.timerInMinutes && quiz.timerInMinutes > 0 && (
                                <Timer durationInMinutes={quiz.timerInMinutes} onTimeUp={handleSubmit} />
                            )}
                            <Button onClick={handleSubmit}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Submit
                            </Button>
                        </div>
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
                                    answer={answers[currentQuestion.id]}
                                    onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
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
                                    answers={answers}
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

    