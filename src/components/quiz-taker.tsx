'use client';

import type { Quiz } from '@/lib/types';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
    const allQuestions = quiz.sections.flatMap(s => 
        s.questions.map(q => ({...q, sectionName: s.name}))
    );
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [totalPossibleScore, setTotalPossibleScore] = useState(0);

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
        let calculatedScore = 0;
        let possibleScore = 0;

        allQuestions.forEach(question => {
            if (question.type === 'multiple-choice' || question.type === 'true-false') {
                possibleScore += question.points;
                const correctAnswer = question.options.find(opt => opt.isCorrect);
                const userAnswer = answers[question.id];

                if (question.type === 'true-false') {
                    if (correctAnswer && userAnswer === correctAnswer.text) {
                        calculatedScore += question.points;
                    }
                } else {
                    if (correctAnswer && userAnswer === correctAnswer.id) {
                        calculatedScore += question.points;
                    }
                }
            }
        });

        setScore(calculatedScore);
        setTotalPossibleScore(possibleScore);
        setIsSubmitted(true);

        toast({
            title: "Quiz Submitted!",
            description: "Your results are ready.",
        });
    }

    const getGradeDetails = () => {
        if (totalPossibleScore === 0) {
            return {
                percentage: 0,
                grade: 'N/A',
                message: "This quiz contains no auto-gradable questions."
            };
        }
        const percentage = (score / totalPossibleScore) * 100;
        let grade = '';
        if (percentage >= 90) grade = 'A*';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B*';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C*';
        else if (percentage >= 40) grade = 'C';
        else grade = 'D';

        return { percentage, grade, message: '' };
    }


    if (isSubmitted) {
        const { percentage, grade, message } = getGradeDetails();
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-full max-w-2xl text-center">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold font-headline">Quiz Results</CardTitle>
                        <CardDescription>You have completed the {quiz.name} quiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                             <p className="text-lg text-muted-foreground">Your Grade</p>
                             <p className="text-7xl font-bold text-primary">{grade}</p>
                        </div>
                        <div className="flex justify-around items-center p-4 bg-muted rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Score</p>
                                <p className="text-2xl font-semibold">{score} / {totalPossibleScore}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Percentage</p>
                                <p className="text-2xl font-semibold">{percentage.toFixed(1)}%</p>
                            </div>
                        </div>
                        {message && <p className="text-muted-foreground text-sm">{message}</p>}
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" onClick={() => router.push('/')}>
                            Back to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
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
