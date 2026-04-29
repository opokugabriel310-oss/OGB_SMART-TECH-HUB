const cacheName = "techhub-v1";

const filesToCache = [
  "/",
  "/index.html",
  "/apps.html",
  "/gaming.html",
  "/money.html",
  "/about.html",
  "/contact.html"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});