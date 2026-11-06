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
  const idsParam = searchParams.get("ids") || "";
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = idsParam.split(",").filter(Boolean);
    if (ids.length < 2) { setLoading(false); return; }
    API.get(`/analytics/compare?ids=${ids.join(",")}`)
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [idsParam]);

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

      {/* Radar Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-display font-semibold text-slate-800 mb-1">Performance Radar</h2>
        <p className="text-xs text-slate-400 mb-6">Metrics normalised to 100% relative to the best performer in each category</p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 12, fontFamily: "Plus Jakarta Sans" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "transparent",
                  borderRadius: "12px",
                  color: "#fff",
                  fontSize: "12px",
                  fontFamily: "Plus Jakarta Sans",
                }}
                formatter={(val, name) => [`${val}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "Plus Jakarta Sans" }} />
              {data.map((p, i) => (
                <Radar
                  key={p._id}
                  name={p.name}
                  dataKey={p.name}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.25}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800">Detailed Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Metric</th>
                {data.map((p, i) => (
                  <th key={p._id} className="px-6 py-3 text-right">
                    <span className="flex items-center justify-end gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-800 normal-case font-bold">{p.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { label: "Price",           format: (p) => `₹${p.price}` },
                { label: "Stock Units",     format: (p) => `${p.stock} ${p.unit || ""}` },
                { label: "Total Views",     format: (p) => p.views.toLocaleString() },
                { label: "Cart Additions",  format: (p) => p.cartAdds.toLocaleString() },
                { label: "Favourites",      format: (p) => p.favouriteCount.toLocaleString() },
                { label: "Conversion Rate", format: (p) => `${p.conversionRate}%`, bold: true },
              ].map(({ label, format, bold }) => (
                <tr key={label} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-slate-600 font-medium">{label}</td>
                  {data.map((p) => (
                    <td key={p._id}
                      className={`px-6 py-3 text-right ${bold ? "font-bold text-teal-700" : "text-slate-700"}`}>
                      {format(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CompareProducts;
