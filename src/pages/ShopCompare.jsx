import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  compareProducts,
} from "../api/axios";
import { useAuth }  from "../context/AuthContext";
import { useCart }  from "../context/CartContext";
import Loader       from "../components/Loader";
import toast        from "react-hot-toast";
import {
  ShoppingCart, MapPin, Package, Trophy, Bookmark,
  BookmarkCheck, ArrowLeft, CheckCircle, TrendingDown,
  Zap, AlertCircle,
} from "lucide-react";

const MAX_SELECT = 4;
const SAVE_KEY   = "lm_saved_comparison";

const loadSaved = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || null; } catch { return null; } };
const saveCmp   = (data) => localStorage.setItem(SAVE_KEY, JSON.stringify(data));
const clearSave = () => localStorage.removeItem(SAVE_KEY);

const BestBadge = ({ label }) => (
  <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1">
    <Trophy className="w-2.5 h-2.5" /> {label}
  </span>
);

const ShopCompare = () => {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const { user }         = useAuth();
  const { addItem }      = useCart();
  const productName      = searchParams.get("name") || "";

  const [allProducts, setAllProducts] = useState([]); 
  const [selected,    setSelected]    = useState([]); 
  const [lat,         setLat]         = useState(null);
  const [lng,         setLng]         = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [cartBusy,    setCartBusy]    = useState({});
  const [saved,       setSaved]       = useState(!!loadSaved());

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); },
      () => {}
    );
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!productName) { setLoading(false); return; }
    setLoading(true);
    try {
      const params = { name: productName };
      if (lat && lng) { params.lat = lat; params.lng = lng; }
      const { data } = await compareProducts(params);
      setAllProducts(data.products || []);
      setSelected((data.products || []).slice(0, MAX_SELECT).map((p) => p._id));
    } catch { toast.error("Failed to load comparison"); }
    finally { setLoading(false); }
  }, [productName, lat, lng]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) { toast.error(`Max ${MAX_SELECT} shops to compare`); return prev; }
      return [...prev, id];
    });
  };

  const compared = allProducts.filter((p) => selected.includes(p._id));

  const prices   = compared.map((p) => p.price);
  const stocks   = compared.map((p) => p.stock);
  const dists    = compared.map((p) => p.distance).filter((d) => d != null);

  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxStock = stocks.length ? Math.max(...stocks) : null;
  const minDist  = dists.length  ? Math.min(...dists)  : null;

  const handleAddToCart = async (product) => {
    if (!user)                    return toast.error("Login to add to cart");
    if (user.role !== "customer") return toast.error("Only customers can use the cart");
    if (product.stock === 0)      return toast.error("Out of stock");
    setCartBusy((b) => ({ ...b, [product._id]: true }));
    try {
      await addItem(product._id, 1);
      toast.success(`Added ${product.name} from ${product.shop?.name} ✓`);
    } catch { toast.error("Failed to add to cart"); }
    finally { setCartBusy((b) => ({ ...b, [product._id]: false })); }
  };

  const handleSave = () => {
    if (saved) { clearSave(); setSaved(false); toast("Comparison cleared"); }
    else       { saveCmp({ name: productName, ids: selected, ts: Date.now() }); setSaved(true); toast.success("Comparison saved!"); }
  };

  if (loading) return <Loader text="Loading comparison…" />;

  if (!productName) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-500">No product specified. Go to <Link to="/search" className="text-teal-600 font-semibold underline">Search</Link> and click "Compare".</p>
    </div>
  );

  if (allProducts.length === 0) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center bg-white border border-slate-200 rounded-3xl">
      <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-slate-800 mb-2">No results for "{productName}"</h2>
      <p className="text-slate-500 mb-6">No shops currently list this product.</p>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm">
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="font-bold text-2xl text-slate-900">Compare Local Prices</h1>
            <p className="text-slate-500 text-sm">
              <span className="font-semibold text-teal-700">"{productName}"</span> — {allProducts.length} shop{allProducts.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border transition-colors shadow-sm
              ${saved ? "bg-teal-600 text-white border-teal-600" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {saved ? "Saved" : "Save comparison"}
          </button>
        </div>
      </div>

      {/* Summary banner */}
      {minPrice != null && (
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-5 text-white flex flex-wrap gap-8 items-center shadow-md">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-teal-100" />
            <div>
              <p className="text-xs text-teal-100 font-medium">Best Price</p>
              <p className="font-bold text-2xl">₹{minPrice}</p>
            </div>
          </div>
          {minDist != null && (
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-teal-100" />
              <div>
                <p className="text-xs text-teal-100 font-medium">Closest Store</p>
                <p className="font-bold text-2xl">{minDist} km</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-teal-100" />
            <div>
              <p className="text-xs text-teal-100 font-medium">Max Local Savings</p>
              <p className="font-bold text-2xl">₹{prices.length > 1 ? Math.max(...prices) - minPrice : 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 text-sm">Select Stores ({selected.length}/{MAX_SELECT})</h2>
            {selected.length > 0 && (
              <button onClick={() => setSelected([])} className="text-xs text-slate-400 hover:text-rose-500 transition-colors">Clear all</button>
            )}
          </div>

          {allProducts.map((p) => {
            const isSel   = selected.includes(p._id);
            const isBest  = p.price === minPrice;
            return (
              <div
                key={p._id}
                onClick={() => toggleSelect(p._id)}
                className={`relative p-3.5 rounded-2xl border cursor-pointer transition-all shadow-sm
                  ${isSel ? "border-teal-500 bg-teal-50/60" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                {isBest && selected.length > 1 && (
                  <span className="absolute -top-2 right-3 text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold shadow-sm">
                    Lowest Price
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSel ? "bg-teal-600 border-teal-600 text-white" : "border-slate-300"}`}>
                    {isSel && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <p className="font-semibold text-slate-800 text-sm truncate">{p.shop?.name}</p>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 ml-6">
                  <span className="font-bold text-slate-900">₹{p.price}</span>
                  {p.distance != null && <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{p.distance} km</span>}
                  <span className="flex items-center gap-0.5"><Package className="w-2.5 h-2.5" />{p.stock} left</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          {compared.length < 2 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50/50">
              <CheckCircle className="w-10 h-10 mb-3 text-slate-300" />
              <p className="font-medium text-slate-700 mb-1">Pick at least 2 stores to compare</p>
              <p className="text-sm text-slate-400">Select shops from the list on the left to see side-by-side pricing.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 w-32">Metric</th>
                    {compared.map((p) => (
                      <th key={p._id} className="px-4 py-3 text-center">
                        <div className="font-semibold text-slate-900 truncate max-w-[140px]">{p.shop?.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{p.shop?.category}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price */}
                  <MetricRow label="Price" icon="💰">
                    {compared.map((p) => (
                      <td key={p._id} className="px-4 py-3 text-center">
                        <span className={`font-bold text-base ${p.price === minPrice ? "text-emerald-700" : "text-slate-800"}`}>
                          ₹{p.price}
                        </span>
                        {p.price === minPrice && compared.length > 1 && <div><BestBadge label="Lowest" /></div>}
                      </td>
                    ))}
                  </MetricRow>

                  {/* Stock */}
                  <MetricRow label="Stock" icon="📦" shaded>
                    {compared.map((p) => (
                      <td key={p._id} className="px-4 py-3 text-center">
                        <span className={`font-semibold ${p.stock === 0 ? "text-rose-600" : p.stock === maxStock ? "text-emerald-700" : "text-slate-700"}`}>
                          {p.stock === 0 ? "Out of stock" : `${p.stock} ${p.unit || "pcs"}`}
                        </span>
                        {p.stock === maxStock && p.stock > 0 && compared.length > 1 && <div><BestBadge label="Most Stock" /></div>}
                      </td>
                    ))}
                  </MetricRow>

                  {/* Distance */}
                  {compared.some((p) => p.distance != null) && (
                    <MetricRow label="Distance" icon="📍">
                      {compared.map((p) => (
                        <td key={p._id} className="px-4 py-3 text-center">
                          <span className={`font-semibold ${p.distance === minDist ? "text-emerald-700" : "text-slate-700"}`}>
                            {p.distance != null ? `${p.distance} km` : "—"}
                          </span>
                          {p.distance === minDist && p.distance != null && compared.length > 1 && <div><BestBadge label="Nearest" /></div>}
                        </td>
                      ))}
                    </MetricRow>
                  )}

                  {/* Address */}
                  <MetricRow label="Address" icon="🏪" shaded>
                    {compared.map((p) => (
                      <td key={p._id} className="px-4 py-3 text-center text-xs text-slate-500">
                        {p.shop?.address
                          ? [p.shop.address.street, p.shop.address.city].filter(Boolean).join(", ") || "—"
                          : "—"}
                      </td>
                    ))}
                  </MetricRow>

                  {/* Category */}
                  <MetricRow label="Shop Type" icon="🏷️">
                    {compared.map((p) => (
                      <td key={p._id} className="px-4 py-3 text-center">
                        <span className="inline-block bg-teal-50 text-teal-700 border border-teal-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
                          {p.shop?.category || "—"}
                        </span>
                      </td>
                    ))}
                  </MetricRow>

                  {/* Add to cart row */}
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">Action</td>
                    {compared.map((p) => (
                      <td key={p._id} className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={cartBusy[p._id] || p.stock === 0}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700
                                     disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold
                                     rounded-xl transition-colors shadow-sm"
                        >
                          {cartBusy[p._id]
                            ? <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            : <ShoppingCart className="w-3.5 h-3.5" />}
                          {p.stock === 0 ? "Out of stock" : "Add to Cart"}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, icon, shaded, children }) => (
  <tr className={`border-b border-slate-100 ${shaded ? "bg-slate-50/50" : "bg-white"}`}>
    <td className="px-4 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">
      <span className="mr-1.5">{icon}</span>{label}
    </td>
    {children}
  </tr>
);

export default ShopCompare;
