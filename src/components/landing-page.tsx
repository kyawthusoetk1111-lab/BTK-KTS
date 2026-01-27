'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
        <div className="flex flex-col min-h-screen bg-white text-slate-900">
            {/* --- Navbar (Original) --- */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        <Activity className="text-emerald-600"/> BTK Education
                    </Link>
                    <div className="hidden md:flex flex-1 px-10">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search exams..." className="pl-9 bg-slate-100 border-none text-slate-900"/>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login"><Button variant="ghost" className="text-slate-600 font-medium">Log in</Button></Link>
                        <Link href="/login"><Button className="bg-emerald-600 text-white hover:bg-emerald-700">Sign Up</Button></Link>
                    </div>
                </div>
            </header>
            
            <main className="flex-1">
                {/* --- Hero Section --- */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto px-4 text-center md:text-left grid md:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6">
                            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight">
                                တောက်ပတဲ့ အနာဂတ် <br/> <span className="text-emerald-600">BTK မှာစတင်ပါ</span>
                            </h1>
                            <p className="text-lg text-slate-600">သင်၏ပညာရေး ရည်မှန်းချက်များကို BTK Education တွင် အကောင်အထည်ဖော်လိုက်ပါ။</p>
                            <div className="flex justify-center md:justify-start gap-4">
                                <Button size="lg" className="bg-emerald-600 text-white px-8">စတင်လေ့လာမည်</Button>
                                <Button size="lg" variant="outline" className="text-slate-900 border-slate-200">သင်ခန်းစာများ</Button>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <img src="https://picsum.photos/seed/edu/600/400" alt="Education" className="rounded-2xl shadow-xl" />
                        </div>
                    </div>
                </section>

                {/* --- Featured Exams --- */}
                <section className="bg-slate-50 py-20">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center md:text-left">လက်ရှိဖြေဆိုနေသော စာမေးပွဲများ</h2>
                        {loading ? <p className="text-center">Loading...</p> : 
                        <div className="grid md:grid-cols-3 gap-8">
                            {quizzes.map((quiz) => (
                                <Card key={quiz.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <div className="h-40 bg-slate-200 rounded-t-xl"></div>
                                        <div className="p-6">
                                            <Badge className="bg-emerald-500 text-white mb-3">Live</Badge>
                                            <h3 className="text-xl font-bold text-slate-900 mb-4">{quiz.name}</h3>
                                            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                                <span className="text-slate-500 text-sm flex items-center gap-1"><Clock size={16}/>{quiz.timerInMinutes} min</span>
                                                <Link href={`/quizzes/${quiz.id}/take`}><Button className="bg-emerald-600 text-white">ဖြေဆိုမည်</Button></Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>}
                    </div>
                </section>
            </main>
        </div>
    );
}
