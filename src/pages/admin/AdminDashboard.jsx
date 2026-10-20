import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminStats, toggleShop } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  Users, Store, Package, Star, TrendingUp, AlertCircle,
  UserX, ShieldCheck, RefreshCw, ArrowRight, CheckCircle2,
  ExternalLink, BarChart3, ToggleLeft, ToggleRight
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await getAdminStats();
      setStats(res.data);
      if (isRefresh) toast.success("Dashboard data refreshed");
    } catch {
      toast.error("Failed to load platform stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleToggleShop = async (id, currentStatus) => {
    try {
      await toggleShop(id);
      toast.success(currentStatus ? "Shop deactivated" : "Shop activated");
      fetchStats(true);
    } catch {
      toast.error("Failed to update shop status");
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;
  if (!stats) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-sm">
      <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-slate-800">Failed to load platform statistics</h3>
      <p className="text-sm text-slate-500 mt-1 mb-5">There was an issue communicating with the admin server.</p>
      <button
        onClick={() => fetchStats()}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm transition-colors"
      >
        Retry
      </button>
    </div>
  );

  const activeShopPct = stats.shops.total > 0 ? Math.round((stats.shops.active / stats.shops.total) * 100) : 0;
  const inStockProductPct = stats.products.total > 0 ? Math.round((stats.products.available / stats.products.total) * 100) : 0;
  const customerRatio = stats.users.total > 0 ? Math.round((stats.users.customers / stats.users.total) * 100) : 0;

  const statCards = [
    {
      label: "Total Users",
      value: stats.users.total,
      sub: `${stats.users.customers} customers · ${stats.users.shopkeepers} sellers`,
      icon: Users,
      badge: `${customerRatio}% shoppers`,
      color: "teal",
      link: "/admin/users"
    },
    {
      label: "Live Shops",
      value: stats.shops.active,
      sub: `${stats.shops.inactive} pending/inactive of ${stats.shops.total}`,
      icon: Store,
      badge: `${activeShopPct}% active`,
      color: "emerald",
      link: "/admin/shops"
    },
    {
      label: "Catalog Products",
      value: stats.products.total,
      sub: `${stats.products.available} in stock · ${stats.products.outOfStock} out`,
      icon: Package,
      badge: `${inStockProductPct}% available`,
      color: "blue",
      link: "/admin/products"
    },
    {
      label: "Verified Reviews",
      value: stats.reviews.total,
      sub: "Platform-wide store reviews",
      icon: Star,
      badge: "Community",
      color: "amber",
      link: "/admin/reviews"
    },
    {
      label: "Shopkeepers",
      value: stats.users.shopkeepers,
      sub: `${stats.shops.total} storefronts registered`,
      icon: TrendingUp,
      badge: "Merchants",
      color: "indigo",
      link: "/admin/users"
    },
    {
      label: "Banned / Flagged",
      value: stats.users.banned,
      sub: "Restricted platform accounts",
      icon: UserX,
      badge: stats.users.banned > 0 ? "Action Needed" : "Clean",
      color: stats.users.banned > 0 ? "rose" : "slate",
      link: "/admin/users"
    },
  ];

  const COLOR_THEMES = {
    teal:    { bg: "bg-teal-50 text-teal-600 border-teal-100",   badge: "bg-teal-50 text-teal-700 border-teal-200" },
    emerald: { bg: "bg-emerald-50 text-emerald-600 border-emerald-100", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    blue:    { bg: "bg-sky-50 text-sky-600 border-sky-100",       badge: "bg-sky-50 text-sky-700 border-sky-200" },
    amber:   { bg: "bg-amber-50 text-amber-600 border-amber-100", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    indigo:  { bg: "bg-indigo-50 text-indigo-600 border-indigo-100", badge: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    rose:    { bg: "bg-rose-50 text-rose-600 border-rose-100",     badge: "bg-rose-50 text-rose-700 border-rose-200" },
    slate:   { bg: "bg-slate-50 text-slate-600 border-slate-100",  badge: "bg-slate-50 text-slate-700 border-slate-200" },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> All Services Operational
              </span>
              <span className="text-xs text-slate-400">· Real-time sync</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
              LocalMart Central Command
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Monitor active local storefronts, manage merchant verifications, and audit user activity across your marketplace.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-teal-400" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh Stats"}</span>
            </button>
            <a
              href="/search"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-all"
            >
              <span>View Storefront</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Manage Users",   desc: "Roles & Banning",  to: "/admin/users",     icon: Users },
          { label: "Manage Shops",   desc: "Approvals & Status",to: "/admin/shops",     icon: Store },
          { label: "Audit Catalog",  desc: "Products & Stock",  to: "/admin/products",  icon: Package },
          { label: "Reviews",        desc: "Customer Feedback",to: "/admin/reviews",   icon: Star },
          { label: "Deep Analytics", desc: "Growth Telemetry",  to: "/admin/analytics", icon: BarChart3 },
          { label: "Security",       desc: "Access Controls",   to: "/admin/users",     icon: ShieldCheck },
        ].map((action) => {
          const ActionIcon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="group bg-white p-3.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-200 flex items-center justify-center transition-colors mb-2">
                <ActionIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{action.label}</p>
                <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{action.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, badge, color, link }) => {
          const theme = COLOR_THEMES[color] || COLOR_THEMES.teal;
          return (
            <Link
              key={label}
              to={link}
              className="group bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${theme.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                    {badge}
                  </span>
                </div>
                <p className="text-2xl font-display font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {value}
                </p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 truncate pt-2 border-t border-slate-100">{sub}</p>
            </Link>
          );
        })}
      </div>

      {/* Main Grid: Telemetry, Category Distribution, Recent Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (Col 1) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-teal-600" /> Catalog by Category
            </h2>
            <Link to="/admin/products" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              All Products <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.categoryBreakdown?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
              <Package className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs">No products in catalog yet</p>
            </div>
          ) : (
            <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[320px] pr-1">
              {stats.categoryBreakdown.map(({ _id, count }) => {
                const max = stats.categoryBreakdown[0]?.count || 1;
                const pct = Math.round((count / (stats.products.total || 1)) * 100);
                return (
                  <div key={_id} className="group">
                    <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                      <span className="text-slate-700 font-semibold group-hover:text-teal-700 transition-colors">
                        {_id || "Uncategorized"}
                      </span>
                      <span className="text-slate-500 font-semibold">
                        {count} items <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, (count / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performing Shops (Col 2) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> Top Storefronts
            </h2>
            <Link to="/admin/shops" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              All Shops <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.topShops?.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400">
              <Store className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs">No active shop data yet</p>
            </div>
          ) : (
            <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[320px]">
              {stats.topShops.map((item, i) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                >
                  <span
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border
                    ${i === 0 ? "bg-amber-50 text-amber-800 border-amber-200" :
                      i === 1 ? "bg-slate-100 text-slate-700 border-slate-200" :
                      i === 2 ? "bg-teal-50 text-teal-800 border-teal-200" :
                      "bg-slate-50 text-slate-500 border-slate-100"}`}
                  >
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{item.shop?.name || "Shop"}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.shop?.category || "General"}</p>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full shrink-0">
                    {item.productCount} products
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Ratios / Health Summary (Col 3) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" /> Platform Vital Health
            </h2>

            <div className="space-y-4">
              {/* Shop Activation Rate */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Storefront Activation</span>
                  <span className="text-teal-700 font-bold">{activeShopPct}% Active</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${activeShopPct}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {stats.shops.active} live shops out of {stats.shops.total} registered
                </p>
              </div>

              {/* Product In-Stock Rate */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Inventory Health</span>
                  <span className="text-emerald-700 font-bold">{inStockProductPct}% In Stock</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${inStockProductPct}%` }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {stats.products.available} available items · {stats.products.outOfStock} out of stock
                </p>
              </div>

              {/* Moderation / Safety */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-semibold mb-1">
                  <span className="text-slate-700">Trust & Safety</span>
                  <span className={stats.users.banned > 0 ? "text-amber-700 font-bold" : "text-emerald-700 font-bold"}>
                    {stats.users.banned > 0 ? `${stats.users.banned} Restricted` : "0 Flags"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {stats.users.customers} verified customers and {stats.users.shopkeepers} active shopkeepers.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/admin/analytics"
            className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
          >
            <span>View Full System Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Two-Column: Recent Registrations & Recent Shops with Live Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-600" /> Recent User Registrations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Latest community members and merchants</p>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentUsers?.map((u) => (
              <div key={u._id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs shrink-0 shadow-xs">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize border
                    ${u.role === "shopkeeper"
                      ? "bg-sky-50 text-sky-700 border-sky-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
                  >
                    {u.role}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Shops */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-indigo-600" /> Recent Storefronts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Newly submitted or modified merchant storefronts</p>
            </div>
            <Link to="/admin/shops" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentShops?.map((s) => (
              <div key={s._id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center shrink-0 shadow-xs">
                    <Store className="w-4.5 h-4.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">
                      Owner: {s.owner?.name || "Merchant"} · <span className="font-medium text-slate-600">{s.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleShop(s._id, s.isActive)}
                    title={s.isActive ? "Click to deactivate" : "Click to activate"}
                    className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                      s.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    {s.isActive ? (
                      <>
                        <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3.5 h-3.5 text-amber-600" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
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
