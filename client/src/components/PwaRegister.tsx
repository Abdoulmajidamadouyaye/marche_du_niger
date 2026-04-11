"use client";

import { useEffect } from "react";

const PwaRegister = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // In local development, disable SW caching to avoid stale UI/assets.
    if (isLocalhost) {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
        .catch(() => undefined);

      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
          .catch(() => undefined);
      }

      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Silent fail to avoid breaking user flow on unstable networks.
      }
    };

    register();
  }, []);

  return null;
};

export default PwaRegister;
