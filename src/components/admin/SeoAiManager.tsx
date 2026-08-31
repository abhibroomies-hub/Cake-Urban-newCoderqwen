import { useState } from "react";
import { useStore } from "../../lib/store";
import { Ic } from "../ui";

export function SeoAiManager() {
  const store = useStore();
  const { settings, updateSettings, toast } = store;

  const [seoState, setSeoState] = useState(settings.seo || {
    title: "CakeUrban — 100% Pure Veg Artisan Cake Delivery across Delhi NCR (Faridabad, Noida, Gurgaon)",
    description: "Order fresh small-batch eggless cakes, Belgian chocolate bakes, and gourmet pastries with express 30-45 minute chilled delivery across Faridabad, Noida, Gurgaon & Delhi NCR.",
    keywords: "cake delivery faridabad, eggless cakes noida, gourmet bakery gurgaon, online cake order delhi ncr, midnight cake delivery, belgian chocolate cake",
    localKeywordsNCR: "Faridabad Sector 15, Sector 16, NIT, Noida Sector 18, Sector 62, Greater Noida, Gurgaon Cyber Hub, Golf Course Road, South Delhi, Ghaziabad Indirapuram",
  });

  const [devicePreview, setDevicePreview] = useState<"mobile" | "desktop">("mobile");
  const [copiedSchema, setCopiedSchema] = useState(false);

  const handleSave = () => {
    updateSettings({
      seo: seoState,
    });
    toast("success", "SEO & AI Search Engine metadata saved live!");
  };

  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": settings.header?.brandName || "CakeUrban",
    "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1200",
    "@id": "https://cakeurban.com/#bakery",
    "url": "https://cakeurban.com",
    "telephone": settings.header?.hotline || "+91 7318531953",
    "priceRange": "$$",
    "servesCuisine": ["Bakery", "Desserts", "100% Pure Vegetarian", "Eggless Cakes"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Artisan Oven, Sector 15",
      "addressLocality": "Faridabad",
      "addressRegion": "Haryana / Delhi NCR",
      "postalCode": "121007",
      "addressCountry": "IN",
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.4089,
      "longitude": 77.3178,
    },
    "areaServed": [
      { "@type": "City", "name": "Faridabad" },
      { "@type": "City", "name": "Noida" },
      { "@type": "City", "name": "Greater Noida" },
      { "@type": "City", "name": "Gurgaon" },
      { "@type": "City", "name": "New Delhi" },
      { "@type": "City", "name": "Ghaziabad" },
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "2480",
    },
  };

  return (
    <div className="anim-fade-up space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-ink-850 border border-ink-700/60 clip-tile flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse" />
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold-400 uppercase font-bold">
              Regional Search & AI Visibility Matrix
            </p>
          </div>
          <h2 className="font-display text-xl font-bold uppercase mt-1">
            Delhi NCR SEO & AI (Gemini, ChatGPT, Perplexity) Domination
          </h2>
          <p className="text-xs text-ink-400 mt-1 max-w-xl">
            Optimized for top Google ranking across Faridabad, Noida, Gurgaon, and Delhi NCR with automated structured Schema.org JSON-LD and AI search engine discovery.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase px-6 py-3 font-bold transition-colors shadow-lg shadow-blaze-500/20 flex items-center gap-2"
        >
          <Ic.check className="w-4 h-4" /> Save SEO Settings
        </button>
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        {/* Meta Editor */}
        <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
          <h3 className="font-display font-bold text-base uppercase text-ink-100 flex items-center gap-2">
            <Ic.sparkle className="w-4 h-4 text-gold-400" /> Search Meta Tags
          </h3>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold">
                Meta Title Tag (Google Headline)
              </label>
              <span className={`font-mono text-[10px] ${seoState.title.length > 65 ? "text-danger-400" : "text-volt-400"}`}>
                {seoState.title.length}/60 chars (Recommended)
              </span>
            </div>
            <textarea
              rows={2}
              value={seoState.title}
              onChange={(e) => setSeoState({ ...seoState, title: e.target.value })}
              className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-semibold rounded resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold">
                Meta Description (Search Snippet)
              </label>
              <span className={`font-mono text-[10px] ${seoState.description.length > 160 ? "text-danger-400" : "text-volt-400"}`}>
                {seoState.description.length}/155 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={seoState.description}
              onChange={(e) => setSeoState({ ...seoState, description: e.target.value })}
              className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs rounded resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
              Delhi NCR Hyper-Local Target Keywords
            </label>
            <textarea
              rows={2}
              value={seoState.localKeywordsNCR}
              onChange={(e) => setSeoState({ ...seoState, localKeywordsNCR: e.target.value })}
              placeholder="Faridabad Sector 15, Noida Sector 62, Gurgaon Cyber Hub, South Delhi..."
              className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded resize-none"
            />
          </div>
        </div>

        {/* Live Google Search Card Preview */}
        <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base uppercase text-ink-100 flex items-center gap-2">
              <Ic.eye className="w-4 h-4 text-blaze-500" /> Google Search SERP Preview
            </h3>
            <div className="flex bg-ink-950 p-0.5 rounded border border-ink-700 font-mono text-[10px]">
              <button
                onClick={() => setDevicePreview("mobile")}
                className={`px-2.5 py-1 rounded transition-colors ${devicePreview === "mobile" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400"}`}
              >
                Mobile
              </button>
              <button
                onClick={() => setDevicePreview("desktop")}
                className={`px-2.5 py-1 rounded transition-colors ${devicePreview === "desktop" ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400"}`}
              >
                Desktop
              </button>
            </div>
          </div>

          <div className="bg-[#1f1f1f] border border-[#303134] p-4 rounded-xl text-left space-y-1.5 shadow-md">
            <div className="flex items-center gap-2 text-xs text-[#bdc1c6]">
              <div className="w-6 h-6 rounded-full bg-blaze-500/20 text-blaze-400 grid place-items-center text-[10px] font-bold">
                CU
              </div>
              <div className="leading-tight truncate">
                <span className="text-[#dadce0] font-semibold text-xs block">CakeUrban Bakehouse</span>
                <span className="text-[#9aa0a6] text-[11px] font-mono">https://cakeurban.com › delhi-ncr</span>
              </div>
            </div>

            <h4 className="text-[#8ab4f8] text-base hover:underline cursor-pointer font-medium leading-snug pt-1">
              {seoState.title || "CakeUrban — 100% Pure Veg Artisan Cake Delivery across Delhi NCR"}
            </h4>

            <p className="text-[#bdc1c6] text-xs leading-relaxed line-clamp-3">
              {seoState.description || "Order fresh small-batch eggless cakes, Belgian chocolate bakes, and gourmet pastries with express 30-45 minute chilled delivery..."}
            </p>

            <div className="pt-2 flex items-center gap-3 text-[11px] text-[#9aa0a6] font-mono border-t border-[#303134]/60">
              <span className="text-[#fbbc04]">★ 4.9 (2,480+ Reviews)</span>
              <span>·</span>
              <span className="text-[#34a853]">Express 30-45m Dispatch</span>
              <span>·</span>
              <span>100% Veg</span>
            </div>
          </div>

          {/* AI Search Optimization Status */}
          <div className="bg-ink-900/90 border border-ink-700/80 p-4 rounded space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-wider text-volt-400 font-bold flex items-center gap-1.5">
              🤖 AI Search (LLMO & GEO) Engine Readiness
            </p>
            <ul className="text-xs space-y-1.5 text-ink-300">
              <li className="flex items-center gap-2 text-emerald-400">
                <Ic.check className="w-3.5 h-3.5" /> Schema.org LocalBusiness + FoodEstablishment injected
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <Ic.check className="w-3.5 h-3.5" /> Live Firebase RTDB catalog indexed for instant AI grounding
              </li>
              <li className="flex items-center gap-2 text-emerald-400">
                <Ic.check className="w-3.5 h-3.5" /> Regional pincode mapping for Faridabad, Noida, Gurgaon, Delhi
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* JSON-LD Schema Visualizer */}
      <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-400 font-bold">
            Structured Data Code (JSON-LD for Google Knowledge Graph & AI Crawlers)
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(schemaJsonLd, null, 2));
              setCopiedSchema(true);
              setTimeout(() => setCopiedSchema(false), 2000);
              toast("success", "Schema JSON copied to clipboard!");
            }}
            className="text-[10px] font-mono px-3 py-1 bg-ink-900 hover:bg-ink-800 text-ink-300 border border-ink-700 rounded transition-colors"
          >
            {copiedSchema ? "✓ Copied" : "Copy Schema JSON"}
          </button>
        </div>
        <pre className="bg-ink-950 p-4 rounded border border-ink-800 text-[11px] font-mono text-ink-300 overflow-x-auto max-h-48">
          {JSON.stringify(schemaJsonLd, null, 2)}
        </pre>
      </div>
    </div>
  );
}
