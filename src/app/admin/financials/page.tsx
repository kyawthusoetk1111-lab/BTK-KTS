'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { DollarSign, Wallet, Calendar, Users, Download, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const monthlyRevenueData = [
    { month: "Jan", revenue: 150000 },
    { month: "Feb", revenue: 220000 },
    { month: "Mar", revenue: 450000 },
    { month: "Apr", revenue: 525000 },
    { month: "May", revenue: 680000 },
    { month: "Jun", revenue: 610000 },
];

const revenueSourceData = [
  { name: 'Pro Subscriptions', value: 480000, fill: 'hsl(var(--chart-1))' },
  { name: 'Quiz Sales', value: 200000, fill: 'hsl(var(--chart-4))' },
];

const recentTransactionsData = [
  { id: 'PAY-001', student: 'Aung Kyaw', amount: 5000, type: 'Pro Subscription', date: '2024-06-15' },
  { id: 'PAY-002', student: 'Myat Thu', amount: 1000, type: 'Quiz: Math 101', date: '2024-06-14' },
  { id: 'PAY-003', student: 'Thiri Aung', amount: 5000, type: 'Pro Subscription', date: '2024-06-14' },
  { id: 'PAY-004', student: 'Kaung Htet', amount: 1500, type: 'Quiz: Physics II', date: '2024-06-13' },
  { id: 'PAY-005', student: 'Yadanar Myo', amount: 5000, type: 'Pro Subscription', date: '2024-06-12' },
];


const chartConfig = {
  revenue: {
    label: 'Revenue (MMK)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

export default function FinancialsPage() {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    // Mock data for stat cards
    const totalRevenue = 2635000;
    const monthlyIncome = 610000;
    const pendingFees = 12000;
    const proSubscriptions = 188;

    const handleExport = () => {
        setIsExporting(true);
        toast({
            title: 'Generating Report',
            description: 'Financial summary is being generated...',
        });

        setTimeout(() => {
            const dataToExport = recentTransactionsData.map(item => ({
                'Transaction ID': item.id,
                'Student Name': item.student,
                'Amount': item.amount,
                'Type': item.type,
                'Date': item.date,
            }));
    
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Summary");
            
            const today = format(new Date(), 'yyyy-MM-dd');
            XLSX.writeFile(workbook, `Financial_Summary_Report_${today}.xlsx`);
            setIsExporting(false);
             toast({
                title: 'Report Generated',
                description: 'Financial summary has been downloaded.',
            });
        }, 1500);
    };

    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50 bg-slate-100 dark:bg-slate-900">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Insights</h2>
                    <p className="text-muted-foreground">
                        Track subscription and exam fee revenues.
                    </p>
                </div>
                 <Button onClick={handleExport} variant="outline" disabled={isExporting}>
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export Summary
                </Button>
            </div>

             {/* Stat Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{totalRevenue.toLocaleString()} MMK</div>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400/80">All-time earnings</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-800 dark:text-sky-300">This Month's Revenue</CardTitle>
                        <Calendar className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-900 dark:text-sky-100">{monthlyIncome.toLocaleString()} MMK</div>
                        <p className="text-xs text-sky-700 dark:text-sky-400/80">+15% from last month</p>
                    </CardContent>
                </Card>
                 <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">Pending Fees</CardTitle>
                        <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{pendingFees.toLocaleString()} MMK</div>
                        <p className="text-xs text-amber-700 dark:text-amber-400/80">From 3 unverified payments</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-300">Pro Subscriptions</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">{proSubscriptions}</div>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400/80">+12 new this month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>6-Month Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-72 w-full">
                             <ResponsiveContainer>
                                <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
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

                <Card className="lg:col-span-2 bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                    <CardHeader>
                        <CardTitle>Income Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={{}} className="h-72 w-full">
                            <ResponsiveContainer>
                                <RechartsPieChart>
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie 
                                        data={revenueSourceData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60}
                                        outerRadius={80} 
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        strokeWidth={2}
                                    >
                                        {revenueSourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            
            {/* Recent Transactions Table */}
            <Card className="bg-white/60 dark:bg-black/20 backdrop-blur-sm border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>The last 5 successful payments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactionsData.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-mono">{t.id}</TableCell>
                                    <TableCell>{t.student}</TableCell>
                                    <TableCell>{t.type}</TableCell>
                                    <TableCell>{t.date}</TableCell>
                                    <TableCell className="text-right font-medium">{t.amount.toLocaleString()} MMK</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

        </main>
    );
}
