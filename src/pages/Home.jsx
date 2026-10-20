import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { searchProducts } from "../api/axios";
import ProductCard from "../components/ProductCard";
import {
  Search, MapPin, ShoppingBag, Store, TrendingDown,
  ArrowRight, Package, CheckCircle, Zap
} from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const favIds = [];

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const fetchTrendingProducts = async () => {
    try {
      const { data } = await searchProducts({ limit: 8, sortBy: "trending" });
      setTrendingProducts(data.products || []);
    } catch (error) {
      console.error("Failed to fetch trending products:", error);
      setTrendingProducts([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  const features = [
    {
      icon: Search,
      title: "Search Locally",
      desc: "Find any product from shops in your area instantly.",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: TrendingDown,
      title: "Compare Prices",
      desc: "See the same product from multiple shops side by side.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: MapPin,
      title: "Find Nearby Shops",
      desc: "Discover shops closest to your location on an interactive map.",
      color: "bg-blue-100 text-blue-600",
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

      
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white overflow-hidden min-h-[600px] flex items-center">

        {/* Animated floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full animate-pulse" style={{animationDuration: '4s'}} />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-white/10 rounded-full animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}} />
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-teal-300/20 rounded-full animate-bounce" style={{animationDuration: '3s'}} />
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-teal-300/20 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
        
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Store className="w-4 h-4" />
            Local Inventory Platform
          </div>

    
          <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6">
            Discover Local Products & Services
            <br />
            <span className="text-teal-100">Near You</span>
          </h1>

          <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Search local shops, compare prices, and connect directly with sellers
            in your neighbourhood
          </p>

       
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/search"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-teal-700 font-bold rounded-2xl hover:bg-teal-50 transition-all shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:scale-105 text-base"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Search Products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/map"
              className="group flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur text-white font-semibold rounded-2xl hover:bg-white/30 transition-all border border-white/30 hover:border-white/50 hover:scale-105 text-base"
            >
              <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
              View Map
            </Link>
          </div>

          
          {!user && (
            <p className="mt-8 text-teal-100 text-sm">
              Are you a shopkeeper?{" "}
              <Link to="/register" className="text-white font-bold underline underline-offset-2">
                Register your shop →
              </Link>
            </p>
          )}
        </div>
      </section>

     
      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 justify-center py-2">
                <Icon className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="font-display font-bold text-xl text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
            Browse by Category
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-800 mt-2">
            Mall Directory
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Browse our departments like you would in a shopping mall - everything organized for easy shopping
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title}
              className="group bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative overflow-hidden">
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-200 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
              Simple Process
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-800 mt-2">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }, idx) => (
              <div key={step} className="relative">
                
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-slate-200 z-0 -translate-x-4" />
                )}
            <div className="relative z-10 bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                    <span className="font-display font-bold text-white text-lg">{step}</span>
                  </div>
                  <h3 className="font-display font-semibold text-slate-800 mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-10 md:p-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-teal-400 font-semibold text-sm uppercase tracking-wider">
                For Shopkeepers
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl mt-2 mb-4">
                Put Your Shop
                <br />
                <span className="text-teal-400">On the Map</span>
              </h2>
              <ul className="space-y-2">
                {[
                  "Manage your full inventory online",
                  "Customers find you in local searches",
                  "Track stock levels and prices",
                  "Get discovered by nearby buyers",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link
                to="/register"
                className="group flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-xl hover:scale-105 text-center"
              >
                <Store className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Register Your Shop
              </Link>
              <Link
                to="/login"
                className="group flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all text-center border border-white/20 hover:border-white/30 hover:scale-105"
              >
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-teal-600 text-white py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Ready to Find Local Products?
          </h2>
          <p className="text-teal-100 mb-8 text-lg">
            Search for any product and discover the best prices from shops near you.
          </p>
          <Link
            to="/search"
            className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-teal-700 font-bold rounded-2xl hover:bg-teal-50 transition-all shadow-xl shadow-teal-700/30 hover:shadow-2xl hover:scale-105 text-base"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Start Searching
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Featured Deals / Trending Products ── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            Today's Trending
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-800 mt-2">
            Trending Products
          </h2>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Hot items and bestsellers from shops near you - updated in real-time
          </p>
        </div>

        {loadingTrending ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : trendingProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl">
            <p className="text-slate-500 font-medium">No trending products available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                distance={product.distance}
                isFavourited={favIds.includes(product._id)}
                onFavouriteChange={() => {}}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            to="/search"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            View All Products
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-white">LocalMart</span>
          </div>
          <p className="text-sm text-slate-500">
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
