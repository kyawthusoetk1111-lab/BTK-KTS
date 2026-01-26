'use client';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TeacherSidebar } from '@/components/teacher-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DollarSign, Calendar, Users, Clock, Search, FileText, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { ManualPaymentModal } from '@/components/manual-payment-modal';

const initialTransactionsData = [
  { id: 'INV001', studentName: 'Aung Aung', plan: 'Pro Subscription', date: '2024-05-15', amount: 5000, status: 'Paid' },
  { id: 'INV002', studentName: 'Ma Ma', plan: 'Quiz: Math 101', date: '2024-05-18', amount: 1000, status: 'Paid' },
  { id: 'INV003', studentName: 'Hla Hla', plan: 'Pro Subscription', date: '2024-06-01', amount: 5000, status: 'Pending' },
  { id: 'INV004', studentName: 'Kyaw Kyaw', plan: 'Quiz: Physics Final', date: '2024-04-20', amount: 1500, status: 'Overdue' },
  { id: 'INV005', studentName: 'Su Su', plan: 'Pro Subscription', date: '2024-05-25', amount: 5000, status: 'Paid' },
  { id: 'INV006', studentName: 'Nyi Nyi', plan: 'Quiz: English Lit', date: '2024-06-05', amount: 1200, status: 'Pending' },
];

const revenueData = [
  { month: 'Jan', revenue: 40000 },
  { month: 'Feb', revenue: 30000 },
  { month: 'Mar', revenue: 50000 },
  { month: 'Apr', revenue: 47000 },
  { month: 'May', revenue: 60000 },
  { month: 'Jun', revenue: 58000 },
];

