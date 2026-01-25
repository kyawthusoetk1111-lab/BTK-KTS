'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, BookCopy, Star, Edit, Eye, Library, Activity, Code } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { AuthButton } from '@/components/auth-button';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { subjects } from '@/lib/subjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { StudentAnalytics } from './student-analytics';
import { GradingDashboard } from './grading-dashboard';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { LoadingSpinner } from './loading-spinner';

function calculateTotalPoints(quiz: Quiz) {
  return quiz.sections.reduce((total, section) => {
    return total + section.questions.reduce((sectionTotal, question) => {
      return sectionTotal + (question.points || 0);
    }, 0);
  }, 0);
}

function countQuestions(quiz: Quiz) {
  return quiz.sections.reduce((total, section) => {
    return total + section.questions.length;
  }, 0);
}

export function TeacherDashboard() {
  const { profile, isLoading: isProfileLoading } = useUserWithProfile();
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const quizzesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'quizzes'), where('ownerId', '==', user.uid));
  }, [user, firestore]);

  const { data: quizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);

  const filteredQuizzes = selectedSubject === 'all'
    ? quizzes
    : quizzes?.filter(quiz => quiz.subject === selectedSubject);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-primary">
              <Activity />
              QuizCraft Pro
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/question-bank">
                <Button variant="outline" size="sm">
                  <Library className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Question Bank</span>
                </Button>
              </Link>
              <Link href="/quizzes/new/edit">
                <Button size="sm">
                  <FilePlus2 className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Create Quiz</span>
                </Button>
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight">Welcome, {profile?.name?.split(' ')[0] || 'Teacher'}!</h2>
            <p className="text-muted-foreground">
              Create, manage, and analyze your quizzes all in one place.
            </p>
          </div>
        </div>

        <Tabs defaultValue="quizzes">
            <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-6">
                <TabsTrigger value="quizzes">My Quizzes</TabsTrigger>
                <TabsTrigger value="grading">Grading</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                 {areQuizzesLoading || isProfileLoading ? (
                   <div className="flex justify-center items-center h-64">
                     <LoadingSpinner />
                   </div>
                 ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredQuizzes && filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => (
                      <Card key={quiz.id} className="flex flex-col transition-all hover:shadow-lg border-transparent hover:border-primary/50">
                      <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                           {quiz.subject && <Badge variant="secondary">{quiz.subject}</Badge>}
                           {quiz.examCode && <Badge variant="outline"><Code className="mr-1 h-3 w-3" />{quiz.examCode}</Badge>}
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
                          <Link href={`/quizzes/${quiz.id}/edit`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
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
                  )) : (
                    <div className="col-span-full text-center text-muted-foreground py-16">
                      <h3 className="text-lg font-semibold">No Quizzes Found</h3>
                      <p className="text-sm">Get started by creating a new quiz.</p>
                      <Link href="/quizzes/new/edit" className='mt-4 inline-block'>
                        <Button>
                          <FilePlus2 className="mr-2 h-4 w-4" />
                          Create Quiz
                        </Button>
                      </Link>
                    </div>
                  )}
                  </div>
                 )}
            </TabsContent>
            <TabsContent value="grading">
                <GradingDashboard />
            </TabsContent>
            <TabsContent value="analytics">
                <StudentAnalytics />
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
