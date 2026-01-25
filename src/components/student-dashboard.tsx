'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockLeaderboard } from '@/lib/data';
import { BookCopy, Star, Play, Eye, Clock, CheckCircle, Search, Activity, FilePlus2 } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { AuthButton } from '@/components/auth-button';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { subjects } from '@/lib/subjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { MyGrades } from './my-grades';
import { MyBadges } from './my-badges';
import { Leaderboard } from './leaderboard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy } from 'firebase/firestore';
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

// NOTE: This is now using mock data for quizzes.
// We can connect this to Firestore in a future step.
const hasAttempted = (quizId: string) => {
  // In a real app, you would check against the fetched user's results.
  return false;
};

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchCode, setSearchCode] = useState<string>('');
  const { profile, isLoading: isProfileLoading } = useUserWithProfile();
  const [selectedLeaderboardSubject, setSelectedLeaderboardSubject] = useState<string>(subjects[0]);
  const firestore = useFirestore();

  const quizzesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'quizzes'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allQuizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);

  const filteredQuizzes = (allQuizzes || []).filter(quiz => {
    const subjectMatch = selectedSubject === 'all' || quiz.subject === selectedSubject;
    const codeMatch = !searchCode || (quiz.examCode && quiz.examCode.toLowerCase().includes(searchCode.toLowerCase()));
    return subjectMatch && codeMatch;
  });

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
            <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-6">
                <TabsTrigger value="quizzes">Available Quizzes</TabsTrigger>
                <TabsTrigger value="grades">My Grades & Badges</TabsTrigger>
                <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes">
                <div className="flex flex-col md:flex-row gap-4 justify-end mb-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by exam code..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="pl-9"
                        />
                    </div>
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
                    {filteredQuizzes && filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => {
                        const attempted = hasAttempted(quiz.id);
                        return (
                        <Card key={quiz.id} className="flex flex-col transition-all hover:shadow-lg border-transparent hover:border-primary/50">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                              {quiz.subject && <Badge variant="secondary">{quiz.subject}</Badge>}
                            </div>
                            <CardTitle className="font-headline text-xl">{quiz.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
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
                            {quiz.timerInMinutes && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{quiz.timerInMinutes} minute timer</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2 bg-muted/50 p-3 rounded-b-lg">
                            {attempted ? (
                                <Button size="sm" className="w-full flex-1" disabled>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Attempted
                                </Button>
                            ) : (
                                <Link href={`/quizzes/${quiz.id}/take`} className="flex-1">
                                    <Button size="sm" className="w-full">
                                        <Play className="mr-2 h-4 w-4" />
                                        Start Attempt
                                    </Button>
                                </Link>
                            )}
                            <Link href={`/quizzes/${quiz.id}/preview`} className="flex-1">
                              <Button size="sm" variant="secondary" className="w-full">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                              </Button>
                            </Link>
                        </CardFooter>
                        </Card>
                    )}) : (
                      <div className="col-span-full text-center text-muted-foreground py-16">
                        <h3 className="text-lg font-semibold">No Quizzes Available</h3>
                        <p className="text-sm">Check back later or search by exam code to find a specific quiz.</p>
                      </div>
                    )}
                    </div>
                )}
            </TabsContent>
            <TabsContent value="grades">
                <div className="space-y-6">
                    <MyGrades />
                    <MyBadges />
                </div>
            </TabsContent>
            <TabsContent value="leaderboards">
                <Card>
                    <CardHeader>
                        <CardTitle>Leaderboards</CardTitle>
                        <CardDescription>See how you stack up against your peers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="w-full md:w-64">
                            <Select value={selectedLeaderboardSubject} onValueChange={setSelectedLeaderboardSubject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(subject => (
                                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Leaderboard entries={mockLeaderboard[selectedLeaderboardSubject] || []} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
