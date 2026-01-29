'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './badge';
import { Activity, Search, Clock, LogIn } from 'lucide-react';
import { db } from '@/firebase'; 
import { collection, getDocs } from 'firebase/firestore';

export function LandingPage() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'quizzes'));
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setQuizzes(data);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchQuizzes();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-emerald-600">
                        <Activity /> BTK Education
                    </Link>
                    
                    {/* --- Login / Sign Up ခလုတ်များ --- */}
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost" className="text-slate-600 font-medium">Log in</Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-blue-600 text-white hover:bg-blue-700 px-6 font-bold shadow-md transition-all">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center md:text-left">လက်ရှိစာမေးပွဲများ</h2>
                {loading ? <p className="text-center">ရှာဖွေနေပါသည်...</p> : 
                <div className="grid md:grid-cols-3 gap-8">
                    {quizzes.map(q => (
                        <Card key={q.id} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <Badge className="bg-emerald-500 text-white mb-3">Live</Badge>
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{q.name}</h3>
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="text-slate-500 text-sm flex items-center gap-1"><Clock size={16}/>{q.timerInMinutes} min</span>
                                    <Link href={`/quizzes/${q.id}/take`}><Button className="bg-slate-900 text-white">ဖြေဆိုမည်</Button></Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>}
            </main>
        </div>
    );
}
