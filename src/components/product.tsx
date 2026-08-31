import React, { createContext, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import type { Product } from "../data/catalog";
import { Ic, Modal, PImg, Qty, Stars, Tilt } from "./ui";

/* ---------- quick view context ---------- */
const QVCtx = createContext<{ qv: string | null; openQV: (id: string) => void; closeQV: () => void }>({ qv: null, openQV: () => {}, closeQV: () => {} });
export const useQuickView = () => useContext(QVCtx);
export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [qv, setQv] = useState<string | null>(null);
  return <QVCtx.Provider value={{ qv, openQV: setQv, closeQV: () => setQv(null) }}>{children}<QuickViewModal id={qv} onClose={() => setQv(null)} /></QVCtx.Provider>;
}

/* ---------- product card ---------- */
export function ProductCard({ p, index = 0, compact = false }: { p: Product; index?: number; compact?: boolean }) {
  const { fmt, t, toggleWish, wishlist, toggleCompare, compare, cartAdd } = useStore();
  const { openQV } = useQuickView();
  const [color, setColor] = useState(0);
  const wished = wishlist.includes(p.id);
  const compared = compare.includes(p.id);
  const colorFilter = p.imgFilter ?? p.colors[color]?.filter;
  const out = p.stock <= 0;

  return (
    <div className="group relative w-full h-full" style={{ animationDelay: `${index * 50}ms` }}>
      <Tilt className="relative h-full">
        <div className={`relative flex flex-col justify-between h-full overflow-hidden clip-tile bg-ink-850 border transition-all duration-300 ${out ? "opacity-60" : ""} ${compared ? "border-blaze-500/70 shadow-glow" : "border-ink-700/50 hover:border-blaze-500/60"}`}>
          <div className="absolute inset-0 grid-lines opacity-40 pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex flex-col gap-1 pointer-events-none">
            {p.tag && <span className="clip-tag bg-blaze-500 text-ink-50 font-mono text-[8px] sm:text-[10px] font-bold tracking-[0.15em] px-2 py-0.5 sm:px-2.5 sm:py-1">{p.tag}</span>}
            {p.compareAt && <span className="clip-tag bg-ink-950/85 text-volt-400 font-mono text-[8px] sm:text-[10px] font-bold tracking-[0.1em] px-2 py-0.5 sm:px-2.5 sm:py-1">−{Math.round((1 - p.price / p.compareAt) * 100)}%</span>}
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex flex-col gap-1 sm:translate-x-14 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 transition-all duration-300">
            <button
              aria-label="Wishlist"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWish(p.id); }}
              className={`grid place-items-center w-7 h-7 sm:w-9 sm:h-9 border backdrop-blur rounded-sm transition-transform active:scale-90 ${wished ? "bg-blaze-500 border-blaze-500 text-ink-50" : "bg-ink-950/80 border-ink-600/80 text-ink-200 hover:border-blaze-500 hover:text-blaze-400"}`}
            >
              <Ic.heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" filled={wished} />
            </button>
            <button
              aria-label="Quick view"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQV(p.id); }}
              className="hidden sm:grid place-items-center w-9 h-9 border bg-ink-950/80 border-ink-600/80 text-ink-200 backdrop-blur hover:border-volt-400 hover:text-volt-400 rounded-sm transition-colors"
            >
              <Ic.eye className="w-4 h-4" />
            </button>
          </div>

          {/* Image */}
          <div className="relative block aspect-square overflow-hidden bg-ink-900">
            <Link to={`/product/${p.id}`} className="block w-full h-full" tabIndex={-1}>
              <PImg src={p.img} crop={p.crop} filter={colorFilter} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink-850 via-ink-850/40 to-transparent" />
            </Link>

            {/* Desktop Quick Add bar on hover */}
            <div className="hidden sm:block absolute inset-x-2.5 bottom-2.5 z-10 translate-y-14 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              {out ? (
                <div className="clip-btn bg-ink-950/90 border border-ink-600 text-ink-400 text-center font-mono text-[11px] tracking-[0.15em] py-2 uppercase">{t("outOfStock")}</div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); cartAdd(p.id, p.colors[color].name, p.sizes[0]); }}
                  className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] font-bold tracking-[0.15em] py-2.5 uppercase transition-colors flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Ic.bag className="w-3.5 h-3.5" /> {t("addToCart")}
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="relative p-2.5 sm:p-3.5 bg-ink-850 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.18em] text-ink-400 uppercase truncate max-w-[100px]">{p.brand}</span>
                <span className="flex items-center gap-0.5 font-mono text-[10px] sm:text-[11px] text-ink-300 font-bold">
                  <Ic.star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-400" />{p.rating.toFixed(1)}
                </span>
              </div>
              <Link to={`/product/${p.id}`} className="block font-display text-xs sm:text-sm font-semibold leading-snug text-ink-100 hover:text-blaze-400 transition-colors line-clamp-2 min-h-[32px] sm:min-h-[36px]">
                {p.name}
              </Link>
            </div>

            <div className="mt-2 pt-2 border-t border-ink-800/60 flex items-center justify-between gap-1">
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-1.5">
                <span className="font-mono tabnum font-bold text-xs sm:text-sm text-ink-50">{fmt(p.price)}</span>
                {p.compareAt && <span className="font-mono tabnum text-[9px] sm:text-xs text-ink-500 line-through">{fmt(p.compareAt)}</span>}
              </div>

              {/* Mobile Quick Add Button */}
              <div className="sm:hidden">
                {out ? (
                  <span className="text-[9px] font-mono text-ink-500 uppercase">Sold</span>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); cartAdd(p.id, p.colors[color].name, p.sizes[0]); }}
                    className="px-2.5 py-1 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] font-bold rounded flex items-center gap-1 active:scale-95 transition-transform"
                    aria-label="Add to cart"
                  >
                    <span>+</span> Add
                  </button>
                )}
              </div>

              {/* Desktop Color Swatches */}
              <div className="hidden sm:flex gap-1">
                {p.colors.slice(0, 3).map((c, i) => (
                  <button
                    key={c.name}
                    aria-label={c.name}
                    onMouseEnter={() => setColor(i)}
                    onClick={() => setColor(i)}
                    className={`w-3 h-3 rounded-full border transition-transform ${i === color ? "scale-125 border-ink-100" : "border-ink-600"}`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>

            {p.stock > 0 && p.stock <= 5 && (
              <p className="mt-1 font-mono text-[8px] sm:text-[9px] tracking-[0.1em] text-gold-400 uppercase truncate">⚠ Only {p.stock} left in hub</p>
            )}
          </div>
        </div>
      </Tilt>
    </div>
  );
}

/* ---------- quick view modal ---------- */
function QuickViewModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { products, fmt, t, cartAdd, toggleWish, wishlist, toggleCompare, compare } = useStore();
  const p = products.find((x) => x.id === id);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(0);
  const [qty, setQtyV] = useState(1);
  const pKey = p?.id;
  useMemo(() => { setColor(0); setSize(0); setQtyV(1); }, [pKey]);
  if (!p) return null;
  const filter = p.imgFilter ?? p.colors[color]?.filter;

  return (
    <Modal open={!!id} onClose={onClose} wide>
      <div className="grid md:grid-cols-2">
        <div className="relative bg-ink-850 grid place-items-center p-8 md:p-12 min-h-72">
          <div className="absolute inset-0 grid-lines opacity-50" />
          {p.tag && <span className="absolute top-4 left-4 clip-tag bg-blaze-500 text-ink-50 font-mono text-[10px] tracking-[0.18em] px-2.5 py-1 z-10">{p.tag}</span>}
          <Tilt max={14} className="relative w-full max-w-sm">
            <PImg src={p.img} crop={p.crop} filter={filter} alt={p.name} className="w-full aspect-square drop-shadow-2xl" />
          </Tilt>
        </div>
        <div className="p-7 md:p-9">
          <p className="font-mono text-[11px] tracking-[0.25em] text-blaze-500 uppercase">{p.brand}</p>
          <h3 className="font-display text-2xl md:text-3xl font-bold mt-2 leading-tight">{p.name}</h3>
          <div className="flex items-center gap-2 mt-2.5 text-ink-300 text-sm">
            <Stars value={p.rating} /> <span className="font-mono text-xs">{p.rating.toFixed(1)} · {p.ratingCount.toLocaleString()} {t("reviews")}</span>
          </div>
          <div className="flex items-baseline gap-3 mt-5">
            <span className="font-mono tabnum text-3xl font-bold text-ink-50">{fmt(p.price)}</span>
            {p.compareAt && <span className="font-mono tabnum text-ink-500 line-through">{fmt(p.compareAt)}</span>}
          </div>
          <p className="text-sm text-ink-300 leading-relaxed mt-4">{p.desc}</p>

          <div className="mt-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-ink-400 uppercase mb-2">{t("colorway")} — <span className="text-ink-100">{p.colors[color].name}</span></p>
            <div className="flex gap-2">
              {p.colors.map((c, i) => (
                <button key={c.name} onClick={() => setColor(i)} className={`w-8 h-8 rounded-full border-2 transition-transform ${i === color ? "border-blaze-500 scale-110" : "border-ink-600 hover:border-ink-400"}`} style={{ background: c.hex }} aria-label={c.name} />
              ))}
            </div>
          </div>
          {p.sizes.length > 1 && (
            <div className="mt-4">
              <p className="font-mono text-[11px] tracking-[0.2em] text-ink-400 uppercase mb-2">{t("size")}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.sizes.map((s, i) => (
                  <button key={s} onClick={() => setSize(i)} className={`px-3 py-1.5 border font-mono text-xs transition-colors ${i === size ? "bg-ink-100 text-ink-950 border-ink-100" : "border-ink-600 text-ink-200 hover:border-blaze-500"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex items-center gap-3">
            <Qty value={qty} onChange={setQtyV} max={Math.max(1, p.stock)} />
            <button onClick={() => { cartAdd(p.id, p.colors[color].name, p.sizes[size], qty); onClose(); }} disabled={p.stock <= 0}
              className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 disabled:opacity-40 text-ink-50 font-mono text-sm tracking-[0.18em] uppercase py-3.5 transition-colors flex items-center justify-center gap-2">
              <Ic.bag className="w-4 h-4" /> {p.stock <= 0 ? t("outOfStock") : t("addToCart")}
            </button>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => toggleWish(p.id)} className={`flex-1 border py-2.5 font-mono text-xs tracking-[0.15em] uppercase transition-colors ${wishlist.includes(p.id) ? "border-blaze-500 text-blaze-400" : "border-ink-600 text-ink-300 hover:border-ink-400"}`}>♥ {t("wishlist")}</button>
            <button onClick={() => toggleCompare(p.id)} className={`flex-1 border py-2.5 font-mono text-xs tracking-[0.15em] uppercase transition-colors ${compare.includes(p.id) ? "border-cobalt-400 text-cobalt-300" : "border-ink-600 text-ink-300 hover:border-ink-400"}`}>{t("compare")}</button>
          </div>
          <Link to={`/product/${p.id}`} onClick={onClose} className="link-sweep inline-flex items-center gap-2 mt-5 font-mono text-xs tracking-[0.18em] uppercase text-ink-300 hover:text-blaze-400">
            Full details <Ic.arrow className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- compare overlay ---------- */
export function CompareOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, compare, fmt, t, toggleCompare, clearCompare, cartAdd } = useStore();
  const list = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean) as Product[];
  const specRow = (label: string, get: (p: Product) => string) => (
    <tr className="border-t border-ink-700/50">
      <th className="text-left font-mono text-[11px] tracking-[0.2em] uppercase text-ink-400 py-3 pr-4 w-36 align-top">{label}</th>
      {list.map((p) => <td key={p.id} className="py-3 pr-4 text-sm text-ink-100 align-top min-w-44">{get(p)}</td>)}
    </tr>
  );
  return (
    <Modal open={open} onClose={onClose} wide>
      <div className="p-7 md:p-9">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-cobalt-400">SIDE BY SIDE</p>
            <h3 className="font-display text-2xl md:text-3xl font-bold uppercase mt-1">{t("compare")} <span className="text-ink-500 font-mono text-base">({list.length}/4)</span></h3>
          </div>
          <button onClick={clearCompare} className="font-mono text-xs tracking-[0.15em] uppercase text-ink-400 hover:text-danger-400 transition-colors">{t("clearAll")}</button>
        </div>
        {list.length === 0 ? (
          <div className="text-center py-16 text-ink-400">
            <Ic.scale className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="font-mono text-sm tracking-wide">No products selected yet — tap the ⇄ icon on any card.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-36" />
                  {list.map((p) => (
                    <td key={p.id} className="pr-4 pb-4 align-top min-w-44">
                      <div className="relative bg-ink-850 clip-tile border border-ink-700/50 overflow-hidden group">
                        <button onClick={() => toggleCompare(p.id)} className="absolute top-2 right-2 z-10 p-1.5 bg-ink-950/80 border border-ink-600 text-ink-300 hover:text-danger-400 hover:border-danger-400 transition-colors" aria-label="Remove">
                          <Ic.x className="w-3.5 h-3.5" />
                        </button>
                        <PImg src={p.img} crop={p.crop} filter={p.imgFilter} alt={p.name} className="w-full aspect-square object-cover" />
                      </div>
                      <p className="font-display font-semibold text-sm mt-3 leading-snug">{p.name}</p>
                      <button onClick={() => { cartAdd(p.id, p.colors[0].name, p.sizes[0]); onClose(); }} className="clip-tag mt-2 w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] tracking-[0.15em] uppercase py-2 transition-colors">{t("addToCart")}</button>
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {specRow(t("price"), (p) => <span className="font-mono tabnum font-bold text-lg">{fmt(p.price)}</span> as unknown as string)}
                {specRow("Rating", (p) => `★ ${p.rating.toFixed(1)} (${p.ratingCount.toLocaleString()})`)}
                {specRow(t("brand"), (p) => p.brand)}
                {specRow(t("category"), (p) => p.category)}
                {specRow("Stock", (p) => (p.stock <= 0 ? "Out of stock" : p.stock <= 5 ? `Low — ${p.stock} left` : `${p.stock} units`))}
                {specRow(t("colorway"), (p) => p.colors.map((c) => c.name).join(", "))}
                {specRow("SKU", (p) => <span className="font-mono text-xs text-ink-400">{p.sku}</span> as unknown as string)}
                {[0, 1, 2].map((i) =>
                  list[0]?.specs[i] ? specRow(list[0].specs[i][0], (p) => p.specs[i]?.[1] ?? "—") : null
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
}
