'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockLeaderboard } from '@/lib/data';
import { BookCopy, Star, Play, Eye, Clock, Search, Activity, ShoppingCart } from 'lucide-react';
import type { Quiz, Purchase } from '@/lib/types';
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
import { collection, query } from 'firebase/firestore';
import { LoadingSpinner } from './loading-spinner';
import { usePurchases } from '@/hooks/use-purchases';
import { PaymentModal } from './payment-modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { format } from 'date-fns';

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

function MyPurchases({ purchases, isLoading }: { purchases: Purchase[], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
            </div>
        );
    }

    if (purchases.length === 0) {
        return (
            <div className="text-center text-gray-300 py-16">
                <h3 className="text-lg font-semibold">No Purchases Yet</h3>
                <p className="text-sm">Your purchased quizzes and subscriptions will appear here.</p>
            </div>
        );
    }

    return (
        <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
            <CardHeader>
                <CardTitle>My Purchases</CardTitle>
                <CardDescription className="text-gray-300">A history of your purchased content.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/20 hover:bg-white/10">
                            <TableHead className="text-gray-200">Item</TableHead>
                            <TableHead className="text-gray-200">Type</TableHead>
                            <TableHead className="text-gray-200">Amount</TableHead>
                            <TableHead className="text-gray-200">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {purchases.map(p => (
                            <TableRow key={p.id} className="border-white/20 hover:bg-white/10">
                                <TableCell className="font-medium">{p.itemDescription}</TableCell>
                                <TableCell className="capitalize">{p.itemType}</TableCell>
                                <TableCell>{p.amountPaid.toLocaleString()} MMK</TableCell>
                                <TableCell>{format(new Date(p.purchaseDate), 'PP')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchCode, setSearchCode] = useState<string>('');
  const { profile, isLoading: isProfileLoading } = useUserWithProfile();
  const [selectedLeaderboardSubject, setSelectedLeaderboardSubject] = useState<string>(subjects[0]);
  const firestore = useFirestore();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedQuizForPayment, setSelectedQuizForPayment] = useState<Quiz | null>(null);

  const { purchases, isLoading: arePurchasesLoading } = usePurchases();

  const quizzesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'quizzes'));
  }, [firestore]);

  const { data: allQuizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);

  const filteredQuizzes = (allQuizzes || []).filter(quiz => {
    const subjectMatch = selectedSubject === 'all' || quiz.subject === selectedSubject;
    const codeMatch = !searchCode || (quiz.examCode && quiz.examCode.toLowerCase().includes(searchCode.toLowerCase()));
    return subjectMatch && codeMatch;
  });

  const handleBuyNow = (quiz: Quiz) => {
    setSelectedQuizForPayment(quiz);
    setPaymentModalOpen(true);
  };

  const isLoading = areQuizzesLoading || isProfileLoading || arePurchasesLoading;

  return (
    <>
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 text-white">
      <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-white">
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
            <h2 className="text-3xl font-bold font-headline tracking-tight">မင်္ဂလာပါ {profile?.name?.split(' ')[0] || 'Student'}!</h2>
            <p className="text-gray-300">
              Ready for a new challenge? Select a quiz to start.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="quizzes">
            <TabsList className="grid w-full grid-cols-4 md:w-[800px] mb-6 bg-white/10 text-gray-300">
                <TabsTrigger value="quizzes" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">သင်ခန်းစာများ</TabsTrigger>
                <TabsTrigger value="grades" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">ရမှတ်များနှင့် ဆုတံဆိပ်များ</TabsTrigger>
                <TabsTrigger value="purchases" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">My Purchases</TabsTrigger>
                <TabsTrigger value="leaderboards" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">Leaderboards</TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes">
                <div className="flex flex-col md:flex-row gap-4 justify-end mb-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search by exam code..."
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            className="pl-9 bg-white/10 border-white/20 placeholder:text-gray-400"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="bg-white/10 border-white/20">
                                <SelectValue placeholder="Filter by subject..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 text-white border-slate-700">
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
                    {filteredQuizzes && filteredQuizzes.length > 0 ? filteredQuizzes.map((quiz) => {
                        const hasQuizAccess = !quiz.isPremium || purchases.some(p => p.itemId === quiz.id);

                        return (
                        <Card key={quiz.id} className="flex flex-col transition-all hover:shadow-lg bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-hidden">
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                              {quiz.subject && <Badge variant="secondary" className="bg-white/20 text-white">{quiz.subject}</Badge>}
                               {quiz.isPremium && <Badge variant="premium"><Star className="mr-1 h-3 w-3" />Premium</Badge>}
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
                        <CardFooter className="flex gap-2 bg-black/20 p-3">
                            {hasQuizAccess ? (
                                 <Link href={`/quizzes/${quiz.id}/take`} className="flex-1">
                                    <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white">
                                        <Play className="mr-2 h-4 w-4" />
                                        စာမေးပွဲစတင်မည်
                                    </Button>
                                </Link>
                            ) : (
                                <Button size="sm" className="w-full bg-sky-500 hover:bg-sky-600 text-white" onClick={() => handleBuyNow(quiz)}>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Buy Now ({quiz.price?.toLocaleString()} MMK)
                                </Button>
                            )}
                            <Link href={`/quizzes/${quiz.id}/preview`} className="flex-1">
                              <Button size="sm" variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white">
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                              </Button>
                            </Link>
                        </CardFooter>
                        </Card>
                    )}) : (
                      <div className="col-span-full text-center text-gray-300 py-16">
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
            <TabsContent value="purchases">
                <MyPurchases purchases={purchases} isLoading={arePurchasesLoading} />
            </TabsContent>
            <TabsContent value="leaderboards">
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                    <CardHeader>
                        <CardTitle>Leaderboards</CardTitle>
                        <CardDescription className="text-gray-300">See how you stack up against your peers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="w-full md:w-64">
                            <Select value={selectedLeaderboardSubject} onValueChange={setSelectedLeaderboardSubject}>
                                <SelectTrigger className="bg-white/10 border-white/20">
                                    <SelectValue placeholder="Select a subject..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 text-white border-slate-700">
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
    {selectedQuizForPayment && (
        <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            itemId={selectedQuizForPayment.id}
            itemDescription={`Quiz: ${selectedQuizForPayment.name}`}
            amount={selectedQuizForPayment.price || 0}
        />
    )}
    </>
  );
}
