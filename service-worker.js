var cacheName = 'pwa-cache-intall-v1';

var filesToCache = [
  'index.html',
  'scripts/app.js',
  'styles/inline.css',
  'styles/main.css',
  'scripts/vendor/localforage.min.js',
  'scripts/vendor/moment-with-locales.min.js',
  'scripts/vendor/d3.min.js',
  'data.json'
];

/*****************************************************************************
*
* Install the service worker
*
****************************************************************************/

// When the service worker is registered, an install event is triggered the first time
// the user visits the page. In this event handler, we will cache all the assets that are
// needed for the application.

// When the service worker is fired, it should open the caches object and populate it with
// the assets necessary to load the App Shell

// IMPORTANT - The code below must NOT be used in production, it covers only the most basic use cases and
// it's easy to get yourself into a state where your app shell will never update.
// See: https://developers.google.com/web/fundamentals/getting-started/your-first-progressive-web-app/step-04?hl=en#beware-of-the-edge-cases
self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(cacheName)
    .then(function (cache) {
      console.log('[ServiceWorker] Caching App Shell');
      return cache.addAll(filesToCache);
    })
  );
});

/*****************************************************************************
*
* Activate and Purge the cache
*
****************************************************************************/

// It’s important to periodically purge the cache of unused content and data.
self.addEventListener('activate', function (event) {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys()
    .then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        console.log('[ServiceWorker] Removing old cache', key);
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

/*****************************************************************************
*
* Serve the app shell from the cache
*
****************************************************************************/

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(cacheName)
    .then(function(cache) {
      return cache.match(event.request)
      .then(function(response) {
        var fetchPromise = fetch(event.request).then(function(networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    })
  );
});
