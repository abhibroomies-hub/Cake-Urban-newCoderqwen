import { useState } from "react";
import { useStore, type Settings } from "../../lib/store";
import { Ic } from "../ui";

export function CmsManager() {
  const store = useStore();
  const { settings, updateSettings, products, updateProduct, toast } = store;

  const [activeSubTab, setActiveSubTab] = useState<"header" | "hero" | "sections" | "featured_bakes">("header");
  
  const [headerState, setHeaderState] = useState(settings.header || {
    brandName: "CakeUrban",
    brandBadge: "100% EGGLESS PURE VEG",
    tagline: "Artisan Eggless Bakehouse & Patisserie",
    announcement: "OVENS ON FROM 6 AM — EXPRESS 30-45 MIN DELIVERY ACROSS FARIDABAD, NOIDA, GURGAON & DELHI NCR",
    showAnnouncement: true,
    hotline: "+91 7318531953",
    whatsappNumber: "+91 7318531953",
    showHotline: true,
    showCityNotice: true,
    cityNotice: "Faridabad · Noida · Gurgaon · Delhi NCR",
    banner: {
      enabled: true,
      text: "FIRST BAKE ON US — GET 15% OFF USE CODE",
      badgeText: "URBAN15",
      linkText: "Order Now",
      linkUrl: "/shop",
    },
  });

  const [heroState, setHeroState] = useState(settings.hero || {
    kicker: "01 — Daily small-batch drops",
    titleA: "Baked at dawn.",
    titleB: "Gone by dusk.",
    sub: "Every bake begins at 6 AM with single-origin Belgian chocolate, cultured butter, and zero artificial preservatives. 100% pure vegetarian & eggless.",
    ctaText: "Order fresh bake",
    ctaLink: "/shop",
    secCtaText: "Explore menu",
    secCtaLink: "/shop",
  });

  const [homeSections, setHomeSections] = useState(settings.homeSections || {
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
  });

  const [featuredSearch, setFeaturedSearch] = useState("");

  const handleSaveHeader = () => {
    updateSettings({
      header: headerState,
      announcement: headerState.announcement,
    });
    toast("success", "Header & Top Bar settings updated live!");
  };

  const handleSaveHero = () => {
    updateSettings({
      hero: heroState,
    });
    toast("success", "Homepage Hero CMS updated live!");
  };

  const handleSaveSections = () => {
    updateSettings({
      homeSections,
    });
    toast("success", "Homepage layout sections saved!");
  };

  return (
    <div className="anim-fade-up space-y-6">
      {/* Top Banner & Sub-Tabs */}
      <div className="p-5 bg-ink-850 border border-ink-700/60 clip-tile">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-ink-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blaze-500 animate-pulse" />
              <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
                Storefront Visual CMS
              </p>
            </div>
            <h2 className="font-display text-xl font-bold uppercase mt-1">
              Header & Homepage Content Manager
            </h2>
            <p className="text-xs text-ink-400 mt-1 max-w-xl">
              Modify store titles, badges, announcements, hero slogans, homepage section ordering, and featured bakes list.
            </p>
          </div>
        </div>

        {/* Sub Navigation Bar */}
        <div className="flex gap-2 pt-4 overflow-x-auto">
          {[
            { id: "header", label: "Header & Branding", icon: Ic.bolt },
            { id: "hero", label: "Hero Banner CMS", icon: Ic.sparkle },
            { id: "sections", label: "Home Section Toggles", icon: Ic.grid },
            { id: "featured_bakes", label: "Featured Products Picker", icon: Ic.tag },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSubTab(item.id as typeof activeSubTab)}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded transition-colors whitespace-nowrap ${
                activeSubTab === item.id
                  ? "bg-blaze-500 text-ink-50 font-bold shadow-md shadow-blaze-500/20"
                  : "bg-ink-900 text-ink-400 hover:text-ink-100 hover:bg-ink-800"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= HEADER & BRANDING TAB ================= */}
      {activeSubTab === "header" && (
        <div className="grid xl:grid-cols-2 gap-5">
          {/* Header Configuration */}
          <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
            <h3 className="font-display font-bold text-base uppercase text-ink-100 flex items-center gap-2">
              <Ic.bolt className="w-4 h-4 text-blaze-500" /> Header Core Identity
            </h3>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                Website / Brand Name
              </label>
              <input
                value={headerState.brandName}
                onChange={(e) => setHeaderState({ ...headerState, brandName: e.target.value })}
                placeholder="e.g. CakeUrban"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-bold font-display rounded"
              />
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                Header Badge Tag (Pill)
              </label>
              <input
                value={headerState.brandBadge}
                onChange={(e) => setHeaderState({ ...headerState, brandBadge: e.target.value })}
                placeholder="e.g. 100% EGGLESS PURE VEG"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                  Customer Hotline Phone
                </label>
                <input
                  value={headerState.hotline}
                  onChange={(e) => setHeaderState({ ...headerState, hotline: e.target.value })}
                  placeholder="+91 7318531953"
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                  WhatsApp Direct Number
                </label>
                <input
                  value={headerState.whatsappNumber}
                  onChange={(e) => setHeaderState({ ...headerState, whatsappNumber: e.target.value })}
                  placeholder="+91 7318531953"
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                Regional Delivery Ticker Notice
              </label>
              <input
                value={headerState.cityNotice}
                onChange={(e) => setHeaderState({ ...headerState, cityNotice: e.target.value })}
                placeholder="Faridabad · Noida · Gurgaon · Delhi NCR"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
              />
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                Top Announcement Marquee Bar
              </label>
              <textarea
                rows={2}
                value={headerState.announcement}
                onChange={(e) => setHeaderState({ ...headerState, announcement: e.target.value })}
                placeholder="OVENS ON FROM 6 AM — EXPRESS 30-45 MIN DELIVERY ACROSS FARIDABAD, NOIDA, GURGAON & DELHI NCR"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded resize-none"
              />
            </div>

            <button
              onClick={handleSaveHeader}
              className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase py-3 font-bold transition-colors shadow-lg shadow-blaze-500/20 flex items-center justify-center gap-2"
            >
              <Ic.check className="w-4 h-4" /> Save Header & Brand Settings
            </button>
          </div>

          {/* Top Promo Banner Settings & Live Header Preview */}
          <div className="space-y-4">
            <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base uppercase text-ink-100">
                  Top Promo Banner (Notification Strip)
                </h3>
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-ink-300">
                  <input
                    type="checkbox"
                    checked={headerState.banner.enabled}
                    onChange={(e) => setHeaderState({
                      ...headerState,
                      banner: { ...headerState.banner, enabled: e.target.checked },
                    })}
                    className="w-4 h-4 accent-blaze-500 rounded"
                  />
                  <span>Active</span>
                </label>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                  Banner Promotional Text
                </label>
                <input
                  value={headerState.banner.text}
                  onChange={(e) => setHeaderState({
                    ...headerState,
                    banner: { ...headerState.banner, text: e.target.value },
                  })}
                  placeholder="FIRST BAKE ON US — GET 15% OFF USE CODE"
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                    Coupon Badge Text
                  </label>
                  <input
                    value={headerState.banner.badgeText}
                    onChange={(e) => setHeaderState({
                      ...headerState,
                      banner: { ...headerState.banner, badgeText: e.target.value },
                    })}
                    placeholder="URBAN15"
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono font-bold text-blaze-400 rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                    Button Target Link
                  </label>
                  <input
                    value={headerState.banner.linkUrl}
                    onChange={(e) => setHeaderState({
                      ...headerState,
                      banner: { ...headerState.banner, linkUrl: e.target.value },
                    })}
                    placeholder="/shop"
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
                  />
                </div>
              </div>
            </div>

            {/* Live Header Preview Card */}
            <div className="border border-ink-700/60 bg-ink-900 p-4 clip-tile space-y-3">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-volt-400 font-bold flex items-center gap-1.5">
                ⚡ Live Visual Mockup
              </p>
              <div className="border border-ink-800 rounded bg-ink-950 p-3 space-y-2">
                {headerState.banner.enabled && (
                  <div className="bg-blaze-500 text-ink-50 text-[10px] font-mono py-1 px-3 flex items-center justify-between">
                    <span>{headerState.banner.text}</span>
                    <span className="bg-ink-950 text-ink-50 px-1.5 py-0.5 rounded font-bold">
                      {headerState.banner.badgeText}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-ink-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-lg text-ink-50">
                      {headerState.brandName}
                    </span>
                    <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 rounded">
                      {headerState.brandBadge}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-ink-400">
                    📞 {headerState.hotline}
                  </span>
                </div>
                <p className="font-mono text-[9px] text-ink-500 truncate">
                  📍 {headerState.cityNotice}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= HERO BANNER CMS TAB ================= */}
      {activeSubTab === "hero" && (
        <div className="grid xl:grid-cols-2 gap-5">
          <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
            <h3 className="font-display font-bold text-base uppercase text-ink-100 flex items-center gap-2">
              <Ic.sparkle className="w-4 h-4 text-blaze-500" /> Homepage Hero Headlines
            </h3>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                Kicker Tag (Small Tracking Title)
              </label>
              <input
                value={heroState.kicker}
                onChange={(e) => setHeroState({ ...heroState, kicker: e.target.value })}
                placeholder="01 — Daily small-batch drops"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                  Main Headline Line 1
                </label>
                <input
                  value={heroState.titleA}
                  onChange={(e) => setHeroState({ ...heroState, titleA: e.target.value })}
                  placeholder="Baked at dawn."
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-sm font-display font-bold rounded"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                  Main Headline Line 2 (Italic Accent)
                </label>
                <input
                  value={heroState.titleB}
                  onChange={(e) => setHeroState({ ...heroState, titleB: e.target.value })}
                  placeholder="Gone by dusk."
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-sm font-display font-bold italic text-blaze-400 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                Hero Subtitle / Description Paragraph
              </label>
              <textarea
                rows={4}
                value={heroState.sub}
                onChange={(e) => setHeroState({ ...heroState, sub: e.target.value })}
                placeholder="Every bake begins at 6 AM with single-origin Belgian chocolate, cultured butter..."
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2.5 text-xs rounded resize-none leading-relaxed"
              />
            </div>

            <button
              onClick={handleSaveHero}
              className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase py-3 font-bold transition-colors shadow-lg shadow-blaze-500/20 flex items-center justify-center gap-2"
            >
              <Ic.check className="w-4 h-4" /> Save & Publish Hero Section
            </button>
          </div>

          {/* Live Hero Preview Card */}
          <div className="border border-ink-700/60 bg-ink-900 p-6 clip-tile flex flex-col justify-center">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-volt-400 font-bold mb-4">
              Live Hero Layout Preview
            </p>
            <div className="border border-ink-800 bg-ink-950 p-6 rounded-lg space-y-4">
              <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-blaze-500">
                {heroState.kicker}
              </p>
              <h1 className="font-display text-3xl font-black uppercase leading-tight">
                {heroState.titleA} <br />
                <span className="italic text-blaze-400">{heroState.titleB}</span>
              </h1>
              <p className="text-xs text-ink-300 leading-relaxed max-w-md">
                {heroState.sub}
              </p>
              <div className="flex gap-3 pt-2">
                <span className="bg-blaze-500 text-ink-50 font-mono text-[10px] uppercase px-4 py-2 rounded font-bold">
                  Order fresh bake
                </span>
                <span className="border border-ink-700 text-ink-300 font-mono text-[10px] uppercase px-4 py-2 rounded">
                  Explore menu
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= HOME SECTION TOGGLES TAB ================= */}
      {activeSubTab === "sections" && (
        <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ink-800">
            <div>
              <h3 className="font-display font-bold text-base uppercase text-ink-100">
                Homepage Structural Modules
              </h3>
              <p className="text-xs text-ink-400">
                Toggle individual homepage sections on or off with instant live reactivity.
              </p>
            </div>

            <button
              onClick={handleSaveSections}
              className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase px-5 py-2.5 font-bold transition-colors"
            >
              Save Section Toggles
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: "hero", label: "Hero Showcase & 3D Model", desc: "Interactive artisan cake visualizer & main CTA" },
              { id: "ticker", label: "Top Announcement Marquee", desc: "Moving real-time baking & delivery ticker" },
              { id: "ncrHubs", label: "Delhi NCR Delivery Hubs", desc: "Express delivery zones (Faridabad, Noida, Gurgaon, Delhi)" },
              { id: "categories", label: "Category Grid Showcase", desc: "Dynamic category cards filtered from category manager" },
              { id: "featured", label: "02 — Signature Selection", desc: "Featured cakes and pastries curated by admin" },
              { id: "standards", label: "03 — Bakehouse Standards", desc: "The numbers we refuse to fudge (Cocoa, Veg, Delivery)" },
              { id: "reviews", label: "04 — Customer Reviews", desc: "4.9 Google verified reviews & star rating wall" },
              { id: "journal", label: "05 — Bake Notes & Journal", desc: "Artisan recipes & sourdough fermentation stories" },
            ].map((sec) => {
              const active = (homeSections as Record<string, boolean>)[sec.id] !== false;
              return (
                <div
                  key={sec.id}
                  onClick={() => {
                    setHomeSections({
                      ...homeSections,
                      [sec.id]: !active,
                    });
                  }}
                  className={`p-4 border rounded cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    active
                      ? "bg-ink-900 border-blaze-500/50 hover:border-blaze-500"
                      : "bg-ink-950 border-ink-800 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div>
                    <p className={`font-semibold text-xs ${active ? "text-ink-100" : "text-ink-400"}`}>
                      {sec.label}
                    </p>
                    <p className="text-[10px] text-ink-500 mt-1 leading-relaxed">
                      {sec.desc}
                    </p>
                  </div>
                  <span
                    className={`w-9 h-5 p-0.5 rounded-full border shrink-0 transition-colors ${
                      active ? "bg-blaze-500/20 border-blaze-500" : "bg-ink-950 border-ink-700"
                    }`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full transition-transform ${
                        active ? "translate-x-4 bg-blaze-500" : "bg-ink-600"
                      }`}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= FEATURED BAKES ON HOMEPAGE PICKER ================= */}
      {activeSubTab === "featured_bakes" && (
        <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-ink-800">
            <div>
              <h3 className="font-display font-bold text-base uppercase text-ink-100 flex items-center gap-2">
                <Ic.tag className="w-4 h-4 text-blaze-500" /> Curate "02 — Signature Selection"
              </h3>
              <p className="text-xs text-ink-400">
                Choose which bakes display on the homepage signature grid. Marked with "FEATURED" or "BEST SELLER" badges.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={featuredSearch}
                onChange={(e) => setFeaturedSearch(e.target.value)}
                placeholder="Search cake name, SKU..."
                className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-1.5 text-xs font-mono w-48 rounded"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {products
              .filter((p) => (p.name + p.category + (p.tag || "")).toLowerCase().includes(featuredSearch.toLowerCase()))
              .map((p) => {
                const isFeatured = (p.tag || "").includes("FEATURED") || (p.tag || "").includes("BEST SELLER");
                return (
                  <div
                    key={p.id}
                    className={`border p-3.5 rounded transition-all flex flex-col justify-between ${
                      isFeatured ? "bg-blaze-500/10 border-blaze-500" : "bg-ink-950 border-ink-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded overflow-hidden bg-ink-900 border border-ink-700 shrink-0">
                        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-bold text-xs truncate text-ink-100">{p.name}</h4>
                        <p className="font-mono text-[10px] text-ink-400 mt-0.5">{p.category} · ${p.price}</p>
                        <span className="inline-block mt-1 bg-ink-900 text-blaze-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-ink-700">
                          {p.tag || "REGULAR"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-ink-800/60 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const newTag = isFeatured ? "100% EGGLESS" : "FEATURED";
                          updateProduct({ ...p, tag: newTag });
                        }}
                        className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors flex-1 text-center ${
                          isFeatured
                            ? "bg-blaze-500 text-ink-50 font-bold border-blaze-500"
                            : "bg-ink-900 text-ink-300 hover:text-ink-50 border-ink-700 hover:border-ink-500"
                        }`}
                      >
                        {isFeatured ? "★ Featured on Home" : "+ Make Featured"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          updateProduct({ ...p, tag: "BEST SELLER" });
                        }}
                        className="text-[9px] font-mono px-2 py-1 bg-gold-400/10 text-gold-400 border border-gold-400/30 rounded hover:bg-gold-400 hover:text-ink-950 transition-colors"
                        title="Mark as Best Seller badge"
                      >
                        Best Seller
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
