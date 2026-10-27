const CACHE = "todo-cache";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

// сначала сеть (всегда свежая версия), нет интернета: берём из памяти
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  const ours = url.origin === self.location.origin;
  const firebaseScripts = url.hostname === "www.gstatic.com";
  if (!ours && !firebaseScripts) return; // запросы к базе не кэшируем

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request)),
  );
});