'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, RefreshCw, Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { mockLeaderboard } from '@/lib/data';
import type { LeaderboardEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { subjects } from '@/lib/subjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function RankingsPage() {
    const { toast } = useToast();
    const [selectedSubject, setSelectedSubject] = useState<string>('Global');
    
    const leaderboardData: LeaderboardEntry[] = mockLeaderboard[selectedSubject] || [];
    const topThree = leaderboardData.slice(0, 3);
    const restOfLeaderboard = leaderboardData.slice(3);

    const podiumOrder = [1, 0, 2]; // For visual order: 2nd, 1st, 3rd

    const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
            case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
            default: return <Minus className="h-4 w-4 text-slate-500" />;
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
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-4xl font-bold font-headline tracking-tight">ထိပ်တန်းဖြေဆိုသူများ (Leaderboard)</h1>
                    <p className="text-muted-foreground">
                        See who is leading the charts across all exams.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleReset}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Season
                    </Button>
                    <Button variant="outline" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                    </Button>
                </div>
            </div>

            <div className="mb-8">
                <Label>Filter by Subject</Label>
                <div className="w-full md:w-72">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by subject..." />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {leaderboardData.length > 0 ? (
                <>
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
                                        <p className="text-sm text-muted-foreground">အဆင့် {student.rank}</p>
                                        <div className="mt-4 text-2xl font-semibold text-primary">{student.score.toLocaleString()} <span className="text-base font-normal text-muted-foreground">အမှတ်</span></div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {/* Rest of the Leaderboard */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Rankings for {selectedSubject}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">အဆင့်</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">အမှတ်စုစုပေါင်း</TableHead>
                                        <TableHead className="text-right">ဖြေဆိုချိန်</TableHead>
                                        <TableHead className="text-right">Trend</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {restOfLeaderboard.map(student => (
                                        <TableRow key={student.rank}>
                                            <TableCell className="font-bold text-lg">{student.rank}</TableCell>
                                            <TableCell className="font-medium">{student.studentName}</TableCell>
                                            <TableCell className="text-right font-semibold">{student.score.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-muted-foreground">{student.time}</TableCell>
                                            <TableCell className="flex justify-end">{getTrendIcon(student.trend)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            ) : (
                <Card className="text-center py-20">
                    <CardContent>
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-bold">No Leaderboard Data</h3>
                        <p className="text-muted-foreground">There are no rankings available for {selectedSubject} yet.</p>
                    </CardContent>
                </Card>
            )}
        </main>
    );
}
