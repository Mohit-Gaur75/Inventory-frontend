import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMyShop, updateShop } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Store, MapPin, Phone, Mail, ChevronLeft,
  CheckCircle2, Crosshair, Info
} from "lucide-react";

const CATEGORIES = [
  "Grocery", "Electronics", "Clothing", "Pharmacy",
  "Hardware", "Stationery", "Food & Beverage", "Other"
];

const CATEGORY_ICONS = {
  Grocery: "🥦", Electronics: "📱", Clothing: "👕", Pharmacy: "💊",
  Hardware: "🔧", Stationery: "📝", "Food & Beverage": "🍔", Other: "📦"
};

const EditShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shopId, setShopId]     = useState(null);
  const [detectingLoc, setDetectingLoc] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", category: "Grocery",
    street: "", city: "", state: "", pincode: "",
    latitude: "", longitude: "", phone: "", email: "",
  });

  useEffect(() => {
    const fetchShop = async () => {
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
    fetchShop();
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setDetectingLoc(true);
    toast.loading("Detecting your GPS location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        setForm((f) => ({
          ...f,
          latitude:  pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success("Location detected and applied!");
        setDetectingLoc(false);
      },
      () => {
        toast.dismiss();
        toast.error("Could not detect location. Please allow location access.");
        setDetectingLoc(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Store name is required");
    if (!form.latitude || !form.longitude) return toast.error("Please set your store location coordinates");

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
      toast.success("Store settings updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update store");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="Loading store settings..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-teal-700">Store Settings</span>
      </div>

      <div className="mb-7 flex items-center gap-3.5">
        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-sm shadow-teal-200 shrink-0">
          <Store className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Store Settings
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Update your public listing, contact details, and map location.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Form Fields */}
          <div className="lg:col-span-2 space-y-5">

            {/* Store Identity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-600" /> Store Identity
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Apex Organic Groceries"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Store Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell nearby shoppers about your store — products you carry, delivery options, or what makes you special..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all resize-none placeholder-slate-300"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  {form.description.length}/500 characters
                </p>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Store Category <span className="text-rose-500">*</span>
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
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-teal-600" /> Contact Channels
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Phone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Store Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="store@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Physical Address */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Physical Address
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Street / Locality
                </label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="e.g. Shop 4, Metro Market Complex"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">State</label>
                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleChange}
                    placeholder="560001"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Map Coordinates */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-teal-600" /> GPS Coordinates
                </h2>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLoc}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  {detectingLoc ? "Detecting..." : "Auto-Detect Location"}
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-800">Why this matters:</strong> Your GPS coordinates determine how high you rank in nearby customer searches.
                The closer a customer is to your store, the higher your products appear in their results.
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Latitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 26.1445"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    Longitude <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 91.7362"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                  />
                </div>
              </div>

              {form.latitude && form.longitude && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Store pinned at <strong>{form.latitude}, {form.longitude}</strong> — visible in nearby search results.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Summary Card */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20">
              <h3 className="font-display font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <Store className="w-4 h-4 text-teal-600" /> Store Preview
              </h3>

              {/* Store Avatar */}
              <div className="w-full h-28 bg-gradient-to-br from-slate-800 via-slate-700 to-teal-900 rounded-xl flex items-center justify-center mb-4 overflow-hidden">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-display font-bold text-white text-2xl shadow-lg">
                    {form.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                  <span className="text-xs font-semibold text-white/80 truncate px-4 max-w-full">
                    {form.name || "Your Store Name"}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Category</span>
                  <span className="font-bold text-teal-700">
                    {CATEGORY_ICONS[form.category]} {form.category}
                  </span>
                </div>
                <div className="flex items-start justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Location</span>
                  <span className="text-slate-800 font-bold text-right">
                    {form.city ? `${form.city}, ${form.state}` : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Phone</span>
                  <span className="text-slate-800 font-bold">{form.phone || "Not set"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">GPS</span>
                  <span className={`font-bold ${form.latitude ? "text-emerald-700" : "text-rose-500"}`}>
                    {form.latitude ? "Set ✓" : "Not configured"}
                  </span>
                </div>
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
                      Save Store Settings
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

            {/* GPS Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-xs">
              <p className="text-xs font-bold text-amber-800 mb-2">📍 Location Tips</p>
              <ul className="text-[11px] text-amber-700 space-y-1.5">
                <li>• Click "Auto-Detect" for the most accurate coordinates</li>
                <li>• Accurate GPS boosts your ranking in nearby searches</li>
                <li>• Update whenever you change your shop's physical location</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditShop;
