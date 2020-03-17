const appVersion = 2;
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
    caches.match(e.request)
  );
});
