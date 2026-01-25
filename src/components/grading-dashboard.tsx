'use client';

import { mockQuizzes, mockSubmissions } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';
import { PenBox } from 'lucide-react';
import type { StudentSubmission } from '@/lib/types';

export function GradingDashboard() {

  const quizzesWithSubmissions = mockQuizzes.map(quiz => {
    const submissions = mockSubmissions.filter(sub => sub.quizId === quiz.id);
    const needsGradingCount = submissions.filter(sub => sub.status === 'Needs Grading').length;
    return {
      ...quiz,
      submissions,
      needsGradingCount,
    }
  }).filter(quiz => quiz.submissions.length > 0);

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {quizzesWithSubmissions.map(quiz => (
        <AccordionItem key={quiz.id} value={quiz.id} className="border-b-0">
          <AccordionTrigger className="p-4 bg-card rounded-lg border hover:no-underline [&[data-state=open]]:rounded-b-none">
            <div className='flex justify-between items-center w-full pr-4'>
                <h3 className="font-semibold text-lg">{quiz.name}</h3>
                {quiz.needsGradingCount > 0 && (
                    <Badge variant="destructive">{quiz.needsGradingCount} Needs Grading</Badge>
                )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-card p-0 rounded-b-lg border border-t-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="w-[120px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quiz.submissions.map(submission => (
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
