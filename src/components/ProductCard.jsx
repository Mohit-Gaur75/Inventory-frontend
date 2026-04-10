import { useState, useEffect } from "react";
import { Link }                from "react-router-dom";
import { MapPin, Tag, Store, Heart, ShoppingCart, Zap, TrendingDown } from "lucide-react";
import { addFavourite, removeFavourite } from "../api/axios";
import { useAuth }    from "../context/AuthContext";
import { useCart }    from "../context/CartContext";
import { useSocket }  from "../context/SocketContext";
import ImageGallery   from "./ImageGallery";
import toast          from "react-hot-toast";

const ProductCard = ({ product, isFavourited = false, onFavouriteChange, onCompare }) => {
  const { name, category, description, unit, shop, distance } = product;
  const { user }        = useAuth();
  const { addItem, isInCart } = useCart();
  const { socket }      = useSocket();

  const [faved,        setFaved]        = useState(isFavourited);
  const [favLoading,   setFavLoading]   = useState(false);
  const [cartLoading,  setCartLoading]  = useState(false);
  const [currentPrice, setCurrentPrice] = useState(product.price);
  const [currentStock, setCurrentStock] = useState(product.stock);
  const [priceFlash,   setPriceFlash]   = useState(null);  
  const [stockFlash,   setStockFlash]   = useState(false);

  // ── Real-time updates
  useEffect(() => {
    if (!socket) return;

    const onPrice = ({ productId, price: newPrice }) => {
      if (productId !== product._id) return;
      setPriceFlash(newPrice < currentPrice ? "down" : "up");
      setCurrentPrice(newPrice);
      setTimeout(() => setPriceFlash(null), 3000);
    };

    const onStock = ({ productId, stock: newStock }) => {
      if (productId !== product._id) return;
      setCurrentStock(newStock);
      setStockFlash(true);
      setTimeout(() => setStockFlash(false), 2000);
    };

    socket.on("price:updated", onPrice);
    socket.on("stock:updated", onStock);
    return () => { socket.off("price:updated", onPrice); socket.off("stock:updated", onStock); };
  }, [socket, product._id, currentPrice]);

  // ── Images
  const allImages = [
    ...(product.image  ? [product.image]  : []),
    ...(product.images || []),
  ].filter(Boolean);

  // ── Handlers
  const toggleFavourite = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user)                    return toast.error("Login to save favourites");
    if (user.role !== "customer") return toast.error("Only customers can favourite");
    setFavLoading(true);
    try {
      if (faved) { await removeFavourite(product._id); toast.success("Removed"); setFaved(false); }
      else        { await addFavourite(product._id);   toast.success("Saved ❤️"); setFaved(true);  }
      onFavouriteChange?.();
    } catch { toast.error("Failed to update favourites"); }
    finally { setFavLoading(false); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user)                    return toast.error("Login to add to cart");
    if (user.role !== "customer") return toast.error("Only customers can use cart");
    if (currentStock === 0)       return toast.error("Out of stock");
    setCartLoading(true);
    try { await addItem(product._id, 1); }
    catch { toast.error("Failed to add to cart"); }
    finally { setCartLoading(false); }
  };

  const alreadyInCart  = isInCart(product._id);
  const isOutOfStock   = currentStock === 0;

  return (
    <div className={`relative bg-white border-2 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200
      ${isOutOfStock ? "border-stone-200 opacity-80" : "border-stone-200"}`}>

      {priceFlash && (
        <div className={`absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white animate-bounce
          ${priceFlash === "down" ? "bg-green-500" : "bg-red-500"}`}>
          <TrendingDown className="w-2.5 h-2.5" />
          Price {priceFlash === "down" ? "dropped!" : "updated"}
        </div>
      )}

    
      <div className="relative p-2 pb-0">
        <ImageGallery images={allImages} productName={name} />
      
        <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur text-xs font-medium text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
          {category}
        </span>
    
        {user?.role === "customer" && (
          <button
            onClick={toggleFavourite}
            disabled={favLoading}
            className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-all
              ${faved ? "bg-red-500 text-white" : "bg-white text-stone-400 hover:text-red-400"}`}>
            <Heart className={`w-4 h-4 ${faved ? "fill-current" : ""}`} />
          </button>
        )}
      
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-xl m-2">
            <span className="bg-stone-800 text-white text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

  
      <div className="p-3 space-y-2">
        <div>
          <h3 className="font-semibold text-stone-800 truncate">{name}</h3>
          {description && <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">{description}</p>}
        </div>

    
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-orange-500" />
            <span className={`font-bold text-lg transition-colors ${priceFlash === "down" ? "text-green-600" : priceFlash === "up" ? "text-red-500" : "text-stone-800"}`}>
              ₹{currentPrice}
            </span>
            {unit && <span className="text-xs text-stone-400">/{unit}</span>}
          </div>
          
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all
            ${stockFlash ? "bg-orange-100 text-orange-700 scale-110" : isOutOfStock ? "bg-red-100 text-red-600" : currentStock <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
            {isOutOfStock ? "0 left" : `${currentStock} left`}
            {stockFlash && <Zap className="w-2.5 h-2.5 inline ml-0.5" />}
          </span>
        </div>


        <div className="flex items-center gap-1 text-xs text-stone-500">
          <Store className="w-3 h-3 shrink-0" />
          <span className="truncate">{shop?.name || "Unknown Shop"}</span>
          {distance != null && (
            <span className="flex items-center gap-0.5 ml-auto shrink-0">
              <MapPin className="w-2.5 h-2.5" /> {distance} km
            </span>
          )}
        </div>

        
        <div className="flex gap-2 pt-1">
          {user?.role === "customer" && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors
                ${alreadyInCart
                  ? "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  : isOutOfStock
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-orange-500 text-white hover:bg-orange-600"}`}
            >
              {cartLoading
                ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <ShoppingCart className="w-3.5 h-3.5" />}
              {alreadyInCart ? "In Cart" : "Add to Cart"}
            </button>
          )}
          {onCompare && (
            <button
              onClick={(e) => { e.preventDefault(); onCompare(name); }}
              title="Compare prices across shops"
              className="px-3 py-2 rounded-xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-semibold transition-colors"
            >
              Compare
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

