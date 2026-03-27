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
  if (!stats)  return <p className="text-stone-400">Failed to load analytics.</p>;


  const userRoleData = [
    { label: "Customers",    value: stats.users.customers,    color: "bg-green-400",  pct: stats.users.total ? Math.round((stats.users.customers / stats.users.total) * 100) : 0 },
    { label: "Shopkeepers",  value: stats.users.shopkeepers,  color: "bg-blue-400",   pct: stats.users.total ? Math.round((stats.users.shopkeepers / stats.users.total) * 100) : 0 },
    { label: "Banned",       value: stats.users.banned,       color: "bg-red-400",    pct: stats.users.total ? Math.round((stats.users.banned / stats.users.total) * 100) : 0 },
  ];

  const productData = [
    { label: "Available",    value: stats.products.available,  color: "bg-green-400" },
    { label: "Out of Stock", value: stats.products.outOfStock, color: "bg-red-400"   },
  ];
  const maxProduct = Math.max(stats.products.available, stats.products.outOfStock, 1);

  const shopData = [
    { label: "Active Shops",   value: stats.shops.active,   color: "bg-green-400" },
    { label: "Inactive Shops", value: stats.shops.inactive, color: "bg-stone-300" },
  ];
  const maxShop = Math.max(stats.shops.active, stats.shops.inactive, 1);

  const maxCategory = stats.categoryBreakdown[0]?.count || 1;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-stone-800">Platform Analytics</h1>
        <p className="text-stone-500 text-sm mt-1">Complete platform health overview</p>
      </div>

     
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users",    value: stats.users.total,    icon: Users,    color: "blue"   },
          { label: "Total Shops",    value: stats.shops.total,    icon: Store,    color: "green"  },
          { label: "Total Products", value: stats.products.total, icon: Package,  color: "orange" },
          { label: "Total Reviews",  value: stats.reviews.total,  icon: Star,     color: "amber"  },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5 text-center">
            <p className="text-3xl font-display font-bold text-stone-800">{value}</p>
            <p className="text-sm text-stone-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-5 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> User Breakdown
          </h2>
          <div className="space-y-4">
            {userRoleData.map(({ label, value, color, pct }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-stone-600">{label}</span>
                  <span className="font-semibold text-stone-700">{value} ({pct}%)</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-5 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" /> Product Availability
          </h2>
          <div className="space-y-4">
            {productData.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-stone-600">{label}</span>
                  <span className="font-semibold text-stone-700">{value}</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${(value / maxProduct) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-5 flex items-center gap-2">
            <Store className="w-4 h-4 text-green-500" /> Shop Status
          </h2>
          <div className="space-y-4">
            {shopData.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-stone-600">{label}</span>
                  <span className="font-semibold text-stone-700">{value}</span>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all duration-700`}
                    style={{ width: `${(value / maxShop) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-5 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-500" /> Products by Category
          </h2>
          {stats.categoryBreakdown.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryBreakdown.map(({ _id, count }) => (
                <div key={_id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">{_id}</span>
                    <span className="font-semibold text-stone-700">{count}</span>
                  </div>
                  <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-400 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCategory) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:col-span-2">
          <h2 className="font-display font-semibold text-lg text-stone-800 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Top Shops by Product Count
          </h2>
          {stats.topShops.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">No data yet</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {stats.topShops.map((item, i) => (
                <div key={item._id} className="bg-stone-50 rounded-xl p-4 text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2
                    ${i===0?"bg-amber-100 text-amber-700":i===1?"bg-stone-200 text-stone-600":i===2?"bg-orange-100 text-orange-600":"bg-stone-100 text-stone-400"}`}>
                    {i + 1}
                  </div>
                  <p className="text-sm font-semibold text-stone-700 truncate">{item.shop.name}</p>
                  <p className="text-xs text-stone-400">{item.shop.category}</p>
                  <p className="text-lg font-display font-bold text-green-600 mt-1">{item.productCount}</p>
                  <p className="text-xs text-stone-400">products</p>
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