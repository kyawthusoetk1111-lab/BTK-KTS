'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Activity, Search, Trophy, Clock, Facebook, Twitter, Instagram, Linkedin
} from 'lucide-react';
import { mockQuizzes, mockLeaderboard } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function LandingPage() {
    const leaderboardEntries = mockLeaderboard['Mathematics'] || [];
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero-landing');

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-900">
            {/* --- Navbar (Original) --- */}
            <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-slate-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                            <Activity className="text-emerald-600"/> BTK Education
                        </Link>
                        <div className="hidden md:flex items-center justify-center flex-1 px-16">
                           <div className="relative w-full max-w-md">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                               <Input placeholder="Search for exams..." className="pl-9 bg-slate-100 border-none focus:bg-white text-slate-900"/>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/login"><Button variant="ghost" className="text-slate-600">Login</Button></Link>
                            <Link href="/login"><Button className="bg-emerald-600 text-white hover:bg-emerald-700">Sign Up</Button></Link>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-1">
                {/* --- Hero Section (Original) --- */}
                <section className="relative bg-white py-20 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
                                    တောက်ပတဲ့ အနာဂတ် <br/> <span className="text-emerald-600">BTK မှာစတင်ပါ</span>
                                </h1>
                                <p className="text-lg text-slate-600 max-w-lg">
                                    သင်၏ပညာရေး ရည်မှန်းချက်များကို BTK Education တွင် အကောင်အထည်ဖော်လိုက်ပါ။ အရည်အသွေးမြင့် သင်ခန်းစာများနှင့် စာမေးပွဲများကို တစ်နေရာတည်းတွင် လေ့လာနိုင်ပါသည်။
                                </p>
                                <div className="flex gap-4">
                                    <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700 px-8">စတင်လေ့လာမည်</Button>
                                    <Button size="lg" variant="outline" className="border-slate-200 text-slate-900">သင်ခန်းစာများကြည့်မည်</Button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-emerald-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                                <Image 
                                    src={heroImage?.imageUrl || "https://picsum.photos/seed/edutech/600/400"}
                                    alt="Hero Illustration" width={600} height={400} className="relative rounded-2xl shadow-2xl border border-slate-100"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- Featured Exams Section (Original Styling) --- */}
                <section className="bg-slate-50 py-24">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900">လက်ရှိဖြေဆိုနေသော စာမေးပွဲများ</h2>
                                <p className="text-slate-500 mt-2">လူကြိုက်အများဆုံးနှင့် နောက်ဆုံးထွက်စာမေးပွဲများ</p>
                            </div>
                            <Link href="/quizzes" className="text-emerald-600 font-semibold hover:underline">အားလုံးကြည့်မည် →</Link>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {mockQuizzes.slice(0, 3).map((quiz) => (
                                <Card key={quiz.id} className="bg-white border-none shadow-sm hover:shadow-xl transition-all duration-300 group">
                                    <div className="relative h-48 overflow-hidden rounded-t-xl">
                                        <Image src={`https://picsum.photos/seed/${quiz.id}/400/200`} alt={quiz.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <Badge className="absolute top-4 right-4 bg-emerald-500 text-white border-none px-3 py-1">Live</Badge>
                                    </div>
                                    <CardContent className="p-6">
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">{quiz.subject}</p>
                                        <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-1">{quiz.name}</h3>
                                        <div className="flex items-center justify-between text-slate-500 text-sm pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2"><Clock size={16}/> <span>{quiz.timerInMinutes} mins</span></div>
                                            <Link href={`/quizzes/${quiz.id}/take`}>
                                                <Button className="bg-slate-900 text-white hover:bg-emerald-600 transition-colors">ဖြေဆိုမည်</Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- Leaderboard Section (Original) --- */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <Badge variant="outline" className="mb-4 border-emerald-200 text-emerald-700 bg-emerald-50">Top Performers</Badge>
                        <h2 className="text-3xl font-bold text-slate-900 mb-12">အမှတ်အများဆုံး ကျောင်းသားများ</h2>
                        <Card className="border-slate-100 shadow-2xl overflow-hidden">
                             <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="w-[100px] text-slate-900">Rank</TableHead>
                                        <TableHead className="text-slate-900">Student Name</TableHead>
                                        <TableHead className="text-right text-slate-900">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboardEntries.slice(0, 5).map((entry, index) => (
                                        <TableRow key={entry.rank} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-bold">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> : <span className="ml-7 text-slate-400">{entry.rank}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700">{entry.studentName}</TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">{entry.score}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                        </Card>
                    </div>
                </section>
            </main>

            {/* --- Footer (Original) --- */}
            <footer className="bg-slate-900 text-slate-400 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-12 mb-12 text-center md:text-left">
                        <div className="col-span-2 space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2 justify-center md:justify-start">
                                <Activity className="text-emerald-500" /> BTK Education
                            </h3>
                            <p className="max-w-xs mx-auto md:mx-0">ပညာရေးသည် အနာဂတ်၏ သော့ချက်ဖြစ်သည်။ BTK ဖြင့် သင်၏ အရည်အချင်းကို မြှင့်တင်ပါ။</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Quick Links</h4>
                            <ul className="space-y-2"><li>About Us</li><li>Courses</li><li>Contact</li></ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Follow Us</h4>
                            <div className="flex justify-center md:justify-start gap-4">
                                <Facebook className="hover:text-emerald-500 cursor-pointer" /> <Twitter className="hover:text-emerald-500 cursor-pointer" /> <Instagram className="hover:text-emerald-500 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-800 text-center text-sm">
                        &copy; {new Date().getFullYear()} BTK Education. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
