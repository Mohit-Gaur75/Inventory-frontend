import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth }          from "../context/AuthContext";
import { useCart }          from "../context/CartContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationBell     from "./NotificationBell";
import SearchBar            from "./SearchBar";
import {
  ShoppingBag, LayoutDashboard, LogOut,
  LogIn, Menu, X, Heart, BarChart2, Map,
  ShoppingCart, UserCircle, Upload, FileDown,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout }   = useAuth();
  const { cartCount }      = useCart();
  const { unreadCount }    = useNotifications();
  const navigate           = useNavigate();
  const location           = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  const handleSearch = (q) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-900 group-hover:text-teal-700 transition-colors">LocalMart</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar onSearch={handleSearch} placeholder="Search products…" />
          </div>

          
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Link to="/map"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive("/map") ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
              <Map className="w-4 h-4" /> Map
            </Link>

            {user?.role === "customer" && (
              <>
                <Link to="/favourites"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive("/favourites") ? "bg-red-50 text-red-500 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
                  <Heart className="w-4 h-4" /> Favourites
                </Link>
                <Link to="/cart"
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive("/cart") ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
                  <ShoppingCart className="w-4 h-4" /> Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-teal-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user?.role === "shopkeeper" && (
              <>
                <Link to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive("/dashboard") ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/analytics"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive("/analytics") ? "bg-purple-50 text-purple-600 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
                  <BarChart2 className="w-4 h-4" /> Analytics
                </Link>
                <Link to="/import"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive("/import") ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
                  <Upload className="w-4 h-4" /> Import
                </Link>
                <Link to="/export"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive("/export") ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
                  <FileDown className="w-4 h-4" /> Export
                </Link>
              </>
            )}

            {user ? (
              <>
                <NotificationBell unreadCount={unreadCount} />
                <Link to="/profile"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive("/profile") ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:-translate-y-0.5"}`}>
                  <UserCircle className="w-4 h-4" />
                  <span className="max-w-[80px] truncate">{user.name?.split(" ")[0]}</span>
                </Link>
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-500 hover:-translate-y-0.5 transition-all duration-200">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
          </div>

          
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
            {menuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3 border-t border-slate-100 pt-3 animate-in slide-in-from-top duration-300">
            <SearchBar onSearch={handleSearch} placeholder="Search products…" className="w-full" />

            <div className="flex flex-col gap-1">
              <MobileLink to="/map"           label="Map"         icon={<Map className="w-4 h-4" />}            active={isActive("/map")} onClick={() => setMenuOpen(false)} />
              {user?.role === "customer" && (
                <>
                  <MobileLink to="/favourites" label="Favourites"  icon={<Heart className="w-4 h-4" />}         active={isActive("/favourites")} onClick={() => setMenuOpen(false)} />
                  <MobileLink to="/cart"        label={`Cart ${cartCount > 0 ? `(${cartCount})` : ""}`} icon={<ShoppingCart className="w-4 h-4" />} active={isActive("/cart")} onClick={() => setMenuOpen(false)} />
                </>
              )}
              
              {user?.role === "shopkeeper" && (
                <>
                  <MobileLink to="/dashboard"  label="Dashboard"   icon={<LayoutDashboard className="w-4 h-4" />} active={isActive("/dashboard")} onClick={() => setMenuOpen(false)} />
                  <MobileLink to="/analytics"  label="Analytics"   icon={<BarChart2 className="w-4 h-4" />}      active={isActive("/analytics")} onClick={() => setMenuOpen(false)} />
                 
                  <MobileLink to="/import"     label="Bulk Import" icon={<Upload className="w-4 h-4" />}         active={isActive("/import")} onClick={() => setMenuOpen(false)} />
                
                  <MobileLink to="/export"     label="Export Reports" icon={<FileDown className="w-4 h-4" />}    active={isActive("/export")} onClick={() => setMenuOpen(false)} />
                </>
              )}
              {user ? (
                <>
                  <MobileLink to="/notifications" label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`} icon={<span />} active={isActive("/notifications")} onClick={() => setMenuOpen(false)} />
                  <MobileLink to="/profile"        label="Profile"  icon={<UserCircle className="w-4 h-4" />}    active={isActive("/profile")} onClick={() => setMenuOpen(false)} />
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <MobileLink to="/login" label="Login" icon={<LogIn className="w-4 h-4" />} active={isActive("/login")} onClick={() => setMenuOpen(false)} />
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const MobileLink = ({ to, label, icon, active, onClick }) => (
  <Link to={to} onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
      ${active ? "bg-teal-50 text-teal-700 shadow-sm" : "text-slate-700 hover:bg-slate-100 hover:translate-x-1"}`}>
    {icon}{label}
  </Link>
);

export default Navbar;
