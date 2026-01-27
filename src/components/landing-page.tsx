'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './badge';
import { Clock, Activity } from 'lucide-react';
import { db } from '@/firebase'; 
import { collection, getDocs } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';

export function LandingPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                // Firebase ထဲက 'quizzes' ဆိုတဲ့ collection ကို တိုက်ရိုက်ကြည့်မယ်
                const querySnapshot = await getDocs(collection(db, 'quizzes'));
                const fetchedQuizzes = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Quiz[];
                
                setQuizzes(fetchedQuizzes);
            } catch (error) {
                console.error("Firebase Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-1 container mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center font-headline">
                    လက်ရှိဖြေဆိုနေသော စာမေးပွဲများ
                </h2>

                {loading ? (
                    <div className="text-center py-10 text-slate-600">စာမေးပွဲများ ရှာဖွေနေပါသည်...</div>
                ) : quizzes.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <Card key={quiz.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <Badge className="bg-emerald-500 text-white mb-3">Live</Badge>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{quiz.name}</h3>
                                    <p className="text-slate-500 text-sm mb-4">{quiz.subject}</p>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                                            <Clock size={16} />
                                            <span>{quiz.timerInMinutes} min</span>
                                        </div>
                                        <Link href={`/quizzes/${quiz.id}/take`}>
                                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                                ဖြေဆိုမည်
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-600 font-medium mb-2">လက်ရှိတွင် ဖြေဆိုရန် စာမေးပွဲများ မရှိသေးပါ။</p>
                        <p className="text-slate-400 text-sm">(Teacher Dashboard မှ Quiz တစ်ခု အရင် Create လုပ်ပေးပါ)</p>
                    </div>
                )}
            </main>
        </div>
    );
}
