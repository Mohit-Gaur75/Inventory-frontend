import { useState, useEffect } from "react";
import { getAdminStats } from "../../api/axios";
import Loader from "../../components/Loader";
import { Users, Store, Package, Star, TrendingUp, AlertCircle, UserX, ShoppingBag } from "lucide-react";

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
  if (!stats)  return <p className="text-stone-400">Failed to load stats.</p>;

  const statCards = [
    { label: "Total Users",    value: stats.users.total,      sub: `${stats.users.customers} customers`,     icon: Users,     color: "blue"   },
    { label: "Shopkeepers",    value: stats.users.shopkeepers,sub: `${stats.users.banned} banned`,           icon: UserX,     color: "purple" },
    { label: "Total Shops",    value: stats.shops.total,      sub: `${stats.shops.active} active`,           icon: Store,     color: "green"  },
    { label: "Total Products", value: stats.products.total,   sub: `${stats.products.outOfStock} out of stock`, icon: Package, color: "orange" },
    { label: "Reviews",        value: stats.reviews.total,    sub: "platform-wide",                          icon: Star,      color: "amber"  },
    { label: "Inactive Shops", value: stats.shops.inactive,   sub: "need attention",                         icon: AlertCircle, color: "red"  },
  ];

  const COLOR_MAP = {
    blue:   { bg: "bg-blue-100",   text: "text-blue-600"   },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    green:  { bg: "bg-green-100",  text: "text-green-600"  },
    orange: { bg: "bg-orange-100", text: "text-orange-500" },
    amber:  { bg: "bg-amber-100",  text: "text-amber-600"  },
    red:    { bg: "bg-red-100",    text: "text-red-500"    },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-stone-800">Platform Overview</h1>
        <p className="text-stone-500 text-sm mt-1">Welcome back, Admin. Here's what's happening.</p>
      </div>

 
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${COLOR_MAP[color].bg}`}>
              <Icon className={`w-4 h-4 ${COLOR_MAP[color].text}`} />
            </div>
            <p className="text-2xl font-display font-bold text-stone-800">{value}</p>
            <p className="text-xs font-medium text-stone-600 mt-0.5">{label}</p>
            <p className="text-xs text-stone-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" /> Products by Category
          </h2>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryBreakdown.map(({ _id, count }) => {
                const max = stats.categoryBreakdown[0].count;
                return (
                  <div key={_id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-stone-600">{_id}</span>
                      <span className="font-semibold text-stone-700">{count}</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full"
                        style={{ width: `${(count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

    
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" /> Top Shops by Products
          </h2>
          {stats.topShops.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.topShops.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0
                    ${i===0?"bg-amber-100 text-amber-700":i===1?"bg-stone-100 text-stone-600":"bg-stone-50 text-stone-400"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">{item.shop.name}</p>
                    <p className="text-xs text-stone-400">{item.shop.category}</p>
                  </div>
                  <span className="text-sm font-bold text-green-600">{item.productCount} products</span>
                </div>
              ))}
            </div>
          )}
        </div>

    
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> Recent Registrations
          </h2>
          <div className="space-y-2">
            {stats.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{u.name}</p>
                  <p className="text-xs text-stone-400 truncate">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize
                  ${u.role==="shopkeeper"?"bg-blue-100 text-blue-700":"bg-green-100 text-green-700"}`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

  
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-4 flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-500" /> Recent Shops
          </h2>
          <div className="space-y-2">
            {stats.recentShops.map((s) => (
              <div key={s._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50">
                <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">{s.name}</p>
                  <p className="text-xs text-stone-400">{s.owner?.name} · {s.category}</p>
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