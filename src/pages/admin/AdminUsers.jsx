import { useState, useEffect, useCallback } from "react";
import { getAdminUsers, banUser, deleteAdminUser } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Search, Ban, Trash2, UserCheck, ChevronLeft, ChevronRight } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch]   = useState("");
  const [role, setRole]       = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ search, role, page, limit: 10 });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  }, [search, role, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleBan = async (id, isBanned) => {
    try {
      await banUser(id);
      toast.success(isBanned ? "User unbanned" : "User banned");
      fetchUsers();
    } catch { toast.error("Action failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this user and all their data?")) return;
    try {
      await deleteAdminUser(id);
      toast.success("User deleted");
      fetchUsers();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-stone-800">User Management</h1>
        <p className="text-stone-500 text-sm mt-1">{total} total users</p>
      </div>

      
      <div className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" placeholder="Search name or email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
          <option value="all">All Roles</option>
          <option value="customer">Customer</option>
          <option value="shopkeeper">Shopkeeper</option>
        </select>
      </div>

     
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {loading ? <Loader text="Loading users..." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">User</th>
                  <th className="px-5 py-3 text-left">Role</th>
                  <th className="px-5 py-3 text-left">Joined</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-stone-400">No users found</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id} className={`hover:bg-stone-50 transition-colors ${u.isBanned ? "opacity-60" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-800">{u.name}</p>
                          <p className="text-xs text-stone-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize
                        ${u.role==="shopkeeper"?"bg-blue-100 text-blue-700":"bg-green-100 text-green-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                        ${u.isBanned ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {u.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleBan(u._id, u.isBanned)}
                          title={u.isBanned ? "Unban" : "Ban"}
                          className={`p-1.5 rounded-lg transition-colors
                            ${u.isBanned
                              ? "text-green-600 hover:bg-green-50"
                              : "text-amber-600 hover:bg-amber-50"}`}>
                          {u.isBanned ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(u._id)}
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

export default AdminUsers;