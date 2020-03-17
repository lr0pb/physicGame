const appVersion = 1;
      appName = 'physicGame';
      appCache = appName + appVersion;
      offlineFiles = ['./index.html','./style.css','./script.js','./ufo.svg','./launcher.svg','./electro.svg','./magnetic.svg'];

self.addEventListener('install', function (e) {
  console.log('[SW] install');
  skipWaiting();
  e.waitUntil(
    caches.open(appCache).then(function (cache) {
      cache.addAll(offlineFiles).then(function (cache) {
        console.log('[SW] cashe added');
        console.log(cache);
      });
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
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
