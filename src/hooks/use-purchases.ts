'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { Purchase } from '@/lib/types';

export function usePurchases() {
  const { user } = useUser();
  const firestore = useFirestore();

  const purchasesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'purchases'));
  }, [user?.uid, firestore]);

  const { data: purchases, isLoading, error } = useCollection<Purchase>(purchasesQuery);

  return {
    purchases: purchases || [],
    isLoading,
    error,
  };
}
