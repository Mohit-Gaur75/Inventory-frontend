import { useState, useEffect } from "react";
import { getReviews, addReview, deleteReview } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Star, Trash2, MessageSquare } from "lucide-react";

const StarInput = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)}>
        <Star className={`w-6 h-6 transition-colors
          ${star <= value ? "text-amber-400 fill-amber-400" : "text-stone-300 hover:text-amber-300"}`} />
      </button>
    ))}
  </div>
);


const StarDisplay = ({ value, size = "sm" }) => {
  const sz = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`${sz} ${star <= value ? "text-amber-400 fill-amber-400" : "text-stone-200"}`} />
      ))}
    </div>
  );
};

const ReviewSection = ({ shopId }) => {
  const { user }  = useAuth();
  const [data, setData]         = useState({ reviews: [], avgRating: 0, totalReviews: 0, distribution: {} });
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating]     = useState(0);
  const [comment, setComment]   = useState("");

  const fetchReviews = async () => {
    try {
      const res = await getReviews(shopId);
      setData(res.data);
    } catch {
      setData({ reviews: [], avgRating: 0, totalReviews: 0, distribution: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, [shopId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error("Please select a star rating");
    setSubmitting(true);
    try {
      await addReview(shopId, { rating, comment });
      toast.success("Review submitted! ⭐");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteReview(shopId);
      toast.success("Review deleted");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  
  const myReview = data.reviews.find((r) => r.user?._id === user?._id);

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-stone-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-orange-500" />
        Reviews & Ratings
      </h2>

     
      {!loading && data.totalReviews > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row gap-6">
         
          <div className="text-center sm:border-r sm:border-stone-100 sm:pr-6">
            <p className="text-6xl font-display font-bold text-stone-800">{data.avgRating}</p>
            <StarDisplay value={Math.round(data.avgRating)} size="md" />
            <p className="text-xs text-stone-400 mt-1">{data.totalReviews} review{data.totalReviews !== 1 ? "s" : ""}</p>
          </div>

          
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data.distribution?.[star] || 0;
              const pct   = data.totalReviews ? Math.round((count / data.totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 w-4">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-stone-400 w-6">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      
      {user && user.role === "customer" && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h3 className="font-semibold text-stone-700 mb-4">
            {myReview ? "Update Your Review" : "Write a Review"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-stone-600 mb-2">Your Rating *</label>
              <StarInput value={rating || myReview?.rating || 0} onChange={setRating} />
            </div>
            <div>
              <label className="block text-sm text-stone-600 mb-1.5">Comment (optional)</label>
              <textarea
                value={comment || ""}
                onChange={(e) => setComment(e.target.value)}
                placeholder={myReview?.comment || "Share your experience with this shop..."}
                rows={3} maxLength={500}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              />
              <p className="text-xs text-stone-400 mt-1 text-right">{comment.length}/500</p>
            </div>
            <div className="flex gap-3">
              {myReview && (
                <button type="button" onClick={handleDelete}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm">
                {submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
              </button>
            </div>
          </form>
        </div>
      )}

    
      {!user && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center text-sm text-stone-500">
          <a href="/login" className="text-orange-500 font-semibold hover:underline">Login</a> to leave a review
        </div>
      )}

    
      {loading ? (
        <p className="text-stone-400 text-sm text-center py-6">Loading reviews...</p>
      ) : data.reviews.length === 0 ? (
        <div className="text-center py-10 text-stone-400">
          <MessageSquare className="w-10 h-10 text-stone-200 mx-auto mb-2" />
          <p className="text-sm">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.reviews.map((r) => (
            <div key={r._id} className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                    {r.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-700">{r.user?.name}</p>
                    <p className="text-xs text-stone-400">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <StarDisplay value={r.rating} />
              </div>
              {r.comment && (
                <p className="text-sm text-stone-600 mt-3 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;