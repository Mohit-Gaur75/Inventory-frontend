import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminStats } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  BarChart2, Users, Store, Package, Star, TrendingUp,
  RefreshCw, ArrowRight, ExternalLink
} from "lucide-react";

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminStats();
      setStats(res.data);
      if (isRefresh) toast.success("Analytics telemetry updated");
    } catch {
      toast.error("Failed to load platform analytics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <Loader text="Loading analytics telemetry..." />;
  if (!stats) return <p className="text-slate-400">Failed to load platform analytics.</p>;

  const totalUsers = stats.users.total || 1;
  const userRoleData = [
    {
      label: "Shoppers / Customers",
      value: stats.users.customers,
      color: "from-emerald-500 to-teal-500",
      pct: Math.round((stats.users.customers / totalUsers) * 100),
    },
    {
      label: "Shopkeepers / Merchants",
      value: stats.users.shopkeepers,
      color: "from-sky-500 to-indigo-500",
      pct: Math.round((stats.users.shopkeepers / totalUsers) * 100),
    },
    {
      label: "Restricted Accounts",
      value: stats.users.banned,
      color: "from-rose-500 to-red-600",
      pct: Math.round((stats.users.banned / totalUsers) * 100),
    },
  ];

  const totalProducts = stats.products.total || 1;
  const inStockPct = Math.round((stats.products.available / totalProducts) * 100);
  const outOfStockPct = 100 - inStockPct;

  const totalShops = stats.shops.total || 1;
  const activeShopPct = Math.round((stats.shops.active / totalShops) * 100);
  const inactiveShopPct = 100 - activeShopPct;

  const maxCategoryCount = stats.categoryBreakdown?.[0]?.count || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Platform Analytics & Health
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Telemetry metrics, catalog distribution, merchant performance, and user adoption rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchStats(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-200 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-teal-600" : ""}`} />
            <span>{refreshing ? "Refreshing..." : "Refresh Telemetry"}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts",    value: stats.users.total,    sub: `${stats.users.customers} shoppers`, icon: Users,    theme: "teal" },
          { label: "Live Storefronts",  value: stats.shops.active,   sub: `${stats.shops.total} registered`,  icon: Store,    theme: "emerald" },
          { label: "Listed Products",   value: stats.products.total, sub: `${stats.products.available} in stock`, icon: Package,  theme: "sky" },
          { label: "Customer Reviews",  value: stats.reviews.total,  sub: "Verified ratings",                 icon: Star,     theme: "amber" },
        ].map(({ label, value, sub, icon: Icon, theme }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  theme === "teal" ? "bg-teal-50 text-teal-600 border-teal-100" :
                  theme === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  theme === "sky" ? "bg-sky-50 text-sky-600 border-sky-100" :
                  "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400">{sub}</span>
            </div>
            <p className="text-3xl font-display font-extrabold text-slate-900">{value}</p>
            <p className="text-xs font-semibold text-slate-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Ratios & Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" /> User Adoption
              </h2>
              <Link to="/admin/users" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Directory ↗
              </Link>
            </div>
            <div className="space-y-4">
              {userRoleData.map(({ label, value, color, pct }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-700 font-semibold">{label}</span>
                    <span className="text-slate-900 font-bold">
                      {value} <span className="text-slate-400 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            Total of {stats.users.total} accounts registered across customer and merchant roles.
          </p>
        </div>

        {/* Storefront Operational Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-emerald-600" /> Storefront Health
              </h2>
              <Link to="/admin/shops" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Moderate ↗
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-700 font-semibold">Operational (Active)</span>
                  <span className="text-emerald-700 font-bold">
                    {stats.shops.active} <span className="text-slate-400 font-normal">({activeShopPct}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(4, activeShopPct)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-700 font-semibold">Paused / Inactive</span>
                  <span className="text-slate-600 font-bold">
                    {stats.shops.inactive} <span className="text-slate-400 font-normal">({inactiveShopPct}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(4, inactiveShopPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            {stats.shops.active} storefronts are currently visible in local customer searches.
          </p>
        </div>

        {/* Inventory In-Stock Ratio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-600" /> Inventory Availability
              </h2>
              <Link to="/admin/products" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                Catalog ↗
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-700 font-semibold">Available In Stock</span>
                  <span className="text-teal-700 font-bold">
                    {stats.products.available} <span className="text-slate-400 font-normal">({inStockPct}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-sky-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(4, inStockPct)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-700 font-semibold">Sold Out / Depleted</span>
                  <span className="text-rose-600 font-bold">
                    {stats.products.outOfStock} <span className="text-slate-400 font-normal">({outOfStockPct}%)</span>
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(4, outOfStockPct)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
            {stats.products.available} products ready for immediate neighborhood delivery or pickup.
          </p>
        </div>
      </div>

      {/* Two-Column: Category Breakdown & Top Storefront Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-teal-600" /> Products by Category
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Platform catalog concentration</p>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
              View Catalog ↗
            </Link>
          </div>

          {stats.categoryBreakdown?.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No category data available yet</div>
          ) : (
            <div className="space-y-3.5">
              {stats.categoryBreakdown.map(({ _id, count }) => {
                const pct = Math.round((count / (stats.products.total || 1)) * 100);
                return (
                  <div key={_id}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-700 font-semibold">{_id || "Uncategorized"}</span>
                      <span className="text-slate-900 font-bold">
                        {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(5, (count / maxCategoryCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Storefronts by Product Count */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> Merchant Catalog Leaders
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Storefronts offering the largest product selection</p>
              </div>
              <Link to="/admin/shops" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                All Shops ↗
              </Link>
            </div>

            {stats.topShops?.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No merchant catalog data yet</div>
            ) : (
              <div className="space-y-3">
                {stats.topShops.map((item, i) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-slate-50/70 transition-all"
                  >
                    <span
                      className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 border ${
                        i === 0 ? "bg-amber-50 text-amber-800 border-amber-200" :
                        i === 1 ? "bg-slate-100 text-slate-700 border-slate-200" :
                        i === 2 ? "bg-teal-50 text-teal-800 border-teal-200" :
                        "bg-slate-50 text-slate-500 border-slate-100"
                      }`}
                    >
                      #{i + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{item.shop?.name || "Store"}</p>
                      <p className="text-[11px] text-slate-400">{item.shop?.category || "General"}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display font-bold text-teal-700 text-sm">
                        {item.productCount}
                      </span>
                      <span className="text-[11px] text-slate-400 block -mt-0.5">items</span>
                    </div>

                    {item.shop?._id && (
                      <Link
                        to={`/shop/${item.shop._id}`}
                        target="_blank"
                        className="p-1 text-slate-400 hover:text-teal-600 transition-colors"
                        title="Open Storefront"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Marketplace telemetry refreshed in real-time</span>
            <Link to="/admin" className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              Back to Dashboard <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
