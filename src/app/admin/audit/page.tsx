'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, History, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockSubmissions, mockQuizzes } from '@/lib/data';

// Combine submission data with quiz data for a more detailed view
const auditData = mockSubmissions.map(sub => {
    const quiz = mockQuizzes.find(q => q.id === sub.quizId);
    const percentage = sub.totalPossibleScore > 0 ? (sub.totalScore / sub.totalPossibleScore) * 100 : 0;
    let grade = '';
    if (percentage >= 80) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 40) grade = 'C';
    else grade = 'D';

    return {
        ...sub,
        subject: quiz?.subject || 'N/A',
        quizName: quiz?.name || 'Unknown Quiz',
        grade: grade,
        lastUpdatedBy: 'Mr. Smith', // Mock data
    };
});

const gradeFilters = ['All', 'A', 'B', 'C', 'D'];
// Get unique subjects from the data plus 'All'
const subjectFilters = ['All', ...Array.from(new Set(auditData.map(d => d.subject)))];

export default function AuditPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [selectedSubject, setSelectedSubject] = useState('All');

    const filteredData = auditData.filter(item => {
        const searchMatch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.quizName.toLowerCase().includes(searchTerm.toLowerCase());
        const gradeMatch = selectedGrade === 'All' || item.grade === selectedGrade;
        const subjectMatch = selectedSubject === 'All' || item.subject === selectedSubject;
        return searchMatch && gradeMatch && subjectMatch;
    });

    const handleViewHistory = (studentName: string) => {
        toast({
            title: 'Audit History',
            description: `Viewing history for ${studentName}. (This is a placeholder).`,
        });
    };

    const handleExport = () => {
        toast({
            title: 'Exporting Report',
            description: 'Generating audit report... (This is a placeholder).',
        });
    };
    
    const getGradeColor = (grade: string) => {
        if (grade.includes('A')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        if (grade.includes('B')) return 'bg-sky-100 text-sky-800 border-sky-300';
        if (grade.includes('C')) return 'bg-amber-100 text-amber-800 border-amber-300';
        return 'bg-red-100 text-red-800 border-red-300';
    };

    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Exam Audit Trail</h2>
                    <p className="text-muted-foreground">
                        Review and verify student grades and submission history.
                    </p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                         <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search by student or quiz..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                                <SelectTrigger className="w-full md:w-40">
                                    <SelectValue placeholder="Filter by grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {gradeFilters.map(grade => (
                                        <SelectItem key={grade} value={grade}>{grade === 'All' ? 'All Grades' : `Grade ${grade}`}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger className="w-full md:w-56">
                                    <SelectValue placeholder="Filter by subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectFilters.map(subject => (
                                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleExport} variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export Report
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Quiz</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Grade</TableHead>
                                    <TableHead>Last Updated By</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                               {filteredData.length > 0 ? filteredData.map(item => (
                                   <TableRow key={item.id}>
                                       <TableCell className="font-medium">{item.studentName}</TableCell>
                                       <TableCell>{item.subject}</TableCell>
                                       <TableCell>{item.quizName}</TableCell>
                                       <TableCell className="text-center">{item.totalScore}/{item.totalPossibleScore}</TableCell>
                                       <TableCell className="text-center">
                                           <Badge variant="outline" className={getGradeColor(item.grade)}>
                                               {item.grade}
                                           </Badge>
                                       </TableCell>
                                       <TableCell>{item.lastUpdatedBy}</TableCell>
                                       <TableCell className="text-right">
                                           <Button variant="ghost" size="sm" onClick={() => handleViewHistory(item.studentName)}>
                                                <History className="mr-2 h-4 w-4" />
                                                View History
                                           </Button>
                                       </TableCell>
                                   </TableRow>
                               )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        No results match your filters.
                                    </TableCell>
                                </TableRow>
                               )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
