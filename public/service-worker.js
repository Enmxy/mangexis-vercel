// MangeXis Service Worker - PWA Support (No offline caching)
const CACHE_VERSION = 'v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - No caching, just pass through
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // If offline, return a simple message
      return new Response('Çevrimdışısınız. Lütfen internet bağlantınızı kontrol edin.', {
        headers: { 'Content-Type': 'text/plain' }
      })
    })
  )
})
