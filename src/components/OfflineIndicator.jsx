import { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
      {isOffline && (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl border border-slate-700/80 flex items-center gap-2 animate-bounce-short">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>You are offline. Browsing cached store data.</span>
        </div>
      )}

      {showReconnected && !isOffline && (
        <div className="pointer-events-auto bg-emerald-600/95 backdrop-blur-md text-white text-xs font-medium px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
          <Wifi className="w-3.5 h-3.5 text-white" />
          <span>Back online! Live inventory restored.</span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
