import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../api/axios";
import toast from "react-hot-toast";
import { Package } from "lucide-react";
import MultiImageUpload from "../components/MultiImageUpload";

const CATEGORIES = ["Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];
const UNITS = ["piece","kg","gram","litre","ml","dozen","pack","box"];

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: "Grocery",
    price: "", stock: "", unit: "piece",
  });
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [primary, ...rest] = uploadedImages;
      await addProduct({
        ...form,
        image:  primary || "",
        images: rest,
      });
      toast.success("Product listed successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Package className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Add New Product</h1>
          <p className="text-slate-500 text-sm">Add item details to make it searchable in your neighborhood</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">

        <MultiImageUpload
          values={uploadedImages}
          onChange={setUploadedImages}
          maxImages={5}
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required
            placeholder="e.g. Royal Basmati Rice 5kg"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Brief product description, brand, or key features..."
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition bg-white">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹) *</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required min="0"
              placeholder="120"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Quantity *</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
              placeholder="50"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit</label>
            <select name="unit" value={form.unit} onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition bg-white">
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button type="button" onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-all shadow-sm text-sm">
            {loading ? "Adding Item..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
