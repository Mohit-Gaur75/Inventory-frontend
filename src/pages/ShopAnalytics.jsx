import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Eye, ShoppingCart, Heart, TrendingUp, BarChart2, ArrowRight } from "lucide-react";

const ShopAnalytics = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState([]);
  const [sortBy, setSortBy]     = useState("views");

  useEffect(() => {
    API.get("/analytics/shop")
      .then(({ data }) => setProducts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (id) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s
    );
  };

  const sorted = [...products].sort((a, b) => b[sortBy] - a[sortBy]);

  const chartData = sorted.slice(0, 8).map((p) => ({
    name:      p.name.length > 14 ? p.name.slice(0, 14) + "…" : p.name,
    Views:     p.views,
    "Cart Adds": p.cartAdds,
    Favourites: p.favouriteCount,
  }));

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-stone-800">Product Analytics</h1>
            <p className="text-stone-500 text-sm">Performance overview for all your products</p>
          </div>
        </div>

        {/* Sort control */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        >
          <option value="views">Sort: Most Viewed</option>
          <option value="cartAdds">Sort: Most Cart Adds</option>
          <option value="favouriteCount">Sort: Most Favourited</option>
          <option value="conversionRate">Sort: Best Conversion</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <BarChart2 className="w-12 h-12 text-stone-200 mx-auto mb-3" />
          No analytics data yet — customers need to view products first.
        </div>
      ) : (
        <>
          {/* ── Bar Chart ── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <h3 className="font-semibold text-stone-800 mb-4">Top 8 Products</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="Views"      fill="#3b82f6" radius={[3,3,0,0]} />
                <Bar dataKey="Cart Adds"  fill="#f97316" radius={[3,3,0,0]} />
                <Bar dataKey="Favourites" fill="#ec4899" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Compare banner ── */}
          {selected.length >= 2 && (
            <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-2xl">
              <p className="text-sm font-semibold text-purple-800">
                {selected.length} products selected for comparison
              </p>
              <Link
                to={`/analytics/compare?ids=${selected.join(",")}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Compare <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* ── Product Table ── */}
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500">
                      <span className="flex items-center gap-1 justify-end"><Eye className="w-3 h-3" /> Views</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500">
                      <span className="flex items-center gap-1 justify-end"><ShoppingCart className="w-3 h-3" /> Cart</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500">
                      <span className="flex items-center gap-1 justify-end"><Heart className="w-3 h-3" /> Favs</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500">
                      <span className="flex items-center gap-1 justify-end"><TrendingUp className="w-3 h-3" /> Conv%</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-stone-500">Stock</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((p, idx) => (
                    <tr key={p._id}
                      className={`border-b border-stone-100 last:border-0 transition-colors
                        ${selected.includes(p._id) ? "bg-purple-50" : idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(p._id)}
                          onChange={() => toggleSelect(p._id)}
                          disabled={!selected.includes(p._id) && selected.length >= 4}
                          className="rounded accent-orange-500"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-stone-800">{p.name}</td>
                      <td className="px-4 py-3 text-right text-stone-600">{p.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-stone-600">{p.cartAdds.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-stone-600">{p.favouriteCount}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                          ${p.conversionRate >= 10 ? "bg-green-100 text-green-700"
                            : p.conversionRate >= 3 ? "bg-amber-100 text-amber-700"
                            : "bg-stone-100 text-stone-500"}`}>
                          {p.conversionRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-stone-600">₹{p.price}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium ${p.stock === 0 ? "text-red-500" : p.stock <= 5 ? "text-amber-600" : "text-stone-600"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/analytics/product/${p._id}`}
                          className="text-orange-500 hover:text-orange-700 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-stone-400 text-center">
            Select up to 4 products using the checkboxes to compare them side-by-side
          </p>
        </>
      )}
    </div>
  );
};

export default ShopAnalytics;
