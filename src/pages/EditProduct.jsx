import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getProductById, updateProduct, deleteImage } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Pencil, ChevronLeft, CheckCircle2, Tag, ImageIcon, Info, BarChart2, Package
} from "lucide-react";
import MultiImageUpload from "../components/MultiImageUpload";

const CATEGORIES = [
  "Grocery", "Electronics", "Clothing", "Pharmacy",
  "Hardware", "Stationery", "Food & Beverage", "Other"
];

const UNITS = ["piece", "kg", "gram", "litre", "ml", "dozen", "pack", "box"];

const CATEGORY_ICONS = {
  Grocery: "🥦", Electronics: "📱", Clothing: "👕", Pharmacy: "💊",
  Hardware: "🔧", Stationery: "📝", "Food & Beverage": "🍔", Other: "📦"
};

const extractFilename = (url) => {
  if (!url || !url.startsWith("http")) return null;
  const match = url.match(/\/uploads\/(.+)$/);
  return match ? match[1] : null;
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "", description: "", category: "Grocery",
    price: "", stock: "", unit: "piece",
  });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getProductById(id);
        setForm({
          name:        data.name || "",
          description: data.description || "",
          category:    data.category || "Grocery",
          price:       data.price || "",
          stock:       data.stock || "",
          unit:        data.unit || "piece",
        });
        const existing = [
          ...(data.image ? [data.image] : []),
          ...(data.images || []),
        ].filter(Boolean);
        setUploadedImages(existing);
        setOriginalImages(existing);
      } catch {
        toast.error("Failed to load product");
        navigate("/dashboard");
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Product name is required");
    if (!form.price || Number(form.price) < 0) return toast.error("Enter a valid price");
    if (form.stock === "" || Number(form.stock) < 0) return toast.error("Enter a valid stock quantity");

    setLoading(true);
    try {
      const removedImages = originalImages.filter((url) => !uploadedImages.includes(url));
      await Promise.allSettled(
        removedImages.map((url) => {
          const filename = extractFilename(url);
          return filename ? deleteImage(filename) : Promise.resolve();
        })
      );

      const [primary, ...rest] = uploadedImages;
      await updateProduct(id, { ...form, image: primary || "", images: rest });
      toast.success("Product updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="Loading product details..." />;

  const estimatedRevenue =
    form.price && form.stock
      ? (Number(form.price) * Number(form.stock)).toLocaleString("en-IN")
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-teal-700">Edit Product</span>
      </div>

      <div className="mb-7">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-sm shadow-teal-200 shrink-0">
            <Pencil className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
              Edit Product
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Update item details, photos, pricing and stock quantities.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Product Images */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="font-display font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-teal-600" /> Product Photos
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Add up to 5 images. First image is the primary thumbnail in search. Removed images are permanently deleted.
              </p>
              <MultiImageUpload
                values={uploadedImages}
                onChange={setUploadedImages}
                maxImages={5}
              />
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" /> Product Information
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Royal Basmati Rice 5kg"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe key features, brand, weight, or special qualities..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all resize-none placeholder-slate-300"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {form.description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Category & Pricing */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-teal-600" /> Category & Pricing
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setForm({ ...form, category: c })}
                      className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-[11px] font-semibold transition-all ${
                        form.category === c
                          ? "bg-teal-50 border-teal-500 text-teal-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-teal-50/30"
                      }`}
                    >
                      <span className="text-base">{CATEGORY_ICONS[c]}</span>
                      <span className="leading-tight text-center">{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="0"
                      className="w-full pl-7 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Stock Qty <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <div className="space-y-5">

            {/* Live Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20">
              <h3 className="font-display font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600" /> Updated Summary
              </h3>

              <div className="w-full aspect-video bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                {uploadedImages[0] ? (
                  <img src={uploadedImages[0]} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 gap-2">
                    <Package className="w-8 h-8" />
                    <span className="text-xs">No image uploaded</span>
                  </div>
                )}
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Product</span>
                  <span className="text-slate-900 font-bold truncate max-w-[130px]">{form.name || "—"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Category</span>
                  <span className="font-bold text-teal-700">{CATEGORY_ICONS[form.category]} {form.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Price</span>
                  <span className="text-teal-700 font-display font-extrabold text-sm">
                    {form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Stock</span>
                  <span className="text-slate-800 font-bold">
                    {form.stock !== "" ? `${form.stock} ${form.unit}` : "—"}
                  </span>
                </div>
                {estimatedRevenue && (
                  <div className="flex justify-between py-2 bg-emerald-50 rounded-xl px-3 border border-emerald-100">
                    <span className="text-emerald-700 font-semibold">Est. Max Revenue</span>
                    <span className="text-emerald-800 font-display font-extrabold">₹{estimatedRevenue}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-2.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-xl transition-all shadow-sm text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Product Details
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
