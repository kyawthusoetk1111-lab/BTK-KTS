'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Wallet, TrendingUp, Scale, FilePlus2, UserRoundPlus, ListChecks, ArrowRight, Loader2 } from 'lucide-react';
import type { UserProfile, Payment, Expenditure, AuditLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { format, subMonths } from 'date-fns';
import { ExpenditureModal } from '@/components/admin/expenditure-modal';
import { useToast } from '@/hooks/use-toast';
import { mockAuditLogs, mockSubmissions } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


const chartConfig = {
  Revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
  Expenses: { label: 'Expenses', color: 'hsl(var(--destructive))' },
} satisfies ChartConfig;

export default function AdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isExpenditureModalOpen, setIsExpenditureModalOpen] = useState(false);

    // Data fetching
    const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
    const paymentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'approved')) : null, [firestore]);
    const expendituresQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'expenditures')) : null, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
    const { data: payments, isLoading: isLoadingPayments } = useCollection<Payment>(paymentsQuery);
    const { data: expenditures, isLoading: isLoadingExpenditures } = useCollection<Expenditure>(expendituresQuery);

    const isLoading = isLoadingUsers || isLoadingPayments || isLoadingExpenditures;

    // Memoized calculations for stats cards
    const { totalStudents, monthlyRevenue, monthlyExpenses, netProfit } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const totalStudents = users?.filter(u => u.userType === 'student').length || 0;

        const monthlyRevenue = payments
            ?.filter(p => {
                const paymentDate = new Date(p.createdAt);
                return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
            })
            .reduce((sum, p) => sum + p.amount, 0) || 0;

        const monthlyExpenses = expenditures
            ?.filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0) || 0;
        
        const netProfit = monthlyRevenue - monthlyExpenses;

        return { totalStudents, monthlyRevenue, monthlyExpenses, netProfit };
    }, [users, payments, expenditures]);

    // Memoized calculation for financial trend chart
    const financialTrendData = useMemo(() => {
        const data: { name: string; Revenue: number; Expenses: number }[] = [];
        const now = new Date();
        for (let i = 3; i >= 0; i--) {
            const d = subMonths(now, i);
            const monthName = format(d, 'MMM');
            
            const revenueForMonth = payments
                ?.filter(p => {
                    const paymentDate = new Date(p.createdAt);
                    return paymentDate.getMonth() === d.getMonth() && paymentDate.getFullYear() === d.getFullYear();
                })
                .reduce((sum, p) => sum + p.amount, 0) || 0;
                
            const expensesForMonth = expenditures
                ?.filter(e => {
                    const expenseDate = new Date(e.date);
                    return expenseDate.getMonth() === d.getMonth() && expenseDate.getFullYear() === d.getFullYear();
                })
                .reduce((sum, e) => sum + e.amount, 0) || 0;

            data.push({ name: monthName, Revenue: revenueForMonth, Expenses: expensesForMonth });
        }
        return data;
    }, [payments, expenditures]);

    // Mock recent activities
    const recentActivities: (AuditLog & { studentName?: string })[] = useMemo(() => {
        return Object.values(mockAuditLogs)
            .flat()
            .map(log => {
                const submission = mockSubmissions.find(sub => sub.id === log.submissionId);
                return {
                    ...log,
                    studentName: submission?.studentName || 'Unknown Student',
                };
            })
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0,5);
    }, []);

    const handleSaveExpense = (newExpense: Omit<Expenditure, 'id'>) => {
        if (!firestore) return;
        const collectionRef = collection(firestore, 'expenditures');
        addDocumentNonBlocking(collectionRef, { ...newExpense, id: crypto.randomUUID() });
        toast({ title: 'Expense Recorded!' });
    };

    return (
        <>
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
                    <p className="text-muted-foreground">A quick glance at your platform's statistics.</p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <Button asChild variant="outline" size="sm"><Link href="/admin/users"><UserRoundPlus />New Student</Link></Button>
                    <Button asChild variant="outline" size="sm"><Link href="/billing"><Wallet />Record Payment</Link></Button>
                    <Button variant="outline" size="sm" onClick={() => setIsExpenditureModalOpen(true)}><FilePlus2 />Add Expense</Button>
                    <Button asChild variant="outline" size="sm"><Link href="/admin/audit"><ListChecks />View Audit</Link></Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{isLoading ? <Loader2 className="animate-spin" /> : totalStudents}</div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400/80">+12 since last month</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-800 dark:text-sky-300">Monthly Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-900 dark:text-sky-100">{isLoading ? <Loader2 className="animate-spin" /> : `${monthlyRevenue.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-sky-700 dark:text-sky-400/80">+15% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">Monthly Expenses</CardTitle>
                        <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{isLoading ? <Loader2 className="animate-spin" /> : `${monthlyExpenses.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-amber-700 dark:text-amber-400/80">From {expenditures?.length || 0} transactions</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 dark:border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Net Profit</CardTitle>
                        <Scale className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-2xl font-bold", netProfit >= 0 ? "text-emerald-900 dark:text-emerald-100" : "text-red-900 dark:text-red-100")}>{isLoading ? <Loader2 className="animate-spin" /> : `${netProfit.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400/80">Current month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 animate-in fade-in-50 duration-500">
                    <CardHeader>
                        <CardTitle>Financial Trend</CardTitle>
                        <CardDescription>Revenue vs. Expenses for the last 4 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                            <AreaChart data={financialTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-Revenue)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-Revenue)" stopOpacity={0.1}/></linearGradient>
                                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-Expenses)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-Expenses)" stopOpacity={0.1}/></linearGradient>
                                </defs>
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                                <Tooltip content={<ChartTooltipContent indicator="dot" />} />
                                <Legend />
                                <Area type="monotone" dataKey="Revenue" stroke="var(--color-Revenue)" fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="Expenses" stroke="var(--color-Expenses)" fillOpacity={1} fill="url(#colorExpenses)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="border-slate-200 dark:border-slate-800 animate-in fade-in-50 duration-700">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest exam score changes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {recentActivities.map(log => (
                                <li key={log.id} className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarFallback>{log.updatedBy.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm">
                                        <p><span className="font-semibold">{log.updatedBy}</span> updated <span className="font-semibold">{log.studentName}'s</span> score.</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <span>{log.oldScore}</span> <ArrowRight className="h-3 w-3" /> <span>{log.newScore}</span> 
                                            <span className="mx-1">•</span> {format(new Date(log.timestamp), 'PP')}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </main>
        <ExpenditureModal 
            isOpen={isExpenditureModalOpen}
            onClose={() => setIsExpenditureModalOpen(false)}
            onSave={handleSaveExpense}
        />
        </>
    );
}
