export type ColorWay = { name: string; hex: string; filter?: string };
export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  img: string;
  imgFilter?: string;
  tag?: string;
  rating: number;
  ratingCount: number;
  stock: number;
  sku: string;
  colors: ColorWay[];
  sizes: string[];
  desc: string;
  specs: [string, string][];
  featured?: boolean;
};

const IMG = {
  sneaker: "https://image.qwenlm.ai/generated-images/28775e2b-0e22-4188-a275-25c520509433/_result.png",
  headphones: "https://image.qwenlm.ai/generated-images/36d09224-d210-4416-bb59-700a88cf4166/_result.png",
  watch: "https://image.qwenlm.ai/generated-images/c890c539-8d6f-4ad2-9232-3ca72a9f477f/_result.png",
  backpack: "https://image.qwenlm.ai/generated-images/8b10690f-cb85-4740-ab9a-2e53506d193b/_result.png",
  sunglasses: "https://image.qwenlm.ai/generated-images/70cda3ac-5770-4a0d-a61d-ea8f5e3e71d8/_result.png",
  speaker: "https://image.qwenlm.ai/generated-images/5829c5ec-f8a9-4f76-95c4-4c2a7386f5cf/_result.png",
  jacket: "https://image.qwenlm.ai/generated-images/7b793936-7054-45e7-9b76-3e4f060f484c/_result.png",
  earbuds: "https://image.qwenlm.ai/generated-images/dc9b2344-efad-4da2-a181-6c25625550cd/_result.png",
  lifestyle: "https://image.qwenlm.ai/generated-images/1de31092-bfb9-4a20-993e-a5c26331b476/_result.png",
};
export const LIFESTYLE_IMG = IMG.lifestyle;

export const CATEGORIES = [
  { name: "Footwear", subs: ["Running", "Training", "Lifestyle"], img: IMG.sneaker },
  { name: "Audio", subs: ["Headphones", "Earbuds", "Speakers"], img: IMG.headphones },
  { name: "Wearables", subs: ["Smartwatches", "Trackers"], img: IMG.watch },
  { name: "Apparel", subs: ["Shells", "Base Layers"], img: IMG.jacket },
  { name: "Accessories", subs: ["Carry", "Eyewear"], img: IMG.backpack },
];

export const BRANDS = ["VOLTA Lab", "Aeon", "Northline", "Kinetik"];

