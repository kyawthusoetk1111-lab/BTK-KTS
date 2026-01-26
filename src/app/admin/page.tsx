'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserPlus, FileCheck, DollarSign, Wallet, UserRoundPlus } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { SubjectPerformance } from '@/components/admin/subject-performance';
import { Button } from '@/components/ui/button';
import { 
    AreaChart, 
    Area, 
    ResponsiveContainer, 
    XAxis, 
    YAxis, 
    Tooltip,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { 
    ChartContainer, 
    ChartTooltipContent 
} from '@/components/ui/chart';

// Mock Data for new charts
const monthlyRevenueData = [
  { month: "March", revenue: 450000 },
  { month: "April", revenue: 525000 },
  { month: "May", revenue: 680000 },
  { month: "June", revenue: 610000 },
];

const studentPaymentData = [
  { name: 'Paid', value: 188, fill: 'hsl(var(--chart-1))' },
  { name: 'Pending', value: 32, fill: 'hsl(var(--chart-4))' },
];


export default function AdminPage() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

    const totalStudents = users?.filter(u => u.userType === 'student').length || 0;
    const totalTeachers = users?.filter(u => u.userType === 'teacher').length || 0;
    
    // These would be calculated from real data in a full implementation
    const activeExams = 12; 
    const currentMonthRevenue = 610000;

    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
                    <p className="text-muted-foreground">
                        A quick glance at your platform's statistics.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/users">
                            <UserRoundPlus className="mr-2 h-4 w-4" />
                            Add New User
                        </Link>
                    </Button>
                     <Button asChild>
                        <Link href="/billing">
                            <Wallet className="mr-2 h-4 w-4" />
                            Record Payment
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{isLoadingUsers ? '...' : totalStudents}</div>
                        <p className="text-xs text-emerald-700/80">+12 since last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-800">Total Teachers</CardTitle>
                        <UserPlus className="h-4 w-4 text-sky-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-900">{isLoadingUsers ? '...' : totalTeachers}</div>
                        <p className="text-xs text-sky-700/80">+3 since last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-800">Active Exams</CardTitle>
                        <FileCheck className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900">{activeExams}</div>
                         <p className="text-xs text-indigo-700/80">2 live right now</p>
                    </CardContent>
                </Card>
                 <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{currentMonthRevenue.toLocaleString()} MMK</div>
                        <p className="text-xs text-amber-700/80">+15% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Monthly Revenue</CardTitle>
                        <CardDescription>Income trends for the last 4 months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={{}} className="h-64 w-full">
                            <ResponsiveContainer>
                                <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickMargin={8} 
                                        tickFormatter={(value) => `${Number(value) / 1000}k`} 
                                    />
                                    <Tooltip
                                        cursor={{fill: 'hsl(var(--muted) / 0.3)'}}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Summary</CardTitle>
                        <CardDescription>Breakdown of paid vs. pending students.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         <ChartContainer config={{}} className="h-64 w-full">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    <Pie 
                                        data={studentPaymentData} 
                                        dataKey="value" 
                                        nameKey="name" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={80} 
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {studentPaymentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <SubjectPerformance />

        </main>
    );
}
