var cacheName = 'sw-version-3'; // the cache version
var filesToCache = [
  '/',
  '/style/main.css',
  '/index.html',
  '/all.min.css',
  '/all.min.js',
  '/bootstrap.min.css',
  '/bootstrap.min.js',
  '/jquery-3.3.1.min.js',
  '/logo.png',
  '/manifest.json',
  '/popper.min.js'
  // files you need to cache (can be anything), never cache the SW itself,
];

self.addEventListener('install', function (e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});