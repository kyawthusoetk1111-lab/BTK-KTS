'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Search, UserCog, ShieldOff, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export function StudentDirectory() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: allUsers, isLoading } = useCollection<UserProfile>(usersQuery);

    const students = allUsers?.filter(user => user.userType === 'student') || [];
    
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }
    
    return (
        <Card className="bg-emerald-900/20 backdrop-blur-md border border-emerald-500/30 text-white">
            <CardHeader>
                <CardTitle>All Students</CardTitle>
                <CardDescription className="text-gray-300">Browse and monitor all students enrolled on the platform.</CardDescription>
                 <div className="relative pt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-emerald-900/20 border-emerald-500/30 placeholder:text-gray-400 focus:ring-emerald-500 w-full max-w-sm"
                    />
               </div>
            </CardHeader>
            <CardContent>
                <div className="border border-emerald-500/30 rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-emerald-500/30 hover:bg-emerald-500/10">
                                <TableHead className="text-gray-200">Name</TableHead>
                                <TableHead className="text-gray-200">Email</TableHead>
                                <TableHead className="text-gray-200">Joined Date</TableHead>
                                <TableHead className="text-gray-200">Status</TableHead>
                                <TableHead className="text-right text-gray-200">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                <TableRow key={student.id} className="border-emerald-500/30 hover:bg-emerald-500/10">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {student.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>{format(new Date(student.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(student.status === 'suspended' ? 'text-orange-300 border-orange-500/40 bg-orange-900/20' : 'text-emerald-300 border-emerald-500/40 bg-emerald-900/20')}>{student.status || 'active'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled>
                                                        <UserCog className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-800 text-white border-slate-700">Admin Action</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled>
                                                        <ShieldOff className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-800 text-white border-slate-700">Admin Action</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled>
                                                        <Trash2 className="h-4 w-4 text-gray-500" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-800 text-white border-slate-700">Admin Action</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-gray-300">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
