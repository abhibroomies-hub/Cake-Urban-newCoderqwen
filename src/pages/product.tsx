import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { NCR_PINCODE_DIRECTORY, resolveNcrPincode } from "../data/catalog";
import { Ic, PImg, Qty, Reveal, Stars, Tilt } from "../components/ui";
import { ProductCard } from "../components/product";
import { DeliverySlotPicker, type DeliverySlotValue, DELIVERY_SLOTS } from "../components/DeliverySlotPicker";
import { CustomerReviewsShowcase } from "../components/CustomerReviewsShowcase";

type PlaqueStyle = "gold" | "ivory" | "noir";

export default function ProductPage({ onAddToCartFlow }: { onAddToCartFlow: () => void }) {
  const { id } = useParams();
  const nav = useNavigate();
  const {
    products,
    fmt,
    t,
    cartAdd,
    toggleWish,
    wishlist,
    toggleCompare,
    compare,
    checkedPincode,
    setCheckedPincode,
    settings,
    toast,
  } = useStore();
  const p = products.find((x) => x.id === id);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(0);
  const [qty, setQtyV] = useState(1);
  const [acc, setAcc] = useState<string | null>(null);
  const [plaqueStyle, setPlaqueStyle] = useState<PlaqueStyle>("gold");
  const [pinInput, setPinInput] = useState(checkedPincode || "121007");
  const [pinError, setPinError] = useState("");
  const [includeRoses, setIncludeRoses] = useState(true);
  const [includeTruffles, setIncludeTruffles] = useState(true);
  const [includeCandles, setIncludeCandles] = useState(true);

  // Live Express Dispatch Countdown Timer
  const baseMins = settings.seo?.expressCountdownMins || 28;
  const [secondsLeft, setSecondsLeft] = useState(baseMins * 60 + 42);
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 60 ? prev - 1 : baseMins * 60 + 59));
    }, 1000);
    return () => clearInterval(timer);
  }, [baseMins]);

  const countdownFormatted = useMemo(() => {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }, [secondsLeft]);

  const [slotChoice, setSlotChoice] = useState<DeliverySlotValue>({
    date: new Date().toISOString().slice(0, 10),
    slotId: "express",
    slotLabel: DELIVERY_SLOTS[0].label,
    windowText: DELIVERY_SLOTS[0].window,
    surcharge: DELIVERY_SLOTS[0].surcharge,
    plaqueMessage: "Happy Birthday!",
    includeKit: true,
  });

  const resolvedPin = useMemo(
    () => resolveNcrPincode(checkedPincode || "121007") || NCR_PINCODE_DIRECTORY[0],
    [checkedPincode]
  );

  const roseProduct = products.find((x) => x.id === "addon-rose-petals");
  const truffleProduct = products.find((x) => x.id === "addon-ferrero-truffle-box");
  const candleProduct = products.find((x) => x.id === "addon-sparkle-candle");

  const comboDiscountPct = settings.seo?.comboDiscountPct || 15;

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

  const comboRegularTotal =
    p.price +
    (includeRoses && roseProduct ? roseProduct.price : 0) +
    (includeTruffles && truffleProduct ? truffleProduct.price : 0) +
    (includeCandles && candleProduct ? candleProduct.price : 0);
  const comboDiscountedTotal = Number((comboRegularTotal * (1 - comboDiscountPct / 100)).toFixed(2));
  const comboSavings = Number((comboRegularTotal - comboDiscountedTotal).toFixed(2));

  const handleCheckPincode = (e?: React.FormEvent, customVal?: string) => {
    if (e) e.preventDefault();
    const target = (customVal ?? pinInput).trim();
    const found = resolveNcrPincode(target);
    if (!found) {
      setPinError("Enter a valid Delhi NCR Pincode (121xxx, 122xxx, 201xxx, 110xxx) or Sector name.");
      return;
    }
    setPinError("");
    setPinInput(found.pincode);
    setCheckedPincode(found.pincode);
    toast("success", `✓ Express ${found.etaMins} delivery verified for ${found.areaName} (${found.pincode})`);
  };

  const handleAddComboBundle = () => {
    cartAdd(p.id, p.colors[color]?.name || "Original", p.sizes[size] || "Standard", 1, true);
    if (includeRoses && roseProduct) {
      cartAdd(roseProduct.id, roseProduct.colors[0].name, roseProduct.sizes[0], 1, true);
    }
    if (includeTruffles && truffleProduct) {
      cartAdd(truffleProduct.id, truffleProduct.colors[0].name, truffleProduct.sizes[0], 1, true);
    }
    if (includeCandles && candleProduct) {
      cartAdd(candleProduct.id, candleProduct.colors[0].name, candleProduct.sizes[0], 1, true);
    }
    toast("success", `🎉 Celebration Combo added! Use code COMBO15 in bag for ${comboDiscountPct}% OFF.`);
    onAddToCartFlow();
  };

  const handleWhatsAppExpressOrder = () => {
    const selectedColor = p.colors[color]?.name || "Signature";
    const selectedSize = p.sizes[size] || "Standard";
    const slotText = `${slotChoice.slotLabel} (${slotChoice.date} · ${slotChoice.windowText})`;
    const plaque = slotChoice.plaqueMessage ? `\n🎂 Cake Plaque (${plaqueStyle.toUpperCase()}): "${slotChoice.plaqueMessage}"` : "";
    const pinLine = `\n📍 Delivery Area: ${resolvedPin.areaName}, ${resolvedPin.city} (${resolvedPin.pincode})`;
    const msg = `Hi CakeUrban! Express Order:\n\n🍰 *${p.name}* (${p.sku})\n🎨 Variant: ${selectedColor} | Size: ${selectedSize} | Qty: ${qty}\n💰 Price: ${fmt(p.price * qty + slotChoice.surcharge)}\n🚚 Slot: ${slotText}${pinLine}${plaque}`;
    window.open(`https://wa.me/917318531953?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-none mx-auto px-3.5 sm:px-5 lg:px-6 xl:px-8 py-5 sm:py-9">
      {/* Compact Breadcrumb */}
      <nav className="font-mono text-[10px] tracking-[0.15em] text-ink-400 uppercase flex items-center gap-1.5 mb-4 sm:mb-6 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link to="/" className="hover:text-blaze-400">Home</Link> /
        <Link to={`/shop?cat=${encodeURIComponent(p.category)}`} className="hover:text-blaze-400">{p.category}</Link> /
        <span className="text-ink-200 truncate">{p.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
        {/* Left: Product Photo Gallery + Live Interactive Cake Name Preview */}
        <div className="min-w-0 space-y-3">
          <Tilt max={6} className="relative">
            <div className="relative bg-ink-850 clip-tile border border-ink-700/60 overflow-hidden">
              <div className="absolute inset-0 grid-lines opacity-50" />
              {p.tag && (
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 clip-tag bg-blaze-500 text-ink-50 font-mono text-[10px] tracking-[0.18em] px-2.5 py-1">
                  {p.tag}
                </span>
              )}

              {/* Low-stock urgency badge on photo */}
              <span className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-ink-950/90 border border-gold-400/50 text-gold-400 font-mono text-[10px] px-2.5 py-1">
                🔥 Only {Math.min(p.stock, 5)} Fresh Batch Left
              </span>

              <PImg
                key={`${p.id}-${color}`}
                src={p.img}
                crop={p.crop}
                filter={filter}
                alt={p.name}
                className="w-full aspect-square object-cover anim-fade-in"
              />

              {/* Live Cake Name / Chocolate Plaque Preview Overlay */}
              {slotChoice.plaqueMessage.trim().length > 0 && (
                <div className="absolute inset-x-0 bottom-5 z-20 flex flex-col items-center justify-center px-4 pointer-events-none">
                  <div
                    className={`px-5 py-2.5 rounded-full shadow-2xl border-2 transition-all duration-200 max-w-[88%] text-center ${
                      plaqueStyle === "gold"
                        ? "bg-[#24130b]/95 border-[#e4b35a] text-[#f7d37e] font-display italic tracking-wide"
                        : plaqueStyle === "ivory"
                        ? "bg-[#fbf4e4]/95 border-[#c99e52] text-[#2d180e] font-display font-bold tracking-normal"
                        : "bg-ink-950/95 border-ink-400 text-ink-50 font-mono uppercase tracking-[0.16em]"
                    }`}
                  >
                    <span className="block text-[9px] font-mono uppercase tracking-[0.22em] opacity-75 mb-0.5">
                      LIVE CAKE PLAQUE PREVIEW
                    </span>
                    <span className="text-sm sm:text-base font-bold break-words">
                      “{slotChoice.plaqueMessage}”
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Tilt>

          {/* Interactive Live Cake Name Studio Control Bar */}
          <div className="border border-ink-700/80 bg-ink-900/95 p-3.5 sm:p-4 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                <Ic.sparkle className="w-3.5 h-3.5" /> Live Name / Message on Cake Preview (Free)
              </label>
              <span className="font-mono text-[10px] text-ink-400 tabular-nums">
                {slotChoice.plaqueMessage.length}/32 chars
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={32}
                value={slotChoice.plaqueMessage}
                onChange={(e) => setSlotChoice({ ...slotChoice, plaqueMessage: e.target.value })}
                placeholder="Type name on cake (e.g. Happy Birthday Rahul!)"
                className="flex-1 bg-ink-950 border border-ink-600 focus:border-gold-400 outline-none px-3 py-2 text-xs sm:text-sm text-ink-100 rounded"
              />
              <div className="flex gap-1 shrink-0">
                {(
                  [
                    ["gold", "Choc Gold"],
                    ["ivory", "White Script"],
                    ["noir", "Modern Noir"],
                  ] as const
                ).map(([st, label]) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setPlaqueStyle(st)}
                    className={`px-2.5 py-1.5 font-mono text-[10px] uppercase rounded border transition-colors whitespace-nowrap ${
                      plaqueStyle === st
                        ? "bg-gold-400 text-ink-950 border-gold-400 font-bold"
                        : "bg-ink-950 text-ink-300 border-ink-700 hover:border-ink-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <span className="font-mono text-[9px] text-ink-500 uppercase shrink-0">Quick Presets:</span>
              {["Happy Birthday!", "Happy Anniversary ❤️", "Best Wishes!", "Congrats SuperStar ✨"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSlotChoice({ ...slotChoice, plaqueMessage: preset })}
                  className="px-2 py-0.5 bg-ink-950 hover:bg-ink-800 border border-ink-800 text-ink-300 font-mono text-[10px] rounded whitespace-nowrap transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {p.colors.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {p.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setColor(i)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 clip-tag overflow-hidden border-2 transition-all ${
                    i === color ? "border-blaze-500 scale-105" : "border-ink-700 opacity-60 hover:opacity-100"
                  }`}
                >
                  <PImg src={p.img} crop={p.crop} filter={p.imgFilter ?? c.filter} alt={c.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Conversion-Optimized Buy Box */}
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-mono text-[10px] tracking-[0.2em] text-volt-400 uppercase font-bold">
              🌱 100% Pure Eggless · Freshly Baked to Order
            </span>
            <div className="flex items-center gap-1.5 text-ink-300 text-xs">
              <Stars value={p.rating} /> <span className="font-mono tabular-nums">{p.rating.toFixed(1)} ({p.ratingCount})</span>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-black uppercase leading-tight mt-2">{p.name}</h1>

          <div className="flex items-baseline gap-3 mt-3 flex-wrap">
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

          {/* Express Dispatch Countdown & Urgency Strip */}
          <div className="mt-4 p-3 rounded-lg bg-blaze-500/10 border border-blaze-500/30 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-ink-100">
              <Ic.bolt className="w-4 h-4 text-blaze-400 shrink-0" />
              <span>
                Order within <strong className="font-mono tabular-nums text-blaze-400">{countdownFormatted}</strong> for guaranteed{" "}
                <strong className="text-ink-50">{resolvedPin.etaMins}</strong> chilled delivery
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase text-emerald-400 font-bold">
              {resolvedPin.ridersOnline} Riders Ready · {resolvedPin.city}
            </span>
          </div>

          {/* Instant NCR Pincode & Sector Delivery Checker */}
          <div className="mt-4 p-3.5 rounded-lg border border-ink-700/80 bg-ink-900/90 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-100 flex items-center gap-1.5">
                <Ic.pin className="w-3.5 h-3.5 text-blaze-500" /> Instant NCR Pincode & Sector Checker
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">
                ✓ Free Knife, Candles & Card Included
              </span>
            </div>

            <form onSubmit={(e) => handleCheckPincode(e)} className="flex gap-2">
              <input
                type="text"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter NCR Pincode (e.g. 121007, 122002, 201301)"
                className="flex-1 bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 font-mono text-xs text-ink-100 rounded outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-ink-100 hover:bg-blaze-500 text-ink-950 hover:text-ink-50 font-mono text-xs font-bold uppercase tracking-wider rounded transition-colors shrink-0"
              >
                Check ETA
              </button>
            </form>

            {pinError ? (
              <p className="font-mono text-[11px] text-danger-400">{pinError}</p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-200 bg-ink-950/80 border border-ink-800 px-3 py-2 rounded">
                <div>
                  <span className="text-emerald-400 font-mono font-bold">✓ {resolvedPin.etaMins} Express</span>
                  <span className="mx-1.5 text-ink-600">·</span>
                  <span className="font-medium">{resolvedPin.areaName}, {resolvedPin.city} ({resolvedPin.pincode})</span>
                </div>
                <span className="font-mono text-[10px] text-ink-400">
                  Hub: {resolvedPin.hubName} ({resolvedPin.distanceKm})
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
              <span className="font-mono text-[9px] text-ink-500 uppercase shrink-0">Popular Hubs:</span>
              {NCR_PINCODE_DIRECTORY.slice(0, 5).map((entry) => (
                <button
                  key={entry.pincode}
                  type="button"
                  onClick={() => handleCheckPincode(undefined, entry.pincode)}
                  className={`px-2 py-0.5 font-mono text-[10px] rounded border whitespace-nowrap transition-colors ${
                    resolvedPin.pincode === entry.pincode
                      ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-bold"
                      : "border-ink-800 bg-ink-950 text-ink-400 hover:text-ink-200"
                  }`}
                >
                  {entry.city} ({entry.pincode})
                </button>
              ))}
            </div>
          </div>

          {/* Variant & Size Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase mb-1.5">
                {t("colorway")}: <span className="text-ink-100">{p.colors[color].name}</span>
              </p>
              <div className="flex gap-2">
                {p.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(i)}
                    title={c.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      i === color ? "border-blaze-500 scale-110" : "border-ink-600"
                    }`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            {p.sizes.length > 0 && (
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase mb-1.5">{t("size")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.sizes.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => setSize(i)}
                      className={`px-3 py-1.5 border font-mono text-xs transition-colors ${
                        i === size
                          ? "bg-ink-100 text-ink-950 border-ink-100 font-bold"
                          : "border-ink-600 text-ink-200 hover:border-blaze-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary Actions */}
          <div className="flex items-center gap-2.5 mt-5">
            <Qty value={qty} onChange={setQtyV} max={Math.max(1, p.stock)} />
            <button
              onClick={() => {
                cartAdd(p.id, p.colors[color].name, p.sizes[size], qty);
                onAddToCartFlow();
              }}
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
            <button
              onClick={() => toggleWish(p.id)}
              aria-label={t("wishlist")}
              className={`px-3.5 border flex items-center justify-center transition-colors ${
                wished ? "border-blaze-500 text-blaze-400" : "border-ink-600 text-ink-300"
              }`}
            >
              <Ic.heart className="w-4 h-4" filled={wished} />
            </button>
            <button
              onClick={() => toggleCompare(p.id)}
              aria-label={t("compare")}
              className={`px-3.5 border flex items-center justify-center transition-colors ${
                compared ? "border-cobalt-400 text-cobalt-300" : "border-ink-600 text-ink-300"
              }`}
            >
              <Ic.scale className="w-4 h-4" />
            </button>
          </div>

          {/* 1-Click Celebration Combo Bundle (Cake + Flowers + Chocolates + Candles) */}
          <div className="mt-5 border border-gold-400/40 bg-ink-900/95 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-gold-400 font-bold">
                  🎁 COMPLETE CELEBRATION COMBO · SAVE {comboDiscountPct}% (CODE: COMBO15)
                </span>
                <h3 className="font-display text-sm sm:text-base font-bold text-ink-50 mt-0.5">
                  Pair with Fresh Roses, Rocher Truffles & Sparkle Candles
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-volt-400 tabular-nums">
                Save {fmt(comboSavings)}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {roseProduct && (
                <label className="flex items-center justify-between gap-3 p-2 rounded bg-ink-950/80 border border-ink-800 cursor-pointer hover:border-ink-600">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={includeRoses}
                      onChange={(e) => setIncludeRoses(e.target.checked)}
                      className="accent-blaze-500"
                    />
                    <span className="truncate text-ink-100 font-medium">🌹 {roseProduct.name}</span>
                  </span>
                  <span className="font-mono tabular-nums text-ink-200 shrink-0">+{fmt(roseProduct.price)}</span>
                </label>
              )}

              {truffleProduct && (
                <label className="flex items-center justify-between gap-3 p-2 rounded bg-ink-950/80 border border-ink-800 cursor-pointer hover:border-ink-600">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={includeTruffles}
                      onChange={(e) => setIncludeTruffles(e.target.checked)}
                      className="accent-blaze-500"
                    />
                    <span className="truncate text-ink-100 font-medium">🍫 {truffleProduct.name}</span>
                  </span>
                  <span className="font-mono tabular-nums text-ink-200 shrink-0">+{fmt(truffleProduct.price)}</span>
                </label>
              )}

              {candleProduct && (
                <label className="flex items-center justify-between gap-3 p-2 rounded bg-ink-950/80 border border-ink-800 cursor-pointer hover:border-ink-600">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={includeCandles}
                      onChange={(e) => setIncludeCandles(e.target.checked)}
                      className="accent-blaze-500"
                    />
                    <span className="truncate text-ink-100 font-medium">✨ {candleProduct.name}</span>
                  </span>
                  <span className="font-mono tabular-nums text-ink-200 shrink-0">+{fmt(candleProduct.price)}</span>
                </label>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              <div>
                <span className="font-mono text-[10px] text-ink-400 uppercase block">Combo Bundle Total</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono tabnum text-lg font-bold text-gold-400">{fmt(comboDiscountedTotal)}</span>
                  <span className="font-mono tabnum text-xs text-ink-500 line-through">{fmt(comboRegularTotal)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddComboBundle}
                className="px-4 py-2.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-mono text-xs font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap"
              >
                + Add Complete Combo ({comboDiscountPct}% Off)
              </button>
            </div>
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

          {/* Collapsible Tabs for Description, Specs & Delivery */}
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
                  <p>• {resolvedPin.seoHook}</p>
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
      <div className="mt-8 sm:mt-10">
        <CustomerReviewsShowcase productId={p.id} title="Customer Reviews & Photos" />
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase mb-4">Pairs well with</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
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
