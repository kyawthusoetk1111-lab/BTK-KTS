'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, BookCopy, Star, Edit, Eye, Library, Code, Users, ClipboardCheck, Trash2, Archive } from 'lucide-react';
import type { Quiz, Question } from '@/lib/types';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { useCollection, useFirestore, useUser, useMemoFirebase, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { LoadingSpinner } from './loading-spinner';
import { Badge } from '@/components/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher-sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

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
  const { toast } = useToast();
  
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const quizzesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'quizzes'), where('ownerId', '==', user.uid));
  }, [user, firestore]);

  const { data: quizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);

  const handleDeleteConfirm = () => {
    if (!quizToDelete || !firestore) return;

    const quizRef = doc(firestore, 'quizzes', quizToDelete.id);
    deleteDocumentNonBlocking(quizRef);

    toast({
      title: "Success",
      description: "စာမေးပွဲကို အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ။"
    });

    setQuizToDelete(null);
  };
  
  const handleAddToBank = (quiz: Quiz) => {
    if (!firestore || !user) {
        toast({ title: "Error", description: "Could not add to bank. Please try again.", variant: "destructive"});
        return;
    }

    let questionCount = 0;
    quiz.sections.forEach(section => {
        section.questions.forEach(question => {
            const bankQuestion: Question = {
                ...question,
                id: question.id, // Use original ID to prevent duplicates on re-add
                ownerId: user.uid,
                subject: quiz.subject || 'General',
                difficulty: 'Medium', // Default difficulty
                sourceQuizId: quiz.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const docRef = doc(firestore, 'quizBank', bankQuestion.id);
            setDocumentNonBlocking(docRef, bankQuestion, { merge: true });
            questionCount++;
        });
    });

    if (questionCount > 0) {
        toast({
            title: "Added to Bank!",
            description: `${questionCount} questions from "${quiz.name}" have been added to your question bank.`
        });
    } else {
        toast({
            title: "No questions found",
            description: `"${quiz.name}" has no questions to add to the bank.`,
            variant: "destructive"
        });
    }
  }

  const isLoading = areQuizzesLoading || isProfileLoading;

  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <TeacherSidebar />
        <SidebarInset className="bg-slate-50">
          <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold font-headline tracking-tight">ပင်မစာမျက်နှာ</h1>
                <p className="text-muted-foreground">
                  Welcome back, {profile?.name?.split(' ')[0] || 'Teacher'}! Create, manage, and analyze your quizzes all in one place.
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <Link href="/quizzes/new/edit">
                    <Button size="sm" className="font-bold">
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
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">စုစုပေါင်း ဖြေဆိုသူအရေအတွက်</CardTitle>
                                <Users className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">1,250</div>
                                <p className="text-xs text-muted-foreground">+50 since last week</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                                <ClipboardCheck className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">2 currently live</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                <Star className="h-5 w-5 text-muted-foreground"/>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold">82%</div>
                                <p className="text-xs text-muted-foreground">+3.2% from last month</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>ကျောင်းသားများ၏ တိုးတက်မှု</CardTitle>
                            <CardDescription>Average score of all students over the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-72 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={performanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <ChartTooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent indicator="line" />} />
                                        <Line type="monotone" dataKey="averageScore" stroke="hsl(var(--primary))" strokeWidth={2} dot={{fill: 'hsl(var(--primary))', r: 5}} activeDot={{ r: 8, fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Quizzes */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold font-headline">လက်ရှိဖြေဆိုနေသော စာမေးပွဲများ</h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {quizzes && quizzes.length > 0 ? quizzes.map((quiz, index) => {
                                const status = getQuizStatus(quiz);
                                return (
                                    <Card key={quiz.id} className="flex flex-col transition-all duration-300 hover:shadow-lg overflow-hidden" style={{ animation: `fade-in-up 0.5s ease-out ${index * 100}ms forwards`, opacity: 0 }}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant={status.variant}>{status.text}</Badge>
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
                                    <CardFooter className="flex items-center gap-2 bg-slate-50 p-3">
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
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                     <Button 
                                                        size="icon" 
                                                        variant="outline" 
                                                        className="flex-shrink-0"
                                                        onClick={() => handleAddToBank(quiz)}
                                                    >
                                                        <Archive className="h-4 w-4" />
                                                        <span className="sr-only">Add to Bank</span>
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>မေးခွန်းဘဏ်သို့ထည့်ရန်</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                        <Button 
                                            size="icon" 
                                            variant="destructive" 
                                            className="flex-shrink-0"
                                            onClick={() => setQuizToDelete(quiz)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Delete Quiz</span>
                                        </Button>
                                    </CardFooter>
                                    </Card>
                                )
                            }) : (
                            <div className="col-span-full text-center text-muted-foreground py-16 bg-slate-100/50 rounded-lg">
                                <h3 className="text-lg font-semibold">No Quizzes Found</h3>
                                <p className="text-sm">Get started by creating a new quiz.</p>
                                <Link href="/quizzes/new/edit" className='mt-4 inline-block'>
                                <Button className="font-bold">
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
       <AlertDialog open={!!quizToDelete} onOpenChange={(isOpen) => !isOpen && setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ဒီစာမေးပွဲကို ဖျက်ရန် သေချာပါသလား?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz {'"'}
              {quizToDelete?.name}
              {'"'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className={buttonVariants({ variant: "destructive" })}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
