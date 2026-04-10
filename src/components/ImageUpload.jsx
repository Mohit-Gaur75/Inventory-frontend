import { useState, useRef } from "react";
import { uploadSingleImage, deleteImage } from "../api/axios";
import { Upload, X, Camera, Link2, Loader2 } from "lucide-react";

const ImageUpload = ({
  value = "",
  onChange,
  label = "Image",
  folder = "products",
  showCamera = true,
}) => {
  const fileRef   = useRef(null);
  const cameraRef = useRef(null);
  const [preview, setPreview]     = useState(value);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [urlInput, setUrlInput]   = useState(false);
  const [dragging, setDragging]   = useState(false);
  const [oldFilename, setOldFilename] = useState("");

  const handleUpload = async (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Only JPEG, PNG, WebP allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Max 5MB allowed"); return; }

    setError("");
    setLoading(true);
    try {
      
      if (oldFilename) { try { await deleteImage(oldFilename); } catch {} }

      const formData = new FormData();
      formData.append("image", file);
      const { data } = await uploadSingleImage(formData, folder);

      setPreview(data.imageUrl);
      setOldFilename(data.filename);
      onChange(data.imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (oldFilename) { try { await deleteImage(oldFilename); } catch {} }
    setPreview("");
    setOldFilename("");
    onChange("");
    if (fileRef.current)   fileRef.current.value   = "";
    if (cameraRef.current) cameraRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700">{label}</label>

     
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-50" style={{ height: "200px" }}>
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
            <button type="button" onClick={handleRemove}
              className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer
            ${dragging ? "border-orange-400 bg-orange-50 scale-[1.01]" : "border-stone-300 hover:border-orange-400 hover:bg-orange-50"}`}
          style={{ height: "180px" }}
        >
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-2" />
              <p className="text-sm text-stone-500">Uploading & compressing...</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-stone-600">
                  Drop image here or{" "}
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="text-orange-500 hover:underline">browse</button>
                </p>
                <p className="text-xs text-stone-400 mt-0.5">JPEG, PNG, WebP · Max 5MB</p>
              </div>

            
              <div className="flex gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                {showCamera && (
                  <button type="button" onClick={() => cameraRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors">
                    <Camera className="w-3.5 h-3.5" /> Camera
                  </button>
                )}
                <button type="button" onClick={() => setUrlInput(!urlInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 text-stone-600 text-xs font-medium rounded-lg hover:bg-stone-50 transition-colors">
                  <Link2 className="w-3.5 h-3.5" /> URL
                </button>
              </div>
            </div>
          )}
        </div>
      )}

     
      {urlInput && !preview && (
        <div className="flex gap-2">
          <input type="url" placeholder="https://example.com/image.jpg"
            className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                setPreview(e.target.value);
                onChange(e.target.value);
                setUrlInput(false);
              }
            }}
          />
          <button type="button" onClick={() => setUrlInput(false)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-stone-500 hover:bg-stone-50 text-sm">
            Cancel
          </button>
        </div>
      )}

      
      <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment"
        className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />

      {error && <p className="text-xs text-red-500 flex items-center gap-1"><X className="w-3 h-3" />{error}</p>}
    </div>
  );
};

export default ImageUpload;