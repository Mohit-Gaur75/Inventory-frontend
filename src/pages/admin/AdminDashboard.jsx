import { useState, useEffect } from "react";
import { getAdminStats } from "../../api/axios";
import Loader from "../../components/Loader";
import { Users, Store, Package, Star, TrendingUp, AlertCircle, UserX } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading stats..." />;
  if (!stats)  return <p className="text-slate-400">Failed to load platform stats.</p>;

  const statCards = [
    { label: "Total Users",    value: stats.users.total,      sub: `${stats.users.customers} customers`,        icon: Users,       color: "blue"   },
    { label: "Shopkeepers",    value: stats.users.shopkeepers,sub: `${stats.users.banned} banned`,              icon: UserX,       color: "purple" },
    { label: "Total Shops",    value: stats.shops.total,      sub: `${stats.shops.active} active shops`,        icon: Store,       color: "teal"  },
    { label: "Total Products", value: stats.products.total,   sub: `${stats.products.outOfStock} out of stock`, icon: Package,     color: "emerald" },
    { label: "Reviews",        value: stats.reviews.total,    sub: "Platform-wide reviews",                     icon: Star,        color: "amber"  },
    { label: "Inactive Shops", value: stats.shops.inactive,   sub: "Requires moderation",                       icon: AlertCircle, color: "red"  },
  ];

  const COLOR_MAP = {
    blue:   { bg: "bg-sky-50 text-sky-600 border border-sky-100" },
    purple: { bg: "bg-indigo-50 text-indigo-600 border border-indigo-100" },
    teal:   { bg: "bg-teal-50 text-teal-600 border border-teal-100" },
    emerald:{ bg: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    amber:  { bg: "bg-amber-50 text-amber-600 border border-amber-100" },
    red:    { bg: "bg-rose-50 text-rose-600 border border-rose-100" },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
        <h1 className="font-display font-bold text-2xl sm:text-3xl">Platform Overview</h1>
        <p className="text-teal-100 text-sm mt-1">Welcome to LocalMart Control Center. Monitor live stores, catalog, and user traffic.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-200 hover:shadow-md transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${COLOR_MAP[color].bg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
            <p className="text-xs text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Products by Category */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" /> Products by Category
          </h2>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryBreakdown.map(({ _id, count }) => {
                const max = stats.categoryBreakdown[0].count;
                return (
                  <div key={_id}>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span className="text-slate-600">{_id}</span>
                      <span className="text-slate-900 font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Shops by Products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Top Shops by Products
          </h2>
          {stats.topShops.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.topShops.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0
                    ${i===0?"bg-amber-100 text-amber-800":i===1?"bg-slate-200 text-slate-700":"bg-slate-100 text-slate-500"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.shop.name}</p>
                    <p className="text-xs text-slate-400">{item.shop.category}</p>
                  </div>
                  <span className="text-sm font-bold text-teal-700">{item.productCount} products</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" /> Recent Registrations
          </h2>
          <div className="space-y-2">
            {stats.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold capitalize
                  ${u.role==="shopkeeper"?"bg-sky-50 text-sky-700 border border-sky-200":"bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Shops */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-display font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-indigo-600" /> Recent Shops
          </h2>
          <div className="space-y-2">
            {stats.recentShops.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.owner?.name} · {s.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;