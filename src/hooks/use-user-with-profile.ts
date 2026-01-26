'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

export function useUserWithProfile() {
    const { user, isUserLoading: isAuthLoading, userError } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

    // The problematic useEffect that was overwriting the user profile has been removed.
    // Profile creation is now correctly handled only at sign-up.

    return {
        user,
        profile,
        isLoading: isAuthLoading || isProfileLoading,
        error: userError || profileError,
    };
}
