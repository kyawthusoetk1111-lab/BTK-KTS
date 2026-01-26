'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, FileText, Search, Star, TrendingUp, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockSubmissions, mockQuizzes } from '@/lib/data';
import { subjects } from '@/lib/subjects';
import type { StudentSubmission, Quiz } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Area, Cell, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, AreaChart, PieChart as RechartsPieChart, Pie } from 'recharts';

// Combine submissions with quiz data
const detailedSubmissions = mockSubmissions.map(sub => {
    const quiz = mockQuizzes.find(q => q.id === sub.quizId);
    return {
        ...sub,
        subject: quiz?.subject || 'N/A',
        quizName: quiz?.name || 'Unknown Quiz',
        timeSpent: `${((sub.studentName.length % 10) + 5)}m ${((sub.id.charCodeAt(sub.id.length - 1)) % 60)}s`
    }
});

// Mock data for charts
const passRateData = [
  { day: 'Mon', passRate: 75 },
  { day: 'Tue', passRate: 82 },
  { day: 'Wed', passRate: 78 },
  { day: 'Thu', passRate: 88 },
  { day: 'Fri', passRate: 91 },
  { day: 'Sat', passRate: 85 },
  { day: 'Sun', passRate: 93 },
];

const subjectDistributionData = detailedSubmissions.reduce((acc, sub) => {
    if (!acc[sub.subject!]) {
        acc[sub.subject!] = 0;
    }
    acc[sub.subject!]++;
    return acc;
}, {} as Record<string, number>);

const pieChartData = Object.entries(subjectDistributionData).map(([name, value]) => ({ name, value }));

const chartConfig: ChartConfig = {
  passRate: {
    label: 'Pass Rate (%)',
    color: 'hsl(var(--chart-1))',
  },
};

