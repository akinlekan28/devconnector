

function startService() {
  const STATIC_CACHE_NAME = "devconnector-v1";
  const STATIC_URLS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/static/css/main.css",
    "/static/js/main.js",
    "/logo.png",
    "/bootstrap.min.css",
    "/bootstrap.min.js",
    "/all.min.css",
    "/all.min.js",
    "/jquery-3.3.1.min.js",
    "/popper.min.js"
  ];

  const STATIC_URLS = BASE_STATIC_URLS.concat(JSON.parse('%MANIFESTURLS%'));

  self.addEventListener("install", event => {
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_URLS);
      }).then(() => self.skipWaiting())
    );
  });

  self.addEventListener("fetch", event => {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  });

  self.addEventListener("activate", event => {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.includes("devconnector") && name !== STATIC_CACHE_NAME)
            .map(name => caches.delete(name))
        )
      }).then(() => self.clients.claim())
    );
  });

  console.log("service started")
}

startService();