export const PRODUCTS: Product[] = [
  {
    id: "velocity-x1", name: "Velocity Runner X1", brand: "VOLTA Lab", category: "Footwear",
    price: 189, compareAt: 240, img: IMG.sneaker, tag: "BEST SELLER",
    rating: 4.8, ratingCount: 2314, stock: 14, sku: "VL-FW-0189",
    colors: [
      { name: "Blaze", hex: "#ff4d12" },
      { name: "Cobalt", hex: "#3e63dd", filter: "hue-rotate(205deg) saturate(1.15)" },
      { name: "Bone", hex: "#c2cadb", filter: "grayscale(0.9) brightness(1.35)" },
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
    desc: "A carbon-plated racer tuned for daily velocity. The X1 pairs a supercritical foam midsole with an engineered knit upper that disappears on foot — 212 grams of pure forward intent.",
    specs: [["Weight", "212 g (US 9)"], ["Drop", "8 mm"], ["Plate", "Full-length carbon"], ["Foam", "HyperCell™ supercritical"], ["Upper", "Engineered aero-knit"], ["Best for", "Tempo / race day"]],
    featured: true,
  },
  {
    id: "aero-anc-700", name: "Aero ANC 700", brand: "Aeon", category: "Audio",
    price: 329, img: IMG.headphones, tag: "NEW",
    rating: 4.9, ratingCount: 1841, stock: 9, sku: "AE-AU-0329",
    colors: [
      { name: "Graphite", hex: "#2a3240" },
      { name: "Sage", hex: "#8fae8b", filter: "hue-rotate(70deg) saturate(0.55) brightness(1.1)" },
    ],
    sizes: ["One size"],
    desc: "Adaptive noise cancelling that reads the room 500 times per second. Titanium-coated 40 mm drivers, spatial audio with head tracking, and 42 hours of playback.",
    specs: [["Driver", "40 mm titanium-coated"], ["ANC", "Adaptive, -48 dB"], ["Battery", "42 h (ANC on)"], ["Codec", "LDAC / aptX Lossless"], ["Weight", "248 g"], ["Charge", "USB-C, 5 min = 4 h"]],
    featured: true,
  },
  {
    id: "pulse-s-ti", name: "Pulse S Titanium", brand: "VOLTA Lab", category: "Wearables",
    price: 399, compareAt: 449, img: IMG.watch,
    rating: 4.7, ratingCount: 963, stock: 6, sku: "VL-WB-0399",
    colors: [{ name: "Titanium", hex: "#76839c" }, { name: "Blaze band", hex: "#ff4d12", filter: "hue-rotate(-25deg) saturate(1.3)" }],
    sizes: ["42 mm", "46 mm"],
    desc: "Grade-5 titanium case, dual-band GPS, and a waveform display that renders your effort in real time. 14-day battery, 10 ATM, built for the long haul.",
    specs: [["Case", "Grade-5 titanium"], ["GPS", "Dual-band L1+L5"], ["Battery", "14 days typical"], ["WR", "10 ATM / EN13319"], ["Sensors", "HR, SpO₂, ECG, temp"], ["Display", "1.43″ AMOLED 2000 nit"]],
    featured: true,
  },
  {
    id: "metro-carry-22", name: "Metro Carry 22L", brand: "Northline", category: "Accessories",
    price: 145, img: IMG.backpack,
    rating: 4.6, ratingCount: 712, stock: 21, sku: "NL-AC-0145",
    colors: [{ name: "Black", hex: "#141821" }, { name: "Olive", hex: "#6b7a52", filter: "hue-rotate(60deg) saturate(0.6) brightness(0.9)" }],
    sizes: ["22 L"],
    desc: "A weatherproof commuter with a suspended 16″ laptop bay, magnetic quick-access pockets and a clamshell that opens flat for security lines.",
    specs: [["Volume", "22 L"], ["Laptop", 'Up to 16"'], ["Fabric", "420D ripstop, DWR"], ["Access", "Clamshell + quick-draw"], ["Warranty", "Lifetime"], ["Weight", "980 g"]],
  },
  {
    id: "prism-ti", name: "Prism Ti Eyewear", brand: "Aeon", category: "Accessories",
    price: 159, img: IMG.sunglasses, tag: "NEW",
    rating: 4.5, ratingCount: 388, stock: 3, sku: "AE-AC-0159",
    colors: [{ name: "Matte black", hex: "#10131a" }, { name: "Smoke", hex: "#55627a", filter: "hue-rotate(180deg) saturate(0.4) brightness(1.2)" }],
    sizes: ["Standard", "Wide"],
    desc: "Beta-titanium frame at 19 grams. Zeiss-tuned polycarbonate lenses with anti-fog venting — built for sprint sessions and glare-heavy commutes.",
    specs: [["Frame", "Beta-titanium"], ["Weight", "19 g"], ["Lens", "Zeiss-tuned PC, Cat. 3"], ["UV", "100% UVA/UVB"], ["Fit", "Hydrophilic grip pads"], ["Case", "Hard shell included"]],
  },
  {
    id: "orb-360", name: "Orb 360 Speaker", brand: "Aeon", category: "Audio",
    price: 129, compareAt: 159, img: IMG.speaker,
    rating: 4.4, ratingCount: 1102, stock: 34, sku: "AE-AU-0129",
    colors: [{ name: "Charcoal", hex: "#2a3240" }, { name: "Blaze cap", hex: "#ff4d12", filter: "hue-rotate(-30deg) saturate(1.4)" }],
    sizes: ["One size"],
    desc: "Room-filling 360° sound from a cylinder that fits in a bottle cage. IP67, 20-hour battery, and pair-to-stereo with a second Orb.",
    specs: [["Output", "30 W 360°"], ["Rating", "IP67"], ["Battery", "20 h"], ["Pairing", "Stereo link ×2"], ["Range", "Bluetooth 5.4, 30 m"], ["Weight", "640 g"]],
  },
  {
    id: "storm-shell-3l", name: "Storm Shell 3L", brand: "Northline", category: "Apparel",
    price: 289, img: IMG.jacket, tag: "LIMITED",
    rating: 4.8, ratingCount: 456, stock: 4, sku: "NL-AP-0289",
    colors: [{ name: "Black", hex: "#10131a" }, { name: "Ember", hex: "#ff6b35", filter: "hue-rotate(-35deg) saturate(1.6) brightness(1.05)" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    desc: "A 3-layer waterproof shell with fully taped seams, helmet-compatible hood and laser-cut venting. Packs into its own chest pocket at 310 grams.",
    specs: [["Fabric", "3L waterproof 28k/25k"], ["Seams", "Fully taped"], ["Weight", "310 g"], ["Packs", "Into chest pocket"], ["Hood", "Helmet-compatible"], ["Vents", "Laser-cut underarm"]],
    featured: true,
  },
  {
    id: "drift-buds-pro", name: "Drift Buds Pro", brand: "Aeon", category: "Audio",
    price: 149, img: IMG.earbuds,
    rating: 4.6, ratingCount: 2980, stock: 41, sku: "AE-AU-0149",
    colors: [{ name: "Onyx", hex: "#141821" }, { name: "Blaze dot", hex: "#ff4d12", filter: "hue-rotate(-20deg) saturate(1.5)" }],
    sizes: ["One size"],
    desc: "Six-mic adaptive ANC in a 4.1-gram bud. Lossless over LE Audio, wireless charging case, and a transparency mode that actually sounds natural.",
    specs: [["ANC", "Adaptive 6-mic"], ["Weight", "4.1 g / bud"], ["Battery", "9 h + 27 h case"], ["Audio", "LE Audio lossless"], ["Rating", "IPX5"], ["Latency", "38 ms game mode"]],
  },
  {
    id: "velocity-x1-cobalt", name: 'Velocity X1 "Cobalt Edition"', brand: "VOLTA Lab", category: "Footwear",
    price: 209, img: IMG.sneaker, imgFilter: "hue-rotate(205deg) saturate(1.2)", tag: "LIMITED",
    rating: 4.9, ratingCount: 642, stock: 8, sku: "VL-FW-0209",
    colors: [{ name: "Cobalt", hex: "#3e63dd" }],
    sizes: ["US 8", "US 9", "US 10", "US 11", "US 12"],
    desc: "The X1 racer in a numbered cobalt colorway — 500 pairs worldwide, each with a laser-etched serial on the heel plate.",
    specs: [["Weight", "212 g (US 9)"], ["Edition", "Numbered /500"], ["Plate", "Full-length carbon"], ["Foam", "HyperCell™ supercritical"], ["Upper", "Engineered aero-knit"], ["Box", "Collector slipcase"]],
    featured: true,
  },
  {
    id: "aero-anc-sage", name: 'Aero ANC 700 "Sage"', brand: "Aeon", category: "Audio",
    price: 329, img: IMG.headphones, imgFilter: "hue-rotate(70deg) saturate(0.5) brightness(1.05)",
    rating: 4.8, ratingCount: 511, stock: 12, sku: "AE-AU-0331",
    colors: [{ name: "Sage", hex: "#8fae8b" }],
    sizes: ["One size"],
    desc: "The ANC 700 in a botanical sage finish with anodized aluminum yokes. Same adaptive silence, softer edges.",
    specs: [["Driver", "40 mm titanium-coated"], ["ANC", "Adaptive, -48 dB"], ["Battery", "42 h (ANC on)"], ["Finish", "Anodized sage"], ["Weight", "248 g"], ["Charge", "USB-C fast charge"]],
  },
];

export type Review = { id: string; productId: string; name: string; rating: number; title: string; text: string; date: string; hasImage?: boolean };

export const SEED_REVIEWS: Review[] = [
  { id: "r1", productId: "velocity-x1", name: "Amara Osei", rating: 5, title: "Illegal levels of fast", text: "Ran a 10K PB by 41 seconds in these. The plate snaps you forward without feeling harsh. Best racer I've owned.", date: "2026-01-18", hasImage: true },
  { id: "r2", productId: "velocity-x1", name: "Diego Fuentes", rating: 5, title: "Worth every cent", text: "The knit upper locks the midfoot perfectly. Zero break-in time.", date: "2026-01-05" },
  { id: "r3", productId: "velocity-x1", name: "Priya Nair", rating: 4, title: "Nearly perfect", text: "Runs slightly narrow — size up half a size if you're between. Otherwise phenomenal energy return.", date: "2025-12-22" },
  { id: "r4", productId: "aero-anc-700", name: "Jonas Keller", rating: 5, title: "Silence, engineered", text: "The adaptive ANC erases my open-plan office. Transparency mode sounds like real ears.", date: "2026-02-01", hasImage: true },
  { id: "r5", productId: "aero-anc-700", name: "Mei Tanaka", rating: 5, title: "42 hours is real", text: "Charged them once in two weeks of commuting. LDAC quality is stunning.", date: "2026-01-14" },
  { id: "r6", productId: "pulse-s-ti", name: "Sam Whitfield", rating: 5, title: "GPS lock is instant", text: "Dual-band GPS traces city canyons perfectly. Battery does 13 days with always-on display.", date: "2026-01-27" },
  { id: "r7", productId: "pulse-s-ti", name: "Lena Hoffmann", rating: 4, title: "Beautiful hardware", text: "Titanium feels premium, strap swaps in seconds. App could use more watch faces.", date: "2025-12-30" },
  { id: "r8", productId: "storm-shell-3l", name: "Ravi Menon", rating: 5, title: "Survived a Scottish winter", text: "Fully waterproof through sideways rain. Packs down to nothing.", date: "2026-01-20", hasImage: true },
  { id: "r9", productId: "drift-buds-pro", name: "Carla Reyes", rating: 5, title: "Tiny, mighty", text: "Forget they're in until the music stops. Game mode latency is genuinely low.", date: "2026-02-06" },
  { id: "r10", productId: "orb-360", name: "Theo Brandt", rating: 4, title: "Big room sound", text: "Fills my whole studio. Wish it had an aux input, but stereo pairing fixes everything else.", date: "2026-01-09" },
];

export type BlogPost = { slug: string; title: string; tag: string; date: string; read: string; excerpt: string; img: string; body: string[] };

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "carbon-plates-explained", title: "Carbon Plates, Explained by the Engineers Who Tune Them", tag: "ENGINEERING", date: "2026-02-08", read: "8 min",
    excerpt: "Why a plate is never 'stiff' or 'soft' — it's a spring tuned to your stride frequency. Our propulsion lab opens its data.",
    img: IMG.sneaker,
    body: [
      "Every plate we ship is tested against 214 stride signatures before a single pair leaves the lab. The goal is not maximum stiffness — it's the right stiffness at the right moment of toe-off, and that moment shifts with your cadence.",
      "HyperCell™ foam stores roughly 87% of impact energy; the carbon plate decides where that energy goes. Tune it too aggressive and you fight the shoe at easy paces. Tune it too soft and it disappears at 4:00/km.",
      "The X1 sits at what we call the 'velocity window' — a rocker geometry that engages from 3:10 to 5:30 per kilometre. That's why the same shoe feels like a trainer on recovery days and a racer on threshold Tuesdays.",
      "Our advice: don't chase plate hype, chase fit. A perfectly tuned plate in the wrong last is slower than a modest plate on a foot that trusts it.",
    ],
  },
  {
    slug: "anc-that-reads-the-room", title: "Designing ANC That Reads the Room 500 Times a Second", tag: "AUDIO", date: "2026-01-24", read: "6 min",
    excerpt: "Adaptive noise cancelling is a prediction problem. Here's how the Aero 700 models your acoustic world before it happens.",
    img: IMG.headphones,
    body: [
      "Classic ANC reacts. Adaptive ANC predicts. The Aero 700 samples your environment 500 times per second and runs a lightweight acoustic model that anticipates the next 40 milliseconds of noise.",
      "That lookahead is why office chatter dissolves instead of merely dimming — speech is periodic enough to model, which is exactly where reactive systems fall apart.",
      "We also tune transparency to your ear canal geometry at first pairing. Two minutes of calibration, and the world outside sounds like it does with nothing in your ears.",
    ],
  },
  {
    slug: "city-proof-carry", title: "The Anatomy of a City-Proof Carry System", tag: "DESIGN", date: "2026-01-11", read: "5 min",
    excerpt: "A commuter bag fails in dozens of tiny moments. We obsessed over each one so the Metro Carry doesn't.",
    img: IMG.backpack,
    body: [
      "The average commuter opens their bag 14 times a day. Multiply the friction of each opening by a year and you understand why we prototyped the Metro's magnetic quick-draw pocket 61 times.",
      "The suspended laptop bay isn't marketing — it keeps 400 grams of aluminum off your spine line, which changes how the whole pack hangs after hour three.",
      "And the clamshell opening exists for one ritual: the security line. Flat, visible, done in eight seconds.",
    ],
  },
];

export type Coupon = { code: string; type: "percent" | "fixed" | "ship"; value: number; min: number; expires: string; limit: number; used: number; active: boolean };

export const SEED_COUPONS: Coupon[] = [
  { code: "WELCOME10", type: "percent", value: 10, min: 0, expires: "2026-12-31", limit: 10000, used: 3421, active: true },
  { code: "VOLT25", type: "fixed", value: 25, min: 200, expires: "2026-06-30", limit: 2000, used: 618, active: true },
  { code: "FREESHIP", type: "ship", value: 0, min: 0, expires: "2026-09-30", limit: 5000, used: 1204, active: true },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", rate: 1 },
  { code: "EUR", symbol: "€", rate: 0.92 },
  { code: "GBP", symbol: "£", rate: 0.79 },
  { code: "INR", symbol: "₹", rate: 83.4 },
];

export type CartItem = { productId: string; color: string; size: string; qty: number };
export type Address = { id: string; label: string; name: string; line1: string; city: string; zip: string; country: string; phone: string };
export type PaymentMethod = { id: string; brand: string; last4: string; exp: string };
export type OrderItem = { productId: string; name: string; img: string; imgFilter?: string; color: string; size: string; qty: number; price: number };
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type Order = {
  id: string; email: string; items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number;
  status: OrderStatus; date: string; address: string; method: string; payment: string; timeline: { status: OrderStatus; at: string }[];
};

export type Customer = { id: string; name: string; email: string; joined: string; orders: number; spend: number; blocked: boolean };
export const SEED_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Amara Osei", email: "amara@runmail.com", joined: "2025-03-12", orders: 7, spend: 1420, blocked: false },
  { id: "c2", name: "Diego Fuentes", email: "diego.f@fastmail.io", joined: "2025-05-02", orders: 4, spend: 812, blocked: false },
  { id: "c3", name: "Priya Nair", email: "priya.n@gmail.com", joined: "2025-06-19", orders: 11, spend: 2340, blocked: false },
  { id: "c4", name: "Jonas Keller", email: "jonas.k@web.de", joined: "2025-08-07", orders: 3, spend: 701, blocked: false },
  { id: "c5", name: "Mei Tanaka", email: "mei.t@icloud.com", joined: "2025-09-23", orders: 6, spend: 1180, blocked: false },
  { id: "c6", name: "Sam Whitfield", email: "samw@outlook.com", joined: "2025-11-01", orders: 2, spend: 548, blocked: true },
  { id: "c7", name: "Lena Hoffmann", email: "lena.h@gmx.de", joined: "2025-12-14", orders: 5, spend: 990, blocked: false },
  { id: "c8", name: "Ravi Menon", email: "ravi.m@proton.me", joined: "2026-01-08", orders: 1, spend: 289, blocked: false },
];

