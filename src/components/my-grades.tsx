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
import { Crown, GraduationCap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'bg-emerald-100 text-emerald-800';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800';
    if (grade.includes('C')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
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
        <Card>
            <CardHeader>
                <CardTitle>ရမှတ်များ</CardTitle>
                <CardDescription>Here are the results from your recent quiz attempts.</CardDescription>
            </CardHeader>
            <CardContent>
                {!results || results.length === 0 ? (
                    <div className="text-center text-muted-foreground py-16">
                        <h3 className="text-lg font-semibold">No Grades Yet</h3>
                        <p className="text-sm">Complete a quiz to see your grades here.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quiz Name</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result) => (
                                <TableRow key={result.id}>
                                    <TableCell className="font-medium">{result.quizName}</TableCell>
                                    <TableCell>{format(new Date(result.submissionTime), "PP")}</TableCell>
                                    <TableCell>{result.score}/{result.totalPossibleScore}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={getGradeColor(result.grade)}>
                                                {result.grade}
                                            </Badge>
                                            <TooltipProvider>
                                                {result.grade === 'A*' && (
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Crown className="h-5 w-5 text-amber-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Grand Master</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {result.grade === 'A' && (
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <GraduationCap className="h-5 w-5 text-sky-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Scholar</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
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
