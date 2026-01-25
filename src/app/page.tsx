'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockQuizzes } from '@/lib/data';
import { FilePlus2, BookCopy, Star, Edit } from 'lucide-react';
import type { Quiz } from '@/lib/types';
import { AuthButton } from '@/components/auth-button';
import { useUser } from '@/firebase';

function calculateTotalPoints(quiz: Quiz) {
  return quiz.sections.reduce((total, section) => {
    return total + section.questions.reduce((sectionTotal, question) => {
      return sectionTotal + question.points;
    }, 0);
  }, 0);
}

function countQuestions(quiz: Quiz) {
  return quiz.sections.reduce((total, section) => {
    return total + section.questions.length;
  }, 0);
}

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold font-headline text-primary">
              QuizCraft Pro
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <Link href="/quizzes/new/edit">
                  <Button>
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Create New Quiz
                  </Button>
                </Link>
              )}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4 mb-8">
          <h2 className="text-3xl font-bold font-headline tracking-tight">Your Quizzes</h2>
          <p className="text-muted-foreground">
            Manage your existing quizzes or create a new one to get started.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockQuizzes.map((quiz) => (
            <Card key={quiz.id} className="flex flex-col transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">{quiz.name}</CardTitle>
                <CardDescription>{quiz.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <BookCopy className="mr-2 h-4 w-4" />
                    <span>{countQuestions(quiz)} Questions</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-2 h-4 w-4" />
                    <span>{calculateTotalPoints(quiz)} Points</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/quizzes/${quiz.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Quiz
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
