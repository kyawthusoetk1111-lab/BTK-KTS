'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockQuizzes } from '@/lib/data';
import { BookCopy, Star, Play, Eye, Award, ClipboardCheck, Calendar, Activity } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { AuthButton } from '@/components/auth-button';
import { subjects } from '@/lib/subjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';

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
    { id: 'res-1', quizName: 'General Knowledge Challenge', date: '2024-05-20', score: '8/10', grade: 'A' },
    { id: 'res-2', quizName: 'Advanced Mathematics', date: '2024-05-18', score: '18/25', grade: 'B*' },
    { id: 'res-3', quizName: 'Science Basics', date: '2024-05-15', score: '5/15', grade: 'D' },
];

const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400 border-emerald-500/50';
    if (grade.includes('B')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400 border-blue-500/50';
    if (grade.includes('C')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400 border-orange-500/50';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400 border-red-500/50';
}

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const { profile } = useUserWithProfile();

  const filteredQuizzes = selectedSubject === 'all'
    ? mockQuizzes
    : mockQuizzes.filter(quiz => quiz.subject === selectedSubject);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-primary">
              <Activity />
              QuizCraft Pro
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight">Welcome back, {profile?.name?.split(' ')[0] || 'Student'}!</h2>
            <p className="text-muted-foreground">
              Ready for a new challenge? Select a quiz to start.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="quizzes">
            <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-6">
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
                    <Card key={quiz.id} className="flex flex-col transition-all hover:shadow-lg border-transparent hover:border-primary/50">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          {quiz.subject && <Badge variant="secondary">{quiz.subject}</Badge>}
                        </div>
                        <CardTitle className="font-headline text-xl">{quiz.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                              <BookCopy className="h-4 w-4" />
                              <span>{countQuestions(quiz)} Questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              <span>{calculateTotalPoints(quiz)} Points</span>
                          </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 bg-muted/50 p-3 rounded-b-lg">
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
                      <div className="grid gap-4 md:grid-cols-2">
                        {mockResults.map((result) => (
                          <Card key={result.id} className="flex flex-col">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                              <CardTitle className="text-base font-medium">{result.quizName}</CardTitle>
                              <Badge variant="outline" className={getGradeColor(result.grade)}>
                                <Award className="mr-1 h-3 w-3"/>{result.grade}
                              </Badge>
                            </CardHeader>
                            <CardContent className="flex-grow flex justify-between items-center text-sm text-muted-foreground pt-2">
                              <div className="flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4" />
                                <span>Score: {result.score}</span>
                              </div>
                               <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{result.date}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
