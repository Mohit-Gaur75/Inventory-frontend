import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyShop, getMyProducts, deleteProduct } from "../api/axios";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import {
  Plus, Pencil, Trash2, Store, Package,
  AlertCircle, TrendingUp, AlertTriangle, Settings
} from "lucide-react";

// Products with stock below this are considered "low stock"
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

  // ── Stats ──────────────────────────────────────────
  const totalStock  = products.reduce((sum, p) => sum + p.stock, 0);
  const outOfStock  = products.filter((p) => !p.isAvailable).length;
  const avgPrice    = products.length
    ? (products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(0)
    : 0;

  // Low stock = available but stock is low
  const lowStockProducts = products.filter(
    (p) => p.isAvailable && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
  );

  if (loadingShop) return <Loader text="Loading dashboard..." />;

  // ── No shop yet ────────────────────────────────────
  if (!shop) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-stone-800 mb-2">No shop yet</h2>
        <p className="text-stone-500 text-sm mb-6">
          Create your shop profile to start adding products.
        </p>
        <Link to="/create-shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Create My Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl text-stone-800">{shop.name}</h1>
          <p className="text-stone-500 mt-1">
            {shop.category} · {shop.address?.city}, {shop.address?.state}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Edit Shop button */}
          <Link to="/edit-shop"
            className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-stone-600 hover:bg-stone-50 text-sm font-medium rounded-xl transition-colors">
            <Settings className="w-4 h-4" /> Edit Shop
          </Link>
          {/* Add Product button */}
          <Link to="/add-product"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-800 text-sm">
                ⚠️ {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s are" : " is"} running low on stock!
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockProducts.map((p) => (
                  <span key={p._id}
                    className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                    {p.name}
                    <span className="bg-amber-200 px-1.5 py-0.5 rounded-full font-bold">
                      {p.stock} left
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Out of Stock Banner ── */}
      {outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700 font-medium">
              🚫 {outOfStock} product{outOfStock > 1 ? "s are" : " is"} out of stock.
              Update their stock from the table below.
            </p>
          </div>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: products.length,  icon: Package,       color: "blue"   },
          { label: "Total Stock",    value: totalStock,        icon: TrendingUp,    color: "green"  },
          { label: "Out of Stock",   value: outOfStock,        icon: AlertCircle,   color: "red"    },
          { label: "Avg. Price",     value: `₹${avgPrice}`,   icon: Store,         color: "orange" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3
              ${color === "blue"   ? "bg-blue-100"   :
                color === "green"  ? "bg-green-100"  :
                color === "red"    ? "bg-red-100"    : "bg-orange-100"}`}>
              <Icon className={`w-4 h-4
                ${color === "blue"   ? "text-blue-600"   :
                  color === "green"  ? "text-green-600"  :
                  color === "red"    ? "text-red-500"    : "text-orange-500"}`} />
            </div>
            <p className="text-2xl font-display font-bold text-stone-800">{value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Products Table ── */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-stone-800">Your Products</h2>
          <span className="text-sm text-stone-400">{products.length} items</span>
        </div>

        {loadingProducts ? (
          <Loader text="Loading products..." />
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Category</th>
                  <th className="px-6 py-3 text-left">Price</th>
                  <th className="px-6 py-3 text-left">Stock</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const isLow = p.isAvailable && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <tr key={p._id}
                      className={`transition-colors
                        ${isLow        ? "bg-amber-50 hover:bg-amber-100" :
                          !p.isAvailable ? "bg-red-50 hover:bg-red-100"   :
                          "hover:bg-stone-50"}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-800">{p.name}</span>
                          {/* Low stock warning icon inline */}
                          {isLow && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" title="Low stock!" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-500">{p.category}</td>
                      <td className="px-6 py-4 font-semibold text-orange-600">₹{p.price}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium
                          ${isLow ? "text-amber-600" : !p.isAvailable ? "text-red-500" : "text-stone-600"}`}>
                          {p.stock} {p.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                          ${!p.isAvailable ? "bg-red-100 text-red-600"     :
                            isLow         ? "bg-amber-100 text-amber-700"  :
                            "bg-green-100 text-green-700"}`}>
                          {!p.isAvailable ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => navigate(`/edit-product/${p._id}`)}
                            className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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