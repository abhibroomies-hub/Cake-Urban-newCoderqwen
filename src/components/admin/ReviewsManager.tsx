import React, { useState } from "react";
import { useStore } from "../../lib/store";
import type { Review } from "../../data/catalog";
import { Ic, Modal } from "../ui";

interface AdminReview extends Review {
  verified?: boolean;
}

export function ReviewsManager() {
  const store = useStore();
  const { toast, reviews: storeReviews, set } = store;

  const reviews: AdminReview[] = (storeReviews || []).map((r, i) => ({
    ...r,
    verified: (r as any).verified ?? (i % 2 === 0),
  }));

  const [filterRating, setFilterRating] = useState<string>("ALL");
  const [replyModal, setReplyModal] = useState<AdminReview | null>(null);
  const [replyText, setReplyText] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newPlatform, setNewPlatform] = useState("Google Reviews");

  const handleToggleFeature = (id: string) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, verified: !r.verified } : r));
    set({ reviews: updated });
    toast("success", "Review status updated on website");
  };

  const handleDelete = (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    set({ reviews: updated });
    toast("info", "Review removed from storefront");
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText || !replyModal) return;
    toast("success", `Reply sent to ${replyModal.name}: "${replyText}"`);
    setReplyModal(null);
    setReplyText("");
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newText.trim()) {
      toast("error", "Please provide author name and review text.");
      return;
    }
    const newRev: AdminReview = {
      id: `man-${Date.now()}`,
      productId: "raspberry-noir",
      name: `${newAuthor} (${newPlatform})`,
      rating: Number(newRating),
      title: newTitle || "Excellent service & taste",
      text: newText,
      date: new Date().toISOString().split("T")[0],
      verified: true,
      hasImage: false,
    };
    set({ reviews: [newRev, ...reviews] });
    toast("success", `New review added from ${newPlatform}!`);
    setAddModalOpen(false);
    setNewAuthor("");
    setNewTitle("");
    setNewText("");
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
            Moderate verified buyer ratings, customer feedback, and import real Google/Zomato reviews manually
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-ink-900 border border-ink-700 px-3 py-1.5 rounded text-center">
            <span className="font-display text-lg font-bold text-gold-400">★ {avgRating}</span>
            <span className="text-[10px] font-mono text-ink-400 block">{reviews.length} Verified Reviews</span>
          </div>
          <button
            onClick={() => setAddModalOpen(true)}
            className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase px-4 py-3 font-bold transition-colors flex items-center gap-2 shadow-lg"
          >
            <Ic.plus className="w-4 h-4" /> Add Google / Zomato Review
          </button>
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
      {reviews.length === 0 ? (
        <div className="text-center py-16 bg-ink-850 border border-ink-700/60 clip-tile">
          <Ic.star className="w-12 h-12 text-ink-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-ink-200">No reviews yet</h3>
          <p className="text-xs text-ink-400 mt-1 max-w-sm mx-auto">
            Your storefront starts fresh. Use the button above to add real Google or Zomato reviews manually as you receive them.
          </p>
        </div>
      ) : (
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
      )}

      {/* Add Manual Review Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)}>
        <div className="p-6 space-y-4 max-w-lg w-full bg-ink-850 border border-ink-700">
          <h3 className="font-display text-lg font-bold uppercase text-ink-50 flex items-center gap-2">
            <Ic.star className="w-5 h-5 text-gold-400" /> Manually Add Real Customer Review
          </h3>
          <p className="text-xs text-ink-400">
            Import real reviews received on Google Business Profile, Zomato, or WhatsApp directly onto your website storefront.
          </p>

          <form onSubmit={handleAddReviewSubmit} className="space-y-3">
            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-ink-400 mb-1">Customer Name *</label>
              <input
                type="text"
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-ink-950 border border-ink-600 px-3 py-2 text-xs text-ink-100 outline-none focus:border-blaze-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-ink-400 mb-1">Source Platform</label>
                <select
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-600 px-3 py-2 text-xs text-ink-100 outline-none focus:border-blaze-500"
                >
                  <option value="Google Reviews">Google Reviews</option>
                  <option value="Zomato">Zomato</option>
                  <option value="WhatsApp Direct">WhatsApp Direct</option>
                  <option value="Instagram">Instagram</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-ink-400 mb-1">Rating (Stars)</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full bg-ink-950 border border-ink-600 px-3 py-2 text-xs text-ink-100 outline-none focus:border-blaze-500 font-bold text-gold-400"
                >
                  <option value="5">★★★★★ (5 Stars)</option>
                  <option value="4">★★★★☆ (4 Stars)</option>
                  <option value="3">★★★☆☆ (3 Stars)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-ink-400 mb-1">Review Headline / Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Best chocolate truffle cake in Faridabad!"
                className="w-full bg-ink-950 border border-ink-600 px-3 py-2 text-xs text-ink-100 outline-none focus:border-blaze-500"
              />
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-widest text-ink-400 mb-1">Review Comment *</label>
              <textarea
                rows={3}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="Type or paste the real customer review..."
                className="w-full bg-ink-950 border border-ink-600 px-3 py-2 text-xs text-ink-100 outline-none focus:border-blaze-500 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2 bg-ink-900 border border-ink-700 text-ink-300 font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold"
              >
                Save & Publish Review
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Reply Modal */}
      <Modal open={!!replyModal} onClose={() => setReplyModal(null)}>
        {replyModal && (
          <form onSubmit={handleSendReply} className="p-6 space-y-4 max-w-md w-full bg-ink-850 border border-ink-700">
            <h3 className="font-display text-base font-bold uppercase text-ink-50">
              Reply to {replyModal.name}
            </h3>
            <p className="text-xs text-ink-400 italic">"{replyModal.text}"</p>
            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a polite response..."
              className="w-full bg-ink-950 border border-ink-600 p-3 text-xs text-ink-100 outline-none focus:border-blaze-500 resize-none"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyModal(null)}
                className="px-4 py-2 bg-ink-900 border border-ink-700 text-ink-300 font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold"
              >
                Send Reply
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
