// Couch to 5K Service Worker
// Cache-first strategy for offline-first experience

const CACHE_VERSION = "c25k-v7";
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
        console.log("Service Worker v7 installed");
      })
  );
  // Force waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker v7 activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        const oldCaches = cacheNames.filter(
          (name) => name.startsWith("couch-to-5k-") && name !== CACHE_NAME
        );

        // Track cleanup results
        let successCount = 0;
        let failureCount = 0;

        // Delete each cache individually with error handling
        return Promise.all(
          oldCaches.map((name) => {
            console.log("Deleting old cache:", name);
            return caches
              .delete(name)
              .then((deleted) => {
                if (deleted) {
                  successCount++;
                  console.log("Successfully deleted cache:", name);
                } else {
                  failureCount++;
                  console.warn("Cache deletion returned false for:", name);
                }
              })
              .catch((error) => {
                failureCount++;
                console.error(`Failed to delete cache "${name}":`, error);
              });
          })
        ).then(() => {
          // Log cleanup summary
          if (oldCaches.length > 0) {
            console.log(
              `Cache cleanup complete: ${successCount} deleted, ${failureCount} failed`
            );
          }
        });
      })
      .then(() => {
        console.log("Service Worker v7 activated and ready");
        // Take control of all pages after cleanup completes
        return self.clients.claim();
      })
  );
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
    retryCount: 0,
    lastAttempt: null,
    maxRetries: 5,
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
    const request = indexedDB.open(OFFLINE_QUEUE_NAME, 2);

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

// Helper: Delete a request from the queue
async function deleteRequestFromQueue(db, id) {
  const deleteTx = db.transaction("requests", "readwrite");
  const deleteStore = deleteTx.objectStore("requests");
  await new Promise((resolve, reject) => {
    const request = deleteStore.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper: Increment retry count for a request
async function incrementRetryCount(db, id) {
  const updateTx = db.transaction("requests", "readwrite");
  const updateStore = updateTx.objectStore("requests");

  const reqData = await new Promise((resolve, reject) => {
    const request = updateStore.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  reqData.retryCount = (reqData.retryCount || 0) + 1;
  reqData.lastAttempt = Date.now();

  await new Promise((resolve, reject) => {
    const request = updateStore.put(reqData);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper: Notify all clients
function notifyClients(message) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage(message);
    });
  });
}

// Helper: Process queued requests when back online
async function processOfflineQueue() {
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

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
    let successCount = 0;
    let failedCount = 0;
    let expiredCount = 0;

    for (const reqData of requests) {
      // Check if request is too old
      if (Date.now() - reqData.timestamp > MAX_AGE) {
        await deleteRequestFromQueue(db, reqData.id);
        expiredCount++;
        console.log("Request expired:", reqData.url);
        continue;
      }

      // Check if max retries exceeded
      const retryCount = reqData.retryCount || 0;
      const maxRetries = reqData.maxRetries || 5;
      if (retryCount >= maxRetries) {
        await deleteRequestFromQueue(db, reqData.id);
        failedCount++;
        notifyClients({
          type: "SYNC_FAILED",
          url: reqData.url,
          reason: "Max retries exceeded",
        });
        console.log("Request failed permanently (max retries):", reqData.url);
        continue;
      }

      try {
        const response = await fetch(reqData.url, {
          method: reqData.method,
          headers: reqData.headers,
          body: reqData.body,
        });

        if (response.ok) {
          // Success - remove from queue
          await deleteRequestFromQueue(db, reqData.id);
          successCount++;
          notifyClients({
            type: "SYNC_SUCCESS",
            url: reqData.url,
          });
          console.log("Successfully synced request:", reqData.url);
        } else if (response.status >= 400 && response.status < 500) {
          // Client error - likely permanent, remove from queue
          await deleteRequestFromQueue(db, reqData.id);
          failedCount++;
          notifyClients({
            type: "SYNC_FAILED",
            url: reqData.url,
            reason: `Client error: ${response.status}`,
          });
          console.log(
            `Request failed permanently (${response.status}):`,
            reqData.url
          );
        } else if (response.status >= 500) {
          // Server error - transient, increment retry
          await incrementRetryCount(db, reqData.id);
          console.log(
            `Server error ${response.status} for ${reqData.url}, will retry later`
          );
        }
      } catch (error) {
        // Network error - increment retry and continue
        await incrementRetryCount(db, reqData.id);
        console.log(
          `Network error for ${reqData.url}, will retry later:`,
          error
        );
      }
    }

    console.log(
      `Queue processing complete: ${successCount} synced, ${failedCount} failed, ${expiredCount} expired`
    );

    if (successCount > 0 || failedCount > 0) {
      notifyClients({
        type: "QUEUE_SUMMARY",
        synced: successCount,
        failed: failedCount,
        expired: expiredCount,
      });
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

// Helper: Determine if a request should be queued for offline sync
function shouldQueueRequest(pathname, method) {
  // Don't queue GET requests - they don't modify data
  if (method === "GET") {
    return false;
  }

  // Don't queue authentication requests - these should fail immediately when offline
  // User needs to be online to authenticate, and we don't want to queue credentials
  if (pathname.startsWith("/api/auth/")) {
    return false;
  }

  // Queue all other mutation requests (POST, PUT, PATCH, DELETE)
  // This includes:
  // - /api/workouts/mark-complete
  // - /api/workouts/start
  // - /api/user/progress/repeat-week
  // - /api/user/progress/go-back-week
  // - /api/user/progress/jump-to
  // - Any future mutation endpoints
  return true;
}

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

        // Determine if this request should be queued for later
        let queued = false;
        const shouldQueue = shouldQueueRequest(url.pathname, request.method);

        if (shouldQueue) {
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

  // Different caching strategies based on request type
  const isDocument =
    request.destination === "document" ||
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"));

  if (isDocument) {
    // Network-first for HTML documents - ensures fresh content
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, try cache as fallback
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("Serving cached HTML (offline):", url.pathname);
              return cachedResponse;
            }
            // No cache available, return offline page or error
            throw new Error("Network failed and no cache available");
          });
        })
    );
  } else {
    // Cache-first for static assets - fast loading
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
  }
});
