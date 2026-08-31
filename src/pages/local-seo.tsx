import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { DELHI_NCR_CITIES, getAllSeoAreas, getSeoAreaBySlug, SEO_INTENTS, AreaData, CityHubData } from "../data/seoLocations";
import { useStore } from "../lib/store";
import { Ic, ImgX } from "../components/ui";
import { generateAreaStructuredData } from "../lib/seoHelpers";

export function DeliveryLocationsIndex() {
  const { fmt } = useStore();
  const allAreas = useMemo(() => getAllSeoAreas(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");

  useEffect(() => {
    document.title = "Express Cake Delivery Locations in Delhi NCR | CakeUrban";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Explore our express cake delivery coverage across Faridabad, Gurgaon, Noida, Delhi & Ghaziabad. 30-45 mins delivery & midnight specials across 100+ sectors.");
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
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <p className="font-mono text-xs tracking-[0.25em] text-cobalt-400 uppercase">Delhi NCR Hyper-Local Network</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mt-3">
          Express Cake Delivery <span className="text-blaze-500">Locations</span>
        </h1>
        <p className="text-ink-300 text-sm sm:text-base mt-4 leading-relaxed">
          We bake fresh on order and deliver across all major localities, high-rises, and corporate hubs in Delhi, Gurgaon, Noida, Faridabad & Ghaziabad with 30–45 minute express slots and guaranteed 12 AM midnight deliveries.
        </p>
      </div>

      {/* Search & City Filter Bar */}
      <div className="p-6 bg-ink-850 border border-ink-700/60 clip-tile mb-12 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by sector, locality or pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink-900 border border-ink-700 text-ink-100 placeholder-ink-400 px-4 py-3 pl-10 text-sm clip-tile focus:outline-none focus:border-blaze-500 transition-colors"
          />
          <span className="absolute left-3.5 top-3.5 text-ink-400">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-xs text-ink-400 hover:text-ink-100"
            >
              ✕
            </button>
          )}
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedCity("all")}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase clip-btn transition-colors ${
              selectedCity === "all" ? "bg-blaze-500 text-white" : "bg-ink-900 text-ink-300 hover:text-white border border-ink-700"
            }`}
          >
            All Cities ({allAreas.length})
          </button>
          {Object.values(DELHI_NCR_CITIES).map((c) => (
            <button
              key={c.citySlug}
              onClick={() => setSelectedCity(c.citySlug)}
              className={`px-4 py-2 text-xs font-mono tracking-wider uppercase clip-btn transition-colors ${
                selectedCity === c.citySlug ? "bg-blaze-500 text-white" : "bg-ink-900 text-ink-300 hover:text-white border border-ink-700"
              }`}
            >
              {c.cityName}
            </button>
          ))}
        </div>
      </div>

      {/* Popular Occasion Landing Intent Shortcuts */}
      <div className="mb-12">
        <p className="font-mono text-xs text-gold-400 uppercase tracking-widest mb-3">Popular Landing Page Categories</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(SEO_INTENTS).map(([key, config]) => (
            <Link
              key={key}
              to={`/${config.prefix}/sector-15-faridabad`}
              className="p-3 bg-ink-900 border border-ink-700/70 hover:border-blaze-500 clip-tile text-center group transition-colors"
            >
              <span className="block text-xs font-bold text-ink-100 group-hover:text-blaze-400 transition-colors">
                {config.label}
              </span>
              <span className="block font-mono text-[10px] text-ink-400 mt-1">{config.badge}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* City Hub Cards */}
      <div className="space-y-12">
        {Object.values(DELHI_NCR_CITIES)
          .filter((c) => selectedCity === "all" || c.citySlug === selectedCity)
          .map((city) => {
            const cityAreas = filteredAreas.filter((a) => a.citySlug === city.citySlug);
            if (cityAreas.length === 0 && searchQuery) return null;

            return (
              <div key={city.citySlug} className="border border-ink-700/60 bg-ink-850 p-6 sm:p-8 clip-tile">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-700/50">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase">Hub & Districts</span>
                    <h2 className="font-display text-2xl font-bold uppercase mt-1">
                      <Link to={`/cakes-in/${city.citySlug}`} className="hover:text-blaze-400 transition-colors">
                        Cake Delivery in {city.cityName}
                      </Link>
                    </h2>
                    <p className="text-sm text-ink-300 mt-1 max-w-2xl">{city.description}</p>
                  </div>
                  <Link
                    to={`/cakes-in/${city.citySlug}`}
                    className="self-start sm:self-center font-mono text-xs tracking-[0.15em] uppercase px-5 py-2.5 bg-cobalt-500 hover:bg-cobalt-400 text-ink-50 clip-btn transition-colors shrink-0"
                  >
                    View {city.cityName} Hub →
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
                  {cityAreas.map((area) => (
                    <Link
                      key={area.slug}
                      to={`/cake-delivery-in/${area.slug}`}
                      className="group p-4 bg-ink-900 border border-ink-700/80 hover:border-blaze-500/60 transition-all clip-tile flex items-center justify-between"
                    >
                      <div>
                        <p className="font-display font-semibold text-ink-50 group-hover:text-blaze-400 transition-colors">
                          {area.areaName}
                        </p>
                        <p className="font-mono text-[10px] text-ink-400 mt-0.5">
                          SLA: {area.sla} · PIN: {area.pincode}
                        </p>
                      </div>
                      <span className="text-ink-500 group-hover:text-blaze-400 transition-colors font-mono text-sm">→</span>
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

  useEffect(() => {
    if (city) {
      document.title = city.title;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", city.metaDesc);
    }
  }, [city]);

  if (!city) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold uppercase">City Hub Not Found</h1>
        <p className="text-ink-400 mt-2">The location you are looking for is being expanded or has been moved.</p>
        <button onClick={() => navigate("/delivery-locations")} className="mt-6 px-6 py-3 bg-blaze-500 text-ink-50 font-mono text-xs uppercase clip-btn">
          View All Locations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-ink-400 uppercase tracking-wider mb-6">
        <Link to="/" className="hover:text-ink-200">Home</Link>
        <span>/</span>
        <Link to="/delivery-locations" className="hover:text-ink-200">Locations</Link>
        <span>/</span>
        <span className="text-blaze-400">{city.cityName}</span>
      </div>

      {/* Hero Header */}
      <div className="border border-ink-700/60 bg-ink-850 p-8 sm:p-12 clip-tile mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blaze-500/10 rounded-full blur-3xl pointer-events-none" />
        <span className="font-mono text-xs tracking-[0.25em] text-gold-400 uppercase">Delhi NCR Hub</span>
        <h1 className="font-display text-4xl sm:text-6xl font-black uppercase tracking-tight mt-3">
          Cake Delivery in <span className="text-blaze-500">{city.cityName}</span>
        </h1>
        <p className="text-ink-300 text-base sm:text-lg mt-4 max-w-3xl leading-relaxed">
          {city.description}
        </p>
        <div className="flex flex-wrap gap-4 mt-8">
          <Link to="/shop" className="px-6 py-3.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.18em] uppercase clip-btn transition-colors">
            Order Fresh Cakes Now
          </Link>
          <a href="#areas" className="px-6 py-3.5 bg-ink-900 border border-ink-700 text-ink-200 hover:text-ink-50 font-mono text-xs tracking-[0.18em] uppercase clip-btn transition-colors">
            Explore All Sectors ({city.areas.length})
          </a>
        </div>
      </div>

      {/* Areas Grid */}
      <div id="areas" className="mb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-cobalt-400 uppercase">Popular Localities</p>
            <h2 className="font-display text-3xl font-bold uppercase mt-1">Sectors & Areas in {city.cityName}</h2>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {city.areas.map((area) => (
            <Link
              key={area.slug}
              to={`/cake-delivery-in/${area.slug}`}
              className="p-6 bg-ink-850 border border-ink-700/80 hover:border-blaze-500/60 transition-all clip-tile group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-[0.15em] bg-ink-900 px-3 py-1 text-gold-400 border border-ink-700">
                    PIN {area.pincode}
                  </span>
                  <span className="font-mono text-xs text-emerald-400">⚡ {area.sla}</span>
                </div>
                <h3 className="font-display text-xl font-bold uppercase group-hover:text-blaze-400 transition-colors">
                  {area.areaName}
                </h3>
                <p className="text-sm text-ink-300 mt-2 line-clamp-2">
                  Fresh birthday cakes, midnight surprise delivery & custom designer creations near {area.landmarks.join(", ")}.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-ink-700/50 flex items-center justify-between font-mono text-xs text-blaze-400">
                <span>View Area Details</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AreaLandingPage({ intent = "standard" }: { intent?: string }) {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  const location = useLocation();
  
  // Detect intent from pathname if not passed as prop
  const detectedIntent = useMemo(() => {
    const path = location.pathname;
    for (const [key, config] of Object.entries(SEO_INTENTS)) {
      if (path.startsWith(`/${config.prefix}/`)) return key;
    }
    return intent;
  }, [location.pathname, intent]);

  const area = useMemo(() => {
    if (!areaSlug) return undefined;
    return getSeoAreaBySlug(areaSlug, detectedIntent);
  }, [areaSlug, detectedIntent]);

  const navigate = useNavigate();
  const { products, fmt, cartAdd } = useStore();

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

      // Inject JSON-LD Schema Graph
      const scriptId = "jsonld-local-business";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script") as HTMLScriptElement;
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(generateAreaStructuredData(area));
    }
  }, [area]);

  if (!area) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold uppercase">Area Not Found</h1>
        <p className="text-ink-400 mt-2">The delivery location you searched for is currently unmapped.</p>
        <button onClick={() => navigate("/delivery-locations")} className="mt-6 px-6 py-3 bg-blaze-500 text-ink-50 font-mono text-xs uppercase clip-btn">
          View All Delivery Locations
        </button>
      </div>
    );
  }

  // Filter or prioritize products based on intent
  const curatedCakes = useMemo(() => {
    if (detectedIntent === "eggless") {
      return products.filter((p) => p.name.toLowerCase().includes("eggless") || p.tag?.toLowerCase().includes("eggless") || p.desc.toLowerCase().includes("eggless")).slice(0, 6);
    }
    if (detectedIntent === "chocolate") {
      return products.filter((p) => p.name.toLowerCase().includes("chocolate") || p.name.toLowerCase().includes("noir") || p.desc.toLowerCase().includes("chocolate") || p.desc.toLowerCase().includes("truffle")).slice(0, 6);
    }
    return products.slice(0, 6);
  }, [products, detectedIntent]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 font-mono text-[11px] text-ink-400 uppercase tracking-wider mb-6 flex-wrap">
        <Link to="/" className="hover:text-ink-200">Home</Link>
        <span>/</span>
        <Link to="/delivery-locations" className="hover:text-ink-200">Locations</Link>
        <span>/</span>
        <Link to={`/cakes-in/${area.citySlug}`} className="hover:text-ink-200">{area.cityName}</Link>
        <span>/</span>
        <span className="text-blaze-400">{area.areaName}</span>
      </div>

      {/* Intent Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {Object.entries(SEO_INTENTS).map(([key, config]) => {
          const isActive = detectedIntent === key;
          const targetUrl = `/${config.prefix}/${area.slug}`;
          return (
            <Link
              key={key}
              to={targetUrl}
              className={`px-4 py-2 whitespace-nowrap text-xs font-mono tracking-wider uppercase clip-btn transition-colors ${
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

      {/* Main Landing Banner */}
      <div className="border border-ink-700/60 bg-ink-850 p-8 sm:p-12 clip-tile mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blaze-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono text-xs tracking-[0.2em] bg-blaze-500/20 text-blaze-400 border border-blaze-500/30 px-3 py-1 uppercase">
            {area.intentBadge || "⚡ Express Dispatch"}
          </span>
          <span className="font-mono text-xs text-ink-400">
            {area.cityName} Hub · PIN {area.pincode}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight">
          {area.title.split("|")[0]}
        </h1>

        <p className="text-ink-300 text-base sm:text-lg mt-4 max-w-3xl leading-relaxed">
          {area.metaDesc}
        </p>

        {/* SLA & Feature Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-ink-700/50">
          <div>
            <p className="font-mono text-[10px] text-ink-400 uppercase">Delivery Window</p>
            <p className="font-display text-xl font-bold text-emerald-400 mt-0.5">⚡ {area.sla}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-ink-400 uppercase">Midnight Slot</p>
            <p className="font-display text-xl font-bold text-ink-100 mt-0.5">🌙 11 PM - 12:30 AM</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-ink-400 uppercase">Freshness</p>
            <p className="font-display text-xl font-bold text-gold-400 mt-0.5">100% Baked on Order</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-ink-400 uppercase">Dietary Choice</p>
            <p className="font-display text-xl font-bold text-ink-100 mt-0.5">🌱 100% Eggless</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link to="/shop" className="px-6 py-3.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.18em] uppercase clip-btn transition-colors">
            Order Fresh Cake Now
          </Link>
          <Link to="/builder" className="px-6 py-3.5 bg-ink-900 border border-ink-700 text-ink-200 hover:text-ink-50 font-mono text-xs tracking-[0.18em] uppercase clip-btn transition-colors">
            Design 3D Custom Cake
          </Link>
        </div>
      </div>

      {/* Featured Cakes for this Locality */}
      <div className="mb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-cobalt-400 uppercase">Bestsellers In {area.areaName}</p>
            <h2 className="font-display text-3xl font-bold uppercase mt-1">Available For Immediate Delivery</h2>
          </div>
          <Link to="/shop" className="font-mono text-xs uppercase tracking-wider text-blaze-400 hover:underline">
            View All ({products.length}) →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {curatedCakes.map((cake) => (
            <div key={cake.id} className="bg-ink-850 border border-ink-700/70 p-5 clip-tile flex flex-col justify-between group">
              <div>
                <div className="aspect-[4/3] bg-ink-900 overflow-hidden mb-4 relative">
                  <ImgX src={cake.img} alt={cake.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {cake.tag && (
                    <span className="absolute top-2 left-2 bg-emerald-950/90 text-emerald-400 text-[10px] font-mono px-2 py-0.5 border border-emerald-500/40">
                      {cake.tag}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-ink-50 group-hover:text-blaze-400 transition-colors">
                  {cake.name}
                </h3>
                <p className="text-xs text-ink-300 mt-1 line-clamp-2">{cake.desc}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-ink-700/50 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs text-ink-400">Starting from</p>
                  <p className="font-display text-xl font-bold text-blaze-400">{fmt(cake.price)}</p>
                </div>
                <button
                  onClick={() => cartAdd(cake.id, cake.colors[0]?.name || "Standard", cake.sizes[0] || "500g", 1)}
                  className="px-4 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] uppercase tracking-wider clip-btn transition-colors"
                >
                  Quick Add +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights & Delivery Coverage Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="p-8 bg-ink-850 border border-ink-700/70 clip-tile">
          <p className="font-mono text-xs text-gold-400 uppercase tracking-wider mb-2">Locality Coverage</p>
          <h3 className="font-display text-2xl font-bold uppercase mb-4">Express Delivery in {area.areaName}</h3>
          <ul className="space-y-3 text-sm text-ink-300">
            {area.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-blaze-400 font-bold mt-0.5">✓</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 pt-6 border-t border-ink-700/50">
            <p className="font-mono text-xs text-ink-400 uppercase mb-2">Key Landmarks Served:</p>
            <div className="flex flex-wrap gap-2">
              {area.landmarks.map((l, i) => (
                <span key={i} className="px-3 py-1 bg-ink-900 border border-ink-700 text-xs text-ink-200">
                  📍 {l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="p-8 bg-ink-850 border border-ink-700/70 clip-tile flex flex-col justify-between">
          <div>
            <p className="font-mono text-xs text-cobalt-400 uppercase tracking-wider mb-2">CakeUrban Quality Promise</p>
            <h3 className="font-display text-2xl font-bold uppercase mb-4">Zero Frozen Inventory Guarantee</h3>
            <p className="text-sm text-ink-300 leading-relaxed mb-4">
              Unlike traditional sweet shops, we never store pre-baked cakes. Your cake is mixed, baked, frosted, and dispatched fresh from our dedicated bakery kitchen to reach {area.areaName} in peak condition.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-ink-900 border border-ink-700/70">
                <span className="text-gold-400 font-bold">🧈 Pure Butter</span>
                <p className="text-ink-400 mt-1">Zero palm oil or artificial shortening</p>
              </div>
              <div className="p-3 bg-ink-900 border border-ink-700/70">
                <span className="text-gold-400 font-bold">🍫 Belgian Truffle</span>
                <p className="text-ink-400 mt-1">55% dark chocolate couverture</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/contact" className="block text-center w-full py-3 bg-ink-900 hover:bg-ink-750 border border-ink-700 font-mono text-xs uppercase tracking-wider text-ink-200">
              Need Special Custom Theme Cake? Contact Us →
            </Link>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="p-8 sm:p-10 bg-ink-850 border border-ink-700/70 clip-tile mb-16">
        <p className="font-mono text-xs text-gold-400 uppercase tracking-wider mb-2">Frequently Asked Questions</p>
        <h3 className="font-display text-3xl font-bold uppercase mb-8">Cake Delivery in {area.areaName} FAQ</h3>
        
        <div className="space-y-6">
          {area.faqs.map((faq, i) => (
            <div key={i} className="p-5 bg-ink-900 border border-ink-700/60 clip-tile">
              <h4 className="font-display text-base font-bold text-ink-50 mb-2">
                Q: {faq.q}
              </h4>
              <p className="text-sm text-ink-300 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
