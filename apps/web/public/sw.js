// Минимальный service worker — без него часть браузеров (в первую очередь
// Chrome/Android) не считает сайт "устанавливаемым" и не показывает диалог
// установки PWA. Никакого офлайн-кэширования намеренно не делаем — только
// критерий устанавливаемости, чтобы не рисковать показом устаревших данных.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {});
