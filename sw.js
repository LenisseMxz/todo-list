const CACHE_NAME = "todolist-cache-v22";
const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json",
    "./sw.js",
    "./css/styles.css",
    "./js/vendor/supabase.js",
    "./js/app.js",
    "./js/task.js",
    "./js/taskbox.js",
    "./js/taskstorage.js",
    "./js/supabase.js",
    "./images/Black_and_white_squares.png",
    "./icons/icon_32.png",
    "./icons/icon_512.png"
]

self.addEventListener("install", event => {
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
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});