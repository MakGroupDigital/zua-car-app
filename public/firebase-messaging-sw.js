// Firebase Cloud Messaging Service Worker
// Ce fichier est requis par Firebase Messaging pour les notifications push

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyD1qayBveIM9rUPJADxha0tRctQ5mJfF0U",
  authDomain: "zua-car.firebaseapp.com",
  projectId: "zua-car",
  storageBucket: "zua-car.firebasestorage.app",
  messagingSenderId: "33080094825",
  appId: "1:33080094825:web:9fc623968b1355ab16f2f8"
});

const messaging = firebase.messaging();
const APP_LOGO = '/icon.jpg';

// FCM Background Message Handler (quand l'app est fermée ou en arrière-plan)
messaging.onBackgroundMessage((payload) => {
  console.log('FCM message received in background:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Zua-Car';
  const notificationBody = payload.notification?.body || payload.data?.body || 'Vous avez une nouvelle notification';
  
  const notificationOptions = {
    body: notificationBody,
    icon: APP_LOGO,
    badge: APP_LOGO,
    tag: payload.data?.type || 'zua-car-notification',
    data: payload.data || {},
    requireInteraction: false,
    silent: false, // Play sound
    vibrate: [200, 100, 200], // Vibration pattern for mobile
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  const notificationData = event.notification.data || {};
  let url = '/notifications';

  // Navigate based on notification type
  if (notificationData.conversationId) {
    url = '/messages';
  } else if (notificationData.vehicleId) {
    url = `/vehicles/${notificationData.vehicleId}`;
  } else if (notificationData.partId) {
    url = `/parts/${notificationData.partId}`;
  } else if (notificationData.rentalId) {
    url = `/vehicleRentalListings/${notificationData.rentalId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

