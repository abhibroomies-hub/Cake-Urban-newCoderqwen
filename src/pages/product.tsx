import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStore } from "../lib/store";
import { Ic, ImgX, Qty, Reveal, Stars, Tilt } from "../components/ui";
import { ProductCard, useQuickView } from "../components/product";

export default function ProductPage({ onAddToCartFlow }: { onAddToCartFlow: () => void }) {
  const { id } = useParams();
  const nav = useNavigate();
  const { products, reviews, fmt, t, cartAdd, toggleWish, wishlist, toggleCompare, compare, addReview, toast, user } = useStore();
  const { openQV } = useQuickView();
  const p = products.find((x) => x.id === id);
  const [color, setColor] = useState(0);
  const [size, setSize] = useState(0);
  const [qty, setQtyV] = useState(1);
  const [acc, setAcc] = useState<string | null>("ship");
  const [revName, setRevName] = useState(user?.name ?? "");
  const [revRating, setRevRating] = useState(5);
  const [revTitle, setRevTitle] = useState("");
  const [revText, setRevText] = useState("");
  const [revImg, setRevImg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pReviews = useMemo(() => reviews.filter((r) => r.productId === id), [reviews, id]);
  if (!p) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-display text-4xl font-black uppercase">Product not found</p>
        <Link to="/shop" className="clip-tag mt-6 inline-block border border-blaze-500 text-blaze-400 px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase">Back to shop</Link>
      </div>
    );
  }
  const filter = p.imgFilter ?? p.colors[color]?.filter;
  const wished = wishlist.includes(p.id);
  const compared = compare.includes(p.id);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, n: pReviews.filter((r) => r.rating === s).length }));
  const maxDist = Math.max(1, ...dist.map((d) => d.n));

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName.trim() || !revText.trim()) { toast("error", "Name and review text are required"); return; }
    addReview({ productId: p.id, name: revName.trim(), rating: revRating, title: revTitle.trim() || "Verified review", text: revText.trim(), hasImage: !!revImg });
    setRevTitle(""); setRevText(""); setRevImg(null); setRevRating(5);
    toast("success", "Review published — thank you ⚡");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      {/* breadcrumb */}
      <nav className="font-mono text-[11px] tracking-[0.15em] text-ink-400 uppercase flex items-center gap-2 mb-8">
        <Link to="/" className="hover:text-blaze-400 transition-colors">Home</Link> /
        <Link to={`/shop?cat=${encodeURIComponent(p.category)}`} className="hover:text-blaze-400 transition-colors">{p.category}</Link> /
        <span className="text-ink-200">{p.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* gallery */}
        <div>
          <Tilt max={7} className="relative">
            <div className="relative bg-ink-850 clip-tile border border-ink-700/60 overflow-hidden">
              <div className="absolute inset-0 grid-lines opacity-50" />
              {p.tag && <span className="absolute top-5 left-5 z-10 clip-tag bg-blaze-500 text-ink-50 font-mono text-[11px] tracking-[0.2em] px-3 py-1.5">{p.tag}</span>}
              <span className="absolute top-5 right-5 z-10 font-mono text-[10px] tracking-[0.2em] text-ink-500">{p.sku}</span>
              <ImgX key={`${p.id}-${color}`} src={p.img} alt={p.name} className="w-full aspect-square object-cover anim-fade-in" style={filter ? { filter } : undefined} />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-ink-300 uppercase bg-ink-950/70 backdrop-blur px-3 py-2">
                <Ic.rotate className="w-3.5 h-3.5 text-blaze-500" /> Move cursor — 3D tilt
              </div>
            </div>
          </Tilt>
          <div className="flex gap-2.5 mt-4">
            {p.colors.map((c, i) => (
              <button key={c.name} onClick={() => setColor(i)} className={`relative w-20 h-20 clip-tag overflow-hidden border-2 transition-all ${i === color ? "border-blaze-500 scale-105" : "border-ink-700 opacity-60 hover:opacity-100"}`}>
                <ImgX src={p.img} alt={c.name} className="w-full h-full object-cover" style={{ filter: p.imgFilter ?? c.filter }} />
                <span className="absolute bottom-0 inset-x-0 bg-ink-950/85 font-mono text-[8px] tracking-wider uppercase py-0.5 text-center">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* buy box */}
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 uppercase">{p.brand} · {p.category}</p>
          <h1 className="font-display text-3xl md:text-5xl font-black uppercase leading-[1.02] mt-3">{p.name}</h1>
          <button onClick={() => openQV(p.id)} className="flex items-center gap-2 mt-3 text-sm text-ink-300 hover:text-blaze-400 transition-colors">
            <Stars value={p.rating} /> <span className="font-mono text-xs">{p.rating.toFixed(1)} · {p.ratingCount.toLocaleString()} {t("reviews")}</span>
          </button>
          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-mono tabnum text-4xl font-bold text-ink-50">{fmt(p.price)}</span>
            {p.compareAt && <><span className="font-mono tabnum text-xl text-ink-500 line-through">{fmt(p.compareAt)}</span><span className="clip-tag bg-volt-400/15 text-volt-400 font-mono text-xs px-2 py-1">SAVE {Math.round((1 - p.price / p.compareAt) * 100)}%</span></>}
          </div>
          <p className="text-ink-300 leading-relaxed mt-5">{p.desc}</p>

          {/* stock meter */}
          <div className="mt-6">
            <div className="flex justify-between font-mono text-[10px] tracking-[0.2em] uppercase mb-1.5">
              <span className={p.stock <= 5 ? "text-gold-400" : "text-volt-400"}>{p.stock <= 0 ? t("outOfStock") : p.stock <= 5 ? `⚠ ${t("lowStock", { n: p.stock })}` : t("inStock")}</span>
              <span className="text-ink-500">{p.stock} units</span>
            </div>
            <div className="h-1.5 bg-ink-800 overflow-hidden">
              <div className={`h-full transition-all ${p.stock <= 5 ? "bg-gold-400" : "bg-volt-400"}`} style={{ width: `${Math.min(100, p.stock * 2.5)}%` }} />
            </div>
          </div>

          <div className="mt-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-ink-400 uppercase mb-2">{t("colorway")} — <span className="text-ink-100">{p.colors[color].name}</span></p>
            <div className="flex gap-2.5">
              {p.colors.map((c, i) => (
                <button key={c.name} onClick={() => setColor(i)} title={c.name} className={`w-9 h-9 rounded-full border-2 transition-transform ${i === color ? "border-blaze-500 scale-115" : "border-ink-600 hover:border-ink-400"}`} style={{ background: c.hex }} />
              ))}
            </div>
          </div>
          <div className="mt-5">
            <p className="font-mono text-[11px] tracking-[0.2em] text-ink-400 uppercase mb-2">{t("size")}</p>
            <div className="flex flex-wrap gap-2">
              {p.sizes.map((s, i) => (
                <button key={s} onClick={() => setSize(i)} className={`px-4 py-2.5 border font-mono text-xs transition-colors ${i === size ? "bg-ink-100 text-ink-950 border-ink-100" : "border-ink-600 text-ink-200 hover:border-blaze-500"}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-7">
            <Qty value={qty} onChange={setQtyV} max={Math.max(1, p.stock)} />
            <button onClick={() => { cartAdd(p.id, p.colors[color].name, p.sizes[size], qty); onAddToCartFlow(); }} disabled={p.stock <= 0}
              className="clip-btn flex-1 min-w-44 bg-blaze-500 hover:bg-blaze-400 disabled:opacity-40 text-ink-50 font-mono text-sm tracking-[0.18em] uppercase py-4 transition-all hover:shadow-glow flex items-center justify-center gap-2">
              <Ic.bag className="w-4 h-4" /> {p.stock <= 0 ? t("outOfStock") : t("addToCart")}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button onClick={() => nav("/checkout")} disabled={p.stock <= 0} className="clip-btn border border-ink-100/50 hover:border-blaze-500 hover:text-blaze-400 disabled:opacity-40 py-3.5 font-mono text-xs tracking-[0.2em] uppercase transition-colors">{t("buyNow")}</button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => toggleWish(p.id)} aria-label={t("wishlist")} className={`border flex items-center justify-center transition-colors ${wished ? "border-blaze-500 text-blaze-400" : "border-ink-600 text-ink-300 hover:border-blaze-500"}`}><Ic.heart className="w-4 h-4" filled={wished} /></button>
              <button onClick={() => toggleCompare(p.id)} aria-label={t("compare")} className={`border flex items-center justify-center transition-colors ${compared ? "border-cobalt-400 text-cobalt-300" : "border-ink-600 text-ink-300 hover:border-cobalt-400"}`}><Ic.scale className="w-4 h-4" /></button>
            </div>
          </div>

          {/* accordions */}
          <div className="mt-8 border-t border-ink-800">
            {[
              ["ship", "Shipping & delivery", <div key="a" className="space-y-2 text-sm text-ink-300"><p className="flex gap-2"><Ic.truck className="w-4 h-4 text-blaze-500 shrink-0" /> Express (2–4 days) — free over $150, otherwise $12.</p><p className="flex gap-2"><Ic.globe className="w-4 h-4 text-blaze-500 shrink-0" /> Ships to 40+ countries in 24h, duties calculated at checkout.</p></div>],
              ["returns", "Returns & warranty", <p key="b" className="text-sm text-ink-300 flex gap-2"><Ic.shield className="w-4 h-4 text-blaze-500 shrink-0" /> 30-day free returns, prepaid label. 2-year warranty minimum; Northline carry is lifetime.</p>],
              ["care", "Care & materials", <p key="c" className="text-sm text-ink-300">Spot clean with cold water. Full material breakdown and recycling program details ship in the box.</p>],
            ].map(([key, label, body]) => (
              <div key={key as string} className="border-b border-ink-800">
                <button onClick={() => setAcc(acc === key ? null : (key as string))} className="w-full flex items-center justify-between py-4 font-mono text-xs tracking-[0.2em] uppercase text-ink-200 hover:text-blaze-400 transition-colors">
                  {label as string} <Ic.chev className={`w-4 h-4 transition-transform ${acc === key ? "rotate-180 text-blaze-500" : ""}`} />
                </button>
                <div className="grid transition-all duration-300" style={{ gridTemplateRows: acc === key ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden"><div className="pb-5">{body}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* specs */}
      <section className="mt-20">
        <Reveal><h2 className="font-display text-2xl md:text-3xl font-bold uppercase mb-6">{t("specs")}</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-800 border border-ink-800 clip-tile overflow-hidden">
          {p.specs.map(([k, v], i) => (
            <Reveal key={k} delay={i * 50} className="bg-ink-850 p-6 hover:bg-ink-800 transition-colors">
              <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase">{k}</p>
              <p className="font-display font-semibold text-lg mt-2">{v}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* reviews */}
      <section className="mt-20 grid lg:grid-cols-[1fr_1.4fr] gap-12">
        <div>
          <Reveal>
            <h2 className="font-display text-2xl md:text-3xl font-bold uppercase mb-6">{t("reviews")}</h2>
            <div className="border border-ink-700/60 bg-ink-850 clip-tile p-7">
              <div className="flex items-end gap-4">
                <p className="font-display text-6xl font-black tabnum">{p.rating.toFixed(1)}</p>
                <div className="pb-1.5"><Stars value={p.rating} className="w-4 h-4" /><p className="font-mono text-[10px] text-ink-400 mt-1.5">{p.ratingCount.toLocaleString()} verified</p></div>
              </div>
              <div className="space-y-2 mt-6">
                {dist.map((d) => (
                  <div key={d.s} className="flex items-center gap-3 font-mono text-xs">
                    <span className="w-6 text-ink-400">{d.s}★</span>
                    <div className="flex-1 h-1.5 bg-ink-800"><div className="h-full bg-gold-400 transition-all" style={{ width: `${(d.n / maxDist) * 100}%` }} /></div>
                    <span className="w-6 text-right text-ink-500">{d.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          {/* write review */}
          <Reveal delay={100}>
            <form onSubmit={submitReview} className="border border-ink-700/60 bg-ink-850 clip-tile p-7 mt-5">
              <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase mb-4">Write a review</p>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button type="button" key={s} onClick={() => setRevRating(s)} className={`transition-transform hover:scale-115 ${s <= revRating ? "text-gold-400" : "text-ink-600"}`}><Ic.star className="w-6 h-6" /></button>
                ))}
              </div>
              <input value={revName} onChange={(e) => setRevName(e.target.value)} placeholder="Your name" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm mb-2.5 transition-colors" />
              <input value={revTitle} onChange={(e) => setRevTitle(e.target.value)} placeholder="Headline (optional)" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm mb-2.5 transition-colors" />
              <textarea value={revText} onChange={(e) => setRevText(e.target.value)} placeholder="How did it perform?" rows={3} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm resize-none transition-colors" />
              <div className="flex items-center gap-3 mt-3">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setRevImg(e.target.files?.[0]?.name ?? null)} />
                <button type="button" onClick={() => fileRef.current?.click()} className="clip-tag border border-ink-600 hover:border-cobalt-400 hover:text-cobalt-300 px-3 py-2 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors"><Ic.upload className="w-3.5 h-3.5" /> Photo</button>
                {revImg && <span className="font-mono text-[10px] text-volt-400 truncate">✓ {revImg}</span>}
                <button className="clip-tag ml-auto bg-blaze-500 hover:bg-blaze-400 text-ink-50 px-5 py-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors">Publish</button>
              </div>
            </form>
          </Reveal>
        </div>
        <div className="space-y-4">
          {pReviews.length === 0 && <p className="text-sm text-ink-400 border border-dashed border-ink-700 p-8 text-center">No reviews yet — be the first to report from the field.</p>}
          {pReviews.map((r, i) => (
            <Reveal key={r.id} delay={i * 70}>
              <article className="border border-ink-700/60 bg-ink-850 p-6 clip-tile hover:border-ink-600 transition-colors">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 grid place-items-center bg-blaze-500/15 border border-blaze-500/40 text-blaze-400 font-mono text-sm">{r.name[0]}</span>
                    <div>
                      <p className="text-sm font-semibold">{r.name} <span className="ml-1.5 clip-tag bg-volt-400/10 text-volt-400 font-mono text-[9px] px-1.5 py-0.5 tracking-wider">VERIFIED</span></p>
                      <p className="font-mono text-[10px] text-ink-500">{r.date}</p>
                    </div>
                  </div>
                  <Stars value={r.rating} />
                </div>
                <h3 className="font-display font-semibold mt-4">{r.title}</h3>
                <p className="text-sm text-ink-300 leading-relaxed mt-1.5">{r.text}</p>
                {r.hasImage && (
                  <div className="flex gap-2 mt-3">
                    {[0, 1].map((k) => <span key={k} className="w-16 h-16 clip-tag overflow-hidden border border-ink-700"><ImgX src={p.img} alt="Customer photo" className="w-full h-full object-cover" style={{ filter: k ? "brightness(0.85)" : undefined }} /></span>)}
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl md:text-3xl font-bold uppercase mb-6">Pairs well with</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((rp, i) => <Reveal key={rp.id} delay={i * 80}><ProductCard p={rp} index={i} /></Reveal>)}
          </div>
        </section>
      )}
    </div>
  );
}
