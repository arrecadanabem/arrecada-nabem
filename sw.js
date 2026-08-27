// Service Worker Arrecada Nabem (v159)
const CACHE = 'nabem-v159-1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
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
  if(e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function(response){
      // Network first: sempre tenta pegar o mais novo
      if(!response || response.status !== 200) throw new Error('bad response');
      var toCache = response.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, toCache); });
      return response;
    }).catch(function(){
      return caches.match(e.request).then(function(res){
        if(res) return res;
        if(e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
