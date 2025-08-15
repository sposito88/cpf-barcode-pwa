// Enhanced Service Worker for CPF Barcode Scanner PWA

const CACHE_NAME = 'cpf-barcode-scanner-v2.0.0';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE = `${CACHE_NAME}-dynamic`;
const RUNTIME_CACHE = `${CACHE_NAME}-runtime`;

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/src/css/base/variables.css',
  '/src/css/base/reset.css',
  '/src/css/base/typography.css',
  '/src/css/components/layout.css',
  '/src/css/components/buttons.css',
  '/src/css/components/cards.css',
  '/src/css/components/forms.css',
  '/src/css/components/modals.css',
  '/src/css/components/animations.css',
  '/src/css/themes/dark.css',
  '/src/js/utils/constants.js',
  '/src/js/utils/helpers.js',
  '/src/js/utils/storage.js',
  '/src/js/utils/validators.js',
  '/src/js/components/toast.js',
  '/src/js/components/modal.js',
  '/src/js/components/theme.js',
  '/src/js/core/camera.js',
  '/src/js/core/ocr.js',
  '/src/js/core/barcode.js',
  '/src/js/core/app.js'
];

// External libraries to cache
const EXTERNAL_LIBS = [
  'https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js',
  'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js'
];

// Network-first resources
const NETWORK_FIRST = [
  '/api/',
  'https://unpkg.com/tesseract.js-core@4.0.4/tesseract-core.wasm.js',
  'https://tessdata.projectnaptha.com/'
];

// Cache-first resources
const CACHE_FIRST = [
  '/icons/',
  '/assets/',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.webp',
  '.woff2',
  '.woff'
];

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache external libraries
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('[SW] Caching external libraries');
        return Promise.allSettled(
          EXTERNAL_LIBS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache ${url}:`, err);
            })
          )
        );
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Force activation of new service worker
      return self.skipWaiting();
    })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('cpf-barcode-scanner-') && 
                !cacheName.includes('v2.0.0')) {
              console.log(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete');
    })
  );
});

/**
 * Fetch Event - Handle network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

/**
 * Handle fetch requests with different strategies
 */
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for API calls and dynamic content
    if (NETWORK_FIRST.some(pattern => url.pathname.startsWith(pattern) || url.href.includes(pattern))) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (CACHE_FIRST.some(pattern => url.pathname.includes(pattern) || url.pathname.endsWith(pattern))) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for HTML pages
    if (request.destination === 'document') {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Cache-first with network fallback
    return await cacheFirst(request);
    
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    
    // Return offline fallback if available
    return await getOfflineFallback(request);
  }
}

/**
 * Network-first strategy
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(error => {
    console.warn('[SW] Background fetch failed:', error);
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Wait for network if no cache
  return await fetchPromise;
}

/**
 * Get offline fallback
 */
async function getOfflineFallback(request) {
  // For HTML requests, return cached index.html
  if (request.destination === 'document') {
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
  }
  
  // For images, return a placeholder if available
  if (request.destination === 'image') {
    const placeholder = await caches.match('/icons/icon-192x192.png');
    if (placeholder) {
      return placeholder;
    }
  }
  
  // Return generic offline response
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Você está offline. Verifique sua conexão com a internet.'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Background Sync Event
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

/**
 * Perform background sync
 */
async function doBackgroundSync() {
  try {
    // Sync any pending data
    console.log('[SW] Performing background sync...');
    
    // You can add specific sync logic here
    // For example, sync history data, settings, etc.
    
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

/**
 * Push Event - Handle push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: 'Scanner de CPF atualizado!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'Scanner de CPF';
  }
  
  event.waitUntil(
    self.registration.showNotification('Scanner de CPF', options)
  );
});

/**
 * Notification Click Event
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

/**
 * Message Event - Handle messages from main thread
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
  } catch (error) {
    console.error('[SW] Error clearing caches:', error);
  }
}

/**
 * Periodic Background Sync (if supported)
 */
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
      event.waitUntil(doPeriodicSync());
    }
  });
}

/**
 * Perform periodic sync
 */
async function doPeriodicSync() {
  try {
    console.log('[SW] Performing periodic sync...');
    
    // Update cache with fresh content
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(STATIC_ASSETS);
    
  } catch (error) {
    console.error('[SW] Periodic sync failed:', error);
  }
}

/**
 * Error handling
 */
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});

console.log('[SW] Service worker loaded successfully');

