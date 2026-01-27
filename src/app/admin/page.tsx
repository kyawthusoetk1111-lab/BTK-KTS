'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  useCollection, useFirestore, useMemoFirebase, 
  addDocumentNonBlocking, useAuth 
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Users, Wallet, TrendingUp, Scale, FilePlus2, UserRoundPlus, 
  ListChecks, ArrowRight, Loader2, Download, Calendar as CalendarIcon, 
  ShieldAlert, AlertCircle, BarChart3 
} from 'lucide-react';
import type { UserProfile, Payment, Expenditure, AuditLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, Legend, 
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer 
} from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { format, subMonths, isSameMonth, subDays, isAfter } from 'date-fns';
import { ExpenditureModal } from '@/components/admin/expenditure-modal';
import { useToast } from '@/hooks/use-toast';
import { mockAuditLogs } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Configuration ---
const ADMIN_EMAIL = "kyawthusoetk1111@gmail.com";
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const chartConfig = {
  Revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
  Expenses: { label: 'Expenses', color: 'hsl(var(--destructive))' },
} satisfies ChartConfig;

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isExpenditureModalOpen, setIsExpenditureModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30days');

  // --- Security: Admin Access Check ---
  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      toast({ variant: "destructive", title: "Access Denied", description: "Admin သီးသန့်နေရာဖြစ်ပါသည်။" });
      router.push('/');
    }
  }, [user, authLoading, router, toast]);

  // --- Data Fetching ---
  const usersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const paymentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'approved')) : null, [firestore]);
  const pendingPaymentsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'payments'), where('status', '==', 'pending')) : null, [firestore]);
  const expendituresQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'expenditures')) : null, [firestore]);

  const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);
  const { data: payments, isLoading: isLoadingPayments } = useCollection<Payment>(paymentsQuery);
  const { data: pendingPayments } = useCollection<Payment>(pendingPaymentsQuery);
  const { data: expenditures, isLoading: isLoadingExpenditures } = useCollection<Expenditure>(expendituresQuery);

  const isLoading = isLoadingUsers || isLoadingPayments || isLoadingExpenditures || authLoading;

  // --- Date Filtering Logic ---
  const filterDate = useMemo(() => {
    const now = new Date();
    if (dateRange === '90days') return subDays(now, 90);
    if (dateRange === 'year') return subDays(now, 365);
    return subDays(now, 30);
  }, [dateRange]);

  // --- Logic Calculations ---
  const stats = useMemo(() => {
    if (!users || !payments || !expenditures) return null;
    const filteredPayments = payments.filter(p => isAfter(new Date(p.createdAt), filterDate));
    const filteredExpenses = expenditures.filter(e => isAfter(new Date(e.date), filterDate));
    
    const rev = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const exp = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    const methodCounts: Record<string, number> = {};
    filteredPayments.forEach(p => {
      const m = p.method || 'Other';
      methodCounts[m] = (methodCounts[m] || 0) + p.amount;
    });

    return {
      totalStudents: users.filter(u => u.userType === 'student').length,
      revenue: rev,
      expenses: exp,
      netProfit: rev - exp,
      paymentMethods: Object.keys(methodCounts).map((key, i) => ({ name: key, value: methodCounts[key], fill: COLORS[i % COLORS.length] })),
      studentGrowth: [5,4,3,2,1,0].map(i => ({ name: format(subMonths(new Date(), i), 'MMM'), Students: Math.floor(Math.random() * 20) + 5 }))
    };
  }, [users, payments, expenditures, filterDate]);

  const financialTrendData = useMemo(() => {
    return [5,4,3,2,1,0].map(i => {
      const d = subMonths(new Date(), i);
      return {
        name: format(d, 'MMM'),
        Revenue: payments?.filter(p => isSameMonth(new Date(p.createdAt), d)).reduce((s, p) => s + p.amount, 0) || 0,
        Expenses: expenditures?.filter(e => isSameMonth(new Date(e.date), d)).reduce((s, e) => s + e.amount, 0) || 0,
      };
    });
  }, [payments, expenditures]);

  // --- Handlers ---
  const handleExportCSV = () => {
    if (!payments) return;
    const csv = "Date,Student,Amount,Method\n" + payments.map(p => `${format(new Date(p.createdAt), 'yyyy-MM-dd')},${p.studentName},${p.amount},${p.method}`).join("\n");
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click();
  };

  const handleSaveExpense = (newExpense: Omit<Expenditure, 'id'>) => {
    if (!firestore) return;
    addDocumentNonBlocking(collection(firestore, 'expenditures'), { ...newExpense, id: crypto.randomUUID() });
    toast({ title: 'Expense Recorded!' });
  };

  // --- Rendering States ---
  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  if (user?.email !== ADMIN_EMAIL) return (
    <div className="h-screen flex flex-col items-center justify-center text-center p-6">
      <ShieldAlert className="text-red-500 mb-4" size={60} />
      <h1 className="text-2xl font-bold">ဝင်ရောက်ခွင့်မရှိပါ</h1>
      <p className="text-slate-500 mt-2">ဆရာ့ Email {ADMIN_EMAIL} ဖြင့်သာ ဝင်ရောက်နိုင်ပါသည်။</p>
      <Button asChild className="mt-6" variant="outline"><Link href="/">မူလစာမျက်နှာသို့</Link></Button>
    </div>
  );

  return (
    <main className="flex-1 p-6 sm:p-8 space-y-8 bg-slate-50/50 min-h-screen animate-in fade-in-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Admin Panel</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 
            Logged in as: <span className="font-semibold text-slate-700">{ADMIN_EMAIL}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] bg-white border-slate-200"><CalendarIcon className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="30days">Last 30 Days</SelectItem><SelectItem value="90days">Last 90 Days</SelectItem><SelectItem value="year">Full Year</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-white"><Download className="w-4 h-4 mr-2" /> Export</Button>
          <Button onClick={() => setIsExpenditureModalOpen(true)} className="bg-blue-600 hover:bg-blue-700"><FilePlus2 className="w-4 h-4 mr-2" /> New Expense</Button>
        </div>
      </div>

      {/* Alert */}
      {pendingPayments && pendingPayments.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between text-amber-800 animate-bounce">
          <div className="flex items-center gap-3"><AlertCircle size={20} /> <span className="font-medium">အတည်ပြုရန်ကျန်သော ငွေလွှဲ {pendingPayments.length} ခုရှိပါသည်။</span></div>
          <Button asChild variant="ghost" className="text-amber-900 underline"><Link href="/billing">စစ်ဆေးရန်</Link></Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Students" value={stats?.totalStudents} sub="Active learners" icon={Users} color="emerald" isLoading={isLoading} />
        <StatsCard title="Revenue" value={`${stats?.revenue.toLocaleString()} MMK`} sub="Total Income" icon={TrendingUp} color="sky" isLoading={isLoading} />
        <StatsCard title="Expenses" value={`${stats?.expenses.toLocaleString()} MMK`} sub="Total Outgo" icon={Wallet} color="amber" isLoading={isLoading} />
        <StatsCard title="Profit" value={`${stats?.netProfit.toLocaleString()} MMK`} sub="Net Earnings" icon={Scale} color="indigo" isLoading={isLoading} />
      </div>

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1"><TabsTrigger value="financial">Financial Analysis</TabsTrigger><TabsTrigger value="growth">Student Activity</TabsTrigger></TabsList>

        <TabsContent value="financial" className="grid gap-6 md:grid-cols-7">
          <Card className="md:col-span-4 border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Income vs Expenses</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer>
                  <AreaChart data={financialTrendData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="Revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                    <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="md:col-span-3 border-slate-200 shadow-sm">
            <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={stats?.paymentMethods} dataKey="value" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {stats?.paymentMethods.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="grid gap-6 md:grid-cols-7">
           <Card className="md:col-span-4 border-slate-200 shadow-sm">
             <CardHeader><CardTitle>Registration Growth</CardTitle></CardHeader>
             <CardContent className="h-[300px]">
               <ResponsiveContainer>
                 <BarChart data={stats?.studentGrowth}><XAxis dataKey="name" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false}/><Tooltip cursor={{fill: 'transparent'}}/><Bar dataKey="Students" fill="#3b82f6" radius={[4,4,0,0]} /></BarChart>
               </ResponsiveContainer>
             </CardContent>
           </Card>
           <Card className="md:col-span-3 border-slate-200 shadow-sm">
             <CardHeader><CardTitle>Recent Audit</CardTitle></CardHeader>
             <CardContent>
                <div className="space-y-4">
                  {mockAuditLogs['submission_graded']?.slice(0, 4).map((log: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm border-b pb-3 last:border-0">
                      <Avatar className="h-8 w-8"><AvatarFallback>{log.updatedBy[0]}</AvatarFallback></Avatar>
                      <div><p className="font-medium">{log.updatedBy} graded a quiz</p><p className="text-xs text-slate-500">{log.oldScore} → {log.newScore} • {format(new Date(log.timestamp), 'MMM d')}</p></div>
                    </div>
                  ))}
                </div>
             </CardContent>
             <CardFooter><Button variant="ghost" className="w-full text-blue-600" asChild><Link href="/admin/audit">See All Logs <ArrowRight size={16} className="ml-2"/></Link></Button></CardFooter>
           </Card>
        </TabsContent>
      </Tabs>

      <ExpenditureModal isOpen={isExpenditureModalOpen} onClose={() => setIsExpenditureModalOpen(false)} onSave={handleSaveExpense} />
    </main>
  );
}

function StatsCard({ title, value, sub, icon: Icon, color, isLoading }: any) {
  const c = { emerald: "text-emerald-600", sky: "text-sky-600", amber: "text-amber-600", indigo: "text-indigo-600" }[color as string] || "text-slate-600";
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <Icon size={18} className={c} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : value}</div>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
