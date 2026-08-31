import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { StoreProvider, useStore } from "./lib/store";
import { AuthProvider, Header, CartDrawer, ChatWidget, WhatsAppWidget, CookieConsent, Toasts, Footer, MobileBottomNav } from "./components/chrome";
import { QuickViewProvider, CompareOverlay } from "./components/product";
import { Ic, ImgX } from "./components/ui";
import Home from "./pages/home";
import Shop, { WishlistPage } from "./pages/shop";
import ProductPage from "./pages/product";
import Checkout from "./pages/checkout";
import Account from "./pages/account";
import Admin from "./pages/admin";
import { BlogList, BlogPost } from "./pages/blog";
import About from "./pages/about";
import Contact from "./pages/contact";
import CustomBuilder from "./pages/builder";
import PolicyPage from "./pages/policies";
import { DeliveryLocationsIndex, CityHubPage, AreaLandingPage } from "./pages/local-seo";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [pathname]);
  return null;
}

function CompareTray({ onOpen }: { onOpen: () => void }) {
  const { compare, products, clearCompare, fmt } = useStore();
  if (compare.length === 0) return null;
  const items = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[72] anim-fade-up">
      <div className="flex items-center gap-3 bg-ink-900/95 backdrop-blur border border-cobalt-500/50 shadow-lift clip-btn pl-3 pr-2 py-2">
        <div className="flex -space-x-2">
          {items.map((p) => p && (
            <span key={p.id} title={p.name} className="w-10 h-10 clip-tag overflow-hidden border-2 border-ink-900 bg-ink-850">
              <ImgX src={p.img} alt={p.name} className="w-full h-full object-cover" style={p.imgFilter ? { filter: p.imgFilter } : undefined} />
            </span>
          ))}
        </div>
        <span className="hidden sm:block font-mono text-[10px] tracking-[0.15em] uppercase text-ink-300">
          {items.length}/4 · {fmt(Math.min(...items.map((p) => p?.price ?? 0)))}+
        </span>
        <button onClick={onOpen} className="clip-tag bg-cobalt-500 hover:bg-cobalt-400 text-ink-50 font-mono text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 transition-colors flex items-center gap-2">
          <Ic.scale className="w-3.5 h-3.5" /> Compare
        </button>
        <button onClick={clearCompare} aria-label="Clear compare" className="p-2 text-ink-400 hover:text-danger-400 transition-colors"><Ic.x className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const nav = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCart={() => setCartOpen(true)} onCompare={() => setCompareOpen(true)} />
      <main className="flex-1 pb-20 md:pb-0" key={location.pathname}>
        <div className="page-enter">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage onAddToCartFlow={() => setCartOpen(true)} />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/builder" element={<CustomBuilder />} />
            <Route path="/policy/:type" element={<PolicyPage />} />
            <Route path="/delivery-locations" element={<DeliveryLocationsIndex />} />
            <Route path="/cakes-in/:citySlug" element={<CityHubPage />} />
            <Route path="/cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="standard" />} />
            <Route path="/midnight-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="midnight" />} />
            <Route path="/birthday-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="birthday" />} />
            <Route path="/eggless-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="eggless" />} />
            <Route path="/anniversary-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="anniversary" />} />
            <Route path="/photo-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="photo" />} />
            <Route path="/custom-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="custom" />} />
            <Route path="/chocolate-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="chocolate" />} />
            <Route path="/pinata-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="pinata" />} />
            <Route path="/same-day-cake-delivery-in/:areaSlug" element={<AreaLandingPage intent="same-day" />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <MobileBottomNav onCart={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); nav("/checkout"); }} />
      <CompareTray onOpen={() => setCompareOpen(true)} />
      <CompareOverlay open={compareOpen} onClose={() => { setCompareOpen(false); if (location.pathname === "/compare") nav("/shop"); }} />
      <ChatWidget />
      <WhatsAppWidget />
      <CookieConsent />
      <Toasts />
    </div>
  );
}

function ComparePage() {
  const { compare, products, fmt, toggleCompare, cartAdd, t, clearCompare } = useStore();
  const list = compare.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-cobalt-400">SIDE BY SIDE</p>
          <h1 className="font-display text-4xl font-black uppercase mt-2">{t("compare")} <span className="font-mono text-base text-ink-500">({list.length}/4)</span></h1>
        </div>
        {list.length > 0 && <button onClick={clearCompare} className="font-mono text-xs tracking-[0.15em] uppercase text-ink-400 hover:text-danger-400 transition-colors">{t("clearAll")}</button>}
      </div>
      {list.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-ink-700">
          <Ic.scale className="w-12 h-12 mx-auto text-ink-600 mb-4" />
          <p className="font-display font-bold uppercase">Tray is empty</p>
          <p className="text-sm text-ink-400 mt-2">Add up to 4 products with the ⇄ icon on any card.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {list.map((p) => p && (
            <div key={p.id} className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
              <div className="relative">
                <ImgX src={p.img} alt={p.name} className="w-full aspect-square object-cover" style={p.imgFilter ? { filter: p.imgFilter } : undefined} />
                <button onClick={() => toggleCompare(p.id)} className="absolute top-3 right-3 p-1.5 bg-ink-950/85 border border-ink-600 text-ink-300 hover:text-danger-400 hover:border-danger-400 transition-colors"><Ic.x className="w-4 h-4" /></button>
              </div>
              <div className="p-5">
                <p className="font-mono text-[9px] tracking-[0.2em] text-ink-500 uppercase">{p.brand}</p>
                <p className="font-display font-semibold mt-1 leading-snug">{p.name}</p>
                <p className="font-mono tabnum text-xl font-bold mt-2">{fmt(p.price)}</p>
                <p className="font-mono text-[11px] text-gold-400 mt-1">★ {p.rating.toFixed(1)} · {p.stock} in stock</p>
                <button onClick={() => cartAdd(p.id, p.colors[0].name, p.sizes[0])} className="clip-btn w-full mt-4 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.18em] uppercase py-3 transition-colors">{t("addToCart")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <QuickViewProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Shell />
          </BrowserRouter>
        </QuickViewProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
