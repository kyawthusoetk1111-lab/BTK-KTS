'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { Activity } from 'lucide-react';

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
            <header className="sticky top-0 z-10 bg-black/20 backdrop-blur-lg border-b border-emerald-500/30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-2xl font-bold font-headline text-white">
                            <Activity />
                            BTK Education
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/login" passHref>
                                <Button variant="outline" className="bg-transparent border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/20 hover:text-emerald-300">Login</Button>
                            </Link>
                            <Link href="/signup" passHref>
                                <Button className="bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-bold">Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight mb-4">
                        BTK ပညာရေးပလက်ဖောင်းမှ ကြိုဆိုပါသည်
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                        အရည်အသွေးမြင့် စာမေးပွဲစနစ်ဖြင့် သင်၏အရည်အချင်းကို မြှင့်တင်လိုက်ပါ။
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/signup" passHref>
                            <Button size="lg" className="bg-emerald-500 text-slate-950 hover:bg-emerald-600 font-bold shadow-lg shadow-emerald-500/20">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
