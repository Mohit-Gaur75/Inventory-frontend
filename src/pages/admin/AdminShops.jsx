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
        <h1 className="font-display font-bold text-2xl text-slate-900">Shop Management</h1>
        <p className="text-slate-500 text-sm mt-1">{total} total registered shops</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search shop name or city..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white capitalize">
          {CATEGORIES.map(c => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
        </select>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? <Loader text="Loading shops..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5 text-left">Shop</th>
                  <th className="px-5 py-3.5 text-left">Owner</th>
                  <th className="px-5 py-3.5 text-left">Category</th>
                  <th className="px-5 py-3.5 text-left">Products</th>
                  <th className="px-5 py-3.5 text-left">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shops.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No shops found</td></tr>
                ) : shops.map((s) => (
                  <tr key={s._id} className={`hover:bg-slate-50/80 transition-colors ${!s.isActive ? "opacity-60 bg-slate-50/30" : ""}`}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{s.name}</p>
                      {s.address?.city && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {s.address.city}, {s.address.state}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">{s.owner?.name}</p>
                      <p className="text-xs text-slate-400">{s.owner?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-xs font-semibold">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 font-semibold">{s.productCount}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                        ${s.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleToggle(s._id, s.isActive)}
                          title={s.isActive ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-lg transition-colors
                            ${s.isActive ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}>
                          {s.isActive
                            ? <ToggleRight className="w-5 h-5" />
                            : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button onClick={() => handleDelete(s._id)}
                          title="Delete Shop"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
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

export default AdminShops;