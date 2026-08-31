import React, { useState } from "react";
import { useStore } from "../../lib/store";
import { SEED_REVIEWS, type Review } from "../../data/catalog";
import { Ic, Modal } from "../ui";

interface AdminReview extends Review {
  verified?: boolean;
}

export function ReviewsManager() {
  const { toast } = useStore();
  const [reviews, setReviews] = useState<AdminReview[]>(
    SEED_REVIEWS.map((r, i) => ({ ...r, verified: i % 2 === 0 }))
  );
  const [filterRating, setFilterRating] = useState<string>("ALL");
  const [replyModal, setReplyModal] = useState<AdminReview | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleToggleFeature = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, verified: !r.verified } : r))
    );
    toast("success", "Review status updated on website");
  };

  const handleDelete = (id: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    toast("info", "Review removed from storefront");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !replyModal) return;
    toast("success", `Reply sent to ${replyModal.name}: "${replyText}"`);
    setReplyModal(null);
    setReplyText("");
  };

  const filtered = reviews.filter((r) => {
    if (filterRating === "ALL") return true;
    return r.rating === Number(filterRating);
  });

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400" />
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink-50">
              Customer Reviews & UGC Photo Moderation
            </h2>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Moderate verified buyer ratings, customer feedback, and celebratory photos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-ink-900 border border-ink-700 px-3 py-1.5 rounded text-center">
            <span className="font-display text-lg font-bold text-gold-400">★ {avgRating}</span>
            <span className="text-[10px] font-mono text-ink-400 block">{reviews.length} Verified Reviews</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 bg-ink-900 border border-ink-700/70 p-2.5 rounded flex-wrap">
        <div className="flex items-center gap-1.5">
          {["ALL", "5", "4", "3", "2", "1"].map((stars) => (
            <button
              key={stars}
              onClick={() => setFilterRating(stars)}
              className={`px-3 py-1 font-mono text-xs uppercase rounded transition-colors ${
                filterRating === stars
                  ? "bg-blaze-500 text-ink-50 font-bold"
                  : "bg-ink-950 text-ink-400 hover:text-ink-100"
              }`}
            >
              {stars === "ALL" ? "All Stars" : `★ ${stars} Stars`}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((rev) => (
          <div key={rev.id} className="bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gold-400 font-bold text-sm">
                      {"★".repeat(rev.rating)}
                      <span className="text-ink-700">{"★".repeat(5 - rev.rating)}</span>
                    </span>
                    {rev.verified && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-sm font-bold text-ink-100 mt-1">{rev.title}</h3>
                </div>

                <span className="text-[10px] font-mono text-ink-400">{rev.date}</span>
              </div>

              <p className="text-xs text-ink-300 leading-relaxed italic">"{rev.text}"</p>

              <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-ink-400">
                <span>By {rev.name}</span>
                {rev.hasImage && <span className="text-emerald-400">📷 Photo Attached</span>}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-ink-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setReplyModal(rev)}
                className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 hover:text-ink-100 text-xs font-mono rounded"
              >
                💬 Reply to Customer
              </button>

              <div className="flex gap-1.5">
                <button
                  onClick={() => handleToggleFeature(rev.id)}
                  className={`px-2.5 py-1 text-xs font-mono rounded ${
                    rev.verified ? "bg-emerald-500/20 text-emerald-300" : "bg-ink-900 text-ink-400"
                  }`}
                  title="Toggle verified badge"
                >
                  {rev.verified ? "Verified" : "Unverified"}
                </button>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="px-2.5 py-1 text-xs font-mono text-rose-400 hover:bg-rose-500/10 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <Modal open={!!replyModal} onClose={() => setReplyModal(null)}>
          <form onSubmit={handleSendReply} className="p-4 sm:p-6 bg-ink-900 max-w-md mx-auto space-y-3">
            <div className="border-b border-ink-800 pb-2 mb-2">
              <h3 className="font-display text-base font-bold uppercase text-ink-50">
                Reply to {replyModal.name}
              </h3>
            </div>
            <p className="text-xs text-ink-300 italic bg-ink-950 p-3 rounded">
              "{replyModal.text}"
            </p>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">
                Official Bakehouse Reply:
              </label>
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Thank you so much for celebrating your birthday with CakeUrban! We are thrilled..."
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-xs text-ink-100 focus:border-blaze-500 outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded transition-colors"
              >
                Publish Reply
              </button>
              <button
                type="button"
                onClick={() => setReplyModal(null)}
                className="px-4 py-2.5 bg-ink-800 text-ink-300 font-mono text-xs uppercase rounded hover:text-ink-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
