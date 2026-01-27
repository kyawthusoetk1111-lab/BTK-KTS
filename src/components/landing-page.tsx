'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './badge';
import { Clock, LogIn, LayoutDashboard, Activity } from 'lucide-react';
import { db } from '@/firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';

export function LandingPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'quizzes'));
                const fetchedQuizzes = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Quiz[];
                setQuizzes(fetchedQuizzes);
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900">
            <header className="border-b bg-white sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                        <Activity /> BTK Education
                    </Link>
                    <div className="flex gap-2">
                        <Link href="/login"><Button variant="ghost">Login</Button></Link>
                        <Link href="/quizzes"><Button className="bg-emerald-600 text-white">Dashboard</Button></Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">လက်ရှိဖြေဆိုနေသော စာမေးပွဲများ</h2>
                {loading ? (
                    <div className="text-center py-10">ရှာဖွေနေပါသည်...</div>
                ) : quizzes.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <Card key={quiz.id} className="border-slate-200 shadow-sm">
                                <CardContent className="p-6">
                                    <Badge className="bg-emerald-500 text-white mb-3">Live</Badge>
                                    <h3 className="text-xl font-bold text-slate-900">{quiz.name}</h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-slate-500 flex items-center gap-1 text-sm"><Clock size={16}/>{quiz.timerInMinutes} min</span>
                                        <Link href={`/quizzes/${quiz.id}/take`}>
                                            <Button className="bg-emerald-600 text-white">ဖြေဆိုမည်</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-600">လက်ရှိတွင် ဖြေဆိုရန် စာမေးပွဲများ မရှိသေးပါ။</p>
                    </div>
                )}
            </main>
        </div>
    );
}
