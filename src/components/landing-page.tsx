'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge, badgeVariants } from './badge';
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
import type { Quiz, LeaderboardEntry } from '@/lib/types';
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
    // We'll use the Math leaderboard as a sample for the landing page
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
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-slate-900">
                            <Activity className="text-primary"/>
                            BTK Education
                        </Link>
                        <div className="hidden md:flex items-center justify-center flex-1 px-16">
                           <div className="relative w-full max-w-md">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                               <Input placeholder="Search for exams..." className="pl-9 bg-slate-100 border-slate-200 focus:bg-white"/>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/login" passHref>
                                <Button variant="ghost">Login</Button>
                            </Link>
                            <Link href="/signup" passHref>
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative bg-white">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/50 via-sky-100/50 to-indigo-100/50 opacity-50"></div>
                        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
                        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
                        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>
                    </div>
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="text-center md:text-left animate-in fade-in slide-in-from-left-12 duration-1000">
                                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-slate-900 mb-6">
                                    တောက်ပတဲ့ အနာဂတ်၊ BTK မှာစတင်ပါ
                                </h1>
                                <p className="text-lg text-slate-600 max-w-xl mx-auto md:mx-0 mb-8">
                                    ထောင်ပေါင်းများစွာသော ကျောင်းသား၊ ဆရာများနှင့်အတူ သင်၏ပညာရေး ရည်မှန်းချက်များကို BTK Education တွင် အကောင်အထည်ဖော်လိုက်ပါ။
                                </p>
                                <Link href="/signup" passHref>
                                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-emerald-500/30">Get Started</Button>
                                </Link>
                            </div>
                            <div className="relative animate-in fade-in slide-in-from-right-12 duration-1000">
                                <Image 
                                    src={heroImage?.imageUrl || "https://picsum.photos/seed/edutech/600/400"}
                                    alt={heroImage?.description || "3D educational illustration"}
                                    width={600}
                                    height={400}
                                    data-ai-hint={heroImage?.imageHint || "education study"}
                                    className="rounded-xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Feature Highlights Section */}
                <section className="bg-slate-50/70 py-20">
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <h2 className="text-3xl md:text-4xl font-bold font-headline">The Future of Online Testing</h2>
                            <p className="mt-4 text-lg text-slate-600">Powerful features for a seamless exam experience.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="bg-emerald-100/60 border-emerald-200 text-center p-8 transition-transform hover:scale-105 hover:shadow-xl animate-in fade-in zoom-in-95 duration-1000">
                                <div className="mx-auto bg-primary text-primary-foreground rounded-full h-16 w-16 flex items-center justify-center">
                                    <Shield size={32} />
                                </div>
                                <h3 className="text-xl font-bold mt-6">Anti-Cheat System</h3>
                                <p className="mt-2 text-slate-600">Ensures exam integrity with fullscreen enforcement and tab-switching detection.</p>
                            </Card>
                             <Card className="bg-sky-100/60 border-sky-200 text-center p-8 transition-transform hover:scale-105 hover:shadow-xl animate-in fade-in zoom-in-95 duration-1000" style={{animationDelay: '200ms'}}>
                                <div className="mx-auto bg-secondary text-secondary-foreground rounded-full h-16 w-16 flex items-center justify-center">
                                    <BarChart size={32} />
                                </div>
                                <h3 className="text-xl font-bold mt-6">Instant Results</h3>
                                <p className="mt-2 text-slate-600">Get immediate feedback and detailed performance analytics after every quiz.</p>
                            </Card>
                             <Card className="bg-teal-100/60 border-teal-200 text-center p-8 transition-transform hover:scale-105 hover:shadow-xl animate-in fade-in zoom-in-95 duration-1000" style={{animationDelay: '400ms'}}>
                                <div className="mx-auto bg-teal-500 text-white rounded-full h-16 w-16 flex items-center justify-center">
                                    <Smartphone size={32} />
                                </div>
                                <h3 className="text-xl font-bold mt-6">Mobile Ready</h3>
                                <p className="mt-2 text-slate-600">Take exams anytime, anywhere, with our fully responsive platform.</p>
                            </Card>
                        </div>
                    </div>
                </section>
                
                {/* Featured Exams Section */}
                <section className="bg-white py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Exams</h2>
                            <p className="mt-4 text-lg text-slate-600">Challenge yourself with our most popular quizzes.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mockQuizzes.slice(0,3).map((quiz, index) => {
                                const status = getQuizStatus(quiz);
                                const quizImage = getQuizImage(quiz.id);
                                return (
                                <Card key={quiz.id} className="group overflow-hidden transition-all hover:shadow-2xl animate-in fade-in zoom-in-95 duration-1000" style={{animationDelay: `${200 * index}ms`}}>
                                    <CardContent className="p-0">
                                        <div className="relative h-48 w-full">
                                            <Image src={quizImage.imageUrl} alt={quiz.name} fill style={{objectFit: 'cover'}} data-ai-hint={quizImage.imageHint} className="transition-transform group-hover:scale-105" />
                                            <div className="absolute top-3 right-3">
                                                 <Badge variant={status.variant} className={cn(status.variant === 'live' && "shadow-lg shadow-green-500/40")}>{status.text}</Badge>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-sm text-primary font-medium">{quiz.subject}</p>
                                            <h3 className="text-lg font-bold mt-1 h-14 line-clamp-2">{quiz.name}</h3>
                                            <div className="flex items-center justify-between text-sm text-slate-500 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{quiz.timerInMinutes} min</span>
                                                </div>
                                                 <span>{countQuestions(quiz)} Questions</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="p-4 pt-0">
                                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Enroll Now</Button>
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </div>
                </section>
                
                {/* Leaderboard Section */}
                <section className="bg-slate-50/70 py-20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <h2 className="text-3xl md:text-4xl font-bold font-headline">Top Performers</h2>
                            <p className="mt-4 text-lg text-slate-600">See who is leading the charts in Mathematics.</p>
                        </div>
                        <Card className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">Rank</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboardEntries.slice(0,5).map((entry, index) => (
                                        <TableRow key={entry.rank}>
                                            <TableCell className="font-bold text-lg">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-400" />}
                                                    {index === 1 && <Trophy className="h-6 w-6 text-slate-500 fill-slate-400" />}
                                                    {index === 2 && <Trophy className="h-6 w-6 text-yellow-700 fill-yellow-600" />}
                                                    {index > 2 && <span className="w-6 text-center">{entry.rank}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{entry.studentName}</TableCell>
                                            <TableCell className="text-right font-semibold">{entry.score}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                        </Card>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-lg font-semibold text-white">BTK Education</h3>
                            <p className="mt-2 text-sm">The best platform for your future.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Quick Links</h4>
                            <ul className="mt-2 space-y-1 text-sm">
                                <li><Link href="#" className="hover:text-primary">Exams</Link></li>
                                <li><Link href="#" className="hover:text-primary">About Us</Link></li>
                                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-white">Legal</h4>
                            <ul className="mt-2 space-y-1 text-sm">
                                <li><Link href="#" className="hover:text-primary">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-primary">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-white">Connect</h4>
                             <div className="flex mt-2 space-x-2">
                                <Link href="#" className="text-slate-400 hover:text-primary"><Facebook /></Link>
                                <Link href="#" className="text-slate-400 hover:text-primary"><Twitter /></Link>
                                <Link href="#" className="text-slate-400 hover:text-primary"><Instagram /></Link>
                                <Link href="#" className="text-slate-400 hover:text-primary"><Linkedin /></Link>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
                        <p>&copy; {new Date().getFullYear()} BTK Education. All rights reserved.</p>
                    </div>
                 </div>
            </footer>
        </div>
    );
}
    