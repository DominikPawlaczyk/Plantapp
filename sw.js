const CACHE = 'plant-tracker-v5';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './sw.js',
  './manifest.json',
  './lucide.min.js',
  './chart.min.js',
  './vine-bg.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      return Promise.allSettled(ASSETS.map(a => c.add(a)));
    })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Claim control of all open tabs immediately
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Network-first for API calls and main document/scripts to ensure updates
  if (url.includes('api.') || url.includes('wttr.in') || url.includes('.js') || url.includes('.html') || url.includes('.css')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { 
          const c = r.clone(); 
          caches.open(CACHE).then(cache => cache.put(e.request, c)); 
          return r; 
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  // Cache-first for images, fonts, etc.
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

self.addEventListener('push', e => {
  const d = e.data?.json() || {};
  e.waitUntil(self.registration.showNotification(d.title || 'Plant Tracker', {
    body: d.body || 'Czas podlać rośliny!',
    icon: './icons/icon-192.png',
    vibrate: [200, 100, 200],
    actions: [{ action: 'done', title: '✓ Gotowe' }]
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
