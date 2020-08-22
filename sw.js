const appVersion = 5;
      appName = 'physicGame';
      appCache = appName + appVersion;
      serverName = 'GitHub.com';
      offlineFiles = [
        './',
        './index.html',
        './style.css',
        './script.js',
        './ufo.svg',
        './launcher.svg',
        './electro.svg',
        './magnetic.svg',
        './cover.svg',
        './icon192x192.svg',
        './icon512x512.svg',
        './manifest.json',
        'https://fonts.googleapis.com/css?family=Montserrat:600,700,800&display=swap&subset=cyrillic'
      ];

self.addEventListener('install', (e) => {
  console.log('[SW] install');
  skipWaiting();
  e.waitUntil(
    let cache = await caches.open(appCache);
    cache.addAll(offlineFiles);
  );
});

self.addEventListener('activate', (e) => {
  console.log('[SW] activate');
  clients.claim();
  e.waitUntil(
    caches.keys().then( (keys) => {
      Promise.all(
        keys.map( (key) => key == appCache || caches.delete(key) )
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  console.log('[SW] fetch ' + e.request.url);
  let cacheResponse = null;
      fetchResponse = null;
  e.respondWith(
    (async () => {
      cacheResponse = await caches.match(e.request);
      if (cacheResponse) return cacheResponse;
      fetchResponse = await addCache(e.request);
      return fetchResponse;
    })()
  );
  e.waitUntil(
    (async () => {
      if (!fetchResponse) fetchResponse = await fetch(e.request);
      console.log('[SW] Cache time ' + cacheResponse.headers.get('last-modified') + ' for ' + e.request.url);
      console.log('[SW] Fetch time ' + fetchResponse.headers.get('last-modified'));
      if (fetchResponse.headers.get('server') == serverName && fetchResponse.headers.get('last-modified') != cacheResponse.headers.get('last-modified')) {
        updateCache(e.request, fetchResponse);
      };
    })()
  );
});

async function addCache(request) {
  console.log('[SW] add cache ' + request.url);
  let fetchResponse = new Response(new Blob, { 'status': 400, 'statusText': 'Bad request' });
  let response = await fetch(request);
  if (response.ok) {
    let cache = await caches.open(appCache);
    cache.put(request, response.clone());
    fetchResponse = response;
  }
  return fetchResponse;
};

async function updateCache(request, response) {
  console.log('[SW] update cache ' + request.url);
  let cache = await caches.open(appCache);
  cache.put(request, response);
  const allClients = await clients.matchAll();
  for (let client of allClients) {
    client.postMessage('update');
  };
};
