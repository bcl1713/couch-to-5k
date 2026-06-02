"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    let onlineHandler: (() => void) | null = null;
    let messageHandler: ((event: MessageEvent) => void) | null = null;

    // Register service worker after page load for better performance
    const handleLoad = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          logger.info(
            "Service Worker registered with scope:",
            registration.scope
          );

          // Process offline queue when coming back online
          onlineHandler = () => {
            logger.info("Back online, processing queued requests...");
            if (registration.active) {
              registration.active.postMessage("PROCESS_OFFLINE_QUEUE");
            }
          };

          // Listen for sync notifications from service worker
          messageHandler = (event: MessageEvent) => {
            if (event.data?.type) {
              switch (event.data.type) {
                case "SYNC_SUCCESS":
                  logger.info("Successfully synced:", event.data.url);
                  break;
                case "SYNC_FAILED":
                  logger.warn(
                    "Failed to sync:",
                    event.data.url,
                    event.data.reason
                  );
                  break;
                case "QUEUE_SUMMARY":
                  logger.info(
                    `Sync complete: ${event.data.synced} succeeded, ${event.data.failed} failed, ${event.data.expired} expired`
                  );
                  break;
              }
            }
          };

          window.addEventListener("online", onlineHandler);
          navigator.serviceWorker.addEventListener("message", messageHandler);
        })
        .catch((error) => {
          logger.error("Service Worker registration failed:", error);
        });
    };

    // Check if the load event has already fired
    if (document.readyState === "complete") {
      // Page is already loaded, register immediately
      handleLoad();
    } else {
      // Page is still loading, wait for load event
      window.addEventListener("load", handleLoad);
    }

    // Cleanup function to remove event listeners
    return () => {
      window.removeEventListener("load", handleLoad);
      if (onlineHandler) {
        window.removeEventListener("online", onlineHandler);
      }
      if (messageHandler) {
        navigator.serviceWorker.removeEventListener("message", messageHandler);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
