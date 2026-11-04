import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { DELHI_NCR_CITIES, getAllSeoAreas, getSeoAreaBySlug, SEO_INTENTS } from "../data/seoLocations";
import { useStore } from "../lib/store";
import { ProductCard } from "../components/product";
import { generateAreaStructuredData } from "../lib/seoHelpers";
import { LandingPinterestCakeSearch } from "./builder";

export function DeliveryLocationsIndex() {
  const allAreas = useMemo(() => getAllSeoAreas(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  useEffect(() => {
    document.title = "Express Cake, Cookie & Hamper Delivery Locations in Delhi NCR | CakeUrban";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Explore CakeUrban express 30-45 mins & 12 AM midnight delivery across 100+ sectors in Faridabad, Gurgaon, Noida, South Delhi & Ghaziabad. 100% pure eggless bakery."
      );
    }
  }, []);

  const filteredAreas = useMemo(() => {
    return allAreas.filter((a) => {
      const matchCity = selectedCity === "all" || a.citySlug === selectedCity;
      const matchSearch =
        searchQuery.trim() === "" ||
        a.areaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.pincode.includes(searchQuery);
      return matchCity && matchSearch;
    });
  }, [allAreas, selectedCity, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-12">
      {/* Compact Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
        <p className="font-mono text-[10px] sm:text-xs tracking-[0.22em] text-cobalt-400 uppercase">
          Delhi NCR Hyperlocal Network · 5 Hubs
        </p>
        <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight mt-2">
          Express Delivery <span className="text-blaze-500">Hubs</span>
        </h1>
        <p className="text-ink-300 text-xs sm:text-sm mt-2 leading-relaxed">
          30–45 min chilled delivery & 12 AM midnight slots across Faridabad, Gurgaon, Noida, Delhi & Ghaziabad.
        </p>
      </div>

      {/* Search & City Filter Bar */}
      <div className="p-3.5 sm:p-5 bg-ink-850 border border-ink-700/60 clip-tile mb-6 sm:mb-10 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search sector, locality or pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink-900 border border-ink-700 text-ink-100 placeholder-ink-400 px-3.5 py-2.5 pl-9 text-xs sm:text-sm clip-tile focus:outline-none focus:border-blaze-500 transition-colors"
          />
          <span className="absolute left-3 top-2.5 text-ink-400 text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-ink-400 hover:text-ink-100"
            >
              ✕
            </button>
          )}
        </div>

        {/* City Filter Pills (Scrollable on Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCity("all")}
            className={`px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-mono tracking-wider uppercase clip-btn transition-colors shrink-0 ${
              selectedCity === "all"
                ? "bg-blaze-500 text-white font-bold"
                : "bg-ink-900 text-ink-300 hover:text-white border border-ink-700"
            }`}
          >
            All ({allAreas.length})
          </button>
          {Object.values(DELHI_NCR_CITIES).map((c) => (
            <button
              key={c.citySlug}
              onClick={() => setSelectedCity(c.citySlug)}
              className={`px-3 sm:px-4 py-2 text-[10px] sm:text-xs font-mono tracking-wider uppercase clip-btn transition-colors shrink-0 ${
                selectedCity === c.citySlug
                  ? "bg-blaze-500 text-white font-bold"
                  : "bg-ink-900 text-ink-300 hover:text-white border border-ink-700"
              }`}
            >
              {c.cityName}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Occasion Landing Intent Shortcuts (Scrollable on Mobile, Grid on Desktop) */}
      <div className="mb-8 sm:mb-10">
        <p className="font-mono text-[10px] text-gold-400 uppercase tracking-widest mb-2.5">
          Quick Occasion & Intent Pages
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {Object.entries(SEO_INTENTS).map(([key, config]) => (
            <Link
              key={key}
              to={`/${config.prefix}/sector-15-faridabad`}
              className="p-2.5 sm:p-3 bg-ink-900 border border-ink-700/70 hover:border-blaze-500 clip-tile text-center group transition-colors"
            >
              <span className="block text-[11px] sm:text-xs font-bold text-ink-100 group-hover:text-blaze-400 transition-colors truncate">
                {config.label}
              </span>
              <span className="block font-mono text-[9px] text-ink-400 mt-0.5 truncate">{config.badge}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Live Pinterest Custom Cake Search & Smart Suggestions on Delivery Locations Hub */}
      <LandingPinterestCakeSearch locationLabel="Delhi NCR (Faridabad, Gurgaon, Noida, Delhi & Ghaziabad)" />

      {/* City Hub Cards */}
      <div className="space-y-6 sm:space-y-10">
        {Object.values(DELHI_NCR_CITIES)
          .filter((c) => selectedCity === "all" || c.citySlug === selectedCity)
          .map((city) => {
            const cityAreas = filteredAreas.filter((a) => a.citySlug === city.citySlug);
            if (cityAreas.length === 0 && searchQuery) return null;

            return (
              <div key={city.citySlug} className="border border-ink-700/60 bg-ink-850 p-4 sm:p-7 clip-tile">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-ink-700/50">
                  <div>
                    <span className="font-mono text-[9px] tracking-[0.2em] text-gold-400 uppercase">
                      Active Express Hub
                    </span>
                    <h2 className="font-display text-xl sm:text-2xl font-bold uppercase mt-0.5">
                      <Link to={`/cakes-in/${city.citySlug}`} className="hover:text-blaze-400 transition-colors">
                        {city.cityName} Delivery Hub
                      </Link>
                    </h2>
                    <p className="text-xs text-ink-300 mt-1 line-clamp-1 sm:line-clamp-2 max-w-2xl">
                      {city.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to={`/cookies-${city.citySlug}`}
                      className="font-mono text-[10px] tracking-wider uppercase px-3 py-2 bg-ink-900 border border-ink-700 hover:border-gold-400 text-gold-400 clip-tag transition-colors"
                    >
                      Cookies & Hampers
                    </Link>
                    <Link
                      to={`/cakes-in/${city.citySlug}`}
                      className="font-mono text-[10px] sm:text-xs tracking-wider uppercase px-4 py-2 bg-cobalt-500 hover:bg-cobalt-400 text-ink-50 clip-btn transition-colors"
                    >
                      {city.cityName} Hub →
                    </Link>
                  </div>
                </div>

                {/* 2-Column Mobile Grid of Sectors */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 pt-4">
                  {cityAreas.map((area) => (
                    <Link
                      key={area.slug}
                      to={`/cake-delivery-in/${area.slug}`}
                      className="group p-3 sm:p-4 bg-ink-900 border border-ink-700/80 hover:border-blaze-500/60 transition-all clip-tile flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-xs sm:text-sm text-ink-50 group-hover:text-blaze-400 transition-colors truncate">
                          {area.areaName}
                        </p>
                        <p className="font-mono text-[9px] sm:text-[10px] text-ink-400 mt-0.5 truncate">
                          ⚡ {area.sla} · {area.pincode}
                        </p>
                      </div>
                      <span className="text-ink-500 group-hover:text-blaze-400 transition-colors font-mono text-xs shrink-0">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export function CityHubPage() {
  const { citySlug } = useParams<{ citySlug: string }>();
  const city = citySlug ? DELHI_NCR_CITIES[citySlug] : undefined;
  const navigate = useNavigate();
  const { products } = useStore();

  useEffect(() => {
    if (city) {
      document.title = city.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", city.metaDesc);
    }
  }, [city]);

  if (!city) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase">City Hub Not Found</h1>
        <button
          onClick={() => navigate("/delivery-locations")}
          className="mt-5 px-6 py-3 bg-blaze-500 text-ink-50 font-mono text-xs uppercase clip-btn"
        >
          View All Locations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-ink-400 uppercase tracking-wider mb-4">
        <Link to="/" className="hover:text-ink-200">Home</Link>
        <span>/</span>
        <Link to="/delivery-locations" className="hover:text-ink-200">NCR Hubs</Link>
        <span>/</span>
        <span className="text-blaze-400">{city.cityName}</span>
      </nav>

      {/* Compact Hero Header */}
      <div className="border border-ink-700/60 bg-ink-850 p-5 sm:p-10 clip-tile mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blaze-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="font-mono text-[10px] tracking-[0.22em] text-gold-400 uppercase">
          ⚡ 30–45 Mins Express & 12 AM Midnight Hub
        </span>
        <h1 className="font-display text-2xl sm:text-5xl font-black uppercase tracking-tight mt-2">
          Cake & Hamper Delivery in <span className="text-blaze-500">{city.cityName}</span>
        </h1>
        <p className="text-ink-300 text-xs sm:text-base mt-2.5 max-w-2xl leading-relaxed">
          {city.description}
        </p>
        <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-5">
          <Link
            to="/shop"
            className="px-5 py-2.5 sm:py-3 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-wider uppercase clip-btn font-bold transition-colors"
          >
            Order Fresh Now →
          </Link>
          <Link
            to={`/cookies-${city.citySlug}`}
            className="px-4 py-2.5 sm:py-3 bg-ink-900 border border-ink-700 text-gold-400 hover:border-gold-400 font-mono text-xs tracking-wider uppercase clip-btn transition-colors"
          >
            {city.cityName} Cookies & Hampers
          </Link>
        </div>
      </div>

      {/* Live Pinterest Custom Cake Search & Smart Suggestions for this City Hub */}
      <LandingPinterestCakeSearch locationLabel={city.cityName} />

      {/* Top Selling Products in this City */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">
            Bestsellers in {city.cityName}
          </h2>
          <Link to="/shop" className="font-mono text-xs text-blaze-400 hover:underline">
            View Menu →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-5">
          {products.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>

      {/* Sectors & Areas Grid (2-col on Mobile) */}
      <div id="areas">
        <div className="mb-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-cobalt-400 uppercase">Local Coverage</p>
          <h2 className="font-display text-xl sm:text-3xl font-bold uppercase mt-0.5">
            Sectors & Localities in {city.cityName} ({city.areas.length})
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
          {city.areas.map((area) => (
            <Link
              key={area.slug}
              to={`/cake-delivery-in/${area.slug}`}
              className="p-3.5 sm:p-5 bg-ink-850 border border-ink-700/80 hover:border-blaze-500/60 transition-all clip-tile group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-mono text-[9px] bg-ink-900 px-2 py-0.5 text-gold-400 border border-ink-700">
                    PIN {area.pincode}
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">⚡ {area.sla}</span>
                </div>
                <h3 className="font-display text-sm sm:text-lg font-bold uppercase group-hover:text-blaze-400 transition-colors truncate">
                  {area.areaName}
                </h3>
                <p className="text-[11px] sm:text-xs text-ink-400 mt-1 line-clamp-1">
                  Near {area.landmarks.slice(0, 2).join(", ")}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-ink-700/50 flex items-center justify-between font-mono text-[10px] text-blaze-400">
                <span>Explore</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AreaLandingPage({ intent = "standard", overrideSlug }: { intent?: string; overrideSlug?: string }) {
  const { areaSlug, seoSlug } = useParams<{ areaSlug?: string; seoSlug?: string }>();
  const effectiveSlug = overrideSlug || areaSlug || seoSlug;
  const location = useLocation();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [showLocalDetails, setShowLocalDetails] = useState(false);

  const detectedIntent = useMemo(() => {
    const path = location.pathname;
    for (const [key, config] of Object.entries(SEO_INTENTS)) {
      if (path.startsWith(`/${config.prefix}/`)) return key;
    }
    return intent;
  }, [location.pathname, intent]);

  const area = useMemo(() => {
    if (!effectiveSlug) return undefined;
    return getSeoAreaBySlug(effectiveSlug, detectedIntent);
  }, [effectiveSlug, detectedIntent]);

  const navigate = useNavigate();
  const { products } = useStore();
  const [viewMode, setViewMode] = useState<"grid" | "reel">("grid");
  const reelRef = useRef<HTMLDivElement>(null);

  const scrollReel = (dir: "left" | "right") => {
    if (reelRef.current) {
      reelRef.current.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (area) {
      document.title = area.title;
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", area.metaDesc);

      const scriptId = "jsonld-local-business";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script") as HTMLScriptElement;
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(
        generateAreaStructuredData(area, {
          siteUrl: window.location.origin,
          currentPath: location.pathname,
        })
      );
    }
  }, [area, location.pathname]);

  if (!area) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase">Area Not Found</h1>
        <button
          onClick={() => navigate("/delivery-locations")}
          className="mt-5 px-6 py-3 bg-blaze-500 text-ink-50 font-mono text-xs uppercase clip-btn"
        >
          View All Delivery Locations
        </button>
      </div>
    );
  }

  const curatedCakes = useMemo(() => {
    if (detectedIntent === "eggless") {
      return products.slice(0, 6);
    }
    if (detectedIntent === "chocolate") {
      return products
        .filter(
          (p) =>
            p.name.toLowerCase().includes("choc") ||
            p.desc.toLowerCase().includes("chocolate") ||
            p.category === "Cookies"
        )
        .slice(0, 6);
    }
    return products.slice(0, 6);
  }, [products, detectedIntent]);

  const siblingAreas = useMemo(() => {
    const cityObj = DELHI_NCR_CITIES[area.citySlug];
    return cityObj ? cityObj.areas.filter((a) => a.slug !== area.slug).slice(0, 8) : [];
  }, [area]);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-[10px] text-ink-400 uppercase tracking-wider mb-3 flex-wrap">
        <Link to="/" className="hover:text-ink-200">Home</Link>
        <span>/</span>
        <Link to="/delivery-locations" className="hover:text-ink-200">Locations</Link>
        <span>/</span>
        <Link to={`/cakes-in/${area.citySlug}`} className="hover:text-ink-200">{area.cityName}</Link>
        <span>/</span>
        <span className="text-blaze-400">{area.areaName}</span>
      </nav>

      {/* Intent Navigation Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {Object.entries(SEO_INTENTS).map(([key, config]) => {
          const isActive = detectedIntent === key;
          const targetUrl = `/${config.prefix}/${area.slug}`;
          return (
            <Link
              key={key}
              to={targetUrl}
              className={`px-3 py-1.5 whitespace-nowrap text-[10px] sm:text-xs font-mono tracking-wider uppercase clip-btn transition-colors shrink-0 ${
                isActive
                  ? "bg-blaze-500 text-white font-bold"
                  : "bg-ink-850 text-ink-300 hover:text-white border border-ink-700/70"
              }`}
            >
              {config.label}
            </Link>
          );
        })}
      </div>

      {/* Compact Landing Banner */}
      <div className="border border-ink-700/60 bg-ink-850 p-4 sm:p-8 clip-tile mb-8 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span className="font-mono text-[10px] tracking-[0.18em] bg-blaze-500/20 text-blaze-400 border border-blaze-500/30 px-2.5 py-0.5 uppercase">
            {area.intentBadge || "⚡ Express Dispatch"}
          </span>
          <span className="font-mono text-[10px] text-ink-400">
            {area.cityName} · PIN {area.pincode}
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
          {area.title.split("|")[0]}
        </h1>

        <p className="text-ink-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
          {area.metaDesc}
        </p>

        {/* Compact 4-Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mt-5 pt-4 border-t border-ink-700/50">
          <div className="bg-ink-900/70 p-2.5 rounded border border-ink-800">
            <p className="font-mono text-[9px] text-ink-400 uppercase">Express ETA</p>
            <p className="font-display text-sm sm:text-lg font-bold text-emerald-400 mt-0.5">⚡ {area.sla}</p>
          </div>
          <div className="bg-ink-900/70 p-2.5 rounded border border-ink-800">
            <p className="font-mono text-[9px] text-ink-400 uppercase">Midnight Slot</p>
            <p className="font-display text-sm sm:text-lg font-bold text-ink-100 mt-0.5">🌙 11 PM–12:15 AM</p>
          </div>
          <div className="bg-ink-900/70 p-2.5 rounded border border-ink-800">
            <p className="font-mono text-[9px] text-ink-400 uppercase">Freshness</p>
            <p className="font-display text-sm sm:text-lg font-bold text-gold-400 mt-0.5">Baked to Order</p>
          </div>
          <div className="bg-ink-900/70 p-2.5 rounded border border-ink-800">
            <p className="font-mono text-[9px] text-ink-400 uppercase">Dietary</p>
            <p className="font-display text-sm sm:text-lg font-bold text-ink-100 mt-0.5">🌱 100% Eggless</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 mt-5">
          <Link
            to="/shop"
            className="px-5 py-2.5 sm:py-3 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-wider uppercase clip-btn font-bold transition-colors"
          >
            Order Now →
          </Link>
          <Link
            to="/builder"
            className="px-4 py-2.5 sm:py-3 bg-ink-900 border border-ink-700 text-ink-200 hover:text-ink-50 font-mono text-xs tracking-wider uppercase clip-btn transition-colors"
          >
            3D Custom Cake Studio
          </Link>
        </div>
      </div>

      {/* Live Pinterest Custom Cake Search & Smart Suggestions for Every Area/Programmatic Landing Page */}
      <LandingPinterestCakeSearch
        initialQuery={
          area.intentBadge && area.intentBadge.startsWith("🎂 ")
            ? area.intentBadge.replace(/^🎂\s*/, "").replace(/\s+Cakes?$/i, " Cake")
            : detectedIntent === "birthday"
            ? "Birthday Cake"
            : detectedIntent === "anniversary" || detectedIntent === "eggless"
            ? "Anniversary Cake"
            : ""
        }
        locationLabel={`${area.areaName}, ${area.cityName}`}
      />

      {/* Featured Products Grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] text-cobalt-400 uppercase">
              Ready for {area.areaName}
            </p>
            <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">
              Express Menu ({area.sla})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-ink-900 border border-ink-700/80 rounded p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                  viewMode === "grid" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400"
                }`}
              >
                ⊞ Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode("reel")}
                className={`px-2 py-1 text-[10px] font-mono rounded transition-colors ${
                  viewMode === "reel" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400"
                }`}
              >
                ⇆ Reel
              </button>
            </div>
          </div>
        </div>

        {viewMode === "reel" ? (
          <div className="relative">
            <div className="flex items-center justify-between text-[11px] font-mono text-ink-400 mb-2">
              <span>👉 Swipe left / right</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => scrollReel("left")}
                  className="w-7 h-7 rounded border border-ink-700 bg-ink-900 text-ink-200 grid place-items-center"
                >
                  ←
                </button>
                <button
                  onClick={() => scrollReel("right")}
                  className="w-7 h-7 rounded border border-ink-700 bg-ink-900 text-ink-200 grid place-items-center"
                >
                  →
                </button>
              </div>
            </div>
            <div
              ref={reelRef}
              className="flex gap-3 overflow-x-auto pb-3 pt-1 smooth-scroll no-scrollbar snap-x-mandatory"
            >
              {curatedCakes.map((cake, i) => (
                <div key={cake.id} className="w-[180px] sm:w-[240px] shrink-0 snap-item">
                  <ProductCard p={cake} index={i} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-5">
            {curatedCakes.map((cake, i) => (
              <ProductCard key={cake.id} p={cake} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Locality Landmarks, FAQs & Nearby SEO Links (Clean on UI, Rich for Search Crawlers) */}
      <div className="space-y-4">
        {/* Landmarks & Highlights Accordion */}
        <div className="border border-ink-700/70 bg-ink-850 clip-tile overflow-hidden">
          <button
            type="button"
            onClick={() => setShowLocalDetails((v) => !v)}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-ink-800/50 transition-colors"
          >
            <div>
              <span className="font-mono text-[10px] text-gold-400 uppercase tracking-wider block">
                Local Landmarks & Coverage
              </span>
              <h3 className="font-display text-sm sm:text-lg font-bold uppercase text-ink-50">
                Delivery Coverage in {area.areaName} (PIN {area.pincode})
              </h3>
            </div>
            <span className="font-mono text-xs text-blaze-400">{showLocalDetails ? "−" : "+"}</span>
          </button>

          {showLocalDetails && (
            <div className="px-4 sm:px-5 pb-5 border-t border-ink-800 pt-4 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {area.landmarks.map((l, i) => (
                  <span key={i} className="px-2.5 py-1 bg-ink-900 border border-ink-700 text-xs text-ink-200">
                    📍 {l}
                  </span>
                ))}
              </div>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-ink-300">
                {area.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blaze-400 font-bold">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
              {siblingAreas.length > 0 && (
                <div className="pt-3 border-t border-ink-800">
                  <p className="font-mono text-[10px] text-ink-400 uppercase mb-2">
                    Nearby Sectors in {area.cityName}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {siblingAreas.map((sib) => (
                      <Link
                        key={sib.slug}
                        to={`/cake-delivery-in/${sib.slug}`}
                        className="px-2.5 py-1 bg-ink-900 hover:border-blaze-500 border border-ink-700 font-mono text-[10px] text-ink-300 hover:text-blaze-400 transition-colors"
                      >
                        {sib.areaName}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dedicated Video Watch Section for Google Search Console Video Indexing */}
        <div id="watch-video" className="p-4 sm:p-6 bg-ink-850 border border-ink-700/70 clip-tile">
          <div className="flex flex-col md:flex-row gap-5 items-center">
            <div className="w-full md:w-72 shrink-0 overflow-hidden border border-ink-700 bg-ink-950 clip-tile relative">
              <video
                controls
                preload="metadata"
                poster="https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png"
                className="w-full aspect-video object-cover"
              >
                <source
                  src="https://assets.mixkit.co/videos/preview/mixkit-confectioner-decorating-a-chocolate-cake-41444-large.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
            <div className="flex-1">
              <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-400 uppercase">
                ▶ Watch Kitchen & Cold-Chain Dispatch
              </span>
              <h3 className="font-display text-base sm:text-xl font-bold uppercase mt-1">
                How CakeUrban Bakes & Delivers 100% Eggless Cakes in {area.areaName}, {area.cityName}
              </h3>
              <p className="text-xs text-ink-300 leading-relaxed mt-1.5">
                Watch our patisserie chefs hand-pipe Belgian chocolate ganache and pack every order inside 4°C chilled
                insulated boxes for {area.sla} express delivery across {area.areaName} (PIN {area.pincode}).
              </p>
            </div>
          </div>
        </div>

        {/* Compact Accordion FAQs */}
        <div className="p-4 sm:p-6 bg-ink-850 border border-ink-700/70 clip-tile">
          <h3 className="font-display text-base sm:text-xl font-bold uppercase mb-3">
            {area.areaName} Delivery FAQs
          </h3>
          <div className="divide-y divide-ink-800">
            {area.faqs.map((faq, i) => (
              <div key={i} className="py-2.5">
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                  className="w-full flex items-center justify-between gap-3 text-left font-display font-semibold text-xs sm:text-sm text-ink-100 hover:text-blaze-400"
                >
                  <span>{faq.q}</span>
                  <span className="font-mono text-blaze-400 shrink-0">{openFaqIdx === i ? "−" : "+"}</span>
                </button>
                {openFaqIdx === i && (
                  <p className="text-xs text-ink-300 leading-relaxed mt-2">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
