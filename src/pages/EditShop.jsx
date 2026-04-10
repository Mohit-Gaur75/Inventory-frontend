import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyShop, updateShop } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import { MapPin, Store } from "lucide-react";
//import ShopStatusPanel from "../components/ShopStatusPanel";

const CATEGORIES = ["Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];

const EditShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shopId, setShopId]     = useState(null);
  const [form, setForm] = useState({
    name: "", description: "", category: "Grocery",
    street: "", city: "", state: "", pincode: "",
    latitude: "", longitude: "", phone: "", email: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getMyShop();
        setShopId(data._id);
        setForm({
          name:        data.name || "",
          description: data.description || "",
          category:    data.category || "Grocery",
          street:      data.address?.street || "",
          city:        data.address?.city || "",
          state:       data.address?.state || "",
          pincode:     data.address?.pincode || "",
          latitude:    data.location?.coordinates?.[1] || "",
          longitude:   data.location?.coordinates?.[0] || "",
          phone:       data.phone || "",
          email:       data.email || "",
        });
      } catch {
        toast.error("Failed to load shop data");
        navigate("/dashboard");
      } finally {
        setFetching(false);
      }
    };
    fetch();
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    toast.loading("Detecting location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        setForm((f) => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success("Location updated!");
      },
      () => { toast.dismiss(); toast.error("Could not detect location"); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateShop(shopId, {
        name:        form.name,
        description: form.description,
        category:    form.category,
        address: {
          street:  form.street,
          city:    form.city,
          state:   form.state,
          pincode: form.pincode,
        },
        latitude:  form.latitude,
        longitude: form.longitude,
        phone:     form.phone,
        email:     form.email,
      });
      toast.success("Shop updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update shop");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="Loading shop details..." />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Store className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-800">Edit Shop Profile</h1>
          <p className="text-stone-500 text-sm">Update your shop information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Shop Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="e.g. Rajesh General Store"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Tell customers about your shop..."
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition bg-white">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Shop Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="shop@example.com"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <h2 className="font-semibold text-stone-700">Address</h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Street</label>
            <input type="text" name="street" value={form.street} onChange={handleChange}
              placeholder="12 MG Road"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange}
                placeholder="Guwahati"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">State</label>
              <input type="text" name="state" value={form.state} onChange={handleChange}
                placeholder="Assam"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Pincode</label>
              <input type="text" name="pincode" value={form.pincode} onChange={handleChange}
                placeholder="781001"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-700">Location Coordinates</h2>
            <button type="button" onClick={detectLocation}
              className="flex items-center gap-1.5 text-xs font-medium text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
              <MapPin className="w-3.5 h-3.5" /> Re-detect
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Latitude *</label>
              <input type="number" step="any" name="latitude" value={form.latitude}
                onChange={handleChange} required placeholder="26.1445"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Longitude *</label>
              <input type="number" step="any" name="longitude" value={form.longitude}
                onChange={handleChange} required placeholder="91.7362"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
          </div>
          <p className="text-xs text-stone-400">
            Current: {form.latitude && form.longitude
              ? `${form.latitude}, ${form.longitude}`
              : "No coordinates set"}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
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

export default EditShop;