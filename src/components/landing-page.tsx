'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import {
  Activity,
  Search,
  Shield,
  BarChart,
  Smartphone,
  Trophy,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Clock,
} from 'lucide-react';
import { mockQuizzes, mockLeaderboard } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { Quiz } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function countQuestions(quiz: Quiz) {
  return quiz.sections.reduce((total, section) => {
    return total + section.questions.length;
  }, 0);
}

const getQuizStatus = (quiz: Quiz): { text: 'Live' | 'Draft' | 'Closed'; variant: 'live' | 'draft' | 'closed' } => {
    const now = new Date();
    const start = quiz.startDate ? new Date(quiz.startDate) : null;
    const end = quiz.endDate ? new Date(quiz.endDate) : null;

    if (!start && !end) return { text: 'Draft', variant: 'draft' };
    if (start && now < start) return { text: 'Draft', variant: 'draft' };
    if (end && now > end) return { text: 'Closed', variant: 'closed' };
    if (start && now >= start && (!end || now < end)) return { text: 'Live', variant: 'live' };

    return { text: 'Draft', variant: 'draft' };
};

export function LandingPage() {
    const leaderboardEntries = mockLeaderboard['Mathematics'] || [];
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero-landing');

    const getQuizImage = (quizId: string) => {
        const image = PlaceHolderImages.find(img => img.id === quizId);
        return image || { imageUrl: `https://picsum.photos/seed/${quizId}/400/200`, imageHint: 'quiz' };
    }

    return (
        <div className="flex flex-col min-h-screen bg-white text-slate-800">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                            <Activity className="text-emerald-600"/>
                            BTK Education
                        </Link>
                        <div className="hidden md:flex items-center justify-center flex-1 px-16">
                           <div className="relative w-full max-w-md">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                               <Input placeholder="Search for exams..." className="pl-9 bg-slate-100 border-slate-200 focus:bg-white"/>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/login" passHref><Button variant="ghost">Login</Button></Link>
                            <Link href="/login" passHref><Button className="bg-emerald-600 text-white hover:bg-emerald-700">Sign Up</Button></Link>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative bg-white py-20">
                    <div className="container mx-auto px-4 text-center md:text-left">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">တောက်ပတဲ့ အနာဂတ်၊ BTK မှာစတင်ပါ</h1>
                                <p className="text-lg text-slate-600 mb-8">သင်၏ပညာရေး ရည်မှန်းချက်များကို BTK Education တွင် အကောင်အထည်ဖော်လိုက်ပါ။</p>
                                <Button size="lg" className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg">Get Started</Button>
                            </div>
                            <div className="relative">
                                <Image 
                                    src={heroImage?.imageUrl || "https://picsum.photos/seed/edutech/600/400"}
                                    alt="Hero Illustration" width={600} height={400} className="rounded-xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Exams Section - FIXED COLOR & UI */}
                <section className="bg-slate-50 py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Featured Exams</h2>
                            <p className="mt-4 text-lg text-slate-600">Challenge yourself with our most popular quizzes.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mockQuizzes.slice(0,3).map((quiz, index) => {
                                const status = getQuizStatus(quiz);
                                const quizImage = getQuizImage(quiz.id);
                                return (
                                <Card key={quiz.id} className="bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="relative h-48 w-full">
                                            <Image src={quizImage.imageUrl} alt={quiz.name} fill style={{objectFit: 'cover'}} />
                                            <div className="absolute top-3 right-3">
                                                <Badge className={cn("px-3 py-1 text-white font-bold", status.variant === 'live' ? "bg-green-500" : "bg-slate-500")}>
                                                    {status.text}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider">{quiz.subject}</p>
                                            <h3 className="text-xl font-bold mt-2 h-14 line-clamp-2 text-slate-900 leading-tight">{quiz.name}</h3>
                                            <div className="flex items-center justify-between text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5"><Clock size={16} /> <span>{quiz.timerInMinutes} min</span></div>
                                                <div className="flex items-center gap-1.5"><Activity size={16} /> <span>{countQuestions(quiz)} Questions</span></div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-5 pt-0">
                                        <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 font-bold py-5">Enroll Now</Button>
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </div>
                </section>

                {/* Leaderboard Section */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Top Performers</h2>
                        <Card className="border-slate-200 shadow-sm">
                             <Table>
                                <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Student</TableHead><TableHead className="text-right">Score</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {leaderboardEntries.slice(0,5).map((entry, index) => (
                                        <TableRow key={entry.rank}>
                                            <TableCell className="font-bold">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 ? <Trophy className="h-5 w-5 text-yellow-500" /> : <span className="pl-7">{entry.rank}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-900">{entry.studentName}</TableCell>
                                            <TableCell className="text-right font-bold text-emerald-600">{entry.score}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                        </Card>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-white font-bold mb-4">BTK Education</p>
                    <div className="flex justify-center gap-6 mb-8">
                        <Facebook size={20} /> <Twitter size={20} /> <Instagram size={20} /> <Linkedin size={20} />
                    </div>
                    <p className="text-sm">&copy; {new Date().getFullYear()} BTK Education. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
