import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShop } from "../api/axios";
import toast from "react-hot-toast";
import { MapPin, Store } from "lucide-react";

const CATEGORIES = ["Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];

const CreateShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: "Grocery",
    street: "", city: "", state: "", pincode: "",
    latitude: "", longitude: "", phone: "", email: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    toast.loading("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        setForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        toast.success("Location detected!");
      },
      () => { toast.dismiss(); toast.error("Could not detect location"); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createShop({
        name: form.name, description: form.description, category: form.category,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
        latitude: form.latitude, longitude: form.longitude,
        phone: form.phone, email: form.email,
      });
      toast.success("Store profile created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create store profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Register Store Profile</h1>
          <p className="text-slate-500 text-sm">Join the local merchant directory & connect with nearby buyers</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-slate-800 text-base">Store Details</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Store / Business Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Apex Organic Groceries"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Describe what you specialize in, home delivery options, etc..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition bg-white">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">WhatsApp / Contact Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Store Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="store@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h2 className="font-semibold text-slate-800 text-base">Address & Neighborhood</h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address</label>
            <input type="text" name="street" value={form.street} onChange={handleChange}
              placeholder="e.g. Shop 4, Market Complex"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">City / Area</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange} placeholder="Maharashtra"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Pincode</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleChange} placeholder="400057"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-base">Geographic Coordinates</h2>
            <button type="button" onClick={detectLocation}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
              <MapPin className="w-3.5 h-3.5" /> Auto-detect Location
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Latitude *</label>
              <input type="number" step="any" name="latitude" value={form.latitude} onChange={handleChange} required
                placeholder="19.0760"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Longitude *</label>
              <input type="number" step="any" name="longitude" value={form.longitude} onChange={handleChange} required
                placeholder="72.8777"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition" />
            </div>
          </div>
          <p className="text-xs text-slate-400">Used for hyper-local discovery and distance calculations for nearby customers.</p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm text-sm">
          {loading ? "Registering Store..." : "Create Store Listing"}
        </button>
      </form>
    </div>
  );
};

export default CreateShop;
