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
export function ProductCard({ p, index = 0 }: { p: Product; index?: number; compact?: boolean }) {
  const { fmt, t, toggleWish, wishlist, cartAdd, toast } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const wished = wishlist.includes(p.id);
  const colorFilter = p.imgFilter ?? p.colors[0]?.filter;
  const out = p.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (out) return;
    cartAdd(p.id, p.colors[0]?.name || "Original", p.sizes[0] || "Standard");
    setJustAdded(true);
    toast("success", `Added ${p.name} to bag`);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="group relative w-full h-full" style={{ animationDelay: `${index * 40}ms` }}>
      <Tilt className="relative h-full" max={10}>
        <div
          className={`relative flex flex-col justify-between h-full overflow-hidden clip-tile bg-ink-850 border border-ink-700/60 hover:border-blaze-500/80 transition-all duration-300 shadow-md ${
            out ? "opacity-60" : ""
          }`}
        >
          {/* Top Left Badge */}
          {p.tag && (
            <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 pointer-events-none">
              <span className="clip-tag bg-blaze-500 text-ink-50 font-mono text-[8px] sm:text-[9px] font-bold tracking-[0.14em] px-2 py-0.5 shadow">
                {p.tag}
              </span>
            </div>
          )}

          {/* Top Right Wishlist Heart */}
          <button
            aria-label="Wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWish(p.id);
            }}
            className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 grid place-items-center w-7 h-7 sm:w-8 sm:h-8 border backdrop-blur rounded-sm transition-all active:scale-90 ${
              wished
                ? "bg-blaze-500 border-blaze-500 text-ink-50"
                : "bg-ink-950/75 border-ink-700/80 text-ink-200 hover:border-blaze-500 hover:text-blaze-400"
            }`}
          >
            <Ic.heart className="w-3.5 h-3.5" filled={wished} />
          </button>

          {/* Product Photo */}
          <Link to={`/product/${p.id}`} className="relative block aspect-square overflow-hidden bg-ink-900">
            <PImg
              src={p.img}
              crop={p.crop}
              filter={colorFilter}
              alt={p.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Minimalist Card Body: Name, Rating, Price & Add Button */}
          <div className="p-2.5 sm:p-3.5 bg-ink-850 flex flex-col justify-between flex-1">
            <div className="flex items-start justify-between gap-1.5">
              <Link
                to={`/product/${p.id}`}
                className="font-display text-xs sm:text-sm font-semibold leading-snug text-ink-50 hover:text-blaze-400 transition-colors line-clamp-2"
              >
                {p.name}
              </Link>
              <span className="flex items-center gap-0.5 font-mono text-[10px] sm:text-[11px] text-gold-400 font-bold shrink-0 mt-0.5">
                ★ {p.rating.toFixed(1)}
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-ink-800/70 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="font-mono tabnum font-bold text-xs sm:text-sm text-ink-50">{fmt(p.price)}</span>
                {p.compareAt && (
                  <span className="font-mono tabnum text-[9px] sm:text-[11px] text-ink-500 line-through truncate">
                    {fmt(p.compareAt)}
                  </span>
                )}
              </div>

              {out ? (
                <span className="text-[9px] font-mono text-ink-500 uppercase">{t("outOfStock")}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-ink-50 font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded transition-all active:scale-95 shrink-0 ${
                    justAdded ? "bg-emerald-600" : "bg-blaze-500 hover:bg-blaze-400"
                  }`}
                >
                  {justAdded ? "✓ Added" : "+ Add"}
                </button>
              )}
            </div>
          </div>
        </div>
      </Tilt>
    </div>
  );
}

/* ---------- quick view modal ---------- */
function QuickViewModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { products, fmt, t, cartAdd, toggleWish, wishlist } = useStore();
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
        <div className="relative bg-ink-850 grid place-items-center p-5 sm:p-6 md:p-8 min-h-56 sm:min-h-64">
          <div className="absolute inset-0 grid-lines opacity-50" />
          {p.tag && <span className="absolute top-4 left-4 clip-tag bg-blaze-500 text-ink-50 font-mono text-[10px] tracking-[0.18em] px-2.5 py-1 z-10">{p.tag}</span>}
          <Tilt max={12} className="relative w-full max-w-[220px] sm:max-w-xs">
            <PImg src={p.img} crop={p.crop} filter={filter} alt={p.name} className="w-full aspect-square drop-shadow-2xl rounded-lg" />
          </Tilt>
        </div>
        <div className="p-5 sm:p-7">
          <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight">{p.name}</h3>
          <div className="flex items-center gap-2 mt-1.5 text-ink-300 text-xs">
            <Stars value={p.rating} /> <span className="font-mono">{p.rating.toFixed(1)} ({p.ratingCount})</span>
          </div>
          <div className="flex items-baseline gap-2.5 mt-3">
            <span className="font-mono tabnum text-2xl sm:text-3xl font-bold text-ink-50">{fmt(p.price)}</span>
            {p.compareAt && <span className="font-mono tabnum text-sm text-ink-500 line-through">{fmt(p.compareAt)}</span>}
          </div>

          <div className="mt-4">
            <p className="font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase mb-1.5">{t("colorway")} — <span className="text-ink-100">{p.colors[color].name}</span></p>
            <div className="flex gap-2">
              {p.colors.map((c, i) => (
                <button key={c.name} onClick={() => setColor(i)} className={`w-7 h-7 rounded-full border-2 transition-transform ${i === color ? "border-blaze-500 scale-110" : "border-ink-600"}`} style={{ background: c.hex }} aria-label={c.name} />
              ))}
            </div>
          </div>
          {p.sizes.length > 1 && (
            <div className="mt-3.5">
              <p className="font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase mb-1.5">{t("size")}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.sizes.map((s, i) => (
                  <button key={s} onClick={() => setSize(i)} className={`px-3 py-1 border font-mono text-xs transition-colors ${i === size ? "bg-ink-100 text-ink-950 border-ink-100" : "border-ink-600 text-ink-200"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-5 flex items-center gap-2.5">
            <Qty value={qty} onChange={setQtyV} max={Math.max(1, p.stock)} />
            <button onClick={() => { cartAdd(p.id, p.colors[color].name, p.sizes[size], qty); onClose(); }} disabled={p.stock <= 0}
              className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 disabled:opacity-40 text-ink-50 font-mono text-xs tracking-[0.16em] uppercase py-3 transition-colors flex items-center justify-center gap-2 font-bold">
              <Ic.bag className="w-4 h-4" /> {p.stock <= 0 ? t("outOfStock") : t("addToCart")}
            </button>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button onClick={() => toggleWish(p.id)} className={`px-3 py-2 border font-mono text-[11px] uppercase transition-colors ${wishlist.includes(p.id) ? "border-blaze-500 text-blaze-400" : "border-ink-600 text-ink-300"}`}>♥ {t("wishlist")}</button>
            <Link to={`/product/${p.id}`} onClick={onClose} className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-blaze-400 hover:underline">
              Full details <Ic.arrow className="w-3.5 h-3.5" />
            </Link>
          </div>
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
