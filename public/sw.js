// Service Worker for Push Notifications with FCM
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

const CACHE_NAME = 'zua-car-v1';
const APP_LOGO = '/icon.jpg';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Message event from client to service worker
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, data, tag } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: APP_LOGO,
        badge: APP_LOGO,
        tag: tag || 'notification',
        data: data || {},
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
      })
    );
  }
});

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

// Push notification event (fallback pour les notifications non-FCM)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'Zua-Car',
    body: 'Vous avez une nouvelle notification',
    icon: APP_LOGO,
    badge: APP_LOGO,
    tag: 'zua-car-notification',
    requireInteraction: false,
    silent: false, // Play sound
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        title: data.title || notificationData.title,
        body: data.body || notificationData.body,
        icon: APP_LOGO,
        badge: APP_LOGO,
        tag: data.type || 'zua-car-notification',
        data: data.data || {},
        requireInteraction: false,
        silent: false,
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      data: notificationData.data,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      vibrate: [200, 100, 200], // Vibration pattern for mobile
    })
  );
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


