"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker after page load for better performance
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "Service Worker registered with scope:",
              registration.scope
            );

            // Check for updates periodically
            registration.update();

            // Process offline queue when coming back online
            window.addEventListener("online", () => {
              console.log("Back online, processing queued requests...");
              if (registration.active) {
                registration.active.postMessage("PROCESS_OFFLINE_QUEUE");
              }
            });
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
