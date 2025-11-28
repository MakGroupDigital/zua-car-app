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
    
    // Remove undefined values from data object (Firestore doesn't accept undefined)
    const cleanData: any = {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      body: notificationData.body,
      read: false,
      createdAt: serverTimestamp(),
    };
    
    // Only include optional fields if they are defined
    if (notificationData.data) {
      cleanData.data = {};
      if (notificationData.data.conversationId) cleanData.data.conversationId = notificationData.data.conversationId;
      if (notificationData.data.messagePreview) cleanData.data.messagePreview = notificationData.data.messagePreview;
      if (notificationData.data.senderName) cleanData.data.senderName = notificationData.data.senderName;
      if (notificationData.data.senderPhoto) cleanData.data.senderPhoto = notificationData.data.senderPhoto;
      if (notificationData.data.vehicleId) cleanData.data.vehicleId = notificationData.data.vehicleId;
      if (notificationData.data.partId) cleanData.data.partId = notificationData.data.partId;
      if (notificationData.data.rentalId) cleanData.data.rentalId = notificationData.data.rentalId;
    }
    
    if (notificationData.imageUrl) {
      cleanData.imageUrl = notificationData.imageUrl;
    }
    
    await setDoc(notificationRef, cleanData);

    // IMPORTANT: Only show push notification if the current user is the recipient
    // Check if the current user matches the notification recipient
    // This prevents the sender from receiving their own notifications
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        // Get current user ID from Firebase Auth (if available)
        // We'll check this in the calling code to ensure we only show notifications to the recipient
        const registration = await navigator.serviceWorker.ready;
        
        // Check if notifications are allowed
        if (Notification.permission === 'granted') {
          // Send message to service worker to show notification
          // Note: This will only show if called from the recipient's browser
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
        // Only show if this is the recipient's browser
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
  senderPhoto?: string,
  currentUserId?: string // Add current user ID to prevent showing notification to sender
): Promise<void> {
  const preview = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
  
  // Save notification to Firestore (always save for recipient)
  const notificationRef = doc(collection(firestore, 'notifications'));
  
  // Build data object without undefined values (Firestore doesn't accept undefined)
  const notificationData: any = {
    userId: recipientId, // IMPORTANT: recipientId est le destinataire qui doit recevoir la notification
    type: 'message',
    title: `Nouveau message de ${senderName}`,
    body: preview,
    data: {
      conversationId,
      messagePreview: preview,
      senderName,
    },
    read: false,
    createdAt: serverTimestamp(),
  };
  
  // Only add senderPhoto if it's defined
  if (senderPhoto) {
    notificationData.data.senderPhoto = senderPhoto;
  }
  
  await setDoc(notificationRef, notificationData);

  // Only show push notification if current user is the recipient (not the sender)
  if (typeof window !== 'undefined' && currentUserId === recipientId && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (Notification.permission === 'granted') {
        await registration.showNotification(`Nouveau message de ${senderName}`, {
          body: preview,
          icon: '/icon.jpg',
          badge: '/icon.jpg',
          tag: 'message',
          data: {
            conversationId,
            messagePreview: preview,
            senderName,
            senderPhoto,
          },
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200],
        });
      }
    } catch (swError) {
      console.error('Error sending notification via service worker:', swError);
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted' && currentUserId === recipientId) {
        const notification = new Notification(`Nouveau message de ${senderName}`, {
          body: preview,
          icon: '/icon.jpg',
          badge: '/icon.jpg',
          tag: 'message',
          data: {
            conversationId,
            messagePreview: preview,
            senderName,
            senderPhoto,
          },
          requireInteraction: false,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          window.location.href = '/messages';
        };

        setTimeout(() => notification.close(), 5000);
      }
    }
  }
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

