import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct, deleteImage } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { Pencil } from "lucide-react";
import MultiImageUpload from "../components/MultiImageUpload";

const CATEGORIES = ["Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];
const UNITS = ["piece","kg","gram","litre","ml","dozen","pack","box"];

const extractFilename = (url) => {
  if (!url || url.startsWith("http") === false) return null;
  const match = url.match(/\/uploads\/(.+)$/);
  return match ? match[1] : null;
};

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm]         = useState({
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
          name:        data.name,
          description: data.description || "",
          category:    data.category,
          price:       data.price,
          stock:       data.stock,
          unit:        data.unit || "piece",
        });
        const existing = [
          ...(data.image  ? [data.image]  : []),
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
    setLoading(true);
    try {
      const removedImages = originalImages.filter(url => !uploadedImages.includes(url));
      await Promise.allSettled(
        removedImages.map(url => {
          const filename = extractFilename(url);
          return filename ? deleteImage(filename) : Promise.resolve();
        })
      );

      const [primary, ...rest] = uploadedImages;
      await updateProduct(id, {
        ...form,
        image:  primary || "",
        images: rest,
      });
      toast.success("Product updated!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="Loading product..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Pencil className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-800">Edit Product</h1>
          <p className="text-stone-500 text-sm">Update product details and inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">

        <MultiImageUpload
          values={uploadedImages}
          onChange={setUploadedImages}
          maxImages={5}
        />

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (₹) *</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock *</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Unit</label>
            <select name="unit" value={form.unit} onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white">
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
