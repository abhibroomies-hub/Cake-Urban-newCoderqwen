import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Ic } from "../components/ui";
import { PRODUCTS } from "../data/catalog";
import { ProductCard } from "../components/product";
import { LandingPinterestCakeSearch } from "./builder";

const CITY_SEO_DATA: Record<string, { name: string; title: string; desc: string; heroImg: string; hubs: string[] }> = {
  delhi: {
    name: "Delhi",
    title: "Best Gourmet Cookies & Luxury Gift Hampers in Delhi | CakeUrban",
    desc: "72-hour cold-fermented cookies, crispy namkeens & luxury gift hampers across South Delhi, GK, Saket, Vasant Kunj & Connaught Place with 35-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/31255ff8-a239-432f-8d31-296fe494f4c1/_result.png",
    hubs: ["South Delhi (GK, Saket)", "Connaught Place", "West Delhi (Rajouri)", "East Delhi (Mayur Vihar)"],
  },
  faridabad: {
    name: "Faridabad",
    title: "Best Gourmet Cookies & Luxury Gift Hampers in Faridabad | CakeUrban",
    desc: "Fresh bakery cookies, royal namkeens & luxury gift hampers across Sector 15, Sector 16, NIT, Greenfields & Greater Faridabad with 30-min express & midnight delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png",
    hubs: ["Sector 15 & 15A HQ", "Sector 16 & NIT", "Greenfields & Charmwood", "Greater Faridabad"],
  },
  noida: {
    name: "Noida",
    title: "Best Gourmet Cookies & Luxury Gift Hampers in Noida | CakeUrban",
    desc: "Artisan cookies, roasted namkeens & corporate gift hampers across Noida Sector 18, Sector 62, Sector 137 & Gaur City with 35-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/3375943d-96a8-43e8-9ab9-dbf92467ce64/_result.png",
    hubs: ["Sector 18 Hub", "Sector 62 Corporate", "Sector 137 Expressway", "Greater Noida West"],
  },
  gurgaon: {
    name: "Gurgaon",
    title: "Best Gourmet Cookies & Luxury Gift Hampers in Gurgaon | CakeUrban",
    desc: "Corporate gift hampers, molten choc-chip cookies & roasted makhana across DLF Phase 1-5, Cyber City, Golf Course Road & Sohna Road with 40-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png",
    hubs: ["DLF Phase 1–5", "Cyber City & Golf Course", "Sohna Road & Sec 56", "MG Road & Udyog Vihar"],
  },
  ghaziabad: {
    name: "Ghaziabad",
    title: "Best Gourmet Cookies & Luxury Gift Hampers in Ghaziabad | CakeUrban",
    desc: "Fresh cookies, crunchy namkeens & festival gift boxes across Indirapuram, Vaishali, Vasundhara & Raj Nagar Extension with 45-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/31255ff8-a239-432f-8d31-296fe494f4c1/_result.png",
    hubs: ["Indirapuram Hub", "Vaishali & Vasundhara", "Raj Nagar Extension", "Crossings Republik"],
  },
};

