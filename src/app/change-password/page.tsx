'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { updatePassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { Loader2, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!user || !firestore) {
      setError('An unexpected error occurred. Please try logging in again.');
      return;
    }
    
    setIsSaving(true);
    try {
        // 1. Update the password in Firebase Authentication
        await updatePassword(user, newPassword);

        // 2. Update the isFirstLogin flag in Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        setDocumentNonBlocking(userDocRef, { isFirstLogin: false }, { merge: true });

        toast({
            title: "Password Changed!",
            description: "Your new password has been set. You will be redirected.",
        });
        
        // 3. Redirect to the main dashboard
        router.replace('/');

    } catch (error: any) {
        console.error("Password change error:", error);
        setError('Failed to change password. Please try again.');
        setIsSaving(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex justify-center items-center gap-2 text-2xl font-bold font-headline text-primary mb-2">
            <Activity />
            BTK Education
          </div>
          <CardTitle className="text-2xl font-bold">Change Your Password</CardTitle>
          <CardDescription>For security, please set a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Set New Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    