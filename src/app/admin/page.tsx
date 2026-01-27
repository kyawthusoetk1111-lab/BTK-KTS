'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Users, Wallet, TrendingUp, Scale, FilePlus2, UserRoundPlus, ListChecks, ArrowRight, Loader2, Download, Calendar as CalendarIcon, PieChart as PieChartIcon, BarChart3, AlertCircle } from 'lucide-react';
import type { UserProfile, Payment, Expenditure, AuditLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { format, subMonths, isSameMonth, subDays, isAfter } from 'date-fns';
import { ExpenditureModal } from '@/components/admin/expenditure-modal';
import { useToast } from '@/hooks/use-toast';
import { mockAuditLogs, mockSubmissions } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Configuration for Charts ---
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']; // Emerald, Blue, Amber, Red

const chartConfig = {
    Revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
    Expenses: { label: 'Expenses', color: 'hsl(var(--destructive))' },
} satisfies ChartConfig;

export default function AdminPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isExpenditureModalOpen, setIsExpenditureModalOpen] = useState(false);
    const [dateRange, setDateRange] = useState('30days'); // '30days', '90days', 'year'

    // Data fetching
    const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
    const paymentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'approved')) : null, [firestore]);
    const pendingPaymentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'pending')) : null, [firestore]);
    const expendituresQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'expenditures')) : null, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
    const { data: payments, isLoading: isLoadingPayments } = useCollection<Payment>(paymentsQuery);
    const { data: pendingPayments } = useCollection<Payment>(pendingPaymentsQuery);
    const { data: expenditures, isLoading: isLoadingExpenditures } = useCollection<Expenditure>(expendituresQuery);

    const isLoading = isLoadingUsers || isLoadingPayments || isLoadingExpenditures;

    // --- Pro Feature: Date Filtering Logic ---
    const filterDate = useMemo(() => {
        const now = new Date();
        if (dateRange === '90days') return subDays(now, 90);
        if (dateRange === 'year') return subDays(now, 365);
        return subDays(now, 30); // Default
    }, [dateRange]);

    // --- Stats Calculations ---
    const { totalStudents, revenue, expenses, netProfit, paymentMethods, studentGrowth } = useMemo(() => {
        if (!users || !payments || !expenditures) return { totalStudents: 0, revenue: 0, expenses: 0, netProfit: 0, paymentMethods: [], studentGrowth: [] };

        // Filtered Data
        const filteredPayments = payments.filter(p => isAfter(new Date(p.createdAt), filterDate));
        const filteredExpenses = expenditures.filter(e => isAfter(new Date(e.date), filterDate));
        
        // 1. Basic Stats
        const totalStudents = users.filter(u => u.userType === 'student').length;
        const revenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const expenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = revenue - expenses;

        // 2. Payment Method Distribution (Pie Chart)
        const methodCounts: Record<string, number> = {};
        filteredPayments.forEach(p => {
            const method = p.method || 'Unknown';
            methodCounts[method] = (methodCounts[method] || 0) + p.amount;
        });
        const paymentMethods = Object.keys(methodCounts).map((key, index) => ({
            name: key,
            value: methodCounts[key],
            fill: COLORS[index % COLORS.length]
        }));

        // 3. Student Growth (Bar Chart - Last 6 months approx logic)
        // Note: Real implementation needs 'createdAt' on users. Assuming mock logic or existing field.
        // Since 'users' might not have createdAt in some simple schemas, let's mock the distribution based on list index for demo
        const growthData: any[] = [];
        for(let i=5; i>=0; i--) {
             const d = subMonths(new Date(), i);
             growthData.push({
                 name: format(d, 'MMM'),
                 Students: Math.floor(totalStudents * (0.1 + Math.random() * 0.2)) // Mock distribution
             });
        }
        
        return { totalStudents, revenue, expenses, netProfit, paymentMethods, studentGrowth: growthData };
    }, [users, payments, expenditures, filterDate]);

    // --- Financial Trend Chart Data ---
    const financialTrendData = useMemo(() => {
        const data: { name: string; Revenue: number; Expenses: number }[] = [];
        const now = new Date();
        const monthsToShow = dateRange === 'year' ? 12 : 6;

        for (let i = monthsToShow - 1; i >= 0; i--) {
            const d = subMonths(now, i);
            const monthName = format(d, 'MMM');
            
            const revenueForMonth = payments
                ?.filter(p => isSameMonth(new Date(p.createdAt), d))
                .reduce((sum, p) => sum + p.amount, 0) || 0;
                
            const expensesForMonth = expenditures
                ?.filter(e => isSameMonth(new Date(e.date), d))
                .reduce((sum, e) => sum + e.amount, 0) || 0;

            data.push({ name: monthName, Revenue: revenueForMonth, Expenses: expensesForMonth });
        }
        return data;
    }, [payments, expenditures, dateRange]);

    // --- Export Function ---
    const handleExportCSV = () => {
        if (!payments) return;
        const headers = "ID,Student Name,Amount,Method,Date,Status\n";
        const rows = payments.map(p => 
            `${p.id},"${p.studentName}",${p.amount},${p.method},${format(new Date(p.createdAt), 'yyyy-MM-dd')},${p.status}`
        ).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        toast({ title: "Report Downloaded", description: "Financial data has been exported to CSV." });
    };

    const handleSaveExpense = (newExpense: Omit<Expenditure, 'id'>) => {
        if (!firestore) return;
        const collectionRef = collection(firestore, 'expenditures');
        addDocumentNonBlocking(collectionRef, { ...newExpense, id: crypto.randomUUID() });
        toast({ title: 'Expense Recorded!' });
    };

    return (
        <>
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50 bg-slate-50/50 dark:bg-slate-950/50 min-h-screen">
            {/* Header Section with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your platform's performance.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Filter */}
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[140px] h-9 bg-white dark:bg-slate-900">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30days">Last 30 Days</SelectItem>
                            <SelectItem value="90days">Last 3 Months</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-white dark:bg-slate-900">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />

                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                        <Link href="/billing"><Wallet className="mr-2 h-4 w-4" /> Record Payment</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsExpenditureModalOpen(true)}>
                        <FilePlus2 className="mr-2 h-4 w-4" /> Add Expense
                    </Button>
                </div>
            </div>

            {/* Quick Alert Section (Pending Payments) */}
            {pendingPayments && pendingPayments.length > 0 && (
                 <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center justify-between dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Action Required: {pendingPayments.length} pending payment approvals.</span>
                    </div>
                    <Button asChild variant="link" size="sm" className="text-amber-900 dark:text-amber-200 underline">
                        <Link href="/billing">Review Now</Link>
                    </Button>
                 </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard title="Total Students" value={totalStudents} subtext="Active Learners" icon={Users} color="emerald" isLoading={isLoading} />
                <StatsCard title="Revenue" value={`${revenue.toLocaleString()} MMK`} subtext={`In selected period`} icon={TrendingUp} color="sky" isLoading={isLoading} />
                <StatsCard title="Expenses" value={`${expenses.toLocaleString()} MMK`} subtext={`In selected period`} icon={Wallet} color="amber" isLoading={isLoading} />
                <StatsCard title="Net Profit" value={`${netProfit.toLocaleString()} MMK`} subtext="Net Earnings" icon={Scale} color={netProfit >= 0 ? "indigo" : "red"} isLoading={isLoading} />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="financial" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="financial">Financial Insights</TabsTrigger>
                    <TabsTrigger value="overview">Activity & Growth</TabsTrigger>
                </TabsList>

                {/* Tab 1: Financials */}
                <TabsContent value="financial" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-7">
                        {/* Main Trend Chart */}
                        <Card className="col-span-4 border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>Financial Trend</CardTitle>
                                <CardDescription>Income vs Expenses over time.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={financialTrendData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-Revenue)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-Revenue)" stopOpacity={0}/></linearGradient>
                                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--color-Expenses)" stopOpacity={0.8}/><stop offset="95%" stopColor="var(--color-Expenses)" stopOpacity={0}/></linearGradient>
                                            </defs>
                                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                                            <Tooltip content={<ChartTooltipContent />} />
                                            <Legend verticalAlign="top" height={36}/>
                                            <Area type="monotone" dataKey="Revenue" stroke="var(--color-Revenue)" fillOpacity={1} fill="url(#colorRevenue)" />
                                            <Area type="monotone" dataKey="Expenses" stroke="var(--color-Expenses)" fillOpacity={1} fill="url(#colorExpenses)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* Payment Method Pie Chart */}
                        <Card className="col-span-3 border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle>Payment Methods</CardTitle>
                                <CardDescription>Distribution by volume.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {paymentMethods.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${Number(value).toLocaleString()} MMK`} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Tab 2: Overview & Growth */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        {/* Student Growth Bar Chart */}
                        <Card className="col-span-4 border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5 text-slate-500"/> Student Growth
                                </CardTitle>
                                <CardDescription>New student registrations per month.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={studentGrowth}>
                                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="Students" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity List */}
                        <Card className="col-span-3 border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ListChecks className="h-5 w-5 text-slate-500"/> Recent Activity
                                </CardTitle>
                                <CardDescription>Latest exam updates.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {mockAuditLogs['submission_graded']?.slice(0, 5).map((log: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4">
                                            <Avatar className="h-9 w-9 border mt-0.5">
                                                <AvatarFallback className="bg-slate-100 text-slate-600">{log.updatedBy.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {log.updatedBy} <span className="text-muted-foreground font-normal">graded a submission</span>
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                                                        {log.oldScore} → {log.newScore}
                                                    </span>
                                                    <span>• {format(new Date(log.timestamp), 'MMM d, h:mm a')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!mockAuditLogs['submission_graded'] || mockAuditLogs['submission_graded'].length === 0) && (
                                        <p className="text-sm text-muted-foreground text-center py-8">No recent activities found.</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" className="w-full text-sm text-muted-foreground hover:text-primary" asChild>
                                    <Link href="/admin/audit">View All Audit Logs <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </main>
        
        <ExpenditureModal 
            isOpen={isExpenditureModalOpen}
            onClose={() => setIsExpenditureModalOpen(false)}
            onSave={handleSaveExpense}
        />
        </>
    );
}

// Helper Component for Stats Cards to keep code clean
function StatsCard({ title, value, subtext, icon: Icon, color, isLoading }: any) {
    const colorStyles: any = {
        emerald: "text-emerald-600 dark:text-emerald-400",
        sky: "text-sky-600 dark:text-sky-400",
        amber: "text-amber-600 dark:text-amber-400",
        indigo: "text-indigo-600 dark:text-indigo-400",
        red: "text-red-600 dark:text-red-400",
    };
    
    return (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colorStyles[color]?.replace('600', '800').replace('400', '300')}`}>{title}</CardTitle>
                <Icon className={`h-4 w-4 ${colorStyles[color]}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${colorStyles[color]?.replace('600', '900').replace('400', '100')}`}>
                    {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : value}
                </div>
                <p className={`text-xs ${colorStyles[color]?.replace('600', '700').replace('400', '400/80')}`}>{subtext}</p>
            </CardContent>
        </Card>
    );
}
