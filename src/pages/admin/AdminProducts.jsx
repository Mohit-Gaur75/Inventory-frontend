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
        <h1 className="font-display font-bold text-2xl text-slate-900">Product Management</h1>
        <p className="text-slate-500 text-sm mt-1">{total} total catalog products</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search product name..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
        <select value={available} onChange={(e) => { setAvailable(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="all">All Stock Status</option>
          <option value="true">In Stock</option>
          <option value="false">Out of Stock</option>
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? <Loader text="Loading products..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-left">Product</th>
                  <th className="px-5 py-3.5 text-left">Shop</th>
                  <th className="px-5 py-3.5 text-left">Category</th>
                  <th className="px-5 py-3.5 text-left">Price</th>
                  <th className="px-5 py-3.5 text-left">Stock</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-400">No products found</td></tr>
                ) : products.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-slate-200">
                          {p.image
                            ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            : <Package className="w-5 h-5 text-slate-400" />}
                        </div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{p.shop?.name || "—"}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-teal-700">₹{p.price}</td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{p.stock} {p.unit}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${p.isAvailable ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                        {p.isAvailable ? "In Stock" : "Out of Stock"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => handleDelete(p._id)}
                        title="Delete Product"
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition-colors bg-white shadow-sm">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white transition-colors bg-white shadow-sm">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;