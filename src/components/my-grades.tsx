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

    return (
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
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
                            <TableRow className="border-white/20 hover:bg-white/10">
                                <TableHead className="text-gray-200">Quiz Name</TableHead>
                                <TableHead className="text-gray-200">Date</TableHead>
                                <TableHead className="text-gray-200">Score</TableHead>
                                <TableHead className="text-gray-200">Grade</TableHead>
                                <TableHead className="text-right text-gray-200">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result) => (
                                <TableRow key={result.id} className="border-white/20 hover:bg-white/10">
                                    <TableCell className="font-medium">{result.quizName}</TableCell>
                                    <TableCell>{format(new Date(result.submissionTime), "PP")}</TableCell>
                                    <TableCell>{result.score}/{result.totalPossibleScore}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getGradeColor(result.grade)}>
                                            {result.grade}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild className="bg-transparent border-white/40 hover:bg-white/20">
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
