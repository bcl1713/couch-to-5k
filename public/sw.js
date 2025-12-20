// Couch to 5K Service Worker
// Cache-first strategy for offline-first experience

const CACHE_VERSION = "c25k-v5";
const CACHE_NAME = `couch-to-5k-${CACHE_VERSION}`;
const OFFLINE_QUEUE_NAME = "offline-requests-queue";

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          // Don't fail installation if we can't cache assets (e.g., when offline)
          console.log("Failed to cache some assets during install:", error);
        });
      })
      .then(() => {
        console.log("Service Worker v5 installed");
      })
  );
  // Force waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker v5 activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (name) => name.startsWith("couch-to-5k-") && name !== CACHE_NAME
            )
            .map((name) => {
              console.log("Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log("Service Worker v5 activated and ready");
      })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Helper: Queue offline API requests
async function queueOfflineRequest(request) {
  const db = await openOfflineDB();
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== "GET" ? await request.text() : null,
    timestamp: Date.now(),
  };

  const tx = db.transaction("requests", "readwrite");
  const store = tx.objectStore("requests");

  await new Promise((resolve, reject) => {
    const request = store.add(requestData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper: Open IndexedDB for offline queue
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_QUEUE_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("requests")) {
        db.createObjectStore("requests", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    };
  });
}

// Helper: Process queued requests when back online
async function processOfflineQueue() {
  try {
    const db = await openOfflineDB();
    const tx = db.transaction("requests", "readonly");
    const store = tx.objectStore("requests");

    // Get all requests using a promise wrapper
    const requests = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    console.log(`Processing ${requests.length} queued requests`);

    for (const reqData of requests) {
      try {
        const response = await fetch(reqData.url, {
          method: reqData.method,
          headers: reqData.headers,
          body: reqData.body,
        });

        if (response.ok) {
          // Successfully synced, remove from queue
          const deleteTx = db.transaction("requests", "readwrite");
          const deleteStore = deleteTx.objectStore("requests");
          await new Promise((resolve, reject) => {
            const request = deleteStore.delete(reqData.id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
          console.log("Successfully synced request:", reqData.url);
        }
      } catch (error) {
        console.log("Still offline, will retry later:", error);
        break; // Stop processing if network is still unavailable
      }
    }
  } catch (error) {
    console.error("Error processing offline queue:", error);
  }
}

// Listen for online event to process queue
self.addEventListener("message", (event) => {
  if (event.data === "PROCESS_OFFLINE_QUEUE") {
    processOfflineQueue();
  }
});

// Fetch event - cache-first strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For all API requests, just pass through to network
  // Return proper error responses when offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request.clone()).catch(async () => {
        // Log for debugging
        console.log("API request failed (offline):", url.pathname);

        // For completion endpoints, queue them for later
        let queued = false;
        if (
          request.method !== "GET" &&
          (url.pathname.includes("/complete") ||
            url.pathname.includes("/mark-complete"))
        ) {
          try {
            await queueOfflineRequest(request.clone());
            queued = true;
            console.log("Request queued for sync when online");
          } catch (queueError) {
            console.error("Failed to queue request:", queueError);
          }
        }

        // Return proper error response
        return new Response(
          JSON.stringify({
            error: "You are currently offline. Please check your connection.",
            offline: true,
            queued: queued,
          }),
          {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // Handle GET requests with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse.clone());
                });
              }
              return networkResponse;
            })
            .catch(() => {
              // Network failed, but we already returned cached version
            })
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Cache successful responses for GET requests
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          // Network request failed and no cache available
          console.error("Fetch failed:", error);
          throw error;
        });
    })
  );
});
