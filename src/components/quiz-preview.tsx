'use client';

import type { Quiz, Section } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
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

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [scrollToQuestionId, setScrollToQuestionId] = useState<string | null>(null);

    const questionMap = useMemo(() => {
        const map: { sectionIndex: number, questionId: string }[] = [];
        quiz.sections.forEach((section, sIndex) => {
            section.questions.forEach(question => {
                map.push({ sectionIndex: sIndex, questionId: question.id });
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
        const { sectionIndex, questionId } = questionMap[flatIndex];
        if (sectionIndex !== currentSectionIndex) {
            setCurrentSectionIndex(sectionIndex);
        }
        setScrollToQuestionId(questionId);
    }
    
    const currentSection = quiz.sections[currentSectionIndex];

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold font-headline text-primary">{quiz.name} (Preview)</h1>
                             <p className="text-sm text-muted-foreground">Section {currentSectionIndex + 1} of {quiz.sections.length}</p>
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
                    <div className="md:col-span-2 lg:col-span-3 space-y-8">
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
                                            answer={null}
                                            onAnswerChange={() => {}}
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
