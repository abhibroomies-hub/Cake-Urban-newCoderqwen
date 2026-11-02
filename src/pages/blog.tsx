import { Link, useParams } from "react-router-dom";
import { BLOG_POSTS } from "../data/catalog";
import { useStore } from "../lib/store";
import { Ic, PImg, Reveal } from "../components/ui";

export function BlogList() {
  const { blogHidden } = useStore();
  const posts = BLOG_POSTS.filter((p) => !blogHidden.includes(p.slug));
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-12">
      <div className="relative overflow-hidden clip-tile border border-ink-700/60 bg-ink-850 p-5 sm:p-10 mb-6 sm:mb-10 noise">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="relative max-w-2xl">
          <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
            THE CAKEURBAN JOURNAL · DELHI NCR
          </p>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase mt-2 leading-tight">
            Artisan Baking & <span className="text-blaze-500">Gifting Guides</span>
          </h1>
          <p className="text-ink-300 text-xs sm:text-sm mt-2 leading-relaxed">
            72-hour dough craft, eggless patisserie secrets & local celebration guides across Faridabad, Gurgaon, Noida & Delhi.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 60}>
            <Link
              to={`/blog/${p.slug}`}
              className="group flex flex-col h-full border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden hover:border-blaze-500/60 transition-colors"
            >
              <div className="relative h-44 sm:h-52 overflow-hidden">
                <PImg
                  src={p.img}
                  crop={p.crop}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 clip-tag bg-blaze-500 text-ink-50 font-mono text-[9px] tracking-[0.18em] px-2 py-0.5">
                  {p.tag}
                </span>
              </div>
              <div className="p-4 sm:p-6 flex flex-col flex-1 justify-between">
                <div>
                  <p className="font-mono text-[9px] tracking-[0.2em] text-ink-400 uppercase">
                    {p.date} · {p.read} read
                  </p>
                  <h2 className="font-display text-base sm:text-xl font-bold leading-snug mt-1.5 group-hover:text-blaze-400 transition-colors line-clamp-2">
                    {p.title}
                  </h2>
                  <p className="text-ink-300 text-xs sm:text-sm mt-2 leading-relaxed line-clamp-2">
                    {p.excerpt}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 mt-4 font-mono text-[10px] tracking-[0.18em] uppercase text-blaze-400">
                  Read Guide <Ic.arrow className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-black uppercase">Entry not found</h1>
        <Link
          to="/blog"
          className="clip-tag mt-5 inline-block border border-blaze-500 text-blaze-400 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase"
        >
          Back to journal
        </Link>
      </div>
    );
  }
  const others = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 4);
  return (
    <article className="max-w-3xl mx-auto px-3.5 sm:px-6 py-6 sm:py-12">
      <Link
        to="/blog"
        className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-ink-400 hover:text-blaze-400 transition-colors"
      >
        ← All Guides
      </Link>
      <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 mt-5">
        {post.tag} · {post.read} READ
      </p>
      <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase leading-tight mt-2">
        {post.title}
      </h1>
      <p className="font-mono text-[11px] text-ink-400 mt-2">
        {post.date} · CakeUrban Bakehouse Delhi NCR
      </p>
      <div className="relative mt-5 clip-tile overflow-hidden border border-ink-700/60 h-56 sm:h-80">
        <PImg src={post.img} crop={post.crop} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="mt-6 sm:mt-8 space-y-4">
        {post.body.map((par, i) => (
          <p key={i} className="leading-relaxed text-ink-200 text-sm sm:text-base">
            {par}
          </p>
        ))}
      </div>

      {/* Direct CTA inside Blog Post for Conversions */}
      <div className="mt-8 p-4 sm:p-6 bg-ink-850 border border-blaze-500/40 clip-tile flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] text-gold-400 uppercase tracking-wider">⚡ 30–45 Min Express NCR</span>
          <h3 className="font-display text-base sm:text-lg font-bold uppercase text-ink-50">
            Craving Fresh Cookies, Cakes or Gift Hampers?
          </h3>
        </div>
        <Link
          to="/shop"
          className="px-5 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase clip-btn font-bold text-center shrink-0"
        >
          Order Fresh Now →
        </Link>
      </div>

      <div className="mt-10 border-t border-ink-800 pt-6">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ink-400 uppercase mb-4">More Guides</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {others.map((p) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className="group flex gap-3 border border-ink-700/60 bg-ink-850 clip-tile p-3 hover:border-blaze-500/60 transition-colors"
            >
              <span className="w-16 h-16 clip-tag overflow-hidden shrink-0">
                <PImg src={p.img} crop={p.crop} alt={p.title} className="w-full h-full object-cover" />
              </span>
              <span className="min-w-0">
                <span className="font-mono text-[9px] tracking-[0.15em] text-blaze-500">{p.tag}</span>
                <span className="block font-display font-semibold text-xs sm:text-sm leading-snug mt-0.5 group-hover:text-blaze-400 transition-colors line-clamp-2">
                  {p.title}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
