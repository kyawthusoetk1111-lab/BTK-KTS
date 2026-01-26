'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function LogsPage() {
    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">System Logs</h2>
                    <p className="text-muted-foreground">
                        Monitor user activity and system events.
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Under Construction</CardTitle>
                    <CardDescription>This feature is not yet available.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                    <Activity className="h-16 w-16 mb-4" />
                    <p>The System Logs viewer is coming soon!</p>
                </CardContent>
            </Card>
        </main>
    );
}

    