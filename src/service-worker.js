/* Build placeholders are replaced by scripts/pwa.ts. */
const CACHE_NAME = 'boulderlog-' + __CACHE_VERSION__;
const PRECACHE_ASSETS = __PRECACHE_ASSETS__;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name =>
      (name.startsWith('boulderlog-') || name.startsWith('climbtrack-') || name.startsWith('BoulderLog-')) &&
      name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () =>
      (await caches.open(CACHE_NAME)).match('/')
        .then(response => response || new Response('Offline', { status: 503 }))));
  } else if (PRECACHE_ASSETS.includes(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      return fetch(request);
    })());
  }
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-sessions') {
    event.waitUntil(self.clients.matchAll().then(clients => {
      for (const client of clients) client.postMessage({ type: 'SYNC_SESSIONS' });
    }));
  }
});