export function CookiesLocationPage() {
  const { city } = useParams<{ city: string }>();
  const { pathname } = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const pathCity = pathname.replace(/^\/cookies-/, "").toLowerCase();
  const resolvedCity = city || (CITY_SEO_DATA[pathCity] ? pathCity : "delhi");
  const cityData = CITY_SEO_DATA[resolvedCity] || CITY_SEO_DATA.delhi;
  const cookies = PRODUCTS.filter((p) => p.category === "Cookies" || p.category === "Gift Hampers");

  useEffect(() => {
    document.title = cityData.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", cityData.desc);
  }, [cityData]);

  const faqs = [
    {
      q: `How fast is delivery in ${cityData.name}?`,
      a: `Dedicated micro-kitchen hubs across ${cityData.name} deliver fresh batches within 30–45 minutes.`,
    },
    {
      q: "Are all cookies and gift hampers 100% vegetarian?",
      a: "Yes, 100% pure eggless vegetarian items baked with pure butter and 54% Belgian chocolate.",
    },
    {
      q: "Do you offer midnight and corporate gifting?",
      a: `Yes, guaranteed 12 AM midnight delivery and custom-branded corporate hampers across ${cityData.name}.`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-6 sm:space-y-10">
      {/* City Switcher Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {Object.entries(CITY_SEO_DATA).map(([slug, c]) => (
          <Link
            key={slug}
            to={`/cookies-${slug}`}
            className={`px-3 py-1.5 font-mono text-[10px] sm:text-xs uppercase tracking-wider clip-tag border shrink-0 transition-colors ${
              resolvedCity === slug
                ? "bg-blaze-500 text-ink-50 border-blaze-500 font-bold"
                : "bg-ink-900 text-ink-300 border-ink-700 hover:border-ink-500"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Compact Hero Banner */}
      <div className="relative overflow-hidden clip-tile border border-ink-700/60 bg-ink-850 p-5 sm:p-10 noise">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="font-mono text-[10px] tracking-[0.22em] text-blaze-500 uppercase font-bold">
            ⚡ Express 35-Min Delivery · {cityData.name} NCR
          </span>
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Cookies & Gift Hampers in <span className="text-blaze-500">{cityData.name}</span>
          </h1>
          <p className="text-ink-300 text-xs sm:text-sm leading-relaxed">{cityData.desc}</p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link
              to="/shop"
              className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase px-5 py-2.5 sm:py-3 font-bold transition-colors"
            >
              Order Now →
            </Link>
            <Link
              to={`/cakes-in/${resolvedCity}`}
              className="clip-btn bg-ink-900 border border-ink-700 hover:border-ink-500 text-ink-200 font-mono text-xs uppercase px-4 py-2.5 sm:py-3 transition-colors"
            >
              {cityData.name} Sectors
            </Link>
          </div>
        </div>
      </div>

      {/* 2x2 Mobile Grid of Coverage Hubs */}
      <div className="border border-ink-700/60 bg-ink-850 p-4 sm:p-6 clip-tile">
        <h2 className="font-display text-sm sm:text-lg font-bold uppercase mb-3 text-ink-100 flex items-center gap-2">
          <Ic.map className="w-4 h-4 text-blaze-500 shrink-0" /> {cityData.name} Express Zones
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {cityData.hubs.map((hub, idx) => (
            <div key={idx} className="p-3 bg-ink-900 border border-ink-700/80 clip-tile">
              <span className="font-mono text-[8px] text-gold-400 uppercase tracking-widest">Zone {idx + 1}</span>
              <p className="font-display font-bold text-xs sm:text-sm text-ink-100 mt-0.5 truncate">{hub}</p>
              <p className="font-mono text-[9px] text-emerald-400 mt-1">⚡ 30–45 mins</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Showcase (2-col on Mobile) */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="font-display text-lg sm:text-2xl font-bold uppercase">
            Bestsellers in {cityData.name}
          </h2>
          <Link to="/shop" className="font-mono text-xs text-blaze-400 hover:underline shrink-0">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
          {cookies.slice(0, 6).map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>

      {/* Live Pinterest Custom Cake Search & Smart Suggestions on City Cookies & Hampers Landing Page */}
      <LandingPinterestCakeSearch locationLabel={cityData.name} />

      {/* Compact Collapsible FAQ Section */}
      <div className="border border-ink-700/60 bg-ink-850 p-4 sm:p-6 clip-tile">
        <h2 className="font-display text-base sm:text-lg font-bold uppercase text-ink-100 mb-2">
          {cityData.name} Delivery FAQs
        </h2>
        <div className="divide-y divide-ink-800">
          {faqs.map((f, idx) => (
            <div key={idx} className="py-2.5">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-2 text-left font-semibold text-xs sm:text-sm text-ink-100 hover:text-blaze-400"
              >
                <span>{f.q}</span>
                <span className="font-mono text-blaze-400">{openFaq === idx ? "−" : "+"}</span>
              </button>
              {openFaq === idx && <p className="text-xs text-ink-300 mt-1.5 leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
