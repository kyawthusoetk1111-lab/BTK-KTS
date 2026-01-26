'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { LoadingSpinner } from '@/components/loading-spinner';
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader2, Activity } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.36 1.67-4.66 1.67-3.86 0-6.99-3.14-6.99-7s3.13-7 6.99-7c2.08 0 3.47.78 4.55 1.83l2.66-2.66C18.04 1.48 15.47 0 12.48 0 5.88 0 0 5.88 0 12s5.88 12 12.48 12c6.92 0 12-5.08 12-12v-1.08h-11.52z"
      />
    </svg>
);


export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  // This effect will handle redirection after a user is successfully logged in via the Auth state.
  useEffect(() => {
    if (!isUserLoading && user) {
        // User is logged in, now fetch their profile to check for first login or userType
        const checkUserProfile = async () => {
            if (!firestore) return;
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userProfile = userDocSnap.data() as UserProfile;
                 if (userProfile.status === 'suspended') {
                    await signOut(auth!);
                    setError("Your account is suspended. Please contact an administrator.");
                    return;
                }
                if (userProfile.userType === 'admin') {
                    router.replace('/admin');
                } else if (userProfile.isFirstLogin) {
                    router.replace('/change-password');
                } else {
                    router.replace('/');
                }
            } else {
                // If profile doesn't exist AND it was a Google sign-in, create a profile.
                // This is for the first time an admin signs in.
                if (user.providerData.some(p => p.providerId === 'google.com')) {
                    const newAdminProfile: UserProfile = {
                        id: user.uid,
                        email: user.email!,
                        name: user.displayName || 'Admin User',
                        userType: 'admin', // Default to admin for Google sign-ins
                        studentId: `admin-${user.uid.slice(0,5)}`,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        status: 'active',
                        isFirstLogin: false, // Admins don't need password change flow
                    };
                    await setDoc(userDocRef, newAdminProfile);
                    router.replace('/admin'); // Redirect after creating profile
                } else {
                    // Profile doesn't exist for a non-Google user, something is wrong.
                    await signOut(auth!);
                    setError('Your user profile was not found. Please contact an administrator.');
                }
            }
        };

        checkUserProfile();
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
    
    const email = `${studentId.trim()}@btk-exam.com`;

    try {
      // The sign-in will trigger the useEffect to handle redirection
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        setError('Invalid ID or Password. Please try again.');
      } else {
        setError('An unexpected error occurred during login.');
        console.error('Login Error:', error);
      }
       setIsLoggingIn(false);
    }
  };
  
  const handleAdminLogin = async () => {
    setError(null);
    setIsAdminLoggingIn(true);
    if (!auth || !firestore) {
      setError('Authentication service is not ready. Please try again.');
      setIsAdminLoggingIn(false);
      return;
    }
    
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // On success, the useEffect hook will handle everything.
    } catch (error: any) {
        if (error.code !== 'auth/popup-closed-by-user') {
            setError('Could not sign in with Google. Please try again.');
            console.error('Google Sign-In Error:', error);
        }
        setIsAdminLoggingIn(false);
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
          <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
          <CardDescription>Enter your ID and password to sign in.</CardDescription>
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoggingIn || isAdminLoggingIn}>
              {(isLoggingIn && !isAdminLoggingIn) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {(isLoggingIn && !isAdminLoggingIn) ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleAdminLogin} disabled={isLoggingIn || isAdminLoggingIn}>
                {isAdminLoggingIn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <GoogleIcon className="mr-2 h-4 w-4" />
                )}
                Login as Admin
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    