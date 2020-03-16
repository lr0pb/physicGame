const CASHE = 'cache-v1';

self.addEventListener('install', function(e) {
  e.waitUntil(
    cashes.open(CASHE)
      .then( (cashe) => {
        return cashe.addAll([
          '/launcher.svg',
          '/ufo.svg',
          '/electro.svg',
          '/magnetic.svg'
        ]);
      })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith( fromCashe(e.request) );
});

function fromCashe(request) {
  return cashes.open(CASHE)
           .then( (cashe) => {
             cashe.match(request)
              .then( (matching) => matching || Promise.reject('no-match') )
           })
};
