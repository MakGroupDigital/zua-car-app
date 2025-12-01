import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface SellerInfo {
  name: string;
  photoURL?: string;
}

/**
 * Hook to fetch seller names for multiple items efficiently
 * Uses caching to avoid duplicate requests
 */
export function useSellerNames(userIds: string[]) {
  const firestore = useFirestore();
  const [sellerNames, setSellerNames] = useState<Record<string, SellerInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || userIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchSellerNames = async () => {
      const names: Record<string, SellerInfo> = {};
      const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
      
      // Fetch all seller names in parallel
      const promises = uniqueUserIds.map(async (userId) => {
        try {
          const userDocRef = doc(firestore, 'users', userId);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const name = userData.firstName && userData.lastName
              ? `${userData.firstName} ${userData.lastName}`
              : userData.displayName || userData.name || 'Vendeur';
            
            names[userId] = {
              name,
              photoURL: userData.photoURL,
            };
          } else {
            names[userId] = { name: 'Vendeur' };
          }
        } catch (error) {
          console.error(`Error fetching seller ${userId}:`, error);
          names[userId] = { name: 'Vendeur' };
        }
      });

      await Promise.all(promises);
      setSellerNames(names);
      setLoading(false);
    };

    fetchSellerNames();
  }, [firestore, userIds.join(',')]);

  return { sellerNames, loading };
}