const chartConfig = {
  revenue: {
    label: 'Revenue (MMK)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;


export default function BillingPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState(initialTransactionsData);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const totalRevenue = transactions.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0);
    const thisMonthRevenue = transactions.filter(t => t.status === 'Paid' && new Date(t.date).getMonth() === new Date().getMonth()).reduce((sum, t) => sum + t.amount, 0);
    const activeSubscriptions = transactions.filter(t => t.plan.includes('Subscription') && t.status === 'Paid').length;
    const pendingDue = transactions.filter(t => t.status === 'Pending' || t.status === 'Overdue').reduce((sum, t) => sum + t.amount, 0);

    const filteredTransactions = transactions.filter(t => 
        t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDownloadReceipt = (transaction: typeof transactions[0]) => {
      toast({ title: `Generating Receipt ${transaction.id}` });
      const doc = new jsPDF();
  
      // Placeholder for logo - replace with your actual base64 logo
      const schoolLogoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAIpSURBVGhD7ZlPqgFRFMcde/N972YwGCAx2FgsNhbBRiwWCSx2FotdoUgsFgvxGywGfBQLwWAw4AsMh/EvSHDk5g3fuTfnvjK4v3P55n/mm5M730lRAICgC+T3k79Pfh/5Y3nZl5Y/S/45+fPkW/L9Rck/JA8kX5A8kExQDBBkgABDBgiggAYIIDCAAAIIEEDgB/zL3e8n9xfj5vM7e8dF95N/3hCIM0GACCaYAAEEB2BAAAMeIECAASZAAIEP8L2/pX++83t1ePxyOtw5d/D74Pz7v/+4ECA/k3xB8kbyz+SX8p4/AwQQmIABAgxwAAIE8ECCASZAAIEH+J5+EvnF+O/ySflj/Kvky/JnDCDPAAEEhiFAAAGeIMAAgQSIF0GACAYYIIAAAwQI4E/g6QcMwV8e3k8+Lt+Ubyf/Uf46+WN52T8p35Kflj+TvA+4YfL7yR8n35Eflz8v9o2wAgEGEGCAAR4gwAADDBAggMABD1CACAEEEDiA/wMGCBDAG4TAmQEEGCAgQAABBDgAAQIYcBABAgQYIIBGAQIEsEAACBDgAgQIIEAECCDwi/w/z5LflH8hP5E8kTxDgiQIIIDQAgQY4LAIECCAABEggMAf+J1+SP4l/yZ/KD8i/yx/Lz8u/yT/Q/Iz+XdyWf5A8kf5e/I7yTvk38v35U/k48nfJG/IX4l/l/+d/Dt57v5+AQCAv3kG5C/kbfIN+WfyLvlX8tfy0/Iv5G0GECDwBQYQYIAIEGCAAQQQQAABAgTQwAAChBdggAIGEECAgAAGECDwBQYQYIAIEGCAAQQQQAABAgTQwAAChBdggAIGEECAgAAGECDwBQYQYIAIEGCAAQQQQAABAgTQwAAChBdggAIGEECAgAAGECDwBQYQYIAIEGCAAQQQQAABAgTQwAAChBdggAIGEECAgAAGECDwBQYQYIAIEGCAAQQQQAABAgTQwAAChBdggAIGEECAgAAGECDwBQYQYIAIEGCAAQQQQAABAgTQwAAChBdggAIGEECAgAAGECDwBQYQYIAIEGCAAQQQQAABAgTQwAAChBdggAIGEECAgAAGECDwBQYQYIAIEGCAAQQQQAABAgTQwAD/CgG8A76/b0f5AAAAAElFTkSuQmCC'; 
  
      // Header Branding
      doc.addImage(schoolLogoBase64, 'PNG', 15, 15, 25, 25); 
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // Emerald Green
      doc.text("BTK & KTS Education", 45, 28);
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text("Official Payment Receipt", 45, 36);
  
      // Invoice Details
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${transaction.id}`, 145, 20);
      doc.text(`Date: ${transaction.date}`, 145, 27);
      
      doc.setFontSize(14);
      doc.text("Bill To:", 15, 60);
      doc.setFontSize(12);
      doc.text(transaction.studentName, 15, 67);
  
      // Table for items
      autoTable(doc, {
          startY: 80,
          head: [['Description', 'Amount']],
          body: [
              [transaction.plan, `${transaction.amount.toLocaleString()} MMK`]
          ],
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] },
      });
  
      // Total and Status
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.setFontSize(14);
      doc.text("Total:", 135, finalY + 15);
      doc.setFont('helvetica', 'bold');
      doc.text(`${transaction.amount.toLocaleString()} MMK`, 165, finalY + 15);
  
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text("Status:", 15, finalY + 30);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(transaction.status === 'Paid' ? [34, 197, 94] : [239, 68, 68]);
      doc.text(transaction.status, 35, finalY + 30);
  
      // Footer
      doc.setTextColor(150);
      doc.setFontSize(10);
      doc.text("Thank you for your payment!", 105, 280, { align: 'center' });
  
      doc.save(`Receipt-${transaction.id}.pdf`);
  };
    
    const handleSaveManualEntry = (newEntry: any) => {
        setTransactions(prev => [newEntry, ...prev]);
    }

    return (
        <>
        <SidebarProvider defaultOpen={true}>
            <TeacherSidebar />
            <SidebarInset className="bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
                 <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold font-headline tracking-tight">ဘဏ္ဍာရေး အနှစ်ချုပ်</h1>
                        <p className="text-gray-300">
                            Monitor your revenue, subscriptions, and transaction history.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-gray-300" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} MMK</div>
                                <p className="text-xs text-gray-400">All-time earnings</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                                <Calendar className="h-4 w-4 text-gray-300" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{thisMonthRevenue.toLocaleString()} MMK</div>
                                <p className="text-xs text-gray-400">+15% from last month</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                                <Users className="h-4 w-4 text-gray-300" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{activeSubscriptions}</div>
                                <p className="text-xs text-gray-400">+2 since last month</p>
                            </CardContent>
                        </Card>
                         <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pending / Due</CardTitle>
                                <Clock className="h-4 w-4 text-gray-300" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-300">{pendingDue.toLocaleString()} MMK</div>
                                <p className="text-xs text-gray-400">From 3 transactions</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                        <CardHeader>
                            <CardTitle>ဝင်ငွေဇယား (Revenue Growth)</CardTitle>
                            <CardDescription className="text-gray-300">Revenue trend for the past 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ChartContainer config={chartConfig} className="h-72 w-full">
                                <ResponsiveContainer>
                                    <LineChart data={revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                         <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.2)" />
                                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" />
                                        <YAxis stroke="rgba(255,255,255,0.7)" tickFormatter={(value) => `${value/1000}k`} />
                                        <Tooltip cursor={{fill: 'rgba(16,185,129,0.1)'}} content={<ChartTooltipContent indicator="line" labelClassName="text-white" className="bg-slate-900/80 border-slate-700" />} />
                                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{fill: 'hsl(var(--chart-1))'}} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                        <CardHeader>
                            <CardTitle>ငွေပေးချေမှုမှတ်တမ်း (Transaction History)</CardTitle>
                             <div className="flex flex-col md:flex-row gap-4 justify-between mt-4">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="Search by name or invoice..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-emerald-900/20 border-emerald-500/30 placeholder:text-gray-400 focus:ring-emerald-500"
                                    />
                                </div>
                                <Button onClick={() => setIsModalOpen(true)} className="bg-emerald-500 text-slate-950 hover:bg-emerald-600">
                                    <Plus className="mr-2 h-4 w-4" />
                                    ငွေပေးချေမှုအသစ်ထည့်ရန်
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="border border-emerald-500/30 rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-emerald-500/30 hover:bg-emerald-500/10">
                                            <TableHead className="text-gray-200">Invoice ID</TableHead>
                                            <TableHead className="text-gray-200">Student</TableHead>
                                            <TableHead className="text-gray-200">Plan</TableHead>
                                            <TableHead className="text-gray-200">Date</TableHead>
                                            <TableHead className="text-gray-200">Amount</TableHead>
                                            <TableHead className="text-gray-200">Status</TableHead>
                                            <TableHead className="text-gray-200 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTransactions.map((t) => (
                                            <TableRow key={t.id} className="border-emerald-500/30 hover:bg-emerald-500/10">
                                                <TableCell className="font-mono">{t.id}</TableCell>
                                                <TableCell>{t.studentName}</TableCell>
                                                <TableCell>{t.plan}</TableCell>
                                                <TableCell>{t.date}</TableCell>
                                                <TableCell>{t.amount.toLocaleString()} MMK</TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        'text-xs font-semibold',
                                                        t.status === 'Paid' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                                                        t.status === 'Pending' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                                                        t.status === 'Overdue' && 'bg-red-500/20 text-red-300 border border-red-500/30'
                                                    )}>
                                                        {t.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDownloadReceipt(t)}>
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                </main>
            </SidebarInset>
        </SidebarProvider>
        <ManualPaymentModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveManualEntry}
        />
        </>
    );
}
