// Service Worker for Push Notifications
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

// Push notification event
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


