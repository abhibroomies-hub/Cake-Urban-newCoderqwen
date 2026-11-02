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
  /** background-position for 2×2 grid source images — renders the quadrant as the product photo */
  crop?: string;
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
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string;
};

const IMG = {
  hero: "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png",
  cakes: "https://image.qwenlm.ai/generated-images/3375943d-96a8-43e8-9ab9-dbf92467ce64/_result.png",
  cookies: "https://image.qwenlm.ai/generated-images/31255ff8-a239-432f-8d31-296fe494f4c1/_result.png",
};
export const LIFESTYLE_IMG = IMG.hero;

/* quadrant positions for the 2×2 sheet images */
export const CROP = { TL: "0% 0%", TR: "100% 0%", BL: "0% 100%", BR: "100% 100%" };

export type Category = {
  id: string;
  name: string;
  subs: string[];
  img: string;
  crop?: string;
  tag?: string;
  desc?: string;
  showOnHome: boolean;
  showInNav: boolean;
};

export const CATEGORIES: Category[] = [
  { id: "cat-cookies", name: "Cookies", subs: ["Choc Chip", "Macaron", "Butter Cookies", "Biscotti"], img: IMG.cookies, crop: CROP.TL, showOnHome: true, showInNav: true, tag: "POPULAR", desc: "72-hour cold-fermented cookie dough, molten centers & buttery artisanal crunch" },
  { id: "cat-namkeens", name: "Namkeens", subs: ["Royal Bhujia", "Spicy Mixture", "Roasted Makhana", "Mathri"], img: IMG.cookies, crop: CROP.BL, showOnHome: true, showInNav: true, tag: "CRISPY", desc: "Traditional fusion namkeens, roasted makhana and royal spice blends" },
  { id: "cat-hampers", name: "Gift Hampers", subs: ["Birthday", "Anniversary", "Corporate", "Marriage", "Return Gifts"], img: IMG.hero, showOnHome: true, showInNav: true, tag: "LUXURY", desc: "Exquisite curated gift hampers for birthdays, anniversaries, corporate events & marriages" },
  { id: "cat-seasonal", name: "Seasonal & Festive", subs: ["Festive Boxes", "Party Packs", "Custom Gifting"], img: IMG.cookies, crop: CROP.TR, showOnHome: true, showInNav: true, desc: "Special celebration packs and personalized return gifts" },
];

export type NcrHub = {
  id: string;
  city: string;
  zone: string;
  time: string;
  minOrder: number;
  active: boolean;
  topAreas: string;
  badge: string;
  phone: string;
};

export const SEED_NCR_HUBS: NcrHub[] = [
  { id: "hub-faridabad", city: "Faridabad", zone: "HQ Gifting & Bakehouse", time: "30-40 Mins", minOrder: 299, active: true, topAreas: "NIT 1-5, Sector 14, 15, 16, 21C, Greenfield, Charmwood, Greater Faridabad", badge: "KITCHEN HQ · EXPRESS DISPATCH", phone: "+91 7318531953" },
  { id: "hub-noida", city: "Noida & Gr. Noida", zone: "Express Route 1", time: "35-45 Mins", minOrder: 349, active: true, topAreas: "Sector 18, 50, 62, 75, 76, 128, 137, Noida Ext / Gaur City, Pari Chowk", badge: "SAME DAY DELIVERY", phone: "+91 7318531953" },
  { id: "hub-gurgaon", city: "Gurgaon (Gurugram)", zone: "Cyber Hub Route", time: "40-50 Mins", minOrder: 399, active: true, topAreas: "DLF Phase 1-5, Cyber City, Golf Course Road, Sohna Road, Sector 56, 43, 29", badge: "CORPORATE SPECIAL", phone: "+91 7318531953" },
  { id: "hub-delhi-south", city: "South Delhi", zone: "Express Route 2", time: "35-45 Mins", minOrder: 349, active: true, topAreas: "GK 1 & 2, Saket, Hauz Khas, Defence Colony, Vasant Kunj, Lajpat Nagar, Kalkaji", badge: "FASTEST TRANSIT", phone: "+91 7318531953" },
  { id: "hub-delhi-east", city: "East & Central Delhi", zone: "Express Route 3", time: "45-55 Mins", minOrder: 399, active: true, topAreas: "Connaught Place, Mayur Vihar, Preet Vihar, Laxmi Nagar, Karol Bagh, Chanakyapuri", badge: "EXPRESS HAMPERS", phone: "+91 7318531953" },
  { id: "hub-ghaziabad", city: "Ghaziabad", zone: "Indirapuram Hub", time: "45-55 Mins", minOrder: 399, active: true, topAreas: "Indirapuram, Vaishali, Vasundhara, Raj Nagar Extension, Crossings Republik", badge: "PAN-NCR DISPATCH", phone: "+91 7318531953" },
];

