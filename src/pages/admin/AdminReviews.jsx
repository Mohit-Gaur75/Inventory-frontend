import { useState, useEffect, useCallback } from "react";
import { getAdminReviews, deleteAdminReview } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import { Trash2, Star, ChevronLeft, ChevronRight } from "lucide-react";

const StarDisplay = ({ value }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(s => (
      <Star key={s} className={`w-3.5 h-3.5 ${s<=value?"text-amber-400 fill-amber-400":"text-slate-200"}`} />
    ))}
  </div>
);

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rating, setRating]   = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminReviews({ rating, page, limit: 10 });
      setReviews(data.reviews);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch { toast.error("Failed to load reviews"); }
    finally { setLoading(false); }
  }, [rating, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteAdminReview(id);
      toast.success("Review deleted");
      fetchReviews();
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900">Review Moderation</h1>
        <p className="text-slate-500 text-sm mt-1">{total} total store reviews</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-3 shadow-sm">
        <select value={rating} onChange={(e) => { setRating(e.target.value); setPage(1); }}
          className="px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
          <option value="all">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r>1?"s":""}</option>)}
        </select>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? <Loader text="Loading reviews..." /> : (
          <>
            {reviews.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Star className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                No customer reviews found matching filter
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <div key={r._id} className="px-5 py-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
                          {r.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-semibold text-slate-800 text-sm">{r.user?.name}</span>
                            <span className="text-xs text-slate-400">{r.user?.email}</span>
                            <StarDisplay value={r.rating} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Shop: <span className="font-semibold text-slate-700">{r.shop?.name}</span>
                            <span className="mx-2">·</span>
                            {new Date(r.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric"
                            })}
                          </p>
                          {r.comment && (
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                              {r.comment}
                            </p>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(r._id)}
                        title="Delete Review"
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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

export default AdminReviews;