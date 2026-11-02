import React, { useState, useMemo, useEffect } from "react";
import { Ic } from "../components/ui";
import { useStore } from "../lib/store";

const WHATSAPP_NUMBER = "917318531953";

export type CakePin = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  img: string;
  startingWeight: string;
  priceInr: number;
  servings: string;
  badge?: string;
  aspect?: "tall" | "square" | "classic";
};

const CATEGORIES = [
  { id: "all", label: "🔥 All Trending" },
  { id: "kids", label: "🎈 Kids & Theme" },
  { id: "anniversary", label: "❤️ Anniversary & Heart" },
  { id: "wedding", label: "💍 2-3 Tier Wedding" },
  { id: "vintage", label: "🎀 Korean & Vintage" },
  { id: "luxury", label: "✨ Gold & Chocolate" },
  { id: "photo", label: "📸 Photo & Pinata" },
  { id: "bride", label: "👑 Bride / Groom To Be" },
];

const POPULAR_SEARCHES = [
  "Butterfly Cake",
  "Vintage Heart",
  "2 Tier Wedding",
  "Spiderman",
  "Unicorn",
  "Jungle Safari",
  "Belgian Truffle",
  "Rasmalai Cake",
  "Bride To Be",
  "Cricket Theme",
  "Cocomelon",
  "50th Birthday Gold",
];

