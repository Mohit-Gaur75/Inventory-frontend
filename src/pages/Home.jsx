import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Search, MapPin, ShoppingBag, Store, TrendingDown,
  Star, ArrowRight, Package, Users, CheckCircle
} from "lucide-react";

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Search,
      title: "Search Locally",
      desc: "Find any product from shops in your area instantly.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: TrendingDown,
      title: "Compare Prices",
      desc: "See the same product from multiple shops side by side.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: MapPin,
      title: "Find Nearby Shops",
      desc: "Discover shops closest to your location on an interactive map.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: ShoppingBag,
      title: "Build Your Cart",
      desc: "Add products from multiple shops and contact them directly.",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const steps = [
    { step: "01", title: "Search a Product",     desc: "Type any product name in the search bar." },
    { step: "02", title: "Compare Prices",        desc: "See prices from all nearby shops at once." },
    { step: "03", title: "Add to Cart",           desc: "Save items you want to buy." },
    { step: "04", title: "Contact the Shop",      desc: "WhatsApp or call the shop to place your order." },
  ];

  const stats = [
    { value: "100%",  label: "Free to Use",      icon: CheckCircle },
    { value: "Local", label: "Shops Near You",   icon: Store       },
    { value: "Live",  label: "Stock Updates",    icon: Package     },
    { value: "Fast",  label: "Price Comparison", icon: TrendingDown },
  ];

  return (
    <div className="overflow-x-hidden">

      
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-400 to-amber-400 text-white overflow-hidden">

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
        
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Store className="w-4 h-4" />
            Local Inventory Platform
          </div>

    
          <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6">
            Find Products
            <br />
            <span className="text-amber-200">Near You</span>
          </h1>

          <p className="text-orange-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Search local shops, compare prices, and discover the best deals
            in your neighbourhood — all in one place.
          </p>

       
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/search"
              className="flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-all shadow-xl shadow-orange-600/20 text-base"
            >
              <Search className="w-5 h-5" />
              Search Products
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/map"
              className="flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur text-white font-semibold rounded-2xl hover:bg-white/30 transition-all border border-white/30 text-base"
            >
              <MapPin className="w-5 h-5" />
              View Map
            </Link>
          </div>

          
          {!user && (
            <p className="mt-8 text-orange-100 text-sm">
              Are you a shopkeeper?{" "}
              <Link to="/register" className="text-white font-bold underline underline-offset-2">
                Register your shop →
              </Link>
            </p>
          )}
        </div>
      </section>

     
      <section className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 justify-center py-2">
                <Icon className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <p className="font-display font-bold text-xl text-white">{value}</p>
                  <p className="text-xs text-stone-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
            Why LocalMart?
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-stone-800 mt-2">
            Everything You Need
          </h2>
          <p className="text-stone-500 mt-3 max-w-xl mx-auto">
            A complete platform for customers to find products and shopkeepers to manage their inventory.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title}
              className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-stone-800 mb-2">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-stone-50 border-y border-stone-200 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
              Simple Process
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-stone-800 mt-2">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }, idx) => (
              <div key={step} className="relative">
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-stone-200 z-0 -translate-x-4" />
                )}
                <div className="relative z-10 bg-white border border-stone-200 rounded-2xl p-6 text-center hover:shadow-sm transition-all">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="font-display font-bold text-white text-lg">{step}</span>
                  </div>
                  <h3 className="font-display font-semibold text-stone-800 mb-2">{title}</h3>
                  <p className="text-stone-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Shopkeepers ── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-stone-800 to-stone-900 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-orange-400 font-semibold text-sm uppercase tracking-wider">
                For Shopkeepers
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mt-2 mb-4">
                Put Your Shop
                <br />
                <span className="text-orange-400">On the Map</span>
              </h2>
              <ul className="space-y-2">
                {[
                  "Manage your full inventory online",
                  "Customers find you in local searches",
                  "Track stock levels and prices",
                  "Get discovered by nearby buyers",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-stone-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-orange-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                to="/register"
                className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors text-center"
              >
                <Store className="w-5 h-5" />
                Register Your Shop
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-colors text-center border border-white/20"
              >
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-orange-500 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Ready to Find Local Products?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Search for any product and discover the best prices from shops near you.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-colors shadow-xl shadow-orange-600/30 text-base"
          >
            <Search className="w-5 h-5" />
            Start Searching
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-white">LocalMart</span>
          </div>
          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} LocalMart. Built for local communities.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/search" className="hover:text-white transition-colors">Search</Link>
            <Link to="/map"    className="hover:text-white transition-colors">Map</Link>
            <Link to="/login"  className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;