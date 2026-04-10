import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { ArrowLeft, BarChart2 } from "lucide-react";

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7"];

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
    <div className="text-center py-20 text-stone-400">
      Select at least 2 products from the
      <Link to="/analytics/shop" className="text-orange-500 hover:underline ml-1">analytics page</Link>.
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
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-800">Compare Products</h1>
          <p className="text-stone-500 text-sm">{data.length} products compared</p>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <BarChart2 className="w-4 h-4" /> Performance Radar
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#f3f4f6" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
            {data.map((d, i) => (
              <Radar
                key={d._id}
                name={d.name}
                dataKey={d.name}
                stroke={COLORS[i]}
                fill={COLORS[i]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}%`, "Relative score"]} />
          </RadarChart>
        </ResponsiveContainer>
        <p className="text-xs text-stone-400 text-center mt-2">
          All metrics normalised to 0–100% relative to the best performer
        </p>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500">Metric</th>
                {data.map((d, i) => (
                  <th key={d._id} className="px-4 py-3 text-right text-xs font-semibold" style={{ color: COLORS[i] }}>
                    {d.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
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
                  <tr key={key} className={`border-b border-stone-100 last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-stone-50/50"}`}>
                    <td className="px-4 py-3 font-medium text-stone-600">{label}</td>
                    {data.map((d, i) => {
                      const isWinner = d[key] === best && best > 0;
                      return (
                        <td key={d._id} className={`px-4 py-3 text-right font-semibold
                          ${isWinner ? "text-green-600" : "text-stone-700"}`}>
                          {fmt(d[key])}
                          {isWinner && <span className="ml-1 text-xs">🏆</span>}
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
          className="flex items-center gap-2 px-5 py-2.5 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to All Products
        </Link>
      </div>
    </div>
  );
};

export default CompareProducts;
