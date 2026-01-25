'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockQuizzes } from '@/lib/data';
import { BookCopy, Star, Play, Eye } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { AuthButton } from '@/components/auth-button';
import { subjects } from '@/lib/subjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

function calculateTotalPoints(quiz: Quiz) {
  return quiz.sections.reduce((total, section) => {
    return total + section.questions.reduce((sectionTotal, question) => {
      return sectionTotal + question.points;
    }, 0);
  }, 0);
}

function countQuestions(quiz: Quiz) {
  return quiz.sections.reduce((total, section) => {
    return total + section.questions.length;
  }, 0);
}

const mockResults = [
    { quizName: 'General Knowledge Challenge', date: '2024-05-20', score: '8/10', grade: 'A' },
    { quizName: 'Advanced Mathematics', date: '2024-05-18', score: '18/25', grade: 'B*' },
];

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredQuizzes = selectedSubject === 'all'
    ? mockQuizzes
    : mockQuizzes.filter(quiz => quiz.subject === selectedSubject);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold font-headline text-primary">
              QuizCraft Pro
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight">Student Dashboard</h2>
            <p className="text-muted-foreground">
              Take quizzes, view your grades, and track your progress.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="quizzes">
            <TabsList className="mb-4">
                <TabsTrigger value="quizzes">Available Quizzes</TabsTrigger>
                <TabsTrigger value="grades">My Grades</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes">
                <div className="flex justify-end mb-4">
                    <div className="w-full md:w-64">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by subject..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map(subject => (
                                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="flex flex-col transition-all hover:shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                        <CardTitle className="font-headline">{quiz.name}</CardTitle>
                        {quiz.subject && <Badge variant="outline">{quiz.subject}</Badge>}
                        </div>
                        <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <BookCopy className="mr-2 h-4 w-4" />
                            <span>{countQuestions(quiz)} Questions</span>
                        </div>
                        <div className="flex items-center">
                            <Star className="mr-2 h-4 w-4" />
                            <span>{calculateTotalPoints(quiz)} Points</span>
                        </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Link href={`/quizzes/${quiz.id}/take`} className="flex-1">
                        <Button size="sm" className="w-full">
                            <Play className="mr-2 h-4 w-4" />
                            Take Quiz
                        </Button>
                        </Link>
                        <Link href={`/quizzes/${quiz.id}/preview`} className="flex-1">
                        <Button size="sm" variant="secondary" className="w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                        </Link>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            </TabsContent>
            <TabsContent value="grades">
                 <Card>
                    <CardHeader>
                        <CardTitle>My Grades</CardTitle>
                        <CardDescription>Here are the results from your recent quiz attempts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>Quiz</TableHead>
                                <TableHead>Date Taken</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mockResults.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{result.quizName}</TableCell>
                                        <TableCell>{result.date}</TableCell>
                                        <TableCell>{result.score}</TableCell>
                                        <TableCell className="font-bold">{result.grade}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
