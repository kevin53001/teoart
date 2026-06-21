const CACHE_NAME = 'kevinteoart-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Laisser passer toutes les requêtes normalement
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// ── Notifications push ──────────────────────────────────────────────
// Réception d'une notif envoyée depuis le serveur (api/send-notification)
self.addEventListener('push', event => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { titre: 'Kevin Teo\'Art', message: event.data ? event.data.text() : '' };
  }

  const titre = data.titre || 'Kevin Teo\'Art';
  const options = {
    body: data.message || '',
    icon: data.icon || '/logo192.png',
    badge: '/logo192.png',
    data: { url: data.url || '/accueil' },
    tag: data.tag || undefined,
  };

  event.waitUntil(self.registration.showNotification(titre, options));
});

// Clic sur la notif → ouvre (ou refocus) l'onglet sur l'URL ciblée
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/accueil';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsList => {
      for (const client of clientsList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clientsList.length > 0 && 'focus' in clientsList[0]) {
        clientsList[0].navigate(url);
        return clientsList[0].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
