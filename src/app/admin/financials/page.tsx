'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export default function FinancialsPage() {
    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Insights</h2>
                    <p className="text-muted-foreground">
                        Track subscription and exam fee revenues.
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Under Construction</CardTitle>
                    <CardDescription>This feature is not yet available.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                    <PieChart className="h-16 w-16 mb-4" />
                    <p>The Financial Insights dashboard is coming soon!</p>
                </CardContent>
            </Card>
        </main>
    );
}

    