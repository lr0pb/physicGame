const appVersion = 5;
      appName = 'physicGame';
      appCache = appName + appVersion;
      offlineFiles = [
        './',
        './index.html',
        './style.css',
        './script.js',
        './ufo.svg',
        './launcher.svg',
        './electro.svg',
        './magnetic.svg',
        'https://fonts.googleapis.com/css?family=Montserrat:600,700,800&display=swap&subset=cyrillic'
      ];

self.addEventListener('install', function (e) {
  console.log('[SW] install');
  skipWaiting();
  e.waitUntil(
    caches.open(appCache).then(function (cache) {
      cache.addAll(offlineFiles).then(function () {
        console.log('[SW] cashe added');
      })
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('[SW] activate');
  clients.claim();
  e.waitUntil(
    caches.keys().then(function (keys) {
      Promise.all(
        keys.map( (key) => key == appCache || caches.delete(key) )
      );
    })
  );
});

self.addEventListener('fetch', function (e) {
  console.log('[SW] fetch');
  e.respondWith(
    (async function () {
      const cacheResponse = await caches.match(e.request);
      if (cacheResponse) return cacheResponse;

      fetch(e.request).then(function (response) {
        if (response.ok) {
          caches.open(appCache).then(function (cache) {
            cache.put(e.request, response.clone()).then(function () {
              console.log('[SW] add new cache ' + e.request.url);
            })
          })
        };
        return response;
      })
    }) ()
  );
  e.waitUntil(
    fetch(e.request).then(async function (response) {
      const cacheResponse = await caches.match(e.request);
      if (cacheResponse.headers.get('ETag') != response.headers.get('ETag')) {
        caches.open(appCache).then(function (cache) {
          cache.put(e.request, response).then(function () {
            console.log('[SW] new version of ' + e.request.url);
            clients.postMessage('update');
          })
        })
      };
    })
  );
});
