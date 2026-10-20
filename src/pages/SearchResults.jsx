import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { searchProducts, compareProducts, getFavouriteIds } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import Loader from "../components/Loader";
import {
  SlidersHorizontal, MapPin, ChevronLeft, ChevronRight,
  X, GitCompare, Flame, Navigation, Package, RotateCcw
} from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Grocery", "Electronics", "Clothing", "Pharmacy", "Hardware", "Stationery", "Food & Beverage", "Other"];
const LIMIT = 12;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query,       setQuery]       = useState(searchParams.get("q") || "");
  const [category,    setCategory]    = useState("All");
  const [sortBy,      setSortBy]      = useState("distance");
  const [lat,         setLat]         = useState("");
  const [lng,         setLng]         = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [inStockOnly, setInStockOnly] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Search Results State
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [searched,   setSearched]   = useState(false);
  const [page,       setPage]       = useState(1);

  // Trending Products State (shown before searching or per category)
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingTrending,  setLoadingTrending]  = useState(true);

  // Favourites
  const [favIds, setFavIds] = useState([]);

  const loadFavIds = useCallback(async () => {
    try {
      const res = await getFavouriteIds();
      setFavIds(res.data);
    } catch {}
  }, []);

  const loadTrending = useCallback(async (currentLat, currentLng, currentCat) => {
    setLoadingTrending(true);
    try {
      const cat = currentCat !== undefined ? currentCat : category;
      const params = { sortBy: "trending", limit: LIMIT, inStockOnly: "true" };
      if (cat && cat !== "All") params.category = cat;

      const effectiveLat = currentLat !== undefined ? currentLat : lat;
      const effectiveLng = currentLng !== undefined ? currentLng : lng;
      if (effectiveLat && effectiveLng) {
        params.lat = effectiveLat;
        params.lng = effectiveLng;
      }
      const res = await searchProducts(params);
      setTrendingProducts(res.data.products || []);
    } catch {
      setTrendingProducts([]);
    } finally {
      setLoadingTrending(false);
    }
  }, [lat, lng, category]);

  const executeSearch = useCallback(async (searchQuery, targetPage = 1, currentLat, currentLng, currentCat) => {
    const qStr = searchQuery !== undefined ? searchQuery : query;
    if (!qStr || !qStr.trim()) {
      setSearched(false);
      setProducts([]);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const cat = currentCat !== undefined ? currentCat : category;
      const effectiveLat = currentLat !== undefined ? currentLat : lat;
      const effectiveLng = currentLng !== undefined ? currentLng : lng;

      const params = {
        q: qStr.trim(),
        sortBy: sortBy || "distance",
        page: targetPage,
        limit: LIMIT,
      };

      if (cat && cat !== "All") params.category = cat;
      if (effectiveLat && effectiveLng) {
        params.lat = effectiveLat;
        params.lng = effectiveLng;
      }
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (inStockOnly) params.inStockOnly = "true";

      let data;
      if (compareMode) {
        const res = await compareProducts({ name: qStr.trim(), lat: effectiveLat, lng: effectiveLng });
        data = { products: res.data.products, pagination: null };
      } else {
        const res = await searchProducts(params);
        data = res.data;
      }

      setProducts(data.products || []);
      setPagination(data.pagination || null);
      setSearchParams({ q: qStr.trim() });
    } catch {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [query, category, sortBy, lat, lng, minPrice, maxPrice, inStockOnly, compareMode, setSearchParams]);

  // Initial mount: load cached location, favourites, and trigger initial search or trending products
  useEffect(() => {
    if (user?.role === "customer") loadFavIds();

    let initialLat = "";
    let initialLng = "";

    const cached = localStorage.getItem("user_coords");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.lat && parsed.lng) {
          initialLat = parsed.lat;
          initialLng = parsed.lng;
          setLat(initialLat);
          setLng(initialLng);
        }
      } catch {}
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const cLat = pos.coords.latitude.toFixed(6);
          const cLng = pos.coords.longitude.toFixed(6);
          setLat(cLat);
          setLng(cLng);
          localStorage.setItem("user_coords", JSON.stringify({ lat: cLat, lng: cLng }));
        },
        () => {} // silent pass
      );
    }

    const initialQ = searchParams.get("q");
    if (initialQ && initialQ.trim()) {
      setQuery(initialQ.trim());
      executeSearch(initialQ.trim(), 1, initialLat, initialLng);
    } else {
      loadTrending(initialLat, initialLng);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle pagination changes
  useEffect(() => {
    if (searched && query.trim()) {
      executeSearch(query, page);
    }
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCategorySelect = (selectedCat) => {
    setCategory(selectedCat);
    setPage(1);
    if (searched && query.trim()) {
      executeSearch(query, 1, lat, lng, selectedCat);
    } else {
      loadTrending(lat, lng, selectedCat);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }
    const tId = toast.loading("Detecting your location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const cLat = pos.coords.latitude.toFixed(6);
        const cLng = pos.coords.longitude.toFixed(6);
        setLat(cLat);
        setLng(cLng);
        localStorage.setItem("user_coords", JSON.stringify({ lat: cLat, lng: cLng }));
        toast.success("Location set! Products sorted by nearby shops", { id: tId });

        if (searched && query.trim()) {
          executeSearch(query, 1, cLat, cLng, category);
        } else {
          loadTrending(cLat, cLng, category);
        }
      },
      () => {
        toast.error("Location access denied. Please enable location in your browser settings", { id: tId });
      }
    );
  };

  const clearLocation = () => {
    setLat("");
    setLng("");
    localStorage.removeItem("user_coords");
    toast.success("Location cleared");
    if (searched && query.trim()) {
      executeSearch(query, 1, "", "", category);
    } else {
      loadTrending("", "", category);
    }
  };

  const handleSearchSubmit = (searchQuery) => {
    const qStr = searchQuery !== undefined ? searchQuery : query;
    if (!qStr || !qStr.trim()) {
      setSearched(false);
      setQuery("");
      setSearchParams({});
      loadTrending(lat, lng, category);
      return;
    }
    setQuery(qStr);
    setPage(1);
    executeSearch(qStr, 1, lat, lng, category);
  };

  const handleClearSearch = () => {
    setQuery("");
    setSearched(false);
    setProducts([]);
    setSearchParams({});
    loadTrending(lat, lng, category);
  };

  const handleCompare = (productName) => {
    navigate(`/compare?name=${encodeURIComponent(productName)}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-teal-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">Local Marketplace & Search</span>
      </div>

      {/* Hero Search Bar Area */}
      <div className="bg-gradient-to-br from-teal-50 via-white to-emerald-50/50 border border-teal-100 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl mx-auto text-center mb-6">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900">
            Find Products in Local Stores
          </h1>
          <p className="text-slate-600 text-sm mt-1.5">
            Search local inventories and compare prices from nearby shops in real-time
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <SearchBar
            initialValue={query}
            onSearch={(q) => handleSearchSubmit(q)}
            placeholder="Search items or local store inventories (e.g. Milk, Rice, Bread)..."
          />
        </div>

        {/* Location pill indicator */}
        <div className="flex items-center justify-center gap-2 mt-4 text-xs">
          {lat && lng ? (
            <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-teal-200 text-teal-800 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Nearby Location Active ({lat}, {lng})</span>
              <button
                type="button"
                onClick={clearLocation}
                title="Clear location"
                className="text-slate-400 hover:text-rose-500 transition-colors ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={detectLocation}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-medium px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-teal-300 transition-all shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-600" />
              Detect my location for nearest store sorting
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => handleCategorySelect(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 whitespace-nowrap
                ${category === c
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50 bg-white"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200
              ${showFilters ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "border-slate-200 text-slate-700 hover:bg-slate-50 bg-white shadow-sm"}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          <button
            onClick={() => {
              const newMode = !compareMode;
              setCompareMode(newMode);
              if (searched) {
                setTimeout(() => executeSearch(query, 1, lat, lng, category), 0);
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200
              ${compareMode ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 bg-white shadow-sm"}`}
          >
            <GitCompare className="w-3.5 h-3.5" /> Compare Mode
          </button>
        </div>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 shadow-sm animate-fadeIn">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                if (searched) setTimeout(() => executeSearch(query, 1, lat, lng, category), 0);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              <option value="distance">Nearest Shops First (Recommended)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Min Price (₹)</label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Max Price (₹)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="9999"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={() => {
                if (searched) executeSearch(query, 1, lat, lng, category);
                else loadTrending(lat, lng, category);
              }}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              Apply Filters
            </button>
          </div>
          <div className="col-span-1 sm:col-span-2 md:col-span-4 flex items-center gap-2 pt-1 border-t border-slate-100">
            <input
              type="checkbox"
              id="instock"
              checked={inStockOnly}
              onChange={(e) => {
                setInStockOnly(e.target.checked);
                if (searched) setTimeout(() => executeSearch(query, 1, lat, lng, category), 0);
                else loadTrending(lat, lng, category);
              }}
              className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
            />
            <label htmlFor="instock" className="text-xs text-slate-700 font-medium cursor-pointer">
              Show only products currently in stock
            </label>
          </div>
        </div>
      )}

      {/* Loading state for search */}
      {loading && <Loader text="Finding products in nearby stores..." />}

      {/* ── Case 1: Search Active & Results Found ── */}
      {!loading && searched && products.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-display font-bold text-2xl text-slate-900">
                  Results for "{query}"
                </h2>
                {category !== "All" && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                    {category}
                  </span>
                )}
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear Search
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {lat && lng
                  ? "Sorted in order of nearby shops with products currently available"
                  : "Showing available products currently in stock across shops"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {pagination ? `${pagination.total} Available` : `${products.length} Products`}
              </span>
              {lat && lng && (
                <span className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-600" /> Nearest First
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                distance={p.distance}
                isFavourited={favIds.includes(p._id)}
                onFavouriteChange={loadFavIds}
                onCompare={handleCompare}
                onCategoryClick={handleCategorySelect}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-slate-600 font-medium px-2">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors bg-white shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Case 2: Search Active & Zero Results Found ── */}
      {!loading && searched && products.length === 0 && (
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-display font-bold text-xl text-slate-800">
            No {category !== "All" ? `${category} ` : ""}products found for "{query}"
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {category !== "All"
              ? `No items found matching "${query}" in the ${category} category.`
              : "No nearby stores currently have this product in stock."}
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            {category !== "All" && (
              <button
                onClick={() => handleCategorySelect("All")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
              >
                Search in All Categories
              </button>
            )}
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> View Trending Products
            </button>
          </div>
        </div>
      )}

      {/* ── Case 3: Initial State / No Search Query: Show Trending Products in Card Form (Filtered by Selected Category) ── */}
      {!searched && (
        <div className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800 mb-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-600" /> Hot in Your Neighbourhood
              </div>
              <h2 className="font-display font-bold text-2xl text-slate-900">
                {category === "All" ? "Trending Products Near You" : `Trending ${category} Products`}
              </h2>
              <p className="text-sm text-slate-500">
                {category === "All"
                  ? "In-demand items currently in stock across verified local neighbourhood stores"
                  : `In-demand ${category.toLowerCase()} items currently in stock across verified local stores`}
              </p>
            </div>

            {lat && lng ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>Sorted by nearest available shops</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={detectLocation}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 px-3 py-1.5 rounded-xl transition-all shadow-sm self-start sm:self-auto"
              >
                <Navigation className="w-3.5 h-3.5 text-teal-600" />
                Sort by nearest shops
              </button>
            )}
          </div>

          {loadingTrending ? (
            <Loader text={`Loading ${category !== "All" ? `${category} ` : ""}trending products...`} />
          ) : trendingProducts.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-700 font-semibold">
                No {category !== "All" ? `${category} ` : ""}products available currently
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {category !== "All"
                  ? `There are no products in "${category}" at the moment.`
                  : "Check back as local stores update their inventories."}
              </p>
              {category !== "All" && (
                <button
                  onClick={() => handleCategorySelect("All")}
                  className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
                >
                  Show All Categories
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingProducts.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  distance={p.distance}
                  isFavourited={favIds.includes(p._id)}
                  onFavouriteChange={loadFavIds}
                  onCompare={handleCompare}
                  onCategoryClick={handleCategorySelect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;