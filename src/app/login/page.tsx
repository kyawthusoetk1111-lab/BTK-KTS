'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Activity } from 'lucide-react';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  // This effect will handle redirection after a user is successfully logged in via the Auth state.
  useEffect(() => {
    if (!isUserLoading && user) {
        // User is logged in, now fetch their profile to check for first login
        const checkFirstLogin = async () => {
            if (!firestore) return;
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userProfile = userDocSnap.data() as UserProfile;
                if (userProfile.isFirstLogin) {
                    router.replace('/change-password');
                } else {
                    router.replace('/');
                }
            } else {
                // Profile doesn't exist, something is wrong. Log them out.
                await signOut(auth!);
                setError('Your user profile was not found. Please contact an administrator.');
            }
        };

        checkFirstLogin();
    }
  }, [user, isUserLoading, router, firestore, auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    if (!studentId || !password) {
      setError('Please enter both your ID and password.');
      setIsLoggingIn(false);
      return;
    }
    if (!auth || !firestore) {
      setError('Authentication service is not ready. Please try again.');
      setIsLoggingIn(false);
      return;
    }
    
    // Construct the email from the student/teacher ID.
    // This is the secure way to handle ID-based login with Firebase Auth.
    const email = `${studentId.trim()}@btk-exam.com`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // After successful sign-in, the useEffect hook above will handle the redirection logic.
      // We just need to check for suspended status here.
      const userDocRef = doc(firestore, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userProfile = userDocSnap.data() as UserProfile;
        if (userProfile.status === 'suspended') {
          await signOut(auth);
          setError("Your account is suspended. Please contact an administrator.");
          setIsLoggingIn(false);
          return;
        }
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        setError('Invalid ID or Password. Please try again.');
      } else {
        setError('An unexpected error occurred during login.');
        console.error('Login Error:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Show a loading spinner while checking auth state or redirecting
  if (isUserLoading || user) {
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
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your ID and password to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-id">Student / Teacher ID</Label>
              <Input
                id="student-id"
                type="text"
                placeholder="Your unique ID"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoggingIn}>
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoggingIn ? 'Logging In...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
    