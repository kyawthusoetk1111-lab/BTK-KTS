'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { Question } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2, FileOutput, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { subjects } from '@/lib/subjects';
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
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollection, useFirestore, useMemoFirebase, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query } from 'firebase/firestore';
import { LoadingSpinner } from '@/components/loading-spinner';
import { QuizBankEditor } from '@/components/quiz-bank-editor';

export default function QuestionBankPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);

    const bankQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'quizBank'));
    }, [firestore]);

    const { data: allQuestions, isLoading } = useCollection<Question>(bankQuery);
    
    const filteredQuestions = (allQuestions || []).filter(q => {
        const searchMatch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
        const subjectMatch = selectedSubject === 'all' || q.subject === selectedSubject;
        return searchMatch && subjectMatch;
    });

    const handleExport = () => {
        toast({ title: 'Coming Soon!', description: 'Exporting questions will be available in a future update.' });
    };

    const handleDelete = () => {
        if (!questionToDelete || !firestore) return;
        const docRef = doc(firestore, 'quizBank', questionToDelete.id);
        deleteDocumentNonBlocking(docRef);
        toast({ title: 'Question Deleted', description: 'The question has been removed from the bank.', variant: 'destructive'});
        setQuestionToDelete(null);
    }
    
    const handleSave = (updatedQuestion: Question) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'quizBank', updatedQuestion.id);
        updateDocumentNonBlocking(docRef, updatedQuestion);
    }

    return (
        <>
            <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">မေးခွန်းဘဏ် စီမံခန့်ခွဲမှု</h1>
                        <p className="text-muted-foreground">
                            Browse, manage, and reuse questions from all your quizzes.
                        </p>
                    </div>
                </div>
                
                <Card>
                    <CardHeader>
                        <div className="flex flex-col md:flex-row gap-4 justify-between">
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search for questions..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by subject..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Subjects</SelectItem>
                                        {subjects.filter(s => s !== 'Global').map(subject => (
                                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                             <div className="col-span-full text-center py-12 text-muted-foreground">
                                <LoadingSpinner />
                                <p className="mt-2">Loading questions...</p>
                            </div>
                        ) : filteredQuestions.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredQuestions.map(q => (
                                    <Card key={q.id} className="flex flex-col">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base font-medium line-clamp-3">{q.text || '[No Question Text]'}</CardTitle>
                                            <CardDescription className="text-xs pt-1">
                                                Subject: <span className="font-semibold">{q.subject || 'N/A'}</span>
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow flex justify-between items-center text-sm text-muted-foreground">
                                            <div className="flex gap-1">
                                                <Badge variant="outline" className="capitalize">{q.type.replace('-', ' ')}</Badge>
                                                <Badge variant="secondary" className="capitalize">{q.difficulty || 'Medium'}</Badge>
                                            </div>
                                            <span className="font-semibold">{q.points} pts</span>
                                        </CardContent>
                                        <CardFooter className="p-2 border-t flex gap-2">
                                            <Button variant="outline" size="sm" className="w-full" onClick={handleExport}>
                                                <FileOutput className="mr-2 h-4 w-4" />
                                                ထုတ်ယူရန်
                                            </Button>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="outline" size="icon" onClick={() => setQuestionToEdit(q)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>မေးခွန်းပြင်ရန်</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="destructive" size="icon" onClick={() => setQuestionToDelete(q)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>မေးခွန်းဘဏ်မှဖျက်ရန်</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                <p>No questions found in the bank.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            <QuizBankEditor 
                question={questionToEdit}
                onOpenChange={(isOpen) => !isOpen && setQuestionToEdit(null)}
                onSave={handleSave}
            />

            <AlertDialog open={!!questionToDelete} onOpenChange={(isOpen) => !isOpen && setQuestionToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ဤမေးခွန်းကို မေးခွန်းဘဏ်ထဲမှ အပြီးတိုင်ဖျက်မလား? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                        onClick={handleDelete}
                        className={cn(buttonVariants({ variant: "destructive" }))}
                        >
                        Confirm Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

    