export const BRANDS = ["Noir Collection", "Crumb Lab", "Pâtisserie", "Oven Stories"];

export const PRODUCTS: Product[] = [
  {
    id: "birthday-deluxe-hamper", name: "Royal Birthday Celebration Hamper", brand: "Noir Collection", category: "Gift Hampers",
    price: 79, compareAt: 99, img: IMG.hero, tag: "BEST SELLER",
    rating: 4.9, ratingCount: 1420, stock: 25, sku: "CU-HP-0079",
    colors: [
      { name: "Gold & Black", hex: "#14100e" },
      { name: "Rose Pink", hex: "#e8a0b4", filter: "hue-rotate(-20deg) saturate(1.3)" },
      { name: "Royal Blue", hex: "#2b4c7e", filter: "hue-rotate(180deg) saturate(1.2)" },
    ],
    sizes: ["STANDARD BOX", "GRAND BOX", "VIP TOWER"],
    desc: "The ultimate birthday surprise: a luxurious matte-black gift box packed with artisanal choc-chip cookies, roasted peri-peri makhana, imported roasted almonds, gourmet butter namkeen, celebratory candles, and a personalized birthday card.",
    specs: [["Occasion", "Birthday Surprise"], ["Contents", "Cookies, Namkeens, Dry Fruits & Treats"], ["Packaging", "Matte luxury box with ribbon"], ["Card", "Personalized message included"], ["Delivery", "Express & Midnight available"], ["Shelf Life", "30 Days"]],
    featured: true,
  },
  {
    id: "anniversary-romance-box", name: "Anniversary Romance Hamper", brand: "Pâtisserie", category: "Gift Hampers",
    price: 89, compareAt: 110, img: IMG.cookies, crop: CROP.TR, tag: "POPULAR",
    rating: 4.9, ratingCount: 980, stock: 18, sku: "CU-HP-0089",
    colors: [
      { name: "Burgundy", hex: "#6b1d2f" },
      { name: "Gold", hex: "#d69740" },
    ],
    sizes: ["COUPLING BOX", "DELUXE CHEST"],
    desc: "Celebrate years of love with hand-selected French macarons, dark Belgian chocolate cookies, crispy royal cashew namkeen, aromatic rose tea, and a keepsake metallic gift tin designed for memorable anniversaries.",
    specs: [["Occasion", "Anniversary Celebration"], ["Contents", "Macarons, Cookies, Namkeen, Tea"], ["Tin", "Reusable embossed keepsake"], ["Card", "Gold foil embossed note"], ["Delivery", "Priority Scheduled / Midnight"], ["Shelf Life", "3 weeks"]],
    featured: true,
  },
  {
    id: "corporate-executive-box", name: "Corporate Executive Gifting Box", brand: "Crumb Lab", category: "Gift Hampers",
    price: 65, compareAt: 80, img: IMG.hero, imgFilter: "sepia(0.2) contrast(1.1)", tag: "CORPORATE",
    rating: 4.8, ratingCount: 750, stock: 50, sku: "CU-HP-0065",
    colors: [
      { name: "Executive Charcoal", hex: "#2a3240" },
      { name: "Executive Navy", hex: "#1e293b" },
    ],
    sizes: ["TEAM PACK", "EXECUTIVE BOX", "BULK TRAY"],
    desc: "Impress clients, partners, and employees with premium corporate gift boxes featuring assorted gourmet cookies, roasted healthy makhana, premium salted cashews, and custom branded sleeve options for bulk orders.",
    specs: [["Occasion", "Corporate Gifting & Festivals"], ["Branding", "Custom company logo sleeve on bulk"], ["Contents", "Assorted cookies & premium namkeens"], ["Packaging", "Sturdy rigid box"], ["Bulk Orders", "Available across India"]],
    featured: true,
  },
  {
    id: "marriage-shagun-hamper", name: "Grand Marriage Shagun Hamper", brand: "Noir Collection", category: "Gift Hampers",
    price: 149, compareAt: 180, img: IMG.cakes, crop: CROP.BL, tag: "MARRIAGE",
    rating: 4.9, ratingCount: 620, stock: 12, sku: "CU-HP-0149",
    colors: [
      { name: "Royal Maroon", hex: "#581c25" },
      { name: "Shagun Gold", hex: "#c98a3d" },
    ],
    sizes: ["SHAGUN TRAY", "ROYAL TROUSSEAU"],
    desc: "Exquisite wedding trousseau and shagun gift hamper crafted for Indian weddings, engagement ceremonies, and return favors. Includes royal dry fruit namkeens, artisanal butter cookies, saffron biscuits, and elegant gold-foiled trays.",
    specs: [["Occasion", "Weddings & Shagun Ceremonies"], ["Contents", "Traditional namkeens, cookies & nuts"], ["Tray", "Decorative reusable golden platter"], ["Customization", "Bride & Groom monogram tags"], ["Delivery", "Scheduled event delivery"]],
    featured: true,
  },
  {
    id: "return-gift-party-pack", name: "Return Gift Celebration Pack", brand: "Oven Stories", category: "Gift Hampers",
    price: 25, img: IMG.cookies, crop: CROP.BR, tag: "RETURN GIFTS",
    rating: 4.7, ratingCount: 1150, stock: 80, sku: "CU-HP-0025",
    colors: [
      { name: "Pastel Mint", hex: "#8fae8b" },
      { name: "Peach Glow", hex: "#e0913f" },
    ],
    sizes: ["PACK OF 5", "PACK OF 10", "PACK OF 25"],
    desc: "Delight your party guests with beautifully packaged return gift pouches. Packed with mini choc-chip cookies, crunchy salted bhujia, and a thank-you note tag. Perfect for birthdays, baby showers, and anniversary get-togethers.",
    specs: [["Occasion", "Birthday & Party Return Favors"], ["Contents", "Mini cookies & crunchy namkeen pouch"], ["Tag", "Customizable Thank You tag"], ["Discount", "Special tier pricing for bulk orders"]],
    featured: true,
  },
  {
    id: "chocchip-stack", name: "Molten Choc-Chip Cookie Stack", brand: "Crumb Lab", category: "Cookies",
    price: 16, img: IMG.cookies, crop: CROP.TL, tag: "BEST SELLER",
    rating: 4.8, ratingCount: 2980, stock: 40, sku: "CU-CO-0016",
    colors: [
      { name: "Classic", hex: "#c98a3d" },
      { name: "Double Dark", hex: "#3f2417", filter: "sepia(0.5) brightness(0.7) contrast(1.2)" },
      { name: "Brown Butter", hex: "#a9743f", filter: "sepia(0.35) brightness(1.05) saturate(1.15)" },
    ],
    sizes: ["6 PCS", "12 PCS", "24 PCS"],
    desc: "A 72-hour cold-fermented dough, hand-scooped and baked to order: crisp edge, molten centre, 54% couverture chunks and a final snow of Maldon salt. Sells out most weekends — order early.",
    specs: [["Dough", "72 h cold ferment"], ["Chocolate", "54% couverture chunks"], ["Salt", "Maldon flakes"], ["Texture", "Crisp edge, molten core"], ["Vegan option", "Available"], ["Shelf life", "5 days, airtight"]],
    featured: true,
  },
  {
    id: "macaron-jewel", name: "Macaron Jewel Box", brand: "Pâtisserie", category: "Cookies",
    price: 24, img: IMG.cookies, crop: CROP.TR, tag: "NEW",
    rating: 4.7, ratingCount: 1102, stock: 22, sku: "CU-CO-0024",
    colors: [
      { name: "Assorted", hex: "#e8a0b4" },
      { name: "Raspberry", hex: "#d63e63", filter: "hue-rotate(-10deg) saturate(1.3)" },
      { name: "Pistachio", hex: "#9cb86e", filter: "hue-rotate(60deg) saturate(0.9)" },
    ],
    sizes: ["BOX OF 6", "BOX OF 12", "BOX OF 24"],
    desc: "Italian-method shells rested 24 hours for the perfect foot, filled the morning they ship. Raspberry, pistachio, salted caramel, dark chocolate — jewel tones, zero artificial colour.",
    specs: [["Method", "Italian meringue"], ["Rest", "24 h shells"], ["Filling", "Filled day-of-dispatch"], ["Colours", "Natural only"], ["Storage", "Chilled, 5 days"], ["Allergens", "Almond, egg, dairy"]],
  },
  {
    id: "royal-bikaner-bhujia", name: "Royal Bikaner Crispy Bhujia", brand: "Oven Stories", category: "Namkeens",
    price: 12, img: IMG.cookies, crop: CROP.BL, tag: "TRADITIONAL",
    rating: 4.9, ratingCount: 1840, stock: 60, sku: "CU-NK-0012",
    colors: [
      { name: "Golden Gram", hex: "#d69740" },
      { name: "Spicy Masala", hex: "#c94a29", filter: "hue-rotate(-15deg) saturate(1.4)" },
    ],
    sizes: ["250 G PACK", "500 G PACK", "1 KG TIN"],
    desc: "Crispy, melt-in-the-mouth traditional Bikaner bhujia crafted with pure dew bean flour (moth dal), chickpea flour, and aromatic Rajasthan spices roasted in cold-pressed oil.",
    specs: [["Base", "Moth dal & besan"], ["Oil", "Cold-pressed groundnut oil"], ["Spice", "Authentic Rajasthan blend"], ["Texture", "Ultra crispy"], ["Shelf Life", "6 months"]],
    featured: true,
  },
  {
    id: "peri-peri-makhana", name: "Crunchy Peri-Peri Roasted Makhana", brand: "Crumb Lab", category: "Namkeens",
    price: 18, img: IMG.cookies, crop: CROP.BR, tag: "HEALTHY",
    rating: 4.8, ratingCount: 930, stock: 45, sku: "CU-NK-0018",
    colors: [
      { name: "Peri Peri Red", hex: "#d63e63" },
      { name: "Himalayan Salt", hex: "#f1e0bd" },
    ],
    sizes: ["150 G PACK", "300 G PACK"],
    desc: "Hand-picked lotus seeds (makhana) roasted to crunchy perfection in pure ghee and tossed in zesty peri-peri spices. A guilt-free gourmet snack for tea-time and party munching.",
    specs: [["Snack", "Fox nuts / Makhana"], ["Roasting", "Pure cow ghee"], ["Flavor", "Zesty peri-peri & herbs"], ["Health", "High protein, gluten-free"], ["Shelf Life", "3 months"]],
  },
  {
    id: "royal-shahi-mixture", name: "Royal Shahi Dry Fruit Mixture", brand: "Noir Collection", category: "Namkeens",
    price: 22, compareAt: 28, img: IMG.hero, tag: "PREMIUM",
    rating: 4.9, ratingCount: 670, stock: 35, sku: "CU-NK-0022",
    colors: [
      { name: "Mixed Nuts", hex: "#8a5a36" },
    ],
    sizes: ["400 G JAR", "800 G JAR"],
    desc: "An opulent blend of fried cashew nuts, almonds, pistachios, thin sev, spiced lentils, and crisp flakes tossed in mild royal spices. The quintessential luxury namkeen for festive gatherings.",
    specs: [["Nuts", "Cashews, Almonds, Pistachios"], ["Base", "Fine sev & lentils"], ["Packing", "Air-tight reusable jar"], ["Shelf Life", "4 months"]],
  },
  {
    id: "crispy-methi-mathri", name: "Crispy Methi Mathri Tin", brand: "Pâtisserie", category: "Namkeens",
    price: 15, img: IMG.cookies, crop: CROP.TL, tag: "TEA-TIME",
    rating: 4.7, ratingCount: 520, stock: 40, sku: "CU-NK-0015",
    colors: [
      { name: "Golden Brown", hex: "#b48a50" },
    ],
    sizes: ["500 G TIN", "1 KG TIN"],
    desc: "Flaky, golden-brown mathri infused with sun-dried fenugreek leaves (methi) and crushed black peppercorns. Layered to perfection for the ultimate evening chai companion.",
    specs: [["Herb", "Sun-dried fenugreek"], ["Flour", "Refined wheat & ajwain"], ["Texture", "Flaky & crunchy"], ["Shelf Life", "3 months"]],
  },
  {
    id: "custom-hamper", name: "Bespoke 3D Custom Celebration Cake", brand: "Noir Collection", category: "Gift Hampers",
    price: 38, compareAt: 48, img: IMG.cakes, crop: CROP.TL, tag: "3D CUSTOM",
    rating: 5.0, ratingCount: 840, stock: 30, sku: "CU-3D-CUST",
    colors: [
      { name: "Belgian Dark Truffle", hex: "#3b2314" },
      { name: "Madagascar Vanilla Bean", hex: "#f5ead6" },
      { name: "Wild Berry Coulis", hex: "#d63e63" },
      { name: "Sicilian Pistachio", hex: "#9cb86e" },
    ],
    sizes: ["0.5 KG (4–6 SERVINGS)", "1.0 KG (8–10 SERVINGS)", "1.5 KG (12–15 SERVINGS)", "2.0 KG (2 TIER GRAND)"],
    desc: "Handcrafted to your exact specifications in our 3D Cake Studio — 100% pure eggless sponge, artisanal frosting, gourmet center filling, and hand-piped Belgian chocolate plaque.",
    specs: [["Dietary", "100% Pure Eggless"], ["Customization", "Live 3D Studio Spec"], ["Plaque", "Hand-piped Chocolate"], ["Delivery", "Chilled 4°C Express Box"]],
    featured: false,
  },
];

