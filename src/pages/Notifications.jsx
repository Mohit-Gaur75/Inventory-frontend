import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications, markAsRead,
  deleteNotification, markAllRead, clearAllNotifications,
} from "../api/axios";
import { useNotifications } from "../context/NotificationContext";
import Loader from "../components/Loader";
import {
  Bell, Star, AlertTriangle, AlertCircle,
  Heart, Store, CheckCircle, Trash2,
  CheckCheck, XCircle, ChevronLeft, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

// Icon + color per notification type
const TYPE_CONFIG = {
  new_review:       { icon: Star,          color: "bg-amber-100 text-amber-700",  label: "Review"       },
  low_stock:        { icon: AlertTriangle,  color: "bg-amber-100 text-amber-700",  label: "Low Stock"    },
  out_of_stock:     { icon: AlertCircle,    color: "bg-rose-100 text-rose-700",    label: "Out of Stock" },
  new_favourite:    { icon: Heart,          color: "bg-rose-100 text-rose-600",    label: "Favourite"    },
  shop_activated:   { icon: CheckCircle,    color: "bg-emerald-100 text-emerald-700", label: "Shop"     },
  shop_deactivated: { icon: XCircle,        color: "bg-rose-100 text-rose-700",    label: "Shop"         },
  product_added:    { icon: Store,          color: "bg-teal-100 text-teal-700",    label: "Product"      },
  welcome:          { icon: Bell,           color: "bg-teal-100 text-teal-700",    label: "Welcome"      },
};

const Notifications = () => {
  const navigate = useNavigate();
  const { fetchUnreadCount } = useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(true);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [total, setTotal]                 = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await getNotifications({ page, limit: 15 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        fetchUnreadCount();
      } catch {}
    }
    
    if (notification.link) navigate(notification.link);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setTotal((prev) => prev - 1);
      toast.success("Notification deleted");
      fetchUnreadCount();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      fetchUnreadCount();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all read");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete all notifications?")) return;
    try {
      await clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setTotal(0);
      fetchUnreadCount();
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60)  return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center relative">
            <Bell className="w-5 h-5 text-teal-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">
              Community & Account Updates
            </h1>
            <p className="text-slate-500 text-sm">
              {total} total · {unreadCount} unread
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-xl border border-teal-200 transition-colors"
            >
              <CheckCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
          {total > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Notifications List ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <Loader text="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="font-display font-semibold text-xl text-slate-700 mb-2">
              All caught up!
            </h2>
            <p className="text-slate-400 text-sm">
              No new alerts or direct order updates right now.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => {
              const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.welcome;
              const Icon   = config.icon;

              return (
                <div
                  key={n._id}
                  onClick={() => handleRead(n)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-all hover:bg-slate-50
                    ${!n.isRead ? "bg-teal-50/40 border-l-4 border-l-teal-600" : ""}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${!n.isRead ? "text-slate-900" : "text-slate-700"}`}>
                            {n.title}
                          </p>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                            {config.label}
                          </span>
                          {!n.isRead && (
                            <span className="w-2 h-2 bg-teal-600 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(n._id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
