const CACHE = "english-wizard-shell-v2";
const SHELL = ["/dashboard", "/offline", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];
const ASSET_PATTERN = /\/_next\/static\/|\/icon-\d+\.png$|\/logo\.png$/;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Immutable build assets and icons: cache-first.
  if (ASSET_PATTERN.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        }),
      ),
    );
    return;
  }

  // Pages and API: network-first with offline fallback.
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/offline"))),
  );
});
