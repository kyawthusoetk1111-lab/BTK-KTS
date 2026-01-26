'use client';

import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { LoadingSpinner } from '@/components/loading-spinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { SystemStatus } from '@/lib/types';
import { AlertTriangle } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isLoading } = useUserWithProfile();
  const router = useRouter();
  const firestore = useFirestore();
  
  const statusRef = useMemoFirebase(() => firestore ? doc(firestore, 'system', 'status') : null, [firestore]);
  const { data: systemStatus } = useDoc<SystemStatus>(statusRef);

  useEffect(() => {
    if (!isLoading && profile?.userType !== 'admin') {
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

  if (profile?.userType !== 'admin') {
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
        <AdminSidebar />
        <SidebarInset className="bg-slate-100 dark:bg-slate-900">
            {systemStatus?.isMaintenanceMode && (
                <div className="bg-amber-500 text-white text-center p-2 text-sm font-semibold flex items-center justify-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Maintenance Mode is currently ACTIVE. Students cannot access the site.
                </div>
            )}
            {children}
        </SidebarInset>
    </SidebarProvider>
  );
}
