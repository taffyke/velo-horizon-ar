
const CACHE_NAME = 'cycletrack-pro-v2';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

const MAP_CACHE_NAME = 'cycletrack-maps-v1';
const WEATHER_CACHE_NAME = 'cycletrack-weather-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE_URLS)),
      caches.open(MAP_CACHE_NAME),
      caches.open(WEATHER_CACHE_NAME)
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![CACHE_NAME, MAP_CACHE_NAME, WEATHER_CACHE_NAME].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle map tile requests
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('openstreetmap.org')) {
    event.respondWith(
      caches.open(MAP_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // Return a default tile if offline
            return new Response('Offline', { status: 503 });
          });
        });
      })
    );
    return;
  }
  
  // Handle weather API requests
  if (url.hostname.includes('openweathermap.org') || url.pathname.includes('/weather')) {
    event.respondWith(
      caches.open(WEATHER_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response) {
            // Check if cached data is less than 30 minutes old
            const cacheTime = response.headers.get('sw-cache-time');
            if (cacheTime && Date.now() - parseInt(cacheTime) < 30 * 60 * 1000) {
              return response;
            }
          }
          
          return fetch(event.request).then((networkResponse) => {
            const responseClone = networkResponse.clone();
            responseClone.headers.append('sw-cache-time', Date.now().toString());
            cache.put(event.request, responseClone);
            return networkResponse;
          }).catch(() => {
            return response || new Response('Offline weather data unavailable', { status: 503 });
          });
        });
      })
    );
    return;
  }
  
  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
