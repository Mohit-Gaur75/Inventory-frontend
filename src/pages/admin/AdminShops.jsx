import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminShops, toggleShop, deleteAdminShop } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  Search, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight,
  MapPin, Store, ExternalLink, Package, AlertTriangle, X, RefreshCw
} from "lucide-react";

const CATEGORIES = [
  "all",
  "Grocery",
  "Electronics",
  "Clothing",
  "Pharmacy",
  "Hardware",
  "Stationery",
  "Food & Beverage",
  "Other"
];

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal for delete confirmation
  const [deleteModalShop, setDeleteModalShop] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminShops({ search, category, page, limit: 10 });
      setShops(data.shops || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Failed to load storefronts");
    } finally {
      setLoading(false);
    }
  }, [search, category, page]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleToggle = async (id, isActive, shopName) => {
    try {
      await toggleShop(id);
      toast.success(isActive ? `Shop "${shopName}" deactivated` : `Shop "${shopName}" activated`);
      fetchShops();
    } catch {
      toast.error("Failed to update storefront status");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModalShop) return;
    setIsDeleting(true);
    try {
      await deleteAdminShop(deleteModalShop._id);
      toast.success(`Storefront "${deleteModalShop.name}" and inventory removed`);
      setDeleteModalShop(null);
      fetchShops();
    } catch {
      toast.error("Failed to delete storefront");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Storefront Directory & Moderation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review registered merchant shops, toggle operational status, and inspect catalog volume.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchShops()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-200 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search storefront name, owner, or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full md:w-48 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All Categories" : c}
              </option>
            ))}
          </select>

          <div className="text-xs font-semibold text-slate-500 shrink-0 px-2 whitespace-nowrap">
            Total <span className="text-teal-700 font-bold">{total}</span> shops
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20">
            <Loader text="Loading storefronts..." />
          </div>
        ) : shops.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Store className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No storefronts found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No merchant storefront matches your search or category filter.
            </p>
            {(search || category !== "all") && (
              <button
                onClick={() => { setSearch(""); setCategory("all"); setPage(1); }}
                className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Storefront</th>
                  <th className="px-6 py-3.5">Merchant Owner</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5 text-center">Inventory</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {shops.map((s) => (
                  <tr
                    key={s._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      !s.isActive ? "bg-slate-50/40" : ""
                    }`}
                  >
                    {/* Storefront Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 shadow-xs mt-0.5">
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-900 text-sm truncate">{s.name}</p>
                            <Link
                              to={`/shop/${s._id}`}
                              target="_blank"
                              title="Open Public Storefront"
                              className="text-slate-400 hover:text-teal-600 transition-colors p-0.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                          {s.address?.city ? (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{s.address.city}, {s.address.state || "IN"}</span>
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 mt-0.5">Location not set</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Merchant Owner */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800 text-xs">{s.owner?.name || "Merchant"}</p>
                      <p className="text-xs text-slate-400 truncate">{s.owner?.email || "—"}</p>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-100 rounded-full text-xs font-semibold">
                        {s.category || "General"}
                      </span>
                    </td>

                    {/* Product count */}
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <Package className="w-3 h-3 text-slate-500" />
                        {s.productCount || 0}
                      </span>
                    </td>

                    {/* Status Toggle Badge */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(s._id, s.isActive, s.name)}
                        title={s.isActive ? "Click to deactivate storefront" : "Click to activate storefront"}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                          s.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {s.isActive ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(s._id, s.isActive, s.name)}
                          title={s.isActive ? "Turn Off" : "Turn On"}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            s.isActive
                              ? "text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              : "text-slate-500 hover:bg-slate-100 border-slate-200"
                          }`}
                        >
                          {s.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setDeleteModalShop(s)}
                          title="Delete Storefront and Catalog"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors"
                        >
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
            <p className="text-xs text-slate-500 font-medium">
              Showing page <span className="font-bold text-slate-800">{page}</span> of{" "}
              <span className="font-bold text-slate-800">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white text-slate-600 transition-colors bg-white shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-white text-slate-600 transition-colors bg-white shadow-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-slate-900">
              Confirm Storefront Removal
            </h3>

            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently delete <strong className="text-slate-900">{deleteModalShop.name}</strong>?
            </p>

            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Warning:</strong> Deleting this storefront will also permanently remove all{" "}
                <strong>{deleteModalShop.productCount || 0} associated catalog products</strong>. This action cannot be undone.
              </span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalShop(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete Storefront"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShops;
