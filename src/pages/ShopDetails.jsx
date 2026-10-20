import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getShopById, getFavouriteIds } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";
import {
  MapPin, Phone, Mail, Store, Tag, CheckCircle2, XCircle,
  Clock, Package, Star, Search, X, RotateCcw
} from "lucide-react";

const ShopDetails = () => {
  const { id }    = useParams();
  const { user }  = useAuth();
  const { socket, subscribeToShop, unsubscribeFromShop } = useSocket();

  const [shop, setShop]           = useState(null);
  const [products, setProducts]   = useState([]);
  const [favIds, setFavIds]       = useState([]);
  const [loading, setLoading]     = useState(true);

  // Active tab & in-shop filters
  const [activeTab, setActiveTab]               = useState("products"); // "products" | "reviews"
  const [shopSearch, setShopSearch]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getShopById(id);
        setShop(data.shop);
        setProducts(data.products || []);
        if (user?.role === "customer") {
          const favRes = await getFavouriteIds();
          setFavIds(favRes.data || []);
        }
      } catch {
        setShop(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  useEffect(() => {
    if (!socket || !shop) return;
    const handler = ({ shopId, computedIsOpen }) => {
      if (shopId.toString() === shop._id.toString()) {
        setShop((s) => ({ ...s, computedIsOpen }));
      }
    };
    socket.on("shop:statusChanged", handler);
    return () => socket.off("shop:statusChanged", handler);
  }, [socket, shop]);

  useEffect(() => {
    if (!socket || !id) return;

    subscribeToShop(id);

    const handleStockUpdate = ({ productId, stock, isAvailable }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, stock, isAvailable: isAvailable ?? stock > 0 }
            : p
        )
      );
    };

    const handlePriceUpdate = ({ productId, price }) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, price } : p))
      );
    };

    const handleProductDeleted = ({ productId }) => {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    };

    socket.on("stock:updated",   handleStockUpdate);
    socket.on("price:updated",   handlePriceUpdate);
    socket.on("product:deleted", handleProductDeleted);

    return () => {
      unsubscribeFromShop(id);
      socket.off("stock:updated",   handleStockUpdate);
      socket.off("price:updated",   handlePriceUpdate);
      socket.off("product:deleted", handleProductDeleted);
    };
  }, [socket, id, subscribeToShop, unsubscribeFromShop]);

  if (loading) return <Loader text="Loading shop profile..." />;
  if (!shop)   return <div className="text-center py-20 text-slate-400">Shop not found.</div>;

  const { address } = shop;
  const isOpen = shop.computedIsOpen ?? shop.isOpen;
  const today     = new Date().getDay();
  const todayHours = shop.businessHours?.[today];

  // Dynamic list of categories available in this specific shop
  const shopCategories = ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  // Filter products by in-shop search query and selected category
  const filteredProducts = products.filter((p) => {
    const q = shopSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* ── Shop Banner ── */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20 shrink-0">
            <Store className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-3xl">{shop.name}</h1>

              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm
                ${isOpen ? "bg-emerald-400/20 text-emerald-100 border border-emerald-300/40 backdrop-blur-md" : "bg-rose-500/20 text-rose-100 border border-rose-300/40 backdrop-blur-md"}`}>
                {isOpen
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Open Now</>
                  : <><XCircle className="w-3.5 h-3.5 text-rose-300" /> Closed</>
                }
              </span>
            </div>

            {shop.description && (
              <p className="mt-2 text-teal-50 text-sm max-w-2xl leading-relaxed">{shop.description}</p>
            )}

            <div className="flex flex-wrap gap-2.5 mt-5 text-xs">
              <span className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                <Tag className="w-3.5 h-3.5 text-teal-300" /> {shop.category}
              </span>
              {address?.city && (
                <span className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-teal-300" />
                  {address.street && `${address.street}, `}
                  {address.city}, {address.state} {address.pincode}
                </span>
              )}
              {shop.phone && (
                <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-teal-300" /> {shop.phone}
                </a>
              )}
              {shop.email && (
                <a href={`mailto:${shop.email}`} className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-teal-300" /> {shop.email}
                </a>
              )}

              {todayHours && (
                <span className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-teal-300" />
                  {todayHours.isOpen
                    ? `Today: ${todayHours.open} – ${todayHours.close}`
                    : "Closed today"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs & In-Shop Search Bar ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start">
            <button
              type="button"
              onClick={() => setActiveTab("products")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "products"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-4 h-4 text-teal-600" />
              <span>Products</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === "products"
                  ? "bg-teal-50 text-teal-700 border border-teal-200"
                  : "bg-slate-200 text-slate-600"
              }`}>
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "reviews"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Reviews</span>
            </button>
          </div>

          {/* In-Shop Search Input (Visible when Products tab is active) */}
          {activeTab === "products" && products.length > 0 && (
            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                placeholder={`Search in ${shop.name}...`}
                className="w-full pl-9 pr-9 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm transition"
              />
              {shopSearch && (
                <button
                  type="button"
                  onClick={() => setShopSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Category Pills (Visible when in Products tab and multiple categories exist) */}
        {activeTab === "products" && shopCategories.length > 2 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {shopCategories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  selectedCategory === c
                    ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                    : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50 bg-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab Content: Products ── */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-600" />
              Store Catalog
              {shopSearch && (
                <span className="text-sm font-normal text-slate-500">
                  matching "{shopSearch}"
                </span>
              )}
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
              Showing {filteredProducts.length} of {products.length} items
            </span>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Store className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold">No products listed by this shop currently.</p>
              <p className="text-xs text-slate-400 mt-1">Please check back soon as inventory is updated.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-800 font-semibold">
                No products found matching "{shopSearch}"
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching with a different term or clear the filter.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShopSearch("")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Search
                </button>
                {selectedCategory !== "All" && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    View All Categories
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={{ ...p, shop }}
                  isFavourited={favIds.includes(p._id)}
                  onFavouriteChange={async () => {
                    const res = await getFavouriteIds();
                    setFavIds(res.data || []);
                  }}
                  onCategoryClick={(cat) => setSelectedCategory(cat)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Reviews ── */}
      {activeTab === "reviews" && (
        <div className="space-y-6 animate-fadeIn">
          <ReviewSection shopId={id} />
        </div>
      )}
    </div>
  );
};

export default ShopDetails;