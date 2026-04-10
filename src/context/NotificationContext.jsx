import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUnreadCount, markAllRead, clearAllNotifications } from "../api/axios";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user }   = useAuth();
  const { socket } = useSocket();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return setUnreadCount(0);
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.count);
    } catch { setUnreadCount(0); }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5*60*1000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;
    const onNew = () => setUnreadCount((prev) => prev + 1);
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, [socket]);


  const markAll  = async () => { try { await markAllRead();             setUnreadCount(0); } catch {} };
  const clearAll = async () => { try { await clearAllNotifications();   setUnreadCount(0); } catch {} };
  const decrementCount = () => setUnreadCount((p) => Math.max(0, p - 1));

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, markAll, clearAll, decrementCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
