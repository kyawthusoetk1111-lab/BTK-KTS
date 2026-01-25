'use client';
import { TeacherSidebar } from '@/components/teacher-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Users } from 'lucide-react';

export default function StudentsPage() {
    return (
        <SidebarProvider defaultOpen={true}>
            <TeacherSidebar />
            <SidebarInset className="bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
                 <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
                        <Users className="h-16 w-16 text-gray-400 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Student Management</h2>
                        <p className="text-gray-400">This page is under construction.</p>
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
