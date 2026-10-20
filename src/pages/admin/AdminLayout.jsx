import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Store, Package,
  Star, BarChart2, LogOut, ShoppingBag, Menu, X, ExternalLink, ShieldCheck
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/admin",           label: "Dashboard",  icon: LayoutDashboard, end: true  },
  { to: "/admin/users",     label: "Users",      icon: Users                       },
  { to: "/admin/shops",     label: "Shops",      icon: Store                       },
  { to: "/admin/products",  label: "Products",   icon: Package                     },
  { to: "/admin/reviews",   label: "Reviews",    icon: Star                        },
  { to: "/admin/analytics", label: "Analytics",  icon: BarChart2                   },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const currentNav = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) || NAV_ITEMS[0];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand header */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-900/40">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-base tracking-tight leading-tight">LocalMart</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px] text-teal-400 font-semibold tracking-wide uppercase">Admin Portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="px-3 pt-4 pb-2">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Navigation</p>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* View Public Site Quick Link */}
      <div className="px-3 py-2">
        <a
          href="/search"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-950/40 border border-teal-900/50 hover:bg-teal-900/40 transition-all"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5" /> View Marketplace
          </span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* User profile & logout */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Administrator"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" title="Super Admin" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Log Out of Portal
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 shrink-0 shadow-xl z-20">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn">
          <div className="w-64 bg-slate-900 flex flex-col shadow-2xl">
            <div className="flex justify-end p-2 border-b border-slate-800">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">Admin Console</p>
              <h1 className="font-display font-bold text-slate-900 text-base sm:text-lg truncate">
                {currentNav.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </span>

            <a
              href="/search"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-teal-700 bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 px-3 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Storefront</span>
            </a>

            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;