const PIE_CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function AnalyticsDashboard() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    
    // Stats cards data (mocked)
    const totalExamsTaken = detailedSubmissions.length;
    const averageScore = detailedSubmissions.length > 0 ? detailedSubmissions.reduce((sum, sub) => sum + (sub.totalScore / sub.totalPossibleScore * 100), 0) / totalExamsTaken : 0;
    const topSubject = 'Mathematics'; // Mock
    const newResultsToday = detailedSubmissions.filter(sub => new Date(sub.submissionTime).toDateString() === new Date().toDateString()).length;


    const handleExportPDF = () => {
        setIsExporting(true);
        toast({ title: 'Generating PDF Report...' });

        setTimeout(() => {
            const doc = new jsPDF();
            
            // 1. Header
            const logoUrl = 'https://placehold.co/100x40?text=Logo'; // Placeholder as requested
            
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text("BTK & KTS Education", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text("Official Student Progress Report", doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
            
            doc.setFontSize(10);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 36, { align: 'center' });

            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text("[Logo Placeholder]", 20, 20);
            doc.rect(14, 14, 30, 15);


            // 2. Table
            const tableColumn = ["Rank", "Name", "Subject", "Score", "Grade"];
            const tableRows: (string | number)[][] = [];

            const submissionsToExport = filteredSubmissions.sort((a,b) => b.totalScore - a.totalScore);

            submissionsToExport.forEach((sub, index) => {
                const scoreString = `${sub.totalScore}/${sub.totalPossibleScore}`;
                const percentage = sub.totalPossibleScore > 0 ? (sub.totalScore / sub.totalPossibleScore) * 100 : 0;
                let grade = '';
                if (percentage >= 80) grade = 'A';
                else if (percentage >= 60) grade = 'B';
                else if (percentage >= 40) grade = 'C';
                else grade = 'D';

                const rowData = [
                    index + 1,
                    sub.studentName,
                    sub.subject,
                    scoreString,
                    grade
                ];
                tableRows.push(rowData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 50,
                theme: 'striped',
                headStyles: {
                    fillColor: [16, 185, 129] // Emerald-500
                },
                alternateRowStyles: {
                    fillColor: [240, 255, 244] // Light Green
                },
                didDrawPage: (data) => {
                    // 3. Footer
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(150);

                    // Signature Line
                    const sigText = "Head of School";
                    const sigX = doc.internal.pageSize.width - data.settings.margin.right - 50;
                    const sigY = doc.internal.pageSize.height - 20;
                    doc.line(sigX, sigY, sigX + 50, sigY);
                    doc.text(sigText, sigX + 25, sigY + 5, { align: 'center' });

                    // Timestamp and page number
                    const timestamp = new Date().toLocaleString();
                    doc.text(
                        `Generated on: ${timestamp} | Page ${data.pageNumber} of ${pageCount}`,
                        data.settings.margin.left,
                        doc.internal.pageSize.height - 10
                    );
                }
            });

            doc.save('student_progress_report.pdf');
            setIsExporting(false);
            toast({ title: 'PDF Exported!', description: 'Your report has been downloaded.' });
        }, 1000); // Simulate generation time
    };

    const getScoreColor = (score: number, total: number) => {
        const percentage = total > 0 ? (score / total) * 100 : 0;
        if (percentage >= 80) return 'text-emerald-400';
        if (percentage >= 40) return 'text-amber-400';
        return 'text-red-400';
    };
    
    const filteredSubmissions = detailedSubmissions.filter(sub => {
        const searchMatch = sub.studentName.toLowerCase().includes(searchTerm.toLowerCase());
        const subjectMatch = selectedSubject === 'all' || sub.subject === selectedSubject;
        return searchMatch && subjectMatch;
    });

    return (
        <div className="space-y-8 animate-in fade-in-50">
            {/* 1. Smart Overview Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exams Taken</CardTitle>
                        <FileText className="h-4 w-4 text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalExamsTaken}</div>
                        <p className="text-xs text-gray-400">+ {newResultsToday} new results today</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Star className="h-4 w-4 text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                        <p className="text-xs text-gray-400">+2.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Performing Subject</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{topSubject}</div>
                        <p className="text-xs text-gray-400">88% average score</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Needs Grading</CardTitle>
                        <CheckCircle className="h-4 w-4 text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mockSubmissions.filter(s => s.status === 'Needs Grading').length}</div>
                        <p className="text-xs text-gray-400">Waiting for review</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* 2. Visual Analytics (Charts) */}
            <div className="grid gap-6 lg:grid-cols-5">
                 <Card className="lg:col-span-3 bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                    <CardHeader>
                        <CardTitle>Exam Pass Rate (Weekly)</CardTitle>
                        <CardDescription className="text-gray-300">Percentage of students passing exams this week.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                            <AreaChart data={passRateData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorPassRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16,185,129,0.2)" />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                                <YAxis stroke="rgba(255,255,255,0.7)" domain={[50, 100]} />
                                <Tooltip
                                    cursor={{fill: 'rgba(16,185,129,0.1)'}}
                                    content={<ChartTooltipContent indicator="line" labelClassName="text-white" className="bg-slate-900/80 border-slate-700" />}
                                />
                                <Area type="monotone" dataKey="passRate" stroke="hsl(var(--chart-1))" fill="url(#colorPassRate)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2 bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                    <CardHeader>
                        <CardTitle>ဘာသာရပ်အလိုက် ခွဲခြမ်းစိတ်ဖြာမှု</CardTitle>
                        <CardDescription className="text-gray-300">Distribution of exams taken by subject.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ChartContainer config={chartConfig} className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend wrapperStyle={{color: 'white'}} />
                                    <Tooltip content={<ChartTooltipContent hideLabel className="bg-slate-900/80 border-slate-700 text-white" itemStyle={{color: 'white'}}/>} />
                                </RechartsPieChart>
                             </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Advanced Result Table */}
            <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
                <CardHeader>
                    <CardTitle>စာမေးပွဲ ရလဒ်များ (All Results)</CardTitle>
                    <div className="flex flex-col md:flex-row gap-4 justify-between mt-4">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Search by student name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-emerald-900/20 border-emerald-500/30 placeholder:text-gray-400 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger className="w-full md:w-64 bg-emerald-900/20 border-emerald-500/30 focus:ring-emerald-500">
                                    <SelectValue placeholder="Filter by subject..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 text-white border-slate-700">
                                    <SelectItem value="all" className="focus:bg-slate-700">All Subjects</SelectItem>
                                    {subjects.map(subject => (
                                        <SelectItem key={subject} value={subject} className="focus:bg-slate-700">{subject}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={handleExportPDF} disabled={isExporting} className="bg-transparent border-sky-400/40 text-sky-300 hover:bg-sky-400/20 hover:text-sky-200">
                                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                                {isExporting ? 'Generating...' : 'အစီရင်ခံစာ ထုတ်ယူရန်'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border border-emerald-500/30 rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-emerald-500/30 hover:bg-emerald-500/10">
                                    <TableHead className="text-gray-200 w-[50px]">Rank</TableHead>
                                    <TableHead className="text-gray-200">Student Name</TableHead>
                                    <TableHead className="text-gray-200">Subject</TableHead>
                                    <TableHead className="text-gray-200">Quiz</TableHead>
                                    <TableHead className="text-gray-200 text-right">Score</TableHead>
                                    <TableHead className="text-gray-200 text-right">Time Spent</TableHead>
                                    <TableHead className="text-gray-200 text-right">Date</TableHead>
                                    <TableHead className="text-gray-200 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubmissions.length > 0 ? filteredSubmissions.sort((a,b) => b.totalScore - a.totalScore).map((sub, index) => (
                                    <TableRow key={sub.id} className="border-emerald-500/30 hover:bg-emerald-500/10">
                                        <TableCell className="font-bold text-lg">{index + 1}</TableCell>
                                        <TableCell>{sub.studentName}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-gray-300 border-gray-500">{sub.subject}</TableCell></TableCell>
                                        <TableCell className="font-medium">{sub.quizName}</TableCell>
                                        <TableCell className={`text-right font-semibold ${getScoreColor(sub.totalScore, sub.totalPossibleScore)}`}>{sub.totalScore}/{sub.totalPossibleScore}</TableCell>
                                        <TableCell className="text-right text-gray-400">{sub.timeSpent}</TableCell>
                                        <TableCell className="text-right text-gray-400">{format(new Date(sub.submissionTime), 'PP')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm" className="bg-transparent border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/20 hover:text-emerald-200">
                                                <Link href={`/grading/${sub.id}`}>View Details</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-gray-400">
                                            No results found for the selected filters.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
