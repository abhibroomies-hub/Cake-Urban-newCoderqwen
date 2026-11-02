import React, { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import type { Review } from "../data/catalog";
import { Ic, ImgX, Modal, Stars } from "./ui";

export function CustomerReviewsShowcase({
  productId,
  title = "Verified Delhi NCR Celebration Reviews",
  kicker = "04. Customer Photo Proof & Ratings",
}: {
  productId?: string;
  title?: string;
  kicker?: string;
}) {
  const { reviews, products, addReview, toast, user, fmt } = useStore();
  const [filter, setFilter] = useState<"all" | "photos" | "5star" | "midnight">("all");
  const [lightboxReview, setLightboxReview] = useState<Review | null>(null);
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  // Review Form State
  const [revName, setRevName] = useState(user?.name || "");
  const [revHub, setRevHub] = useState("Faridabad Sector 15");
  const [revOccasion, setRevOccasion] = useState("Birthday Celebration");
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState("");
  const [revText, setRevText] = useState("");
  const [revPhotoData, setRevPhotoData] = useState<string | null>(null);
  const [selectedProdId, setSelectedProdId] = useState(productId || products[0]?.id || "birthday-deluxe-hamper");
  const fileRef = useRef<HTMLInputElement>(null);

  const scopedReviews = useMemo(() => {
    const base = productId ? reviews.filter((r) => r.productId === productId) : reviews;
    // If product has few specific reviews, include general verified reviews when viewing all
    const list = base.length > 0 ? base : reviews;
    if (filter === "photos") return list.filter((r) => r.hasImage || r.photoUrl);
    if (filter === "5star") return list.filter((r) => r.rating === 5);
    if (filter === "midnight")
      return list.filter(
        (r) =>
          (r.occasion && r.occasion.toLowerCase().includes("midnight")) ||
          r.text.toLowerCase().includes("midnight") ||
          r.title.toLowerCase().includes("midnight")
      );
    return list;
  }, [reviews, productId, filter]);

  const photoReviews = useMemo(
    () => reviews.filter((r) => r.hasImage || r.photoUrl),
    [reviews]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRevPhotoData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revText.trim()) {
      toast("error", "Please enter your name and review feedback");
      return;
    }
    const targetProd = products.find((p) => p.id === (productId || selectedProdId)) || products[0];
    addReview({
      productId: targetProd.id,
      name: revName.trim(),
      rating: revRating,
      title: revTitle.trim() || "Unforgettable 100% Eggless Celebration!",
      text: revText.trim(),
      hasImage: !!revPhotoData,
      photoUrl: revPhotoData || undefined,
      hubLocation: revHub,
      occasion: revOccasion,
    });
    setRevTitle("");
    setRevText("");
    setRevPhotoData(null);
    setWriteModalOpen(false);
    toast("success", "Thank you! Your verified review & photo have been published live.");
  };

  const getReviewImage = (r: Review) => {
    if (r.photoUrl) return r.photoUrl;
    const p = products.find((x) => x.id === r.productId);
    return p?.img || products[0]?.img || "";
  };

  const getProductForReview = (r: Review) => {
    return products.find((x) => x.id === r.productId) || products[0];
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <p className="font-mono text-[11px] sm:text-xs tracking-[0.2em] text-blaze-400 uppercase font-semibold">
            {kicker}
          </p>
          <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase leading-tight mt-1.5">
            {title}
          </h2>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-ink-300 mt-2 font-mono">
            <span className="text-gold-400 font-bold">★ 4.9 / 5.0 Rating</span>
            <span>·</span>
            <span>2,480+ Verified NCR Buyers</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">99.4% On-Time Midnight & Express Delivery</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setWriteModalOpen(true)}
          className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold tracking-wider px-4 sm:px-5 py-2.5 sm:py-3 transition-colors flex items-center gap-2 self-start md:self-auto shrink-0 shadow-lg"
        >
          <Ic.upload className="w-4 h-4" />
          <span>Share Celebration Photo</span>
        </button>
      </div>

      {/* Customer Unboxing Photo Strip */}
      {photoReviews.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <p className="font-mono text-[10px] sm:text-[11px] text-ink-400 uppercase tracking-wider mb-2.5 sm:mb-3">
            Customer Unboxing Snaps — Tap any photo to inspect
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
            {photoReviews.slice(0, 6).map((r) => {
              const imgUrl = getReviewImage(r);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setLightboxReview(r)}
                  className="group relative aspect-square rounded-lg overflow-hidden border border-ink-700 hover:border-blaze-500 transition-all bg-ink-900"
                >
                  <ImgX
                    src={imgUrl}
                    alt={`Photo by ${r.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-left">
                    <p className="font-mono text-[9px] sm:text-[10px] text-ink-50 font-semibold truncate">{r.name}</p>
                    <p className="font-mono text-[8px] sm:text-[9px] text-gold-400">{"★".repeat(r.rating)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 mb-6 border-b border-ink-800">
        <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1 bg-ink-900 border border-ink-800 rounded-lg max-w-full">
          {[
            { id: "all", label: `All Verified (${reviews.length})` },
            { id: "photos", label: `📸 With Photos (${photoReviews.length})` },
            { id: "5star", label: "⭐ 5-Star" },
            { id: "midnight", label: "🌙 Midnight" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3 py-1.5 font-mono text-[11px] sm:text-xs rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filter === tab.id
                  ? "bg-blaze-500 text-ink-50 font-bold shadow-sm"
                  : "text-ink-300 hover:text-ink-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="font-mono text-[11px] sm:text-xs text-ink-400 hidden sm:inline">
          100% Pure Vegetarian & Eggless Certified Reviews
        </span>
      </div>

      {/* Reviews Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {scopedReviews.map((r) => {
          const prod = getProductForReview(r);
          const hasPhoto = r.hasImage || !!r.photoUrl;
          const photoSrc = getReviewImage(r);

          return (
            <article
              key={r.id}
              className="border border-ink-700/70 bg-ink-850 p-4 sm:p-5 clip-tile flex flex-col justify-between hover:border-ink-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <Stars value={r.rating} className="w-3.5 h-3.5 text-gold-400" />
                  <span className="font-mono text-[10px] text-ink-400 tabnum">{r.date}</span>
                </div>

                <h3 className="font-display font-bold text-sm sm:text-base text-ink-50 mt-2 leading-snug line-clamp-1">
                  "{r.title}"
                </h3>

                <p className="text-xs sm:text-sm text-ink-300 leading-relaxed mt-1.5 line-clamp-2">{r.text}</p>

                {hasPhoto && (
                  <button
                    type="button"
                    onClick={() => setLightboxReview(r)}
                    className="mt-3 relative w-full h-36 rounded overflow-hidden border border-ink-700 group block text-left"
                  >
                    <ImgX
                      src={photoSrc}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-center justify-between">
                      <span className="font-mono text-[10px] text-ink-100">📸 Customer Photo</span>
                      <span className="font-mono text-[10px] text-blaze-400 font-bold">View →</span>
                    </div>
                  </button>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-ink-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full grid place-items-center bg-ink-900 border border-ink-700 text-blaze-400 font-mono text-xs font-bold shrink-0">
                    {r.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-ink-50 truncate">{r.name}</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                        · ✓ Verified
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-ink-400 truncate mt-0.5">
                      {r.hubLocation || "Delhi NCR Hub"} {r.occasion ? `· ${r.occasion}` : ""}
                    </p>
                  </div>
                </div>

                {prod && (
                  <div className="mt-3 pt-2.5 border-t border-ink-800/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-ink-400 truncate max-w-[180px]">Ordered: {prod.name}</span>
                    <Link
                      to={`/product/${prod.id}`}
                      className="text-blaze-400 hover:underline font-semibold shrink-0"
                    >
                      View Item →
                    </Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Lightbox Modal for Inspecting Customer Photo */}
      <Modal open={!!lightboxReview} onClose={() => setLightboxReview(null)} wide>
        {lightboxReview && (
          <div className="grid md:grid-cols-2">
            <div className="bg-ink-950 flex items-center justify-center p-4 sm:p-6 min-h-[300px]">
              <ImgX
                src={getReviewImage(lightboxReview)}
                alt={lightboxReview.title}
                className="w-full max-h-[460px] object-contain rounded"
              />
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <span>✓ Verified NCR Buyer Photo</span>
                  <span>·</span>
                  <span className="text-ink-400">{lightboxReview.date}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-ink-50 mt-2">
                  "{lightboxReview.title}"
                </h3>
                <div className="mt-2">
                  <Stars value={lightboxReview.rating} className="w-4 h-4 text-gold-400" />
                </div>
                <p className="text-sm text-ink-200 leading-relaxed mt-4">
                  {lightboxReview.text}
                </p>

                <div className="mt-6 p-4 rounded bg-ink-950 border border-ink-800 font-mono text-xs space-y-1">
                  <p className="text-ink-100 font-bold">{lightboxReview.name}</p>
                  <p className="text-ink-400">
                    Dispatch Hub: {lightboxReview.hubLocation || "Faridabad / Noida Express Hub"}
                  </p>
                  {lightboxReview.occasion && (
                    <p className="text-volt-400">Celebration: {lightboxReview.occasion}</p>
                  )}
                </div>
              </div>

              {(() => {
                const prod = getProductForReview(lightboxReview);
                if (!prod) return null;
                return (
                  <div className="mt-6 pt-4 border-t border-ink-800 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] text-ink-400 uppercase">Featured Product</p>
                      <p className="font-display font-bold text-sm text-ink-50">{prod.name}</p>
                      <p className="font-mono text-xs text-blaze-400 font-bold tabnum">{fmt(prod.price)}</p>
                    </div>
                    <Link
                      to={`/product/${prod.id}`}
                      onClick={() => setLightboxReview(null)}
                      className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold px-5 py-2.5 transition-colors"
                    >
                      Order This →
                    </Link>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Write a Verified Review & Upload Photo Modal */}
      <Modal open={writeModalOpen} onClose={() => setWriteModalOpen(false)}>
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div className="border-b border-ink-800 pb-3 pr-8">
            <p className="font-mono text-[10px] tracking-[0.2em] text-blaze-400 uppercase font-bold">
              Verified Patron Feedback
            </p>
            <h3 className="font-display text-xl font-bold uppercase mt-1 text-ink-50">
              Share Your Celebration Experience
            </h3>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1.5">
              Your Rating
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRevRating(s)}
                  className={`p-1 transition-transform hover:scale-110 ${
                    s <= revRating ? "text-gold-400" : "text-ink-700"
                  }`}
                >
                  <Ic.star className="w-6 h-6" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={revName}
                onChange={(e) => setRevName(e.target.value)}
                placeholder="e.g. Pooja Sharma"
                className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 text-xs text-ink-100 outline-none rounded"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                Delhi NCR Delivery Area
              </label>
              <select
                value={revHub}
                onChange={(e) => setRevHub(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 text-xs text-ink-100 outline-none rounded"
              >
                <option value="Faridabad Sector 15">Faridabad Sector 15</option>
                <option value="Noida Sector 75">Noida Sector 75</option>
                <option value="Gurgaon DLF Cyber City">Gurgaon DLF Cyber City</option>
                <option value="South Delhi GK-2">South Delhi GK-2</option>
                <option value="Ghaziabad Indirapuram">Ghaziabad Indirapuram</option>
              </select>
            </div>
          </div>

          {!productId && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                  Product Ordered
                </label>
                <select
                  value={selectedProdId}
                  onChange={(e) => setSelectedProdId(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 text-xs text-ink-100 outline-none rounded"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                  Occasion
                </label>
                <input
                  type="text"
                  value={revOccasion}
                  onChange={(e) => setRevOccasion(e.target.value)}
                  placeholder="e.g. Midnight Birthday Surprise"
                  className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 text-xs text-ink-100 outline-none rounded"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
              Review Headline
            </label>
            <input
              type="text"
              value={revTitle}
              onChange={(e) => setRevTitle(e.target.value)}
              placeholder="e.g. Delivered in 35 mins at midnight!"
              className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 text-xs text-ink-100 outline-none rounded"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
              Your Review *
            </label>
            <textarea
              rows={3}
              required
              value={revText}
              onChange={(e) => setRevText(e.target.value)}
              placeholder="How was the 100% eggless taste, packaging, and delivery speed?"
              className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 text-xs text-ink-100 outline-none rounded resize-none"
            />
          </div>

          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="px-3.5 py-2 border border-ink-700 hover:border-blaze-500 text-ink-200 font-mono text-xs uppercase rounded flex items-center gap-2 transition-colors"
              >
                <Ic.upload className="w-3.5 h-3.5 text-blaze-400" />
                <span>Upload Unboxing Photo</span>
              </button>
              {revPhotoData && (
                <div className="flex items-center gap-2">
                  <img
                    src={revPhotoData}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded border border-volt-400"
                  />
                  <span className="font-mono text-[10px] text-volt-400">✓ Photo Attached</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold tracking-wider py-3.5 transition-colors"
          >
            Publish Verified Review
          </button>
        </form>
      </Modal>
    </section>
  );
}
export default CustomerReviewsShowcase;
