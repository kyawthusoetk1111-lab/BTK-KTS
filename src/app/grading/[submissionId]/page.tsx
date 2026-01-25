'use client';

import { useState, useMemo } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { mockQuizzes, mockSubmissions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { LatexRenderer } from '@/components/latex-renderer';
import type { Question, StudentSubmission } from '@/lib/types';
import { cn } from '@/lib/utils';

const getIsCorrect = (question: Question, answer: any): boolean | null => {
    if (answer === undefined || answer === null || answer === '') return null;
    if (question.type === 'multiple-choice') {
        const correctOption = question.options.find(o => o.isCorrect);
        return correctOption?.id === answer;
    }
    if (question.type === 'true-false') {
        const correctOption = question.options.find(o => o.isCorrect);
        return correctOption?.text === answer;
    }
    return null; // Not auto-gradable
}

export default function GradingPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const submissionId = params.submissionId as string;

    const submission: StudentSubmission | undefined = mockSubmissions.find(s => s.id === submissionId);
    const quiz = submission ? mockQuizzes.find(q => q.id === submission.quizId) : undefined;
    
    const initialManualScores = useMemo(() => {
        if (!quiz || !submission) return {};
        const scores: Record<string, number> = {};
        quiz.sections.forEach(sec => {
            sec.questions.forEach(q => {
                if (q.type === 'short-answer' || q.type === 'essay') {
                    // In a real app, you might have previously saved manual scores
                    scores[q.id] = 0; 
                }
            });
        });
        return scores;
    }, [quiz, submission]);

    const [manualScores, setManualScores] = useState<Record<string, number>>(initialManualScores);

    if (!submission || !quiz) {
        notFound();
    }

    const handleScoreChange = (questionId: string, score: number) => {
        const question = quiz.sections.flatMap(s => s.questions).find(q => q.id === questionId);
        if (question && score >= 0 && score <= question.points) {
            setManualScores(prev => ({ ...prev, [questionId]: score }));
        }
    };
    
    const totalManualScore = Object.values(manualScores).reduce((sum, score) => sum + score, 0);
    const finalScore = submission.autoScore + totalManualScore;

    const handleSaveGrade = () => {
        console.log("Saving Grade:", {
            submissionId,
            autoScore: submission.autoScore,
            manualScores,
            totalManualScore,
            finalScore,
        });
        toast({
            title: 'Grade Saved!',
            description: `${submission.studentName}'s score has been updated to ${finalScore}/${submission.totalPossibleScore}.`,
        });
        router.push('/'); // Redirect back to dashboard after grading
    }

    return (
        <div className="flex flex-col min-h-screen bg-muted/20">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Submissions
                        </Button>
                        <h1 className="text-xl font-bold font-headline text-primary text-center">
                            Grading: {quiz.name}
                            <span className="block text-sm font-normal text-muted-foreground">{submission.studentName}</span>
                        </h1>
                        <Button onClick={handleSaveGrade}>Save & Finalize Grade</Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {quiz.sections.map(section => (
                            <Card key={section.id}>
                                <CardHeader>
                                    <CardTitle>{section.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {section.questions.map((q, index) => {
                                        const studentAnswer = submission.answers[q.id];
                                        const isCorrect = getIsCorrect(q, studentAnswer);

                                        return (
                                            <div key={q.id} className="p-4 border rounded-lg space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-semibold flex-1">Question {index + 1}</h4>
                                                    <Badge variant="secondary">{q.points} points</Badge>
                                                </div>
                                                <LatexRenderer text={q.text} />
                                                
                                                <div className="space-y-2">
                                                    <Label className="text-xs text-muted-foreground">Student's Answer</Label>
                                                    <div className={cn("p-3 rounded-md border min-h-[40px] text-sm", 
                                                        isCorrect === true && "bg-green-100/50 border-green-500",
                                                        isCorrect === false && "bg-red-100/50 border-red-500"
                                                    )}>
                                                        {q.type === 'multiple-choice' && (
                                                            <p>{q.options.find(o => o.id === studentAnswer)?.text || 'Not answered'}</p>
                                                        )}
                                                         {q.type === 'true-false' && (
                                                            <p>{studentAnswer ?? 'Not answered'}</p>
                                                        )}
                                                        {(q.type === 'short-answer' || q.type === 'essay') && (
                                                            <p className="whitespace-pre-wrap">{studentAnswer || 'Not answered'}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {(q.type === 'short-answer' || q.type === 'essay') ? (
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`score-${q.id}`}>Assign Points</Label>
                                                        <Input
                                                            id={`score-${q.id}`}
                                                            type="number"
                                                            value={manualScores[q.id] || 0}
                                                            onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value))}
                                                            max={q.points}
                                                            min={0}
                                                            className="w-32"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        {isCorrect === true && <><CheckCircle className="h-4 w-4 text-green-600"/> <span className="font-medium text-green-600">Correct</span></>}
                                                        {isCorrect === false && <><XCircle className="h-4 w-4 text-red-600"/> <span className="font-medium text-red-600">Incorrect</span></>}
                                                        {isCorrect === null && <span className="font-medium text-muted-foreground">Needs Manual Grading</span>}
                                                    </div>
                                                )}

                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <aside className="sticky top-24 self-start space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Score Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                 <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Auto-graded Score:</span>
                                    <span className="font-semibold">{submission.autoScore} / {submission.totalPossibleScore}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Manual Score:</span>
                                    <span className="font-semibold">{totalManualScore}</span>
                                </div>
                                <hr/>
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold">Final Score:</span>
                                    <span className="font-bold text-primary">{finalScore} / {submission.totalPossibleScore}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    );
}
