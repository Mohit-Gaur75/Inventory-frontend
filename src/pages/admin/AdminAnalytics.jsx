import { useState, useEffect } from "react";
import { getAdminStats } from "../../api/axios";
import Loader from "../../components/Loader";
import { BarChart2, Users, Store, Package, Star } from "lucide-react";

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;
  if (!stats)  return <p className="text-slate-400">Failed to load platform analytics.</p>;

  const userRoleData = [
    { label: "Customers",    value: stats.users.customers,    color: "bg-emerald-500", pct: stats.users.total ? Math.round((stats.users.customers / stats.users.total) * 100) : 0 },
    { label: "Shopkeepers",  value: stats.users.shopkeepers,  color: "bg-teal-500",    pct: stats.users.total ? Math.round((stats.users.shopkeepers / stats.users.total) * 100) : 0 },
    { label: "Banned",       value: stats.users.banned,       color: "bg-rose-500",    pct: stats.users.total ? Math.round((stats.users.banned / stats.users.total) * 100) : 0 },
  ];

  const productData = [
    { label: "Available",    value: stats.products.available,  color: "bg-emerald-500" },
    { label: "Out of Stock", value: stats.products.outOfStock, color: "bg-rose-500"   },
  ];
  const maxProduct = Math.max(stats.products.available, stats.products.outOfStock, 1);

  const shopData = [
    { label: "Active Shops",   value: stats.shops.active,   color: "bg-teal-500" },
    { label: "Inactive Shops", value: stats.shops.inactive, color: "bg-slate-300" },
  ];
  const maxShop = Math.max(stats.shops.active, stats.shops.inactive, 1);

  const maxCategory = stats.categoryBreakdown[0]?.count || 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Platform Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Platform health overview and growth telemetry</p>
      </div>

      {/* Top 4 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users",    value: stats.users.total,    icon: Users,    color: "sky"   },
          { label: "Total Shops",    value: stats.shops.total,    icon: Store,    color: "teal"  },
          { label: "Total Products", value: stats.products.total, icon: Package,  color: "emerald" },
          { label: "Total Reviews",  value: stats.reviews.total,  icon: Star,     color: "amber"  },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 text-center shadow-sm">
            <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-3
              ${color==="sky" ? "bg-sky-50 text-sky-600 border border-sky-100" :
                color==="teal" ? "bg-teal-50 text-teal-600 border border-teal-100" :
                color==="emerald" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                "bg-amber-50 text-amber-600 border border-amber-100"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" /> User Breakdown
          </h2>
          <div className="space-y-4">
            {userRoleData.map(({ label, value, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-slate-600">{label}</span>
                  <span className="text-slate-900 font-semibold">{value} ({pct}%)</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Availability */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-5 flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-600" /> Product Availability
          </h2>
          <div className="space-y-4">
            {productData.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-slate-600">{label}</span>
                  <span className="text-slate-900 font-semibold">{value}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${(value / maxProduct) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shop Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-5 flex items-center gap-2">
            <Store className="w-4 h-4 text-teal-600" /> Shop Status
          </h2>
          <div className="space-y-4">
            {shopData.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5 font-medium">
                  <span className="text-slate-600">{label}</span>
                  <span className="text-slate-900 font-semibold">{value}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${(value / maxShop) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-600" /> Products by Category
          </h2>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryBreakdown.map(({ _id, count }) => (
                <div key={_id}>
                  <div className="flex justify-between text-sm mb-1 font-medium">
                    <span className="text-slate-600">{_id}</span>
                    <span className="text-slate-900 font-semibold">{count}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCategory) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Shops by Product Count */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:col-span-2 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Top Shops by Product Count
          </h2>
          {stats.topShops.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.topShops.map((item, i) => (
                <div key={item._id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2
                    ${i===0?"bg-amber-100 text-amber-800":i===1?"bg-slate-200 text-slate-700":i===2?"bg-teal-100 text-teal-800":"bg-slate-100 text-slate-500"}`}>
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.shop.name}</p>
                  <p className="text-xs text-slate-400">{item.shop.category}</p>
                  <p className="text-lg font-display font-bold text-teal-700 mt-1">{item.productCount}</p>
                  <p className="text-xs text-slate-400 font-medium">products</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;