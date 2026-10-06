const CACHE_NAME = "todolist-cache-v13";
const urlsToCache = [
    "/todo-list/",
    "/todo-list/index.html",
    "/todo-list/manifest.json",
    "/todo-list/sw.js",
    "/todo-list/css/styles.css",
    "/todo-list/js/vendor/supabase.js",
    "/todo-list/js/app.js",
    "/todo-list/js/task.js",
    "/todo-list/js/taskbox.js",
    "/todo-list/js/taskstorage.js",
    "/todo-list/js/supabase.js",
    "/todo-list/images/Black_and_white_squares.png",
    "/todo-list/icons/icon_32.png",
    "/todo-list/icons/icon_512.png"
]

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
  event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/todo-list/index.html"))
    );
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match("/todo-list/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
      return response || fetch(event.request);
    })
  );
});