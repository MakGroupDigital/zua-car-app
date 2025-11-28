import { Firestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface NotificationData {
  userId: string;
  type: 'message' | 'favorite' | 'vehicle_sold' | 'part_sold' | 'rental_booked' | 'new_offer' | 'system';
  title: string;
  body: string;
  data?: {
    vehicleId?: string;
    partId?: string;
    rentalId?: string;
    conversationId?: string;
    messagePreview?: string;
    senderName?: string;
    senderPhoto?: string;
  };
  imageUrl?: string;
}

export async function createNotification(
  firestore: Firestore,
  notificationData: NotificationData
): Promise<void> {
  try {
    // Save notification to Firestore
    const notificationRef = doc(collection(firestore, 'notifications'));
    await setDoc(notificationRef, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
    });

    // Send push notification via service worker (works even if user is not in app)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if notifications are allowed
        if (Notification.permission === 'granted') {
          // Send message to service worker to show notification
          await registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: '/icon.jpg', // App logo
            badge: '/icon.jpg',
            tag: notificationData.type,
            data: notificationData.data,
            requireInteraction: false,
            silent: false, // Play sound
            vibrate: [200, 100, 200], // Vibration pattern for mobile
          });
        }
      } catch (swError) {
        console.error('Error sending notification via service worker:', swError);
        // Fallback to browser notification if service worker fails
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(notificationData.title, {
            body: notificationData.body,
            icon: '/icon.jpg',
            badge: '/icon.jpg',
            tag: notificationData.type,
            data: notificationData.data,
            requireInteraction: false,
            silent: false,
          });

          notification.onclick = () => {
            window.focus();
            notification.close();
            
            if (notificationData.data?.conversationId) {
              window.location.href = '/messages';
            } else if (notificationData.data?.vehicleId) {
              window.location.href = `/vehicles/${notificationData.data.vehicleId}`;
            } else if (notificationData.data?.partId) {
              window.location.href = `/parts/${notificationData.data.partId}`;
            } else if (notificationData.data?.rentalId) {
              window.location.href = `/vehicleRentalListings/${notificationData.data.rentalId}`;
            }
          };

          setTimeout(() => notification.close(), 5000);
        }
      }
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Helper function to create message notification
export async function createMessageNotification(
  firestore: Firestore,
  recipientId: string,
  senderName: string,
  messageText: string,
  conversationId: string,
  senderPhoto?: string
): Promise<void> {
  const preview = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
  
  await createNotification(firestore, {
    userId: recipientId, // IMPORTANT: recipientId est le destinataire qui doit recevoir la notification
    type: 'message',
    title: `Nouveau message de ${senderName}`,
    body: preview, // Afficher le contenu du message dans le body
    data: {
      conversationId,
      messagePreview: preview,
      senderName,
      senderPhoto,
    },
  });
}

// Helper function to create favorite notification
export async function createFavoriteNotification(
  firestore: Firestore,
  userId: string,
  itemType: 'vehicle' | 'part' | 'rental',
  itemId: string,
  itemTitle: string
): Promise<void> {
  await createNotification(firestore, {
    userId,
    type: 'favorite',
    title: 'Ajouté aux favoris',
    body: `${itemTitle} a été ajouté à vos favoris`,
    data: {
      ...(itemType === 'vehicle' && { vehicleId: itemId }),
      ...(itemType === 'part' && { partId: itemId }),
      ...(itemType === 'rental' && { rentalId: itemId }),
    },
  });
}

