'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Star, Clock } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-amber-500';
    if (rank === 2) return 'text-slate-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-muted-foreground';
}

export function Leaderboard({ entries }: LeaderboardProps) {
  if (!entries || entries.length === 0) {
    return (
        <div className="text-center text-muted-foreground py-16">
            <h3 className="text-lg font-semibold">No Leaderboard Data</h3>
            <p className="text-sm">Complete quizzes in this subject to see the leaderboard.</p>
        </div>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 10 Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="text-right">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.slice(0, 10).map((entry) => (
              <TableRow key={entry.rank}>
                <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                        <div className={cn('text-lg w-6 h-6 flex items-center justify-center', getRankColor(entry.rank))}>
                           {entry.rank <= 3 ? <Crown className="h-6 w-6 fill-current" /> : <span className="text-base">{entry.rank}</span>}
                        </div>
                    </div>
                </TableCell>
                <TableCell>{entry.studentName}</TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 font-medium">
                        {entry.score}
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        {entry.time}
                        <Clock className="h-4 w-4" />
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
