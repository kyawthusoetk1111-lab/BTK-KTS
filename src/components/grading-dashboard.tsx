'use client';

import { useState } from 'react';
import { mockQuizzes, mockSubmissions } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { PenBox, Download, ArrowUpDown } from 'lucide-react';
import type { StudentSubmission } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function GradingDashboard() {
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState<Record<string, 'asc' | 'desc'>>({});

  const quizzesWithSubmissions = mockQuizzes.map(quiz => {
    const submissions = mockSubmissions.filter(sub => sub.quizId === quiz.id);
    const needsGradingCount = submissions.filter(sub => sub.status === 'Needs Grading').length;
    return {
      ...quiz,
      submissions,
      needsGradingCount,
    }
  }).filter(quiz => quiz.submissions.length > 0);

  const handleSort = (quizId: string) => {
    setSortConfig(prev => {
        const currentDirection = prev[quizId];
        if (currentDirection === 'asc') return { ...prev, [quizId]: 'desc' };
        if (currentDirection === 'desc') {
            const newConfig = { ...prev };
            delete newConfig[quizId];
            return newConfig;
        };
        return { ...prev, [quizId]: 'asc' };
    });
  };

  const getSortedSubmissions = (submissions: StudentSubmission[], quizId: string): StudentSubmission[] => {
    const direction = sortConfig[quizId];
    if (!direction) {
        return submissions;
    }
    return [...submissions].sort((a, b) => {
        if (a.totalScore < b.totalScore) return direction === 'asc' ? -1 : 1;
        if (a.totalScore > b.totalScore) return direction === 'asc' ? 1 : -1;
        const timeA = new Date(a.submissionTime).getTime();
        const timeB = new Date(b.submissionTime).getTime();
        return timeA - timeB;
    });
  };

  const exportToCsv = (quizName: string, submissions: StudentSubmission[], quizId: string) => {
    if (submissions.length === 0) {
        toast({
            title: "No data to export",
            description: "There are no submissions for this quiz.",
            variant: "destructive"
        });
        return;
    }

    const headers = ['Student Name', 'Student ID', 'Score', 'Total Possible Score', 'Date of Attempt'];
    const sortedSubmissions = getSortedSubmissions(submissions, quizId); 

    const csvRows = [
        headers.join(','),
        ...sortedSubmissions.map(sub => [
            `"${sub.studentName}"`,
            `"${sub.studentId}"`,
            sub.totalScore,
            sub.totalPossibleScore,
            `"${format(new Date(sub.submissionTime), 'yyyy-MM-dd HH:mm:ss')}"`,
        ].join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${quizName.replace(/ /g, '_')}_submissions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
        title: "Export Successful",
        description: "Your CSV file has started downloading."
    });
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {quizzesWithSubmissions.map(quiz => (
        <AccordionItem key={quiz.id} value={quiz.id} className="border-b-0">
          <AccordionTrigger className="p-4 bg-card rounded-lg border hover:no-underline [&[data-state=open]]:rounded-b-none">
            <div className='flex justify-between items-center w-full pr-4'>
                <h3 className="font-semibold text-lg">{quiz.name}</h3>
                <div className="flex items-center gap-2">
                  {quiz.needsGradingCount > 0 && (
                      <Badge variant="destructive">{quiz.needsGradingCount} Needs Grading</Badge>
                  )}
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-card p-0 rounded-b-lg border border-t-0">
            <div className="p-4 flex justify-end border-b">
                <Button variant="outline" size="sm" onClick={() => exportToCsv(quiz.name, quiz.submissions, quiz.id)}>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort(quiz.id)} className="w-full justify-end px-2 hover:bg-muted">
                      Score
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getSortedSubmissions(quiz.submissions, quiz.id).map(submission => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.studentName}</TableCell>
                    <TableCell>{format(new Date(submission.submissionTime), 'PPp')}</TableCell>
                    <TableCell>
                      <Badge variant={submission.status === 'Graded' ? 'secondary' : 'destructive'}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{submission.totalScore} / {submission.totalPossibleScore}</TableCell>
                    <TableCell className="text-right">
                       <Link href={`/grading/${submission.id}`} passHref>
                            <Button variant="outline" size="sm">
                                <PenBox className="mr-2 h-4 w-4" />
                                {submission.status === 'Graded' ? 'View' : 'Grade Now'}
                            </Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
      ))}
       {quizzesWithSubmissions.length === 0 && (
        <div className="text-center text-muted-foreground py-16">
            <h3 className="text-lg font-semibold">No Submissions Yet</h3>
            <p className="text-sm">When students submit quizzes, they will appear here for grading.</p>
        </div>
      )}
    </Accordion>
  );
}
