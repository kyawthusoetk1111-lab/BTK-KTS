'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCopy, Star, Play, Eye, Clock, Search, Activity, Lock } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { AuthButton } from '@/components/auth-button';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { subjects } from '@/lib/subjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { MyGrades } from './my-grades';
import { MyBadges } from './my-badges';
import { Leaderboard } from './leaderboard';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { LoadingSpinner } from './loading-spinner';
import { usePurchases } from '@/hooks/use-purchases';
import { PaymentModal } from './payment-modal';
import { mockLeaderboard } from '@/lib/data';

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

const getQuizStatus = (quiz: Quiz): { text: 'Live' | 'Draft' | 'Closed'; variant: 'live' | 'draft' | 'closed' } => {
    const now = new Date();
    const start = quiz.startDate ? new Date(quiz.startDate) : null;
    const end = quiz.endDate ? new Date(quiz.endDate) : null;

    if (!start && !end) {
        return { text: 'Draft', variant: 'draft' };
    }
    if (start && now < start) {
        return { text: 'Draft', variant: 'draft' }; // Scheduled
    }
    if (end && now > end) {
        return { text: 'Closed', variant: 'closed' };
    }
    if (start && now >= start && (!end || now < end)) {
        return { text: 'Live', variant: 'live' };
    }

    return { text: 'Draft', variant: 'draft' }; // Fallback
};

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchCode, setSearchCode] = useState<string>('');
  const { profile, isLoading: isProfileLoading } = useUserWithProfile();
  const [selectedLeaderboardSubject, setSelectedLeaderboardSubject] = useState<string>(subjects[0]);
  const firestore = useFirestore();

  const [paymentModalState, setPaymentModalState] = useState<{isOpen: boolean, quiz?: Quiz}>({isOpen: false});
  const { purchases, isLoading: arePurchasesLoading } = usePurchases();

  const quizzesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'quizzes'));
  }, [firestore]);

  const { data: allQuizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);
  
  const pendingPaymentsQuery = useMemoFirebase(() => {
    if (!firestore || !profile?.id) return null;
    return query(collection(firestore, 'payments'), where('userId', '==', profile.id), where('status', '==', 'pending'));
  }, [firestore, profile?.id]);

  const { data: pendingPayments, isLoading: arePendingPaymentsLoading } = useCollection(pendingPaymentsQuery);

  const filteredQuizzes = useMemo(() => {
    if (!allQuizzes) return [];
    
    console.log("Total Quizzes found:", allQuizzes.length);

    return allQuizzes.filter(quiz => {
        const subjectMatch = selectedSubject === 'all' || quiz.subject === selectedSubject;
        const codeMatch = !searchCode || (quiz.examCode && quiz.examCode.toLowerCase().includes(searchCode.toLowerCase()));
        
        const status = getQuizStatus(quiz);
        return subjectMatch && codeMatch && status.text === 'Live';
    });
  }, [allQuizzes, selectedSubject, searchCode]);

  const isLoading = areQuizzesLoading || isProfileLoading || arePendingPaymentsLoading || arePurchasesLoading;

  const hasPurchased = (quizId: string) => purchases.some(p => p.itemId === quizId);
  const isPending = (quizId: string) => pendingPayments?.some(p => p.itemId === quizId);

  return (
    <>
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-200">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-primary">
              <Activity />
              BTK Education
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold font-headline tracking-tight">မင်္ဂလာပါ {profile?.name?.split(' ')[0] || 'Student'}!</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Ready for a new challenge? Select a quiz to start.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="quizzes">
            <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-6 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <TabsTrigger value="quizzes" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-primary">သင်ခန်းစာများ</TabsTrigger>
                <TabsTrigger value="grades" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-primary">ရမှတ်များနှင့် ဆုတံဆိပ်များ</TabsTrigger>
                <TabsTrigger value="leaderboards" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-primary">Leaderboards</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes">
                <div className="flex flex-col md:flex-row gap-4 justify-end mb-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search by exam code..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="pl-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 placeholder:text-slate-400 focus:ring-primary"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 focus:ring-primary">
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
                 {isLoading ? (
                   <div className="flex justify-center items-center h-64">
                     <LoadingSpinner />
                   </div>
                 ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredQuizzes && filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz, index) => {
                      const isPremium = (quiz.price ?? 0) > 0;
                      const purchased = hasPurchased(quiz.id);
                      const pending = isPending(quiz.id);
                      const locked = isPremium && !purchased;
                      const status = getQuizStatus(quiz);

                        return (
                        <Card key={quiz.id} className="flex flex-col transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-primary/40 hover:shadow-primary/20">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="secondary">{quiz.subject || 'General'}</Badge>
                               <Badge variant={status.variant}>{status.text}</Badge>
                            </div>
                            <CardTitle className="font-headline text-xl">{quiz.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
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
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                    <Clock className="h-4 w-4" />
                                    <span>{quiz.timerInMinutes} minute timer</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2 bg-slate-50 dark:bg-slate-800/50 p-3">
                            {locked && !pending ? (
                              <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" onClick={() => setPaymentModalState({ isOpen: true, quiz: quiz })}>
                                <Lock className="mr-2 h-4 w-4" />
                                Buy Now ({quiz.price} Ks)
                              </Button>
                            ) : locked && pending ? (
                               <Button size="sm" className="w-full font-bold" disabled>
                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                Pending Approval
                              </Button>
                            ) : (
                               <Link href={`/quizzes/${quiz.id}/take`} className="flex-1">
                                <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold" disabled={status.text !== 'Live'}>
                                    {status.text === 'Live' ? <><Play className="mr-2 h-4 w-4" /> စာမေးပွဲစတင်မည်</> : status.text}
                                </Button>
                            </Link>
                            )}
                        </CardFooter>
                        </Card>
                    )}) : (
                      <div className="col-span-full text-center text-slate-500 dark:text-slate-400 py-16">
                        <h3 className="text-lg font-semibold">စာမေးပွဲများ မရှိသေးပါ</h3>
                        <p className="text-sm">လက်ရှိဖြေဆိုရန် စာမေးပွဲများ မရှိပါ။</p>
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
                <Card className="bg-white dark:bg-slate-900">
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
    {paymentModalState.quiz && (
        <PaymentModal 
            isOpen={paymentModalState.isOpen}
            onClose={() => setPaymentModalState({ isOpen: false, quiz: undefined })}
            itemId={paymentModalState.quiz.id}
            itemDescription={paymentModalState.quiz.name}
            amount={paymentModalState.quiz.price || 0}
        />
    )}
    </>
  );
}
