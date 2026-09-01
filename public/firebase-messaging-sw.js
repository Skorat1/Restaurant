// Firebase Messaging Service Worker
// Scripts for firebase messaging sw
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker
// Replace these or retrieve from URL search params if customized
const firebaseConfig = {
  apiKey: new URL(location).searchParams.get("apiKey") || "",
  authDomain: new URL(location).searchParams.get("authDomain") || "",
  projectId: new URL(location).searchParams.get("projectId") || "",
  storageBucket: new URL(location).searchParams.get("storageBucket") || "",
  messagingSenderId: new URL(location).searchParams.get("messagingSenderId") || "",
  appId: new URL(location).searchParams.get("appId") || "",
};

if (firebase.apps.length === 0 && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
}

// Check if messaging is supported in Service Worker context
if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging();

  // Background message handler
  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);

    const notificationTitle = payload.notification?.title || payload.data?.title || 'Velora Restaurant';
    const notificationOptions = {
      body: payload.notification?.body || payload.data?.body || 'You have a new update.',
      icon: payload.notification?.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: {
        url: payload.data?.url || payload.data?.click_action || '/',
        ...payload.data,
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Notification Click Handler to navigate to order/chat/admin URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
