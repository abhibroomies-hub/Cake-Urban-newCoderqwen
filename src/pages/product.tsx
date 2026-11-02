import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { Ic, PImg, Qty, Reveal, Stars, Tilt } from "../components/ui";
import { ProductCard } from "../components/product";
import { DeliverySlotPicker, type DeliverySlotValue, DELIVERY_SLOTS } from "../components/DeliverySlotPicker";
import { CustomerReviewsShowcase } from "../components/CustomerReviewsShowcase";

export default function ProductPage({ onAddToCartFlow }: { onAddToCartFlow: () => void }) {
  const { id } = useParams();
  const nav = useNavigate();
  const { products, fmt, t, cartAdd, toggleWish, wishlist, toggleCompare, compare } = useStore();
  const p = products.find((x) => x.id === id);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(0);
  const [qty, setQtyV] = useState(1);
  const [acc, setAcc] = useState<string | null>(null);
  const [slotChoice, setSlotChoice] = useState<DeliverySlotValue>({
    date: new Date().toISOString().slice(0, 10),
    slotId: "express",
    slotLabel: DELIVERY_SLOTS[0].label,
    windowText: DELIVERY_SLOTS[0].window,
    surcharge: DELIVERY_SLOTS[0].surcharge,
    plaqueMessage: "",
    includeKit: true,
  });

  if (!p) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-display text-3xl font-black uppercase">Product not found</p>
        <Link to="/shop" className="clip-tag mt-5 inline-block border border-blaze-500 text-blaze-400 px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase">Back to shop</Link>
      </div>
    );
  }

  const filter = p.imgFilter ?? p.colors[color]?.filter;
  const wished = wishlist.includes(p.id);
  const compared = compare.includes(p.id);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const handleWhatsAppExpressOrder = () => {
    const selectedColor = p.colors[color]?.name || "Signature";
    const selectedSize = p.sizes[size] || "Standard";
    const slotText = `${slotChoice.slotLabel} (${slotChoice.date} · ${slotChoice.windowText})`;
    const plaque = slotChoice.plaqueMessage ? `\n🎂 Cake Message: "${slotChoice.plaqueMessage}"` : "";
    const msg = `Hi CakeUrban! Express Order:\n\n🍰 *${p.name}* (${p.sku})\n🎨 Variant: ${selectedColor} | Size: ${selectedSize} | Qty: ${qty}\n💰 Price: ${fmt(p.price * qty + slotChoice.surcharge)}\n🚚 Slot: ${slotText}${plaque}`;
    window.open(`https://wa.me/917318531953?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 sm:py-9">
      {/* Compact Breadcrumb */}
      <nav className="font-mono text-[10px] tracking-[0.15em] text-ink-400 uppercase flex items-center gap-1.5 mb-4 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link to="/" className="hover:text-blaze-400">Home</Link> /
        <Link to={`/shop?cat=${encodeURIComponent(p.category)}`} className="hover:text-blaze-400">{p.category}</Link> /
        <span className="text-ink-200 truncate">{p.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
        {/* Left: Product Photo Gallery */}
        <div>
          <Tilt max={7} className="relative">
            <div className="relative bg-ink-850 clip-tile border border-ink-700/60 overflow-hidden">
              <div className="absolute inset-0 grid-lines opacity-50" />
              {p.tag && <span className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 clip-tag bg-blaze-500 text-ink-50 font-mono text-[10px] tracking-[0.18em] px-2.5 py-1">{p.tag}</span>}
              <PImg key={`${p.id}-${color}`} src={p.img} crop={p.crop} filter={filter} alt={p.name} className="w-full aspect-square object-cover anim-fade-in" />
            </div>
          </Tilt>

          {p.colors.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
              {p.colors.map((c, i) => (
                <button key={c.name} onClick={() => setColor(i)} className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 clip-tag overflow-hidden border-2 transition-all ${i === color ? "border-blaze-500 scale-105" : "border-ink-700 opacity-60 hover:opacity-100"}`}>
                  <PImg src={p.img} crop={p.crop} filter={p.imgFilter ?? c.filter} alt={c.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Clean Buy Box */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-volt-400 uppercase font-bold">🌱 100% Pure Eggless</span>
            <div className="flex items-center gap-1.5 text-ink-300 text-xs">
              <Stars value={p.rating} /> <span className="font-mono">{p.rating.toFixed(1)} ({p.ratingCount})</span>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-black uppercase leading-tight mt-2">{p.name}</h1>

          <div className="flex items-baseline gap-3 mt-3">
            <span className="font-mono tabnum text-3xl sm:text-4xl font-bold text-ink-50">{fmt(p.price)}</span>
            {p.compareAt && (
              <>
                <span className="font-mono tabnum text-lg text-ink-500 line-through">{fmt(p.compareAt)}</span>
                <span className="clip-tag bg-volt-400/15 text-volt-400 font-mono text-[11px] px-2 py-0.5 font-bold">
                  SAVE {Math.round((1 - p.price / p.compareAt) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Variant & Size Selectors */}
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase mb-1.5">
                {t("colorway")}: <span className="text-ink-100">{p.colors[color].name}</span>
              </p>
              <div className="flex gap-2">
                {p.colors.map((c, i) => (
                  <button key={c.name} onClick={() => setColor(i)} title={c.name} className={`w-8 h-8 rounded-full border-2 transition-transform ${i === color ? "border-blaze-500 scale-110" : "border-ink-600"}`} style={{ background: c.hex }} />
                ))}
              </div>
            </div>

            {p.sizes.length > 0 && (
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase mb-1.5">{t("size")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.sizes.map((s, i) => (
                    <button key={s} onClick={() => setSize(i)} className={`px-3 py-1.5 border font-mono text-xs transition-colors ${i === size ? "bg-ink-100 text-ink-950 border-ink-100 font-bold" : "border-ink-600 text-ink-200 hover:border-blaze-500"}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2.5 mt-5">
            <Qty value={qty} onChange={setQtyV} max={Math.max(1, p.stock)} />
            <button
              onClick={() => { cartAdd(p.id, p.colors[color].name, p.sizes[size], qty); onAddToCartFlow(); }}
              disabled={p.stock <= 0}
              className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 disabled:opacity-40 text-ink-50 font-mono text-xs sm:text-sm tracking-[0.16em] uppercase py-3.5 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <Ic.bag className="w-4 h-4" /> {p.stock <= 0 ? t("outOfStock") : t("addToCart")}
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto] gap-2.5 mt-2.5">
            <button
              onClick={() => {
                cartAdd(p.id, p.colors[color]?.name || "Original", p.sizes[size] || "Standard", qty);
                nav("/checkout");
              }}
              disabled={p.stock <= 0}
              className="clip-btn bg-volt-500 hover:bg-volt-400 text-ink-950 font-bold disabled:opacity-40 py-3 font-mono text-xs tracking-[0.18em] uppercase transition-colors"
            >
              {t("buyNow")}
            </button>
            <button onClick={() => toggleWish(p.id)} aria-label={t("wishlist")} className={`px-3.5 border flex items-center justify-center transition-colors ${wished ? "border-blaze-500 text-blaze-400" : "border-ink-600 text-ink-300"}`}>
              <Ic.heart className="w-4 h-4" filled={wished} />
            </button>
            <button onClick={() => toggleCompare(p.id)} aria-label={t("compare")} className={`px-3.5 border flex items-center justify-center transition-colors ${compared ? "border-cobalt-400 text-cobalt-300" : "border-ink-600 text-ink-300"}`}>
              <Ic.scale className="w-4 h-4" />
            </button>
          </div>

          {/* Compact Delivery Slot Scheduler */}
          <div className="mt-5">
            <DeliverySlotPicker
              value={slotChoice}
              onChange={setSlotChoice}
              fmt={fmt}
              onWhatsAppOrder={handleWhatsAppExpressOrder}
            />
          </div>

          {/* Collapsible Tabs for Description, Specs & Delivery (Hidden by default) */}
          <div className="mt-5 border-t border-ink-800">
            {[
              [
                "desc",
                "Product Description & Ingredients",
                <div key="desc" className="space-y-3 text-xs sm:text-sm text-ink-300">
                  <p className="leading-relaxed">{p.desc}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {p.specs.map(([k, v]) => (
                      <div key={k} className="p-2.5 bg-ink-900 border border-ink-800 rounded">
                        <p className="font-mono text-[9px] text-blaze-400 uppercase">{k}</p>
                        <p className="font-display text-xs font-semibold text-ink-100 mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>,
              ],
              [
                "ship",
                "30-45 Min Express & Midnight Delivery",
                <div key="ship" className="space-y-1.5 text-xs sm:text-sm text-ink-300">
                  <p>• 30–45 min chilled dispatch across Faridabad, Noida, Gurgaon, Delhi & Ghaziabad.</p>
                  <p>• Midnight birthday slots (11:30 PM – 12:15 AM) with live rider tracking.</p>
                </div>,
              ],
              [
                "care",
                "100% Eggless Promise & Storage",
                <p key="care" className="text-xs sm:text-sm text-ink-300 leading-relaxed">
                  Baked fresh in a 100% pure vegetarian kitchen with Belgian couverture chocolate and dairy butter. Keep refrigerated (4°C–8°C).
                </p>,
              ],
            ].map(([key, label, body]) => (
              <div key={key as string} className="border-b border-ink-800">
                <button
                  onClick={() => setAcc(acc === key ? null : (key as string))}
                  className="w-full flex items-center justify-between py-3.5 font-mono text-xs tracking-[0.14em] uppercase text-ink-200 hover:text-blaze-400 transition-colors text-left"
                >
                  <span>{label as string}</span>
                  <Ic.chev className={`w-4 h-4 shrink-0 transition-transform ${acc === key ? "rotate-180 text-blaze-500" : ""}`} />
                </button>
                <div className="grid transition-all duration-300" style={{ gridTemplateRows: acc === key ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden"><div className="pb-4">{body}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Photo Reviews */}
      <div className="mt-10 -mx-4 sm:-mx-6 lg:-mx-10">
        <CustomerReviewsShowcase productId={p.id} title="Customer Reviews & Photos" />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase mb-4">Pairs well with</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
            {related.map((rp, i) => (
              <Reveal key={rp.id} delay={i * 60}>
                <ProductCard p={rp} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
