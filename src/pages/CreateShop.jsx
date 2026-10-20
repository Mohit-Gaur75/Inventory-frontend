import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShop } from "../api/axios";
import toast from "react-hot-toast";
import {
  MapPin, Store, Phone, Mail, CheckCircle2,
  Crosshair, Info, Package, Clock
} from "lucide-react";

const CATEGORIES = [
  "Grocery", "Electronics", "Clothing", "Pharmacy",
  "Hardware", "Stationery", "Food & Beverage", "Other"
];

const CATEGORY_ICONS = {
  Grocery: "🥦", Electronics: "📱", Clothing: "👕", Pharmacy: "💊",
  Hardware: "🔧", Stationery: "📝", "Food & Beverage": "🍔", Other: "📦"
};

const STEPS = [
  { num: 1, label: "Store Identity" },
  { num: 2, label: "Location & Contact" },
  { num: 3, label: "GPS Coordinates" },
];

const CreateShop = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detectingLoc, setDetectingLoc] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", category: "Grocery",
    street: "", city: "", state: "", pincode: "",
    latitude: "", longitude: "", phone: "", email: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported by your browser");
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
        toast.success("Location pinned successfully!");
        setDetectingLoc(false);
      },
      () => {
        toast.dismiss();
        toast.error("Could not detect location. Please allow browser location access.");
        setDetectingLoc(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter your store name");
    if (!form.latitude || !form.longitude) return toast.error("Please set your store location before submitting");

    setLoading(true);
    try {
      await createShop({
        name: form.name,
        description: form.description,
        category: form.category,
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
      toast.success("🎉 Your store is live on LocalMart!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create store profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-3">
              🚀 New Merchant Registration
            </span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              Register Your Storefront
            </h1>
            <p className="text-teal-100 text-sm mt-1 max-w-md">
              Join LocalMart's merchant network and let nearby customers discover your products in real-time.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {[
              { icon: "🛒", text: "Appear in local searches" },
              { icon: "📍", text: "Show distance to customers" },
              { icon: "📦", text: "List unlimited products" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 text-xs text-teal-100">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-3 mb-7">
        {STEPS.map((step, i) => (
          <div key={step.num} className="flex items-center gap-3 flex-1">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <span className="text-xs font-semibold text-teal-700 hidden sm:block">
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px bg-slate-200" />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Form Fields */}
          <div className="lg:col-span-2 space-y-5">

            {/* STEP 1: Store Identity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">1</div>
                <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal-600" /> Store Identity
                </h2>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Business / Store Name <span className="text-rose-500">*</span>
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
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell shoppers what makes your store special — home delivery, daily fresh stock, specialty items, etc..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all resize-none placeholder-slate-300"
                />
              </div>

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

            {/* STEP 2: Contact & Address */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">2</div>
                <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" /> Address & Contact
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    WhatsApp / Phone
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

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Street / Shop Number
                </label>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  placeholder="e.g. Shop 4, Metro Market Complex, MG Road"
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
                    placeholder="Mumbai"
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
                    placeholder="Maharashtra"
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
                    placeholder="400057"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* STEP 3: GPS Coordinates */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">3</div>
                  <h2 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-teal-600" /> GPS Location <span className="text-rose-500 text-xs font-bold">*Required</span>
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={detectingLoc}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  {detectingLoc ? "Detecting..." : "📍 Auto-Detect My Location"}
                </button>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <strong>Why location matters:</strong> Customers search for products "near me". Your GPS coordinates determine how high your store ranks in their local search results. Accurate coordinates = more visibility!
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
                    placeholder="e.g. 19.0760"
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
                    placeholder="e.g. 72.8777"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all placeholder-slate-300"
                  />
                </div>
              </div>

              {form.latitude && form.longitude && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Store pinned at <strong>{form.latitude}, {form.longitude}</strong> — ready for local discovery.
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-2xl transition-all shadow-md shadow-teal-700/20 text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Registering your store...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Launch My Storefront on LocalMart
                </>
              )}
            </button>
          </div>

          {/* Right — Benefits Sidebar */}
          <div className="space-y-5">

            {/* Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs sticky top-20">
              <h3 className="font-display font-bold text-sm text-slate-900 mb-4">
                Store Preview
              </h3>

              <div className="w-full h-28 bg-gradient-to-br from-slate-800 to-teal-900 rounded-xl flex items-center justify-center mb-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center font-display font-bold text-white text-2xl shadow-lg">
                    {form.name?.charAt(0)?.toUpperCase() || <Store className="w-7 h-7" />}
                  </div>
                  <span className="text-xs font-semibold text-white/80 truncate px-4 max-w-full">
                    {form.name || "Your Store Name"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Category</span>
                  <span className="font-bold text-teal-700">{CATEGORY_ICONS[form.category]} {form.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">City</span>
                  <span className="font-bold text-slate-800">{form.city || "Not set"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Phone</span>
                  <span className="font-bold text-slate-800">{form.phone || "Not set"}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500 font-semibold">GPS</span>
                  <span className={`font-bold ${form.latitude ? "text-emerald-700" : "text-amber-600"}`}>
                    {form.latitude ? "✓ Set" : "⚠ Not Set"}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefit Cards */}
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 shadow-xs">
              <p className="text-xs font-bold text-teal-800 mb-3">What you get after registering:</p>
              <div className="space-y-2.5">
                {[
                  { icon: Package, text: "List and manage unlimited product catalog" },
                  { icon: MapPin, text: "Appear in nearby customer searches" },
                  { icon: Clock, text: "Set daily business hours & closure dates" },
                  { icon: CheckCircle2, text: "Real-time stock alerts and notifications" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-[11px] text-teal-800">
                    <Icon className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateShop;
