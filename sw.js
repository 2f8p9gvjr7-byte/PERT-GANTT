const CACHE_NAME = 'pert-planner-v4';

const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Install: cache assets and activate immediately
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// Activate: delete ALL old caches immediately
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Fetch: ALWAYS network first, cache only as offline fallback
self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(function(response) {
      // If we got a valid response, update the cache
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Network failed — serve from cache (offline mode)
      return caches.match(event.request);
    })
  );
});