export type Review = {
  id: string;
  productId: string;
  name: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  hasImage?: boolean;
  photoUrl?: string;
  hubLocation?: string;
  occasion?: string;
};

export const SEED_REVIEWS: Review[] = [
  { id: "r1", productId: "birthday-deluxe-hamper", name: "Pooja Sharma", rating: 5, title: "Delivered in 34 mins at Midnight!", text: "Ordered for my mother's 50th birthday in Faridabad Sector 15. The coulis drip and Belgian truffle held perfectly through forty minutes of photographs, and the 100% eggless sponge is unbelievably moist.", date: "2026-02-18", hasImage: true, photoUrl: IMG.hero, hubLocation: "Faridabad Sector 15", occasion: "Mom's 50th Birthday · Midnight" },
  { id: "r2", productId: "choc-chip-stack", name: "Rohan Verma", rating: 5, title: "72-Hour Dough Molten Center is Real", text: "Crispy edges, warm molten dark chocolate middle, and flaky sea salt on top. None of our guests believed it was 100% pure vegetarian and eggless. Insulated dry-ice box arrived right on time.", date: "2026-02-14", hasImage: true, photoUrl: IMG.cookies, hubLocation: "Noida Sector 75", occasion: "Birthday Surprise" },
  { id: "r3", productId: "anniversary-romance-box", name: "Simran Kaur", rating: 5, title: "Breathtaking Anniversary Hamper", text: "The Pistachio & Rose macarons paired with Belgian chocolate cookies made our anniversary unforgettable. Gold foil embossed note was handwritten so neatly!", date: "2026-02-10", hasImage: true, photoUrl: IMG.cakes, hubLocation: "Gurgaon DLF Cyber City", occasion: "5th Anniversary" },
  { id: "r4", productId: "french-macaron-jewel-box", name: "Aarav Mehta", rating: 5, title: "Perfect macaron shells, zero hollows", text: "Authentic French patisserie quality right here in South Delhi. The raspberry and Sicilian pistachio fillings taste like real fruit and nuts, never artificial.", date: "2026-02-04", hasImage: true, photoUrl: IMG.cookies, hubLocation: "South Delhi GK-2", occasion: "Family High Tea" },
  { id: "r5", productId: "corporate-executive-box", name: "Neha Kapoor", rating: 5, title: "45 Executive Boxes Delivered Seamlessly", text: "We ordered 45 custom-branded executive hampers for our leadership summit in Gurgaon. Every single box arrived crisp, fresh, and on schedule.", date: "2026-01-29", hasImage: true, photoUrl: IMG.hero, hubLocation: "Gurgaon Golf Course Rd", occasion: "Corporate Gifting" },
  { id: "r6", productId: "royal-shahi-mixture", name: "Vikramaditya Singh", rating: 5, title: "Pure Ghee & Roasted Dry Fruit Crunch", text: "The proportion of roasted cashews, pistachios, and almonds in the Shahi Mixture is unmatched. Paired it with the Methi Mathri tin for our family gathering.", date: "2026-01-22", hasImage: false, hubLocation: "Ghaziabad Indirapuram", occasion: "Festive Gathering" },
];

