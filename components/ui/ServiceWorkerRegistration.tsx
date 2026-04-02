"use client";
import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    // Register on next tick to not block rendering
    const timer = setTimeout(async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New SW installed — could show "Update available" toast here
              console.log("[SW] New version available — refresh to update.");
            }
          });
        });
      } catch (err) {
        console.warn("[SW] Registration failed:", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
