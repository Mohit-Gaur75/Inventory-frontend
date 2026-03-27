import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";
import {
  ShoppingBag, Search, LayoutDashboard, LogOut,
  LogIn, Menu, X, Heart, BarChart2, Map,
  ShoppingCart, UserCircle
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount }    = useCart();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

         
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-stone-800">LocalMart</span>
          </Link>

        
          <div className="hidden md:flex items-center gap-1">
            <Link to="/search"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive("/search") ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:bg-stone-100"}`}>
              <Search className="w-4 h-4" /> Search
            </Link>

            <Link to="/map"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive("/map") ? "bg-blue-50 text-blue-600" : "text-stone-600 hover:bg-stone-100"}`}>
              <Map className="w-4 h-4" /> Map
            </Link>

       
            {user?.role === "customer" && (
              <>
                <Link to="/favourites"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive("/favourites") ? "bg-red-50 text-red-500" : "text-stone-600 hover:bg-stone-100"}`}>
                  <Heart className="w-4 h-4" /> Favourites
                </Link>
                <Link to="/cart"
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive("/cart") ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:bg-stone-100"}`}>
                  <ShoppingCart className="w-4 h-4" /> Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

          
            {user?.role === "shopkeeper" && (
              <>
                <Link to="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive("/dashboard") ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:bg-stone-100"}`}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/analytics"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive("/analytics") ? "bg-purple-50 text-purple-600" : "text-stone-600 hover:bg-stone-100"}`}>
                  <BarChart2 className="w-4 h-4" /> Analytics
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                <NotificationBell />

                <Link to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-stone-700">{user.name}</span>
                  <span className="text-xs text-stone-400 capitalize">({user.role})</span>
                </Link>

                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 ml-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
                <LogIn className="w-4 h-4" /> Login
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {user && <NotificationBell />}
            {user?.role === "customer" && (
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="w-5 h-5 text-stone-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button className="p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 py-3 space-y-1">
          <Link to="/search" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
            <Search className="w-4 h-4" /> Search
          </Link>
          <Link to="/map" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
            <Map className="w-4 h-4" /> Map View
          </Link>
          {user?.role === "customer" && (
            <>
              <Link to="/favourites" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
                <Heart className="w-4 h-4" /> Favourites
              </Link>
              <Link to="/cart" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
                <ShoppingCart className="w-4 h-4" /> Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
            </>
          )}
          {user?.role === "shopkeeper" && (
            <>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/analytics" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
                <BarChart2 className="w-4 h-4" /> Analytics
              </Link>
            </>
          )}
          {user && (
            <>
              <Link to="/notifications" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
                <UserCircle className="w-4 h-4" /> Notifications
              </Link>
              <Link to="/profile" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg">
                <UserCircle className="w-4 h-4" /> My Profile
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          )}
          {!user && (
            <Link to="/login" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 font-medium">
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;