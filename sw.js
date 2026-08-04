// تم تغيير الإصدار إلى v2 لإجبار المتصفح على التحديث
const CACHE_NAME = 'games-arcade-cache-v2'; 
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache v2');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  // إجبار Service Worker الجديد على تولي السيطرة فوراً
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع النسخة المخزنة إن وجدت
        if (response) {
          return response;
        }
        
        // إذا لم تكن في الكاش، حاول جلبها من الإنترنت
        return fetch(event.request).catch(() => {
          // إذا فشل الجلب (مثلاً المستخدم أوفلاين)، وكان الطلب هو صفحة ويب، أعد له الصفحة الرئيسية
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});