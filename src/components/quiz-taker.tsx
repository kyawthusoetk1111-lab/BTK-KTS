'use client';

import type { Quiz, Section } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Timer } from './quiz/timer';
import { QuestionNavigation } from './quiz/question-navigation';
import { QuestionRenderer } from './quiz/question-renderer';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

interface QuizTakerProps {
    quiz: Quiz;
}

export function QuizTaker({ quiz }: QuizTakerProps) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [totalPossibleScore, setTotalPossibleScore] = useState(0);
    const [scrollToQuestionId, setScrollToQuestionId] = useState<string | null>(null);

    const allQuestions = useMemo(() => quiz.sections.flatMap(s => s.questions), [quiz.sections]);

    const questionMap = useMemo(() => {
        const map: { sectionIndex: number, questionId: string }[] = [];
        let flatIndex = 0;
        quiz.sections.forEach((section, sIndex) => {
            section.questions.forEach(question => {
                map[flatIndex] = { sectionIndex: sIndex, questionId: question.id };
                flatIndex++;
            });
        });
        return map;
    }, [quiz.sections]);

    useEffect(() => {
        if (scrollToQuestionId) {
            const element = document.getElementById(`question-cont-${scrollToQuestionId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setScrollToQuestionId(null);
        }
    }, [scrollToQuestionId, currentSectionIndex]);

    const handleNextSection = () => {
        if (currentSectionIndex < quiz.sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleQuestionSelect = (flatIndex: number) => {
        const mapping = questionMap[flatIndex];
        if (mapping) {
            const { sectionIndex, questionId } = mapping;
            if (sectionIndex !== currentSectionIndex) {
                setCurrentSectionIndex(sectionIndex);
            }
            setScrollToQuestionId(questionId);
        }
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

        const { grade } = getGradeDetails(calculatedScore, possibleScore);
        
        if (user && firestore) {
            const examResultData = {
                quizId: quiz.id,
                userId: user.uid,
                score: calculatedScore,
                totalPossibleScore: possibleScore,
                grade: grade,
                submissionTime: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const resultsCollection = collection(firestore, 'examResults');
            addDocumentNonBlocking(resultsCollection, examResultData);
        }

        setScore(calculatedScore);
        setTotalPossibleScore(possibleScore);
        setIsSubmitted(true);

        toast({
            title: "Quiz Submitted!",
            description: "Your results are ready.",
        });
    }

    const getGradeDetails = (currentScore: number, totalScore: number) => {
        if (totalScore === 0) {
            return {
                percentage: 0,
                grade: 'N/A',
                message: "This quiz contains no auto-gradable questions.",
                gradeColor: "text-muted-foreground",
            };
        }
        const percentage = (currentScore / totalScore) * 100;
        let grade = '';
        let gradeColor = '';
        if (percentage >= 90) {
            grade = 'A*';
            gradeColor = 'text-emerald-600';
        } else if (percentage >= 80) {
            grade = 'A';
            gradeColor = 'text-emerald-600';
        } else if (percentage >= 70) {
            grade = 'B*';
            gradeColor = 'text-blue-600';
        } else if (percentage >= 60) {
            grade = 'B';
            gradeColor = 'text-blue-600';
        } else if (percentage >= 50) {
            grade = 'C*';
            gradeColor = 'text-orange-500';
        } else if (percentage >= 40) {
            grade = 'C';
            gradeColor = 'text-orange-500';
        } else {
            grade = 'D';
            gradeColor = 'text-red-600';
        }

        return { percentage, grade, message: '', gradeColor };
    }


    if (isSubmitted) {
        const { percentage, grade, message, gradeColor } = getGradeDetails(score, totalPossibleScore);
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
                             <p className={`text-7xl font-bold ${gradeColor}`}>{grade}</p>
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

    const currentSection = quiz.sections[currentSectionIndex];

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold font-headline text-primary">{quiz.name}</h1>
                            <p className="text-sm text-muted-foreground">Section {currentSectionIndex + 1} of {quiz.sections.length}</p>
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
                                <CardTitle>{currentSection.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {currentSection.questions.map((question, index) => (
                                    <div key={question.id} id={`question-cont-${question.id}`} className="p-6 border rounded-lg">
                                        <CardTitle className="mb-4">Question {index + 1}</CardTitle>
                                        <CardDescription className="mb-4">{question.points} points</CardDescription>
                                        <QuestionRenderer 
                                            question={question}
                                            answer={answers[question.id]}
                                            onAnswerChange={(answer) => handleAnswerChange(question.id, answer)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                             <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={handlePrevSection} disabled={currentSectionIndex === 0}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous Section
                                </Button>
                                <Button onClick={handleNextSection} disabled={currentSectionIndex === quiz.sections.length - 1}>
                                    Next Section
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
                                    sections={quiz.sections}
                                    currentSectionIndex={currentSectionIndex}
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
