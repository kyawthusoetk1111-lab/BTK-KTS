'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './badge';
import { Activity, Clock, Search } from 'lucide-react';
import { db } from '@/firebase'; // ဆရာ့ firebase config လမ်းကြောင်း
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';

export function LandingPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    // --- Firestore ကနေ စာမေးပွဲများ ဆွဲယူခြင်း ---
    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const quizCollection = collection(db, 'quizzes');
                // အစမ်းအနေနဲ့ အကုန်ဆွဲထုတ်ကြည့်ပါမယ်
                const querySnapshot = await getDocs(quizCollection);
                const fetchedQuizzes = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Quiz[];
                
                setQuizzes(fetchedQuizzes);
            } catch (error) {
                console.error("Error fetching quizzes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900">
            {/* ... Navbar (အရင်အတိုင်းထားနိုင်သည်) ... */}
            
            <main className="flex-1">
                <section className="bg-slate-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900">လက်ရှိဖြေဆိုနေသော စာမေးပွဲများ</h2>
                        </div>

                        {loading ? (
                            <p className="text-center">စာမေးပွဲများ ရှာဖွေနေပါသည်...</p>
                        ) : quizzes.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {quizzes.map((quiz) => (
                                    <Card key={quiz.id} className="bg-white border-slate-200 shadow-sm overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="p-5">
                                                <Badge className="bg-green-500 text-white mb-2">Live</Badge>
                                                <h3 className="text-xl font-bold text-slate-900">{quiz.name}</h3>
                                                <p className="text-sm text-slate-500 mt-2">{quiz.subject}</p>
                                                
                                                <div className="flex items-center justify-between text-sm text-slate-600 mt-6 pt-4 border-t">
                                                    <div className="flex items-center gap-1"><Clock size={16}/> {quiz.timerInMinutes} min</div>
                                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                        <Link href={`/quizzes/${quiz.id}/take`}>ဖြေဆိုမည်</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-slate-500 italic">လက်ရှိတွင် ဖြေဆိုရန် စာမေးပွဲများ မရှိသေးပါ။</p>
                                <p className="text-xs text-slate-400 mt-2">(Dashboard တွင် Quiz များ Create လုပ်ထားရန် လိုအပ်ပါသည်)</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
