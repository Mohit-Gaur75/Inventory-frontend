import { useState, useEffect, useCallback } from "react";
import { getAdminProducts, deleteAdminProduct } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Search, Trash2, ChevronLeft, ChevronRight, Package } from "lucide-react";

const CATEGORIES = ["all","Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("all");
  const [available, setAvailable] = useState("all");
  const [loading, setLoading]   = useState(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, category, page, limit: 10 };
      if (available !== "all") params.available = available;
      const { data } = await getAdminProducts(params);
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  }, [search, category, available, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteAdminProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-stone-800">Product Management</h1>
        <p className="text-stone-500 text-sm mt-1">{total} total products</p>
      </div>

    
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search product name..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <select value={available} onChange={(e) => { setAvailable(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
          <option value="all">All Stock</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {loading ? <Loader text="Loading products..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">Shop</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Price</th>
                  <th className="px-5 py-3 text-left">Stock</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-stone-400">No products found</td></tr>
                ) : products.map((p) => (
                  <tr key={p._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                          {p.image
                            ? <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-lg" />
                            : <Package className="w-4 h-4 text-orange-300" />}
                        </div>
                        <p className="font-medium text-stone-800">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone-600">{p.shop?.name || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full text-xs">{p.category}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-orange-600">₹{p.price}</td>
                    <td className="px-5 py-4 text-stone-600">{p.stock} {p.unit}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${p.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {p.isAvailable ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-between">
            <p className="text-xs text-stone-400">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;