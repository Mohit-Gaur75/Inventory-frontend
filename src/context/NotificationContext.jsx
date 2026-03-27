import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUnreadCount, markAllRead, clearAllNotifications } from "../api/axios";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return setUnreadCount(0);
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const markAll = async () => {
    try {
      await markAllRead();
      setUnreadCount(0);
    } catch {}
  };

  const clearAll = async () => {
    try {
      await clearAllNotifications();
      setUnreadCount(0);
    } catch {}
  };

  const decrementCount = () =>
    setUnreadCount((prev) => Math.max(0, prev - 1));

  return (
    <NotificationContext.Provider value={{
      unreadCount, fetchUnreadCount,
      markAll, clearAll, decrementCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);