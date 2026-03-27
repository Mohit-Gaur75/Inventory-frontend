import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Star, AlertTriangle, AlertCircle, Heart, Store, CheckCircle, XCircle, CheckCheck } from "lucide-react";
import { useNotifications } from "../context/NotificationContext";
import { getNotifications, markAsRead, markAllRead } from "../api/axios";

const TYPE_CONFIG = {
  new_review:       { icon: Star,          color: "text-amber-500"  },
  low_stock:        { icon: AlertTriangle,  color: "text-amber-500"  },
  out_of_stock:     { icon: AlertCircle,    color: "text-red-500"    },
  new_favourite:    { icon: Heart,          color: "text-red-500"    },
  shop_activated:   { icon: CheckCircle,    color: "text-green-500"  },
  shop_deactivated: { icon: XCircle,        color: "text-red-500"    },
  product_added:    { icon: Store,          color: "text-blue-500"   },
  welcome:          { icon: Bell,           color: "text-orange-500" },
};

const NotificationBell = () => {
  const navigate  = useNavigate();
  const { unreadCount, fetchUnreadCount } = useNotifications();
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]         = useState(false);
  const dropdownRef                   = useRef(null);

  
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  
  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      setLoading(true);
      try {
        const { data } = await getNotifications({ page: 1, limit: 5 });
        setNotifications(data.notifications);
      } catch {}
      finally { setLoading(false); }
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        fetchUnreadCount();
      } catch {}
    }
    setOpen(false);
    if (notification.link) navigate(notification.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      fetchUnreadCount();
    } catch {}
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60)   return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>

      
      <button
        onClick={handleOpen}
        className={`relative p-2 rounded-lg transition-colors
          ${open ? "bg-orange-50 text-orange-600" : "text-stone-600 hover:bg-stone-100"}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>


      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl shadow-stone-200/50 z-50 overflow-hidden">

      
          <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
            <div>
              <p className="font-semibold text-stone-800 text-sm">Notifications</p>
              {unreadCount > 0 && (
                <p className="text-xs text-stone-400">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> All read
                </button>
              )}
            </div>
          </div>


          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-10 h-10 text-stone-200 mx-auto mb-2" />
                <p className="text-sm text-stone-400">No notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.welcome;
                const Icon   = config.icon;
                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0
                      ${!n.isRead ? "bg-orange-50/60" : ""}`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${config.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-stone-800 truncate">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-xs text-stone-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

      
          <div className="px-4 py-2.5 border-t border-stone-100 bg-stone-50">
            <button
              onClick={() => { setOpen(false); navigate("/notifications"); }}
              className="w-full text-center text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors py-1"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;