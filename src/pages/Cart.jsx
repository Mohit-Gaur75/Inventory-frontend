import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingCart, Store, Phone, MapPin, MessageCircle } from "lucide-react";
import Loader from "../components/Loader";

const Cart = () => {
  const { cart, loading, updateItem, removeItem, clearAll } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div className="text-center py-20">
      <p className="text-slate-500">
        Please{" "}
        <Link to="/login" className="text-teal-600 font-semibold">login</Link>
        {" "}to view your saved cart.
      </p>
    </div>
  );

  if (loading) return <Loader text="Loading your cart..." />;

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

     
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center shadow-sm">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-slate-900">Direct Enquiry Cart</h1>
            <p className="text-slate-500 text-sm">
              {cart.items.length} item{cart.items.length !== 1 ? "s" : ""} from local vendors
            </p>
          </div>
        </div>
        {cart.items.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl font-medium flex items-center gap-1.5 transition-all duration-200"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      
      {cart.items.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-10 h-10 text-teal-600" />
          </div>
          <h2 className="font-display font-semibold text-xl text-slate-800 mb-2">
            Your cart is empty
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
            Search products from neighborhood sellers and add them to order directly via WhatsApp or call.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm"
          >
            Explore Local Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">
            {Object.values(shopGroups).map(({ shop, items }) => (
              <div
                key={shop._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
              >
                
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <Link
                    to={`/shop/${shop._id}`}
                    className="flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
                  >
                    <Store className="w-4 h-4 text-teal-600" />
                    {shop.name}
                  </Link>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
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

               
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item._id} className="px-5 py-4 flex items-center gap-4">

                     
                      <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-100">
                        {item.product?.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                    
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate text-sm">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-teal-700 font-medium mt-0.5">
                          ₹{item.product?.price} / {item.product?.unit}
                        </p>
                      </div>

                     
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateItem(item.product._id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.product._id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900 text-sm">
                          ₹{(item.product?.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeItem(item.product._id)}
                          className="text-xs text-rose-500 hover:text-rose-700 mt-1 transition-colors block ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              
                {shop.phone && (
                  <div className="px-5 py-3.5 bg-emerald-50/50 border-t border-emerald-100">
                    <button
                      onClick={() => handleWhatsApp(shop, items)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      Order Directly on WhatsApp with {shop.name}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

    
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24 space-y-4 shadow-sm">
              <h2 className="font-display font-bold text-lg text-slate-900">
                Direct Order Summary
              </h2>

              <div className="space-y-2.5 text-sm">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex justify-between text-slate-600">
                    <span className="truncate flex-1 mr-2 text-xs">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0 text-xs">
                      ₹{(item.product?.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-teal-700 text-lg">
                    ₹{cart.total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Zero commission platform. Payments and delivery arranged directly with the local store.
                </p>
              </div>

              <button
                onClick={() => navigate("/search")}
                className="w-full py-2.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
