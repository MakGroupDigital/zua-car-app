'use client';

import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

/**
 * Global notification listener that works even when app is not in focus
 * Listens to Firestore notifications and shows them via service worker
 */
export function GlobalNotificationListener() {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user || !firestore || typeof window === 'undefined') return;

    // Track processed notifications to avoid duplicates
    const processedIds = new Set<string>();

    const notificationsRef = collection(firestore, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          // Only process new notifications
          if (change.type === 'added') {
            const notificationId = change.doc.id;
            
            // Skip if already processed
            if (processedIds.has(notificationId)) {
              return;
            }

            const data = change.doc.data();
            processedIds.add(notificationId);

            // Show notification via service worker (works even when app is in background)
            if ('serviceWorker' in navigator && Notification.permission === 'granted') {
              navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(data.title || 'Nouvelle notification', {
                  body: data.body || '',
                  icon: '/icon.jpg',
                  badge: '/icon.jpg',
                  tag: data.type || 'notification',
                  data: {
                    notificationId,
                    ...data.data,
                  },
                  requireInteraction: false,
                  silent: false,
                  vibrate: [200, 100, 200],
                });
              }).catch((error) => {
                console.error('Error showing notification via service worker:', error);
              });
            }
          }
        });
      },
      (error) => {
        console.error('Error listening to notifications:', error);
      }
    );

    return () => unsubscribe();
  }, [user, firestore]);

  return null;
}

