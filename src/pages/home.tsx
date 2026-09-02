import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { LIFESTYLE_IMG, BLOG_POSTS } from "../data/catalog";
import { Ic, ImgX, PImg, Particles, Reveal, SectionHead, Stars, useScramble } from "../components/ui";
import { ProductCard } from "../components/product";

function useParallax() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const h = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current; if (!el) return;
        const r = el.getBoundingClientRect();
        const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const img = el.querySelector<HTMLDivElement>("[data-plx]");
        if (img) img.style.transform = `translateY(${p * -60}px) scale(1.18)`;
        const txt = el.querySelector<HTMLElement>("[data-plx-text]");
        if (txt) txt.style.transform = `translateY(${p * 40}px)`;
      });
    };
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => { window.removeEventListener("scroll", h); cancelAnimationFrame(raf); };
  }, []);
  return ref;
}

function HeroRing() {
  const { products, fmt } = useStore();
  const items = products.filter((p) => p.featured || (p.tag && p.tag.includes("BEST"))).slice(0, 6);
  const R = 300;
  return (
    <div className="ring-stage relative w-full h-[420px] sm:h-[480px] hidden md:flex items-center justify-center select-none" aria-hidden>
      <div className="absolute w-[560px] h-[560px] rounded-full border border-ink-700/40 anim-spin-slow" style={{ borderStyle: "dashed" }} />
      <div className="absolute w-[420px] h-[420px] rounded-full border border-blaze-500/20" />
      <div className="ring-rotor absolute" style={{ width: 220, height: 300 }}>
        {items.map((p, i) => (
          <Link key={p.id} to={`/product/${p.id}`} className="ring-card absolute inset-0 block"
            style={{ transform: `rotateY(${(360 / items.length) * i}deg) translateZ(${R}px)` }} tabIndex={-1}>
            <div className="w-full h-full bg-ink-850/90 border border-ink-700/70 clip-tile overflow-hidden backdrop-blur-sm group hover:border-blaze-500 transition-colors">
              <PImg src={p.img} crop={p.crop} filter={p.imgFilter} alt={p.name} className="w-full h-[72%] object-cover" />
              <div className="p-3">
                <p className="font-display text-[11px] font-semibold leading-tight truncate group-hover:text-blaze-400 transition-colors">{p.name}</p>
                <p className="font-mono tabnum text-[11px] text-ink-300 mt-1">{fmt(p.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute -bottom-2 font-mono text-[9px] tracking-[0.3em] text-ink-500 uppercase">Hover to pause · Click to explore</div>
    </div>
  );
}

export default function Home() {
  const { products, categories, settings, fmt, toast } = useStore();
  const { t } = useStore();
  const titleA = useScramble("COOKIES &");
  const titleB = useScramble("HAMPERS");
  const plx = useParallax();
  const [selectedHub, setSelectedHub] = useState<string>("faridabad");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string>("ALL");
  const [featuredView, setFeaturedView] = useState<"grid2" | "reel">("grid2");
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: "left" | "right") => {
    if (carouselRef.current) {
      const shift = dir === "left" ? -280 : 280;
      carouselRef.current.scrollBy({ left: shift, behavior: "smooth" });
    }
  };
  const [showStory, setShowStory] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const homeSections = settings.homeSections || {
    hero: true,
    ticker: true,
    ncrHubs: true,
    categories: true,
    featured: true,
    manifesto: true,
    standards: true,
    reviews: true,
    journal: true,
    faqs: true,
  };

  const homeCategories = categories.filter((c) => c.showOnHome !== false);
  const hubs = settings.ncrHubs || [];

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

  const heroProduct = products.find((p) => p.id === "raspberry-noir") ?? products[0];

  const quickFilterPills = [
    { label: "🔥 All Signatures", val: "ALL" },
    { label: "🍫 Chocolate & Truffle", val: "Chocolate" },
    { label: "🍓 Berries & Fruit", val: "Berry" },
    { label: "⭐ Best Sellers", val: "BEST" },
    { label: "🍰 Cheesecakes", val: "Cheesecake" },
  ];

  const reviews = [
    { name: "Pooja Sharma", role: "Faridabad Sector 15 · Ordered for Mom's 50th", text: "Delivered in 35 mins at midnight! The Belgian chocolate truffle held perfectly. Best eggless cake in Faridabad, hands down.", rating: 5, product: "Raspberry Noir Truffle" },
    { name: "Rohan Verma", role: "Noida Sector 75 · Birthday order", text: "100% pure eggless and so incredibly soft. Guests could not believe it was eggless. Packaging with dry ice was top notch.", rating: 5, product: "Molten Choc-Chip Stack" },
    { name: "Simran Kaur", role: "Gurgaon DLF Cyber City · Office celebration", text: "The Pistachio Rose Royale is breathtaking. Mild rose fragrance, crunchy pistachio praline. Highly recommended across NCR!", rating: 5, product: "Pistachio Rose Royale" },
  ];

  const faqs = [
    {
      q: "Are 100% of your cakes eggless and vegetarian?",
      a: "Yes, absolute 100%. Our dedicated artisan kitchens never use eggs, gelatin, or animal by-products. We use cultured dairy butter, real Belgian cocoa, and natural organic setting agents."
    },
    {
      q: "How fast can I get a cake delivered in Delhi NCR?",
      a: "Our express delivery hubs in Faridabad, Noida, Gurgaon, South Delhi, and Ghaziabad dispatch in specialized insulated carriers to deliver within 30 to 45 minutes of order confirmation."
    },
    {
      q: "Do you offer midnight birthday delivery?",
      a: "Yes! We specialize in midnight surprise deliveries between 11:30 PM and 12:15 AM across Delhi NCR with live courier tracking and customized handwritten gift message cards."
    },
    {
      q: "Can I add a custom name or message on the cake?",
      a: "Absolutely. During checkout or product customization, you can write any custom message (up to 30 characters), and our pastry chefs will hand-pipe it onto a Belgian chocolate plaque."
    }
  ];

  const stats = settings.hero?.stats || [["4.9★", "2,480+ Google Reviews"], ["30-45M", "Express Delivery"], ["100%", "Pure Eggless Veg"]];

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast("success", `Coupon code ${code} copied to clipboard!`);
  };

  return (
    <div className="overflow-x-clip">
      {/* ============ HERO SECTION ============ */}
      {homeSections.hero !== false && (
        <section className="relative min-h-[88vh] flex items-center noise overflow-hidden">
          <div className="absolute inset-0 grid-lines" />
          <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_40%,rgba(226,62,95,0.14),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_20%_80%,rgba(214,151,64,0.13),transparent_60%)]" />
          <Particles />
          <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-ink-800/80 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center w-full">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 anim-fade-up">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.25em] text-blaze-400 clip-tag border border-blaze-500/40 bg-blaze-500/10 px-3.5 py-1.5 font-bold">
                  <span className="w-2 h-2 bg-emerald-400 pulse-dot rounded-full" /> {settings.hero?.kicker || "100% PURE EGGLESS BAKERY"}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-volt-400 bg-volt-500/10 border border-volt-500/30 px-3 py-1.5 clip-tag font-bold">
                  ⚡ 30-45 MIN EXPRESS NCR
                </span>
              </div>

              <h1 className="font-display font-black uppercase leading-[0.95] mt-6 text-[12vw] sm:text-6xl xl:text-7xl">
                <span className="block anim-fade-up" style={{ animationDelay: "80ms" }}>{titleA}</span>
                <span className="block text-outline-blaze italic" style={{ animationDelay: "160ms" }}>{titleB}</span>
              </h1>

              <p className="text-ink-300 text-base sm:text-lg max-w-xl mt-6 leading-relaxed anim-fade-up" style={{ animationDelay: "240ms" }}>
                {settings.hero?.sub || "Exquisite luxury gift hampers for birthdays, anniversaries, corporate events, marriages, and return gifts — paired with gourmet cookies and crispy traditional namkeens."}
              </p>

              {/* Instant Action CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mt-8 anim-fade-up" style={{ animationDelay: "320ms" }}>
                <Link to={settings.hero?.ctaLink || "/shop"} className="clip-btn group bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase px-8 py-4 transition-all hover:shadow-glow flex items-center gap-3 font-bold">
                  {settings.hero?.ctaText || t("shopNow")} <Ic.arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link to="/shop?tag=BEST" className="clip-btn border border-ink-600 hover:border-blaze-500 hover:text-ink-50 text-ink-200 font-mono text-sm tracking-[0.2em] uppercase px-7 py-4 transition-colors">
                  🔥 Best Sellers
                </Link>
              </div>

              {/* Promo Coupon Quick Copy Strip */}
              <div className="mt-7 flex items-center gap-3 p-3 bg-ink-900/90 border border-ink-700/60 clip-tile max-w-md anim-fade-up" style={{ animationDelay: "360ms" }}>
                <div className="w-8 h-8 rounded bg-blaze-500/20 text-blaze-400 flex items-center justify-center font-bold text-sm shrink-0">
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">First Order Deal</p>
                  <p className="font-mono text-xs text-ink-100 font-bold">15% OFF WITH CODE <span className="text-blaze-400 font-black">URBAN15</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => copyCoupon("URBAN15")}
                  className="px-3 py-1.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] uppercase font-bold rounded transition-colors shrink-0"
                >
                  Copy Code
                </button>
              </div>

              {/* Stats Counters */}
              <div className="grid grid-cols-3 max-w-md gap-4 mt-8 anim-fade-up" style={{ animationDelay: "400ms" }}>
                {stats.map(([n, l]) => (
                  <div key={l} className="border-l-2 border-blaze-500/60 pl-3">
                    <p className="font-mono tabnum text-xl sm:text-2xl font-bold text-ink-50">{n}</p>
                    <p className="font-mono text-[9px] tracking-[0.15em] text-ink-400 uppercase mt-1">{l}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative anim-fade-in" style={{ animationDelay: "300ms" }}>
              <HeroRing />
              {/* Mobile Hero Card */}
              <div className="md:hidden anim-float">
                <div className="relative bg-ink-850 clip-tile border border-ink-700 overflow-hidden max-w-sm mx-auto shadow-2xl">
                  <PImg src={heroProduct?.img} crop={heroProduct?.crop} alt={heroProduct?.name ?? "Signature cake"} className="w-full aspect-square object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink-950 via-ink-950/80 to-transparent flex justify-between items-end">
                    <div>
                      <span className="font-mono text-[9px] text-blaze-400 uppercase tracking-widest font-bold">⭐ Signature Drop</span>
                      <p className="font-display font-bold text-lg text-ink-50">{heroProduct?.name}</p>
                      <p className="font-mono text-sm text-volt-400 font-bold mt-0.5">{fmt(heroProduct?.price ?? 0)}</p>
                    </div>
                    <Link to={`/product/${heroProduct?.id}`} className="clip-tag bg-blaze-500 hover:bg-blaze-400 p-3 text-ink-50 shadow-lg">
                      <Ic.arrow className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ REAL-TIME LIVE TICKER ============ */}
      {homeSections.ticker !== false && (
        <div className="relative border-y border-ink-800 bg-ink-900/90 py-3.5 overflow-hidden">
          <div className="marquee-track flex whitespace-nowrap w-max">
            {[0, 1].map((k) => (
              <div key={k} className="flex items-center">
                {[
                  "⚡ 30-45 Min Express Delivery across Delhi NCR",
                  "🌱 100% Pure Vegetarian & Eggless Certified",
                  "🌙 Midnight Birthday Delivery Available",
                  "🎂 Freshly Baked Daily in Faridabad & Noida Hubs",
                  "🍫 Pure Single-Origin Belgian Couverture Chocolate",
                  "💌 Free Handwritten Message Card & Candles Included",
                ].map((s) => (
                  <span key={s} className="flex items-center font-mono text-[11px] tracking-[0.2em] uppercase text-ink-300">
                    <Ic.cake className="w-3.5 h-3.5 text-blaze-500 mx-6" />{s}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ VISUAL CATEGORIES (PICK YOUR CRAVING) ============ */}
      {homeSections.categories !== false && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <SectionHead
            kicker="01 — Quick Navigation"
            title="Pick your craving"
            link={
              <Link to="/shop" className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase inline-flex items-center gap-2 transition-colors">
                {t("viewAll")} <Ic.arrow className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] md:auto-rows-[200px] gap-4">
            {homeCategories.map((c, i) => (
              <Reveal key={c.name} delay={i * 70} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group relative block h-full clip-tile overflow-hidden border border-ink-700/60 bg-ink-850 shadow-md hover:border-blaze-500 transition-colors">
                  <PImg src={c.img} crop={c.crop} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                  <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end">
                    <p className="font-display font-bold text-base sm:text-2xl uppercase text-ink-50 leading-tight drop-shadow">{c.name}</p>
                    <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.15em] text-ink-300 uppercase mt-1 truncate">{c.subs?.join(" · ") || "Fresh Bakehouse Specials"}</p>
                    <span className="absolute top-3 right-3 w-8 h-8 grid place-items-center border border-ink-100/30 text-ink-100 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-ink-950/60 backdrop-blur rounded">
                      <Ic.arrow className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ============ SIGNATURE SELECTION WITH QUICK TABS ============ */}
      {homeSections.featured !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 sm:pb-6 border-b border-ink-800">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
                02 — Signature Selection
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-4xl uppercase mt-1 text-ink-50">
                Fresh From The Oven
              </h2>
            </div>

            {/* Quick Filter Pills & Layout Switcher */}
            <div className="flex items-center justify-between md:justify-end gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                {quickFilterPills.map((pill) => (
                  <button
                    key={pill.val}
                    type="button"
                    onClick={() => setActiveQuickFilter(pill.val)}
                    className={`px-3 py-1 font-mono text-[11px] sm:text-xs uppercase tracking-wider rounded-full transition-all whitespace-nowrap ${
                      activeQuickFilter === pill.val
                        ? "bg-blaze-500 text-ink-50 font-bold shadow-md shadow-blaze-500/25"
                        : "bg-ink-900 border border-ink-700/80 text-ink-400 hover:text-ink-100 hover:bg-ink-800"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* View Layout Switcher (2-Col Grid vs Swipe Reel) */}
              <div className="flex items-center bg-ink-900 border border-ink-700/80 rounded p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFeaturedView("grid2")}
                  title="2-Column Mobile Grid"
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${featuredView === "grid2" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400 hover:text-ink-100"}`}
                >
                  ⊞ Grid
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedView("reel")}
                  title="Smooth Horizontal Swipe Reel"
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${featuredView === "reel" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400 hover:text-ink-100"}`}
                >
                  ⇆ Reel
                </button>
              </div>
            </div>
          </div>

          {filteredFeatured.length === 0 ? (
            <div className="py-12 text-center bg-ink-900/50 border border-ink-800 rounded-lg mt-6">
              <p className="text-ink-400 font-mono text-sm">No cakes match this filter right now.</p>
              <button
                onClick={() => setActiveQuickFilter("ALL")}
                className="mt-3 text-xs font-mono text-blaze-400 underline uppercase"
              >
                Show All Signature Bakes
              </button>
            </div>
          ) : featuredView === "reel" ? (
            /* Smooth Horizontal Carousel (Swiping Left/Right with arrows) */
            <div className="relative mt-6 group">
              <div className="flex items-center justify-between text-xs font-mono text-ink-400 mb-3 px-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-blaze-400">👈👉</span> Swipe left / right or use arrows
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollCarousel("left")}
                    className="w-7 h-7 rounded border border-ink-700 bg-ink-900 text-ink-200 hover:border-blaze-500 hover:text-blaze-400 grid place-items-center active:scale-95 transition-all"
                    aria-label="Scroll left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => scrollCarousel("right")}
                    className="w-7 h-7 rounded border border-ink-700 bg-ink-900 text-ink-200 hover:border-blaze-500 hover:text-blaze-400 grid place-items-center active:scale-95 transition-all"
                    aria-label="Scroll right"
                  >
                    →
                  </button>
                </div>
              </div>

              <div
                ref={carouselRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 smooth-scroll no-scrollbar snap-x-mandatory"
              >
                {filteredFeatured.map((p, i) => (
                  <div key={p.id} className="w-[185px] sm:w-[240px] md:w-[270px] shrink-0 snap-item">
                    <ProductCard p={p} index={i} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 2-Column Responsive Grid on Mobile */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 mt-6">
              {filteredFeatured.map((p, i) => (
                <div key={p.id} className="h-full">
                  <ProductCard p={p} index={i} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============ COOKIES & NAMKEENS SECTION ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="flex items-end justify-between pb-4 border-b border-ink-800">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">Daily Favorites</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase mt-1 text-ink-50">Gourmet Cookies & Crispy Namkeens</h2>
          </div>
          <Link to="/shop?cat=Cookies" className="font-mono text-xs text-blaze-400 hover:underline uppercase tracking-wider flex items-center gap-1">
            View All Cookies & Namkeens →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {products.filter(p => p.category === "Cookies" || p.category === "Namkeens").slice(0, 4).map((p, i) => (
            <div key={p.id} className="h-full">
              <ProductCard p={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ GIFT HAMPERS SECTION ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="flex items-end justify-between pb-4 border-b border-ink-800">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-volt-400 uppercase font-bold">Celebration Specials</p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase mt-1 text-ink-50">Birthday, Anniversary & Corporate Hampers</h2>
          </div>
          <Link to="/shop?cat=Gift Hampers" className="font-mono text-xs text-volt-400 hover:underline uppercase tracking-wider flex items-center gap-1">
            Explore Luxury Hampers →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {products.filter(p => p.category === "Gift Hampers").slice(0, 4).map((p, i) => (
            <div key={p.id} className="h-full">
              <ProductCard p={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ EXPLORE MORE SECTION ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">Discover More</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl uppercase mt-1 text-ink-50">Explore More CakeUrban Experiences</h2>
          <p className="text-sm text-ink-300 mt-2">Dive deeper into our artisanal collections, bespoke builder, gift hampers, and Delhi NCR stories.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          <Link to="/builder" className="group relative bg-ink-900 border border-ink-700 p-6 clip-tile hover:border-blaze-500 transition-all flex flex-col justify-between overflow-hidden shadow-lg">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blaze-500/10 rounded-full blur-xl group-hover:bg-blaze-500/20 transition-all" />
            <div>
              <span className="w-10 h-10 rounded bg-blaze-500/20 text-blaze-400 flex items-center justify-center font-bold text-lg mb-4">🎂</span>
              <h3 className="font-display font-bold text-xl text-ink-50 uppercase group-hover:text-blaze-400 transition-colors">Custom Cake Builder</h3>
              <p className="text-xs text-ink-300 mt-2 leading-relaxed">Design your dream tier cake, choose sponge layers, fillings, drip color, and write custom messages.</p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-mono text-xs text-blaze-400 font-bold uppercase">
              <span>Start Designing</span> <span>→</span>
            </div>
          </Link>

          <Link to="/shop?cat=Gift Boxes" className="group relative bg-ink-900 border border-ink-700 p-6 clip-tile hover:border-blaze-500 transition-all flex flex-col justify-between overflow-hidden shadow-lg">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-volt-500/10 rounded-full blur-xl group-hover:bg-volt-500/20 transition-all" />
            <div>
              <span className="w-10 h-10 rounded bg-volt-500/20 text-volt-400 flex items-center justify-center font-bold text-lg mb-4">🎁</span>
              <h3 className="font-display font-bold text-xl text-ink-50 uppercase group-hover:text-volt-400 transition-colors">Gift Boxes & Hampers</h3>
              <p className="text-xs text-ink-300 mt-2 leading-relaxed">Luxurious matte-black tins filled with assorted macarons, choc-chip cookies, and artisan brownies.</p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-mono text-xs text-volt-400 font-bold uppercase">
              <span>Browse Hampers</span> <span>→</span>
            </div>
          </Link>

          <Link to="/blog" className="group relative bg-ink-900 border border-ink-700 p-6 clip-tile hover:border-blaze-500 transition-all flex flex-col justify-between overflow-hidden shadow-lg">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
            <div>
              <span className="w-10 h-10 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">📖</span>
              <h3 className="font-display font-bold text-xl text-ink-50 uppercase group-hover:text-emerald-400 transition-colors">Bakehouse Journal</h3>
              <p className="text-xs text-ink-300 mt-2 leading-relaxed">Read stories about 72-hour cold fermentation, Belgian couverture sourcing, and midnight NCR dispatch.</p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-mono text-xs text-emerald-400 font-bold uppercase">
              <span>Read Journal</span> <span>→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ============ NCR EXPRESS HUBS (INTERACTIVE CITY SELECTOR) ============ */}
      {homeSections.ncrHubs !== false && hubs.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-16">
          <div className="border border-ink-700/60 bg-ink-900/80 backdrop-blur-md p-6 sm:p-8 clip-tile shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ink-800 pb-5">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Delhi NCR Hyperlocal Dispatch Network
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase mt-2">
                  Select Your City For 30-45 Min Delivery
                </h2>
                <p className="text-xs sm:text-sm text-ink-300 mt-1 max-w-xl">
                  Temperature-controlled insulated boxes ensure your cakes arrive fresh and chilled.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/917318531953?text=Hi%20CakeUrban,%20I%20need%20an%20urgent%20cake%20delivery%20in%20Delhi%20NCR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clip-tag px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-ink-50 font-mono text-xs tracking-wider uppercase inline-flex items-center gap-2 transition-colors font-bold shadow-lg shadow-emerald-900/30"
                >
                  <Ic.whatsapp className="w-4 h-4" /> <span>WhatsApp Express Order</span>
                </a>
              </div>
            </div>

            {/* City Hub Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-6">
              {hubs.map((h) => {
                const isSelected = selectedHub === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHub(h.id)}
                    className={`cursor-pointer p-4 border clip-tile transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blaze-500 bg-ink-850 shadow-glow"
                        : "border-ink-800 bg-ink-950/60 hover:border-ink-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] uppercase tracking-widest text-volt-400 font-bold">⚡ {h.time}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="font-display font-bold text-base mt-2 text-ink-50">{h.city}</p>
                      <p className="font-mono text-[10px] text-ink-400 mt-0.5">{h.zone}</p>
                      <p className="text-xs text-ink-300 mt-2 line-clamp-2">{h.topAreas}</p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-ink-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-ink-400">Min: ₹{h.minOrder}</span>
                      <Link to={`/shop?hub=${h.id}`} className="text-blaze-400 hover:underline font-bold">
                        Order Now →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ BAKEHOUSE CRAFT & STANDARDS (WITH SHOW/HIDE STORY ACCORDION) ============ */}
      {homeSections.standards !== false && (
        <section className="relative border-y border-ink-800 bg-ink-900/90 noise py-14">
          <div className="absolute inset-0 grid-lines opacity-30" />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-ink-800">
              <div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
                  03 — The Bakehouse Standard
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase leading-tight mt-1">
                  Purity You Can Taste, <span className="italic text-blaze-400">Numbers We Refuse to Fudge</span>
                </h2>
              </div>

              {/* Show / Hide Long Story Button */}
              <button
                type="button"
                onClick={() => setShowStory(!showStory)}
                className="px-4 py-2 border border-ink-700 hover:border-blaze-500 text-ink-300 hover:text-ink-50 font-mono text-xs uppercase tracking-wider rounded transition-colors self-start md:self-auto flex items-center gap-2"
              >
                <span>{showStory ? "Hide Story Details" : "Read Our Craft Story"}</span>
                <span className="font-bold">{showStory ? "▲" : "▼"}</span>
              </button>
            </div>

            {/* 4 Clean Quick Metric Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {[
                { num: "100%", title: "Pure Veg & Eggless", desc: "Dedicated vegetarian kitchen facility with zero gelatin & zero animal products." },
                { num: "72%", title: "Belgian Chocolate", desc: "Single-origin couverture chocolate fudge with zero artificial compound chocolate." },
                { num: "0", title: "Preservatives", desc: "Whipped to order at 6 AM using cultured butter, fresh cream & real berries." },
                { num: "30M", title: "Express Dispatch", desc: "Cold-pack insulated courier bags ensure pristine condition upon arrival." },
              ].map((item, idx) => (
                <div key={idx} className="border border-ink-700/60 bg-ink-850 p-5 clip-tile hover:border-blaze-500/50 transition-colors">
                  <p className="font-display font-black text-3xl text-volt-400">{item.num}</p>
                  <p className="font-mono text-xs uppercase font-bold text-ink-100 mt-1">{item.title}</p>
                  <p className="text-xs text-ink-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Expandable Deep Story (Hidden by default so users don't get bored) */}
            {showStory && (
              <div className="mt-8 p-6 bg-ink-950 border border-ink-700/80 rounded-lg anim-fade-in space-y-4">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase text-ink-100">
                      Why We Cold-Ferment For 72 Hours
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-300 mt-2 leading-relaxed">
                      Every sponge is rested, and every fruit coulis is slow-set with pectin from real apples. Our cookie dough and chocolate fudge undergo a 72-hour cold maturation to develop deep caramel and malt notes that commercial bakeries cannot replicate.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link to="/blog" className="text-xs font-mono text-blaze-400 hover:underline uppercase font-bold flex items-center gap-1.5">
                        Explore Bakehouse Journal <Ic.arrow className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                  <div className="h-48 rounded overflow-hidden border border-ink-700">
                    <ImgX src={LIFESTYLE_IMG} alt="Bakehouse craftsmanship" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============ SOCIAL PROOF & CUSTOMER REVIEWS ============ */}
      {homeSections.reviews !== false && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
          <SectionHead kicker="04 — Sweet Words" title="2,480+ verified 5-star reviews" />
          <div className="grid md:grid-cols-3 gap-5 items-start mt-6">
            <div className="border border-ink-700/60 bg-ink-850 p-6 clip-tile text-center flex flex-col justify-center">
              <p className="font-display text-6xl font-black text-ink-50">4.9</p>
              <div className="flex justify-center my-2"><Stars value={5} className="w-5 h-5 text-gold-400" /></div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-ink-400 uppercase font-bold">Google & Zomato Verified Rating</p>
              <p className="text-xs text-ink-400 mt-3">Over 48,000+ cakes delivered across Delhi NCR with a 99.4% on-time celebration rate.</p>
            </div>

            {reviews.map((r, i) => (
              <figure key={r.name} className="border border-ink-700/60 bg-ink-850 p-6 clip-tile hover:border-blaze-500/50 transition-colors flex flex-col justify-between">
                <div>
                  <Stars value={r.rating} className="text-gold-400" />
                  <blockquote className="font-display text-sm sm:text-base font-semibold leading-snug mt-3 text-ink-100">
                    "{r.text}"
                  </blockquote>
                </div>
                <figcaption className="mt-5 pt-3 border-t border-ink-800 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full grid place-items-center bg-blaze-500/20 border border-blaze-500/40 text-blaze-400 font-mono text-xs font-bold shrink-0">
                    {r.name[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink-100 truncate">{r.name}</p>
                    <p className="font-mono text-[9px] text-ink-400 truncate">{r.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ============ FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) ============ */}
      {homeSections.faqs !== false && (
        <section className="max-w-4xl mx-auto px-6 lg:px-10 pb-16">
          <div className="text-center mb-8">
            <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
              05 — Clarifications & Help
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl uppercase mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-ink-700/70 bg-ink-850/90 rounded-lg overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-ink-800/50 transition-colors"
                  >
                    <span className="font-display font-bold text-sm sm:text-base text-ink-100">
                      {faq.q}
                    </span>
                    <span className={`font-mono text-sm text-blaze-400 font-bold transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-ink-300 border-t border-ink-800 anim-fade-in leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ============ JOURNAL TEASER (COMPACT AT BOTTOM) ============ */}
      {homeSections.journal !== false && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-12">
          <SectionHead
            kicker="06 — Bake Journal"
            title="Behind the flour"
            link={
              <Link to="/blog" className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase inline-flex items-center gap-2 transition-colors">
                {t("viewAll")} <Ic.arrow className="w-3.5 h-3.5" />
              </Link>
            }
          />
          <div className="grid md:grid-cols-2 gap-5 mt-4">
            {BLOG_POSTS.slice(0, 2).map((b, i) => (
              <Reveal key={b.slug} delay={i * 80}>
                <Link to={`/blog/${b.slug}`} className="group grid grid-cols-[110px_1fr] sm:grid-cols-[160px_1fr] border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden hover:border-blaze-500/60 transition-colors">
                  <div className="overflow-hidden">
                    <PImg src={b.img} crop={b.crop} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col justify-center">
                    <p className="font-mono text-[9px] tracking-[0.2em] text-blaze-500">{b.tag} · {b.read}</p>
                    <h3 className="font-display font-bold text-sm sm:text-base leading-snug mt-1 group-hover:text-blaze-400 transition-colors">{b.title}</h3>
                    <p className="text-xs text-ink-400 mt-1 line-clamp-2">{b.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
