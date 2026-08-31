import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../lib/store";
import { CATEGORIES, CURRENCIES, type Product } from "../data/catalog";
import type { Lang } from "../lib/i18n";
import { Ic, ImgX, Modal, PImg, Qty } from "./ui";
import { useQuickView } from "./product";

/* ================= auth context ================= */
const AuthCtx = createContext<{ openAuth: (mode?: "login" | "signup") => void }>({ openAuth: () => {} });
export const useAuth = () => useContext(AuthCtx);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<null | "login" | "signup">(null);
  return (
    <AuthCtx.Provider value={{ openAuth: (m = "login") => setMode(m) }}>
      {children}
      <AuthModal mode={mode} onClose={() => setMode(null)} />
    </AuthCtx.Provider>
  );
}

function AuthModal({ mode, onClose }: { mode: null | "login" | "signup"; onClose: () => void }) {
  const { login, requestSignup, verifySignup, socialLogin, pendingOtp, toast } = useStore();
  const [view, setView] = useState<"form" | "otp" | "forgot">("form");
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [err, setErr] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (mode) { setTab(mode); setView("form"); setErr(""); setOtp(["", "", "", "", "", ""]); }
  }, [mode]);

  useEffect(() => {
    if (view === "otp" && otp.every((d) => d !== "")) {
      const r = verifySignup(otp.join(""));
      if (r.ok) onClose(); else setErr(r.msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, view]);

  if (!mode) return null;
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    if (tab === "login") {
      const r = login(email, pass);
      if (r.ok) onClose(); else setErr(r.msg);
    } else {
      if (!name.trim() || !email.includes("@") || pass.length < 6) { setErr("Enter name, valid email and a 6+ char password."); return; }
      const r = requestSignup(name, email, pass);
      if (r.ok) setView("otp"); else setErr(r.msg);
    }
  };
  const inp = "w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm transition-colors placeholder:text-ink-500";

  return (
    <Modal open={!!mode} onClose={onClose}>
      <div className="grid md:grid-cols-[1.1fr_1.4fr]">
        <div className="relative hidden md:flex flex-col justify-between p-8 bg-ink-850 overflow-hidden">
          <div className="absolute inset-0 grid-lines opacity-60" />
          <div className="relative flex items-center gap-2 text-blaze-500"><Ic.cake className="w-7 h-7" /><span className="font-display font-extrabold tracking-wide">CakeUrban</span></div>
          <div className="relative">
            <p className="font-display text-2xl font-bold leading-tight uppercase">Sweet<br />access</p>
            <p className="text-sm text-ink-300 mt-3 leading-relaxed">Order tracking, saved flavors, one-tap reorder and first bite on new bakes.</p>
          </div>
          <p className="relative font-mono text-[10px] text-ink-500 tracking-widest">BAKED TO ORDER · OTP VERIFIED · GDPR READY</p>
        </div>
        <div className="p-7 md:p-8">
          {view === "form" && (
            <>
              <div className="flex border border-ink-600 mb-6 font-mono text-xs tracking-[0.18em] uppercase">
                {(["login", "signup"] as const).map((tb) => (
                  <button key={tb} onClick={() => { setTab(tb); setErr(""); }} className={`flex-1 py-3 transition-colors ${tab === tb ? "bg-blaze-500 text-ink-50" : "text-ink-400 hover:text-ink-100"}`}>{tb === "login" ? "Sign in" : "Sign up"}</button>
                ))}
              </div>
              <form onSubmit={submit} className="space-y-3">
                {tab === "signup" && <input className={inp} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />}
                <input className={inp} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={inp} type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
                {tab === "login" && (
                  <button type="button" onClick={() => setView("forgot")} className="font-mono text-[11px] text-ink-400 hover:text-blaze-400 tracking-wide">Forgot password?</button>
                )}
                {err && <p className="text-danger-400 text-xs font-mono">{err}</p>}
                <button className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase py-3.5 transition-colors">
                  {tab === "login" ? "Sign in" : "Create account"}
                </button>
              </form>
              <div className="flex items-center gap-3 my-5"><span className="h-px flex-1 bg-ink-700" /><span className="font-mono text-[10px] tracking-[0.2em] text-ink-500">OR</span><span className="h-px flex-1 bg-ink-700" /></div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { socialLogin("Google"); onClose(); }} className="border border-ink-600 hover:border-ink-400 py-3 text-sm flex items-center justify-center gap-2 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#EA4335" d="M12 5.4c1.7 0 3.2.6 4.4 1.7l3.2-3.2A11 11 0 0 0 12 1a11 11 0 0 0-9.8 6l3.7 2.9A6.6 6.6 0 0 1 12 5.4z"/><path fill="#4285F4" d="M23 12.3c0-.9-.1-1.6-.2-2.3H12v4.5h6.2a5.4 5.4 0 0 1-2.3 3.5l3.6 2.8c2.2-2 3.5-5 3.5-8.5z"/><path fill="#FBBC05" d="M5.9 13.9a6.6 6.6 0 0 1 0-4.2L2.2 6.8a11 11 0 0 0 0 10l3.7-2.9z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1a6.6 6.6 0 0 1-6.1-4.5l-3.7 2.9A11 11 0 0 0 12 23z"/></svg>
                  Google
                </button>
                <button onClick={() => { socialLogin("Facebook"); onClose(); }} className="border border-ink-600 hover:border-ink-400 py-3 text-sm flex items-center justify-center gap-2 transition-colors">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#1877F2"><path d="M13.5 21v-7h2.6l.5-3h-3.1V9c0-.9.3-1.6 1.7-1.6h1.6V4.7c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H8v3h2.4v7h3.1z"/></svg>
                  Facebook
                </button>
              </div>
              <div className="mt-5 p-3 border border-dashed border-ink-600 font-mono text-[10px] text-ink-400 leading-relaxed">
                DEMO — customer: user@cakeurban.com / demo123<br />DEMO — admin: admin@cakeurban.com / demo123
              </div>
            </>
          )}
          {view === "otp" && (
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] text-blaze-500 uppercase">Step 2 — Verify email</p>
              <h3 className="font-display text-xl font-bold mt-2">Enter the 6-digit code</h3>
              <p className="text-sm text-ink-400 mt-1">Sent to <span className="text-ink-200">{pendingOtp?.email}</span>. Check the demo SMS toast.</p>
              <div className="flex gap-2 mt-6">
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" maxLength={1}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...otp]; next[i] = v; setOtp(next);
                      if (v && i < 5) refs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
                    className="w-12 h-14 text-center font-mono text-xl bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none transition-colors" />
                ))}
              </div>
              {err && <p className="text-danger-400 text-xs font-mono mt-3">{err}</p>}
              <button onClick={() => { const r = verifySignup(otp.join("")); if (r.ok) onClose(); else setErr(r.msg); }} className="clip-btn w-full mt-6 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase py-3.5 transition-colors">Verify & enter</button>
            </div>
          )}
          {view === "forgot" && (
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] text-blaze-500 uppercase">Password reset</p>
              <h3 className="font-display text-xl font-bold mt-2">Reset link</h3>
              <p className="text-sm text-ink-400 mt-1 mb-5">We'll email a secure reset link (demo — just watch the toast).</p>
              <input className={inp} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button onClick={() => { toast("info", `Reset link emailed to ${email || "your inbox"} (demo)`); setView("form"); }} className="clip-btn w-full mt-4 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase py-3.5 transition-colors">Send reset link</button>
              <button onClick={() => setView("form")} className="w-full mt-3 font-mono text-xs text-ink-400 hover:text-ink-100">← Back</button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
/* ================= search overlay ================= */
function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, fmt } = useStore();
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const res = q.trim() ? products.filter((p) => (p.name + p.brand + p.category).toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  useEffect(() => { if (open) setQ(""); }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-ink-950/90 backdrop-blur-md" onClick={onClose}>
          <div className="max-w-3xl mx-auto pt-28 px-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 border-b-2 border-ink-600 focus-within:border-blaze-500 transition-colors pb-3">
              <Ic.search className="w-6 h-6 text-blaze-500 shrink-0" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search gear, brands, collections…"
                className="flex-1 bg-transparent outline-none font-display text-xl md:text-2xl placeholder:text-ink-500" />
              <button onClick={onClose} className="font-mono text-xs tracking-[0.2em] text-ink-400 hover:text-blaze-400">ESC</button>
            </div>
            <div className="mt-6 space-y-1">
              {res.map((p) => (
                <button key={p.id} onClick={() => { nav(`/product/${p.id}`); onClose(); }} className="w-full flex items-center gap-4 p-3 hover:bg-ink-850 transition-colors text-left group">
                  <span className="w-14 h-14 bg-ink-850 clip-tag overflow-hidden shrink-0"><ImgX src={p.img} alt={p.name} className="w-full h-full object-cover" style={p.imgFilter ? { filter: p.imgFilter } : undefined} /></span>
                  <span className="flex-1">
                    <span className="block font-display font-semibold text-sm group-hover:text-blaze-400 transition-colors">{p.name}</span>
                    <span className="block font-mono text-[11px] text-ink-400">{p.brand} · {p.category}</span>
                  </span>
                  <span className="font-mono tabnum text-sm">{fmt(p.price)}</span>
                </button>
              ))}
              {q.trim() && res.length === 0 && <p className="font-mono text-sm text-ink-400 py-8 text-center">No matches for "{q}"</p>}
              {!q.trim() && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {["Running", "ANC", "Titanium", "Shell", "Carbon"].map((s) => (
                    <button key={s} onClick={() => setQ(s)} className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-3 py-1.5 font-mono text-xs transition-colors">{s}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ================= notification bell ================= */
function Bell() {
  const { notifs, markNotifsRead } = useStore();
  const [open, setOpen] = useState(false);
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) markNotifsRead(); }} aria-label="Notifications" className="relative p-2 text-ink-300 hover:text-blaze-500 transition-colors">
        <Ic.bell className="w-5 h-5" />
        {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-blaze-500 pulse-dot rounded-full" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-0 top-12 w-80 bg-ink-900 border border-ink-700 shadow-lift z-50">
            <p className="px-4 py-3 font-mono text-[10px] tracking-[0.25em] text-ink-400 border-b border-ink-700 uppercase">Push notifications</p>
            <div className="max-h-72 overflow-y-auto">
              {notifs.slice(0, 8).map((n) => (
                <div key={n.id} className="px-4 py-3 border-b border-ink-800 text-sm flex gap-3">
                  <Ic.bolt className="w-4 h-4 text-blaze-500 shrink-0 mt-0.5" />
                  <div><p className="text-ink-100 leading-snug">{n.text}</p><p className="font-mono text-[10px] text-ink-500 mt-1">{new Date(n.at).toLocaleString()}</p></div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= header + mega menu ================= */
export function Header({ onCart, onCompare }: { onCart: () => void; onCompare: () => void }) {
  const { t, user, cartCount, wishlist, compare, theme, toggleTheme, lang, set, currency, settings, logout } = useStore();
  const { openAuth } = useAuth();
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  useEffect(() => setMega(false), [loc.pathname]);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h(); window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <header className={`fixed top-0 inset-x-0 z-[70] transition-all duration-300 ${scrolled || mega ? "bg-ink-950/90 dark:bg-ink-950/90 backdrop-blur-lg border-b border-ink-800 shadow-lg shadow-ink-950/40" : "bg-transparent border-b border-transparent"}`}>
        {/* top utility strip */}
        <div className="hidden md:flex items-center justify-between px-6 lg:px-10 h-8 border-b border-ink-800/60 font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase">
          <span className="truncate">{settings.announcement}</span>
          <div className="flex items-center gap-4 shrink-0">
            <select value={currency} onChange={(e) => set({ currency: e.target.value })} aria-label="Currency" className="bg-transparent outline-none cursor-pointer hover:text-blaze-400 transition-colors">
              {CURRENCIES.map((c) => <option key={c.code} value={c.code} className="bg-ink-900 text-ink-100">{c.code} {c.symbol}</option>)}
            </select>
            <span className="text-ink-700">/</span>
            <select value={lang} onChange={(e) => set({ lang: e.target.value as Lang })} aria-label="Language" className="bg-transparent outline-none cursor-pointer hover:text-blaze-400 transition-colors">
              <option value="en" className="bg-ink-900 text-ink-100">EN</option>
              <option value="hi" className="bg-ink-900 text-ink-100">हिं</option>
              <option value="es" className="bg-ink-900 text-ink-100">ES</option>
            </select>
            <span className="text-ink-700">/</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-volt-400" /> Live rates</span>
          </div>
        </div>
        {/* main bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-10 h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-ink-50">
              <Ic.cake className="w-7 h-7 text-blaze-500" />
              <span className="font-display font-extrabold text-lg tracking-wide">CakeUrban</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-7 font-mono text-xs tracking-[0.2em] uppercase">
              <div className="relative" onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}>
                <Link to="/shop" className={`link-sweep py-2 flex items-center gap-1.5 transition-colors ${mega ? "text-blaze-400" : "text-ink-200 hover:text-ink-50"}`}>
                  {t("nav.shop")} <Ic.chev className={`w-3.5 h-3.5 transition-transform ${mega ? "rotate-180" : ""}`} />
                </Link>
              </div>
              <Link to="/shop?tag=NEW" className="link-sweep text-ink-200 hover:text-ink-50 transition-colors">{t("nav.new")}</Link>
              <Link to="/blog" className="link-sweep text-ink-200 hover:text-ink-50 transition-colors">{t("nav.blog")}</Link>
              {user?.role === "admin" && <Link to="/admin" className="link-sweep text-gold-400 hover:text-gold-400">Admin</Link>}
            </nav>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <button onClick={() => setSearch(true)} aria-label="Search" className="p-2 text-ink-300 hover:text-blaze-500 transition-colors"><Ic.search className="w-5 h-5" /></button>
            <button onClick={toggleTheme} aria-label={t("theme")} className="p-2 text-ink-300 hover:text-blaze-500 transition-colors">
              {theme === "dark" ? <Ic.sun className="w-5 h-5" /> : <Ic.moon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block"><Bell /></div>
            <Link to="/wishlist" aria-label={t("wishlist")} className="relative p-2 text-ink-300 hover:text-blaze-500 transition-colors">
              <Ic.heart className="w-5 h-5" />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center bg-blaze-500 text-ink-50 font-mono text-[9px] rounded-full">{wishlist.length}</span>}
            </Link>
            <button onClick={onCompare} aria-label={t("compare")} className="relative p-2 text-ink-300 hover:text-cobalt-400 transition-colors">
              <Ic.scale className="w-5 h-5" />
              {compare.length > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center bg-cobalt-500 text-ink-50 font-mono text-[9px] rounded-full">{compare.length}</span>}
            </button>
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 text-ink-300 hover:text-blaze-500 transition-colors" aria-label={t("account")}>
                  <span className="w-7 h-7 grid place-items-center bg-ink-800 border border-ink-600 rounded-full font-mono text-[11px] text-ink-100">{user.name[0]}</span>
                </button>
                <div className="absolute right-0 top-11 w-52 bg-ink-900 border border-ink-700 shadow-lift opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all">
                  <p className="px-4 pt-3 pb-2 border-b border-ink-800"><span className="block font-mono text-[10px] tracking-widest text-ink-500 uppercase">{t("signedIn")}</span><span className="text-sm font-semibold">{user.name}</span></p>
                  <Link to={user.role === "admin" ? "/admin" : "/account"} className="block px-4 py-2.5 text-sm hover:bg-ink-800 transition-colors">Dashboard</Link>
                  <Link to="/account?tab=orders" className="block px-4 py-2.5 text-sm hover:bg-ink-800 transition-colors">Orders</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-ink-800 text-danger-400 transition-colors">Sign out</button>
                </div>
              </div>
            ) : (
              <button onClick={() => openAuth("login")} aria-label={t("account")} className="p-2 text-ink-300 hover:text-blaze-500 transition-colors"><Ic.user className="w-5 h-5" /></button>
            )}
            <button onClick={onCart} aria-label={t("cart")} className="relative p-2 text-ink-300 hover:text-blaze-500 transition-colors">
              <Ic.bag className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 grid place-items-center bg-blaze-500 text-ink-50 font-mono text-[9px] rounded-full anim-check" key={cartCount}>{cartCount}</span>}
            </button>
          </div>
        </div>
        {/* mega menu */}
        <AnimatePresence>
          {mega && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
              onMouseEnter={() => setMega(true)} onMouseLeave={() => setMega(false)}
              className="hidden lg:block absolute inset-x-0 top-full bg-ink-950/97 backdrop-blur-xl border-b border-ink-800 shadow-lift">
              <div className="px-10 py-10 grid grid-cols-[repeat(5,1fr)_1.4fr] gap-8">
                {CATEGORIES.map((c) => (
                  <div key={c.name}>
                    <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="font-display font-bold text-sm uppercase tracking-wide text-ink-50 hover:text-blaze-400 transition-colors">{c.name}</Link>
                    <div className="mt-4 space-y-2.5">
                      {c.subs.map((s) => (
                        <Link key={s} to={`/shop?cat=${encodeURIComponent(c.name)}&q=${encodeURIComponent(s)}`} className="block text-sm text-ink-400 hover:text-blaze-400 hover:translate-x-1 transition-all">{s}</Link>
                      ))}
                      <Link to={`/shop?cat=${encodeURIComponent(c.name)}`} className="inline-flex items-center gap-1.5 pt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-blaze-500">All <Ic.arrow className="w-3 h-3" /></Link>
                    </div>
                  </div>
                ))}
                <Link to="/product/raspberry-noir" className="relative clip-tile overflow-hidden group border border-ink-700/60 bg-ink-850">
                  <div className="absolute inset-0 grid-lines opacity-50" />
                  <MegaFeatured />
                  <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent">
                    <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-400">SIGNATURE · BAKED TO ORDER</p>
                    <p className="font-display font-bold mt-1 group-hover:text-blaze-400 transition-colors">Raspberry Noir</p>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      <div className="h-16 md:h-24" />
    </>
  );
}

function MegaFeatured() {
  const { products } = useStore();
  const p = products.find((x) => x.id === "raspberry-noir");
  if (!p) return null;
  return <PImg src={p.img} crop={p.crop} filter={p.imgFilter} alt={p.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105" />;
}

/* ================= cart drawer ================= */
export function CartDrawer({ open, onClose, onCheckout }: { open: boolean; onClose: () => void; onCheckout: () => void }) {
  const { cart, products, fmt, t, cartQty, cartRemove, saveForLater, cartSubtotal, couponFor, toast, saved, moveSavedToCart, removeSaved } = useStore();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [err, setErr] = useState("");
  const freeOver = 49;
  const progress = Math.min(100, (cartSubtotal / freeOver) * 100);

  const apply = () => {
    const r = couponFor(code);
    if (r.ok) { setApplied(code.toUpperCase()); setErr(""); toast("success", r.msg); }
    else { setApplied(""); setErr(r.msg); }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[85] bg-ink-950/75 backdrop-blur-sm" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-[86] w-full max-w-md bg-ink-900 border-l border-ink-800 flex flex-col">
            <div className="flex items-center justify-between px-6 h-16 border-b border-ink-800 shrink-0">
              <h3 className="font-display font-bold uppercase tracking-wide flex items-center gap-2"><Ic.bag className="w-5 h-5 text-blaze-500" />{t("yourCart")} <span className="font-mono text-xs text-ink-400">({cart.length})</span></h3>
              <button onClick={onClose} aria-label="Close cart" className="p-2 text-ink-400 hover:text-blaze-500 transition-colors"><Ic.x className="w-5 h-5" /></button>
            </div>
            {/* free shipping meter */}
            <div className="px-6 py-4 border-b border-ink-800 shrink-0">
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase mb-2">
                {cartSubtotal >= freeOver ? <span className="text-volt-400">✓ {t("freeShipDone")}</span> : <span className="text-ink-300">{fmt(freeOver - cartSubtotal)} {t("freeShipNote")}</span>}
              </p>
              <div className="h-1.5 bg-ink-800 overflow-hidden">
                <div className={`h-full transition-all duration-500 ${cartSubtotal >= freeOver ? "bg-volt-400" : "bg-blaze-500"}`} style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cart.length === 0 && (
                <div className="text-center py-16">
                  <Ic.bag className="w-12 h-12 mx-auto text-ink-600 mb-4" />
                  <p className="font-display font-semibold uppercase">{t("emptyCart")}</p>
                  <button onClick={onClose} className="clip-tag mt-5 border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-5 py-2.5 font-mono text-xs tracking-[0.15em] uppercase transition-colors">{t("continueShopping")}</button>
                </div>
              )}
              {cart.map((it, i) => {
                const p = products.find((x) => x.id === it.productId);
                if (!p) return null;
                const filter = p.imgFilter ?? p.colors.find((c) => c.name === it.color)?.filter;
                return (
                  <motion.div key={`${it.productId}-${it.color}-${it.size}`} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="flex gap-4 border border-ink-800 bg-ink-850/60 p-3">
                    <Link to={`/product/${p.id}`} onClick={onClose} className="w-20 h-20 bg-ink-850 clip-tag overflow-hidden shrink-0">
                      <ImgX src={p.img} alt={p.name} className="w-full h-full object-cover" style={filter ? { filter } : undefined} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="font-display text-sm font-semibold leading-snug truncate">{p.name}</p>
                        <span className="font-mono tabnum text-sm shrink-0">{fmt(p.price * it.qty)}</span>
                      </div>
                      <p className="font-mono text-[10px] text-ink-400 tracking-wide mt-0.5">{it.color} · {it.size}</p>
                      <div className="flex items-center justify-between mt-2.5">
                        <Qty small value={it.qty} onChange={(n) => cartQty(i, n)} max={p.stock} />
                        <div className="flex gap-1">
                          <button title={t("saveForLater")} onClick={() => saveForLater(i)} className="p-1.5 text-ink-400 hover:text-volt-400 transition-colors"><Ic.heart className="w-4 h-4" /></button>
                          <button title={t("remove")} onClick={() => cartRemove(i)} className="p-1.5 text-ink-400 hover:text-danger-400 transition-colors"><Ic.trash className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {saved.length > 0 && (
                <div className="pt-4 border-t border-dashed border-ink-700">
                  <p className="font-mono text-[10px] tracking-[0.22em] text-ink-400 uppercase mb-3">Saved for later ({saved.length})</p>
                  {saved.map((it, i) => {
                    const p = products.find((x) => x.id === it.productId);
                    if (!p) return null;
                    return (
                      <div key={it.productId} className="flex items-center justify-between py-2 text-sm">
                        <span className="truncate text-ink-300">{p.name}</span>
                        <span className="flex gap-2 shrink-0">
                          <button onClick={() => moveSavedToCart(i)} className="font-mono text-[10px] tracking-widest uppercase text-blaze-400 hover:text-blaze-300">→ Cart</button>
                          <button onClick={() => removeSaved(i)} className="font-mono text-[10px] tracking-widest uppercase text-ink-500 hover:text-danger-400">✕</button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-ink-800 p-6 shrink-0 space-y-3">
                <div className="flex gap-2">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("couponPh")} className="flex-1 bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 font-mono text-xs uppercase placeholder:normal-case placeholder:font-body placeholder:text-ink-500 transition-colors" />
                  <button onClick={apply} className="clip-tag bg-ink-100 text-ink-950 hover:bg-blaze-500 hover:text-ink-50 font-mono text-xs tracking-[0.15em] uppercase px-4 transition-colors">{t("apply")}</button>
                </div>
                {err && <p className="font-mono text-[10px] text-danger-400">{err}</p>}
                {applied && !err && <p className="font-mono text-[10px] text-volt-400">✓ {applied} applied</p>}
                <div className="flex justify-between font-mono text-sm"><span className="text-ink-400">{t("subtotal")}</span><span className="tabnum">{fmt(cartSubtotal)}</span></div>
                <p className="font-mono text-[10px] text-ink-500">{t("shipping")} + taxes calculated at checkout</p>
                <button onClick={onCheckout} className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase py-4 transition-colors flex items-center justify-center gap-2">
                  {t("checkout")} <Ic.arrow className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ================= chat widget ================= */
const CANNED = [
  "Got it — checking that for you now. Same-day orders placed before 4 PM arrive chilled within ~90 minutes, and you'll get a push update.",
  "Everything on the menu has an eggless version baked on a dedicated line — just flag it at checkout and we double-check by hand.",
  "Freshness guaranteed: if anything arrives short of perfect, send a photo within 2 hours and we'll re-bake or refund — your choice.",
  "You can add a handwritten message to any cake or gift tin in the order notes — up to 20 words, on us.",
  "The code WELCOME10 gives 10% off your first order — apply it in your box before checkout.",
];
export function ChatWidget() {
  const { chat, sendChat, user, consent } = useStore();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const cannedIdx = useRef(0);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, open]);
  const send = () => {
    if (!msg.trim()) return;
    sendChat("user", msg.trim());
    setMsg("");
    setTimeout(() => {
      sendChat("support", CANNED[cannedIdx.current % CANNED.length]);
      cannedIdx.current++;
    }, 1100);
  };
  return (
    <>
      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)} aria-label="Support chat"
        className={`fixed left-5 z-[75] w-13 h-13 p-3.5 bg-cobalt-500 hover:bg-cobalt-400 text-ink-50 clip-btn shadow-lift transition-all ${consent === "pending" ? "bottom-52" : "bottom-5"}`}>
        {open ? <Ic.x className="w-5 h-5" /> : <Ic.chat className="w-5 h-5" />}
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="fixed bottom-20 left-5 z-[75] w-[min(92vw,360px)] h-105 bg-ink-900 border border-ink-700 shadow-lift flex flex-col clip-tile">
            <div className="px-4 py-3 bg-ink-850 border-b border-ink-700 flex items-center gap-3">
              <span className="relative w-9 h-9 grid place-items-center bg-cobalt-500/20 border border-cobalt-500 text-cobalt-300"><Ic.bolt className="w-4 h-4" /><span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-volt-400 rounded-full border-2 border-ink-850" /></span>
              <div><p className="font-display text-sm font-bold">CakeUrban Support</p><p className="font-mono text-[10px] text-volt-400">● online — replies in ~1 min</p></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : ""}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed clip-tag ${m.from === "user" ? "bg-blaze-500 text-ink-50" : "bg-ink-800 text-ink-100"}`}>
                    {m.text}
                    <span className="block font-mono text-[9px] opacity-60 mt-1">{new Date(m.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-ink-700 flex gap-2">
              <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={user ? "Type a message…" : "Sign in for order-specific help…"} className="flex-1 bg-ink-950 border border-ink-600 focus:border-cobalt-400 outline-none px-3 py-2.5 text-sm transition-colors" />
              <button onClick={send} aria-label="Send" className="clip-tag bg-cobalt-500 hover:bg-cobalt-400 text-ink-50 px-3.5 transition-colors"><Ic.send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================= toasts + cookie consent + policy ================= */
export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="fixed top-20 md:top-28 right-4 z-[95] space-y-2 w-[min(92vw,360px)]">
      <AnimatePresence>
        {toasts.map((tt) => (
          <motion.div key={tt.id} layout initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60 }}
            className={`flex items-start gap-3 p-3.5 border shadow-lift clip-tag backdrop-blur bg-ink-900/95 ${tt.kind === "success" ? "border-volt-500/60" : tt.kind === "error" ? "border-danger-500/60" : "border-cobalt-500/60"}`}>
            <span className={`mt-0.5 shrink-0 ${tt.kind === "success" ? "text-volt-400" : tt.kind === "error" ? "text-danger-400" : "text-cobalt-300"}`}>
              {tt.kind === "success" ? <Ic.check className="w-4 h-4" /> : tt.kind === "error" ? <Ic.x className="w-4 h-4" /> : <Ic.bell className="w-4 h-4" />}
            </span>
            <p className="text-sm leading-snug flex-1">{tt.msg}</p>
            <button onClick={() => dismissToast(tt.id)} className="text-ink-500 hover:text-ink-200 shrink-0"><Ic.x className="w-3.5 h-3.5" /></button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function CookieConsent() {
  const { consent, set, t } = useStore();
  if (consent !== "pending") return null;
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
      className="fixed bottom-5 left-5 z-[74] w-[min(92vw,400px)] bg-ink-900 border border-ink-700 shadow-lift p-5 clip-tile">
      <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase mb-2">GDPR · Cookies</p>
      <p className="text-sm text-ink-300 leading-relaxed">{t("cookieMsg")}</p>
      <div className="flex gap-2 mt-4">
        <button onClick={() => set({ consent: "accepted" })} className="clip-tag flex-1 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.15em] uppercase py-2.5 transition-colors">{t("accept")}</button>
        <button onClick={() => set({ consent: "declined" })} className="clip-tag flex-1 border border-ink-600 hover:border-ink-400 font-mono text-xs tracking-[0.15em] uppercase py-2.5 transition-colors text-ink-300">{t("decline")}</button>
      </div>
    </motion.div>
  );
}

/* ================= footer ================= */
const POLICIES: Record<string, { title: string; body: string[] }> = {
  privacy: { title: "Privacy Policy", body: ["CakeUrban collects only the data required to bake for and deliver to you: contact details, addresses and encrypted payment tokens. We never sell personal data.", "Data is stored encrypted at rest (AES-256) and in transit (TLS 1.3). You may request a full export or deletion of your data at any time from Account → Settings, per GDPR Article 17.", "Analytics are aggregated and anonymized. Cookie preferences (the digital kind — the baked kind are tracked only by your waistband) can be changed at any time."] },
  terms: { title: "Terms of Service", body: ["All purchases are subject to stock availability. Prices include applicable VAT where required.", "Orders may be cancelled free of charge while in 'pending' or 'processing' status.", "Limited editions are capped per customer to prevent resale abuse."] },
  gdpr: { title: "GDPR Compliance", body: ["Right to access, rectify and erase: email privacy@cakeurban.com and we respond within 30 days.", "Cookie consent is recorded and respected across sessions — declining disables all non-essential tracking.", "Our data processing agreements with payment providers (Stripe, Razorpay, PayPal) are fully PCI-DSS compliant."] },
};
export function Footer() {
  const { t, subscribe, subscribed, settings, products } = useStore();
  const [email, setEmail] = useState("");
  const [policy, setPolicy] = useState<string | null>(null);
  const lowStock = products.filter((p) => p.stock <= 5).length;
  void lowStock;
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-ink-800 bg-ink-900 dark:bg-ink-950 mt-24">
      {/* newsletter band */}
      <div className="relative overflow-hidden border-b border-ink-800 noise">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 mb-3">NEWSLETTER — MAILCHIMP SYNCED</p>
            <h3 className="font-display text-3xl md:text-4xl font-bold uppercase leading-tight">{t("newsletterTitle")}</h3>
            <p className="text-ink-300 mt-3 max-w-md">{t("newsletterSub")}</p>
          </div>
          {subscribed ? (
            <div className="anim-check flex items-center gap-4 border border-volt-500/50 bg-volt-500/10 p-6 clip-tile">
              <Ic.check className="w-8 h-8 text-volt-400 shrink-0" />
              <p className="font-mono text-sm text-volt-300">You're on the list. WELCOME10 is live in your inbox.</p>
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) { subscribe(email); setEmail(""); } }}>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@fastmail.com" className="flex-1 bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-5 py-4 font-mono text-sm transition-colors placeholder:font-body placeholder:text-ink-500" />
              <button className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase px-8 py-4 transition-colors">{t("subscribe")}</button>
            </form>
          )}
        </div>
      </div>
      {/* link columns */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2 text-ink-50"><Ic.bolt className="w-7 h-7 text-blaze-500" /><span className="font-display font-extrabold text-lg">VOLTA</span></div>
          <p className="text-sm text-ink-400 mt-4 max-w-xs leading-relaxed">Performance gear engineered in our propulsion lab. Tested at race pace, delivered in 48 hours, backed for life.</p>
          <div className="flex gap-2 mt-6">
            {[settings.socials.instagram, settings.socials.twitter, settings.socials.youtube].map((s, i) => (
              <a key={i} href={`https://${s}`} target="_blank" rel="noreferrer" className="w-9 h-9 grid place-items-center border border-ink-700 hover:border-blaze-500 hover:text-blaze-400 text-ink-400 transition-colors font-mono text-[10px]">{["IG", "X", "YT"][i]}</a>
            ))}
          </div>
        </div>
        {[
          { h: t("nav.shop"), links: [["All gear", "/shop"], ["Footwear", "/shop?cat=Footwear"], ["Audio", "/shop?cat=Audio"], ["Wearables", "/shop?cat=Wearables"], ["Compare", "/compare"]] },
          { h: "Company", links: [["Journal", "/blog"], ["About", "/blog"], ["Support chat", "/"], ["Order tracking", "/account?tab=orders"]] },
          { h: "Legal", links: [["Privacy Policy", "privacy"], ["Terms", "terms"], ["GDPR", "gdpr"], ["Sitemap", "/"]] },
        ].map((col) => (
          <div key={col.h}>
            <p className="font-mono text-[10px] tracking-[0.25em] text-ink-500 uppercase mb-4">{col.h}</p>
            <ul className="space-y-2.5">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  {to.startsWith("/") ? (
                    <Link to={to} className="text-sm text-ink-300 hover:text-blaze-400 transition-colors">{label}</Link>
                  ) : (
                    <button onClick={() => setPolicy(to)} className="text-sm text-ink-300 hover:text-blaze-400 transition-colors">{label}</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* bottom bar */}
      <div className="border-t border-ink-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] tracking-[0.15em] text-ink-500 uppercase">© {year} VOLTA Supply Co. — {t("footerRights")}</p>
          <div className="flex items-center gap-2">
            {["VISA", "MC", "AMEX", "PayPal", "Razorpay", "UPI"].map((pm) => (
              <span key={pm} className="px-2.5 py-1 border border-ink-700 font-mono text-[9px] tracking-wider text-ink-400">{pm}</span>
            ))}
          </div>
        </div>
      </div>
      <Modal open={!!policy} onClose={() => setPolicy(null)}>
        {policy && (
          <div className="p-8">
            <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 uppercase">VOLTA Legal</p>
            <h3 className="font-display text-2xl font-bold mt-2 mb-5">{POLICIES[policy].title}</h3>
            <div className="space-y-4 text-sm text-ink-300 leading-relaxed">{POLICIES[policy].body.map((p, i) => <p key={i}>{p}</p>)}</div>
          </div>
        )}
      </Modal>
    </footer>
  );
}

export type { Product };
