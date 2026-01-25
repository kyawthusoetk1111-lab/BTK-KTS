'use client';

import Link from 'next/link';
import { Button } from './ui/button';

export function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="text-2xl font-bold font-headline text-primary">
                            QuizCraft Pro
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/login" passHref>
                                <Button variant="outline">Login</Button>
                            </Link>
                            <Link href="/signup" passHref>
                                <Button>Sign Up</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight mb-4">
                        Welcome to QuizCraft Pro
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                        The ultimate platform for creating, sharing, and taking quizzes. Built for teachers and students.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/signup" passHref>
                            <Button size="lg">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
