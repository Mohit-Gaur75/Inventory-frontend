import { useState, useEffect, useCallback } from "react";

const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall,     setCanInstall]     = useState(false);
  const [isInstalled,    setIsInstalled]    = useState(false);
  const [swRegistered,   setSwRegistered]   = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => {
          console.log("✅ SW registered:", reg.scope);
          setSwRegistered(true);
        })
        .catch((err) => console.error("SW registration failed:", err));
    }
  }, []);

  useEffect(() => {
   
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
    setCanInstall(false);
  }, [deferredPrompt]);

  return { canInstall, install, isInstalled, swRegistered };
};

export default usePWA;
