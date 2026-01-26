'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { DollarSign, Wallet, Calendar, Users, Download, Loader2, Landmark, Plus, Scale } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell, BarChart, Bar } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Payment, Expenditure } from '@/lib/types';
import { ExpenditureModal } from '@/components/admin/expenditure-modal';

const chartConfig = {
  revenue: { label: 'Revenue (MMK)', color: 'hsl(var(--chart-1))' },
  income: { label: 'Income', color: 'hsl(var(--chart-1))' },
  expense: { label: 'Expense', color: 'hsl(var(--chart-4))' },
} satisfies ChartConfig;

export default function FinancialsPage() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isExporting, setIsExporting] = useState(false);
    const [isExpenditureModalOpen, setIsExpenditureModalOpen] = useState(false);

    const paymentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'approved')) : null, [firestore]);
    const expendituresQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'expenditures')) : null, [firestore]);

    const { data: payments, isLoading: isLoadingPayments } = useCollection<Payment>(paymentsQuery);
    const { data: expenditures, isLoading: isLoadingExpenditures } = useCollection<Expenditure>(expendituresQuery);

    const { totalIncome, monthlyIncome, pendingFees, incomeBySource, monthlyChartData } = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let totalIncome = 0;
        let monthlyIncome = 0;
        let pendingFees = 0; // This would typically come from a different query

        const incomeBySource = { 'Pro Subscriptions': 0, 'Quiz Sales': 0 };

        const monthlyChartDataMap = new Map<string, { month: string, revenue: number }>();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const monthName = format(date, 'MMM');
            monthlyChartDataMap.set(monthName, { month: monthName, revenue: 0 });
        }
        
        if (payments) {
            payments.forEach(p => {
                totalIncome += p.amount;
                const paymentDate = new Date(p.createdAt);
                if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
                    monthlyIncome += p.amount;
                }
                
                const monthName = format(paymentDate, 'MMM');
                if (monthlyChartDataMap.has(monthName)) {
                    monthlyChartDataMap.get(monthName)!.revenue += p.amount;
                }

                if (p.itemDescription.toLowerCase().includes('subscription')) {
                    incomeBySource['Pro Subscriptions'] += p.amount;
                } else {
                    incomeBySource['Quiz Sales'] += p.amount;
                }
            });
        }
        return { totalIncome, monthlyIncome, pendingFees: 12000, incomeBySource, monthlyChartData: Array.from(monthlyChartDataMap.values()) };
    }, [payments]);

    const { totalExpenditures, monthlyExpenditures } = useMemo(() => {
        let total = 0;
        let monthly = 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        if (expenditures) {
            expenditures.forEach(e => {
                total += e.amount;
                const expenditureDate = new Date(e.date);
                 if (expenditureDate.getMonth() === currentMonth && expenditureDate.getFullYear() === currentYear) {
                    monthly += e.amount;
                }
            });
        }
        return { totalExpenditures: total, monthlyExpenditures: monthly };
    }, [expenditures]);
    
    const netProfit = totalIncome - totalExpenditures;
    
    const incomeVsExpenseData = [
        { name: 'Monthly Flow', income: monthlyIncome, expense: monthlyExpenditures },
    ];
    
    const revenueSourceData = Object.entries(incomeBySource).map(([name, value], index) => ({
      name, value, fill: index === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-4))',
    }));

    const handleSaveExpense = (newExpense: Omit<Expenditure, 'id'>) => {
        if (!firestore) return;
        const collectionRef = collection(firestore, 'expenditures');
        addDocumentNonBlocking(collectionRef, { ...newExpense, id: crypto.randomUUID() });
        toast({ title: 'Expense Recorded!' });
    };

    const handleExport = () => {
        // This function would need to be updated to export both income and expenses
        toast({ title: 'Export coming soon!' });
    };

    const isLoading = isLoadingPayments || isLoadingExpenditures;

    return (
        <>
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50 bg-slate-100 dark:bg-slate-900">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Insights</h2>
                    <p className="text-muted-foreground">
                        Track subscription and exam fee revenues.
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={() => setIsExpenditureModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Expense
                    </Button>
                    <Button onClick={handleExport} variant="outline" disabled={isExporting}>
                        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Export Summary
                    </Button>
                 </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Net Profit</CardTitle>
                        <Scale className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{isLoading ? <Loader2 className="animate-spin" /> : `${netProfit.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400/80">All-time earnings</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-800 dark:text-sky-300">This Month's Revenue</CardTitle>
                        <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-900 dark:text-sky-100">{isLoading ? <Loader2 className="animate-spin" /> : `${monthlyIncome.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-sky-700 dark:text-sky-400/80">+15% from last month</p>
                    </CardContent>
                </Card>
                 <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">This Month's Expenses</CardTitle>
                        <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{isLoading ? <Loader2 className="animate-spin" /> : `${monthlyExpenditures.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-amber-700 dark:text-amber-400/80">From {expenditures?.length || 0} transactions</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Total Income</CardTitle>
                        <Landmark className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{isLoading ? <Loader2 className="animate-spin" /> : `${totalIncome.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400/80">All-time approved payments</p>
                    </CardContent>
                </Card>
                 <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700 lg:col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">Total Expenses</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">{isLoading ? <Loader2 className="animate-spin" /> : `${totalExpenditures.toLocaleString()} MMK`}</div>
                        <p className="text-xs text-red-700 dark:text-red-400/80">All-time expenditures</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>6-Month Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-72 w-full">
                             <ResponsiveContainer>
                                <AreaChart data={monthlyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                                    <Tooltip
                                        cursor={{fill: 'hsl(var(--muted) / 0.3)'}}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>This Month: Income vs. Expense</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={chartConfig} className="h-72 w-full">
                            <ResponsiveContainer>
                                <BarChart data={incomeVsExpenseData}>
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${Number(value) / 1000}k`} />
                                    <Tooltip cursor={{fill: 'hsl(var(--muted) / 0.3)'}} content={<ChartTooltipContent />} />
                                    <Legend />
                                    <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Expenditure History</CardTitle>
                    <CardDescription>A log of all recorded business expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingExpenditures ? (
                                <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="animate-spin mx-auto" /></TableCell></TableRow>
                            ) : expenditures && expenditures.length > 0 ? expenditures.map((e) => (
                                <TableRow key={e.id}>
                                    <TableCell>{format(new Date(e.date), 'PPP')}</TableCell>
                                    <TableCell>{e.description}</TableCell>
                                    <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                                    <TableCell className="text-right font-medium">{e.amount.toLocaleString()} MMK</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={4} className="text-center h-24">No expenditures recorded yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </main>
        <ExpenditureModal 
            isOpen={isExpenditureModalOpen}
            onClose={() => setIsExpenditureModalOpen(false)}
            onSave={handleSaveExpense}
        />
        </>
    );
}
    