import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyShop, getMyProducts, deleteProduct, updateProduct,
  getReviews, toggleShopOpen
} from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Plus, Pencil, Trash2, Store, Package,
  AlertCircle, TrendingUp, AlertTriangle, Settings,
  Upload, FileDown, ExternalLink, Search, X, CheckCircle2,
  XCircle, Clock, MapPin, Phone, Star, BarChart3,
  ChevronLeft, ChevronRight, Eye
} from "lucide-react";
import ShopStatusPanel from "../components/ShopStatusPanel";

const LOW_STOCK_THRESHOLD = 5;

const CATEGORIES = [
  "all",
  "Grocery",
  "Electronics",
  "Clothing",
  "Pharmacy",
  "Hardware",
  "Stationery",
  "Food & Beverage",
  "Other"
];

const Dashboard = () => {
  const navigate = useNavigate();

  // Core Data
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviewsData, setReviewsData] = useState({ reviews: [], avgRating: 0, totalReviews: 0, distribution: {} });

  // Loaders
  const [loadingShop, setLoadingShop] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [updatingStockId, setUpdatingStockId] = useState(null);

  // Active Tab: 'products' | 'hours' | 'profile' | 'reviews'
  const [activeTab, setActiveTab] = useState("products");

  // Filters & Search for Products
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // 'all' | 'instock' | 'lowstock' | 'outofstock'

  // Pagination for Products
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal for Deletion
  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch functions
  const fetchShop = useCallback(async () => {
    try {
      const { data } = await getMyShop();
      setShop(data);
      if (data?._id) {
        fetchStoreReviews(data._id);
      }
    } catch {
      setShop(null);
    } finally {
      setLoadingShop(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await getMyProducts();
      setProducts(data || []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchStoreReviews = async (shopId) => {
    try {
      const { data } = await getReviews(shopId);
      setReviewsData(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchShop();
    fetchProducts();
  }, [fetchShop, fetchProducts]);

  // Toggle Shop Open / Closed directly from header
  const handleToggleShopStatus = async () => {
    if (!shop?._id) return;
    setTogglingStatus(true);
    try {
      await toggleShopOpen(shop._id);
      setShop((prev) => ({ ...prev, isOpen: !prev.isOpen }));
      toast.success(shop.isOpen ? "Store marked as Closed" : "Store is now Open for orders!");
    } catch {
      toast.error("Failed to update store availability");
    } finally {
      setTogglingStatus(false);
    }
  };

  // Quick Inline Stock Adjustment (+1 / -1)
  const handleQuickStockChange = async (product, delta) => {
    const newStock = Math.max(0, product.stock + delta);
    if (newStock === product.stock) return;

    setUpdatingStockId(product._id);
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p._id === product._id
          ? { ...p, stock: newStock, isAvailable: newStock > 0 }
          : p
      )
    );

    try {
      await updateProduct(product._id, { stock: newStock });
      toast.success(`Updated "${product.name}" stock to ${newStock}`, { id: `stock-${product._id}`, duration: 1500 });
    } catch {
      toast.error("Failed to update stock");
      fetchProducts(); // revert on failure
    } finally {
      setUpdatingStockId(null);
    }
  };

  // Delete product confirmation
  const confirmDelete = async () => {
    if (!deleteModalProduct) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteModalProduct._id);
      setProducts((prev) => prev.filter((p) => p._id !== deleteModalProduct._id));
      toast.success(`"${deleteModalProduct.name}" removed from store`);
      setDeleteModalProduct(null);
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  // Metric Calculations
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const outOfStockItems = products.filter((p) => !p.isAvailable || p.stock === 0);
  const lowStockItems = products.filter(
    (p) => p.isAvailable && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );
  const totalCatalogValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "instock") {
      matchesStock = p.isAvailable && p.stock > LOW_STOCK_THRESHOLD;
    } else if (stockFilter === "lowstock") {
      matchesStock = p.isAvailable && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
    } else if (stockFilter === "outofstock") {
      matchesStock = !p.isAvailable || p.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loadingShop) return <Loader text="Loading your merchant dashboard..." />;

  // Store Not Created Yet State
  if (!shop) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-teal-50 border border-teal-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Store className="w-10 h-10 text-teal-600" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-3">
          Merchant Welcome
        </span>
        <h2 className="font-display font-bold text-3xl text-slate-900 mb-3 tracking-tight">
          Set Up Your Digital Storefront
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Create your store profile on LocalMart in under 2 minutes. Add your location, operating hours, and list products to get discovered by nearby customers!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto mb-8">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <MapPin className="w-5 h-5 text-teal-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">Hyperlocal Search</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Reach shoppers within walking distance of your shop.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Package className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">Live Inventory</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Let customers browse products and check stock availability.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Clock className="w-5 h-5 text-indigo-600 mb-2" />
            <h4 className="text-xs font-bold text-slate-800">Store Hours</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Show real-time open/closed status to your community.</p>
          </div>
        </div>

        <Link
          to="/create-shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md shadow-teal-700/20 text-sm"
        >
          <Plus className="w-5 h-5" /> Register My Store Profile
        </Link>
      </div>
    );
  }

  const computedIsOpen = shop.computedIsOpen ?? shop.isOpen;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── TOP STORE COMMAND HERO BANNER ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Shop Brand & Location */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shrink-0 font-display font-bold text-2xl">
              {shop.name?.charAt(0).toUpperCase() || <Store className="w-8 h-8" />}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {shop.category || "General Store"}
                </span>

                {/* Live Status Pill Toggle */}
                <button
                  onClick={handleToggleShopStatus}
                  disabled={togglingStatus}
                  title="Click to toggle store open/closed status"
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border transition-all ${
                    computedIsOpen
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      computedIsOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                    }`}
                  />
                  <span>{togglingStatus ? "Updating..." : computedIsOpen ? "Open for Customers" : "Closed"}</span>
                </button>
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight truncate">
                {shop.name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-1">
                {shop.address?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{shop.address.city}, {shop.address.state || "IN"}</span>
                  </span>
                )}
                {shop.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>{shop.phone}</span>
                  </span>
                )}
                {reviewsData.totalReviews > 0 && (
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{reviewsData.avgRating} ({reviewsData.totalReviews} reviews)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/shop/${shop._id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>View Storefront</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <Link
              to="/edit-shop"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Store Settings</span>
            </Link>

            <Link
              to="/add-product"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-md shadow-teal-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── METRIC TILES (6 TILES) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          {
            label: "Listed Products",
            value: products.length,
            sub: "Total Catalog",
            icon: Package,
            theme: "teal",
            onClick: () => { setStockFilter("all"); setActiveTab("products"); }
          },
          {
            label: "Total Units",
            value: totalStock,
            sub: "Inventory Count",
            icon: TrendingUp,
            theme: "emerald",
            onClick: () => setActiveTab("products")
          },
          {
            label: "Est. Stock Value",
            value: `₹${totalCatalogValue.toLocaleString("en-IN")}`,
            sub: "Catalog Worth",
            icon: Store,
            theme: "blue",
            onClick: () => setActiveTab("products")
          },
          {
            label: "Low Stock Items",
            value: lowStockItems.length,
            sub: "≤ 5 Units Left",
            icon: AlertTriangle,
            theme: lowStockItems.length > 0 ? "amber" : "slate",
            onClick: () => { setStockFilter("lowstock"); setActiveTab("products"); }
          },
          {
            label: "Out of Stock",
            value: outOfStockItems.length,
            sub: "Needs Restock",
            icon: AlertCircle,
            theme: outOfStockItems.length > 0 ? "rose" : "slate",
            onClick: () => { setStockFilter("outofstock"); setActiveTab("products"); }
          },
          {
            label: "Store Rating",
            value: reviewsData.totalReviews > 0 ? `${reviewsData.avgRating} ★` : "New",
            sub: `${reviewsData.totalReviews} Reviews`,
            icon: Star,
            theme: "amber",
            onClick: () => setActiveTab("reviews")
          },
        ].map((tile) => {
          const TileIcon = tile.icon;
          return (
            <button
              key={tile.label}
              onClick={tile.onClick}
              className="bg-white rounded-2xl border border-slate-200 p-4 text-left shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      tile.theme === "teal"    ? "bg-teal-50 text-teal-600 border-teal-100" :
                      tile.theme === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      tile.theme === "blue"    ? "bg-sky-50 text-sky-600 border-sky-100" :
                      tile.theme === "amber"   ? "bg-amber-50 text-amber-600 border-amber-100" :
                      tile.theme === "rose"    ? "bg-rose-50 text-rose-600 border-rose-100" :
                      "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    <TileIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-teal-600 transition-colors">
                    View
                  </span>
                </div>
                <p className="text-xl font-display font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {tile.value}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{tile.label}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 truncate pt-2 border-t border-slate-100">{tile.sub}</p>
            </button>
          );
        })}
      </div>

      {/* ── URGENT RESTOCK ALERTS ── */}
      {lowStockItems.length > 0 && stockFilter !== "lowstock" && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                Action Required: {lowStockItems.length} product{lowStockItems.length > 1 ? "s are" : " is"} running low on stock!
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Shoppers may miss out if these items sell out. Restock soon to keep sales flowing.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setStockFilter("lowstock"); setActiveTab("products"); }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-200 hover:bg-amber-300 transition-colors self-start sm:self-center shrink-0"
          >
            Filter Low Stock Items ({lowStockItems.length})
          </button>
        </div>
      )}

      {outOfStockItems.length > 0 && stockFilter !== "outofstock" && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">
                Notice: {outOfStockItems.length} product{outOfStockItems.length > 1 ? "s are" : " is"} marked Out of Stock
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                These items are hidden from active search results. Update inventory count to make them available.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setStockFilter("outofstock"); setActiveTab("products"); }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-900 bg-rose-200 hover:bg-rose-300 transition-colors self-start sm:self-center shrink-0"
          >
            Show Out of Stock ({outOfStockItems.length})
          </button>
        </div>
      )}

      {/* ── TAB NAVIGATION ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "products", label: "Catalog & Inventory", icon: Package, count: products.length },
            { id: "hours",    label: "Operating Hours & Status", icon: Clock },
            { id: "profile",  label: "Store Details", icon: Store },
            { id: "reviews",  label: "Customer Reviews", icon: Star, count: reviewsData.totalReviews },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? "bg-teal-800 text-teal-100" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Shortcuts */}
        <div className="flex items-center gap-2 px-2">
          <Link
            to="/import"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulk Import</span>
          </Link>
          <Link
            to="/export"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Link>
          <Link
            to="/analytics/shop"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shop Analytics</span>
          </Link>
        </div>
      </div>

      {/* ── TAB 1: CATALOG & INVENTORY ── */}
      {activeTab === "products" && (
        <div className="space-y-4 animate-fadeIn">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by title or description..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setCurrentPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-44 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>

              {/* Stock Filter */}
              <select
                value={stockFilter}
                onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-40 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="all">All Inventory</option>
                <option value="instock">In Stock</option>
                <option value="lowstock">Low Stock (≤5)</option>
                <option value="outofstock">Out of Stock</option>
              </select>

              {(search || categoryFilter !== "all" || stockFilter !== "all") && (
                <button
                  onClick={() => { setSearch(""); setCategoryFilter("all"); setStockFilter("all"); setCurrentPage(1); }}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Catalog Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Store Catalog</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
              </div>

              <Link
                to="/add-product"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Item
              </Link>
            </div>

            {loadingProducts ? (
              <div className="py-20">
                <Loader text="Loading catalog..." />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-16 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No products found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {products.length === 0
                    ? "You haven't added any products yet. Click 'Add New Item' to start building your store catalog!"
                    : "No products match your current search and filter settings."}
                </p>
                {products.length === 0 ? (
                  <Link
                    to="/add-product"
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Your First Product
                  </Link>
                ) : (
                  <button
                    onClick={() => { setSearch(""); setCategoryFilter("all"); setStockFilter("all"); }}
                    className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Product</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Price</th>
                      <th className="px-6 py-3.5 text-center">Quick Stock Adjust</th>
                      <th className="px-6 py-3.5">Availability</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedProducts.map((p) => {
                      const isLow = p.isAvailable && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
                      const isOut = !p.isAvailable || p.stock === 0;

                      return (
                        <tr
                          key={p._id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isOut ? "bg-rose-50/20" : isLow ? "bg-amber-50/30" : ""
                          }`}
                        >
                          {/* Item Thumbnail & Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                {p.image ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.parentElement.innerHTML = '<span class="text-slate-400 text-xs">IMG</span>';
                                    }}
                                  />
                                ) : (
                                  <Package className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                                  <span>{p.name}</span>
                                  {isLow && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 font-bold rounded">
                                      LOW
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-slate-400 truncate max-w-xs">
                                  {p.description || "No description provided"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold">
                              {p.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4">
                            <span className="font-display font-bold text-teal-700 text-sm">
                              ₹{p.price}
                            </span>
                            <span className="text-xs text-slate-400 block -mt-0.5">
                              /{p.unit || "unit"}
                            </span>
                          </td>

                          {/* Quick In-Line Stock Adjuster */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleQuickStockChange(p, -1)}
                                disabled={updatingStockId === p._id || p.stock === 0}
                                title="Decrease stock by 1"
                                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center font-bold text-slate-700 text-sm shadow-xs transition-colors"
                              >
                                -
                              </button>
                              <span className="w-14 text-center font-display font-bold text-xs text-slate-800">
                                {p.stock} {p.unit || ""}
                              </span>
                              <button
                                onClick={() => handleQuickStockChange(p, 1)}
                                disabled={updatingStockId === p._id}
                                title="Increase stock by 1"
                                className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 disabled:opacity-40 flex items-center justify-center font-bold text-slate-700 text-sm shadow-xs transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Stock Status Badge */}
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                isOut
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : isLow
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {isOut ? (
                                <>
                                  <XCircle className="w-3 h-3 text-rose-500" />
                                  <span>Out of Stock</span>
                                </>
                              ) : isLow ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Low Stock</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>In Stock</span>
                                </>
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/analytics/product/${p._id}`}
                                title="View Product Analytics"
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <BarChart3 className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => navigate(`/edit-product/${p._id}`)}
                                title="Edit Product"
                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteModalProduct(p)}
                                title="Delete Product"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
                <p className="text-xs text-slate-500 font-medium">
                  Showing page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
                  <span className="font-bold text-slate-800">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white text-slate-600 transition-colors bg-white shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white text-slate-600 transition-colors bg-white shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: OPERATING HOURS & AVAILABILITY ── */}
      {activeTab === "hours" && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          <ShopStatusPanel shop={shop} onUpdate={fetchShop} />
        </div>
      )}

      {/* ── TAB 3: STORE PROFILE & DETAILS ── */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-4xl space-y-6 animate-fadeIn">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">{shop.name}</h2>
              <p className="text-xs text-slate-500 mt-1">
                Category: <span className="font-semibold text-slate-700">{shop.category}</span>
              </p>
            </div>
            <Link
              to="/edit-shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" /> Physical Address
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {shop.address?.street || "Street address not set"}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {shop.address?.city}, {shop.address?.state} {shop.address?.pincode ? `— ${shop.address.pincode}` : ""}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-600" /> Contact Info
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {shop.phone || "No phone number listed"}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                {shop.email || "No email address listed"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Store Description
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {shop.description || "No store description provided. Click 'Edit Profile' to add details about your shop, specialties, and neighborhood delivery policies."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: CUSTOMER REVIEWS ── */}
      {activeTab === "reviews" && (
        <div className="space-y-6 animate-fadeIn max-w-4xl">
          {/* Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left sm:border-r sm:border-slate-100 sm:pr-8 shrink-0">
              <p className="text-4xl font-display font-extrabold text-slate-900">
                {reviewsData.avgRating || "0.0"}
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-1 my-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(reviewsData.avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Based on {reviewsData.totalReviews} customer ratings
              </p>
            </div>

            {/* Distribution */}
            <div className="flex-1 w-full space-y-1.5">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = reviewsData.distribution?.[r] || 0;
                const pct = reviewsData.totalReviews
                  ? Math.round((count / reviewsData.totalReviews) * 100)
                  : 0;
                return (
                  <div key={r} className="flex items-center gap-3 text-xs">
                    <span className="w-12 text-slate-600 font-semibold">{r} Stars</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-400 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-900 text-base">Verified Feedback</h3>
            </div>

            {reviewsData.reviews?.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm">
                <Star className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                No customer reviews have been submitted for your storefront yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviewsData.reviews.map((r) => (
                  <div key={r._id} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
                          {r.user?.name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{r.user?.name || "Customer"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          {r.comment && (
                            <p className="text-sm text-slate-700 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                              "{r.comment}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DELETE PRODUCT CONFIRMATION MODAL ── */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-slate-900">
              Remove Product from Catalog
            </h3>

            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900">{deleteModalProduct.name}</strong> (₹{deleteModalProduct.price})?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
