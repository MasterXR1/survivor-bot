const CACHE = "survivor-bot-v1";
const STATIC = ["/", "/manifest.json", "/icon.svg", "/icon-maskable.svg"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;   // never cache Binance/CoinGecko/Hyperliquid/ccxt CDN calls - always live
  if (req.mode === "navigate") {                       // the app page itself: network-first, cached fallback if offline
    event.respondWith(
      fetch(req).then(res => { caches.open(CACHE).then(c => c.put(req, res.clone())); return res; })
        .catch(() => caches.match(req).then(res => res || caches.match("/")))
    );
    return;
  }
  event.respondWith(                                    // static assets (manifest, icons): cache-first
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      caches.open(CACHE).then(c => c.put(req, res.clone())); return res;
    }))
  );
});
