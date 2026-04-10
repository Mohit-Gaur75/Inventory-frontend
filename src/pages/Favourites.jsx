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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-stone-800">My Favourites</h1>
          <p className="text-stone-500 text-sm">{favourites.length} saved product{favourites.length !== 1 ? "s" : ""}</p>
        </div>
      </div>
      {favourites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <h2 className="font-display font-semibold text-xl text-stone-700 mb-2">No favourites yet</h2>
          <p className="text-stone-400 text-sm">
            Search for products and tap the ❤️ to save them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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