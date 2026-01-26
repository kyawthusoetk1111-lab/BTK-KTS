'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, RefreshCw, Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { mockLeaderboard } from '@/lib/data';
import type { LeaderboardEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Let's use the math leaderboard as a sample
const leaderboardData: LeaderboardEntry[] = mockLeaderboard['Mathematics'] || [];
const topThree = leaderboardData.slice(0, 3);
const restOfLeaderboard = leaderboardData.slice(3);

const podiumOrder = [1, 0, 2]; // For visual order: 2nd, 1st, 3rd

export default function RankingsPage() {
    const { toast } = useToast();

    const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <ArrowUp className="h-4 w-4 text-green-400" />;
            case 'down': return <ArrowDown className="h-4 w-4 text-red-400" />;
            default: return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };
    
    const getTrophy = (rank: number) => {
        switch(rank) {
            case 1: return <Trophy className="h-8 w-8 text-yellow-400 fill-yellow-400" />;
            case 2: return <Trophy className="h-8 w-8 text-slate-400 fill-slate-400" />;
            case 3: return <Trophy className="h-8 w-8 text-yellow-600 fill-yellow-600" />;
            default: return null;
        }
    };

    const handleDownload = () => {
        toast({ title: 'Coming Soon!', description: 'Downloading reports will be available in a future update.' });
    };

    const handleReset = () => {
        toast({ title: 'Coming Soon!', description: 'Resetting the leaderboard will be available in a future update.' });
    };

    return (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-headline tracking-tight">ထိပ်တန်းဖြေဆိုသူများ (Leaderboard)</h1>
                    <p className="text-gray-300">
                        See who is leading the charts across all exams.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleReset} className="bg-transparent border-amber-400/40 text-amber-300 hover:bg-amber-400/20 hover:text-amber-200">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Season
                    </Button>
                    <Button variant="outline" onClick={handleDownload} className="bg-transparent border-sky-400/40 text-sky-300 hover:bg-sky-400/20 hover:text-sky-200">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Top 3 Podium */}
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 items-end">
                {podiumOrder.map(index => {
                    const student = topThree[index];
                    if (!student) return null;
                    const isFirst = student.rank === 1;

                    return (
                        <div key={student.rank} className={cn("relative", isFirst && "md:-translate-y-8")}>
                            <Card className={cn(
                                "text-center p-6 relative flex flex-col items-center transition-all duration-300",
                                "bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white",
                                isFirst && "border-yellow-400/50 shadow-2xl shadow-yellow-500/20"
                            )}>
                                {isFirst && <div className="absolute inset-0 shimmer-effect rounded-lg"></div>}
                                <div className="relative">
                                    <Avatar className="w-24 h-24 border-4 border-white/20">
                                        <AvatarImage src={student.avatarUrl} alt={student.studentName} />
                                        <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 -right-2">
                                        {getTrophy(student.rank)}
                                    </div>
                                </div>
                                <h3 className="mt-4 text-xl font-bold">{student.studentName}</h3>
                                <p className="text-sm text-gray-300">အဆင့် {student.rank}</p>
                                <div className="mt-4 text-2xl font-semibold text-yellow-300">{student.score.toLocaleString()} <span className="text-base font-normal text-gray-400">အမှတ်</span></div>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Rest of the Leaderboard */}
            <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                <CardHeader>
                    <CardTitle>All Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-emerald-500/30 hover:bg-emerald-500/10">
                                <TableHead className="text-gray-200 w-[80px]">အဆင့်</TableHead>
                                <TableHead className="text-gray-200">Student</TableHead>
                                <TableHead className="text-gray-200 text-right">အမှတ်စုစုပေါင်း</TableHead>
                                <TableHead className="text-gray-200 text-right">ဖြေဆိုချိန်</TableHead>
                                <TableHead className="text-gray-200 text-right">Trend</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {restOfLeaderboard.map(student => (
                                <TableRow key={student.rank} className="border-emerald-500/30 hover:bg-emerald-500/10">
                                    <TableCell className="font-bold text-lg">{student.rank}</TableCell>
                                    <TableCell className="font-medium">{student.studentName}</TableCell>
                                    <TableCell className="text-right font-semibold">{student.score.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-gray-400">{student.time}</TableCell>
                                    <TableCell className="flex justify-end">{getTrendIcon(student.trend)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
}
