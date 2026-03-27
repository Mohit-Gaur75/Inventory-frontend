import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Package, Tag, Store, Heart, ShoppingCart } from "lucide-react";
import { addFavourite, removeFavourite } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

const ProductCard = ({ product, isFavourited = false, onFavouriteChange }) => {
  const {
    name, price, stock, category,
    description, unit, shop, distance, isAvailable,
  } = product;

  const { user }  = useAuth();
  const { addItem, isInCart } = useCart();

  const [faved, setFaved]         = useState(isFavourited);
  const [favLoading, setFavLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const toggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user)                  return toast.error("Login to save favourites");
    if (user.role !== "customer") return toast.error("Only customers can favourite products");

    setFavLoading(true);
    try {
      if (faved) {
        await removeFavourite(product._id);
        toast.success("Removed from favourites");
        setFaved(false);
      } else {
        await addFavourite(product._id);
        toast.success("Added to favourites ❤️");
        setFaved(true);
      }
      onFavouriteChange?.();
    } catch {
      toast.error("Failed to update favourites");
    } finally {
      setFavLoading(false); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user)                  return toast.error("Login to add to cart");
    if (user.role !== "customer") return toast.error("Only customers can use the cart");
    if (!isAvailable)           return toast.error("This product is out of stock");

    setCartLoading(true);
    try {
      await addItem(product._id, 1);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const alreadyInCart = isInCart(product._id);

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

      <div className="relative h-40 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="w-14 h-14 text-orange-200" />
        )}

      
        {user?.role === "customer" && (
          <button
            onClick={toggleFavourite}
            disabled={favLoading}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all
              ${faved
                ? "bg-red-500 text-white"
                : "bg-white text-stone-400 hover:text-red-400"}`}
          >
            <Heart className={`w-4 h-4 ${faved ? "fill-white" : ""}`} />
          </button>
        )}

     
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

  
      <div className="p-4 space-y-3">

       
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-stone-800 leading-tight">
              {name}
            </h3>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium
              ${isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"}`}>
              {isAvailable ? "In Stock" : "Out of Stock"}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-stone-400 mt-1">
            <Tag className="w-3 h-3" /> {category}
          </span>
        </div>

    
        {description && (
          <p className="text-xs text-stone-500 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-display font-bold text-orange-600">
              ₹{price}
            </span>
            <span className="text-xs text-stone-400 ml-1">/ {unit || "piece"}</span>
          </div>
          <span className="text-xs text-stone-500">Stock: {stock}</span>
        </div>

        {user?.role === "customer" && (
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable || cartLoading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${!isAvailable
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : alreadyInCart
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"}`}
          >
            <ShoppingCart className="w-4 h-4" />
            {cartLoading
              ? "Adding..."
              : !isAvailable
                ? "Out of Stock"
                : alreadyInCart
                  ? "✓ Added to Cart"
                  : "Add to Cart"}
          </button>
        )}

        {shop && (
          <div className="pt-2 border-t border-stone-100 space-y-1">
            <Link
              to={`/shop/${shop._id}`}
              className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              {shop.name}
            </Link>
            {distance !== undefined && distance !== null && (
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{distance} km away</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;