import usePWA from "../hooks/usePWA";
import { Smartphone, X } from "lucide-react";
import { useState } from "react";

const InstallBanner = () => {
  const { canInstall, install, isInstalled } = usePWA();
  const [dismissed, setDismissed]            = useState(false);

  if (!canInstall || isInstalled || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50
                    bg-white border border-stone-200 shadow-2xl rounded-2xl p-4
                    flex items-center gap-3 animate-slide-up">
      <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
        <Smartphone className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800 text-sm">Install LocalMart</p>
        <p className="text-xs text-stone-500">Add to your home screen for a faster experience</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={install}
          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;