export type Staff = { id: string; name: string; email: string; role: "Super Admin" | "Manager" | "Staff"; lastActive: string };
export const SEED_STAFF: Staff[] = [
  { id: "s1", name: "Alex Voss", email: "admin@volta.shop", role: "Super Admin", lastActive: "2026-02-11 09:41" },
  { id: "s2", name: "Mira Chen", email: "mira@volta.shop", role: "Manager", lastActive: "2026-02-11 08:15" },
  { id: "s3", name: "Devon Park", email: "devon@volta.shop", role: "Staff", lastActive: "2026-02-10 17:52" },
];

export type Faq = { q: string; a: string };
export const SEED_FAQS: Faq[] = [
  { q: "How long does shipping take?", a: "Express orders ship within 24h and arrive in 2–4 business days. Standard arrives in 5–8 business days. Free express shipping on orders over $150." },
  { q: "What is your return policy?", a: "30 days, unworn, in original packaging. Start a return from your account dashboard — we email a prepaid label instantly." },
  { q: "Do you ship internationally?", a: "Yes — we ship to 40+ countries. Duties are calculated at checkout so there are no surprises at the door." },
  { q: "How do warranty claims work?", a: "Every product carries at least a 2-year warranty. Contact support with your order number and we'll arrange repair or replacement." },
];

export const HERO_DEFAULT = {
  kicker: "FW/26 COLLECTION — LIVE NOW",
  titleA: "GEAR IN",
  titleB: "MOTION",
  sub: "Engineered footwear, adaptive audio and titanium wearables — built in our propulsion lab, tested at race pace, delivered in 48 hours.",
};
