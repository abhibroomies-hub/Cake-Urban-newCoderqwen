import { useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { Ic } from "../components/ui";

const ThreeCake = lazy(() => import("../components/ThreeCake").then((m) => ({ default: m.ThreeCake })));

const SIZES = [
  { id: "6", name: "0.5 Kg (6\")", sub: "4–6 Servings", price: 18, badge: "COUPLE" },
  { id: "8", name: "1.0 Kg (8\")", sub: "8–10 Servings", price: 32, badge: "MOST POPULAR" },
  { id: "10", name: "1.5 Kg (10\")", sub: "12–15 Servings", price: 46, badge: "PARTY" },
  { id: "12", name: "2.0 Kg (12\")", sub: "18–22 Servings · 2 Tier", price: 62, badge: "GRAND" },
];

const BASES = [
  { id: "chocolate", name: "72% Belgian Dark", desc: "Rich Valrhona fudge sponge", price: 4, hex: "#3d2217" },
  { id: "vanilla", name: "Madagascar Vanilla", desc: "Light organic vanilla génoise", price: 0, hex: "#f5e3c3" },
  { id: "redvelvet", name: "Crimson Red Velvet", desc: "Classic cocoa buttermilk crumb", price: 3, hex: "#8a1c2d" },
  { id: "matcha", name: "Pistachio Matcha", desc: "Roasted pistachio & green tea sponge", price: 4, hex: "#6e8b4e" },
];

const CREAMS = [
  { id: "ganache", name: "Belgian Dark Truffle", desc: "Silky 54% couverture ganache", price: 6, hex: "#24140d" },
  { id: "whipped", name: "Vanilla Chantilly", desc: "Whipped mascarpone cloud", price: 0, hex: "#fbf8f3" },
  { id: "mousse", name: "Hazelnut Choc Mousse", desc: "Whipped praline dark mousse", price: 4, hex: "#4a2a1f" },
  { id: "butter", name: "Golden Buttercream", desc: "French vanilla bean buttercream", price: 5, hex: "#fff3da" },
];

const FILLINGS = [
  { id: "raspberry-coulis", name: "Raspberry Coulis", price: 4, tag: "TANGY" },
  { id: "hazelnut-praline", name: "Nutella Hazelnut Crunch", price: 5, tag: "BESTSELLER" },
  { id: "salted-caramel", name: "Sea-Salt Caramel", price: 4, tag: "RICH" },
  { id: "dark-cherries", name: "Compote Cherries", price: 4, tag: "CLASSIC" },
  { id: "choco-chips", name: "Belgian Choc Chunks", price: 3, tag: "CRUNCH" },
  { id: "roasted-almonds", name: "Roasted Almonds", price: 4, tag: "NUTTY" },
];

const STYLES = [
  { id: "luxury", name: "24K Gold Leaf & Drip", desc: "Dark chocolate drip + edible gold", price: 6 },
  { id: "drip", name: "Signature Ganache Drip", desc: "Cascading couverture drip & berries", price: 5 },
  { id: "berries", name: "Fresh Berry Crown", desc: "Hand-piped rosettes & macerated berries", price: 4 },
  { id: "minimal", name: "Classic Patisserie", desc: "Clean artisanal frost & pearl finish", price: 0 },
];

const STEPS = [
  { num: 1, label: "Weight" },
  { num: 2, label: "Sponge" },
  { num: 3, label: "Frosting" },
  { num: 4, label: "Fillings" },
  { num: 5, label: "Crown" },
  { num: 6, label: "Plaque" },
];

export default function CustomBuilder() {
  const { fmt, cartAdd, toast } = useStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [size, setSize] = useState(SIZES[1]);
  const [base, setBase] = useState(BASES[0]);
  const [cream, setCream] = useState(CREAMS[0]);
  const [selectedFillings, setSelectedFillings] = useState<string[]>(["hazelnut-praline", "choco-chips"]);
  const [style, setStyle] = useState(STYLES[0]);
  const [plaqueText, setPlaqueText] = useState("Happy Birthday!");
  const [dietary, setDietary] = useState<"eggless" | "vegan">("eggless");
  const [candles, setCandles] = useState<"sparkler" | "numeric" | "classic">("sparkler");
  const [showMobileSpecs, setShowMobileSpecs] = useState(false);

  const toggleFilling = (id: string) => {
    if (selectedFillings.includes(id)) {
      if (selectedFillings.length > 1) {
        setSelectedFillings(selectedFillings.filter((i) => i !== id));
      } else {
        toast("info", "Select at least 1 center filling.");
      }
    } else {
      if (selectedFillings.length >= 3) {
        toast("info", "Maximum 3 center fillings for structural balance.");
        return;
      }
      setSelectedFillings([...selectedFillings, id]);
    }
  };

  const fillingsTotal = selectedFillings.reduce((sum, id) => {
    const f = FILLINGS.find((x) => x.id === id);
    return sum + (f ? f.price : 0);
  }, 0);

  const totalPrice = size.price + base.price + cream.price + fillingsTotal + style.price + (dietary === "vegan" ? 4 : 0);

  const handleAddToCart = () => {
    cartAdd("custom-hamper", cream.name, `${size.name} (${size.sub.split("·")[0].trim()})`, 1);
    toast("success", `Custom ${size.name} ${cream.name} Cake added to bag!`);
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-5 sm:py-10">
      {/* Compact Header */}
      <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
        <span className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
          ✦ INTERACTIVE 3D CAKE STUDIO · 100% EGGLESS
        </span>
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase mt-1.5 tracking-tight">
          Design Your <span className="text-blaze-500">Custom Cake</span>
        </h1>
        <p className="text-ink-300 text-xs sm:text-sm mt-1">
          Tap options below and watch your 3D cake update live. Freshly baked & delivered in 45 mins.
        </p>
      </div>

      {/* Stepper Progress Pills (Scrollable on Mobile) */}
      <div className="flex items-center sm:justify-center gap-1.5 sm:gap-2 mb-5 sm:mb-8 overflow-x-auto no-scrollbar pb-1">
        {STEPS.map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`px-3 sm:px-4 py-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider clip-tag border transition-all flex items-center gap-1.5 shrink-0 ${
              step === s.num
                ? "bg-blaze-500 text-ink-50 border-blaze-500 font-bold shadow-lg shadow-blaze-500/20"
                : step > s.num
                ? "bg-volt-400/10 text-volt-400 border-volt-400/40"
                : "bg-ink-900 text-ink-400 border-ink-800"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-ink-950/50 grid place-items-center text-[9px]">
              {step > s.num ? "✓" : s.num}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-5 sm:gap-8 items-start">
        {/* RIGHT/TOP ON MOBILE: Live 3D Cake Preview Card (order-first on mobile so users see 3D changes live!) */}
        <aside className="order-first lg:order-last border border-ink-700/70 bg-ink-900 p-4 sm:p-6 clip-tile lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center justify-between border-b border-ink-800 pb-3">
            <div>
              <span className="font-mono text-[9px] tracking-[0.2em] text-volt-400 uppercase block">
                ● Live 3D Preview
              </span>
              <h3 className="font-display font-bold text-sm sm:text-base uppercase text-ink-50">
                {size.name} {cream.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="font-mono text-[9px] text-ink-400 uppercase block">Total Price</span>
              <span className="font-display text-lg sm:text-xl font-black text-blaze-400 tabnum">
                {fmt(totalPrice)}
              </span>
            </div>
          </div>

          {/* 3D Interactive Cake Canvas */}
          <div className="relative h-52 sm:h-64 rounded bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 border border-ink-800 overflow-hidden">
            <Suspense
              fallback={
                <div className="w-full h-full grid place-items-center font-mono text-xs text-ink-400">
                  Loading 3D Studio...
                </div>
              }
            >
              <ThreeCake
                baseId={base.id}
                creamId={cream.id}
                styleId={style.id}
                sizeId={size.id}
                messageText={plaqueText}
                className="w-full h-full"
              />
            </Suspense>
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-ink-950/85 border border-ink-700 font-mono text-[9px] text-gold-400 uppercase">
              Drag to Rotate 360°
            </span>
            {plaqueText && (
              <div className="absolute bottom-2.5 inset-x-3 bg-ink-950/90 border border-gold-400/40 px-2.5 py-1 text-center rounded">
                <span className="font-display italic text-xs text-gold-300 truncate block">"{plaqueText}"</span>
              </div>
            )}
          </div>

          {/* Mobile Collapsible Toggle for Build Specs */}
          <button
            type="button"
            onClick={() => setShowMobileSpecs((v) => !v)}
            className="w-full lg:hidden flex items-center justify-between px-3 py-2 bg-ink-950 border border-ink-800 rounded font-mono text-[10px] uppercase tracking-wider text-ink-300"
          >
            <span>
              {size.name} · {base.name} · {selectedFillings.length} Fillings
            </span>
            <span className="text-blaze-400">{showMobileSpecs ? "Hide Specs ▲" : "View Specs ▼"}</span>
          </button>

          {/* Build Summary Breakdown (Always visible on Desktop, Collapsible on Mobile) */}
          <div className={`${showMobileSpecs ? "block" : "hidden"} lg:block space-y-2 text-xs font-mono border-t border-ink-800 pt-3`}>
            <div className="flex justify-between">
              <span className="text-ink-400">1. Weight:</span>
              <span className="text-ink-100 font-bold">{size.name} ({fmt(size.price)})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">2. Sponge:</span>
              <span className="text-ink-100">{base.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">3. Frosting:</span>
              <span className="text-ink-100">{cream.name}</span>
            </div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-ink-400 shrink-0">4. Fillings:</span>
              <span className="text-right text-volt-400">
                {selectedFillings.map((id) => FILLINGS.find((x) => x.id === id)?.name).join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">5. Crown Style:</span>
              <span className="text-ink-100">{style.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">6. Dietary:</span>
              <span className="text-emerald-400 uppercase">{dietary === "eggless" ? "100% Eggless" : "Vegan"}</span>
            </div>
          </div>

          {/* Direct Add to Bag + WhatsApp Chef Help */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 pt-1">
            <button
              onClick={handleAddToCart}
              className="w-full py-3 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] sm:text-xs uppercase tracking-[0.15em] clip-btn font-bold transition-colors shadow-lg shadow-blaze-500/20"
            >
              Add to Bag · {fmt(totalPrice)}
            </button>
            <a
              href={`https://wa.me/917318531953?text=${encodeURIComponent(
                `Hi CakeUrban! I designed a custom ${size.name} ${cream.name} cake (${base.name} sponge) with message "${plaqueText}".`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] sm:text-xs uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors font-bold"
            >
              <Ic.whatsapp className="w-3.5 h-3.5 fill-current shrink-0" /> Share Reference on WhatsApp
            </a>
          </div>
        </aside>

        {/* LEFT/BOTTOM ON MOBILE: Interactive Step Customizer */}
        <div className="bg-ink-900 border border-ink-800 p-4 sm:p-7 clip-tile space-y-5">
          {step === 1 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">Step 1: Choose Cake Weight</h2>
                <span className="font-mono text-[10px] text-ink-400 uppercase">Step 1 of 6</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSize(s)}
                    className={`p-3.5 sm:p-5 text-left border clip-tile transition-all relative ${
                      size.id === s.id
                        ? "border-blaze-500 bg-blaze-500/10"
                        : "border-ink-700 bg-ink-950 hover:border-ink-500"
                    }`}
                  >
                    <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.15em] px-1.5 py-0.5 bg-ink-900 border border-ink-700 text-gold-400 uppercase">
                      {s.badge}
                    </span>
                    <div className="flex justify-between items-baseline mt-2 gap-1">
                      <span className="font-display font-bold text-base sm:text-lg text-ink-50">{s.name}</span>
                      <span className="font-mono text-xs sm:text-sm text-blaze-400 font-bold">{fmt(s.price)}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-ink-400 mt-1">{s.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">Step 2: Select Sponge Base</h2>
                <span className="font-mono text-[10px] text-ink-400 uppercase">Step 2 of 6</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {BASES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setBase(b)}
                    className={`p-3.5 sm:p-5 text-left border clip-tile transition-all ${
                      base.id === b.id
                        ? "border-blaze-500 bg-blaze-500/10"
                        : "border-ink-700 bg-ink-950 hover:border-ink-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: b.hex }}
                      />
                      <span className="font-mono text-[11px] text-blaze-400 font-bold">
                        {b.price === 0 ? "Included" : `+${fmt(b.price)}`}
                      </span>
                    </div>
                    <span className="font-display font-bold text-sm sm:text-base text-ink-50 block">{b.name}</span>
                    <p className="text-[11px] text-ink-400 mt-1 line-clamp-1">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">Step 3: Outer Frosting (Updates 3D)</h2>
                <span className="font-mono text-[10px] text-volt-400 uppercase">● Live Color</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {CREAMS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCream(c)}
                    className={`p-3.5 sm:p-5 text-left border clip-tile transition-all ${
                      cream.id === c.id
                        ? "border-blaze-500 bg-blaze-500/10"
                        : "border-ink-700 bg-ink-950 hover:border-ink-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="w-6 h-6 rounded-full border-2 border-white/30 shadow-inner shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="font-mono text-[11px] text-blaze-400 font-bold">
                        {c.price === 0 ? "Included" : `+${fmt(c.price)}`}
                      </span>
                    </div>
                    <span className="font-display font-bold text-sm sm:text-base text-ink-50 block">{c.name}</span>
                    <p className="text-[11px] text-ink-400 mt-1 line-clamp-1">{c.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">Step 4: Layer Fillings (Pick 1–3)</h2>
                <span className="font-mono text-[10px] text-gold-400 uppercase">{selectedFillings.length}/3 Selected</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                {FILLINGS.map((f) => {
                  const active = selectedFillings.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggleFilling(f.id)}
                      className={`p-3 sm:p-4 text-left border clip-tile transition-all ${
                        active
                          ? "border-volt-400 bg-volt-400/10"
                          : "border-ink-700 bg-ink-950 hover:border-ink-500"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[8px] tracking-widest uppercase px-1.5 py-0.5 bg-ink-900 text-ink-300">
                          {f.tag}
                        </span>
                        <span className="font-mono text-[11px] text-volt-400 font-bold">+{fmt(f.price)}</span>
                      </div>
                      <p className="font-display font-bold text-xs sm:text-sm mt-2 text-ink-50">{f.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">Step 5: Crown & Finish Style</h2>
                <span className="font-mono text-[10px] text-ink-400 uppercase">Step 5 of 6</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                {STYLES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStyle(st)}
                    className={`p-3.5 sm:p-5 text-left border clip-tile transition-all ${
                      style.id === st.id
                        ? "border-blaze-500 bg-blaze-500/10"
                        : "border-ink-700 bg-ink-950 hover:border-ink-500"
                    }`}
                  >
                    <div className="flex justify-between items-baseline gap-1">
                      <span className="font-display font-bold text-sm sm:text-base text-ink-50">{st.name}</span>
                      <span className="font-mono text-[11px] text-blaze-400 font-bold shrink-0">
                        {st.price === 0 ? "Free" : `+${fmt(st.price)}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-400 mt-1 line-clamp-2">{st.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">Step 6: Cake Message & Dietary</h2>
                <span className="font-mono text-[10px] text-volt-400 uppercase">Final Step</span>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-300 mb-1.5">
                  Hand-Piped Chocolate Plaque Message (Free)
                </label>
                <input
                  type="text"
                  maxLength={35}
                  value={plaqueText}
                  onChange={(e) => setPlaqueText(e.target.value)}
                  placeholder="e.g. Happy Birthday Ananya!"
                  className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3.5 py-2.5 text-sm text-ink-100 outline-none"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["Happy Birthday!", "Happy Anniversary ❤️", "Congratulations!", "Best Wishes"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPlaqueText(preset)}
                      className="px-2.5 py-1 bg-ink-950 border border-ink-700 hover:border-blaze-500 font-mono text-[10px] text-ink-300 rounded"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-300 mb-1.5">
                    Dietary Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDietary("eggless")}
                      className={`p-2.5 border text-left rounded font-mono text-xs ${
                        dietary === "eggless" ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold" : "border-ink-700 bg-ink-950 text-ink-400"
                      }`}
                    >
                      🌱 100% Eggless (Free)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDietary("vegan")}
                      className={`p-2.5 border text-left rounded font-mono text-xs ${
                        dietary === "vegan" ? "border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold" : "border-ink-700 bg-ink-950 text-ink-400"
                      }`}
                    >
                      🥥 Plant Vegan (+{fmt(4)})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-300 mb-1.5">
                    Complimentary Candles
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        ["sparkler", "✨ Sparkler"],
                        ["numeric", "🔢 Age No."],
                        ["classic", "🕯️ Golden"],
                      ] as const
                    ).map(([k, lbl]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCandles(k)}
                        className={`p-2.5 border text-center rounded font-mono text-[10px] ${
                          candles === k ? "border-gold-400 bg-gold-400/15 text-gold-300 font-bold" : "border-ink-700 bg-ink-950 text-ink-400"
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-ink-800 gap-3">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 sm:px-5 py-2.5 border border-ink-700 font-mono text-xs uppercase disabled:opacity-40 hover:border-ink-500 transition-colors"
            >
              ← Prev
            </button>
            {step < 6 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 sm:flex-initial px-6 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase clip-btn font-bold transition-colors"
              >
                Next: {STEPS[step]?.label} →
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex-1 sm:flex-initial px-6 py-3 bg-volt-400 hover:bg-volt-300 text-ink-950 font-mono text-xs uppercase font-bold clip-btn transition-colors"
              >
                Add Custom Cake · {fmt(totalPrice)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
