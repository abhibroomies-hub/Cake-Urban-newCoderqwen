import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { CATEGORIES, LIFESTYLE_IMG, BLOG_POSTS } from "../data/catalog";
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
  const items = products.filter((p) => p.featured).slice(0, 6);
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
      <div className="absolute -bottom-2 font-mono text-[9px] tracking-[0.3em] text-ink-500 uppercase">Hover to pause · Click to open</div>
    </div>
  );
}

export default function Home() {
  const { products, settings, fmt } = useStore();
  const { t } = useStore();
  const titleA = useScramble(settings.hero.titleA);
  const titleB = useScramble(settings.hero.titleB);
  const plx = useParallax();
  const [mIdx, setMIdx] = useState(0);
  const featured = products.filter((p) => p.featured || p.tag).slice(0, 4);
  const hero = products.find((p) => p.id === "raspberry-noir") ?? products[0];
  const reviews = [
    { name: "Amara Osei", role: "Ordered for mom's 60th", text: "The drip held perfectly through forty minutes of photographs. Best cake in the city, no contest.", rating: 5, product: "Raspberry Noir" },
    { name: "Jonas Keller", role: "Cookie skeptic, converted", text: "Crisp edge, molten centre, salt on top. I've reordered the choc-chip stack six times now.", rating: 5, product: "Molten Choc-Chip Stack" },
    { name: "Carla Reyes", role: "Birthday repeat offender", text: "Every guest asked where the Pistachio Rose was from. Rose is light, pistachio is loud.", rating: 5, product: "Pistachio Rose Royale" },
  ];

  useEffect(() => {
    const id = setInterval(() => setMIdx((i) => i + 1), 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="overflow-x-clip">
      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] flex items-center noise overflow-hidden">
        <div className="absolute inset-0 grid-lines" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_70%_40%,rgba(226,62,95,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_40%_at_20%_80%,rgba(214,151,64,0.13),transparent_60%)]" />
        <Particles />
        <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-ink-800/80 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center w-full">
          <div>
            <p className="inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.28em] text-blaze-400 clip-tag border border-blaze-500/40 bg-blaze-500/10 px-4 py-2 anim-fade-up">
              <span className="w-1.5 h-1.5 bg-blaze-500 pulse-dot rounded-full" /> {settings.hero.kicker}
            </p>
            <h1 className="font-display font-black uppercase leading-[0.95] mt-7 text-[13vw] sm:text-7xl xl:text-8xl">
              <span className="block anim-fade-up" style={{ animationDelay: "80ms" }}>{titleA}</span>
              <span className="block text-outline-blaze italic" style={{ animationDelay: "160ms" }}>{titleB}</span>
            </h1>
            <p className="text-ink-300 text-lg max-w-xl mt-7 leading-relaxed anim-fade-up" style={{ animationDelay: "240ms" }}>{settings.hero.sub}</p>
            <div className="flex flex-wrap items-center gap-4 mt-9 anim-fade-up" style={{ animationDelay: "320ms" }}>
              <Link to="/shop" className="clip-btn group bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase px-8 py-4 transition-all hover:shadow-glow flex items-center gap-3">
                {t("shopNow")} <Ic.arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/shop?cat=Cakes" className="clip-btn border border-ink-600 hover:border-ink-300 hover:text-ink-50 text-ink-200 font-mono text-sm tracking-[0.2em] uppercase px-8 py-4 transition-colors">
                {t("explore")}
              </Link>
            </div>
            <div className="grid grid-cols-3 max-w-md gap-6 mt-12 anim-fade-up" style={{ animationDelay: "400ms" }}>
              {[["4.9★", "9,800+ sweet reviews"], ["6 AM", "ovens on, daily"], ["90 min", "same-day delivery"]].map(([n, l]) => (
                <div key={l} className="border-l-2 border-blaze-500/60 pl-3">
                  <p className="font-mono tabnum text-2xl font-bold text-ink-50">{n}</p>
                  <p className="font-mono text-[10px] tracking-[0.15em] text-ink-400 uppercase mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative anim-fade-in" style={{ animationDelay: "300ms" }}>
            <HeroRing />
            {/* mobile hero card */}
            <div className="md:hidden anim-float">
              <div className="relative bg-ink-850 clip-tile border border-ink-700 overflow-hidden max-w-sm mx-auto">
                <PImg src={hero?.img} crop={hero?.crop} alt={hero?.name ?? "Signature cake"} className="w-full aspect-square object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink-950 to-transparent flex justify-between items-end">
                  <div><p className="font-display font-bold">{hero?.name}</p><p className="font-mono text-sm text-blaze-400 mt-1">{fmt(hero?.price ?? 0)}</p></div>
                  <Link to={`/product/${hero?.id}`} className="clip-tag bg-blaze-500 p-3 text-ink-50"><Ic.arrow className="w-4 h-4" /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-ink-500">
          <span className="font-mono text-[9px] tracking-[0.35em] uppercase">Scroll</span>
          <span className="w-px h-8 bg-gradient-to-b from-blaze-500 to-transparent" />
        </div>
      </section>

      {/* ============ TICKER ============ */}
      <div className="relative border-y border-ink-800 bg-ink-900 py-3.5 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex items-center">
              {["Same-day delivery over $49", "Baked fresh every morning", "Eggless & vegan options", "No preservatives, ever", "Handwritten cake messages", "Members taste new bakes first"].map((s) => (
                <span key={s} className="flex items-center font-mono text-[11px] tracking-[0.25em] uppercase text-ink-300">
                  <Ic.cake className="w-3.5 h-3.5 text-blaze-500 mx-6" />{s}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ============ PARALLAX MANIFESTO ============ */}
      <section ref={plx} className="relative h-[80vh] min-h-[520px] overflow-hidden noise">
        <div data-plx className="absolute inset-0 will-change-transform">
          <ImgX src={LIFESTYLE_IMG} alt="Raspberry Noir cake in dramatic light" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-ink-950/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/70" />
        </div>
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center">
          <div data-plx-text className="will-change-transform">
            <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-400 mb-4">BUTTER. SUGAR. PATIENCE.</p>
            <h2 className="font-display font-black uppercase leading-[0.95] text-5xl sm:text-7xl xl:text-8xl">
              <Reveal><span className="block">Baked for</span></Reveal>
              <Reveal delay={120}><span className="block text-outline italic">the moment</span></Reveal>
            </h2>
            <Reveal delay={220}>
              <p className="text-ink-200 max-w-lg mt-6 text-lg leading-relaxed">Every sponge rested. Every coulis slow-set. Every cookie dough cold-fermented for 72 hours. We don't bake in advance — we bake to order.</p>
            </Reveal>
            <Reveal delay={320}>
              <Link to="/blog" className="clip-tag inline-flex items-center gap-3 mt-8 border border-ink-100/40 hover:border-blaze-500 hover:text-blaze-400 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase transition-colors text-ink-100">
                Read the bake notes <Ic.arrow className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ CATEGORY MOSAIC ============ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <SectionHead kicker="01 — Categories" title="Pick your craving" link={<Link to="/shop" className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase inline-flex items-center gap-2 transition-colors">{t("viewAll")} <Ic.arrow className="w-3.5 h-3.5" /></Link>} />
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] md:auto-rows-[210px] gap-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.name} delay={i * 80} className={i === 0 ? "col-span-2 row-span-2" : i === 3 ? "md:col-span-1" : ""}>
              <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="group relative block h-full clip-tile overflow-hidden border border-ink-700/60 bg-ink-850">
                <PImg src={c.img} crop={c.crop} alt={c.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/25 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <p className="font-display font-bold text-lg sm:text-2xl uppercase text-ink-50">{c.name}</p>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-ink-300 uppercase mt-1">{c.subs.join(" · ")}</p>
                  <span className="absolute top-4 right-4 w-9 h-9 grid place-items-center border border-ink-100/30 text-ink-100 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-ink-950/40 backdrop-blur">
                    <Ic.arrow className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ FEATURED BAKES ============ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-24">
        <SectionHead kicker="02 — This week" title={t("featured")} link={<Link to="/shop" className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase inline-flex items-center gap-2 transition-colors">{t("viewAll")} <Ic.arrow className="w-3.5 h-3.5" /></Link>} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((p, i) => <Reveal key={p.id} delay={i * 90}><ProductCard p={p} index={i} /></Reveal>)}
        </div>
      </section>

      {/* ============ BAKEHOUSE STANDARD — sticky two column ============ */}
      <section className="relative border-y border-ink-800 bg-ink-900 noise">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-14">
          <div className="lg:sticky lg:top-32 self-start">
            <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 mb-3">03 — The bakehouse standard</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold uppercase leading-[1.02]">Numbers we<br /><span className="text-outline-blaze italic">refuse to fudge</span></h2>
            <p className="text-ink-300 mt-6 max-w-md leading-relaxed">Four numbers decide whether a recipe earns the CakeUrban label. Miss one, and it goes back to the bench. No exceptions, no "good enough".</p>
            <Link to="/shop" className="clip-btn inline-flex items-center gap-3 mt-8 bg-ink-100 text-ink-950 hover:bg-blaze-500 hover:text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-7 py-3.5 transition-colors">
              Shop the bakehouse <Ic.arrow className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-5">
            {[
              ["01", "72 h", "Cold-fermented dough", "Our choc-chip dough rests three days before a single cookie is scooped. Hydration and toffee notes can't be rushed."],
              ["02", "72%", "Belgian couverture", "The Noir line runs on single-origin dark chocolate — never compound, never 'chocolate flavour'."],
              ["03", "0", "Preservatives", "Nothing you can't pronounce in our bakes. Shelf life comes from technique, not chemistry."],
              ["04", "90 min", "City delivery", "Order by 4 PM and a chilled rider is at your door before the ganache fully sets."],
            ].map(([n, big, label, body], i) => (
              <Reveal key={n} delay={i * 60}>
                <div className="group border border-ink-700/60 bg-ink-850/80 p-7 clip-tile hover:border-blaze-500/60 transition-colors">
                  <div className="flex items-baseline gap-5">
                    <span className="font-mono text-sm text-ink-500">{n}</span>
                    <div>
                      <p className="font-display text-4xl sm:text-5xl font-black text-ink-50 group-hover:text-blaze-400 transition-colors tabnum">{big}</p>
                      <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-blaze-500 mt-2">{label}</p>
                      <p className="text-sm text-ink-300 mt-3 leading-relaxed max-w-md">{body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PROOF ============ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <SectionHead kicker="04 — Sweet words" title="9,800 verified reviews" />
        <div className="grid md:grid-cols-3 gap-5 items-start">
          <Reveal className="md:mt-8">
            <div className="border border-ink-700/60 bg-ink-850 p-8 clip-tile text-center">
              <p className="font-display text-7xl font-black tabnum">4.9</p>
              <div className="flex justify-center my-3"><Stars value={5} className="w-5 h-5" /></div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-ink-400 uppercase">Average across all bakes</p>
            </div>
          </Reveal>
          {reviews.map((r, i) => (
            <Reveal key={r.name} delay={i * 100} className={i === 1 ? "md:mt-16" : ""}>
              <figure className="border border-ink-700/60 bg-ink-850 p-8 clip-tile hover:border-blaze-500/50 transition-colors">
                <Stars value={r.rating} />
                <blockquote className="font-display text-lg font-semibold leading-snug mt-4">"{r.text}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="w-10 h-10 grid place-items-center bg-blaze-500/15 border border-blaze-500/50 text-blaze-400 font-mono text-sm">{r.name[0]}</span>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="font-mono text-[10px] text-ink-400 tracking-wide">{r.role} · {r.product}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ JOURNAL TEASER ============ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-8">
        <SectionHead kicker="05 — Journal" title="Bake notes" link={<Link to="/blog" className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase inline-flex items-center gap-2 transition-colors">{t("viewAll")} <Ic.arrow className="w-3.5 h-3.5" /></Link>} />
        <div className="grid md:grid-cols-2 gap-5">
          {BLOG_POSTS.slice(0, 2).map((b, i) => (
            <Reveal key={b.slug} delay={i * 100}>
              <Link to={`/blog/${b.slug}`} className="group grid grid-cols-[130px_1fr] sm:grid-cols-[200px_1fr] border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden hover:border-blaze-500/60 transition-colors">
                <div className="overflow-hidden">
                  <PImg src={b.img} crop={b.crop} alt={b.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500">{b.tag} · {b.read}</p>
                  <h3 className="font-display font-bold text-lg leading-snug mt-2 group-hover:text-blaze-400 transition-colors">{b.title}</h3>
                  <p className="text-sm text-ink-400 mt-2 line-clamp-2">{b.excerpt}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        {/* rotating word strip */}
        <div className="mt-24 border-t border-ink-800 pt-10 flex flex-wrap items-center justify-between gap-6">
          <p className="font-display font-black uppercase text-3xl sm:text-5xl leading-none italic">
            {["Butter first.", "Rest the dough.", "Drip slow.", "Serve joy."][mIdx % 4]}
          </p>
          <Link to="/shop" className="group flex items-center gap-3 font-mono text-xs tracking-[0.25em] uppercase text-ink-300 hover:text-blaze-400 transition-colors">
            Start here <span className="w-10 h-10 grid place-items-center border border-ink-600 group-hover:border-blaze-500 group-hover:bg-blaze-500 group-hover:text-ink-50 transition-colors"><Ic.arrow className="w-4 h-4" /></span>
          </Link>
        </div>
      </section>
    </div>
  );
}
