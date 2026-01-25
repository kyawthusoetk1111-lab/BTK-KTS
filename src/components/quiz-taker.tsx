'use client';

import type { Quiz } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Timer } from './quiz/timer';
import { QuestionNavigation } from './quiz/question-navigation';
import { QuestionRenderer } from './quiz/question-renderer';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './loading-spinner';

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

    const [examResultId, setExamResultId] = useState<string | null>(null);
    const [deadline, setDeadline] = useState<number | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [unansweredQuestions, setUnansweredQuestions] = useState(0);
    const [animationDirection, setAnimationDirection] = useState<string | null>(null);

    const allQuestions = useMemo(() => quiz.sections.flatMap(s => s.questions), [quiz.sections]);

    useEffect(() => {
        if (!user) return;

        const sessionKey = `quiz-session-${quiz.id}-${user.uid}`;
        const storedSession = localStorage.getItem(sessionKey);
        
        if (storedSession) {
            // Session exists, restore it
            const { examResultId: storedExamResultId, deadline: storedDeadline } = JSON.parse(storedSession);
            setExamResultId(storedExamResultId);
            setDeadline(storedDeadline);

            if (storedDeadline && Date.now() > storedDeadline) {
                handleSubmit(true);
                return;
            }
            
            // Restore answers from localStorage
            const storedAnswers = localStorage.getItem(`quiz-answers-${storedExamResultId}`);
            if (storedAnswers) {
                setAnswers(JSON.parse(storedAnswers));
            }
        } else {
            // No session, start a new one
            const newExamResultId = crypto.randomUUID();
            const newDeadline = quiz.timerInMinutes ? Date.now() + quiz.timerInMinutes * 60 * 1000 : null;

            setExamResultId(newExamResultId);
            setDeadline(newDeadline);
            
            localStorage.setItem(sessionKey, JSON.stringify({ examResultId: newExamResultId, deadline: newDeadline }));
            localStorage.setItem(`quiz-answers-${newExamResultId}`, JSON.stringify({})); // init empty answers
            
            // Create an initial document in Firestore to mark the start of the attempt
            if (firestore) {
                const resultDocRef = doc(firestore, 'users', user.uid, 'examResults', newExamResultId);
                const initialData = {
                    id: newExamResultId,
                    quizId: quiz.id,
                    quizName: quiz.name,
                    answers: {},
                    score: 0,
                    totalPossibleScore: 0,
                    grade: 'In Progress',
                    submissionTime: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setDocumentNonBlocking(resultDocRef, initialData, { merge: false });
            }
        }

        setIsLoaded(true);

    // Using JSON.stringify on quiz.id and user.uid for stable dependency check
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, firestore, quiz.id]);


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

    const handleSaveProgress = () => {
        if (!user || !firestore || !examResultId || Object.keys(answers).length === 0) return;

        setIsSaving(true);
        toast({ title: 'Saving progress...' });

        const resultDocRef = doc(firestore, 'users', user.uid, 'examResults', examResultId);
        const progressData = {
            answers: answers,
            updatedAt: new Date().toISOString(),
        };

        setDocumentNonBlocking(resultDocRef, progressData, { merge: true });
        
        setTimeout(() => {
            setIsSaving(false);
            toast({ title: 'Progress saved!', duration: 2000 });
        }, 1000);
    };

    const changeSection = (newIndex: number) => {
        const direction = newIndex > currentSectionIndex ? 'left' : 'right';
        setAnimationDirection(direction);

        setTimeout(() => {
            setCurrentSectionIndex(newIndex);
            setAnimationDirection(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300); // Duration should match animation
    }

    const handleNextSection = () => {
        if (currentSectionIndex < quiz.sections.length - 1) {
            handleSaveProgress();
            changeSection(currentSectionIndex + 1);
        }
    };

    const handlePrevSection = () => {
        if (currentSectionIndex > 0) {
            handleSaveProgress();
            changeSection(currentSectionIndex - 1);
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
        const newAnswers = {...answers, [questionId]: answer};
        setAnswers(newAnswers);
        if (examResultId) {
            localStorage.setItem(`quiz-answers-${examResultId}`, JSON.stringify(newAnswers));
        }
    }

    const handleOpenSubmitModal = () => {
        const answeredCount = Object.values(answers).filter(a => a !== undefined && a !== '' && a !== null).length;
        setUnansweredQuestions(allQuestions.length - answeredCount);
        setShowSubmissionModal(true);
    }

    const handleSubmit = (isTimeUp: boolean = false) => {
        if (!isLoaded || !user) return;
        if (!isTimeUp) {
            setShowSubmissionModal(false);
        }

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
        
        if (user && firestore && examResultId) {
            const examResultData = {
                id: examResultId,
                quizId: quiz.id,
                quizName: quiz.name,
                answers: answers,
                score: calculatedScore,
                totalPossibleScore: possibleScore,
                grade: grade,
                submissionTime: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const resultDoc = doc(firestore, 'users', user.uid, 'examResults', examResultId);
            setDocumentNonBlocking(resultDoc, examResultData, { merge: true }); // Merge to not overwrite createdAt
        }

        // Clear session from localStorage
        const sessionKey = `quiz-session-${quiz.id}-${user.uid}`;
        localStorage.removeItem(sessionKey);
        if (examResultId) {
            localStorage.removeItem(`quiz-answers-${examResultId}`);
        }

        setScore(calculatedScore);
        setTotalPossibleScore(possibleScore);
        setIsSubmitted(true);

        if (!isTimeUp) {
            toast({
                title: "Quiz Submitted!",
                description: "Your results are ready.",
            });
        }
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

    const getPassageText = (passageId?: string): string | undefined => {
        if (!passageId) return undefined;
        return allQuestions.find(q => q.id === passageId && q.type === 'passage')?.text;
    }

    if (!isLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <LoadingSpinner />
                <p className="ml-4">Loading your session...</p>
            </div>
        );
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
    const isLastSection = currentSectionIndex === quiz.sections.length - 1;
    const progressValue = ((currentSectionIndex + 1) / quiz.sections.length) * 100;

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <Progress value={progressValue} className="fixed top-0 left-0 right-0 h-1 z-20 rounded-none" />
            <header className="sticky top-1 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold font-headline text-primary">{quiz.name}</h1>
                            <p className="text-sm text-muted-foreground">Section {currentSectionIndex + 1} of {quiz.sections.length}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {deadline && (
                                <Timer deadline={deadline} onTimeUp={() => handleSubmit(true)} />
                            )}
                            <Button onClick={handleOpenSubmitModal}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Submit
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    <div className="md:col-span-2 lg:col-span-3 overflow-hidden">
                        <Card
                            key={currentSection.id}
                            className={cn(
                                'transition-all duration-300',
                                animationDirection === 'left' && 'animate-out slide-out-to-left',
                                animationDirection === 'right' && 'animate-out slide-out-to-right',
                                !animationDirection && 'animate-in fade-in'
                            )}
                        >
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
                                            passageText={getPassageText(question.passageId)}
                                            showInstantFeedback={quiz.showInstantFeedback}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                             <CardFooter className="flex justify-between">
                                <Button variant="outline" onClick={handlePrevSection} disabled={currentSectionIndex === 0}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous Section
                                </Button>
                                {isLastSection ? (
                                    <Button onClick={handleOpenSubmitModal}>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Submit Exam
                                    </Button>
                                ) : (
                                    <Button onClick={handleNextSection}>
                                        Next Section
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>

                    <aside className="space-y-6 sticky top-24 self-start">
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
            <AlertDialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {unansweredQuestions > 0 
                                ? `You have ${unansweredQuestions} unanswered question(s). You can go back and review your answers before submitting.`
                                : `You have answered all questions. Are you ready to submit your exam?`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSubmit(false)}>
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
