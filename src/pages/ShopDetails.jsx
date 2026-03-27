import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getShopById, getFavouriteIds } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ProductCard from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";
import { MapPin, Phone, Mail, Store, Tag, Star } from "lucide-react";

const ShopDetails = () => {
  const { id }  = useParams();
  const { user } = useAuth();
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

        // Load favourite IDs if customer is logged in
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

  if (loading) return <Loader text="Loading shop..." />;
  if (!shop)   return <div className="text-center py-20 text-stone-400">Shop not found.</div>;

  const { address } = shop;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

      {/* ── Shop Banner ── */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-3xl">{shop.name}</h1>
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
            </div>
          </div>
        </div>
      </div>

      {/* ── Products ── */}
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

      {/* ── Reviews ── */}
      <ReviewSection shopId={id} />
    </div>
  );
};

export default ShopDetails;