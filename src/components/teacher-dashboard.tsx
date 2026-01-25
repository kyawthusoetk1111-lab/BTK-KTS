'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, BookCopy, Star, Edit, Eye, Library, Code, Crown, Users, ClipboardCheck, TrendingUp, Settings } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { LoadingSpinner } from './loading-spinner';
import { UpgradeModal } from './upgrade-modal';
import { PaymentModal } from './payment-modal';
import { Badge } from '@/components/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher-sidebar';

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

const performanceData = [
  { month: 'Jan', averageScore: 65 },
  { month: 'Feb', averageScore: 72 },
  { month: 'Mar', averageScore: 80 },
  { month: 'Apr', averageScore: 78 },
  { month: 'May', averageScore: 85 },
  { month: 'Jun', averageScore: 90 },
];

const chartConfig = {
  averageScore: {
    label: 'Avg. Score',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export function TeacherDashboard() {
  const { profile, isLoading: isProfileLoading } = useUserWithProfile();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const quizzesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'quizzes'), where('ownerId', '==', user.uid));
  }, [user, firestore]);

  const { data: quizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);

  const isFreeTier = profile?.accountTier === 'free';
  const quizCount = quizzes?.length || 0;
  const freeQuizLimit = 3;
  const hasReachedFreeLimit = isFreeTier && quizCount >= freeQuizLimit;

  const handleCreateQuizClick = (e: React.MouseEvent) => {
    if (hasReachedFreeLimit) {
      e.preventDefault();
      setUpgradeModalOpen(true);
    }
  }

  const handleUpgradeNow = () => {
    setUpgradeModalOpen(false);
    setPaymentModalOpen(true);
  }

  const isLoading = areQuizzesLoading || isProfileLoading;

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <TeacherSidebar />
        <SidebarInset className="bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 text-white">
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold font-headline tracking-tight">ပင်မစာမျက်နှာ</h1>
                <p className="text-gray-300">
                  Welcome back, {profile?.name?.split(' ')[0] || 'Teacher'}! Create, manage, and analyze your quizzes all in one place.
                </p>
              </div>
              <div className="flex items-center gap-4">
                 {isFreeTier && (
                    <Card className="bg-amber-500/20 border-amber-400/50 text-white">
                        <CardHeader className="p-4 flex-row items-center gap-4">
                            <Crown className="h-10 w-10 text-amber-300" />
                            <div>
                              <CardTitle className="text-base text-white">You are on the Free Plan</CardTitle>
                              <CardDescription className="text-amber-200">
                                  You have created {quizCount} of {freeQuizLimit} quizzes.
                              </CardDescription>
                            </div>
                            <Button size="sm" className="ml-auto" variant="premium" onClick={() => setUpgradeModalOpen(true)}>
                                Upgrade
                            </Button>
                        </CardHeader>
                    </Card>
                )}
                 <Link href="/quizzes/new/edit" onClick={handleCreateQuizClick}>
                    <Button size="sm" className="bg-white/90 text-purple-900 hover:bg-white">
                        <FilePlus2 className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">စာမေးပွဲအသစ်ဖန်တီးမည်</span>
                    </Button>
                </Link>
              </div>
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
            ) : (
                <div className="space-y-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">စုစုပေါင်း ဖြေဆိုသူအရေအတွက်</CardTitle>
                                <Users className="h-5 w-5 text-gray-300" style={{filter: 'drop-shadow(0 0 2px #fff)'}}/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">1,250</div>
                                <p className="text-xs text-gray-400">+50 since last week</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">Active Exams</CardTitle>
                                <ClipboardCheck className="h-5 w-5 text-gray-300" style={{filter: 'drop-shadow(0 0 2px #fff)'}}/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">12</div>
                                <p className="text-xs text-gray-400">2 currently live</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">Average Score</CardTitle>
                                <Star className="h-5 w-5 text-gray-300" style={{filter: 'drop-shadow(0 0 2px #fff)'}}/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">82%</div>
                                <p className="text-xs text-gray-400">+3.2% from last month</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white">
                        <CardHeader>
                            <CardTitle>ကျောင်းသားများ၏ တိုးတက်မှု</CardTitle>
                            <CardDescription className="text-gray-300">Average score of all students over the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-72 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis stroke="rgba(255,255,255,0.7)" />
                                        <ChartTooltip cursor={{fill: 'rgba(255,255,255,0.1)'}} content={<ChartTooltipContent indicator="line" labelClassName="text-black dark:text-white" />} />
                                        <Line type="monotone" dataKey="averageScore" stroke="#8884d8" strokeWidth={2} dot={{fill: '#8884d8', r: 5}} activeDot={{ r: 8, fill: '#fff', stroke: '#8884d8' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Quizzes */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">လက်ရှိဖြေဆိုနေသော စာမေးပွဲများ</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {quizzes && quizzes.length > 0 ? quizzes.map((quiz) => {
                                const status = getQuizStatus(quiz);
                                return (
                                    <Card key={quiz.id} className="flex flex-col transition-all hover:shadow-lg bg-white/10 backdrop-blur-md border border-white/20 text-white overflow-hidden hover:border-white/40">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={status.variant}>{status.text}</Badge>
                                            {quiz.examCode && <Badge variant="outline" className="text-gray-300 border-gray-500"><Code className="mr-1 h-3 w-3" />{quiz.examCode}</Badge>}
                                        </div>
                                        <CardTitle className="font-headline text-xl">{quiz.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 text-gray-300">{quiz.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
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
                                    </CardContent>
                                    <CardFooter className="flex gap-2 bg-black/20 p-3">
                                        <Link href={`/quizzes/${quiz.id}/edit`} className="flex-1">
                                        <Button size="sm" variant="outline" className="w-full bg-transparent text-white border-white/40 hover:bg-white/10">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                        </Link>
                                        <Link href={`/quizzes/${quiz.id}/preview`} className="flex-1">
                                        <Button size="sm" variant="secondary" className="w-full bg-white/20 hover:bg-white/30 text-white">
                                            <Eye className="mr-2 h-4 w-4" />
                                            Preview
                                        </Button>
                                        </Link>
                                    </CardFooter>
                                    </Card>
                                )
                            }) : (
                            <div className="col-span-full text-center text-gray-300 py-16 bg-white/5 rounded-lg">
                                <h3 className="text-lg font-semibold">No Quizzes Found</h3>
                                <p className="text-sm">Get started by creating a new quiz.</p>
                                <Link href="/quizzes/new/edit" className='mt-4 inline-block' onClick={handleCreateQuizClick}>
                                <Button className="bg-white/90 text-purple-900 hover:bg-white">
                                    <FilePlus2 className="mr-2 h-4 w-4" />
                                    စာမေးပွဲအသစ်ဖန်တီးမည်
                                </Button>
                                </Link>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <UpgradeModal 
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          onUpgrade={handleUpgradeNow}
      />
      <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          itemId="pro-upgrade"
          itemDescription="QuizCraft Pro Subscription"
          amount={5000}
      />
    </>
  );
}
