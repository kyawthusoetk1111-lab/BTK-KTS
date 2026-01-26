'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockLeaderboard } from '@/lib/data';
import { subjects } from '@/lib/subjects';
import { BookOpen, User, Star } from 'lucide-react';

export function SubjectPerformance() {
    const subjectStats = subjects
        .filter(s => s !== 'Global') // Don't show global stats here
        .map(subject => {
            const leaderboard = mockLeaderboard[subject] || [];
            return {
                name: subject,
                studentCount: leaderboard.length,
                topStudent: leaderboard.length > 0 ? leaderboard[0] : null,
            };
        })
        .sort((a, b) => b.studentCount - a.studentCount);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen />
                    Subject Performance
                </CardTitle>
                <CardDescription>Top performers and activity by subject.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Ranked Students</TableHead>
                            <TableHead>Top Performer</TableHead>
                            <TableHead className="text-right">Top Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjectStats.map(stat => (
                            <TableRow key={stat.name}>
                                <TableCell className="font-medium">{stat.name}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        {stat.studentCount}
                                    </div>
                                </TableCell>
                                <TableCell>{stat.topStudent?.studentName || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    {stat.topStudent ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            {stat.topStudent.score}
                                        </div>
                                    ) : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                         {subjectStats.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    No subject data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
