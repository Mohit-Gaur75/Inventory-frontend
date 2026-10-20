import { useState, useEffect } from "react";
import { getMyFavourites } from "../api/axios";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { Heart } from "lucide-react";

const Favourites = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchFavourites = async () => {
    try {
      const { data } = await getMyFavourites();
      setFavourites(data);
    } catch {
      setFavourites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFavourites(); }, []);

  if (loading) return <Loader text="Loading favourites..." />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center shadow-sm">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900">Saved Items</h1>
          <p className="text-slate-500 text-sm">{favourites.length} saved product{favourites.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {favourites.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8 text-slate-300" />
          </div>
          <h2 className="font-display font-semibold text-xl text-slate-700 mb-2">No saved items yet</h2>
          <p className="text-slate-400 text-sm">
            Search for local store products and tap the ❤️ icon to save them for quick lookup.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favourites.map((fav) => (
            <ProductCard
              key={fav._id}
              product={fav.product}
              isFavourited={true}
              onFavouriteChange={fetchFavourites}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;
