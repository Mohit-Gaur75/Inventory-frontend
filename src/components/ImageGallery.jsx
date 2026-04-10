import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, Package } from "lucide-react";

const ImageGallery = ({ images = [], productName = "Product" }) => {
  const [current, setCurrent]       = useState(0);
  const [lightbox, setLightbox]     = useState(false);
  const [zoomed, setZoomed]         = useState(false);
  const [touchStart, setTouchStart] = useState(null);

  
  const allImages = [...new Set(images.filter(Boolean))];

  if (allImages.length === 0) {
    return (
      <div className="h-48 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center rounded-xl">
        <Package className="w-16 h-16 text-orange-200" />
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));

  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd   = (e) => {
    if (!touchStart) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setTouchStart(null);
  };

  return (
    <>
      
      <div className="relative group"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative overflow-hidden rounded-xl bg-stone-100"
          style={{ paddingBottom: "75%" }}>
          <img
            src={allImages[current]}
            alt={`${productName} ${current + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300
              ${zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={() => setLightbox(true)}
          />
        </div>

      
        {allImages.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        
        {allImages.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
            {current + 1}/{allImages.length}
          </div>
        )}

       
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-7 h-7 bg-black/40 rounded-full flex items-center justify-center">
            <ZoomIn className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>

     
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                ${i === current ? "border-orange-500 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
            >
              <img src={img} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

    
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => { setLightbox(false); setZoomed(false); }}
        >
          <button onClick={() => { setLightbox(false); setZoomed(false); }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors z-10">
            <X className="w-5 h-5" />
          </button>

    
          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white z-10">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white z-10">
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={allImages[current]}
            alt={productName}
            onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
            className={`max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-300 cursor-zoom-in
              ${zoomed ? "scale-150 cursor-zoom-out" : ""}`}
          />

          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {allImages.map((img, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all
                    ${i === current ? "border-orange-400" : "border-white/30 opacity-50"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;