"use client";

import { useEffect } from "react";

// Registers the service worker (production only, so local development is not confused by caching).
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((e) => console.warn("Service worker registration failed:", e));
  }, []);

  return null;
}
