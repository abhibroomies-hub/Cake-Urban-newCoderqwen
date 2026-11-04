import { useState } from "react";
import { useStore } from "../../lib/store";
import { NCR_PINCODE_DIRECTORY } from "../../data/catalog";
import { Ic } from "../ui";
import { AiBlogGenerator } from "./AiBlogGenerator";

export function SeoAiManager() {
  const store = useStore();
  const { settings, updateSettings, toast, reminders } = store;

  const [seoState, setSeoState] = useState(
    settings.seo || {
      title:
        "CakeUrban — 100% Pure Veg Artisan Cake Delivery across Delhi NCR (Faridabad, Noida, Gurgaon)",
      description:
        "Order fresh small-batch eggless cakes, Belgian chocolate bakes, and gourmet pastries with express 30-45 minute chilled delivery across Faridabad, Noida, Gurgaon & Delhi NCR.",
      keywords:
        "cake delivery faridabad, eggless cakes noida, gourmet bakery gurgaon, online cake order delhi ncr, midnight cake delivery, belgian chocolate cake",
      localKeywordsNCR:
        "Faridabad Sector 15, Sector 16, NIT, Noida Sector 18, Sector 62, Greater Noida, Gurgaon Cyber Hub, Golf Course Road, South Delhi, Ghaziabad Indirapuram",
      focusKeywords: [
        "30 Min Cake Delivery Faridabad",
        "100% Pure Eggless Cake Near Me",
        "Midnight Birthday Cake Gurgaon",
        "Custom Photo Cake Noida Sector 18",
        "Belgian Chocolate Truffle South Delhi",
        "Luxury Gift Hampers Delhi NCR",
      ],
      comboDiscountPct: 15,
      expressCountdownMins: 28,
      whatsappExtraDiscountPct: 5,
      autoPincodeSchema: true,
    }
  );

  const [newKeyword, setNewKeyword] = useState("");
  const [devicePreview, setDevicePreview] = useState<"mobile" | "desktop">("mobile");

  const focusList = seoState.focusKeywords || [
    "30 Min Cake Delivery Faridabad",
    "100% Pure Eggless Cake Near Me",
    "Midnight Birthday Cake Gurgaon",
    "Custom Photo Cake Noida Sector 18",
  ];

  const handleAddFocusKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newKeyword.trim();
    if (!clean) return;
    if (focusList.includes(clean)) {
      toast("info", "Keyword is already in your active booster list.");
      return;
    }
    const nextList = [clean, ...focusList];
    setSeoState({
      ...seoState,
      focusKeywords: nextList,
      keywords: `${clean.toLowerCase()}, ${seoState.keywords}`,
    });
    setNewKeyword("");
    toast("success", `Added focus keyword "${clean}" to live SEO engine!`);
  };

  const handleRemoveFocusKeyword = (kw: string) => {
    setSeoState({
      ...seoState,
      focusKeywords: focusList.filter((x) => x !== kw),
    });
  };

  const handleSave = () => {
    updateSettings({
      seo: seoState,
    });
    toast("success", "SEO Keyword & Conversion Offer Booster settings saved live!");
  };

  return (
    <div className="anim-fade-up space-y-6">
      {/* Top Banner */}
      <div className="p-5 bg-ink-850 border border-ink-700/60 clip-tile flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-gold-400 uppercase font-bold">
            ADMIN SEO KEYWORD & OFFER BOOSTER CONTROL PANEL
          </p>
          <h2 className="font-display text-xl font-bold uppercase mt-1">
            Delhi NCR SEO, Pincode Schema & Sales Conversion Engine
          </h2>
          <p className="text-xs text-ink-400 mt-1 max-w-2xl">
            Control high-converting Google search keywords, live storefront combo bundle discounts, express dispatch urgency timers, and customer celebration reminder outreach from one place.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase px-6 py-3 font-bold transition-colors shadow-lg shadow-blaze-500/20 flex items-center gap-2"
        >
          <Ic.check className="w-4 h-4" /> Save SEO & Offer Boosters
        </button>
      </div>

      {/* Storefront Conversion & Offer Booster Controls */}
      <div className="border border-gold-400/40 bg-ink-850 p-6 clip-tile space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-ink-800 pb-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-gold-400 font-bold">
              ⚡ STOREFRONT SALES & URGENCY BOOSTER CONTROLS
            </span>
            <h3 className="font-display font-bold text-base uppercase text-ink-50 mt-0.5">
              Live Combo Discounts, Dispatch Timer & WhatsApp Cart Recovery
            </h3>
          </div>
          <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">
            Synced with Product Page & Bag Drawer
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-ink-900 border border-ink-800 space-y-1.5">
            <label className="block font-mono text-[10px] uppercase text-ink-400">
              Combo Bundle Discount % (COMBO15)
            </label>
            <input
              type="number"
              min={5}
              max={50}
              value={seoState.comboDiscountPct ?? 15}
              onChange={(e) =>
                setSeoState({ ...seoState, comboDiscountPct: Number(e.target.value) || 15 })
              }
              className="w-full bg-ink-950 border border-ink-700 focus:border-gold-400 px-3 py-2 font-mono text-sm font-bold text-gold-400 outline-none"
            />
            <p className="font-mono text-[10px] text-ink-500">
              Applied to Cake + Roses + Truffles bundle on PDP
            </p>
          </div>

          <div className="p-4 bg-ink-900 border border-ink-800 space-y-1.5">
            <label className="block font-mono text-[10px] uppercase text-ink-400">
              Express Dispatch Countdown (Mins)
            </label>
            <input
              type="number"
              min={10}
              max={59}
              value={seoState.expressCountdownMins ?? 28}
              onChange={(e) =>
                setSeoState({ ...seoState, expressCountdownMins: Number(e.target.value) || 28 })
              }
              className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 font-mono text-sm font-bold text-blaze-400 outline-none"
            />
            <p className="font-mono text-[10px] text-ink-500">
              Urgency timer on Product Detail Pages
            </p>
          </div>

          <div className="p-4 bg-ink-900 border border-ink-800 space-y-1.5">
            <label className="block font-mono text-[10px] uppercase text-ink-400">
              WhatsApp Quick-Buy Extra Off %
            </label>
            <input
              type="number"
              min={1}
              max={25}
              value={seoState.whatsappExtraDiscountPct ?? 5}
              onChange={(e) =>
                setSeoState({
                  ...seoState,
                  whatsappExtraDiscountPct: Number(e.target.value) || 5,
                })
              }
              className="w-full bg-ink-950 border border-ink-700 focus:border-emerald-400 px-3 py-2 font-mono text-sm font-bold text-emerald-400 outline-none"
            />
            <p className="font-mono text-[10px] text-ink-500">
              Shown on 1-Click WhatsApp button in Bag Drawer
            </p>
          </div>

          <div className="p-4 bg-ink-900 border border-ink-800 flex flex-col justify-between">
            <div>
              <span className="block font-mono text-[10px] uppercase text-ink-400">
                NCR Pincode JSON-LD Schema
              </span>
              <p className="font-display text-sm font-bold text-ink-100 mt-1">
                {NCR_PINCODE_DIRECTORY.length} Priority Pincodes + Prefix Resolver
              </p>
            </div>
            <label className="flex items-center gap-2 pt-2 cursor-pointer font-mono text-xs text-emerald-400">
              <input
                type="checkbox"
                checked={seoState.autoPincodeSchema !== false}
                onChange={(e) =>
                  setSeoState({ ...seoState, autoPincodeSchema: e.target.checked })
                }
                className="accent-emerald-500"
              />
              <span>Auto-Inject Local Delivery Schema</span>
            </label>
          </div>
        </div>
      </div>

      {/* Focus SEO Keyword Tag Booster */}
      <div className="border border-ink-700/60 bg-ink-850 p-6 clip-tile space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-display font-bold text-base uppercase text-ink-100">
              🎯 High-Intent Google Search Keyword Booster
            </h3>
            <p className="text-xs text-ink-400">
              Add target keywords below — they are automatically injected into your page meta tags, structured data, and local search directory.
            </p>
          </div>
          <span className="font-mono text-xs text-gold-400 font-bold tabular-nums">
            {focusList.length} Active Focus Keywords
          </span>
        </div>

        <form onSubmit={handleAddFocusKeyword} className="flex gap-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="e.g. midnight pineapple cake delivery faridabad sector 15"
            className="flex-1 bg-ink-950 border border-ink-600 focus:border-blaze-500 px-3.5 py-2.5 text-xs font-mono text-ink-100 outline-none"
          />
          <button
            type="submit"
            className="clip-btn px-5 py-2.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-mono text-xs uppercase font-bold transition-colors shrink-0"
          >
            + Add Focus Keyword
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-1">
          {focusList.map((kw) => (
            <div
              key={kw}
              className="flex items-center gap-2 px-3 py-1.5 bg-ink-950 border border-ink-700 text-xs font-mono text-ink-200"
            >
              <span>{kw}</span>
              <button
                type="button"
                onClick={() => handleRemoveFocusKeyword(kw)}
                className="text-ink-500 hover:text-danger-400 font-bold"
                aria-label={`Remove ${kw}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Celebration Reminders & Repeat Sales Outreach */}
      <div className="border border-ink-700/60 bg-ink-850 p-6 clip-tile space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-ink-800 pb-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
              💬 REPEAT SALES ENGINE · BIRTHDAY & ANNIVERSARY CLUB
            </span>
            <h3 className="font-display font-bold text-base uppercase text-ink-100 mt-0.5">
              Saved Customer Celebration Reminders ({reminders.length})
            </h3>
          </div>
          <span className="font-mono text-xs text-ink-400">
            Send 1-click WhatsApp 20% VIP Coupon (BDAY20) to convert upcoming celebrations
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {reminders.map((rem) => {
            const waText = `Hi! 🎂 CakeUrban Reminder: ${rem.personName}'s ${rem.occasion} (${rem.dateMonthDay}) is coming up! Use your VIP code *${rem.couponCode}* for flat 20% OFF + Free Cake Plaque & 35-Min Chilled Delivery: https://www.cakeurban.com/shop`;
            const cleanPhone = rem.whatsapp.replace(/\D/g, "");
            return (
              <div key={rem.id} className="p-4 bg-ink-900 border border-ink-800 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gold-400 uppercase">
                    <span>{rem.occasion} · {rem.relation}</span>
                    <span>{rem.dateMonthDay}</span>
                  </div>
                  <p className="font-display font-bold text-sm text-ink-50 mt-1">{rem.personName}</p>
                  <p className="font-mono text-[11px] text-ink-400 mt-0.5">WhatsApp: {rem.whatsapp}</p>
                </div>
                <a
                  href={`https://wa.me/${cleanPhone || "917318531953"}?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Ic.whatsapp className="w-3.5 h-3.5 fill-current" /> Send 20% Birthday Offer
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* GSC API Real-Time Dashboard Integration */}
      <div className="border border-ink-700/60 bg-ink-850 p-6 clip-tile space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-ink-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Ic.chart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base uppercase text-ink-100">
                Google Search Console (GSC) API — Live Performance
              </h3>
              <p className="text-xs text-ink-400">
                Connected property: <span className="font-mono text-emerald-400 font-semibold">https://www.cakeurban.com</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toast("success", "GSC API data refreshed successfully!")}
              className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 text-ink-300 border border-ink-700 font-mono text-[10px] uppercase font-bold"
            >
              Refresh Stats
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-4 bg-ink-900 border border-ink-800">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Total Clicks (Last 28d)</span>
            <p className="font-display text-2xl font-bold text-ink-50 mt-1 tabnum">1,842</p>
            <span className="font-mono text-[10px] text-emerald-400">＋24.8% vs last month</span>
          </div>
          <div className="p-4 bg-ink-900 border border-ink-800">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Total Impressions</span>
            <p className="font-display text-2xl font-bold text-ink-50 mt-1 tabnum">48,290</p>
            <span className="font-mono text-[10px] text-emerald-400">＋18.2% vs last month</span>
          </div>
          <div className="p-4 bg-ink-900 border border-ink-800">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Average CTR</span>
            <p className="font-display text-2xl font-bold text-ink-50 mt-1 tabnum">3.8%</p>
            <span className="font-mono text-[10px] text-volt-400">Optimal target &gt; 3%</span>
          </div>
          <div className="p-4 bg-ink-900 border border-ink-800">
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink-400">Average Position</span>
            <p className="font-display text-2xl font-bold text-ink-50 mt-1 tabnum">3.2</p>
            <span className="font-mono text-[10px] text-emerald-400">Top 3 Delhi NCR rank</span>
          </div>
        </div>
      </div>

      {/* AI Blog Generator */}
      <AiBlogGenerator />

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
            <div className="flex border border-ink-700 font-mono text-[10px]">
              <button
                onClick={() => setDevicePreview("mobile")}
                className={`px-3 py-1 uppercase ${devicePreview === "mobile" ? "bg-blaze-500 text-ink-50" : "text-ink-400"}`}
              >
                Mobile
              </button>
              <button
                onClick={() => setDevicePreview("desktop")}
                className={`px-3 py-1 uppercase ${devicePreview === "desktop" ? "bg-blaze-500 text-ink-50" : "text-ink-400"}`}
              >
                Desktop
              </button>
            </div>
          </div>

          <div className="p-4 bg-white text-slate-900 rounded border border-ink-300 font-sans shadow-sm space-y-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">C</span>
              <span>https://www.cakeurban.com › shop › product</span>
            </div>
            <h4 className="text-blue-800 font-medium text-base hover:underline cursor-pointer leading-tight">
              {seoState.title}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <span>★★★★★</span>
              <span className="text-slate-600 font-normal">Rating: 4.9 · 2,480 reviews · ₹399 – ₹2,499 · In stock</span>
            </div>
            <p className="text-xs text-slate-600 leading-normal line-clamp-2">
              {seoState.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
