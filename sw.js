const appVersion = 1;
      appName = 'physicGame';
      appCashe = appName + '-v' + appVersion;
      offlineFiles = ['./index.html','./style.css','/script.js','./ufo.svg','./launcher.svg','./electro.svg','./magnetic.svg'];

self.addEventListener('install', function (e) {
  console.log('[SW] install');
  skipWaiting();
  e.waitUntil(
    cashes.open(appCashe).then(function (cashe) {
      cashe.addAll(offlineFiles);
    })
  );
});

self.addEventListener('activate', function (e) {
  console.log('[SW] activate');
  clients.claim();
  e.waitUntil(
    cashes.keys().then(function (keys) {
      Promise.all(
        keys.map( (key) => key == appCashe || cashes.delete(key) )
      );
    })
  );
});

self.addEventListener('fetch', function (e) {
  console.log('[SW] fetch');
  e.respondWith(
    cashes.match(e.request).then(function (response) {
      return response || fetch(e.request);
    })
  );
});
