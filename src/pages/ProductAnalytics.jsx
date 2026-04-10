import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Eye, ShoppingCart, Heart, TrendingUp, ArrowLeft,
  BarChart2, Package,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, color = "orange" }) => {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    blue:   "bg-blue-100 text-blue-600",
    red:    "bg-red-100 text-red-600",
    green:  "bg-green-100 text-green-600",
  };
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-display font-bold text-stone-800">{value}</p>
      <p className="text-sm font-medium text-stone-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
};

const ProductAnalyticsPage = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await API.get(`/analytics/product/${id}`);
        setData(res);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load analytics");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) return <Loader text="Loading analytics..." />;
  if (!data)   return null;

  const viewChartData = data.viewHistory.slice(-30).map((v) => ({
    date:  new Date(v.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    Views: v.count,
  }));

  const priceChartData = data.product.priceHistory.slice(-20).map((p) => ({
    date:  new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    "Price ₹": p.price,
  }));

  const stockChartData = data.stockHistory.slice(-20).map((s) => ({
    date:  new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    Stock: s.stock,
    Change: s.delta,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/dashboard")}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-stone-200 hover:bg-stone-50 transition-colors">
          <ArrowLeft className="w-4 h-4 text-stone-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-stone-800">
            {data.product.name}
          </h1>
          <p className="text-stone-500 text-sm">Product Analytics</p>
        </div>
        <Link to="/analytics/shop"
          className="flex items-center gap-1.5 text-sm text-orange-600 hover:underline">
          <BarChart2 className="w-4 h-4" /> All Products
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          label="Total Views"
          value={data.views.toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={ShoppingCart}
          label="Cart Adds"
          value={data.cartAdds.toLocaleString()}
          sub={`${data.conversionRate}% conversion`}
          color="orange"
        />
        <StatCard
          icon={Heart}
          label="Favourites"
          value={data.favouriteCount.toLocaleString()}
          color="red"
        />
        <StatCard
          icon={TrendingUp}
          label="Current Price"
          value={`₹${data.product.currentPrice}`}
          sub={`${data.product.priceHistory.length} price changes`}
          color="green"
        />
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-500" /> Views — Last 30 Days
        </h3>
        {viewChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={viewChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="Views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-stone-400 text-sm">
            No view data yet
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" /> Price History
        </h3>
        {priceChartData.length > 1 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={priceChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`₹${v}`, "Price"]} />
              <Line
                type="monotone"
                dataKey="Price ₹"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-stone-400 text-sm">
            No price history yet — update the price to start tracking
          </div>
        )}
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-orange-500" /> Stock Movement
        </h3>
        {stockChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stockChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="Stock"  stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Change" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-stone-400 text-sm">
            No stock history yet — update stock to start tracking
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductAnalyticsPage;
