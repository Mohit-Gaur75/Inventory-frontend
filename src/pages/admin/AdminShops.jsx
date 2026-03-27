import { useState, useEffect, useCallback } from "react";
import { getAdminShops, toggleShop, deleteAdminShop } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Search, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const CATEGORIES = ["all","Grocery","Electronics","Clothing","Pharmacy","Hardware","Stationery","Food & Beverage","Other"];

const AdminShops = () => {
  const [shops, setShops]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]   = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminShops({ search, category, page, limit: 10 });
      setShops(data.shops);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch { toast.error("Failed to load shops"); }
    finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  const handleToggle = async (id, isActive) => {
    try {
      await toggleShop(id);
      toast.success(isActive ? "Shop deactivated" : "Shop activated");
      fetchShops();
    } catch { toast.error("Action failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this shop and ALL its products?")) return;
    try {
      await deleteAdminShop(id);
      toast.success("Shop deleted");
      fetchShops();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-stone-800">Shop Management</h1>
        <p className="text-stone-500 text-sm mt-1">{total} total shops</p>
      </div>

     
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search shop name or city..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white capitalize">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
      </div>

     
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {loading ? <Loader text="Loading shops..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Shop</th>
                  <th className="px-5 py-3 text-left">Owner</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Products</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {shops.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-stone-400">No shops found</td></tr>
                ) : shops.map((s) => (
                  <tr key={s._id} className={`hover:bg-stone-50 transition-colors ${!s.isActive ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-800">{s.name}</p>
                      {s.address?.city && (
                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {s.address.city}, {s.address.state}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-stone-700">{s.owner?.name}</p>
                      <p className="text-xs text-stone-400">{s.owner?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-medium">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-600 font-medium">{s.productCount}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggle(s._id, s.isActive)}
                          title={s.isActive ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition-colors
                            ${s.isActive ? "text-amber-600 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}>
                          {s.isActive
                            ? <ToggleRight className="w-4 h-4" />
                            : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(s._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

export default AdminShops;