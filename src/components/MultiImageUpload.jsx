import { useState, useRef } from "react";
import { uploadSingleImage, deleteImage } from "../api/axios";
import { Upload, X, Camera, Plus, Loader2, Star } from "lucide-react";

const MultiImageUpload = ({ values = [], onChange, maxImages = 5 }) => {
  const fileRef   = useRef(null);
  const cameraRef = useRef(null);

  const normalise = (arr) =>
    arr.map((v) => (typeof v === "string" ? { url: v } : v));

  const [images, setImages]   = useState(() => normalise(values));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const sync = (imgs) => {
    setImages(imgs);
    onChange(imgs.map((img) => img.url));
  };

  const handleUpload = async (files) => {
    const remaining = maxImages - images.length;
    if (remaining <= 0) { setError(`Max ${maxImages} images allowed`); return; }

    const allowed  = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const toUpload = Array.from(files).slice(0, remaining);

    for (const file of toUpload) {
      if (!allowed.includes(file.type)) { setError("Only JPEG, PNG, WebP allowed"); return; }
      if (file.size > 5 * 1024 * 1024)  { setError("Each file must be under 5 MB"); return; }
    }

    setLoading(true);
    setError("");
    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const formData = new FormData();
          formData.append("image", file);
          const { data } = await uploadSingleImage(formData, "products");
          return { url: data.imageUrl, public_id: data.public_id };
        })
      );
      sync([...images, ...uploaded]);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      if (fileRef.current)   fileRef.current.value   = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  };

  const handleRemove = async (index) => {
    const img = images[index];
   
    if (img.public_id) {
      try { await deleteImage(img.public_id); } catch {}
    }
    sync(images.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index) => {
    if (index === 0) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    reordered.unshift(moved);
    sync(reordered);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) handleUpload(files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-700">
          Product Images
          <span className="text-stone-400 font-normal ml-1">(first image = main)</span>
        </label>
        <span className="text-xs text-stone-400">{images.length}/{maxImages}</span>
      </div>

      <div
        className="grid grid-cols-3 gap-3"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        
        {images.map((img, i) => (
          <div
            key={i}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-stone-200 group"
            style={{ borderColor: i === 0 ? "#f97316" : undefined }}
          >
            <img src={img.url} alt={`img ${i + 1}`} className="w-full h-full object-cover" />

        
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all" />

          
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center
                         opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X className="w-3 h-3" />
            </button>

            {i !== 0 && (
              <button
                type="button"
                onClick={() => handleSetPrimary(i)}
                title="Set as main image"
                className="absolute bottom-1 left-1 flex items-center gap-0.5 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star className="w-2.5 h-2.5" /> Main
              </button>
            )}

          
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded font-medium">
                Main
              </span>
            )}
          </div>
        ))}

     
        {images.length < maxImages && (
          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-orange-400
                       hover:bg-orange-50 flex flex-col items-center justify-center cursor-pointer transition-all"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
            ) : (
              <>
                <Plus className="w-6 h-6 text-stone-400 mb-1" />
                <span className="text-xs text-stone-400">Add Photo</span>
              </>
            )}
          </div>
        )}
      </div>

      {images.length < maxImages && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Upload className="w-3.5 h-3.5" /> Upload Photos
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Camera className="w-3.5 h-3.5" /> Take Photo
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
};

export default MultiImageUpload;
