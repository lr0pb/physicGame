const appVersion = 3;
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
        './magnetic.svg'
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
    caches.match(e.request).then(function (response) {
      console.log(response);
    })
  );
});

/*
fetch(e.request).then(function (response) {
  console.log(response.url);
  console.log(response.clone().url);
  if (response.ok) {
    cashe.put(e.request, response.clone().url).then(function () {
      console.log('[SW] new cache');
    })
  };
  return response;
})
*/
