import React, { useEffect, useRef, useState } from "react";

/* ---------------- custom inline icon set ---------------- */
type IconProps = { className?: string; strokeWidth?: number };
const S = ({ d, className = "w-5 h-5", strokeWidth = 1.7, fill = false }: IconProps & { d: string; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);
export const Ic = {
  bolt: (p: IconProps) => <S {...p} fill d="M13.2 2 5 13.6h5.2L9 22l9.9-12.4h-5.5L13.2 2z" />,
  bag: (p: IconProps) => <S {...p} d="M6.5 7.5h11l1 12.5a1 1 0 0 1-1 1.1h-11a1 1 0 0 1-1-1.1l1-12.5Zm2.5 0V6a3 3 0 0 1 6 0v1.5" />,
  heart: (p: IconProps & { filled?: boolean }) =>
    p.filled ? <S {...p} fill d="M12 20.3 4.7 13a4.9 4.9 0 0 1 7-7l.3.4.3-.4a4.9 4.9 0 1 1 7 7L12 20.3z" /> : <S {...p} d="M12 20.3 4.7 13a4.9 4.9 0 0 1 7-7l.3.4.3-.4a4.9 4.9 0 1 1 7 7L12 20.3z" />,
  user: (p: IconProps) => <S {...p} d="M12 11.5a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6Zm-7 8.6a7 7 0 0 1 14 0" />,
  scale: (p: IconProps) => <S {...p} d="M4 7h16M7 7v11.5h10V7M12 7V4.5M9 4.5h6M9.5 14.5 8 11h3l-1.5 3.5zm5 0L13 11h3l-1.5 3.5z" />,
  search: (p: IconProps) => <S {...p} d="M10.5 17.5a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm9 3-4.3-4.3" />,
  star: (p: IconProps) => <S {...p} fill d="m12 2.8 2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.6l-5.6 3.2 1.3-6.2L3 9.3l6.3-.7L12 2.8z" />,
  x: (p: IconProps) => <S {...p} d="M6 6l12 12M18 6 6 18" />,
  plus: (p: IconProps) => <S {...p} d="M12 5v14M5 12h14" />,
  minus: (p: IconProps) => <S {...p} d="M5 12h14" />,
  arrow: (p: IconProps) => <S {...p} d="M4 12h16m-6-6 6 6-6 6" />,
  arrowUp: (p: IconProps) => <S {...p} d="M12 20V4m-6 6 6-6 6 6" />,
  chev: (p: IconProps) => <S {...p} d="m6 9 6 6 6-6" />,
  eye: (p: IconProps) => <S {...p} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.7a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4Z" />,
  trash: (p: IconProps) => <S {...p} d="M4.5 6.5h15M9.5 6V4.5h5V6m-8 .5 1 13h9l1-13M10 10.5v6m4-6v6" />,
  check: (p: IconProps) => <S {...p} d="m4.5 12.5 5 5L19.5 7" />,
  bell: (p: IconProps) => <S {...p} d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5c0 6-2 6.5-2 6.5h15s-2-.5-2-6.5A5.5 5.5 0 0 0 12 3.5Zm-2.2 15a2.3 2.3 0 0 0 4.4 0" />,
  chat: (p: IconProps) => <S {...p} d="M4 5.5h16v11H9.5L4 21V5.5Zm4 4h8m-8 3.5h5" />,
  sun: (p: IconProps) => <S {...p} d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-13v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.4-5.9-1.4 1.4M6.5 17.5l-1.4 1.4m0-13.8 1.4 1.4m11 11 1.4 1.4" />,
  moon: (p: IconProps) => <S {...p} d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  globe: (p: IconProps) => <S {...p} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c-2.8 2.6-4 5.8-4 9s1.2 6.4 4 9c2.8-2.6 4-5.8 4-9s-1.2-6.4-4-9Z" />,
  truck: (p: IconProps) => <S {...p} d="M2.5 5.5H15v11H2.5v-11Zm12.5 3H20l1.5 3.5v4.5H15V8.5ZM6 19.5a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm11.5 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />,
  shield: (p: IconProps) => <S {...p} d="M12 2.5 4.5 5.5v6c0 5 3.5 8.5 7.5 10 4-1.5 7.5-5 7.5-10v-6L12 2.5Zm-3 9.5 2.2 2.2L15.5 9" />,
  card: (p: IconProps) => <S {...p} d="M3 6.5h18v11H3v-11Zm0 3.5h18M6.5 14.5H10" />,
  pin: (p: IconProps) => <S {...p} d="M12 21.5s-7-6.2-7-11.5a7 7 0 0 1 14 0c0 5.3-7 11.5-7 11.5Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
  mail: (p: IconProps) => <S {...p} d="M3 5.5h18v13H3v-13Zm0 1 9 6.5 9-6.5" />,
  download: (p: IconProps) => <S {...p} d="M12 3.5v11m-4.5-4 4.5 4.5L16.5 10.5M4 20.5h16" />,
  upload: (p: IconProps) => <S {...p} d="M12 14.5v-11M7.5 7.5 12 3l4.5 4.5M4 20.5h16" />,
  print: (p: IconProps) => <S {...p} d="M6.5 8V3.5h11V8m-13 0h15a1.5 1.5 0 0 1 1.5 1.5v6h-3.5m-13 0H3v-6A1.5 1.5 0 0 1 4.5 9.5Zm3 6h9v5h-9v-5Z" />,
  box: (p: IconProps) => <S {...p} d="m12 2.5 8.5 4.5v10L12 21.5l-8.5-4.5V7L12 2.5Zm-8.5 4.7L12 11.7l8.5-4.5M12 11.7v9.8" />,
  chart: (p: IconProps) => <S {...p} d="M4 4v16h16M8.5 16v-5m4.5 5V8m4.5 8v-3.5" />,
  tag: (p: IconProps) => <S {...p} d="m3.5 12 8.5 8.5 8.5-8.5-8.5-8.5H4.5v7Zm3.5-3.5h.01" />,
  users: (p: IconProps) => <S {...p} d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6.5 9a6.5 6.5 0 0 1 13 0M16 4.4a3.5 3.5 0 0 1 0 6.6m5.5 5a6.5 6.5 0 0 0-4.5-6.2" />,
  settings: (p: IconProps) => <S {...p} d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5 1.8-1.4-2-3.4-2.2.8a8 8 0 0 0-1.8-1L15.4 4h-4l-.4 2.4a8 8 0 0 0-1.8 1l-2.2-.8-2 3.4L6.8 12 5 13.4l2 3.4 2.2-.8a8 8 0 0 0 1.8 1l.4 2.4h4l.4-2.4a8 8 0 0 0 1.8-1l2.2.8 2-3.4L18 12Z" />,
  rotate: (p: IconProps) => <S {...p} d="M20 12a8 8 0 1 1-2.3-5.6M20 3v4.5h-4.5" />,
  lock: (p: IconProps) => <S {...p} d="M5.5 10.5h13v10h-13v-10Zm2.5 0V7.5a4 4 0 0 1 8 0v3m-4 3.5v2.5" />,
  logout: (p: IconProps) => <S {...p} d="M14.5 8V4.5h-10v15h10V16M9 12h11m-3.5-3.5L20 12l-3.5 3.5" />,
  filter: (p: IconProps) => <S {...p} d="M4 5.5h16L14 13v6l-4 2v-8L4 5.5Z" />,
  send: (p: IconProps) => <S {...p} d="m3.5 11.5 17-7-4.5 16-4.8-6.2-7.7-2.8Zm7.7 6.2 4.8-6.2" />,
  cake: (p: IconProps) => <S {...p} d="M12 3.2a1.6 1.6 0 0 1 1.6 1.6c0 1.1-1.6 2.4-1.6 2.4S10.4 5.9 10.4 4.8A1.6 1.6 0 0 1 12 3.2ZM5 12.2c1.8 0 1.8 1.6 3.5 1.6s1.7-1.6 3.5-1.6 1.8 1.6 3.5 1.6S17.2 12.2 19 12.2V9.8a1.6 1.6 0 0 0-1.6-1.6H6.6A1.6 1.6 0 0 0 5 9.8v2.4ZM5 14.4v5.8h14v-5.8c-1.8 0-1.8 1.6-3.5 1.6s-1.7-1.6-3.5-1.6-1.8 1.6-3.5 1.6-1.7-1.6-3.5-1.6Z" />,
  whisk: (p: IconProps) => <S {...p} d="m19.5 4.5-6 6M4.5 19.5c-1-1-1-3.5.8-5.3l5.2-5.2c1.8-1.8 4.3-1.8 5.3-.8s1 3.5-.8 5.3L9.8 18.7c-1.8 1.8-4.3 1.8-5.3.8ZM7 13l4 4" />,
  sparkle: (p: IconProps) => <S {...p} fill d="m12 2 2.4 6.2L20.6 11l-6.2 2.8L12 20l-2.4-6.2L3.4 11l6.2-2.8L12 2Z" />,
  map: (p: IconProps) => <S {...p} d="M3 6.5 9 4l6 2.5 6-2.5v13l-6 2.5-6-2.5-6 2.5v-13Zm6-2.5v13m6-10.5v13" />,
  grid: (p: IconProps) => <S {...p} d="M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z" />,
  phone: (p: IconProps) => <S {...p} d="M5.5 4.5h3l2 5-2 2a11 11 0 0 0 5.5 5.5l2-2 5 2v3a2 2 0 0 1-2.2 2c-9.5-.5-17-8-17.5-17.5a2 2 0 0 1 2-2.2Z" />,
  camera: (p: IconProps) => <S {...p} d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />,
  edit: (p: IconProps) => <S {...p} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />,
  whatsapp: (p: IconProps) => (
    <svg viewBox="0 0 24 24" className={p.className ?? "w-5 h-5"} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.275-.1-.476-.15-.676.15-.2.3-.777.978-.952 1.179-.175.2-.351.226-.652.075-.3-.15-1.267-.467-2.414-1.489-.893-.796-1.496-1.78-1.672-2.08-.175-.3-.019-.463.132-.613.135-.134.301-.35.451-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.677-1.631-.927-2.234-.244-.588-.492-.508-.676-.518l-.576-.01c-.2 0-.525.075-.8.375-.275.3-1.052 1.028-1.052 2.508 0 1.48 1.077 2.908 1.228 3.109.15.2 2.12 3.237 5.137 4.54.717.31 1.278.496 1.716.635.72.229 1.376.197 1.895.12.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.176-1.429-.076-.125-.276-.2-.577-.35zM12.04 2C6.51 2 2.015 6.495 2.015 12.025c0 1.83.493 3.55 1.353 5.035L2 22l5.097-1.336a9.98 9.98 0 0 0 4.943 1.385h.005c5.525 0 10.02-4.495 10.02-10.024C22.065 6.495 17.565 2 12.04 2z" />
    </svg>
  ),
};

/* ---------------- crop-aware product image ---------------- */
export function PImg({ src, crop, filter, alt, className = "" }: { src: string; crop?: string; filter?: string; alt: string; className?: string }) {
  if (crop) {
    return <div role="img" aria-label={alt} className={`bg-cover bg-no-repeat ${className}`} style={{ backgroundImage: `url(${src})`, backgroundSize: "200% 200%", backgroundPosition: crop, filter: filter || undefined }} />;
  }
  return <ImgX src={src} alt={alt} className={className} style={filter ? { filter } : undefined} />;
}

/* ---------------- scroll reveal ---------------- */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" | "span" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); ob.disconnect(); } }, { threshold: 0.12 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <Tag ref={ref as React.Ref<never>} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(30px)", transition: `opacity .8s cubic-bezier(.22,1,.36,1) ${delay}ms, transform .8s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </Tag>
  );
}

/* ---------------- 3D tilt ---------------- */
export function Tilt({ children, className = "", max = 10 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateZ(0)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`tilt-wrap will-change-transform ${className}`}>{children}</div>;
}

/* ---------------- stars ---------------- */
export function Stars({ value, className = "w-3.5 h-3.5" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex gap-0.5 text-gold-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= Math.round(value) ? 1 : 0.25 }}><Ic.star className={className} /></span>
      ))}
    </span>
  );
}

/* ---------------- image with graceful fallback ---------------- */
export function ImgX({ src, alt, className = "", style }: { src: string; alt: string; className?: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false);
  if (err)
    return (
      <div className={`flex items-center justify-center bg-ink-800 text-ink-500 ${className}`} style={style}>
        <Ic.cake className="w-10 h-10 opacity-40" />
      </div>
    );
  return <img src={src} alt={alt} loading="lazy" onError={() => setErr(true)} className={className} style={style} draggable={false} />;
}

/* ---------------- modal shell ---------------- */
export function Modal({ open, onClose, children, wide = false }: { open: boolean; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => { window.removeEventListener("keydown", h); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto flex items-center justify-center p-4 sm:p-8 bg-ink-950/80 backdrop-blur-sm anim-fade-in" onClick={onClose}>
      <div className={`relative anim-zoom w-full ${wide ? "max-w-5xl" : "max-w-lg"} my-auto bg-ink-900 dark:bg-ink-900 border border-ink-700/60 shadow-lift clip-tile`} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-10 p-2 text-ink-300 hover:text-blaze-500 transition-colors"><Ic.x className="w-5 h-5" /></button>
        <div className="max-h-[85vh] overflow-y-auto p-1">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------------- section heading ---------------- */
export function SectionHead({ kicker, title, link, linkLabel }: { kicker: string; title: string; link?: React.ReactNode; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-10">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 mb-3 flex items-center gap-2">
          <span className="inline-block w-8 h-px bg-blaze-500" />{kicker}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.05] uppercase">{title}</h2>
      </div>
      {link && <div className="hidden sm:block shrink-0">{link}</div>}
    </div>
  );
}

/* ---------------- qty stepper ---------------- */
export function Qty({ value, onChange, max = 99, small = false }: { value: number; onChange: (n: number) => void; max?: number; small?: boolean }) {
  const btn = `grid place-items-center transition-colors hover:bg-blaze-500 hover:text-ink-50 disabled:opacity-30 disabled:hover:bg-transparent ${small ? "w-7 h-7" : "w-9 h-10"}`;
  return (
    <div className={`inline-flex items-stretch border border-ink-600 ${small ? "text-xs" : ""}`}>
      <button className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease"><Ic.minus className="w-3.5 h-3.5" /></button>
      <span className={`${small ? "w-8" : "w-11"} grid place-items-center font-mono tabnum border-x border-ink-600`}>{value}</span>
      <button className={btn} onClick={() => onChange(Math.min(max, value + 1))} aria-label="Increase"><Ic.plus className="w-3.5 h-3.5" /></button>
    </div>
  );
}

/* ---------------- particle canvas ---------------- */
export function Particles({ className = "", count = 70, color = "226,62,95" }: { className?: string; count?: number; color?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const resize = () => { cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0006, vy: -0.0004 - Math.random() * 0.0012,
      r: 0.8 + Math.random() * 1.8, o: 0.15 + Math.random() * 0.5,
    }));
    const tick = () => {
      const { width: w, height: h } = cv;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02; if (p.x > 1.02) p.x = -0.02;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r * devicePixelRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.o})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [count, color]);
  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 w-full h-full ${className}`} aria-hidden />;
}

/* ---------------- scramble text hook ---------------- */
export function useScramble(text: string, start = true) {
  const [out, setOut] = useState(start ? "" : text);
  useEffect(() => {
    if (!start) return;
    const chars = "▮▯╱╲<>/\\×+";
    let frame = 0;
    const total = 26;
    const id = setInterval(() => {
      frame++;
      const prog = frame / total;
      setOut(text.split("").map((c, i) => {
        if (c === " ") return " ";
        return i / text.length < prog ? c : chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      if (frame >= total) { setOut(text); clearInterval(id); }
    }, 34);
    return () => clearInterval(id);
  }, [text, start]);
  return out;
}
