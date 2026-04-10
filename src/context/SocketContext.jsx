import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();
const extractToken = (user) => user?.token || null;

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ; 

export const SocketProvider = ({ children }) => {
  const { user }  = useAuth();
  const socketRef = useRef(null);

  const [socket,    setSocket]    = useState(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const token = extractToken(user); 

    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const s = io(SOCKET_URL, {
      auth:                 { token },
      transports:           ["websocket", "polling"],
      reconnection:         true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
    });

    socketRef.current = s;
    setSocket(s); 

    s.on("connect",    () => setConnected(true));
    s.on("disconnect", () => setConnected(false));

    s.on("user:online",  ({ userId }) =>
      setOnlineUsers((prev) => new Set([...prev, userId])));
    s.on("user:offline", ({ userId }) =>
      setOnlineUsers((prev) => { const n = new Set(prev); n.delete(userId); return n; }));

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [user?.token]); 

  const subscribeToShop   = useCallback((shopId) =>
    socketRef.current?.emit("shop:subscribe", shopId), []);

  const unsubscribeFromShop = useCallback((shopId) =>
    socketRef.current?.emit("shop:unsubscribe", shopId), []);

  const emit = useCallback((event, data) =>
    socketRef.current?.emit(event, data), []);

  const syncCart = useCallback((cartItems) =>
    socketRef.current?.emit("cart:sync", cartItems), []);

  const isOnline = useCallback((userId) =>
    onlineUsers.has(userId), [onlineUsers]);

  return (
    <SocketContext.Provider
      value={{ socket, connected, onlineUsers, subscribeToShop, unsubscribeFromShop, emit, syncCart, isOnline }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
