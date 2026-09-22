import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { Ic, ImgX } from "../components/ui";
import { PRODUCTS } from "../data/catalog";
import { ProductCard } from "../components/product";

const CITY_SEO_DATA: Record<string, { name: string; title: string; desc: string; heroImg: string; hubs: string[] }> = {
  delhi: {
    name: "Delhi",
    title: "Best Gourmet Cookies & Gift Hampers in Delhi | CakeUrban",
    desc: "Order handcrafted 72-hour cold-fermented cookies, chocolate stacks, and luxury gift hampers across South Delhi, Connaught Place, Greater Kailash, Vasant Kunj & Dwarka with 35-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/31255ff8-a239-432f-8d31-296fe494f4c1/_result.png",
    hubs: ["South Delhi (GK, Hauz Khas, Saket)", "Connaught Place & Central Delhi", "West Delhi (Rajouri Garden, Punjabi Bagh)", "East Delhi (Mayur Vihar, Preet Vihar)"]
  },
  faridabad: {
    name: "Faridabad",
    title: "Best Gourmet Cookies & Gift Hampers in Faridabad | CakeUrban",
    desc: "Order fresh bakery cookies, royal namkeens & luxury gift hampers across Sector 15, Sector 16, NIT, Greenfields, Charmwood & Greater Faridabad with 30-min express & midnight delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png",
    hubs: ["Sector 15 & 15A Hub", "Sector 16 & NIT Area", "Greenfield & Charmwood Village", "Greater Faridabad (Neharpar Sector 75-89)"]
  },
  noida: {
    name: "Noida",
    title: "Best Gourmet Cookies & Gift Hampers in Noida | CakeUrban",
    desc: "Order premium artisan cookies, roasted namkeens & corporate gift hampers across Noida Sector 18, Sector 62, Sector 137, Expressway high-rises & Gaur City with 35-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/3375943d-96a8-43e8-9ab9-dbf92467ce64/_result.png",
    hubs: ["Sector 18 Atta Market & DLF Mall Area", "Sector 62 Institutional Zone", "Sector 137 & Expressway High-Rises", "Greater Noida West (Gaur City)"]
  },
  gurgaon: {
    name: "Gurgaon",
    title: "Best Gourmet Cookies & Gift Hampers in Gurgaon | CakeUrban",
    desc: "Order luxury corporate gift hampers, choc-chip cookies & roasted makhana across DLF Phase 1-5, Cyber City, Golf Course Road & Sohna Road with 40-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png",
    hubs: ["DLF Phase 1, 2, 3, 4, 5", "Cyber City & Golf Course Road", "Sohna Road & Sector 56", "Udyog Vihar & MG Road"]
  },
  ghaziabad: {
    name: "Ghaziabad",
    title: "Best Gourmet Cookies & Gift Hampers in Ghaziabad | CakeUrban",
    desc: "Order fresh cookies, crunchy namkeens & festival gift boxes across Indirapuram, Vaishali, Vasundhara & Raj Nagar Extension with 45-min express delivery.",
    heroImg: "https://image.qwenlm.ai/generated-images/31255ff8-a239-432f-8d31-296fe494f4c1/_result.png",
    hubs: ["Indirapuram (Habitat Centre area)", "Vaishali & Vasundhara Sectors", "Raj Nagar Extension", "Crossings Republik"]
  }
};

export function CookiesLocationPage() {
  const { city } = useParams<{ city: string }>();
  const cityData = CITY_SEO_DATA[city || "delhi"] || CITY_SEO_DATA.delhi;
  const cookies = PRODUCTS.filter((p) => p.category === "Cookies" || p.category === "Gift Hampers");

  useEffect(() => {
    document.title = cityData.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", cityData.desc);
  }, [cityData]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 space-y-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden clip-tile border border-ink-700/60 bg-ink-850 p-8 md:p-14 noise">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
            ⚡ Express 35-Min Delivery in {cityData.name} NCR
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05]">
            Gourmet Cookies & Gift Hampers in <span className="text-blaze-500">{cityData.name}</span>
          </h1>
          <p className="text-ink-300 text-sm md:text-base leading-relaxed">
            {cityData.desc}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/shop" className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase px-6 py-3 font-bold transition-colors">
              Order Now →
            </Link>
            <Link to="/delivery-locations" className="clip-btn bg-ink-900 border border-ink-700 hover:border-ink-500 text-ink-200 font-mono text-xs uppercase px-6 py-3 transition-colors">
              View All Delivery Hubs
            </Link>
          </div>
        </div>
      </div>

      {/* Coverage Hubs */}
      <div className="border border-ink-700/60 bg-ink-850 p-6 sm:p-8 clip-tile">
        <h2 className="font-display text-xl font-bold uppercase mb-4 text-ink-100 flex items-center gap-2">
          <Ic.map className="w-5 h-5 text-blaze-500" /> Active {cityData.name} Express Coverage Zones
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cityData.hubs.map((hub, idx) => (
            <div key={idx} className="p-4 bg-ink-900 border border-ink-700/80 clip-tile">
              <span className="font-mono text-[9px] text-gold-400 uppercase tracking-widest">Zone {idx + 1}</span>
              <p className="font-display font-bold text-sm text-ink-100 mt-1">{hub}</p>
              <p className="font-mono text-[10px] text-ink-400 mt-2">⚡ 30–45 mins chilled delivery</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Showcase */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold-400 font-bold">Handcrafted Fresh Daily</span>
            <h2 className="font-display text-2xl font-bold uppercase mt-1">Top Selling Cookies & Hampers in {cityData.name}</h2>
          </div>
          <Link to="/shop" className="font-mono text-xs text-blaze-400 hover:underline">Explore Full Catalog →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cookies.slice(0, 6).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </div>

      {/* Local SEO FAQ Section */}
      <div className="border border-ink-700/60 bg-ink-850 p-6 sm:p-8 clip-tile space-y-4">
        <h2 className="font-display text-xl font-bold uppercase text-ink-100 flex items-center gap-2">
          <Ic.sparkle className="w-5 h-5 text-gold-400" /> Frequently Asked Questions — {cityData.name} Delivery
        </h2>
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-ink-900 border border-ink-700 rounded">
            <p className="font-semibold text-xs text-ink-100">How fast is delivery in {cityData.name}?</p>
            <p className="text-xs text-ink-300 mt-1">We maintain dedicated micro-kitchen hubs across {cityData.name} to ensure fresh batches reach your doorstep within 30-45 minutes.</p>
          </div>
          <div className="p-4 bg-ink-900 border border-ink-700 rounded">
            <p className="font-semibold text-xs text-ink-100">Are all cookies and gift hampers 100% vegetarian?</p>
            <p className="text-xs text-ink-300 mt-1">Yes! 100% pure eggless vegetarian items baked with premium butter, Belgian chocolates, and organic ingredients.</p>
          </div>
          <div className="p-4 bg-ink-900 border border-ink-700 rounded">
            <p className="font-semibold text-xs text-ink-100">Do you offer midnight and scheduled gifting?</p>
            <p className="text-xs text-ink-300 mt-1">Yes, we provide guaranteed midnight surprise delivery slots (11 PM - 12:30 AM) and scheduled corporate gifting across {cityData.name}.</p>
          </div>
          <div className="p-4 bg-ink-900 border border-ink-700 rounded">
            <p className="font-semibold text-xs text-ink-100">How can I place bulk or corporate orders?</p>
            <p className="text-xs text-ink-300 mt-1">You can order directly online or connect via WhatsApp at +91 7318531953 for custom corporate branding and festival hampers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
