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
export function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { fmt, t, toggleWish, wishlist, toggleCompare, compare, cartAdd } = useStore();
  const { openQV } = useQuickView();
  const [color, setColor] = useState(0);
  const wished = wishlist.includes(p.id);
  const compared = compare.includes(p.id);
  const colorFilter = p.imgFilter ?? p.colors[color]?.filter;
  const out = p.stock <= 0;

  return (
    <div className="group relative" style={{ animationDelay: `${index * 60}ms` }}>
      <Tilt className="relative">
        <div className={`relative overflow-hidden clip-tile bg-ink-850 border transition-all duration-300 ${out ? "opacity-60" : ""} ${compared ? "border-blaze-500/70 shadow-glow" : "border-ink-700/50 group-hover:border-ink-600"}`}>
          <div className="absolute inset-0 grid-lines opacity-60" />
          {/* badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {p.tag && <span className="clip-tag bg-blaze-500 text-ink-50 font-mono text-[10px] tracking-[0.18em] px-2.5 py-1">{p.tag}</span>}
            {p.compareAt && <span className="clip-tag bg-ink-950/80 text-volt-400 font-mono text-[10px] tracking-[0.14em] px-2.5 py-1">−{Math.round((1 - p.price / p.compareAt) * 100)}%</span>}
          </div>
          {/* actions */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 translate-x-14 group-hover:translate-x-0 transition-transform duration-300">
            <button aria-label="Wishlist" onClick={() => toggleWish(p.id)} className={`grid place-items-center w-9 h-9 border backdrop-blur transition-colors ${wished ? "bg-blaze-500 border-blaze-500 text-ink-50" : "bg-ink-950/70 border-ink-600 text-ink-200 hover:border-blaze-500 hover:text-blaze-400"}`}>
              <Ic.heart className="w-4 h-4" filled={wished} />
            </button>
            <button aria-label="Compare" onClick={() => toggleCompare(p.id)} className={`grid place-items-center w-9 h-9 border backdrop-blur transition-colors ${compared ? "bg-cobalt-500 border-cobalt-500 text-ink-50" : "bg-ink-950/70 border-ink-600 text-ink-200 hover:border-cobalt-400 hover:text-cobalt-300"}`}>
              <Ic.scale className="w-4 h-4" />
            </button>
            <button aria-label="Quick view" onClick={() => openQV(p.id)} className="grid place-items-center w-9 h-9 border bg-ink-950/70 border-ink-600 text-ink-200 backdrop-blur hover:border-volt-400 hover:text-volt-400 transition-colors">
              <Ic.eye className="w-4 h-4" />
            </button>
          </div>
          {/* image */}
          <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden" tabIndex={-1}>
            <PImg src={p.img} crop={p.crop} filter={colorFilter} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink-850 to-transparent" />
          </Link>
          {/* quick add bar */}
          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            {out ? (
              <div className="clip-btn bg-ink-950/90 border border-ink-600 text-ink-400 text-center font-mono text-xs tracking-[0.2em] py-3 uppercase">{t("outOfStock")}</div>
            ) : (
              <button onClick={() => cartAdd(p.id, p.colors[color].name, p.sizes[0])} className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] py-3 uppercase transition-colors flex items-center justify-center gap-2">
                <Ic.bag className="w-4 h-4" /> {t("addToCart")}
              </button>
            )}
          </div>
          {/* body */}
          <div className="relative p-4 pt-1 bg-ink-850">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-[10px] tracking-[0.22em] text-ink-400 uppercase">{p.brand}</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-ink-300"><Ic.star className="w-3 h-3 text-gold-400" />{p.rating.toFixed(1)}</span>
            </div>
            <Link to={`/product/${p.id}`} className="block font-display text-sm font-semibold leading-snug hover:text-blaze-400 transition-colors">{p.name}</Link>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-mono tabnum font-semibold text-ink-50">{fmt(p.price)}</span>
                {p.compareAt && <span className="font-mono tabnum text-xs text-ink-500 line-through">{fmt(p.compareAt)}</span>}
              </div>
              <div className="flex gap-1">
                {p.colors.map((c, i) => (
                  <button key={c.name} aria-label={c.name} onMouseEnter={() => setColor(i)} onClick={() => setColor(i)} className={`w-3.5 h-3.5 rounded-full border transition-transform ${i === color ? "scale-125 border-ink-100" : "border-ink-600"}`} style={{ background: c.hex }} />
                ))}
              </div>
            </div>
            {p.stock > 0 && p.stock <= 5 && (
              <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-gold-400 uppercase">⚠ {t("lowStock", { n: p.stock })}</p>
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
