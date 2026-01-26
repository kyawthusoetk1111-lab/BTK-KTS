'use client';
import { useState } from 'react';
import type { UserProfile } from "@/lib/types";
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Progress } from '../ui/progress';
import { List } from 'lucide-react';


const performanceData = [
  { exam: 'GK Quiz', score: 75 },
  { exam: 'Math 101', score: 92 },
  { exam: 'History Mid', score: 68 },
  { exam: 'Science Final', score: 88 },
  { exam: 'English Lit', score: 95 },
];

const subjectMasteryData = [
    { subject: 'Math', mastery: 80 },
    { subject: 'Science', mastery: 65 },
    { subject: 'History', mastery: 90 },
    { subject: 'English', mastery: 72 },
];

const recentActivityData = [
    { name: "General Knowledge Challenge", date: "2 days ago", score: "15/20"},
    { name: "Advanced Mathematics", date: "1 week ago", score: "30/35"},
]

const chartConfig = {
    score: { label: "Score", color: "hsl(var(--primary))" },
} satisfies ChartConfig;


interface UserDetailViewProps {
    user: UserProfile;
}

export function UserDetailView({ user }: UserDetailViewProps) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [notes, setNotes] = useState(user.adminNotes || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveNotes = () => {
        if (!firestore) return;
        setIsSaving(true);
        const userRef = doc(firestore, 'users', user.id);
        updateDocumentNonBlocking(userRef, { adminNotes: notes });
        toast({ title: 'Notes Saved!' });
        setTimeout(() => setIsSaving(false), 1000);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 text-xl">
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                             <Badge variant={user.status === 'suspended' ? 'destructive' : 'default'} className={cn(user.status !== 'suspended' && 'bg-emerald-100 text-emerald-800')}>{user.status || 'active'}</Badge>
                             <Badge variant="secondary" className="capitalize">{user.userType}</Badge>
                             {user.accountTier === 'pro' && <Badge variant="premium">PRO</Badge>}
                        </div>
                    </div>
                </div>
            </div>
            
            <Tabs defaultValue="insights" className="flex-1 flex flex-col">
                <TabsList className="m-4">
                    <TabsTrigger value="insights">တိုးတက်မှုမှတ်တမ်း</TabsTrigger>
                    <TabsTrigger value="notes">Admin Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="insights" className="flex-1 overflow-y-auto px-6 space-y-6">
                    <Card className="border-amber-300 bg-amber-50">
                        <CardHeader>
                            <CardTitle>Pro Feature</CardTitle>
                            <CardDescription>This is a preview of the detailed analytics available in the Pro plan.</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Exam Performance</CardTitle>
                            <CardDescription>Scores over the last 5 exams.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={chartConfig} className="h-64 w-full">
                                <BarChart data={performanceData} accessibilityLayer>
                                    <XAxis dataKey="exam" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
                                    <YAxis hide={true} />
                                    <ChartTooltipContent hideLabel />
                                    <Bar dataKey="score" fill="var(--color-score)" radius={8} />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Mastery</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subjectMasteryData.map(subject => (
                                <div key={subject.subject} className="space-y-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium">{subject.subject}</span>
                                        <span className="text-muted-foreground">{subject.mastery}%</span>
                                    </div>
                                    <Progress value={subject.mastery} />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-3">
                                {recentActivityData.map(activity => (
                                    <li key={activity.name} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-medium">{activity.name}</p>
                                            <p className="text-xs text-muted-foreground">{activity.date}</p>
                                        </div>
                                        <span className="font-semibold">{activity.score}</span>
                                    </li>
                                ))}
                           </ul>
                        </CardContent>
                    </Card>

                </TabsContent>
                <TabsContent value="notes" className="flex-1 flex flex-col p-6">
                    <h3 className="font-semibold text-lg mb-2">အကောင့်ပိတ်ရန်</h3>
                    <Textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add private notes about this user..."
                        className="flex-1"
                        rows={10}
                    />
                    <div className="mt-4 flex justify-end">
                        <Button onClick={handleSaveNotes} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Notes'}
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

    