const CURATED_PINS: CakePin[] = [
  {
    id: "pin-butterfly-dream",
    title: "3D Pastel Butterfly & Pearl Tier Cake",
    category: "kids",
    tags: ["butterfly", "pastel", "pink", "girls birthday", "pearl", "princess", "1st birthday"],
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1299,
    servings: "10–12 Guests",
    badge: "MOST SAVED PIN",
    aspect: "tall",
  },
  {
    id: "pin-vintage-heart-lambeth",
    title: "Vintage Lambeth Red & Pink Heart Cake",
    category: "vintage",
    tags: ["vintage", "heart", "lambeth", "korean", "ribbon", "bow", "anniversary", "girlfriend", "wife"],
    img: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=900&q=80",
    startingWeight: "0.5 Kg",
    priceInr: 899,
    servings: "5–6 Guests",
    badge: "VIRAL TREND",
    aspect: "square",
  },
  {
    id: "pin-royal-2tier-wedding",
    title: "Royal 2-Tier White & 24K Gold Wedding Cake",
    category: "wedding",
    tags: ["wedding", "2 tier", "engagement", "ring ceremony", "gold", "floral", "white", "marriage", "shagun"],
    img: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=80",
    startingWeight: "2.5 Kg",
    priceInr: 3299,
    servings: "25–30 Guests",
    badge: "WEDDING SPECIAL",
    aspect: "tall",
  },
  {
    id: "pin-belgian-ferrero-overload",
    title: "Belgian Dark Chocolate & Ferrero Rocher Crown",
    category: "luxury",
    tags: ["chocolate", "ferrero rocher", "truffle", "drip", "gold", "husband", "boyfriend", "50th birthday"],
    img: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1399,
    servings: "10–12 Guests",
    badge: "BESTSELLER",
    aspect: "classic",
  },
  {
    id: "pin-unicorn-rainbow-magic",
    title: "Magical Unicorn Pastel Horn & Macaron Cake",
    category: "kids",
    tags: ["unicorn", "rainbow", "kids", "daughter", "macaron", "5th birthday", "cartoon", "pastel"],
    img: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.5 Kg",
    priceInr: 1699,
    servings: "15–18 Guests",
    badge: "KIDS FAVORITE",
    aspect: "tall",
  },
  {
    id: "pin-red-velvet-anniversary",
    title: "Crimson Red Velvet Rose & Berry Romance Cake",
    category: "anniversary",
    tags: ["red velvet", "anniversary", "roses", "romantic", "couple", "25th anniversary", "1st anniversary", "heart"],
    img: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    servings: "10–12 Guests",
    badge: "ANNIVERSARY #1",
    aspect: "square",
  },
  {
    id: "pin-korean-bento-bow",
    title: "Coquette Pink Ribbon Bow Korean Aesthetic Cake",
    category: "vintage",
    tags: ["korean", "bento", "bow", "ribbon", "pink", "aesthetic", "minimalist", "bestie", "pinterest"],
    img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=900&q=80",
    startingWeight: "0.5 Kg",
    priceInr: 849,
    servings: "4–6 Guests",
    badge: "PINTEREST HIT",
    aspect: "classic",
  },
  {
    id: "pin-jungle-safari-first",
    title: "Jungle Safari Lion & Giraffe 1st Birthday Tier Cake",
    category: "kids",
    tags: ["jungle", "safari", "animals", "lion", "1st birthday", "baby boy", "fondant", "theme", "cocomelon"],
    img: "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=900&q=80",
    startingWeight: "2.0 Kg",
    priceInr: 2499,
    servings: "20–24 Guests",
    badge: "1ST BIRTHDAY",
    aspect: "tall",
  },
  {
    id: "pin-bride-to-be-crown",
    title: "Rose Gold Tiara 'Bride To Be' Bachelorette Cake",
    category: "bride",
    tags: ["bride to be", "bachelorette", "tiara", "crown", "rose gold", "bridal shower", "glitter"],
    img: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1349,
    servings: "10–12 Guests",
    badge: "BRIDAL SHOWER",
    aspect: "tall",
  },
  {
    id: "pin-rasmalai-pistachio-royal",
    title: "Royal Indian Rasmalai, Rose Petal & Sicilian Pistachio Cake",
    category: "luxury",
    tags: ["rasmalai", "pistachio", "gulab jamun", "indian fusion", "parents", "mom", "dad", "50th", "diwali"],
    img: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1249,
    servings: "10–12 Guests",
    badge: "FUSION ROYAL",
    aspect: "square",
  },
  {
    id: "pin-superhero-spiderman",
    title: "Marvel Superhero Spiderman & Avengers City Theme Cake",
    category: "kids",
    tags: ["spiderman", "avengers", "superhero", "batman", "boys birthday", "cartoon", "car", "action"],
    img: "https://images.unsplash.com/photo-1557925923-33b27f891f88?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.5 Kg",
    priceInr: 1799,
    servings: "15–18 Guests",
    badge: "BOYS TOP PICK",
    aspect: "classic",
  },
  {
    id: "pin-edible-photo-memories",
    title: "HD Edible Photo Polaroid & Golden Drip Memory Cake",
    category: "photo",
    tags: ["photo cake", "picture", "polaroid", "custom photo", "memories", "anniversary", "birthday", "pull me up"],
    img: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1149,
    servings: "10–12 Guests",
    badge: "CUSTOM PHOTO",
    aspect: "square",
  },
  {
    id: "pin-3tier-floral-reception",
    title: "Grand 3-Tier Pastel Peony & Champagne Reception Cake",
    category: "wedding",
    tags: ["3 tier", "wedding", "reception", "engagement", "grand", "peony", "flowers", "25th anniversary"],
    img: "https://images.unsplash.com/photo-1519654793190-2e8a4806f1f2?auto=format&fit=crop&w=900&q=80",
    startingWeight: "4.0 Kg",
    priceInr: 5499,
    servings: "45–50 Guests",
    badge: "GRAND 3-TIER",
    aspect: "tall",
  },
  {
    id: "pin-strawberry-chantilly-cloud",
    title: "Fresh Mahabaleshwar Strawberry & Mascarpone Chantilly Cake",
    category: "anniversary",
    tags: ["strawberry", "berry", "fresh fruit", "chantilly", "vanilla", "summer", "anniversary", "light"],
    img: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    servings: "10–12 Guests",
    aspect: "tall",
  },
  {
    id: "pin-salted-caramel-lotus-biscoff",
    title: "Belgian Lotus Biscoff & Sea-Salt Caramel Speculoos Cake",
    category: "luxury",
    tags: ["biscoff", "lotus", "caramel", "butterscotch", "coffee", "corporate", "office", "boss"],
    img: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1299,
    servings: "10–12 Guests",
    badge: "BISCOFF DRIP",
    aspect: "classic",
  },
  {
    id: "pin-cricket-pitch-champion",
    title: "Cricket Stadium Trophy & Bat Fondant Theme Cake",
    category: "kids",
    tags: ["cricket", "sports", "football", "gym", "ipl", "boys", "dad", "brother", "husband"],
    img: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.5 Kg",
    priceInr: 1899,
    servings: "15–18 Guests",
    badge: "CRICKET THEME",
    aspect: "square",
  },
  {
    id: "pin-pinata-hammer-surprise",
    title: "3D Belgian Chocolate Pinata Hammer Smash Heart Cake",
    category: "photo",
    tags: ["pinata", "hammer", "smash", "surprise", "heart", "chocolate shell", "money pull out"],
    img: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=900&q=80",
    startingWeight: "1.0 Kg",
    priceInr: 1399,
    servings: "8–10 Guests",
    badge: "WITH HAMMER",
    aspect: "square",
  },
  {
    id: "pin-groom-black-gold-whiskey",
    title: "Noir Black & 24K Gold Gentleman King Crown Cake",
    category: "bride",
    tags: ["groom", "king", "black and gold", "husband", "men birthday", "boss", "30th birthday", "luxury"],
    img: "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png",
    startingWeight: "1.5 Kg",
    priceInr: 1849,
    servings: "15–18 Guests",
    badge: "GENTLEMAN EDITION",
    aspect: "tall",
  },
];

