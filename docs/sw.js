const CACHE_NAME = "wardi-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "./styles.css", // pastikan file ini ada di dist/
  "./manifest.json", // pastikan ini juga disalin ke dist/
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Push Notification Handler
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || "Anda menerima notifikasi baru.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi", options)
  );
});
