const CACHE = "cpf-barcode-v1";
const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js",
  "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js",
  // tentar pré-cachear dados do idioma (será 'opaque', mas serve offline após 1ª vez)
  "https://tessdata.projectnaptha.com/4.0.0/por.traineddata.gz"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estratégia: stale-while-revalidate simples
self.addEventListener("fetch", (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        const copy = networkRes.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return networkRes;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
