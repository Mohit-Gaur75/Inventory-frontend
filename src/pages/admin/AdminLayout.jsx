import { NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Store, Package,
  Star, BarChart2, LogOut, ShoppingBag, Menu, X
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
  
      <div className="px-6 py-5 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm">LocalMart</p>
            <p className="text-xs text-stone-400">Admin Panel</p>
          </div>
        </div>
      </div>


      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? "bg-orange-500 text-white"
                : "text-stone-400 hover:text-white hover:bg-stone-800"}`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-stone-800 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">

      
      <aside className="hidden md:flex flex-col w-56 bg-stone-900 shrink-0">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-56 bg-stone-900 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

    
      <div className="flex-1 flex flex-col overflow-hidden">
      
        <header className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="w-5 h-5 text-stone-600" />
          </button>
          <span className="font-display font-bold text-stone-800">Admin Panel</span>
        </header>

  
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;