export type BlogPost = { slug: string; title: string; tag: string; date: string; read: string; excerpt: string; img: string; crop?: string; body: string[] };

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-gourmet-cookies-delhi-ncr-2025", title: "Best Gourmet Cookies in Delhi NCR 2025", tag: "DELHI NCR SEO", date: "2026-02-15", read: "8 min",
    excerpt: "Discover where to buy the finest artisan choc-chip cookies, molten centers and 72-hour cold-fermented bakes across Faridabad, Noida, Gurgaon and South Delhi.",
    img: IMG.cookies, crop: CROP.TL,
    body: [
      "The culinary scene across Delhi NCR has experienced a massive shift towards artisanal, small-batch bakes. Gone are the days of mass-produced supermarket biscuits; today's dessert lovers across Faridabad, Noida, Gurgaon, and South Delhi demand authentic, butter-rich gourmet cookies.",
      "At CakeUrban, our approach to baking cookies relies on science and patience. By utilizing a strict 72-hour cold-fermentation process, our cookie dough develops deep toffee undertones, crisp edges, and a decadent molten center that melts in your mouth.",
      "Whether you are hosting a high-tea in DLF Phase 5 Gurgaon, searching for birthday treats in Sector 15 Faridabad, or ordering midnight sweet cravings in Sector 18 Noida, our express 35-minute delivery fleet ensures your bakes arrive warm, fresh, and pristine.",
      "Explore our signature Choc-Chip Stacks, French Macarons, and Butter Shortbreads today. Ordered fresh, delivered fast across all major NCR hubs."
    ],
  },
  {
    slug: "top-10-gift-hampers-diwali-faridabad", title: "Top 10 Gift Hampers for Diwali in Faridabad", tag: "FARIDABAD HAMPERS", date: "2026-02-10", read: "9 min",
    excerpt: "Looking for the ultimate luxury gift hamper in Faridabad? Here are the top 10 curated boxes featuring gourmet cookies, dry fruits, and crispy namkeens.",
    img: IMG.hero,
    body: [
      "Festivals and celebrations in Faridabad are incomplete without exquisite gifting. Whether it's Diwali, Bhai Dooj, weddings, or corporate milestones, presenting a thoughtfully curated luxury gift hamper speaks volumes.",
      "Our top 10 gift hampers in Faridabad combine traditional elegance with modern gourmet indulgence. From matte-black luxury boxes packed with royal Bikaneri bhujia and roasted peri-peri makhana to gold-foiled celebration chests filled with Belgian chocolate cookies, we craft experiences.",
      "Delivering across all Faridabad sectors including Sector 14, 15, 16, 21, Greenfields, Charmwood, and Neharpar with express same-day and midnight slots.",
      "Make your next celebration unforgettable with CakeUrban's bespoke gift boxes, personalized notes, and premium packaging."
    ],
  },
  {
    slug: "where-to-buy-premium-namkeen-online-noida", title: "Where to Buy Premium Namkeen Online in Noida", tag: "NOIDA SNACKS", date: "2026-01-28", read: "7 min",
    excerpt: "Craving traditional crunch? Discover Noida's favorite destination for royal bhujia, roasted makhana, spicy shahi mixtures, and flaky mathri delivered in 35 mins.",
    img: IMG.cookies, crop: CROP.BL,
    body: [
      "Tea-time in Noida just got an upgrade. While packaged snacks often taste stale and overly salted, authentic traditional namkeens require artisan spice blends and premium cold-pressed oils.",
      "At CakeUrban Noida, our namkeen collection is crafted for connoisseurs. From spicy Shahi Mixures and crunchy Bikaneri Bhujia to roasted Peri-Peri Makhana and flaky Methi Mathri, every batch is sealed fresh.",
      "Serving Noida Sector 18, Sector 62, Sector 137, Noida Extension, and Gaur City with lightning-fast 35-minute delivery straight to your doorstep.",
      "Order online today and experience traditional crunch like never before."
    ],
  },
  {
    slug: "corporate-gifting-ideas-gurgaon", title: "Corporate Gifting Ideas Gurgaon", tag: "GURGAON CORPORATE", date: "2026-01-18", read: "10 min",
    excerpt: "Elevate your corporate gifting in Cyber City and DLF Phase 5 Gurgaon with custom-branded luxury hampers, gourmet cookies, and executive snack boxes.",
    img: IMG.cakes, crop: CROP.TR,
    body: [
      "Corporate gifting in Gurgaon's bustling business hubs like Cyber City, Udyog Vihar, and Golf Course Road demands sophistication and reliability. Standard gift baskets often fail to leave a lasting impression on valued clients and hard-working employees.",
      "CakeUrban offers bespoke corporate gifting solutions featuring executive charcoal and navy gift boxes, assorted gourmet cookies, premium dry fruits, and custom company logo sleeves for bulk orders.",
      "With reliable pan-NCR dispatch and priority delivery across Gurgaon, we make employee onboarding, Diwali gifting, and client appreciation seamless.",
      "Connect with our corporate gifting desk today for customized catalogs and bulk pricing."
    ],
  },
  {
    slug: "the-72-hour-dough", title: "Why Our Cookie Dough Rests for 72 Hours", tag: "CRAFT", date: "2026-02-08", read: "6 min",
    excerpt: "Flour hydrates slowly. Flavour compounds develop slowly. Everything good about our choc-chip cookie happens while nobody is watching.",
    img: IMG.cookies, crop: CROP.TL,
    body: [
      "The moment you mix cookie dough, two slow processes begin: flour hydrates fully, and enzymes start breaking starches into simple sugars. At hour 6 you can barely taste the difference. At hour 72, the dough caramelizes deeper, spreads less, and browns in uneven, gorgeous patches.",
      "Cold is the other ingredient. At 4°C the butter firms into thin sheets instead of blending in, which is why a rested cookie shatters at the edge but stays molten in the middle — the same physics as laminated pastry, in a humbler form.",
      "We've tested 24, 48 and 96 hours. 24 is good, 96 is slightly sour. 72 is the window where toffee notes peak. That number isn't tradition — it's a curve we measured.",
      "The inconvenient truth for bakeries: rested dough means we can only bake what we planned three days ago. It's why the stacks sell out. We'd rather sell out than shortcut.",
    ],
  },
  {
    slug: "physics-of-the-drip", title: "The Physics of a Perfect Drip", tag: "PÂTISSERIE", date: "2026-01-24", read: "5 min",
    excerpt: "A coulis that runs is a sauce. A coulis that freezes is wax. The drip lives in a 4°C window of viscosity — here's how we hold it there.",
    img: IMG.hero,
    body: [
      "A drip cake fails in one of two ways: the coulis runs to the plate, or it sets into a shell that cracks when cut. Both are viscosity problems, and viscosity is a temperature story.",
      "We set our raspberry coulis with just enough pectin to hold at 21°C for roughly forty minutes — long enough for the full photo ritual, short enough that the first slice cuts clean.",
      "The pour happens at exactly 34°C, over a cake chilled to 6°C. The thermal shock stops each drip at a different length, which is the 'organic' look people photograph. It's not randomness; it's controlled instability.",
      "Gold leaf goes on last, by tweezers, one fleck at a time. It adds nothing to flavour and everything to the moment. Some things are allowed to be pure theatre.",
    ],
  },
  {
    slug: "eggless-without-compromise", title: "Eggless Baking, Without the Compromise", tag: "BAKEHOUSE", date: "2026-01-11", read: "7 min",
    excerpt: "Most eggless cakes are apologies. Ours took 41 test bakes to stop tasting like an apology — aquafaba, emulsifiers and one secret we're keeping.",
    img: IMG.cakes, crop: CROP.TR,
    body: [
      "Eggs do three jobs in a cake: structure, emulsion, and tenderness. Remove them and most recipes quietly give up on at least one. Ours refused to.",
      "Structure comes from a precise aquafaba meringue folded at the exact moment it hits soft peaks. Emulsion from sunflower lecithin — half a gram per kilo, no more. Tenderness from browned butter, which also brings the toffee note people can't place.",
      "Test bake 41 was the one where our head chef couldn't tell the eggless tier from the original in a blind cut. That's when it went on the menu.",
      "Around 30% of our orders now request eggless. It stopped being a category and became a standard — which is exactly what 'no compromise' should mean.",
    ],
  },
];

