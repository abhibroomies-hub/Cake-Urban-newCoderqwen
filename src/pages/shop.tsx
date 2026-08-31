import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../lib/store";
import { BRANDS, CATEGORIES } from "../data/catalog";
import { Ic, Reveal } from "../components/ui";
import { ProductCard } from "../components/product";

type Filters = { cats: string[]; brands: string[]; colors: string[]; sizes: string[]; minRating: number; maxPrice: number; inStock: boolean; q: string };

const COLOR_NAMES: { name: string; hex: string }[] = [
  { name: "Blaze", hex: "#ff4d12" }, { name: "Cobalt", hex: "#3e63dd" }, { name: "Black", hex: "#141821" },
  { name: "Graphite", hex: "#2a3240" }, { name: "Sage", hex: "#8fae8b" }, { name: "Bone", hex: "#c2cadb" },
  { name: "Titanium", hex: "#76839c" }, { name: "Olive", hex: "#6b7a52" },
];

export default function Shop() {
  const { products, t, fmt } = useStore();
  const [params, setParams] = useSearchParams();
  const [f, setF] = useState<Filters>({
    cats: params.get("cat") ? [params.get("cat")!] : [],
    brands: [], colors: [], sizes: [], minRating: 0, maxPrice: 450, inStock: false,
    q: params.get("q") ?? "",
  });
  const [sort, setSort] = useState("featured");
  const [mobileF, setMobileF] = useState(false);

  useEffect(() => {
    const cat = params.get("cat"); const q = params.get("q"); const tag = params.get("tag");
    setF((prev) => ({ ...prev, cats: cat ? [cat] : prev.cats, q: tag ? tag : q ?? prev.q }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const toggle = (key: "cats" | "brands" | "colors" | "sizes", v: string) =>
    setF((prev) => ({ ...prev, [key]: prev[key].includes(v) ? prev[key].filter((x) => x !== v) : [...prev[key], v] }));

  const list = useMemo(() => {
    let r = [...products];
    if (f.cats.length) r = r.filter((p) => f.cats.includes(p.category));
    if (f.brands.length) r = r.filter((p) => f.brands.includes(p.brand));
    if (f.colors.length) r = r.filter((p) => p.colors.some((c) => f.colors.includes(c.name)));
    if (f.sizes.length) r = r.filter((p) => p.sizes.some((s) => f.sizes.includes(s)));
    if (f.minRating) r = r.filter((p) => p.rating >= f.minRating);
    r = r.filter((p) => p.price <= f.maxPrice);
    if (f.inStock) r = r.filter((p) => p.stock > 0);
    if (f.q.trim()) {
      const q = f.q.toLowerCase();
      r = r.filter((p) => (p.name + p.brand + p.category + p.tag + p.sku).toLowerCase().includes(q));
    }
    switch (sort) {
      case "price-asc": r.sort((a, b) => a.price - b.price); break;
      case "price-desc": r.sort((a, b) => b.price - a.price); break;
      case "rating": r.sort((a, b) => b.rating - a.rating); break;
      case "newest": r.sort((a, b) => (b.tag === "NEW" ? 1 : 0) - (a.tag === "NEW" ? 1 : 0)); break;
      default: r.sort((a, b) => b.ratingCount - a.ratingCount);
    }
    return r;
  }, [products, f, sort]);

  const allSizes = useMemo(() => [...new Set(products.flatMap((p) => p.sizes))].slice(0, 10), [products]);
  const activeCount = f.cats.length + f.brands.length + f.colors.length + f.sizes.length + (f.minRating ? 1 : 0) + (f.inStock ? 1 : 0) + (f.maxPrice < 450 ? 1 : 0);
  const clearAll = () => { setF({ cats: [], brands: [], colors: [], sizes: [], minRating: 0, maxPrice: 450, inStock: false, q: "" }); setParams({}); };

  const FilterPanel = (
    <div className="space-y-7">
      <section>
        <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-400 mb-3">{t("category")}</h4>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <label key={c.name} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={f.cats.includes(c.name)} onChange={() => toggle("cats", c.name)} className="accent-[#ff4d12] w-4 h-4" />
              <span className="text-sm text-ink-200 group-hover:text-blaze-400 transition-colors">{c.name}</span>
              <span className="ml-auto font-mono text-[10px] text-ink-500">{products.filter((p) => p.category === c.name).length}</span>
            </label>
          ))}
        </div>
      </section>
      <section>
        <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-400 mb-3">{t("brand")}</h4>
        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((b) => (
            <button key={b} onClick={() => toggle("brands", b)} className={`px-3 py-1.5 border font-mono text-[11px] tracking-wide transition-colors ${f.brands.includes(b) ? "bg-blaze-500 border-blaze-500 text-ink-50" : "border-ink-600 text-ink-300 hover:border-blaze-500"}`}>{b}</button>
          ))}
        </div>
      </section>
      <section>
        <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-400 mb-3">{t("price")} — {fmt(f.maxPrice)}</h4>
        <input type="range" min={100} max={450} step={10} value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: +e.target.value })} className="w-full" />
        <div className="flex justify-between font-mono text-[10px] text-ink-500 mt-1"><span>{fmt(100)}</span><span>{fmt(450)}</span></div>
      </section>
      <section>
        <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-400 mb-3">Color</h4>
        <div className="flex flex-wrap gap-2">
          {COLOR_NAMES.map((c) => (
            <button key={c.name} title={c.name} onClick={() => toggle("colors", c.name)} className={`w-8 h-8 rounded-full border-2 transition-all ${f.colors.includes(c.name) ? "border-blaze-500 scale-110" : "border-ink-600 hover:border-ink-400"}`} style={{ background: c.hex }} />
          ))}
        </div>
      </section>
      <section>
        <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-400 mb-3">{t("size")}</h4>
        <div className="flex flex-wrap gap-1.5">
          {allSizes.map((s) => (
            <button key={s} onClick={() => toggle("sizes", s)} className={`px-2.5 py-1.5 border font-mono text-[10px] transition-colors ${f.sizes.includes(s) ? "bg-ink-100 text-ink-950 border-ink-100" : "border-ink-600 text-ink-300 hover:border-blaze-500"}`}>{s}</button>
          ))}
        </div>
      </section>
      <section>
        <h4 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink-400 mb-3">{t("rating")}</h4>
        <div className="flex gap-1.5">
          {[4.5, 4, 0].map((r) => (
            <button key={r} onClick={() => setF({ ...f, minRating: r })} className={`px-3 py-1.5 border font-mono text-[11px] transition-colors ${f.minRating === r ? "bg-gold-400 text-ink-950 border-gold-400" : "border-ink-600 text-ink-300 hover:border-gold-400"}`}>{r === 0 ? "Any" : `${r}★+`}</button>
          ))}
        </div>
      </section>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={f.inStock} onChange={(e) => setF({ ...f, inStock: e.target.checked })} className="accent-[#ff4d12] w-4 h-4" />
        <span className="text-sm text-ink-200">{t("inStock")} only</span>
      </label>
      {activeCount > 0 && (
        <button onClick={clearAll} className="w-full border border-danger-500/50 text-danger-400 hover:bg-danger-500 hover:text-ink-50 py-2.5 font-mono text-xs tracking-[0.15em] uppercase transition-colors">{t("clearAll")} ({activeCount})</button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      {/* page head */}
      <div className="relative overflow-hidden clip-tile border border-ink-700/60 bg-ink-850 p-8 md:p-12 mb-10 noise">
        <div className="absolute inset-0 grid-lines opacity-50" />
        <div className="absolute -right-10 -top-10 font-display font-black text-[10rem] leading-none text-outline opacity-40 select-none hidden md:block">GO</div>
        <div className="relative">
          <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500">FULL CATALOG</p>
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase mt-2">{t("nav.shop")}</h1>
          <p className="font-mono text-xs text-ink-400 mt-3">{list.length} {t("results")} · {f.cats[0] ?? "All categories"}</p>
        </div>
      </div>

      <div className="flex gap-10">
        {/* rail */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-28">{FilterPanel}</div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setMobileF(true)} className="lg:hidden clip-tag border border-ink-600 px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase flex items-center gap-2"><Ic.filter className="w-3.5 h-3.5" /> {t("filter")} {activeCount > 0 && `(${activeCount})`}</button>
              <input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search in results…" className="bg-ink-900 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-sm w-44 transition-colors" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-ink-900 border border-ink-600 outline-none px-3 py-2 font-mono text-xs tracking-wide uppercase cursor-pointer">
              <option value="featured">{t("sort")}: Popular</option>
              <option value="newest">{t("sort")}: Newest</option>
              <option value="price-asc">{t("price")} ↑</option>
              <option value="price-desc">{t("price")} ↓</option>
              <option value="rating">{t("rating")} ↓</option>
            </select>
          </div>

          {list.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-ink-700">
              <Ic.search className="w-10 h-10 mx-auto text-ink-600 mb-4" />
              <p className="font-display font-bold uppercase">Zero matches</p>
              <p className="text-sm text-ink-400 mt-2">Loosen a filter or two — the right gear is in here.</p>
              <button onClick={clearAll} className="clip-tag mt-6 border border-blaze-500 text-blaze-400 hover:bg-blaze-500 hover:text-ink-50 px-6 py-2.5 font-mono text-xs tracking-[0.15em] uppercase transition-colors">{t("clearAll")}</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {list.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 6) * 0.05 }}>
                  <ProductCard p={p} index={i} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {mobileF && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileF(false)} className="fixed inset-0 z-[85] bg-ink-950/75 lg:hidden" />
            <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed left-0 top-0 bottom-0 z-[86] w-80 bg-ink-900 border-r border-ink-800 p-6 overflow-y-auto lg:hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display font-bold uppercase">{t("filter")}</h3>
                <button onClick={() => setMobileF(false)} className="p-2 text-ink-400 hover:text-blaze-500"><Ic.x className="w-5 h-5" /></button>
              </div>
              {FilterPanel}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= wishlist page ================= */
export function WishlistPage() {
  const { products, wishlist, t, toggleWish, cartAdd, saved, moveSavedToCart, removeSaved } = useStore();
  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500">SAVED GEAR</p>
      <h1 className="font-display text-4xl md:text-5xl font-black uppercase mt-2 mb-10">{t("wishlist")} <span className="font-mono text-base text-ink-500">({items.length})</span></h1>
      {items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-ink-700">
          <Ic.heart className="w-10 h-10 mx-auto text-ink-600 mb-4" />
          <p className="font-display font-bold uppercase">Nothing saved yet</p>
          <p className="text-sm text-ink-400 mt-2">Tap the ♥ on any product to keep it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p, i) => <Reveal key={p.id} delay={i * 70}><ProductCard p={p} index={i} /></Reveal>)}
        </div>
      )}
      {saved.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold uppercase mb-5">{t("saveForLater")} <span className="font-mono text-sm text-ink-500">({saved.length})</span></h2>
          <div className="space-y-2">
            {saved.map((it, i) => {
              const p = products.find((x) => x.id === it.productId);
              if (!p) return null;
              return (
                <div key={it.productId} className="flex items-center gap-4 border border-ink-700/60 bg-ink-850 p-3 clip-tag">
                  <span className="font-display text-sm font-semibold flex-1">{p.name} <span className="font-mono text-[10px] text-ink-400 ml-2">{it.color} · {it.size}</span></span>
                  <button onClick={() => moveSavedToCart(i)} className="clip-tag bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 transition-colors">→ {t("cart")}</button>
                  <button onClick={() => removeSaved(i)} className="p-1.5 text-ink-400 hover:text-danger-400 transition-colors"><Ic.trash className="w-4 h-4" /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="hidden">{toggleWish.name}</div>
    </div>
  );
}
