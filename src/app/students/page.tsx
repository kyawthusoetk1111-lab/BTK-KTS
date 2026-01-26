'use client';

import { TeacherSidebar } from '@/components/teacher-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { StudentDirectory } from '@/components/teacher/student-directory';

export default function StudentsPage() {
    return (
        <SidebarProvider defaultOpen={true}>
            <TeacherSidebar />
            <SidebarInset className="bg-gradient-to-br from-emerald-950 via-slate-950 to-blue-950 text-white">
                 <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-bold font-headline tracking-tight">ကျောင်းသားစီမံခန့်ခွဲမှု</h1>
                            <p className="text-gray-300">
                                View and manage all students on the platform.
                            </p>
                        </div>
                    </div>
                    <StudentDirectory />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
