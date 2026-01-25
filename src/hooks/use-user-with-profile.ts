'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useEffect } from 'react';

export function useUserWithProfile() {
    const { user, isUserLoading: isAuthLoading, userError } = useUser();
    const firestore = useFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: profile, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfile>(userDocRef);

    useEffect(() => {
        // When auth is done, we have a user, firestore is ready, profile loading is done, but the profile is missing...
        if (user && firestore && !isProfileLoading && !profile && !isAuthLoading && !userError && !profileError) {
            const userProfileRef = doc(firestore, 'users', user.uid);
            const newProfile: UserProfile = {
                id: user.uid,
                email: user.email!,
                name: user.displayName || user.email!.split('@')[0],
                userType: 'student', // Default new/un-profiled logins to 'student'
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            // Create the user document. This will trigger a re-render in useDoc.
            setDoc(userProfileRef, newProfile);
        }
    }, [user, firestore, isProfileLoading, profile, isAuthLoading, userError, profileError]);

    return {
        user,
        profile,
        isLoading: isAuthLoading || isProfileLoading,
        error: userError || profileError,
    };
}
