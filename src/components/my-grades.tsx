'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from './loading-spinner';
import type { ExamResult } from '@/lib/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import Link from 'next/link';

const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-400/50';
    if (grade.includes('B')) return 'bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-300 border-blue-400/50';
    if (grade.includes('C')) return 'bg-orange-200 text-orange-900 dark:bg-orange-900/50 dark:text-orange-300 border-orange-400/50';
    return 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-300 border-red-400/50';
}

export function MyGrades() {
    const { user } = useUser();
    const firestore = useFirestore();

    const resultsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'users', user.uid, 'examResults'), orderBy('submissionTime', 'desc'));
    }, [user?.uid, firestore]);

    const { data: results, isLoading } = useCollection<ExamResult>(resultsQuery);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
            </div>
        )
    }

    return (
        <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
            <CardHeader>
                <CardTitle>ရမှတ်များ</CardTitle>
                <CardDescription className="text-gray-300">Here are the results from your recent quiz attempts.</CardDescription>
            </CardHeader>
            <CardContent>
                {!results || results.length === 0 ? (
                    <div className="text-center text-gray-300 py-16">
                        <h3 className="text-lg font-semibold">No Grades Yet</h3>
                        <p className="text-sm">Complete a quiz to see your grades here.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-emerald-500/30 hover:bg-emerald-500/10">
                                <TableHead className="text-gray-200">Quiz Name</TableHead>
                                <TableHead className="text-gray-200">Date</TableHead>
                                <TableHead className="text-gray-200">Score</TableHead>
                                <TableHead className="text-gray-200">Grade</TableHead>
                                <TableHead className="text-right text-gray-200">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result) => (
                                <TableRow key={result.id} className="border-emerald-500/30 hover:bg-emerald-500/10">
                                    <TableCell className="font-medium">{result.quizName}</TableCell>
                                    <TableCell>{format(new Date(result.submissionTime), "PP")}</TableCell>
                                    <TableCell>{result.score}/{result.totalPossibleScore}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getGradeColor(result.grade)}>
                                            {result.grade}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild className="bg-transparent border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/20 hover:text-emerald-200">
                                            <Link href="#">ရလဒ်ကြည့်ရန်</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
