import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DELHI_NCR_CITIES, getAllSeoAreas, getSeoAreaBySlug, AreaData, CityHubData } from "../data/seoLocations";
import { useStore } from "../lib/store";
import { Ic, ImgX } from "../components/ui";
import { generateAreaStructuredData } from "../lib/seoHelpers";

export function DeliveryLocationsIndex() {
  const { fmt } = useStore();
  const allAreas = getAllSeoAreas();

  useEffect(() => {
    document.title = "Cake Delivery Locations in Delhi NCR | CakeUrban";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Explore our express cake delivery coverage across Delhi, Gurgaon, Noida, Faridabad & Ghaziabad. 35 mins delivery & midnight specials.");
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <p className="font-mono text-xs tracking-[0.25em] text-cobalt-400 uppercase">Delhi NCR Coverage</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight mt-3">
          Express Cake Delivery <span className="text-blaze-500">Locations</span>
        </h1>
        <p className="text-ink-300 text-sm sm:text-base mt-4 leading-relaxed">
          We bake fresh to order and deliver across all major localities, sectors, and high-rises in Delhi NCR with 30–45 minute express windows and guaranteed midnight surprise slots.
        </p>
      </div>

      <div className="space-y-12">
        {Object.values(DELHI_NCR_CITIES).map((city) => (
          <div key={city.citySlug} className="border border-ink-700/60 bg-ink-850 p-6 sm:p-8 clip-tile">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-700/50">
              <div>
                <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase">City Hub</span>
                <h2 className="font-display text-2xl font-bold uppercase mt-1">
                  <Link to={`/cakes-in/${city.citySlug}`} className="hover:text-blaze-400 transition-colors">
                    Cakes in {city.cityName}
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
              {city.areas.map((area) => (
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
                      SLA: {area.sla} · Pincode: {area.pincode}
                    </p>
                  </div>
                  <span className="text-ink-500 group-hover:text-blaze-400 transition-colors font-mono text-sm">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
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
        <p className="text-ink-400 mt-2">The location you are looking for does not exist or has been moved.</p>
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
            Explore Local Sectors ({city.areas.length})
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
                    Pincode {area.pincode}
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

      {/* Why Choose Us for City */}
      <div className="border border-ink-700/60 bg-ink-900 p-8 sm:p-10 clip-tile">
        <h3 className="font-display text-2xl font-bold uppercase mb-6">Why CakeUrban is {city.cityName}'s #1 Bakery Choice</h3>
        <div className="grid sm:grid-cols-3 gap-6 text-sm text-ink-300">
          <div className="p-5 bg-ink-850 border border-ink-700/60">
            <p className="font-display font-bold text-ink-50 uppercase text-base mb-2">100% Freshly Baked</p>
            <p>Every cake is baked upon order confirmation with real Belgian chocolate, pure butter, and zero frozen inventory.</p>
          </div>
          <div className="p-5 bg-ink-850 border border-ink-700/60">
            <p className="font-display font-bold text-ink-50 uppercase text-base mb-2">Guaranteed Midnight Slot</p>
            <p>Reliable midnight delivery service across {city.cityName} between 11 PM and 12:30 AM for birthdays and anniversaries.</p>
          </div>
          <div className="p-5 bg-ink-850 border border-ink-700/60">
            <p className="font-display font-bold text-ink-50 uppercase text-base mb-2">Egg & Eggless Options</p>
            <p>Master-crafted eggless options with identical moisture and velvety texture, made in dedicated clean ovens.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AreaLandingPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  const area = areaSlug ? getSeoAreaBySlug(areaSlug) : undefined;
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

      // Inject JSON-LD Schema Graph (FoodEstablishment, AggregateRating, BreadcrumbList, FAQPage)
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
        <h1 className="font-display text-3xl font-bold uppercase">Area Page Not Found</h1>
        <p className="text-ink-400 mt-2">The delivery location you searched for is currently unmapped or invalid.</p>
        <button onClick={() => navigate("/delivery-locations")} className="mt-6 px-6 py-3 bg-blaze-500 text-ink-50 font-mono text-xs uppercase clip-btn">
          View All Delivery Locations
        </button>
      </div>
    );
  }

  const featuredCakes = products.slice(0, 4);

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

      {/* Hero Banner */}
      <div className="border border-ink-700/60 bg-ink-850 p-8 sm:p-12 clip-tile mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blaze-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase bg-blaze-500/20 text-blaze-400 border border-blaze-500/40 px-3 py-1">
            ⚡ Express Delivery: {area.sla}
          </span>
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase bg-ink-900 text-gold-400 border border-ink-700 px-3 py-1">
            Pincode: {area.pincode}
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2">
          Cake Delivery in <span className="text-blaze-500">{area.areaName}, {area.cityName}</span>
        </h1>
        <p className="text-ink-300 text-base sm:text-lg mt-4 max-w-3xl leading-relaxed">
          Looking for the freshest birthday, anniversary, or midnight surprise cakes in {area.areaName}? We deliver artisanal Belgian chocolates, fruit gateaux, and custom designer cakes directly to your doorstep near {area.landmarks.join(", ")}.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-ink-700/50">
          <div>
            <p className="font-mono text-xs text-ink-400 uppercase tracking-widest">Delivery Time</p>
            <p className="font-display font-bold text-lg text-ink-50 mt-1">{area.sla} Doorstep</p>
          </div>
          <div>
            <p className="font-mono text-xs text-ink-400 uppercase tracking-widest">Key Landmarks</p>
            <p className="font-display font-semibold text-sm text-ink-100 mt-1">{area.landmarks[0]}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-ink-400 uppercase tracking-widest">Dietary Options</p>
            <p className="font-display font-bold text-lg text-emerald-400 mt-1">100% Eggless & Regular</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          <Link to="/shop" className="px-6 py-3.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.18em] uppercase clip-btn transition-colors">
            Order Cakes in {area.areaName}
          </Link>
          <a href="#highlights" className="px-6 py-3.5 bg-ink-900 border border-ink-700 text-ink-200 hover:text-ink-50 font-mono text-xs tracking-[0.18em] uppercase clip-btn transition-colors">
            Why Choose Us
          </a>
        </div>
      </div>

      {/* Highlights & Perks */}
      <div id="highlights" className="grid sm:grid-cols-3 gap-6 mb-12">
        {area.highlights.map((h, i) => (
          <div key={i} className="p-6 bg-ink-900 border border-ink-700/80 clip-tile">
            <span className="font-mono text-xs text-gold-400">0{i + 1} // PERK</span>
            <p className="font-display font-semibold text-ink-50 mt-2 text-base leading-snug">{h}</p>
          </div>
        ))}
      </div>

      {/* Popular Products Showcase */}
      <div className="mb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-cobalt-400 uppercase">Handcrafted Daily</p>
            <h2 className="font-display text-3xl font-bold uppercase mt-1">Best Selling Cakes in {area.areaName}</h2>
          </div>
          <Link to="/shop" className="font-mono text-xs tracking-[0.15em] text-blaze-400 hover:text-blaze-300 uppercase">
            View All Catalog →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCakes.map((p) => (
            <div key={p.id} className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative aspect-square overflow-hidden bg-ink-900">
                  <ImgX src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={p.imgFilter ? { filter: p.imgFilter } : undefined} />
                  {p.tag && <span className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.15em] uppercase bg-blaze-500 text-ink-50 px-2 py-1">{p.tag}</span>}
                </div>
                <div className="p-5">
                  <p className="font-mono text-[9px] tracking-[0.2em] text-ink-400 uppercase">{p.brand}</p>
                  <Link to={`/product/${p.id}`} className="font-display font-bold text-lg mt-1 block hover:text-blaze-400 transition-colors">
                    {p.name}
                  </Link>
                  <p className="font-mono tabnum text-xl font-bold text-ink-50 mt-2">{fmt(p.price)}</p>
                  <p className="font-mono text-[11px] text-gold-400 mt-1">★ {p.rating.toFixed(1)} ({p.ratingCount} reviews)</p>
                </div>
              </div>
              <div className="p-5 pt-0">
                <button
                  onClick={() => cartAdd(p.id, p.colors[0]?.name || "Standard", p.sizes[0] || "1 KG")}
                  className="w-full py-3 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.18em] uppercase clip-btn transition-colors flex items-center justify-center gap-2"
                >
                  <Ic.bag className="w-4 h-4" /> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs for Area */}
      <div className="border border-ink-700/60 bg-ink-850 p-8 sm:p-10 clip-tile mb-12">
        <p className="font-mono text-xs tracking-[0.2em] text-gold-400 uppercase mb-2">Got Questions?</p>
        <h2 className="font-display text-2xl font-bold uppercase mb-6">Frequently Asked Questions — {area.areaName}</h2>
        <div className="space-y-6">
          {area.faqs.map((faq, idx) => (
            <div key={idx} className="p-5 bg-ink-900 border border-ink-700/70">
              <h3 className="font-display font-bold text-base text-ink-50">Q: {faq.q}</h3>
              <p className="text-sm text-ink-300 mt-2 leading-relaxed">A: {faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Navigation to Other Areas */}
      <div className="text-center bg-ink-900 border border-ink-700 p-8 clip-tile">
        <p className="font-mono text-xs text-cobalt-400 uppercase tracking-widest mb-2">Explore More</p>
        <h3 className="font-display text-2xl font-bold uppercase mb-4">Other Delivery Zones in {area.cityName}</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {DELHI_NCR_CITIES[area.citySlug]?.areas.filter(a => a.slug !== area.slug).map(other => (
            <Link
              key={other.slug}
              to={`/cake-delivery-in/${other.slug}`}
              className="px-4 py-2 bg-ink-850 border border-ink-700 hover:border-blaze-500 font-mono text-xs text-ink-200 hover:text-blaze-400 transition-colors clip-btn"
            >
              Cakes in {other.areaName}
            </Link>
          ))}
          <Link
            to={`/cakes-in/${area.citySlug}`}
            className="px-4 py-2 bg-cobalt-500/20 border border-cobalt-500 font-mono text-xs text-cobalt-300 hover:text-cobalt-200 transition-colors clip-btn"
          >
            All {area.cityName} Hub →
          </Link>
        </div>
      </div>
    </div>
  );
}
