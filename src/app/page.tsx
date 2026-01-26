'use client';

import { useUserWithProfile } from '@/hooks/use-user-with-profile';
import { LoadingSpinner } from '@/components/loading-spinner';
import { TeacherDashboard } from '@/components/teacher-dashboard';
import { StudentDashboard } from '@/components/student-dashboard';
import { LandingPage } from '@/components/landing-page';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import type { SystemStatus } from '@/lib/types';
import { useEffect } from 'react';

export default function DashboardRouterPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const statusRef = useMemoFirebase(() => firestore ? doc(firestore, 'system', 'status') : null, [firestore]);
  const { data: systemStatus, isLoading: isStatusLoading } = useDoc<SystemStatus>(statusRef);
  const { user, profile, isLoading: isUserLoading } = useUserWithProfile();

  const isLoading = isUserLoading || isStatusLoading;

  useEffect(() => {
    if (!isLoading && systemStatus?.isMaintenanceMode) {
        // Redirect non-admins to maintenance page
        if (!user || (profile && profile.userType === 'student')) {
            router.replace('/maintenance');
        }
    }
  }, [isLoading, systemStatus, user, profile, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If maintenance mode is on, this component will stay on a loading screen until the useEffect redirects.
  // We add a specific check to prevent rendering the real content for a flicker.
  if (systemStatus?.isMaintenanceMode && (!profile || profile.userType === 'student')) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoadingSpinner />
        </div>
      );
  }

  if (!user) {
    return <LandingPage />;
  }

  // A user is logged in, but we might still be waiting for their profile to load.
  // Or, a profile might not exist if creation failed.
  if (!profile) {
    // Show a loading/pending state until the profile is loaded or determined to be non-existent.
     return (
        <div className="flex flex-col items-center justify-center h-screen">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Setting up your account...</p>
        </div>
      );
  }

  if (profile.userType === 'admin' || profile.userType === 'teacher') {
    return <TeacherDashboard />;
  }
  
  if (profile.userType === 'student') {
    return <StudentDashboard />;
  }

  // Fallback for any other user type or if userType is not set
  return (
      <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-4">Unsupported User Role</h2>
          <p className="text-muted-foreground">Your account role is not configured for this application.</p>
      </div>
  );
}
