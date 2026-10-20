import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { ArrowLeft, BarChart2 } from "lucide-react";

const COLORS = ["#0d9488", "#0284c7", "#10b981", "#8b5cf6"];

const CompareProducts = () => {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get("ids")?.split(",").filter(Boolean) || [];
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) { setLoading(false); return; }
    API.get(`/analytics/compare?ids=${ids.join(",")}`)
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading comparison..." />;
  if (data.length < 2) return (
    <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
      <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-700 font-semibold mb-1">Select Products to Compare</p>
      <p className="text-slate-400 text-xs mb-4">Please select at least 2 products from your product analytics inventory.</p>
      <Link to="/analytics/shop" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
        <ArrowLeft className="w-4 h-4" /> Go to Analytics
      </Link>
    </div>
  );

  const metrics = ["views", "cartAdds", "favouriteCount", "conversionRate"];
  const metricLabels = { views: "Views", cartAdds: "Cart Adds", favouriteCount: "Favourites", conversionRate: "Conv %" };

  const maxes = {};
  metrics.forEach((m) => { maxes[m] = Math.max(...data.map((d) => d[m] || 0), 1); });

  const radarData = metrics.map((m) => ({
    metric: metricLabels[m],
    ...Object.fromEntries(data.map((d) => [d.name, parseFloat(((d[m] / maxes[m]) * 100).toFixed(1))])),
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/analytics/shop"
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Compare Products</h1>
          <p className="text-slate-500 text-sm">{data.length} products compared side-by-side</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-teal-600" /> Relative Performance Radar
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#f1f5f9" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
            {data.map((d, i) => (
              <Radar
                key={d._id}
                name={d.name}
                dataKey={d.name}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                borderRadius: "0.75rem",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(v) => [`${v}%`, "Relative score"]}
            />
          </RadarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 text-center mt-3">
          All metrics normalized to 0–100% relative to the best performer across your selection
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Metric</th>
                {data.map((d, i) => (
                  <th key={d._id} className="px-4 py-3 text-right text-xs font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { key: "price",          label: "Price",         fmt: (v) => `₹${v}` },
                { key: "stock",          label: "Stock",         fmt: (v) => v },
                { key: "views",          label: "Total Views",   fmt: (v) => v.toLocaleString() },
                { key: "cartAdds",       label: "Cart Adds",     fmt: (v) => v.toLocaleString() },
                { key: "favouriteCount", label: "Favourites",    fmt: (v) => v },
                { key: "conversionRate", label: "Conversion %",  fmt: (v) => `${v}%` },
              ].map(({ key, label, fmt }, idx) => {
                const values = data.map((d) => d[key]);
                const best   = Math.max(...values);
                return (
                  <tr key={key} className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                    <td className="px-4 py-3 font-semibold text-slate-700">{label}</td>
                    {data.map((d) => {
                      const isWinner = d[key] === best && best > 0;
                      return (
                        <td key={d._id} className={`px-4 py-3 text-right font-semibold
                          ${isWinner ? "text-emerald-600" : "text-slate-700"}`}>
                          {fmt(d[key])}
                          {isWinner && <span className="ml-1 text-xs">⭐</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <Link to="/analytics/shop"
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back to All Products
        </Link>
      </div>
    </div>
  );
};

export default CompareProducts;