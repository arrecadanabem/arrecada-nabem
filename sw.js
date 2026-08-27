// Service Worker Arrecada Nabem (v156+)
const CACHE = 'nabem-v156-1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k !== CACHE;}).map(function(k){return caches.delete(k);}));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  // Só trata GETs no mesmo domínio; Firebase e CDNs passam direto
  if(e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request).then(function(res){
      if(res) return res;
      return fetch(e.request).then(function(response){
        if(!response || response.status !== 200 || response.type !== 'basic') return response;
        var toCache = response.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, toCache); });
        return response;
      }).catch(function(){
        // Se off e não tem no cache, devolve index (SPA fallback)
        if(e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
