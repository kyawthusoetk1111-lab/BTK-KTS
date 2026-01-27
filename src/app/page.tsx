'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, Plus, LayoutDashboard, BookOpen, Users, Settings } from 'lucide-react';

export default function TeacherDashboard() {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'quizzes'));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuizzes(data);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    useEffect(() => { fetchQuizzes(); }, []);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:block">
                <div className="flex items-center gap-2 mb-10 text-emerald-600 font-bold text-xl">
                    BTK Education
                </div>
                <nav className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg font-medium">
                        <LayoutDashboard size={20}/> ပင်မစာမျက်နှာ
                    </div>
                    <Link href="/question-bank" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg">
                        <BookOpen size={20}/> မေးခွန်းဘဏ်
                    </Link>
                    <Link href="/students" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg">
                        <Users size={20}/> ကျောင်းသားများ
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg">
                        <Settings size={20}/> ဆက်တင်များ
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500">ဆရာ့ရဲ့ စာမေးပွဲများကို ဤနေရာတွင် စီမံနိုင်ပါသည်။</p>
                    </div>
                    <Link href="/quizzes/new">
                        <Button className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">
                            <Plus className="mr-2" size={18}/> Quiz အသစ်လုပ်မည်
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">လက်ရှိစာမေးပွဲများ</h2>
                    {loading ? <p className="text-slate-500">ရှာဖွေနေပါသည်...</p> : 
                    quizzes.length > 0 ? (
                        <div className="grid gap-4">
                            {quizzes.map((quiz) => (
                                <div key={quiz.id} className="p-6 bg-white border border-slate-200 rounded-xl flex justify-between items-center shadow-sm hover:border-emerald-300 transition-colors">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1">{quiz.name}</h3>
                                        <div className="flex gap-4 text-sm text-slate-500">
                                            <span>{quiz.subject}</span>
                                            <span>• {quiz.timerInMinutes} mins</span>
                                            <span className="text-emerald-600 font-medium">Active</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Link href={`/quizzes/${quiz.id}/preview`}>
                                            <Button variant="outline" size="sm" className="border-slate-200 text-slate-600"><Eye size={16}/></Button>
                                        </Link>
                                        <Link href={`/quizzes/${quiz.id}/edit`}>
                                            <Button variant="outline" size="sm" className="border-slate-200 text-blue-600"><Edit size={16}/></Button>
                                        </Link>
                                        <Button variant="outline" size="sm" className="border-slate-200 text-red-600"><Trash2 size={16}/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
                            <p className="text-slate-500">စာမေးပွဲများ မရှိသေးပါ။</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
