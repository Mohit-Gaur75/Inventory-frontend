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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center">
            <BarChart2 className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Product Analytics</h1>
            <p className="text-slate-500 text-sm">Engagement and conversion metrics for all your catalog products</p>
          </div>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white shadow-sm"
        >
          <option value="views">Sort: Most Viewed</option>
          <option value="cartAdds">Sort: Most Cart Adds</option>
          <option value="favouriteCount">Sort: Most Favourited</option>
          <option value="conversionRate">Sort: Best Conversion</option>
        </select>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white border border-slate-200 rounded-2xl">
          <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No analytics data yet</p>
          <p className="text-xs text-slate-400 mt-1">Metrics will populate as customers view and interact with your products.</p>
        </div>
      ) : (
        <>
          {/* Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Top 8 Products Performance</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="Views"      fill="#0d9488" radius={[4,4,0,0]} />
                <Bar dataKey="Cart Adds"  fill="#0284c7" radius={[4,4,0,0]} />
                <Bar dataKey="Favourites" fill="#f43f5e" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compare banner */}
          {selected.length >= 2 && (
            <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-200 rounded-2xl shadow-sm">
              <p className="text-sm font-semibold text-teal-900">
                {selected.length} products selected for comparison
              </p>
              <Link
                to={`/analytics/compare?ids=${selected.join(",")}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                Compare <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Product Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 w-8">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Product</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 justify-end"><Eye className="w-3.5 h-3.5 text-teal-600" /> Views</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 justify-end"><ShoppingCart className="w-3.5 h-3.5 text-sky-600" /> Cart</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 justify-end"><Heart className="w-3.5 h-3.5 text-rose-500" /> Favs</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 justify-end"><TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Conv%</span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Stock</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sorted.map((p, idx) => (
                    <tr key={p._id}
                      className={`transition-colors
                        ${selected.includes(p._id) ? "bg-teal-50/70" : idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"} hover:bg-slate-50`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(p._id)}
                          onChange={() => toggleSelect(p._id)}
                          disabled={!selected.includes(p._id) && selected.length >= 4}
                          className="rounded accent-teal-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{p.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{p.cartAdds.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{p.favouriteCount}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                          ${p.conversionRate >= 10 ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.conversionRate >= 3 ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-500"}`}>
                          {p.conversionRate}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">₹{p.price}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-semibold ${p.stock === 0 ? "text-rose-600" : p.stock <= 5 ? "text-amber-600" : "text-slate-600"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/analytics/product/${p._id}`}
                          className="text-teal-600 hover:text-teal-800 transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center">
            Select up to 4 products using the checkboxes to compare performance side-by-side
          </p>
        </>
      )}
    </div>
  );
};

export default ShopAnalytics;