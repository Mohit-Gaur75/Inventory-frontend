import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchProducts, compareProducts, getFavouriteIds } from "../api/axios";
import { useAuth }       from "../context/AuthContext";
import ProductCard       from "../components/ProductCard";
import SearchBar         from "../components/SearchBar";
import Loader            from "../components/Loader";
import {
  SlidersHorizontal, MapPin, ChevronLeft, ChevronRight,
  X, GitCompare,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const CATEGORIES = ["All","Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];
const LIMIT = 12;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [query,       setQuery]       = useState(searchParams.get("q") || "");
  const [category,    setCategory]    = useState("All");
  const [sortBy,      setSortBy]      = useState("price_asc");
  const [lat,         setLat]         = useState("");
  const [lng,         setLng]         = useState("");
  const [minPrice,    setMinPrice]    = useState("");
  const [maxPrice,    setMaxPrice]    = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [favIds,     setFavIds]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [searched,   setSearched]   = useState(false);
  const [page,       setPage]       = useState(1);

  useEffect(() => {
    if (searchParams.get("q")) handleSearch();
    if (user?.role === "customer") loadFavIds();
  }, []);

  useEffect(() => {
    if (searched) handleSearch();
  }, [page]);

  const loadFavIds = async () => {
    try { const res = await getFavouriteIds(); setFavIds(res.data); } catch {}
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); toast.success("Location set!"); },
      () => toast.error("Could not detect location")
    );
  };

  const handleSearch = async (e, resetPage = false) => {
    e?.preventDefault();
    if (!query.trim()) return toast.error("Enter a product name to search");
    const currentPage = resetPage ? 1 : page;
    if (resetPage) setPage(1);
    setLoading(true);
    setSearched(true);
    try {
      const params = { q: query, sortBy, page: currentPage, limit: LIMIT };
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
    } catch { toast.error("Search failed"); }
    finally { setLoading(false); }
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
        <span className="text-slate-700 font-medium">Local Directory & Search</span>
      </div>

      {/* Search bar */}
      <div className="max-w-2xl mx-auto">
        <SearchBar
          initialValue={query}
          onSearch={(q) => { setQuery(q); setTimeout(() => handleSearch(null, true), 0); }}
          placeholder="Search items or local store inventories…"
        />
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200
                ${category === c ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50"}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200
              ${showFilters ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
          </button>
          <button onClick={() => setCompareMode(!compareMode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all duration-200
              ${compareMode ? "bg-teal-600 text-white border-teal-600 shadow-sm" : "border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200"}`}>
            <GitCompare className="w-3.5 h-3.5" /> Compare Mode
          </button>
        </div>
      </div>

      {/* Extended filters */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Min Price</label>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              placeholder="₹0" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Max Price</label>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="₹9999" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="distance">Nearest First</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-600">Location</label>
            <button onClick={detectLocation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> {lat && lng ? `${lat}, ${lng}` : "Detect Location"}
            </button>
            {lat && lng && (
              <button onClick={() => { setLat(""); setLng(""); }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors">
                <X className="w-3 h-3" /> Clear location
              </button>
            )}
          </div>
          <div className="col-span-2 md:col-span-4 flex items-center gap-2 pt-1">
            <input type="checkbox" id="instock" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded" />
            <label htmlFor="instock" className="text-sm text-slate-700 font-medium">In stock only</label>
          </div>
        </div>
      )}

      {/* Results */}
      {loading && <Loader text="Searching local catalog…" />}

      {!loading && searched && products.length === 0 && (
        <div className="text-center py-20 text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
            <p className="text-4xl">🔍</p>
          </div>
          <p className="font-display font-semibold text-xl text-slate-700 mb-2">No products found for "{query}"</p>
          <p className="text-sm text-slate-500 mt-1">Try another search keyword or clear applied category filters.</p>
        </div>
      )}

      {!loading && products.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {pagination ? `${pagination.total} result${pagination.total !== 1 ? "s" : ""}` : `${products.length} result${products.length !== 1 ? "s" : ""}`}
            </p>
            {compareMode && (
              <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-semibold">
                Compare mode: sorted by price
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                isFavourited={favIds.includes(p._id)}
                onFavouriteChange={loadFavIds}
                onCompare={handleCompare}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-sm text-slate-600 font-medium">Page {pagination.page} of {pagination.totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
