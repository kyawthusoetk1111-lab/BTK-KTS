'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserPlus, FileCheck, DollarSign, Search } from 'lucide-react';
import { UserManagementTable } from '@/components/admin/user-management';
import type { UserProfile } from '@/lib/types';
import { Input } from '@/components/ui/input';

export default function AdminPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');

    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersQuery);

    const totalStudents = users?.filter(u => u.userType === 'student').length || 0;
    const totalTeachers = users?.filter(u => u.userType === 'teacher').length || 0;
    
    // These would be calculated from real data in a full implementation
    const activeExams = 12; 
    const monthlyRevenue = 525000;

    return (
        <main className="flex-1 p-6 sm:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Overview</h2>
                    <p className="text-muted-foreground">
                        A quick glance at your platform's statistics.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-emerald-50 border-emerald-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{isLoadingUsers ? '...' : totalStudents}</div>
                        <p className="text-xs text-emerald-700/80">+12 since last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-sky-50 border-sky-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-sky-800">Total Teachers</CardTitle>
                        <UserPlus className="h-4 w-4 text-sky-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-900">{isLoadingUsers ? '...' : totalTeachers}</div>
                        <p className="text-xs text-sky-700/80">+3 since last month</p>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-50 border-indigo-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-800">Active Exams</CardTitle>
                        <FileCheck className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-900">{activeExams}</div>
                         <p className="text-xs text-indigo-700/80">2 live right now</p>
                    </CardContent>
                </Card>
                 <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{monthlyRevenue.toLocaleString()} MMK</div>
                        <p className="text-xs text-amber-700/80">+15% from last month</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users />
                        User Control Center
                    </CardTitle>
                    <CardDescription>View, edit, and manage user roles and permissions.</CardDescription>
                    <div className="relative pt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white w-full max-w-sm"
                        />
                   </div>
                </CardHeader>
                <CardContent>
                    <UserManagementTable searchTerm={searchTerm} />
                </CardContent>
            </Card>
        </main>
    );
}
