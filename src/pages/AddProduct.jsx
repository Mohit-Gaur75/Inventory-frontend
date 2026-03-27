import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProduct } from "../api/axios";
import toast from "react-hot-toast";
import { Package } from "lucide-react";

const CATEGORIES = ["Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];
const UNITS = ["piece","kg","gram","litre","ml","dozen","pack","box"];

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: "Grocery",
    price: "", stock: "", unit: "piece", image: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addProduct(form);
      toast.success("Product added successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Package className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-800">Add Product</h1>
          <p className="text-stone-500 text-sm">Add a new item to your shop inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Product Name *</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} required
            placeholder="e.g. Basmati Rice"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            placeholder="Brief product description..."
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
              placeholder="120"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Stock Qty *</label>
            <input type="number" name="stock" value={form.stock} onChange={handleChange} required min="0"
              placeholder="50"
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

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Image URL (optional)</label>
          <input type="url" name="image" value={form.image} onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm">
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;