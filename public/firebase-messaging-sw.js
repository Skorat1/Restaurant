// Firebase Messaging Service Worker
// Scripts for firebase messaging sw
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in Service Worker with fallback credentials
const firebaseConfig = {
  apiKey: new URL(location).searchParams.get("apiKey") || "AIzaSyB2RwCuD4le5nGVKAb6haO24JbfdJbf9Hg",
  authDomain: new URL(location).searchParams.get("authDomain") || "velora-haute-cuisine.firebaseapp.com",
  projectId: new URL(location).searchParams.get("projectId") || "velora-haute-cuisine",
  storageBucket: new URL(location).searchParams.get("storageBucket") || "velora-haute-cuisine.firebasestorage.app",
  messagingSenderId: new URL(location).searchParams.get("messagingSenderId") || "144262288152",
  appId: new URL(location).searchParams.get("appId") || "1:144262288152:web:8ca2f1c3d040c85b6f446d",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

// Check if messaging is supported in Service Worker context
try {
  if (firebase.messaging.isSupported()) {
    const messaging = firebase.messaging();

    // Background message handler
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message: ', payload);

      const notificationTitle = payload.notification?.title || payload.data?.title || 'VELORA Restaurant';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || 'You have a new update.',
        icon: payload.notification?.icon || '/icon.svg',
        badge: '/icon.svg',
        data: {
          url: payload.data?.url || payload.data?.click_action || '/',
          ...payload.data,
        },
      };

      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
} catch (swErr) {
  console.warn('[firebase-messaging-sw.js] Messaging init warning:', swErr);
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
