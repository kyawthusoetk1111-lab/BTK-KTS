'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Trash2, Plus } from 'lucide-react';

export default function TeacherDashboard() {
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
        <div className="p-8 bg-white min-h-screen">
            <div className="flex justify-between items-center mb-10 border-b border-slate-200 pb-5">
                <h1 className="text-3xl font-bold text-slate-900">ဆရာ့ Dashboard (စာမေးပွဲများ)</h1>
                <Link href="/quizzes/new">
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700">
                        <Plus size={18} className="mr-2"/> Quiz အသစ်လုပ်မည်
                    </Button>
                </Link>
            </div>

            {loading ? <p className="text-slate-500">ရှာဖွေနေပါသည်...</p> : (
                <div className="grid gap-4">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="p-5 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{quiz.name || 'အမည်မရှိစာမေးပွဲ'}</h3>
                                <p className="text-slate-500 text-sm">{quiz.subject} | {quiz.timerInMinutes} mins</p>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/quizzes/${quiz.id}/preview`}><Button variant="outline" size="sm" className="border-slate-300 text-slate-700">Preview</Button></Link>
                                <Link href={`/quizzes/${quiz.id}/edit`}><Button variant="outline" size="sm" className="border-slate-300 text-blue-600">Edit</Button></Link>
                                <Button variant="outline" size="sm" className="border-slate-300 text-red-600">Delete</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
