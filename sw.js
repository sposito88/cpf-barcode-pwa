const CACHE = "cpf-barcode-v2";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js",
  "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"
];

// Cache de dados do Tesseract para melhor performance offline
const TESSERACT_CACHE = [
  "https://tessdata.projectnaptha.com/4.0.0/por.traineddata.gz"
];

self.addEventListener("install", (e) => {
  console.log('Service Worker instalando...');
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(CORE);
      })
      .then(() => {
        console.log('Cache core adicionado');
        // Tenta cachear dados do Tesseract em background
        return caches.open(CACHE + '-tesseract');
      })
      .then(cache => {
        return cache.addAll(TESSERACT_CACHE).catch(err => {
          console.log('Dados Tesseract não puderam ser cacheados:', err);
        });
      })
      .then(() => {
        console.log('Service Worker instalado');
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", (e) => {
  console.log('Service Worker ativando...');
  e.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE && key !== CACHE + '-tesseract')
            .map(key => {
              console.log('Removendo cache antigo:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Estratégia de cache melhorada
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  
  // Para recursos externos (CDN), usa stale-while-revalidate
  if (url.hostname !== self.location.hostname) {
    e.respondWith(
      caches.match(req)
        .then(cached => {
          const fetchPromise = fetch(req)
            .then(networkRes => {
              if (networkRes.ok) {
                const copy = networkRes.clone();
                caches.open(CACHE)
                  .then(cache => cache.put(req, copy))
                  .catch(err => console.log('Erro ao cachear:', err));
              }
              return networkRes;
            })
            .catch(() => cached);
          
          return cached || fetchPromise;
        })
    );
    return;
  }
  
  // Para recursos locais, usa cache-first
  e.respondWith(
    caches.match(req)
      .then(cached => {
        if (cached) {
          return cached;
        }
        
        return fetch(req)
          .then(networkRes => {
            if (networkRes.ok) {
              const copy = networkRes.clone();
              caches.open(CACHE)
                .then(cache => cache.put(req, copy))
                .catch(err => console.log('Erro ao cachear local:', err));
            }
            return networkRes;
          });
      })
  );
});

// Intercepta mensagens do cliente
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
