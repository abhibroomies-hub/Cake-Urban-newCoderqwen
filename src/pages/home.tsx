import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { Ic, PImg, Particles, Reveal, SectionHead, useScramble } from "../components/ui";
import { ProductCard } from "../components/product";
import { CustomerReviewsShowcase } from "../components/CustomerReviewsShowcase";

function HeroRing() {
  const { products, fmt } = useStore();
  const items = products.filter((p) => p.featured || (p.tag && p.tag.includes("BEST"))).slice(0, 6);
  const R = 225;
  return (
    <div className="ring-stage relative w-full h-[350px] xl:h-[380px] hidden md:flex items-center justify-center select-none bg-transparent border-0" aria-hidden>
      <div className="absolute w-[390px] h-[390px] rounded-full border border-ink-700/40 anim-spin-slow pointer-events-none" style={{ borderStyle: "dashed" }} />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-blaze-500/20 pointer-events-none" />
      <div className="ring-rotor absolute" style={{ width: 176, height: 236 }}>
        {items.map((p, i) => (
          <Link key={p.id} to={`/product/${p.id}`} className="ring-card absolute inset-0 block"
            style={{ transform: `rotateY(${(360 / items.length) * i}deg) translateZ(${R}px)` }} tabIndex={-1}>
            <div className="w-full h-full bg-ink-850/90 border border-ink-700/70 clip-tile overflow-hidden backdrop-blur-sm group hover:border-blaze-500 transition-colors shadow-xl">
              <PImg src={p.img} crop={p.crop} filter={p.imgFilter} alt={p.name} className="w-full h-[70%] object-cover" />
              <div className="p-2.5">
                <p className="font-display text-[11px] font-semibold leading-tight truncate group-hover:text-blaze-400 transition-colors">{p.name}</p>
                <p className="font-mono tabnum text-[10px] text-ink-300 mt-0.5">{fmt(p.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-0 font-mono text-[9px] tracking-[0.28em] text-ink-500 uppercase">Hover to pause · Click to explore</div>
    </div>
  );
}

function HeroVisualizer() {
  return (
    <div className="relative w-full max-w-lg mx-auto hidden md:block">
      <HeroRing />
    </div>
  );
}

export default function Home() {
  const { products, categories, settings, toast, t } = useStore();
  const titleA = useScramble("CAKES &");
  const titleB = useScramble("HAMPERS");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("ALL");
  const [featuredView, setFeaturedView] = useState<"grid2" | "reel">("grid2");
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: "left" | "right") => {
    if (carouselRef.current) {
      const shift = dir === "left" ? -280 : 280;
      carouselRef.current.scrollBy({ left: shift, behavior: "smooth" });
    }
  };

  const homeCategories = categories.filter((c) => c.showOnHome !== false);

  const featured = (settings.featuredProductIds && settings.featuredProductIds.length > 0)
    ? settings.featuredProductIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as typeof products
    : products.filter((p) => p.featured || p.tag).slice(0, 8);

  const filteredFeatured = activeQuickFilter === "ALL"
    ? featured
    : featured.filter((p) =>
        p.category.toLowerCase().includes(activeQuickFilter.toLowerCase()) ||
        (p.tag && p.tag.toLowerCase().includes(activeQuickFilter.toLowerCase()))
      );

  const quickFilterPills = [
    { label: "🔥 All", val: "ALL" },
    { label: "🍫 Chocolate", val: "Chocolate" },
    { label: "🍓 Berry", val: "Berry" },
    { label: "⭐ Bestsellers", val: "BEST" },
    { label: "🍰 Cheesecakes", val: "Cheesecake" },
  ];

  const stats = [
    ["4.9★", "2.4k+ Verified"],
    ["30-45M", "Express NCR"],
    ["100%", "Pure Eggless"],
  ];

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast("success", `Coupon ${code} copied!`);
  };

  return (
    <div className="overflow-x-clip">
      {/* ============ 1. HERO SECTION ============ */}
      <section className="relative flex items-center noise overflow-hidden border-b border-ink-800/70">
        <div className="absolute inset-0 grid-lines" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_40%,rgba(226,62,95,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_20%_80%,rgba(214,151,64,0.13),transparent_60%)]" />
        <Particles />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-7 sm:py-10 lg:py-12 grid lg:grid-cols-[1.08fr_0.92fr] gap-6 lg:gap-8 items-center w-full">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] tracking-[0.15em] text-blaze-400 border border-blaze-500/40 bg-blaze-500/10 px-2.5 py-1 rounded font-bold">
              <span>🌱 100% EGGLESS</span>
              <span className="text-ink-600">·</span>
              <span className="text-volt-400">⚡ 30-45M NCR DELIVERY</span>
            </div>

            <h1 className="font-display font-black uppercase leading-[0.96] mt-3.5 sm:mt-4 text-4xl sm:text-5xl lg:text-6xl">
              <span className="block">{titleA}</span>
              <span className="block text-outline-blaze italic mt-0.5">{titleB}</span>
            </h1>

            <p className="text-ink-300 text-xs sm:text-sm max-w-md mt-3 leading-relaxed">
              Fresh Belgian chocolate cakes, gourmet cookies & luxury hampers delivered chilled in 30–45 mins.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-5">
              <Link to="/shop" className="clip-btn group bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.15em] uppercase px-5 sm:px-6 py-3 transition-all flex items-center gap-2 font-bold whitespace-nowrap shrink-0">
                {t("shopNow")} <Ic.arrow className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/builder" className="clip-btn border border-ink-600 hover:border-blaze-500 hover:text-ink-50 text-ink-200 font-mono text-xs tracking-[0.15em] uppercase px-4 sm:px-5 py-3 transition-colors whitespace-nowrap shrink-0">
                🎂 Customizer
              </Link>
              <Link to="/track" className="clip-btn border border-ink-700 hover:border-volt-400 text-volt-400 font-mono text-xs tracking-[0.14em] uppercase px-4 sm:px-5 py-3 transition-colors whitespace-nowrap shrink-0">
                📍 Track
              </Link>
            </div>

            {/* Compact Stats & Coupon */}
            <div className="mt-5 pt-4 border-t border-ink-800/80 flex flex-wrap items-center justify-between gap-3 max-w-lg">
              <div className="flex items-center gap-5 sm:gap-6">
                {stats.map(([n, l]) => (
                  <div key={l}>
                    <p className="font-mono tabnum text-sm sm:text-lg font-bold text-ink-50">{n}</p>
                    <p className="font-mono text-[8px] sm:text-[9px] tracking-[0.1em] text-ink-400 uppercase">{l}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => copyCoupon("URBAN15")}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-ink-900 hover:bg-ink-850 border border-ink-700 hover:border-blaze-500 rounded transition-colors shrink-0"
              >
                <span className="font-mono text-[10px] text-ink-300 uppercase">
                  Code: <strong className="text-blaze-400">URBAN15</strong> (15% Off)
                </span>
                <span className="px-1.5 py-0.5 bg-blaze-500 text-ink-50 font-mono text-[8px] uppercase font-bold rounded">
                  Copy
                </span>
              </button>
            </div>
          </div>

          <div className="relative hidden md:block">
            <HeroVisualizer />
          </div>
        </div>
      </section>

      {/* ============ 2. VISUAL CATEGORIES (PICK YOUR CRAVING) ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
        <SectionHead
          kicker="01 — Categories"
          title="Pick your craving"
          link={
            <Link to="/shop" className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-4 py-2 font-mono text-[11px] tracking-[0.15em] uppercase inline-flex items-center gap-1.5 transition-colors">
              {t("viewAll")} <Ic.arrow className="w-3.5 h-3.5" />
            </Link>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {homeCategories.map((c, i) => {
            const cropVal = c.crop ?? (c.id === "cat-cookies" || c.name === "Cookies" ? "0% 0%" : undefined);
            return (
              <Reveal key={c.name} delay={i * 50}>
                <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group relative block h-[135px] sm:h-[175px] md:h-[200px] clip-tile overflow-hidden border border-ink-700/60 bg-ink-850 shadow-md hover:border-blaze-500 transition-colors">
                  <PImg src={c.img} crop={cropVal} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/25 to-transparent" />
                  <div className="absolute inset-0 p-3.5 sm:p-4 flex items-end justify-between gap-2">
                    <p className="font-display font-bold text-sm sm:text-lg uppercase text-ink-50 leading-tight drop-shadow">{c.name}</p>
                    <span className="w-7 h-7 grid place-items-center border border-ink-100/30 text-ink-100 bg-ink-950/60 backdrop-blur rounded shrink-0 group-hover:bg-blaze-500 group-hover:border-blaze-500 transition-colors">
                      <Ic.arrow className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ 3. SIGNATURE BAKES (PRODUCTS) ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-10 sm:pb-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-ink-800">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
              02 — Bestsellers
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase mt-0.5 text-ink-50">
              Fresh From The Oven
            </h2>
          </div>

          <div className="flex items-center justify-between gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {quickFilterPills.map((pill) => (
                <button
                  key={pill.val}
                  type="button"
                  onClick={() => setActiveQuickFilter(pill.val)}
                  className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider rounded-full transition-all whitespace-nowrap shrink-0 ${
                    activeQuickFilter === pill.val
                      ? "bg-blaze-500 text-ink-50 font-bold shadow-sm"
                      : "bg-ink-900 border border-ink-700/80 text-ink-300 hover:text-ink-100"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-ink-900 border border-ink-700/80 rounded-lg p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setFeaturedView("grid2")}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${featuredView === "grid2" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400 hover:text-ink-100"}`}
              >
                ⊞ Grid
              </button>
              <button
                type="button"
                onClick={() => setFeaturedView("reel")}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors whitespace-nowrap shrink-0 ${featuredView === "reel" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400 hover:text-ink-100"}`}
              >
                ⇆ Reel
              </button>
            </div>
          </div>
        </div>

        {filteredFeatured.length === 0 ? (
          <div className="py-12 text-center bg-ink-900/50 border border-ink-800 rounded-lg mt-5">
            <p className="text-ink-300 font-display text-base font-bold">No items in this filter</p>
            <button
              onClick={() => setActiveQuickFilter("ALL")}
              className="mt-2 text-xs font-mono text-blaze-400 underline uppercase"
            >
              Show All
            </button>
          </div>
        ) : featuredView === "reel" ? (
          <div className="relative mt-5">
            <div className="flex items-center justify-end gap-1.5 mb-2">
              <button
                onClick={() => scrollCarousel("left")}
                className="w-7 h-7 rounded border border-ink-700 bg-ink-900 text-ink-200 hover:border-blaze-500 grid place-items-center"
                aria-label="Scroll left"
              >
                ←
              </button>
              <button
                onClick={() => scrollCarousel("right")}
                className="w-7 h-7 rounded border border-ink-700 bg-ink-900 text-ink-200 hover:border-blaze-500 grid place-items-center"
                aria-label="Scroll right"
              >
                →
              </button>
            </div>
            <div
              ref={carouselRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 smooth-scroll no-scrollbar snap-x-mandatory"
            >
              {filteredFeatured.map((p, i) => (
                <div key={p.id} className="w-[175px] sm:w-[235px] md:w-[260px] shrink-0 snap-item">
                  <ProductCard p={p} index={i} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 mt-5">
            {filteredFeatured.map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard p={p} index={i} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ 4. COOKIES & GIFT HAMPERS ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-10 sm:pb-14">
        <div className="flex items-end justify-between pb-3 border-b border-ink-800">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-volt-400 uppercase font-bold">03 — Gifting & Munchies</p>
            <h2 className="font-display font-bold text-xl sm:text-3xl uppercase mt-0.5 text-ink-50">Cookies & Luxury Hampers</h2>
          </div>
          <Link to="/shop?cat=Gift Hampers" className="font-mono text-xs text-blaze-400 hover:underline uppercase tracking-wider shrink-0">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 mt-5">
          {products
            .filter((p) => p.category === "Gift Hampers" || p.category === "Cookies")
            .slice(0, 4)
            .map((p, i) => (
              <div key={p.id} className="h-full">
                <ProductCard p={p} index={i} />
              </div>
            ))}
        </div>
      </section>

      {/* ============ 5. VERIFIED PHOTO REVIEWS ============ */}
      <CustomerReviewsShowcase />
    </div>
  );
}
