const appVersion = 1;
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
        skipWaiting();
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
      let cacheResponse = await caches.match(e.request);
      if (cacheResponse) {
        console.log(cacheResponse);
        console.log(cacheResponse.headers);
        cacheResponse.headers.set('cache-control','max-age=1209600');
        return cacheResponse;
      };
      return addCache(e.request);
    }) ()
  );
  e.waitUntil(
    (async function () {
      const fetchResponse = await fetch(e.request);
      const cacheResponse = await caches.match(e.request);
      if (fetchResponse.headers.get('server') == 'Github.com' && fetchResponse.headers.get('ETag') != cacheResponse.headers.get('ETag')) {
        updateCache(e.request, fetchResponse)
      };
    })()
  );
});

async function addCache(request) {
  console.log('[SW] add new cache');
  fetch(request).then(function (response) {
    if (response.ok) {
      caches.open(appCache).then(function (cache) {
        cache.put(request, response.clone());
      })
    } else {
      response = new Response(new Blob, { 'status': 400, 'statusText': 'Bad request' });
    };
    return response;
  })
};

async function updateCache(request, response) {
  console.log('[SW] update cache');
  caches.open(appCache).then(function (cache) {
    cache.put(request, response);
  })
  console.log(clients);
  clients.matchAll().then(function (client) {
    Promise.all(
      client.postMessage('update')
    );
  })
};
