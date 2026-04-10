import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getShopById, getFavouriteIds } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";
import { MapPin, Phone, Mail, Store, Tag, CheckCircle2, XCircle, Clock } from "lucide-react";

const ShopDetails = () => {
  const { id }    = useParams();
  const { user }  = useAuth();
  const { socket, subscribeToShop, unsubscribeFromShop } = useSocket();
  const [shop, setShop]           = useState(null);
  const [products, setProducts]   = useState([]);
  const [favIds, setFavIds]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getShopById(id);
        setShop(data.shop);
        setProducts(data.products);
        if (user?.role === "customer") {
          const favRes = await getFavouriteIds();
          setFavIds(favRes.data);
        }
      } catch {
        setShop(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);
  useEffect(() => {
    if (!socket || !shop) return;
    const handler = ({ shopId, computedIsOpen }) => {
      if (shopId.toString() === shop._id.toString()) {
        setShop((s) => ({ ...s, computedIsOpen }));
      }
    };
    socket.on("shop:statusChanged", handler);
    return () => socket.off("shop:statusChanged", handler);
  }, [socket, shop]);

  useEffect(() => {
    if (!socket || !id) return;

    subscribeToShop(id);

    const handleStockUpdate = ({ productId, stock, isAvailable }) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, stock, isAvailable: isAvailable ?? stock > 0 }
            : p
        )
      );
    };

    const handlePriceUpdate = ({ productId, price }) => {
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, price } : p))
      );
    };

    const handleProductDeleted = ({ productId }) => {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    };

    socket.on("stock:updated",   handleStockUpdate);
    socket.on("price:updated",   handlePriceUpdate);
    socket.on("product:deleted", handleProductDeleted);

    return () => {
      unsubscribeFromShop(id);
      socket.off("stock:updated",   handleStockUpdate);
      socket.off("price:updated",   handlePriceUpdate);
      socket.off("product:deleted", handleProductDeleted);
    };
  }, [socket, id, subscribeToShop, unsubscribeFromShop]);

  if (loading) return <Loader text="Loading shop..." />;
  if (!shop)   return <div className="text-center py-20 text-stone-400">Shop not found.</div>;

  const { address } = shop;
  const isOpen = shop.computedIsOpen ?? shop.isOpen;
  const today     = new Date().getDay();
  const todayHours = shop.businessHours?.[today];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* ── Shop Banner ── */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-3xl">{shop.name}</h1>

              <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full
                ${isOpen ? "bg-green-400/30 text-white" : "bg-red-400/30 text-white"}`}>
                {isOpen
                  ? <><CheckCircle2 className="w-4 h-4" /> Open Now</>
                  : <><XCircle className="w-4 h-4" /> Closed</>
                }
              </span>
            </div>

            {shop.description && (
              <p className="mt-1 text-orange-100 text-sm">{shop.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4">
              <span className="flex items-center gap-1.5 text-sm text-orange-100">
                <Tag className="w-4 h-4" /> {shop.category}
              </span>
              {address?.city && (
                <span className="flex items-center gap-1.5 text-sm text-orange-100">
                  <MapPin className="w-4 h-4" />
                  {address.street && `${address.street}, `}
                  {address.city}, {address.state} {address.pincode}
                </span>
              )}
              {shop.phone && (
                <span className="flex items-center gap-1.5 text-sm text-orange-100">
                  <Phone className="w-4 h-4" /> {shop.phone}
                </span>
              )}
              {shop.email && (
                <span className="flex items-center gap-1.5 text-sm text-orange-100">
                  <Mail className="w-4 h-4" /> {shop.email}
                </span>
              )}

              {todayHours && (
                <span className="flex items-center gap-1.5 text-sm text-orange-100">
                  <Clock className="w-4 h-4" />
                  {todayHours.isOpen
                    ? `Today: ${todayHours.open} – ${todayHours.close}`
                    : "Closed today"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-display font-bold text-xl text-stone-800 mb-4">
          Products ({products.length})
        </h2>
        {products.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Store className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            No products available in this shop right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p._id}
                product={{ ...p, shop }}
                isFavourited={favIds.includes(p._id)}
                onFavouriteChange={async () => {
                  const res = await getFavouriteIds();
                  setFavIds(res.data);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ReviewSection shopId={id} />
    </div>
  );
};

export default ShopDetails;
