"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      let onlineHandler: (() => void) | null = null;

      // Register service worker after page load for better performance
      const handleLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "Service Worker registered with scope:",
              registration.scope
            );

            // Process offline queue when coming back online
            onlineHandler = () => {
              console.log("Back online, processing queued requests...");
              if (registration.active) {
                registration.active.postMessage("PROCESS_OFFLINE_QUEUE");
              }
            };

            window.addEventListener("online", onlineHandler);
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      };

      window.addEventListener("load", handleLoad);

      // Cleanup function to remove event listeners
      return () => {
        window.removeEventListener("load", handleLoad);
        if (onlineHandler) {
          window.removeEventListener("online", onlineHandler);
        }
      };
    }
  }, []);

  // This component doesn't render anything
  return null;
}
