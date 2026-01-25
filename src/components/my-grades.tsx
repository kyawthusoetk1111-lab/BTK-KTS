'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar, ClipboardCheck } from 'lucide-react';
import { LoadingSpinner } from './loading-spinner';
import type { ExamResult } from '@/lib/types';
import { format } from 'date-fns';

const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400 border-emerald-500/50';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 border-blue-500/50';
    if (grade.includes('C')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400 border-orange-500/50';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border-red-500/50';
}

export function MyGrades() {
    const { user } = useUser();
    const firestore = useFirestore();

    const resultsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'examResults'), orderBy('submissionTime', 'desc'));
    }, [user, firestore]);

    const { data: results, isLoading } = useCollection<ExamResult>(resultsQuery);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
            </div>
        )
    }

    if (!results || results.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>My Grades</CardTitle>
                    <CardDescription>Here are the results from your recent quiz attempts.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-16">
                    <h3 className="text-lg font-semibold">No Grades Yet</h3>
                    <p className="text-sm">Complete a quiz to see your grades here.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Grades</CardTitle>
                <CardDescription>Here are the results from your recent quiz attempts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                {results.map((result) => (
                    <Card key={result.id} className="flex flex-col">
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base font-medium">{result.quizName}</CardTitle>
                        <Badge variant="outline" className={getGradeColor(result.grade)}>
                        <Award className="mr-1 h-3 w-3"/>{result.grade}
                        </Badge>
                    </CardHeader>
                    <CardContent className="flex-grow flex justify-between items-center text-sm text-muted-foreground pt-2">
                        <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        <span>Score: {result.score}/{result.totalPossibleScore}</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(result.submissionTime), "PP")}</span>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </CardContent>
        </Card>
    );
}

    