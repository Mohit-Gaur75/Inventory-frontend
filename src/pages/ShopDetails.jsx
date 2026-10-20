import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getShopById, getFavouriteIds } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";
import { MapPin, Phone, Mail, Store, Tag, CheckCircle2, XCircle, Clock, Package } from "lucide-react";

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

  if (loading) return <Loader text="Loading shop profile..." />;
  if (!shop)   return <div className="text-center py-20 text-slate-400">Shop not found.</div>;

  const { address } = shop;
  const isOpen = shop.computedIsOpen ?? shop.isOpen;
  const today     = new Date().getDay();
  const todayHours = shop.businessHours?.[today];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Shop Banner ── */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20 shrink-0">
            <Store className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-bold text-3xl">{shop.name}</h1>

              <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm
                ${isOpen ? "bg-emerald-400/20 text-emerald-100 border border-emerald-300/40 backdrop-blur-md" : "bg-rose-500/20 text-rose-100 border border-rose-300/40 backdrop-blur-md"}`}>
                {isOpen
                  ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Open Now</>
                  : <><XCircle className="w-3.5 h-3.5 text-rose-300" /> Closed</>
                }
              </span>
            </div>

            {shop.description && (
              <p className="mt-2 text-teal-50 text-sm max-w-2xl leading-relaxed">{shop.description}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-5 text-xs">
              <span className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                <Tag className="w-3.5 h-3.5 text-teal-300" /> {shop.category}
              </span>
              {address?.city && (
                <span className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                  <MapPin className="w-3.5 h-3.5 text-teal-300" />
                  {address.street && `${address.street}, `}
                  {address.city}, {address.state} {address.pincode}
                </span>
              )}
              {shop.phone && (
                <a href={`tel:${shop.phone}`} className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-teal-300" /> {shop.phone}
                </a>
              )}
              {shop.email && (
                <a href={`mailto:${shop.email}`} className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-teal-300" /> {shop.email}
                </a>
              )}

              {todayHours && (
                <span className="flex items-center gap-1.5 text-teal-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
                  <Clock className="w-3.5 h-3.5 text-teal-300" />
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-teal-600" />
            Store Catalog ({products.length})
          </h2>
        </div>
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 font-medium">No products listed by this shop currently.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
