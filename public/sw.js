/* Service worker: lets the app open offline and show the data you last saw.
   - Pages and data use "network first": online you always get fresh data,
     offline you get the last copy.
   - Writes (add, edit, delete) always need a connection.
   - Signing out wipes the saved pages and data (see lib/offline.ts). */

const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`; // offline page + icons
const PAGES_CACHE = `pages-${VERSION}`; // pages you have opened
const STATIC_CACHE = `static-${VERSION}`; // JS and CSS files
const API_CACHE = `api-${VERSION}`; // last successful data responses
const OFFLINE_URL = "/offline.html";
const MAX_STATIC_ENTRIES = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, PAGES_CACHE, STATIC_CACHE, API_CACHE]);
      for (const key of await caches.keys()) {
        if (!keep.has(key)) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isApi = url.pathname.startsWith("/api/");
  const isLogin = url.pathname.startsWith("/api/login");

  // Writes go straight to the network. After one succeeds, saved data is dropped
  // so an old copy is never shown as if it were current.
  if (request.method !== "GET") {
    if (isApi && !isLogin) {
      event.respondWith(
        fetch(request).then(async (response) => {
          if (response.ok) await caches.delete(API_CACHE);
          return response;
        })
      );
    }
    return;
  }

  if (isLogin || url.pathname === "/api/export") return; // never stored

  if (isApi) {
    event.respondWith(networkFirst(request, API_CACHE, false));
  } else if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (request.mode === "navigate") {
    event.respondWith(openPage(request));
  } else if (/\.(png|svg|ico)$/.test(url.pathname) || url.pathname === "/manifest.webmanifest") {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
  }
});

async function networkFirst(request, cacheName, ignoreSearch) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && !response.redirected) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch });
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
    trim(cache, MAX_STATIC_ENTRIES);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || refresh;
}

// Opening a page: the page shell is the same whatever the ?query is, so any saved copy will do offline.
async function openPage(request) {
  try {
    return await networkFirst(request, PAGES_CACHE, true);
  } catch {
    const shell = await caches.open(SHELL_CACHE);
    return (await shell.match(OFFLINE_URL)) || Response.error();
  }
}

// Keeps the static cache from growing forever across deployments
async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}
