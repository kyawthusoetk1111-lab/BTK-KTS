'use client';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { TeacherSidebar } from '@/components/teacher-sidebar';
import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
   const { profile, isLoading } = useUserWithProfile();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!profile || (profile.userType !== 'teacher' && profile.userType !== 'admin'))) {
      router.replace('/');
    }
  }, [isLoading, profile, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!profile || (profile.userType !== 'teacher' && profile.userType !== 'admin')) {
     return (
       <div className="flex flex-col items-center justify-center h-screen text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <Link href="/" passHref>
            <Button variant="link" className="mt-4">Go to Dashboard</Button>
          </Link>
      </div>
    )
  }
  return (
    <SidebarProvider defaultOpen={true}>
      <TeacherSidebar />
      <SidebarInset className="bg-slate-50">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
