import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyShop, getMyProducts, deleteProduct } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Plus, Pencil, Trash2, Store, Package,
  AlertCircle, TrendingUp, AlertTriangle, Settings,
  Upload, FileDown
} from "lucide-react";
import ShopStatusPanel from "../components/ShopStatusPanel";

const LOW_STOCK_THRESHOLD = 5;

const Dashboard = () => {
  const navigate = useNavigate();
  const [shop, setShop]         = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingShop, setLoadingShop]         = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchShop();
    fetchProducts();
  }, []);

  const fetchShop = async () => {
    try {
      const { data } = await getMyShop();
      setShop(data);
    } catch {
      setShop(null);
    } finally {
      setLoadingShop(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await getMyProducts();
      setProducts(data);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };
  const totalStock  = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock  = products.filter((p) => !p.isAvailable).length;
  const avgPrice    = products.length
    ? (products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(0)
    : 0;

  const lowStockProducts = products.filter(
    (p) => p.isAvailable && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );

  if (loadingShop) return <Loader text="Loading seller dashboard..." />;

  if (!shop) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
          <Store className="w-8 h-8 text-teal-600" />
        </div>
        <h2 className="font-display font-bold text-2xl text-slate-800 mb-2">No store registered yet</h2>
        <p className="text-slate-500 text-sm mb-6">
          Set up your store listing on LocalMart to start listing products for neighborhood customers.
        </p>
        <Link to="/create-shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Store Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">{shop.name}</h1>
          <p className="text-slate-500 mt-1">
            {shop.category} · {shop.address?.city}, {shop.address?.state}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/edit-shop"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition-colors">
            <Settings className="w-4 h-4 text-slate-500" /> Store Settings
          </Link>
          <Link to="/import"
            className="flex items-center gap-2 px-4 py-2.5 border border-teal-200 text-teal-700 hover:bg-teal-50 text-sm font-medium rounded-xl transition-colors">
            <Upload className="w-4 h-4" /> Bulk Import
          </Link>
          <Link to="/export"
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium rounded-xl transition-colors">
            <FileDown className="w-4 h-4" /> Export
          </Link>
          
          <Link to="/add-product"
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {shop && (
        <ShopStatusPanel shop={shop} onUpdate={fetchShop} />
      )}

      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">
                ⚠️ {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s are" : " is"} running low on stock!
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockProducts.map((p) => (
                  <span key={p._id}
                    className="inline-flex items-center gap-1.5 text-xs bg-white text-amber-800 px-3 py-1 rounded-full font-medium shadow-xs border border-amber-200">
                    {p.name}
                    <span className="bg-amber-100 px-1.5 py-0.5 rounded-full font-bold">
                      {p.stock} left
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {outOfStock > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm text-rose-800 font-medium">
              🚫 {outOfStock} product{outOfStock > 1 ? "s are" : " is"} out of stock.
              Update inventory below to continue receiving customer orders.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Listed Products", value: products.length,  icon: Package,       color: "blue"   },
          { label: "Total Inventory Units", value: totalStock, icon: TrendingUp,    color: "teal"   },
          { label: "Out of Stock Items", value: outOfStock,    icon: AlertCircle,   color: "red"    },
          { label: "Avg. Item Price",  value: `₹${avgPrice}`,  icon: Store,         color: "emerald" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all duration-200">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-xs
              ${color === "blue"    ? "bg-blue-50 text-blue-600 border border-blue-100"   :
                color === "teal"    ? "bg-teal-50 text-teal-600 border border-teal-100"  :
                color === "red"     ? "bg-rose-50 text-rose-600 border border-rose-100"  :
                "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-slate-900">Your Store Catalog</h2>
          <span className="text-sm text-slate-500">{products.length} products listed</span>
        </div>

        {loadingProducts ? (
          <Loader text="Loading store products..." />
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No products added yet. Click "Add Product" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 text-left">Product</th>
                  <th className="px-6 py-3.5 text-left">Category</th>
                  <th className="px-6 py-3.5 text-left">Price</th>
                  <th className="px-6 py-3.5 text-left">Stock</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLow = p.isAvailable && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <tr key={p._id}
                      className={`transition-colors
                        ${isLow        ? "bg-amber-50/40 hover:bg-amber-50" :
                          !p.isAvailable ? "bg-rose-50/40 hover:bg-rose-50"   :
                          "hover:bg-slate-50"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{p.name}</span>
                          {isLow && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" title="Low stock!" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{p.category}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">₹{p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium
                          ${isLow ? "text-amber-700" : !p.isAvailable ? "text-rose-600" : "text-slate-700"}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${!p.isAvailable ? "bg-rose-100 text-rose-700"     :
                            isLow         ? "bg-amber-100 text-amber-800"  :
                            "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                          {!p.isAvailable ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/edit-product/${p._id}`)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
