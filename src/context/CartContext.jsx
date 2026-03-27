import { createContext, useContext, useState, useEffect } from "react";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../api/axios";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]       = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (user?.role === "customer") fetchCart();
    else setCart({ items: [], total: 0 });
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await getCart();
      setCart(data);
    } catch { setCart({ items: [], total: 0 }); }
  };

  const addItem = async (productId, quantity = 1) => {
    if (!user) return toast.error("Login to add to cart");
    if (user.role !== "customer") return toast.error("Only customers can use cart");
    setLoading(true);
    try {
      const { data } = await addToCart(productId, quantity);
      setCart(data);
      toast.success("Added to cart 🛒");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally { setLoading(false); }
  };

  const updateItem = async (productId, quantity) => {
    try {
      const { data } = await updateCartItem(productId, quantity);
      setCart(data);
    } catch { toast.error("Failed to update cart"); }
  };

  const removeItem = async (productId) => {
    try {
      const { data } = await removeFromCart(productId);
      setCart(data);
      toast.success("Removed from cart");
    } catch { toast.error("Failed to remove item"); }
  };

  const clearAll = async () => {
    try {
      await clearCart();
      setCart({ items: [], total: 0 });
      toast.success("Cart cleared");
    } catch { toast.error("Failed to clear cart"); }
  };

  
  const isInCart = (productId) =>
    cart.items.some((i) => i.product?._id === productId);

  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, loading, addItem, updateItem,
      removeItem, clearAll, isInCart, cartCount, fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);