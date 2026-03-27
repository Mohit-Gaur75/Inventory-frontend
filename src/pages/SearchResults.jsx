import { useState, useEffect} from "react";
import { useSearchParams } from "react-router-dom";
import { searchProducts, compareProducts, getFavouriteIds } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import {
  Search, SlidersHorizontal, MapPin,
  ChevronLeft, ChevronRight, X
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = ["All","Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];
const LIMIT = 12;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Search state
  const [query, setQuery]         = useState(searchParams.get("q") || "");
  const [category, setCategory]   = useState("All");
  const [sortBy, setSortBy]       = useState("price_asc");
  const [lat, setLat]             = useState("");
  const [lng, setLng]             = useState("");
  const [minPrice, setMinPrice]   = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Results state
  const [products, setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [favIds, setFavIds]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [page, setPage]           = useState(1);

  useEffect(() => {
    if (searchParams.get("q")) handleSearch();
    if (user?.role === "customer") loadFavIds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-search when page changes
  useEffect(() => {
    if (searched) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadFavIds = async () => {
    try {
      const res = await getFavouriteIds();
      setFavIds(res.data);
    } catch {}
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        toast.success("Location set!");
      },
      () => toast.error("Could not detect location")
    );
  };

  const clearLocation = () => { setLat(""); setLng(""); };

  const handleSearch = async (e, resetPage = false) => {
    e?.preventDefault();
    if (!query.trim()) return toast.error("Enter a product name to search");

    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);

    setLoading(true);
    setSearched(true);

    try {
      const params = {
        q: query, sortBy, page: currentPage, limit: LIMIT,
      };
      if (category !== "All") params.category = category;
      if (lat && lng)         { params.lat = lat; params.lng = lng; }
      if (minPrice)           params.minPrice = minPrice;
      if (maxPrice)           params.maxPrice = maxPrice;
      if (inStockOnly)        params.inStockOnly = "true";

      let data;
      if (compareMode) {
        const res = await compareProducts({ name: query, lat, lng });
        data = { products: res.data.products, pagination: null };
      } else {
        const res = await searchProducts(params);
        data = res.data;
      }

      setProducts(data.products || []);
      setPagination(data.pagination || null);
      setSearchParams({ q: query });
    } catch {
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeFilterCount = [
    category !== "All",
    minPrice !== "",
    maxPrice !== "",
    inStockOnly,
    lat !== "",
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-5">

      {/* ── Search Bar ── */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h1 className="font-display font-bold text-2xl text-stone-800 mb-4">
          Find Products Near You
        </h1>

        <form onSubmit={(e) => handleSearch(e, true)} className="space-y-3">
          {/* Main search row */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search rice, sugar, medicine..."
                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
            </div>
            <button type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl text-sm font-medium transition-colors relative
                ${showFilters || activeFilterCount > 0
                  ? "border-orange-400 bg-orange-50 text-orange-600"
                  : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button type="submit"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl transition-colors">
              Search
            </button>
          </div>

          {/* Expandable Filters Panel */}
          {showFilters && (
            <div className="border border-stone-100 rounded-xl p-4 bg-stone-50 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="distance">Nearest First</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Min Price (₹)</label>
                  <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0" min="0"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-xs font-medium text-stone-500 mb-1.5">Max Price (₹)</label>
                  <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Any" min="0"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {/* Bottom row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Location */}
                <button type="button" onClick={lat ? clearLocation : detectLocation}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors
                    ${lat ? "border-orange-300 bg-orange-50 text-orange-600" : "border-stone-200 text-stone-500 hover:bg-stone-50"}`}>
                  {lat ? <><MapPin className="w-4 h-4" /> 📍 Location set <X className="w-3 h-3 ml-1" /></> : <><MapPin className="w-4 h-4" /> Use My Location</>}
                </button>

                {/* In Stock Only */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-stone-600">In stock only</span>
                </label>

                {/* Compare Mode */}
                <button type="button" onClick={() => setCompareMode(!compareMode)}
                  className={`px-3 py-2 rounded-lg text-sm border font-medium transition-colors
                    ${compareMode ? "border-blue-300 bg-blue-50 text-blue-600" : "border-stone-200 text-stone-500 hover:bg-stone-50"}`}>
                  {compareMode ? "✓ Compare Mode ON" : "Compare Prices"}
                </button>

                {/* Clear all filters */}
                {activeFilterCount > 0 && (
                  <button type="button"
                    onClick={() => {
                      setCategory("All"); setMinPrice(""); setMaxPrice("");
                      setInStockOnly(false); setLat(""); setLng(""); setCompareMode(false);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ── Results ── */}
      {loading ? (
        <Loader text="Searching products..." />
      ) : searched ? (
        <div className="space-y-4">
          {/* Result meta */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-stone-500 text-sm">
              {pagination
                ? `Showing ${((page-1)*LIMIT)+1}–${Math.min(page*LIMIT, pagination.total)} of ${pagination.total} results`
                : `${products.length} result${products.length !== 1 ? "s" : ""}`}
              {query && <span className="text-stone-700 font-medium"> for "{query}"</span>}
            </p>
            {compareMode && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                Compare Mode — sorted by lowest price
              </span>
            )}
          </div>

          {/* Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-stone-200 mx-auto mb-3" />
              <p className="text-stone-500 font-medium">No products found</p>
              <p className="text-stone-400 text-sm mt-1">Try different keywords or clear some filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  isFavourited={favIds.includes(p._id)}
                  onFavouriteChange={loadFavIds}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-stone-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`dot-${idx}`} className="px-2 py-2 text-stone-400 text-sm">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors
                          ${p === page
                            ? "bg-orange-500 text-white"
                            : "border border-stone-200 text-stone-600 hover:bg-stone-50"}`}>
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-4 py-2 border border-stone-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-stone-50 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-orange-100 mx-auto mb-4" />
          <h2 className="font-display font-semibold text-xl text-stone-700 mb-2">
            Search for any product
          </h2>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">
            Find products from local shops, compare prices, and locate the nearest store.
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;