export default function CustomBuilder() {
  const { toast } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedWeight, setSelectedWeight] = useState("1.0 Kg");
  const [selectedFlavor, setSelectedFlavor] = useState("Belgian Chocolate Truffle");
  const [customPasteUrl, setCustomPasteUrl] = useState("");
  const [previewPin, setPreviewPin] = useState<CakePin | null>(null);
  const [customNote, setCustomNote] = useState("");

  // Live Wikimedia Commons / Web Cake Image Search for any custom keyword typed by user
  const [webPins, setWebPins] = useState<CakePin[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setWebPins([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingWeb(true);
      try {
        const searchTerm = q.toLowerCase().includes("cake") ? q : `${q} cake`;
        const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
          searchTerm
        )}&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=700&format=json&origin=*`;

        const res = await fetch(apiUrl);
        const data = await res.json();
        const pages = data?.query?.pages ? Object.values(data.query.pages) : [];

        const fetched: CakePin[] = [];
        for (const p of pages as any[]) {
          const thumb = p?.imageinfo?.[0]?.thumburl || p?.imageinfo?.[0]?.url;
          const rawTitle: string = (p?.title || "").replace(/^File:/i, "").replace(/\.[a-zA-Z0-9]+$/, "").replace(/[_-]+/g, " ");
          if (
            thumb &&
            !thumb.endsWith(".svg") &&
            !thumb.endsWith(".pdf") &&
            !thumb.endsWith(".tif")
          ) {
            fetched.push({
              id: `web-${p.pageid}`,
              title: rawTitle.length > 48 ? rawTitle.slice(0, 48) + "..." : rawTitle || `${q} Custom Cake`,
              category: "custom",
              tags: [q.toLowerCase(), "custom", "pinterest"],
              img: thumb,
              startingWeight: selectedWeight,
              priceInr: 1199,
              servings: "10–12 Guests",
              badge: "LIVE WEB DESIGN",
              aspect: fetched.length % 2 === 0 ? "tall" : "square",
            });
          }
        }
        setWebPins(fetched);
      } catch {
        setWebPins([]);
      } finally {
        setIsSearchingWeb(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedWeight]);

  // Filter curated pins + merge live web search pins
  const displayedPins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filteredLocal = CURATED_PINS.filter((pin) => {
      const matchesCat = activeCategory === "all" || pin.category === activeCategory;
      if (!q) return matchesCat;
      const inTitle = pin.title.toLowerCase().includes(q);
      const inTags = pin.tags.some((t) => t.toLowerCase().includes(q));
      const inCat = pin.category.toLowerCase().includes(q);
      return inTitle || inTags || inCat;
    });

    if (!q) return filteredLocal;

    // Combine matching local curated pins with live web cake pins
    return [...filteredLocal, ...webPins];
  }, [searchQuery, activeCategory, webPins]);

  // Build WhatsApp URL with the Cake Image URL + details so it shows directly in WhatsApp chat
  const buildWhatsAppLink = (pin: CakePin, extraNote?: string) => {
    const lines = [
      `Hi CakeUrban! 🎂 Mujhe ye custom cake design pasand aaya hai:`,
      ``,
      `📌 *Cake Design*: ${pin.title}`,
      `🖼️ *Cake Image Link*: ${pin.img}`,
      `⚖️ *Preferred Weight*: ${selectedWeight} (100% Eggless)`,
      `🍫 *Flavor*: ${selectedFlavor}`,
      `💰 *Ref Starting Price*: ₹${pin.priceInr}`,
    ];
    if (extraNote && extraNote.trim()) {
      lines.push(`✍️ *Custom Note / Message*: ${extraNote.trim()}`);
    }
    lines.push(``, `Please share final price & delivery availability!`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleCustomLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPasteUrl.trim()) {
      toast("error", "Please paste a Pinterest / Instagram link or cake description!");
      return;
    }
    const msg = [
      `Hi CakeUrban! 🎂 Maine Pinterest/Instagram par ek custom cake dekha hai:`,
      ``,
      `🔗 *Reference Link / Idea*: ${customPasteUrl.trim()}`,
      `⚖️ *Weight*: ${selectedWeight} (100% Eggless)`,
      `🍫 *Flavor*: ${selectedFlavor}`,
      ``,
      `Please check this image/link and share price & availability!`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-5 sm:py-10">
      {/* Hero Header + Pinterest-Style Search Bar */}
      <div className="relative overflow-hidden border border-ink-700/70 bg-gradient-to-b from-ink-850 via-ink-900 to-ink-950 p-4 sm:p-8 clip-tile mb-5 sm:mb-8">
        <div className="max-w-3xl mx-auto text-center space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E60023]/15 border border-[#E60023]/40 text-[#ff4d67] font-mono text-[9px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.18em] uppercase font-bold max-w-full">
            <span className="w-2 h-2 rounded-full bg-[#E60023] animate-ping shrink-0" />
            <span className="truncate">Pinterest Custom Cake Discovery · 100% Eggless</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Search Any <span className="text-blaze-500">Dream Cake</span> & Chat on WhatsApp
          </h1>

          <p className="text-ink-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Apna pasandida cake design search karein, aur kisi bhi photo ke niche{" "}
            <span className="text-emerald-400 font-semibold">"Chat About This Cake"</span> dabayein — cake ki photo ke sath seedha WhatsApp par baat karein!
          </p>

          {/* Main Pinterest Search Input */}
          <div className="pt-2">
            <div className="relative flex items-center bg-ink-950 border-2 border-ink-700 focus-within:border-blaze-500 rounded-full overflow-hidden shadow-2xl transition-colors">
              <span className="pl-4 sm:pl-5 text-ink-400">
                <Ic.search className="w-4 h-4 sm:w-5 sm:h-5 text-blaze-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Pinterest cakes: 'Butterfly', 'Spiderman', '2 Tier Wedding', 'Heart'..."
                className="w-full bg-transparent px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-ink-50 placeholder-ink-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-2.5 text-ink-400 hover:text-ink-100 font-mono text-xs"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("pins-grid");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="mr-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] sm:text-xs uppercase font-bold tracking-wider transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </div>

          {/* Popular Search Chips (Scrollable on Mobile) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5 justify-start sm:justify-center">
            <span className="font-mono text-[9px] uppercase tracking-wider text-ink-400 shrink-0">Trending:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchQuery(term);
                  setActiveCategory("all");
                }}
                className={`px-2.5 py-1 rounded-full font-mono text-[10px] border transition-colors shrink-0 ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? "bg-blaze-500 text-white border-blaze-500 font-bold"
                    : "bg-ink-900/90 text-ink-300 border-ink-700 hover:border-blaze-400 hover:text-ink-100"
                }`}
              >
                🔍 {term}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Weight & Flavor Selector Strip (Included in WhatsApp Message Automatically!) */}
        <div className="mt-5 pt-4 border-t border-ink-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="font-mono text-[10px] uppercase text-gold-400 shrink-0">1. Weight:</span>
            {["0.5 Kg", "1.0 Kg", "1.5 Kg", "2.0 Kg (2-Tier)", "3.0 Kg+"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWeight(w)}
                className={`px-2.5 py-1 rounded font-mono text-[10px] border transition-colors shrink-0 ${
                  selectedWeight === w
                    ? "bg-volt-400/20 border-volt-400 text-volt-400 font-bold"
                    : "bg-ink-950 border-ink-700 text-ink-300"
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase text-gold-400 shrink-0">2. Flavor:</span>
            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              aria-label="Select cake flavor"
              className="bg-ink-950 border border-ink-700 focus:border-blaze-500 rounded px-2.5 py-1 text-xs font-mono text-ink-100 outline-none flex-1 sm:flex-initial"
            >
              <option value="Belgian Chocolate Truffle">Belgian Chocolate Truffle</option>
              <option value="Red Velvet Cream Cheese">Red Velvet Cream Cheese</option>
              <option value="Fresh Pineapple Cloud">Fresh Pineapple Cloud</option>
              <option value="Butterscotch Caramel Crunch">Butterscotch Caramel Crunch</option>
              <option value="Royal Rasmalai Pistachio">Royal Rasmalai Pistachio</option>
              <option value="Lotus Biscoff Speculoos">Lotus Biscoff Speculoos</option>
              <option value="Fresh Strawberry Vanilla">Fresh Strawberry Vanilla</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs (Scrollable on Mobile) */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              if (searchQuery) setSearchQuery("");
            }}
            className={`px-3.5 sm:px-4 py-2 rounded-full font-mono text-[10px] sm:text-xs uppercase tracking-wider border transition-all shrink-0 ${
              activeCategory === cat.id && !searchQuery
                ? "bg-blaze-500 text-white border-blaze-500 font-bold shadow-lg shadow-blaze-500/25"
                : "bg-ink-900 text-ink-300 border-ink-700/80 hover:border-ink-500"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Status Bar when Searching */}
      {searchQuery.trim() !== "" && (
        <div className="flex items-center justify-between gap-2 mb-4 px-1">
          <p className="font-mono text-xs text-ink-300">
            Showing custom cake designs for <span className="text-blaze-400 font-bold">"{searchQuery}"</span>{" "}
            {isSearchingWeb && <span className="text-gold-400 animate-pulse">(Fetching more live pins...)</span>}
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="font-mono text-[11px] text-blaze-400 hover:underline"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Pinterest-Style Responsive Feed (2 Columns on Phone, 3 on Tablet, 4 on Desktop) */}
      <div id="pins-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {displayedPins.map((pin) => {
          const waHref = buildWhatsAppLink(pin);

          return (
            <div
              key={pin.id}
              className="group bg-ink-900 border border-ink-800 hover:border-blaze-500/60 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-blaze-500/10 min-w-0"
            >
              {/* Cake Image Container */}
              <div>
                <div
                  onClick={() => setPreviewPin(pin)}
                  className="relative aspect-[4/5] bg-ink-950 overflow-hidden cursor-pointer"
                >
                  <img
                    src={pin.img}
                    alt={pin.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
                    {pin.badge ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-950/85 backdrop-blur-sm border border-ink-700 font-mono text-[7.5px] sm:text-[9px] tracking-wider uppercase text-gold-400 font-bold truncate max-w-[68%]">
                        {pin.badge}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="px-1.5 py-0.5 rounded-full bg-[#E60023] text-white font-mono text-[7.5px] sm:text-[9px] font-bold uppercase shadow shrink-0">
                      📌 Pin
                    </span>
                  </div>

                  {/* Bottom Gradient Overlay with Weight & Price */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent p-2.5 sm:p-3 pt-8 flex items-end justify-between">
                    <div>
                      <span className="font-mono text-[9px] text-emerald-400 uppercase block">100% Eggless</span>
                      <span className="font-mono text-[10px] sm:text-xs text-ink-200 font-bold">
                        From {pin.startingWeight}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[9px] text-ink-400 block">Starts at</span>
                      <span className="font-display font-black text-sm sm:text-base text-volt-400">
                        ₹{pin.priceInr}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cake Title */}
                <div className="p-2.5 sm:p-3.5 pb-2">
                  <h3
                    onClick={() => setPreviewPin(pin)}
                    className="font-display font-bold text-xs sm:text-sm text-ink-50 group-hover:text-blaze-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {pin.title}
                  </h3>
                  <p className="font-mono text-[9px] sm:text-[10px] text-ink-400 mt-1 truncate">
                    {selectedWeight} · {selectedFlavor.split(" ")[0]}
                  </p>
                </div>
              </div>

              {/* Direct "Chat About This Cake" WhatsApp Button Under Every Image */}
              <div className="p-2 sm:p-3.5 pt-1">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-[9.5px] sm:text-xs font-extrabold uppercase tracking-tight sm:tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 shadow-md transition-all active:scale-95 min-w-0"
                >
                  <Ic.whatsapp className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current shrink-0" />
                  <span className="truncate">Chat About This Cake</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty Search Fallback — Let Customer Send Their Exact Search Query to WhatsApp */}
      {displayedPins.length === 0 && !isSearchingWeb && (
        <div className="my-8 p-6 sm:p-10 bg-ink-900 border border-ink-700 rounded-xl text-center max-w-xl mx-auto space-y-4">
          <p className="font-display text-lg sm:text-2xl font-bold uppercase text-ink-50">
            Want a Custom <span className="text-blaze-400">"{searchQuery}"</span> Cake?
          </p>
          <p className="text-xs sm:text-sm text-ink-300">
            Hamare master chefs koi bhi custom design 100% pure eggless me bana sakte hain! Niche click karein aur seedha WhatsApp par apna design batayein.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hi CakeUrban! 🎂 Mujhe "${searchQuery}" theme me custom cake chahiye (${selectedWeight}, ${selectedFlavor}). Please share sample photos & price!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-bold uppercase tracking-wider"
          >
            <Ic.whatsapp className="w-4 h-4 fill-current" /> Chat About "{searchQuery}" Cake on WhatsApp
          </a>
        </div>
      )}

      {/* Paste Any Pinterest / Instagram Link Banner at Bottom */}
      <div className="mt-8 sm:mt-12 border border-ink-700/80 bg-ink-850 p-4 sm:p-7 clip-tile">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 items-center">
          <div className="min-w-0">
            <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase font-bold">
              📌 Have a Pinterest or Instagram Link?
            </span>
            <h2 className="font-display text-lg sm:text-2xl font-black uppercase mt-1">
              Paste Any Cake Link or Idea & Get Instant Quote
            </h2>
            <p className="text-xs sm:text-sm text-ink-300 mt-1">
              Agar aapke paas Pinterest/Instagram ka koi link ya screenshot hai, toh yahan paste karein ya WhatsApp par photo bhejein.
            </p>
          </div>

          <form onSubmit={handleCustomLinkSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customPasteUrl}
              onChange={(e) => setCustomPasteUrl(e.target.value)}
              placeholder="Paste Pinterest link or describe your dream cake..."
              className="flex-1 bg-ink-950 border border-ink-700 focus:border-blaze-500 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-ink-100 outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0"
            >
              <Ic.whatsapp className="w-4 h-4 fill-current" /> Send to WhatsApp
            </button>
          </form>
        </div>
      </div>

      {/* Quick Pin Zoom & Customize Modal when User Taps a Cake Photo */}
      {previewPin && (
        <div
          onClick={() => setPreviewPin(null)}
          className="fixed inset-0 z-[95] bg-ink-950/85 backdrop-blur-sm p-3.5 sm:p-6 flex items-center justify-center overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-ink-900 border border-ink-700 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl grid grid-cols-1 sm:grid-cols-2"
          >
            <div className="relative aspect-square sm:aspect-auto sm:h-full bg-ink-950">
              <img src={previewPin.img} alt={previewPin.title} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPreviewPin(null)}
                className="sm:hidden absolute top-3 right-3 w-8 h-8 rounded-full bg-ink-950/80 text-white grid place-items-center"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-gold-400 uppercase tracking-wider">
                    📌 Custom Cake Pin
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewPin(null)}
                    className="hidden sm:inline-block text-ink-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="font-display text-lg sm:text-xl font-black uppercase text-ink-50 mt-1">
                  {previewPin.title}
                </h3>
                <p className="font-mono text-xs text-volt-400 font-bold mt-1">
                  Starting at ₹{previewPin.priceInr} ({previewPin.startingWeight} · 100% Eggless)
                </p>

                <div className="space-y-3 mt-4">
                  <div>
                    <label className="block font-mono text-[10px] text-ink-400 uppercase mb-1">
                      Select Weight
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {["0.5 Kg", "1.0 Kg", "1.5 Kg", "2.0 Kg (2-Tier)", "3.0 Kg+"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWeight(w)}
                          className={`px-2.5 py-1 rounded font-mono text-[10px] border ${
                            selectedWeight === w
                              ? "bg-blaze-500 text-white border-blaze-500 font-bold"
                              : "bg-ink-950 text-ink-300 border-ink-700"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] text-ink-400 uppercase mb-1">
                      Cake Message / Custom Request (Optional)
                    </label>
                    <input
                      type="text"
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="e.g. Happy Birthday Aarav! Make it Pink..."
                      className="w-full bg-ink-950 border border-ink-700 rounded px-3 py-2 text-xs text-ink-100 outline-none focus:border-blaze-500"
                    />
                  </div>
                </div>
              </div>

              <a
                href={buildWhatsAppLink(previewPin, customNote)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <Ic.whatsapp className="w-4 h-4 fill-current" />
                Chat About This Cake on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
