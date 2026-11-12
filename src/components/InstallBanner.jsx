import { useState, useEffect } from "react";
import usePWA from "../hooks/usePWA";
import { Download, X, Share, PlusSquare, Sparkles } from "lucide-react";

const InstallBanner = () => {
  const { canInstall, install, isInstalled, isIOS } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem("localmart_pwa_dismissed");
    if (isDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("localmart_pwa_dismissed", "true");
  };

  // If already installed or dismissed, hide
  if (isInstalled || dismissed) return null;

  // 1. Android / Desktop (Chrome, Edge, Samsung Internet)
  if (canInstall) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
        <div className="bg-white/95 backdrop-blur-md border border-teal-100 shadow-2xl rounded-2xl p-4 flex items-center gap-3.5 ring-1 ring-black/5">
          {/* App Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20 p-2">
            <img src="/icons/icon-96x96.png" alt="LocalMart" className="w-full h-full object-contain drop-shadow" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-slate-900 text-sm">Install LocalMart</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
                <Sparkles className="w-2.5 h-2.5 mr-0.5 text-teal-600" /> Fast
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">Offline shopping, instant prices & map</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={install}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Install
            </button>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. iOS Safari (Guides user to Share -> Add to Home Screen)
  if (isIOS) {
    return (
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-slide-up">
        <div className="bg-white/95 backdrop-blur-md border border-teal-100 shadow-2xl rounded-2xl p-4 ring-1 ring-black/5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                <img src="/icons/icon-96x96.png" alt="LocalMart" className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-display font-bold text-slate-900 text-sm">Install LocalMart on iPhone</p>
                <p className="text-xs text-slate-500">Get native full-screen app experience</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2 mt-2">
            <span>1. Tap the</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-800 font-medium">
              <Share className="w-3 h-3 text-teal-600" /> Share
            </span>
            <span>button below</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-xs text-slate-600 flex items-center gap-2 mt-1.5">
            <span>2. Select</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-800 font-medium">
              <PlusSquare className="w-3 h-3 text-teal-600" /> Add to Home Screen
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InstallBanner;
