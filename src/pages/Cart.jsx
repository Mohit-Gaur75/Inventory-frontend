import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, Store, Phone, MapPin } from "lucide-react";
import Loader from "../components/Loader";

const Cart = () => {
  const { cart, loading, updateItem, removeItem, clearAll } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-stone-500">
        Please{" "}
        <Link to="/login" className="text-orange-500 font-semibold">login</Link>
        {" "}to view your cart.
      </p>
    </div>
  );

  if (loading) return <Loader text="Loading cart..." />;

  const shopGroups = cart.items.reduce((groups, item) => {
    const shopId = item.product?.shop?._id;
    if (!shopId) return groups;
    if (!groups[shopId]) {
      groups[shopId] = { shop: item.product.shop, items: [] };
    }
    groups[shopId].items.push(item);
    return groups;
  }, {});

  const handleWhatsApp = (shop, items) => {
    const itemList = items
      .map((i) => `${i.product?.name} x${i.quantity}`)
      .join(", ");
    const message = encodeURIComponent(
      `Hi! I'm interested in ordering from ${shop.name} via LocalMart.\n\nItems: ${itemList}`
    );
    window.open(`https://wa.me/91${shop.phone}?text=${message}`, "_blank");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

     
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-stone-800">My Cart</h1>
            <p className="text-stone-500 text-sm">
              {cart.items.length} item{cart.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {cart.items.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      
      {cart.items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 text-stone-200 mx-auto mb-4" />
          <h2 className="font-display font-semibold text-xl text-stone-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-stone-400 text-sm mb-6">
            Search for products and add them to your cart.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-4">
            {Object.values(shopGroups).map(({ shop, items }) => (
              <div
                key={shop._id}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden"
              >
                
                <div className="px-5 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between flex-wrap gap-2">
                  <Link
                    to={`/shop/${shop._id}`}
                    className="flex items-center gap-2 text-sm font-semibold text-orange-600 hover:underline"
                  >
                    <Store className="w-4 h-4" />
                    {shop.name}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-stone-400">
                    {shop.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        {shop.phone}
                      </span>
                    )}
                    {shop.address?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {shop.address.city}
                      </span>
                    )}
                  </div>
                </div>

               
                <div className="divide-y divide-stone-100">
                  {items.map((item) => (
                    <div key={item._id} className="px-5 py-4 flex items-center gap-4">

                     
                      <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="w-6 h-6 text-orange-200" />
                        )}
                      </div>

                    
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-800 truncate">
                          {item.product?.name}
                        </p>
                        <p className="text-sm text-orange-600 font-semibold">
                          ₹{item.product?.price} / {item.product?.unit}
                        </p>
                      </div>

                     
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateItem(item.product._id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-stone-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.product._id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-stone-800">
                          ₹{(item.product?.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-xs text-red-400 hover:text-red-600 mt-1 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              
                {shop.phone && (
                  <div className="px-5 py-3 bg-stone-50 border-t border-stone-100">
                    <button
                      onClick={() => handleWhatsApp(shop, items)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                    
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Contact {shop.name} on WhatsApp
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

    
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-2xl p-6 sticky top-24 space-y-4">
              <h2 className="font-display font-bold text-lg text-stone-800">
                Order Summary
              </h2>

              <div className="space-y-2 text-sm">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-stone-600">
                    <span className="truncate flex-1 mr-2">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      ₹{(item.product?.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-3 space-y-1">
                <div className="flex justify-between font-bold text-stone-800">
                  <span>Total</span>
                  <span className="text-orange-600 text-lg">
                    ₹{cart.total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Contact each shop directly to place your order
                </p>
              </div>

              <button
                onClick={() => navigate("/search")}
                className="w-full py-2.5 border border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;