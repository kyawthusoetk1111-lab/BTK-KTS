'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './badge';
import { 
  Activity, Search, Clock, LogIn, Trophy, 
  Facebook, Twitter, Instagram, Github 
} from 'lucide-react';
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
            {/* --- 1. Navbar with Login/Sign Up --- */}
            <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-emerald-600">
                        <Activity /> BTK Education
                    </Link>
                    
                    <div className="hidden md:flex flex-1 px-10">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="Search exams..." className="pl-9 bg-slate-50 border-slate-200 text-slate-900 focus:bg-white"/>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/login"><Button variant="ghost" className="text-slate-600">Log in</Button></Link>
                        <Link href="/login"><Button className="bg-emerald-600 text-white hover:bg-emerald-700">Sign Up</Button></Link>
                    </div>
                </div>
            </header>
            
            <main className="flex-1">
                {/* --- 2. Hero Section --- */}
                <section className="py-20 bg-gradient-to-b from-emerald-50 to-white">
                    <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 text-center md:text-left">
                            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                                တောက်ပတဲ့ အနာဂတ် <br/> <span className="text-emerald-600 font-black">BTK မှာစတင်ပါ</span>
                            </h1>
                            <p className="text-lg text-slate-600 max-w-lg mx-auto md:mx-0">
                                သင်၏ပညာရေး ရည်မှန်းချက်များကို အရည်အသွေးမြင့် သင်ခန်းစာများနှင့်အတူ တစ်နေရာတည်းတွင် လေ့လာပါ။
                            </p>
                            <div className="flex justify-center md:justify-start gap-4">
                                <Button size="lg" className="bg-emerald-600 text-white px-8 h-12">စတင်လေ့လာမည်</Button>
                                <Button size="lg" variant="outline" className="text-slate-900 border-slate-300 h-12">သင်ခန်းစာများ</Button>
                            </div>
                        </div>
                        <div className="relative flex justify-center">
                            <div className="w-full max-w-md aspect-video bg-slate-200 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-4 border-white">
                                <img src="https://picsum.photos/seed/edu/800/600" alt="Education" className="object-cover w-full h-full" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 3. Live Quizzes (Dynamic) --- */}
                <section className="py-20 container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-3xl font-bold text-slate-900">လက်ရှိစာမေးပွဲများ</h2>
                        <Link href="/quizzes" className="text-emerald-600 font-semibold hover:underline text-sm">အားလုံးကြည့်ရန် →</Link>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-10 text-slate-400">ရှာဖွေနေပါသည်...</div>
                    ) : quizzes.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {quizzes.map((quiz) => (
                                <Card key={quiz.id} className="border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
                                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                                        <img src={`https://picsum.photos/seed/${quiz.id}/400/250`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <Badge className="absolute top-4 left-4 bg-emerald-500 text-white border-none">Live</Badge>
                                    </div>
                                    <CardContent className="p-6">
                                        <p className="text-xs font-bold text-emerald-600 uppercase mb-2 tracking-tighter">{quiz.subject || "General"}</p>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-1">{quiz.name}</h3>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                            <span className="text-slate-500 text-sm flex items-center gap-1"><Clock size={16}/>{quiz.timerInMinutes} min</span>
                                            <Link href={`/quizzes/${quiz.id}/take`}><Button className="bg-slate-900 text-white hover:bg-emerald-600">ဖြေဆိုမည်</Button></Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                             <p className="text-slate-500">လက်ရှိတွင် ဖြေဆိုရန် စာမေးပွဲများ မရှိသေးပါ။</p>
                        </div>
                    )}
                </section>

                {/* --- 4. Leaderboard Mockup --- */}
                <section className="py-20 bg-slate-900 text-white">
                    <div className="container mx-auto px-4 max-w-3xl text-center">
                        <Trophy className="mx-auto text-yellow-500 mb-4" size={48} />
                        <h2 className="text-3xl font-bold mb-10 text-white">အမှတ်အများဆုံး ကျောင်းသားများ</h2>
                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                            <div className="flex justify-between border-b border-white/10 pb-4 mb-4 font-bold text-emerald-400">
                                <span>Name</span>
                                <span>Score</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-white/80"><span>Maung Maung</span> <span>98%</span></div>
                                <div className="flex justify-between text-white/80 border-t border-white/5 pt-4"><span>Su Su</span> <span>95%</span></div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* --- 5. Footer --- */}
            <footer className="bg-slate-50 border-t border-slate-200 py-12">
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-10">
                    <div className="col-span-2">
                        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Activity className="text-emerald-600"/> BTK Education</h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">အရည်အသွေးမြင့် ပညာရေးကို လူတိုင်းလက်လှမ်းမီစေရန် BTK က ကြိုးပမ်းဆောင်ရွက်နေပါသည်။</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
                        <ul className="text-slate-500 text-sm space-y-2">
                            <li>Home</li><li>Exams</li><li>About Us</li>
                        </ul>
                    </div>
                    <div className="flex gap-4">
                        <Facebook size={20} className="text-slate-400 hover:text-emerald-600 cursor-pointer" />
                        <Twitter size={20} className="text-slate-400 hover:text-emerald-600 cursor-pointer" />
                        <Instagram size={20} className="text-slate-400 hover:text-emerald-600 cursor-pointer" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
