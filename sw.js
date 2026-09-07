const CACHE_NAME = "todolist-cache-v4";
const urlsToCache = [
    "/todo-list/",
    "/todo-list/index.html",
    "/todo-list/manifest.json",
    "/todo-list/sw.js",
    "/todo-list/css/styles.css",
    "/todo-list/js/app.js",
    "/todo-list/js/task.js",
    "/todo-list/js/taskbox.js",
    "/todo-list/js/taskstorage.js",
    "/todo-list/images/Black_and_white_squares.png",
    "/todo-list/icons/icon.png"
]

self.addEventListener("install", event => {
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
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      if (event.request.mode === "navigate") {
        return caches.match("/todo-list/index.html");
      }
      return fetch(event.request);
    })
  );
});