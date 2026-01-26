'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockLeaderboard } from '@/lib/data';
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
  const { purchases } = usePurchases();

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

  const filteredQuizzes = (allQuizzes || []).filter(quiz => {
    const status = getQuizStatus(quiz);
    const subjectMatch = selectedSubject === 'all' || quiz.subject === selectedSubject;
    const codeMatch = !searchCode || (quiz.examCode && quiz.examCode.toLowerCase().includes(searchCode.toLowerCase()));
    
    // Only show live quizzes to students
    return status.variant === 'live' && subjectMatch && codeMatch;
  });

  const isLoading = areQuizzesLoading || isProfileLoading || arePendingPaymentsLoading;

  const hasPurchased = (quizId: string) => purchases.some(p => p.itemId === quizId);
  const isPending = (quizId: string) => pendingPayments?.some(p => p.itemId === quizId);

  return (
    <>
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
      <header className="sticky top-0 z-10 bg-black/20 backdrop-blur-lg border-b border-emerald-500/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-white">
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
            <p className="text-gray-300">
              Ready for a new challenge? Select a quiz to start.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="quizzes">
            <TabsList className="grid w-full grid-cols-3 md:w-[600px] mb-6 bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-gray-300">
                <TabsTrigger value="quizzes" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-white">သင်ခန်းစာများ</TabsTrigger>
                <TabsTrigger value="grades" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-white">ရမှတ်များနှင့် ဆုတံဆိပ်များ</TabsTrigger>
                <TabsTrigger value="leaderboards" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-white">Leaderboards</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes">
                <div className="flex flex-col md:flex-row gap-4 justify-end mb-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search by exam code..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="pl-9 bg-emerald-900/20 border-emerald-500/30 placeholder:text-gray-400 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="bg-emerald-900/20 border-emerald-500/30 focus:ring-emerald-500">
                                <SelectValue placeholder="Filter by subject..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white border-slate-700">
                                <SelectItem value="all" className="focus:bg-slate-700">All Subjects</SelectItem>
                                {subjects.map(subject => (
                                    <SelectItem key={subject} value={subject} className="focus:bg-slate-700">{subject}</SelectItem>
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
                      const locked = isPremium && !purchased && !pending;

                        return (
                        <Card key={quiz.id} className="flex flex-col transition-all duration-300 hover:shadow-lg bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white overflow-hidden hover:border-emerald-400/60 hover:shadow-emerald-500/20" style={{ animation: `fade-in-up 0.5s ease-out ${index * 100}ms forwards`, opacity: 0 }}>
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="secondary" className="bg-black/30 text-gray-300">{quiz.subject || 'General'}</Badge>
                               {getQuizStatus(quiz).variant === 'live' && <Badge variant="live">Live</Badge>}
                            </div>
                            <CardTitle className="font-headline text-xl">{quiz.name}</CardTitle>
                            <CardDescription className="line-clamp-2 text-gray-300">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                            <div className="flex justify-between text-sm text-gray-300">
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
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Clock className="h-4 w-4" />
                                    <span>{quiz.timerInMinutes} minute timer</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex gap-2 bg-black/30 p-3">
                            {locked ? (
                              <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold" onClick={() => setPaymentModalState({ isOpen: true, quiz: quiz })}>
                                <Lock className="mr-2 h-4 w-4" />
                                Buy Now ({quiz.price} Ks)
                              </Button>
                            ) : pending ? (
                               <Button size="sm" className="w-full font-bold" disabled>
                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                Pending Approval
                              </Button>
                            ) : (
                               <Link href={`/quizzes/${quiz.id}/take`} className="flex-1">
                                <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold">
                                    <Play className="mr-2 h-4 w-4" />
                                    စာမေးပွဲစတင်မည်
                                </Button>
                            </Link>
                            )}
                        </CardFooter>
                        </Card>
                    )}) : (
                      <div className="col-span-full text-center text-gray-300 py-16">
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
                <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                    <CardHeader>
                        <CardTitle>Leaderboards</CardTitle>
                        <CardDescription className="text-gray-300">See how you stack up against your peers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="w-full md:w-64">
                            <Select value={selectedLeaderboardSubject} onValueChange={setSelectedLeaderboardSubject}>
                                <SelectTrigger className="bg-emerald-900/20 border-emerald-500/30 focus:ring-emerald-500">
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 text-white border-slate-700">
                                    {subjects.map(subject => (
                                        <SelectItem key={subject} value={subject} className="focus:bg-slate-700">{subject}</SelectItem>
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
