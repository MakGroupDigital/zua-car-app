import { Firestore, collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

/**
 * Listen to new notifications in Firestore and show them via service worker
 * This works even when the app is not open
 */
export function listenToNotifications(
  firestore: Firestore,
  userId: string,
  onNotification: (notification: any) => void
): () => void {
  if (!userId || !firestore) {
    return () => {};
  }

  const notificationsRef = collection(firestore, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );

  // Track processed notifications to avoid duplicates
  const processedIds = new Set<string>();

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

          // Show notification via service worker
          if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              if (Notification.permission === 'granted') {
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
              }
            }).catch(console.error);
          }

          // Call callback
          onNotification({
            id: notificationId,
            ...data,
          });
        }
      });
    },
    (error) => {
      console.error('Error listening to notifications:', error);
    }
  );

  return unsubscribe;
}


