import { useState, useEffect } from "react";
import { getMyProducts, getMyShop } from "../api/axios";
import Loader from "../components/Loader";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Bar, Line, Doughnut, Radar } from "react-chartjs-2";
import { BarChart2, TrendingUp, Package, AlertCircle, Star, Tag, DollarSign } from "lucide-react";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom", labels: { font: { family: "Plus Jakarta Sans", size: 11 }, padding: 16 } },
    tooltip: { backgroundColor: "#0f172a", titleFont: { family: "Plus Jakarta Sans" }, bodyFont: { family: "Plus Jakarta Sans" }, padding: 10, cornerRadius: 8 },
  },
};

const Analytics = () => {
  const [products, setProducts] = useState([]);
  const [shop, setShop]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, sRes] = await Promise.all([getMyProducts(), getMyShop()]);
        setProducts(pRes.data);
        setShop(sRes.data);
      } catch { setProducts([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  const totalProducts  = products.length;
  const totalStock     = products.reduce((s, p) => s + p.stock, 0);
  const totalValue     = products.reduce((s, p) => s + p.price * p.stock, 0);
  const avgPrice       = totalProducts ? (products.reduce((s, p) => s + p.price, 0) / totalProducts).toFixed(0) : 0;
  const maxPrice       = totalProducts ? Math.max(...products.map(p => p.price)) : 0;
  const minPrice       = totalProducts ? Math.min(...products.map(p => p.price)) : 0;
  const outOfStock     = products.filter(p => !p.isAvailable).length;
  const lowStock       = products.filter(p => p.isAvailable && p.stock <= 5).length;
  const inStock        = products.filter(p => p.isAvailable && p.stock > 5).length;

  const categoryMap = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const topByValue = [...products].sort((a, b) => (b.price * b.stock) - (a.price * a.stock)).slice(0, 8);
  const topByPrice = [...products].sort((a, b) => b.price - a.price).slice(0, 8);

  const stockBuckets = {
    "Out (0)":    products.filter(p => p.stock === 0).length,
    "Low (1-5)":  products.filter(p => p.stock >= 1 && p.stock <= 5).length,
    "Med (6-20)": products.filter(p => p.stock >= 6 && p.stock <= 20).length,
    "High (21+)": products.filter(p => p.stock > 20).length,
  };

  const priceRanges = {
    "₹0-50":    products.filter(p => p.price <= 50).length,
    "₹51-100":  products.filter(p => p.price > 50  && p.price <= 100).length,
    "₹101-500": products.filter(p => p.price > 100 && p.price <= 500).length,
    "₹500+":    products.filter(p => p.price > 500).length,
  };

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  });

  const avgPriceTrend = last7Days.map(() => {
    const base = parseFloat(avgPrice);
    const variance = (Math.random() - 0.5) * base * 0.1;
    return Math.max(0, base + variance).toFixed(0);
  });

  const inventoryValueTrend = last7Days.map(() => {
    const base = totalValue;
    const variance = (Math.random() - 0.5) * base * 0.05;
    return Math.max(0, base + variance).toFixed(0);
  });

  const categoryChartData = {
    labels: Object.keys(categoryMap),
    datasets: [{
      data: Object.values(categoryMap),
      backgroundColor: [
        "#0d9488", "#0284c7", "#10b981", "#6366f1",
        "#f59e0b", "#ec4899", "#64748b", "#14b8a6",
      ],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const stockChartData = {
    labels: topByValue.map(p => p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name),
    datasets: [{
      label: "Stock Quantity",
      data: topByValue.map(p => p.stock),
      backgroundColor: topByValue.map(p =>
        p.stock === 0 ? "#fda4af" :
        p.stock <= 5  ? "#fde68a" : "#6ee7b7"
      ),
      borderRadius: 6,
      borderWidth: 0,
    }],
  };

  const priceChartData = {
    labels: topByPrice.map(p => p.name.length > 12 ? p.name.slice(0, 12) + "..." : p.name),
    datasets: [{
      label: "Price (₹)",
      data: topByPrice.map(p => p.price),
      backgroundColor: "#0d9488",
      borderRadius: 6,
      borderWidth: 0,
    }],
  };

  const priceTrendData = {
    labels: last7Days,
    datasets: [
      {
        label: "Avg Price (₹)",
        data: avgPriceTrend,
        borderColor: "#0d9488",
        backgroundColor: "rgba(13, 148, 136, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#0d9488",
        pointRadius: 4,
      },
    ],
  };

  const inventoryValueData = {
    labels: last7Days,
    datasets: [{
      label: "Inventory Value (₹)",
      data: inventoryValueTrend,
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#10b981",
      pointRadius: 4,
    }],
  };

  const stockDistData = {
    labels: Object.keys(stockBuckets),
    datasets: [{
      data: Object.values(stockBuckets),
      backgroundColor: ["#fda4af", "#fde68a", "#bae6fd", "#6ee7b7"],
      borderWidth: 2,
      borderColor: "#fff",
    }],
  };

  const priceRangeData = {
    labels: Object.keys(priceRanges),
    datasets: [{
      label: "Number of Products",
      data: Object.values(priceRanges),
      backgroundColor: ["#ccfbf1", "#99f6e4", "#5eead4", "#0d9488"],
      borderRadius: 6,
      borderWidth: 0,
    }],
  };

  const radarData = {
    labels: Object.keys(categoryMap).slice(0, 6),
    datasets: [{
      label: "Products",
      data: Object.values(categoryMap).slice(0, 6),
      backgroundColor: "rgba(13, 148, 136, 0.2)",
      borderColor: "#0d9488",
      pointBackgroundColor: "#0d9488",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "#0d9488",
    }],
  };

  const tabs = [
    { id: "overview",   label: "Overview"   },
    { id: "products",   label: "Products"   },
    { id: "pricing",    label: "Pricing"    },
    { id: "trends",     label: "Trends"     },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-center">
          <BarChart2 className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Analytics & Insights</h1>
          <p className="text-slate-500 text-sm">{shop?.name ? `${shop.name} · ` : ""}Inventory & performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products",    value: totalProducts,                     icon: Package,    color: "blue",   sub: `${totalStock} units · ${lowStock} low`         },
          { label: "Inventory Value",   value: `₹${totalValue.toLocaleString()}`,  icon: DollarSign, color: "teal",   sub: "retail value"                 },
          { label: "Out of Stock",      value: outOfStock,                        icon: AlertCircle,color: "red",    sub: `${inStock} in stock`            },
          { label: "Avg. Price",        value: `₹${avgPrice}`,                    icon: Tag,        color: "emerald",sub: `₹${minPrice} – ₹${maxPrice}`   },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3
              ${color==="blue"?"bg-sky-50 text-sky-600 border border-sky-100":
                color==="teal"?"bg-teal-50 text-teal-600 border border-teal-100":
                color==="red"?"bg-rose-50 text-rose-600 border border-rose-100":
                "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all
              ${activeTab === id
                ? "bg-white text-teal-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-600" /> Products by Category
            </h2>
            {Object.keys(categoryMap).length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No products yet</p>
            ) : (
              <div style={{ height: "260px" }}>
                <Doughnut data={categoryChartData} options={{ ...defaultOptions, cutout: "65%" }} />
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-sky-600" /> Stock Distribution
            </h2>
            <div style={{ height: "260px" }}>
              <Doughnut data={stockDistData} options={{ ...defaultOptions, cutout: "65%" }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Category Performance Radar
            </h2>
            {Object.keys(categoryMap).length < 3 ? (
              <p className="text-slate-400 text-sm text-center py-8">Add products in 3+ categories to view radar</p>
            ) : (
              <div style={{ height: "260px" }}>
                <Radar data={radarData} options={{
                  ...defaultOptions,
                  scales: {
                    r: {
                      ticks: { display: false },
                      grid: { color: "rgba(0,0,0,0.05)" },
                      pointLabels: { font: { family: "Plus Jakarta Sans", size: 11 } },
                    },
                  },
                }} />
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" /> Price Range Distribution
            </h2>
            <div style={{ height: "260px" }}>
              <Bar data={priceRangeData} options={{
                ...defaultOptions,
                plugins: { ...defaultOptions.plugins, legend: { display: false } },
                scales: {
                  y: { ticks: { font: { family: "Plus Jakarta Sans" } }, grid: { color: "rgba(0,0,0,0.05)" } },
                  x: { ticks: { font: { family: "Plus Jakarta Sans" } }, grid: { display: false } },
                },
              }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" /> Stock Levels — Top 8 Products
            </h2>
            {products.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No products yet</p>
            ) : (
              <div style={{ height: "300px" }}>
                <Bar data={stockChartData} options={{
                  ...defaultOptions,
                  plugins: {
                    ...defaultOptions.plugins,
                    legend: { display: false },
                    tooltip: {
                      ...defaultOptions.plugins.tooltip,
                      callbacks: {
                        afterLabel: (ctx) => {
                          const prod = topByValue[ctx.dataIndex];
                          return `Unit: ${prod?.unit || "piece"}`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: { font: { family: "Plus Jakarta Sans" } },
                      grid: { color: "rgba(0,0,0,0.05)" },
                      title: { display: true, text: "Units in Stock", font: { family: "Plus Jakarta Sans" } },
                    },
                    x: {
                      ticks: { font: { family: "Plus Jakarta Sans", size: 11 }, maxRotation: 30 },
                      grid: { display: false },
                    },
                  },
                }} />
              </div>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-300 inline-block" /> Out of Stock</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-300 inline-block" /> Low Stock (≤5)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-300 inline-block" /> In Stock</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Top 5 by Inventory Value
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Rank</th>
                    <th className="px-4 py-2.5 text-left">Product</th>
                    <th className="px-4 py-2.5 text-left">Category</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                    <th className="px-4 py-2.5 text-right">Stock</th>
                    <th className="px-4 py-2.5 text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...products]
                    .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
                    .slice(0, 5)
                    .map((p, i) => (
                      <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${i === 0 ? "bg-amber-100 text-amber-800" : i === 1 ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-500"}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{p.name}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{p.category}</td>
                        <td className="px-4 py-3 text-right text-teal-700 font-bold">₹{p.price}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{p.stock} {p.unit}</td>
                        <td className="px-4 py-3 text-right text-emerald-700 font-bold">
                          ₹{(p.price * p.stock).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-600" /> Price Comparison — Top 8 Products
            </h2>
            <div style={{ height: "300px" }}>
              <Bar data={priceChartData} options={{
                ...defaultOptions,
                plugins: { ...defaultOptions.plugins, legend: { display: false } },
                scales: {
                  y: {
                    ticks: {
                      font: { family: "Plus Jakarta Sans" },
                      callback: (v) => `₹${v}`,
                    },
                    grid: { color: "rgba(0,0,0,0.05)" },
                  },
                  x: {
                    ticks: { font: { family: "Plus Jakarta Sans", size: 11 }, maxRotation: 30 },
                    grid: { display: false },
                  },
                },
              }} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Highest Price",  value: `₹${maxPrice}`, product: products.find(p => p.price === maxPrice)?.name, color: "rose"    },
              { label: "Average Price",  value: `₹${avgPrice}`, product: "Across all products",                          color: "teal" },
              { label: "Lowest Price",   value: `₹${minPrice}`, product: products.find(p => p.price === minPrice)?.name, color: "emerald"  },
            ].map(({ label, value, product, color }) => (
              <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
                <p className={`text-3xl font-display font-bold
                  ${color === "rose" ? "text-rose-600" : color === "emerald" ? "text-emerald-600" : "text-teal-600"}`}>
                  {value}
                </p>
                <p className="text-sm font-semibold text-slate-800 mt-1">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{product}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" /> Average Price Trend (Last 7 Days)
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium border border-slate-200">
                Simulated data
              </span>
            </div>
            <div style={{ height: "260px" }}>
              <Line data={priceTrendData} options={{
                ...defaultOptions,
                plugins: { ...defaultOptions.plugins, legend: { display: false } },
                scales: {
                  y: {
                    ticks: { font: { family: "Plus Jakarta Sans" }, callback: (v) => `₹${v}` },
                    grid: { color: "rgba(0,0,0,0.05)" },
                  },
                  x: {
                    ticks: { font: { family: "Plus Jakarta Sans" } },
                    grid: { display: false },
                  },
                },
              }} />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Inventory Value Trend (Last 7 Days)
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium border border-slate-200">
                Simulated data
              </span>
            </div>
            <div style={{ height: "260px" }}>
              <Line data={inventoryValueData} options={{
                ...defaultOptions,
                plugins: { ...defaultOptions.plugins, legend: { display: false } },
                scales: {
                  y: {
                    ticks: {
                      font: { family: "Plus Jakarta Sans" },
                      callback: (v) => `₹${Number(v).toLocaleString()}`,
                    },
                    grid: { color: "rgba(0,0,0,0.05)" },
                  },
                  x: {
                    ticks: { font: { family: "Plus Jakarta Sans" } },
                    grid: { display: false },
                  },
                },
              }} />
            </div>
          </div>

          <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4">
            <p className="text-sm text-teal-900 font-semibold">📊 About Trend Data</p>
            <p className="text-xs text-teal-700 mt-1">
              Trend charts illustrate movement patterns across your catalog.
              All metrics update dynamically with your inventory updates.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;