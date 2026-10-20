import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAdminReviews, deleteAdminReview } from "../../api/axios";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";
import {
  Trash2, Star, ChevronLeft, ChevronRight, AlertTriangle,
  RefreshCw, Store, MessageSquare, ExternalLink
} from "lucide-react";

const StarDisplay = ({ value }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-3.5 h-3.5 ${
          s <= value ? "text-amber-400 fill-amber-400" : "text-slate-200"
        }`}
      />
    ))}
  </div>
);

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rating, setRating] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal for delete confirmation
  const [deleteModalReview, setDeleteModalReview] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminReviews({ rating, page, limit: 10 });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [rating, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const confirmDelete = async () => {
    if (!deleteModalReview) return;
    setIsDeleting(true);
    try {
      await deleteAdminReview(deleteModalReview._id);
      toast.success("Review deleted successfully");
      setDeleteModalReview(null);
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Review & Feedback Moderation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Monitor customer feedback, identify critical storefront issues, and moderate offensive comments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchReviews()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-200 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar with Star Rating Pills */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => { setRating("all"); setPage(1); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              rating === "all"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((r) => {
            const isActive = String(rating) === String(r);
            return (
              <button
                key={r}
                onClick={() => { setRating(r); setPage(1); }}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{r}</span>
                <Star className={`w-3.5 h-3.5 ${isActive ? "fill-white text-white" : "fill-amber-400 text-amber-400"}`} />
              </button>
            );
          })}
        </div>

        <div className="text-xs font-semibold text-slate-500 px-2">
          Total <span className="text-teal-700 font-bold">{total}</span> reviews
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20">
            <Loader text="Loading customer reviews..." />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No reviews found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no reviews matching your rating filter.
            </p>
            {rating !== "all" && (
              <button
                onClick={() => { setRating("all"); setPage(1); }}
                className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Show All Reviews
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: User, Store, Rating */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0 shadow-xs">
                      {r.user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {r.user?.name || "Verified Customer"}
                        </span>
                        <span className="text-xs text-slate-400">
                          {r.user?.email}
                        </span>
                        <div className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <StarDisplay value={r.rating} />
                          <span className="text-[11px] font-bold text-amber-800 ml-1">
                            {r.rating}.0
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Store className="w-3.5 h-3.5 text-teal-600" />
                          <span>{r.shop?.name || "Store"}</span>
                        </span>
                        {r.shop?._id && (
                          <Link
                            to={`/shop/${r.shop._id}`}
                            target="_blank"
                            className="text-teal-600 hover:text-teal-700"
                            title="View Storefront"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                        <span>·</span>
                        <span>
                          {new Date(r.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                      </div>

                      {/* Comment Box */}
                      {r.comment && (
                        <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-sm leading-relaxed">
                          "{r.comment}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Delete Action */}
                  <div className="self-end sm:self-start shrink-0">
                    <button
                      onClick={() => setDeleteModalReview(r)}
                      title="Delete / Moderate Review"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
      {deleteModalReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-slate-900">
              Delete Customer Review
            </h3>

            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to permanently remove this {deleteModalReview.rating}-star review by{" "}
              <strong className="text-slate-900">{deleteModalReview.user?.name || "Customer"}</strong> for{" "}
              <strong className="text-slate-900">{deleteModalReview.shop?.name || "Store"}</strong>?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalReview(null)}
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
                {isDeleting ? "Deleting..." : "Permanently Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
