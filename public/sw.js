// Couch to 5K Service Worker
// Cache-first strategy for offline-first experience

const CACHE_VERSION = "c25k-v8";
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
        console.log("Service Worker v8 installed");
      })
  );
  // Force waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker v8 activating...");
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
        console.log("Service Worker v8 activated and ready");
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

// Helper: Check if request has expired
function isRequestExpired(reqData, maxAge) {
  return Date.now() - reqData.timestamp > maxAge;
}

// Helper: Check if request exceeded max retries
function hasExceededRetries(reqData) {
  const retryCount = reqData.retryCount || 0;
  const maxRetries = reqData.maxRetries || 5;
  return retryCount >= maxRetries;
}

// Helper: Handle successful sync
async function handleSuccessfulSync(db, reqData) {
  await deleteRequestFromQueue(db, reqData.id);
  notifyClients({
    type: "SYNC_SUCCESS",
    url: reqData.url,
  });
  console.log("Successfully synced request:", reqData.url);
  return { success: true };
}

// Helper: Handle client error (4xx)
async function handleClientError(db, reqData, response) {
  await deleteRequestFromQueue(db, reqData.id);
  notifyClients({
    type: "SYNC_FAILED",
    url: reqData.url,
    reason: `Client error: ${response.status}`,
  });
  console.log(`Request failed permanently (${response.status}):`, reqData.url);
  return { failed: true };
}

// Helper: Handle server error (5xx)
async function handleServerError(db, reqData, response) {
  await incrementRetryCount(db, reqData.id);
  console.log(
    `Server error ${response.status} for ${reqData.url}, will retry later`
  );
  return { retry: true };
}

// Helper: Handle network error
async function handleNetworkError(db, reqData, error) {
  await incrementRetryCount(db, reqData.id);
  console.log(`Network error for ${reqData.url}, will retry later:`, error);
  return { retry: true };
}

// Helper: Process a single queued request
async function processQueuedRequest(db, reqData) {
  try {
    const response = await fetch(reqData.url, {
      method: reqData.method,
      headers: reqData.headers,
      body: reqData.body,
    });

    if (response.ok) {
      return await handleSuccessfulSync(db, reqData);
    } else if (response.status >= 400 && response.status < 500) {
      return await handleClientError(db, reqData, response);
    } else if (response.status >= 500) {
      return await handleServerError(db, reqData, response);
    }
  } catch (error) {
    return await handleNetworkError(db, reqData, error);
  }

  return { retry: true };
}

// Helper: Validate if response should be cached
function shouldCacheResponse(response) {
  // Cache successful responses (200-299) and 304 Not Modified
  return (
    response &&
    ((response.status >= 200 && response.status < 300) ||
      response.status === 304)
  );
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
      if (isRequestExpired(reqData, MAX_AGE)) {
        await deleteRequestFromQueue(db, reqData.id);
        expiredCount++;
        console.log("Request expired:", reqData.url);
        continue;
      }

      // Check if max retries exceeded
      if (hasExceededRetries(reqData)) {
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

      // Process the request
      const result = await processQueuedRequest(db, reqData);

      if (result.success) {
        successCount++;
      } else if (result.failed) {
        failedCount++;
      }
      // If result.retry, we just continue to the next request
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
function shouldQueueRequest(request, pathname, method) {
  // Check for X-Queue-Offline header (preferred method)
  // This allows backend to explicitly control queueing behavior
  const queueHeader = request.headers.get("X-Queue-Offline");
  if (queueHeader !== null) {
    return queueHeader === "true" || queueHeader === "1";
  }

  // Fallback to pathname-based logic for backward compatibility
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
        const shouldQueue = shouldQueueRequest(
          request,
          url.pathname,
          request.method
        );

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

  // Check if this is a static asset (images, scripts, styles, fonts, etc.)
  const isStaticAsset =
    request.destination === "image" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    request.destination === "manifest" ||
    url.pathname.match(
      /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/
    );

  if (isDocument) {
    // Network-first for HTML documents - ensures fresh content
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Only cache successful responses
          if (shouldCacheResponse(networkResponse)) {
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
  } else if (isStaticAsset) {
    // Cache-first for static assets - fast loading
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response and update cache in background
          event.waitUntil(
            fetch(request)
              .then((networkResponse) => {
                // Only cache valid responses
                if (shouldCacheResponse(networkResponse)) {
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
            // Cache valid responses for GET requests
            if (shouldCacheResponse(networkResponse)) {
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
  } else {
    // Default: network-only for other requests (e.g., external resources, data fetches)
    event.respondWith(
      fetch(request).catch((error) => {
        console.error("Network request failed:", url.pathname, error);
        throw error;
      })
    );
  }
});
