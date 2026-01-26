'use client';

import { AnalyticsDashboard } from "@/components/grading-dashboard";

export default function ResultsPage() {
    return (
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold font-headline tracking-tight">ရလဒ်နှင့် အစီရင်ခံစာ</h1>
                <p className="text-gray-300">
                  Review student submissions and grades.
                </p>
              </div>
            </div>
            <AnalyticsDashboard />
        </main>
    )
}