export type Coupon = { code: string; type: "percent" | "fixed" | "ship"; value: number; min: number; expires: string; limit: number; used: number; active: boolean };

export const SEED_COUPONS: Coupon[] = [
  { code: "WELCOME10", type: "percent", value: 10, min: 0, expires: "2026-12-31", limit: 10000, used: 3421, active: true },
  { code: "SWEET20", type: "percent", value: 20, min: 60, expires: "2026-06-30", limit: 2000, used: 618, active: true },
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
export type OrderItem = { productId: string; name: string; img: string; imgFilter?: string; crop?: string; color: string; size: string; qty: number; price: number };
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type Order = {
  id: string; email: string; items: OrderItem[]; subtotal: number; discount: number; shipping: number; total: number;
  status: OrderStatus; date: string; address: string; method: string; payment: string; timeline: { status: OrderStatus; at: string }[];
  deliverySlot?: string; plaqueMessage?: string; customerPhone?: string; customerName?: string;
};

export type Customer = { id: string; name: string; email: string; joined: string; orders: number; spend: number; blocked: boolean; phone?: string };
export const SEED_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Amara Osei", email: "amara@runmail.com", joined: "2025-03-12", orders: 7, spend: 540, blocked: false },
  { id: "c2", name: "Diego Fuentes", email: "diego.f@fastmail.io", joined: "2025-05-02", orders: 4, spend: 312, blocked: false },
  { id: "c3", name: "Priya Nair", email: "priya.n@gmail.com", joined: "2025-06-19", orders: 11, spend: 890, blocked: false },
  { id: "c4", name: "Jonas Keller", email: "jonas.k@web.de", joined: "2025-08-07", orders: 6, spend: 401, blocked: false },
  { id: "c5", name: "Mei Tanaka", email: "mei.t@icloud.com", joined: "2025-09-23", orders: 6, spend: 480, blocked: false },
  { id: "c6", name: "Sam Whitfield", email: "samw@outlook.com", joined: "2025-11-01", orders: 2, spend: 148, blocked: true },
  { id: "c7", name: "Lena Hoffmann", email: "lena.h@gmx.de", joined: "2025-12-14", orders: 5, spend: 390, blocked: false },
  { id: "c8", name: "Ravi Menon", email: "ravi.m@proton.me", joined: "2026-01-08", orders: 1, spend: 89, blocked: false },
];

