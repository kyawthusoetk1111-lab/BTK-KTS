'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, Firestore } from 'firebase/firestore';
import { setDocumentNonBlocking } from './non-blocking-updates';
import type { UserProfile } from '@/lib/types';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch((error) => {
    console.error('Anonymous Sign-In Error:', error);
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  firestore: Firestore,
  email: string,
  password: string,
  name: string,
  userType: 'teacher' | 'student',
  onError?: (error: any) => void
): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await'.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      // After user is created in Auth, create their profile in Firestore.
      const user = userCredential.user;
      const userDocRef = doc(firestore, 'users', user.uid);
      
      const newUserProfile: UserProfile = {
        id: user.uid,
        email: user.email!,
        name: name,
        userType: userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Use a non-blocking write to create the user's profile document.
      setDocumentNonBlocking(userDocRef, newUserProfile, { merge: false });
    })
    .catch((error) => {
      if (onError) {
        onError(error);
      } else {
        console.error('Signup Error:', error);
      }
    });
}


/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(
  authInstance: Auth,
  email: string,
  password: string,
  onError?: (error: any) => void
): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    if (onError) {
      onError(error);
    } else {
      console.error('Login Error:', error);
    }
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
