import { Link, useParams } from "react-router-dom";
import { BLOG_POSTS } from "../data/catalog";
import { useStore } from "../lib/store";
import { Ic, ImgX, Reveal } from "../components/ui";

export function BlogList() {
  const { blogHidden } = useStore();
  const posts = BLOG_POSTS.filter((p) => !blogHidden.includes(p.slug));
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="relative overflow-hidden clip-tile border border-ink-700/60 bg-ink-850 p-8 md:p-14 mb-12 noise">
        <div className="absolute inset-0 grid-lines opacity-50" />
        <div className="absolute -right-6 -bottom-10 font-display font-black text-[9rem] leading-none text-outline opacity-40 select-none hidden md:block">J/</div>
        <div className="relative max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500">THE VOLTA JOURNAL</p>
          <h1 className="font-display text-4xl md:text-6xl font-black uppercase mt-3 leading-[1]">Lab notes<br />from the fast lane</h1>
          <p className="text-ink-300 mt-5 leading-relaxed">Engineering deep-dives, material science and field reports — written by the people who build the gear.</p>
        </div>
      </div>
      <div className="space-y-6">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 80}>
            <Link to={`/blog/${p.slug}`} className={`group grid md:grid-cols-[1fr_1.6fr] border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden hover:border-blaze-500/60 transition-colors ${i === 0 ? "md:grid-cols-[1.4fr_1fr]" : ""}`}>
              <div className={`relative overflow-hidden ${i === 0 ? "md:order-1" : ""}`}>
                <ImgX src={p.img} alt={p.title} className="w-full h-56 md:h-full object-cover transition-transform duration-700 group-hover:scale-107" />
                <span className="absolute top-4 left-4 clip-tag bg-blaze-500 text-ink-50 font-mono text-[10px] tracking-[0.2em] px-2.5 py-1">{p.tag}</span>
              </div>
              <div className={`p-8 md:p-10 flex flex-col justify-center ${i === 0 ? "md:order-0" : ""}`}>
                <p className="font-mono text-[10px] tracking-[0.25em] text-ink-500 uppercase">{p.date} · {p.read} read</p>
                <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug mt-3 group-hover:text-blaze-400 transition-colors">{p.title}</h2>
                <p className="text-ink-300 mt-4 leading-relaxed">{p.excerpt}</p>
                <span className="inline-flex items-center gap-2 mt-6 font-mono text-[11px] tracking-[0.2em] uppercase text-blaze-500 w-max">Read entry <Ic.arrow className="w-4 h-4 transition-transform group-hover:translate-x-1.5" /></span>
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
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-black uppercase">Entry not found</h1>
        <Link to="/blog" className="clip-tag mt-6 inline-block border border-blaze-500 text-blaze-400 px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase">Back to journal</Link>
      </div>
    );
  }
  const others = BLOG_POSTS.filter((p) => p.slug !== slug);
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/blog" className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink-400 hover:text-blaze-400 transition-colors">← Journal</Link>
      <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 mt-8">{post.tag} · {post.read} READ</p>
      <h1 className="font-display text-3xl md:text-5xl font-black uppercase leading-[1.05] mt-3">{post.title}</h1>
      <p className="font-mono text-xs text-ink-500 mt-4">{post.date} · VOLTA Propulsion Lab</p>
      <div className="relative mt-8 clip-tile overflow-hidden border border-ink-700/60">
        <ImgX src={post.img} alt={post.title} className="w-full h-72 md:h-96 object-cover" />
      </div>
      <div className="mt-10 space-y-7">
        {post.body.map((par, i) => (
          <Reveal key={i} delay={i * 60}>
            <p className={`leading-[1.85] text-ink-200 ${i === 0 ? "text-xl first-letter:font-display first-letter:text-5xl first-letter:font-black first-letter:text-blaze-500 first-letter:float-left first-letter:mr-3 first-letter:leading-none" : "text-[17px]"}`}>{par}</p>
          </Reveal>
        ))}
      </div>
      <div className="mt-14 border-t border-ink-800 pt-10">
        <p className="font-mono text-[10px] tracking-[0.25em] text-ink-500 uppercase mb-5">More entries</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {others.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group flex gap-4 border border-ink-700/60 bg-ink-850 clip-tile p-4 hover:border-blaze-500/60 transition-colors">
              <span className="w-20 h-20 clip-tag overflow-hidden shrink-0"><ImgX src={p.img} alt={p.title} className="w-full h-full object-cover" /></span>
              <span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-blaze-500">{p.tag}</span>
                <span className="block font-display font-semibold text-sm leading-snug mt-1 group-hover:text-blaze-400 transition-colors">{p.title}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