export type Staff = { id: string; name: string; email: string; role: "Super Admin" | "Manager" | "Staff"; lastActive: string };
export const SEED_STAFF: Staff[] = [
  { id: "s1", name: "Alex Voss", email: "admin@cakeurban.com", role: "Super Admin", lastActive: "2026-02-11 09:41" },
  { id: "s2", name: "Mira Chen", email: "mira@cakeurban.com", role: "Manager", lastActive: "2026-02-11 08:15" },
  { id: "s3", name: "Devon Park", email: "devon@cakeurban.com", role: "Staff", lastActive: "2026-02-10 17:52" },
];

export type Faq = { q: string; a: string };
export const SEED_FAQS: Faq[] = [
  { q: "How fast is same-day delivery?", a: "Order by 4 PM and our riders bring it the same day within the city, in a chilled box — most orders arrive inside 90 minutes. After 4 PM, it's first slot next morning." },
  { q: "Do you offer eggless and vegan options?", a: "Yes. Every cake on the menu has an eggless version baked on a dedicated line, and the Choc-Chip Stack and Dough Jar are fully vegan. Flag it at checkout and we double-check by hand." },
  { q: "Can I write a message on the cake?", a: "Always. Add your message in the order notes — our pipers hand-write up to 20 words in dark or white chocolate, free of charge. Gift tins come with a kraft card we fill by hand." },
  { q: "What about allergens?", a: "Our bakehouse handles gluten, dairy, eggs, tree nuts and soy. Every product page lists allergens, and nut-free items are prepared on separate benches, though we can't guarantee zero cross-contact." },
  { q: "How should I store my cake?", a: "Chilled, in its box, up to 48 hours. Take it out 30 minutes before serving — cold mutes flavour, and the ganache cuts cleanest at room temperature." },
  { q: "What is your refund policy?", a: "Freshness guaranteed: if anything arrives short of perfect, send a photo within 2 hours and we re-bake or refund — your choice. Custom and wedding tiers follow the booking agreement." },
];

export const HERO_DEFAULT = {
  kicker: "LUXURY GIFTING & GOURMET BAKESHOUSE — SAME DAY DELIVERIES",
  titleA: "COOKIES,",
  titleB: "NAMKEENS & HAMPERS",
  sub: "Exquisite luxury gift hampers for birthdays, anniversaries, corporate events, marriages, and return gifts — paired with gourmet cookies and crispy traditional namkeens.",
};
