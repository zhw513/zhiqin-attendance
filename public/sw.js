const CACHE_NAME = 'attendance-v2';
const STATIC_ASSETS = ['/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (request.method !== 'GET') return;
  if (request.headers.get('range')) return;

  // 对 HTML（导航请求）使用网络优先策略，确保始终获取最新部署
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.status === 200) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 对静态资源（带 hash 的文件名）使用缓存优先策略
  event.respondWith(
    caches.match(request)
      .then(cached => cached || fetch(request))
      .then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const respToCache = response.clone();
        caches.open(CACHE_NAME)
          .then(cache => cache.put(request, respToCache));
        return response;
      })
      .catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});
