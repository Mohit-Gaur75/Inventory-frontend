import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Home, Search, MapPin, Store, User, ShoppingCart } from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { cartCount } = useCart();

  const isShopkeeper = user?.role === "shopkeeper";
  const path = location.pathname;

  const isActive = (route) => {
    if (route === "/") return path === "/";
    return path.startsWith(route);
  };

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: Home,
      active: isActive("/"),
    },
    {
      label: "Search",
      to: "/search",
      icon: Search,
      active: isActive("/search"),
    },
    {
      label: "Map",
      to: "/map",
      icon: MapPin,
      active: isActive("/map"),
    },
    {
      label: isShopkeeper ? "Shop" : "Cart",
      to: isShopkeeper ? "/dashboard" : "/cart",
      icon: isShopkeeper ? Store : ShoppingCart,
      active: isShopkeeper ? isActive("/dashboard") : isActive("/cart"),
      badge: !isShopkeeper && cartCount > 0 ? (cartCount > 9 ? "9+" : cartCount) : null,
    },
    {
      label: user ? "Account" : "Sign In",
      to: user ? "/profile" : "/login",
      icon: User,
      active: user ? isActive("/profile") : isActive("/login"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 transition-all duration-150 active:scale-95 select-none relative ${
                item.active ? "text-teal-600 font-semibold" : "text-slate-400 hover:text-slate-600 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${item.active ? "scale-110" : ""}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{item.label}</span>
              {item.active && (
                <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
