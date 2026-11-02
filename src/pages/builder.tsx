import React, { useState, useEffect, useMemo } from "react";
import { Ic } from "../components/ui";

const WHATSAPP_NUMBER = "917318531953";

const FALLBACK_CAKE_IMG =
  "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg";

interface CakePin {
  id: string;
  title: string;
  category: string;
  img: string;
  startingWeight: string;
  priceInr: number;
  tags: string[];
  badge?: string;
  pinUrl?: string;
}

const CATEGORIES = [
  { id: "all", label: "🔥 All Trending" },
  { id: "birthday", label: "🎂 Birthday" },
  { id: "wedding", label: "💍 Wedding & 2-Tier" },
  { id: "anniversary", label: "❤️ Anniversary & Heart" },
  { id: "kids", label: "🎈 Kids & Cartoon" },
  { id: "aesthetic", label: "✨ Korean & Butterfly" },
  { id: "chocolate", label: "🍫 Truffle & Rasmalai" },
];

const POPULAR_SEARCHES = [
  "Butterfly Cake",
  "Vintage Heart",
  "Spiderman",
  "Doraemon",
  "Barbie Doll",
  "Korean Bento",
  "2 Tier Wedding",
  "Engagement Ring",
  "Rasmalai Cake",
  "Cocomelon",
  "Unicorn",
  "Bride To Be",
  "25th Anniversary",
  "50th Birthday Gold",
  "Cricket Theme",
  "Photo Cake",
];

// 100% Authentic Pinterest Cake Pins (i.pinimg.com/736x)
const CURATED_PINS: CakePin[] = [
  // Aesthetic / Butterfly / Bento / Vintage Heart
  {
    id: "pin-butterfly-lavender",
    title: "Lavender Butterfly Dream Cake 🦋",
    category: "aesthetic",
    img: "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "Pinterest #1",
    tags: ["butterfly", "lavender", "purple", "aesthetic", "girl", "birthday", "pastel", "trending"],
  },
  {
    id: "pin-butterfly-coquette",
    title: "Butterfly Vintage Purple Coquette Cake 🦋✨",
    category: "aesthetic",
    img: "https://i.pinimg.com/736x/66/43/4f/66434f01e84504790655519b5e6dcd35.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1299,
    badge: "Trending",
    tags: ["butterfly", "vintage", "purple", "coquette", "aesthetic", "birthday", "girl"],
  },
  {
    id: "pin-butterfly-bento",
    title: "Pastel Butterfly & Pearl Korean Aesthetic Cake",
    category: "aesthetic",
    img: "https://i.pinimg.com/736x/78/2b/27/782b276ce3ac3a102ca8f4d1732d9325.jpg",
    startingWeight: "0.5 Kg",
    priceInr: 849,
    badge: "Korean Style",
    tags: ["butterfly", "bento", "korean", "pastel", "minimal", "birthday", "aesthetic"],
  },
  {
    id: "pin-vintage-heart-pink",
    title: "Pink Vintage Lambeth Heart Floral Cake",
    category: "anniversary",
    img: "https://i.pinimg.com/736x/ed/63/f8/ed63f8e078267950345acfc4b0c970ec.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1099,
    badge: "Most Saved",
    tags: ["vintage", "heart", "pink", "lambeth", "ribbon", "bow", "anniversary", "girlfriend", "wife", "birthday"],
  },
  {
    id: "pin-vintage-heart-blue",
    title: "Vintage Blue Heart Lambeth Coquette Cake 💙",
    category: "aesthetic",
    img: "https://i.pinimg.com/736x/35/83/9a/35839a9db0cd2ab92eb49a4a4327439a.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1149,
    badge: "Coquette Pin",
    tags: ["vintage", "heart", "blue", "lambeth", "coquette", "aesthetic", "birthday"],
  },
  {
    id: "pin-vintage-heart-red",
    title: "Romantic Red & White Vintage Heart Cake",
    category: "anniversary",
    img: "https://i.pinimg.com/736x/e5/6a/dc/e56adc2fc6f5f5c28ccd3bec689e40e0.jpg",
    startingWeight: "0.5 Kg",
    priceInr: 899,
    tags: ["vintage", "heart", "red", "romantic", "anniversary", "valentine", "couple"],
  },
  {
    id: "pin-korean-bento-beige",
    title: "Minimalist Korean Bento Lunchbox Cake",
    category: "aesthetic",
    img: "https://i.pinimg.com/736x/1a/c8/61/1ac861c2bda7a57bfdce825c56682338.jpg",
    startingWeight: "0.5 Kg",
    priceInr: 599,
    badge: "Bento Box",
    tags: ["korean", "bento", "lunchbox", "minimal", "aesthetic", "cute", "mini", "birthday"],
  },
  {
    id: "pin-korean-bento-pastel",
    title: "Cute Pastel Korean Bento Cake in Box",
    category: "aesthetic",
    img: "https://i.pinimg.com/736x/2f/56/c9/2f56c9e8e26c647d3f0fa015ffda3c1f.jpg",
    startingWeight: "0.5 Kg",
    priceInr: 649,
    tags: ["korean", "bento", "lunchbox", "pastel", "cute", "aesthetic", "friend"],
  },

  // Wedding / Engagement / 2-Tier
  {
    id: "pin-wedding-2tier-floral",
    title: "2-Tier White Floral & Monogram Wedding Cake",
    category: "wedding",
    img: "https://i.pinimg.com/736x/ef/a4/a5/efa4a5fe51293d20f286d240d56890b4.jpg",
    startingWeight: "2.0 Kg",
    priceInr: 2499,
    badge: "Luxury 2-Tier",
    tags: ["2 tier", "two tier", "wedding", "white", "floral", "rose", "reception", "engagement", "tier"],
  },
  {
    id: "pin-wedding-2tier-elegance",
    title: "Royal 2-Tier Ivory Rose Wedding Cake",
    category: "wedding",
    img: "https://i.pinimg.com/736x/29/12/20/29122018d930c3481b8d25c7563f7cf9.jpg",
    startingWeight: "2.5 Kg",
    priceInr: 2899,
    badge: "Wedding Hit",
    tags: ["2 tier", "two tier", "wedding", "ivory", "floral", "grand", "reception", "tier"],
  },
  {
    id: "pin-wedding-botanical",
    title: "2-Tier White Roses & Greenery Wedding Cake",
    category: "wedding",
    img: "https://i.pinimg.com/736x/72/ae/02/72ae0291f51e306acf0b44770f036cf1.jpg",
    startingWeight: "2.0 Kg",
    priceInr: 2399,
    tags: ["2 tier", "two tier", "wedding", "white", "flowers", "greenery", "tier"],
  },
  {
    id: "pin-engagement-ring-1",
    title: "Romantic Engagement Ring Ceremony Cake 💍",
    category: "wedding",
    img: "https://i.pinimg.com/736x/a2/c9/64/a2c9646ec78d638175a84758a0245b82.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1799,
    badge: "Ring Ceremony",
    tags: ["engagement", "ring", "ceremony", "roka", "couple", "wedding", "floral", "gold"],
  },
  {
    id: "pin-engagement-ring-2",
    title: "Pastel Floral & Gold Engagement Celebration Cake",
    category: "wedding",
    img: "https://i.pinimg.com/736x/a9/78/4b/a9784b28522b82c668a35582a0691224.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1899,
    tags: ["engagement", "ring", "ceremony", "roka", "wedding", "couple", "anniversary"],
  },
  {
    id: "pin-engagement-luxury",
    title: "Royal Gold Leaf Engagement Ceremony Cake",
    category: "wedding",
    img: "https://i.pinimg.com/736x/48/d1/96/48d1962ea768655dbe6fbbbda2832474.jpg",
    startingWeight: "2.0 Kg",
    priceInr: 2199,
    tags: ["engagement", "ring", "gold", "wedding", "2 tier", "roka"],
  },

  // Kids & Cartoon (Spiderman, Doraemon, Barbie, Unicorn, Cocomelon, Safari)
  {
    id: "pin-kids-spiderman-1",
    title: "Marvel Spiderman Web-Slinger Birthday Cake 🕷️",
    category: "kids",
    img: "https://i.pinimg.com/736x/5b/06/c1/5b06c18ef82a734ce8e7308d46546b1c.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "Boys #1 Pick",
    tags: ["spiderman", "marvel", "superhero", "avengers", "kids", "boy", "red", "blue", "cartoon", "birthday"],
  },
  {
    id: "pin-kids-spiderman-2",
    title: "2-Tier Spiderman Action Superhero Cake",
    category: "kids",
    img: "https://i.pinimg.com/736x/c5/96/59/c596597cb22bbd2cbaff42be8d026645.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1599,
    tags: ["spiderman", "superhero", "marvel", "kids", "boy", "2 tier", "birthday"],
  },
  {
    id: "pin-kids-spiderman-comic",
    title: "Spiderman POW ZAP Comic Theme Birthday Cake",
    category: "kids",
    img: "https://i.pinimg.com/736x/d4/a9/47/d4a947ad96540a1fd5ab93504540461a.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1249,
    tags: ["spiderman", "comic", "superhero", "boy", "kids", "birthday"],
  },
  {
    id: "pin-kids-doraemon-1",
    title: "3D Doraemon Blue Cartoon Birthday Cake 🔔",
    category: "kids",
    img: "https://i.pinimg.com/736x/be/98/d1/be98d1fd1125788bc158c3ad4de19c09.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1099,
    badge: "Kids Favorite",
    tags: ["doraemon", "doremon", "cartoon", "blue", "kids", "boy", "girl", "birthday", "anime"],
  },
  {
    id: "pin-kids-doraemon-2",
    title: "Cute Doraemon & Nobita Clouds Birthday Cake",
    category: "kids",
    img: "https://i.pinimg.com/736x/3c/92/af/3c92aff4aca619b833b4c2561f682c71.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1149,
    tags: ["doraemon", "doremon", "cartoon", "kids", "blue", "birthday"],
  },
  {
    id: "pin-kids-barbie-1",
    title: "Pink & White Barbie Princess Doll Dress Cake 👑",
    category: "kids",
    img: "https://i.pinimg.com/736x/83/b9/2c/83b92cc3a8a2afd941924b6f48013b67.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1499,
    badge: "Princess Hit",
    tags: ["barbie", "doll", "princess", "pink", "girl", "kids", "dress", "crown", "birthday"],
  },
  {
    id: "pin-kids-barbie-2",
    title: "Rose Gown Barbie Doll Birthday Cake",
    category: "kids",
    img: "https://i.pinimg.com/736x/76/19/12/761912c0fc2081eecf269c339b2213c9.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1449,
    tags: ["barbie", "doll", "princess", "pink", "roses", "girl", "kids", "birthday"],
  },
  {
    id: "pin-kids-unicorn-1",
    title: "Magical Pastel Rainbow Unicorn Horn Cake 🦄",
    category: "kids",
    img: "https://i.pinimg.com/736x/38/ee/b3/38eeb308bdffa4fc365eaec9878b9165.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "Magical Pin",
    tags: ["unicorn", "rainbow", "pastel", "girl", "kids", "magical", "1st birthday", "birthday"],
  },
  {
    id: "pin-kids-unicorn-2",
    title: "Unicorn & Pastel Balloons Cloud Birthday Cake",
    category: "kids",
    img: "https://i.pinimg.com/736x/93/05/40/930540f8ed9cfa57e5103a35375d96a7.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1499,
    tags: ["unicorn", "balloons", "pastel", "girl", "kids", "birthday"],
  },
  {
    id: "pin-kids-cocomelon-1",
    title: "Cocomelon 1st Birthday Rainbow Theme Cake 🍉",
    category: "kids",
    img: "https://i.pinimg.com/736x/8e/f4/53/8ef453a90bee444304ac8e3a380b9e84.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1499,
    badge: "1st Birthday",
    tags: ["cocomelon", "1st birthday", "first birthday", "baby", "kids", "cartoon", "rainbow", "boy", "girl"],
  },
  {
    id: "pin-kids-safari-1",
    title: "Luxury Jungle Safari Lion & Giraffe Theme Cake 🦁",
    category: "kids",
    img: "https://i.pinimg.com/736x/84/ff/5c/84ff5ccd4b1d62d19191f63de01ab728.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1599,
    badge: "Jungle Theme",
    tags: ["jungle", "safari", "animals", "lion", "baby", "1st birthday", "kids", "boy", "birthday"],
  },
  {
    id: "pin-kids-safari-2",
    title: "Cute Pastel Rainbow & Animal Faces Safari Cake",
    category: "kids",
    img: "https://i.pinimg.com/736x/20/98/2e/20982ed74d2cc5db871e128c75a3a3ba.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1299,
    tags: ["jungle", "safari", "animals", "rainbow", "kids", "1st birthday", "birthday"],
  },

  // Anniversary & Milestone Birthday (25th, 50th, Red Velvet Heart, Bride to Be, Mens Black Gold, Cricket, Photo)
  {
    id: "pin-anniv-redvelvet-heart",
    title: "Romantic Heart-Shaped Red Velvet Anniversary Cake ❤️",
    category: "anniversary",
    img: "https://i.pinimg.com/736x/5e/66/f6/5e66f6cf71264fe96681ee9908febd91.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1099,
    badge: "Couple Favorite",
    tags: ["red velvet", "heart", "anniversary", "romantic", "couple", "wife", "husband", "red", "valentine"],
  },
  {
    id: "pin-anniv-calendar-heart",
    title: "Save The Date Calendar Red Velvet Anniversary Cake",
    category: "anniversary",
    img: "https://i.pinimg.com/736x/08/b7/31/08b731aeea08622d4918def6f57ce9e6.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1149,
    badge: "Date Calendar",
    tags: ["calendar", "date", "red velvet", "anniversary", "heart", "couple", "romantic", "birthday"],
  },
  {
    id: "pin-anniv-25th-silver-1",
    title: "25th Anniversary Silver Jubilee Grand Cake ✨",
    category: "anniversary",
    img: "https://i.pinimg.com/736x/94/b7/be/94b7bef7139130bdd411e3949c599030.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1699,
    badge: "Silver Jubilee",
    tags: ["25th", "25th anniversary", "silver", "jubilee", "parents", "mom dad", "anniversary", "wedding"],
  },
  {
    id: "pin-anniv-25th-silver-2",
    title: "Elegant Silver & White 25th Anniversary Cake",
    category: "anniversary",
    img: "https://i.pinimg.com/736x/61/78/29/61782944c2ea84f345e38e0a33e2fbf4.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1599,
    tags: ["25th", "25th anniversary", "silver", "jubilee", "parents", "anniversary"],
  },
  {
    id: "pin-anniv-50th-gold-1",
    title: "50th Golden Jubilee & Milestone Luxury Gold Cake 👑",
    category: "anniversary",
    img: "https://i.pinimg.com/736x/9e/5b/b4/9e5bb41d0029e1fab0a2c7e745a7f6dd.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1799,
    badge: "Golden Jubilee",
    tags: ["50th", "50th birthday", "50th anniversary", "gold", "golden", "jubilee", "parents", "dad", "mom", "birthday"],
  },
  {
    id: "pin-anniv-50th-gold-2",
    title: "Royal Gold Drip 50th Celebration Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/20/ba/cd/20bacd473e5ad0ff04d37d5186bf2435.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1699,
    tags: ["50th", "50th birthday", "50th anniversary", "gold", "golden", "birthday", "anniversary"],
  },
  {
    id: "pin-bride-to-be-1",
    title: "Glam Bride To Be Crown & Bow Bachelorette Cake 👰‍♀️",
    category: "birthday",
    img: "https://i.pinimg.com/736x/4a/02/d9/4a02d9f459793a1699da464de3573d68.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "Bride To Be",
    tags: ["bride", "bride to be", "bachelorette", "bridal shower", "wedding", "pink", "girl", "party"],
  },
  {
    id: "pin-bride-to-be-bow",
    title: "White Coquette Bow Bride To Be Gold Lettering Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/40/88/d8/4088d83d94169078b49467f7de0936e9.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1249,
    tags: ["bride", "bride to be", "bachelorette", "bow", "white", "gold", "wedding"],
  },
  {
    id: "pin-mens-black-gold-1",
    title: "Royal Black & Gold Metallic Men's Birthday Cake 🥂",
    category: "birthday",
    img: "https://i.pinimg.com/736x/2b/1f/43/2b1f4360e6f0566fab491be54ee1cb99.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1299,
    badge: "For Him",
    tags: ["black", "gold", "mens", "husband", "boyfriend", "brother", "dad", "groom", "50th birthday", "birthday"],
  },
  {
    id: "pin-mens-black-gold-2",
    title: "Luxury Black & Gold Crown Gentleman Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/a1/c2/d3/a1c2d3d56b0b2fa48ccec134375cc68c.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1549,
    tags: ["black", "gold", "mens", "dad", "husband", "50th birthday", "70th", "birthday"],
  },
  {
    id: "pin-cricket-theme",
    title: "Cricket Pitch Bat & Ball Champion Birthday Cake 🏏",
    category: "kids",
    img: "https://i.pinimg.com/736x/f4/03/87/f403879d102aa75263021db7e985c4d5.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "Cricket Fan",
    tags: ["cricket", "ipl", "sports", "bat", "boy", "kids", "mens", "birthday"],
  },
  {
    id: "pin-photo-polaroid-1",
    title: "Edible Polaroid Photo Memories Birthday Cake 📸",
    category: "birthday",
    img: "https://i.pinimg.com/736x/c2/dc/ca/c2dcca42e45875fc20fc247fcfb2bba7.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1299,
    badge: "Custom Photo",
    tags: ["photo", "polaroid", "picture", "memories", "custom photo", "birthday", "anniversary", "best friend"],
  },
  {
    id: "pin-photo-polaroid-2",
    title: "Vintage Film Strip & Photo Collage Celebration Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/31/64/02/31640294c8b1fa6e01e753d0f6f088eb.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1349,
    tags: ["photo", "polaroid", "picture", "collage", "birthday", "anniversary"],
  },

  // Chocolate Truffle & Royal Rasmalai
  {
    id: "pin-rasmalai-pistachio-1",
    title: "Royal Rasmalai Pistachio & Rose Petals Fusion Cake 🌹",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/c3/73/b2/c373b25454d332e53147e0cdb060bb1b.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1099,
    badge: "NCR Bestseller",
    tags: ["rasmalai", "pistachio", "indian", "fusion", "rabri", "saffron", "rose", "parents", "birthday", "anniversary"],
  },
  {
    id: "pin-rasmalai-saffron-2",
    title: "Kesar Rasmalai Cardamom Crown Celebration Cake",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/0a/81/d8/0a81d824714f5966d5418f45bc1456f2.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1149,
    tags: ["rasmalai", "kesar", "saffron", "pistachio", "mithai", "indian", "birthday"],
  },
  {
    id: "pin-choc-truffle-drip-1",
    title: "Belgian Dark Chocolate Overload & Ferrero Drip Cake 🍫",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/08/24/b3/0824b390c3438b5657a7952f93516cb3.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1099,
    badge: "Choc Lover #1",
    tags: ["chocolate", "truffle", "belgian", "ferrero", "rocher", "drip", "oreo", "kitkat", "birthday"],
  },
  {
    id: "pin-choc-truffle-drip-2",
    title: "Rich Ganache Chocolate Truffle & Berries Crown Cake",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/f4/76/aa/f476aafd17311ae3a3a7e8101735354e.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    tags: ["chocolate", "truffle", "ganache", "drip", "belgian", "birthday", "anniversary"],
  },
  {
    id: "pin-choc-luxury-3",
    title: "Signature Chocolate Fudge & Macaron Tower Cake",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/e6/17/38/e61738f2e027798b56f85e9828e20efd.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1249,
    tags: ["chocolate", "fudge", "truffle", "macaron", "birthday"],
  },
];

const STOP_WORDS = new Set([
  "cake",
  "cakes",
  "design",
  "designs",
  "pinterest",
  "custom",
  "theme",
  "for",
  "with",
  "and",
  "the",
  "in",
  "on",
  "of",
  "a",
  "an",
  "ideas",
  "idea",
  "photo",
  "image",
]);

function scorePinAgainstQuery(pin: CakePin, rawQuery: string): number {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return 1;

  const haystack = [
    pin.title.toLowerCase(),
    pin.category.toLowerCase(),
    (pin.badge || "").toLowerCase(),
    ...pin.tags.map((t) => t.toLowerCase()),
  ].join(" ");

  // Exact full phrase match gets highest boost
  let score = 0;
  if (haystack.includes(q)) {
    score += 100;
  }

  // Tokenize query and ignore generic stop words ("cake", "design", etc.)
  const rawTokens = q
    .split(/[\s,/-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
  const tokensToUse = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  let matchedCount = 0;
  for (const token of tokensToUse) {
    if (haystack.includes(token)) {
      matchedCount += 1;
      score += 25;
      if (pin.title.toLowerCase().includes(token)) {
        score += 15;
      }
      if (pin.tags.some((tag) => tag.toLowerCase() === token)) {
        score += 20;
      }
    }
  }

  // Require at least one meaningful token match
  if (matchedCount === 0) return 0;

  // Bonus if ALL meaningful tokens matched
  if (matchedCount === tokensToUse.length) {
    score += 50;
  }

  return score;
}

export default function CustomCakePinterestFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedWeight, setSelectedWeight] = useState("1.0 Kg");
  const [selectedFlavor, setSelectedFlavor] = useState("Belgian Chocolate Truffle");
  const [livePins, setLivePins] = useState<CakePin[]>([]);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [previewPin, setPreviewPin] = useState<CakePin | null>(null);
  const [customNote, setCustomNote] = useState("");
  const [customPasteUrl, setCustomPasteUrl] = useState("");

  // Live Pinterest Search via our /api/pinterest-search endpoint when user types a query
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setLivePins([]);
      setIsSearchingWeb(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearchingWeb(true);
      try {
        const res = await fetch(`/api/pinterest-search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const fetchedPins: CakePin[] = (data?.pins || []).map((p: any, idx: number) => ({
          id: p.id || `live-pin-${idx}-${Date.now()}`,
          title: p.title || `Custom ${q} Cake`,
          category: "custom",
          img: p.img,
          startingWeight: p.startingWeight || "1.0 Kg",
          priceInr: p.priceInr || 999,
          tags: [q.toLowerCase(), "pinterest", "custom"],
          badge: p.badge || "Pinterest Live",
          pinUrl: p.pinUrl,
        }));
        setLivePins(fetchedPins);
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setLivePins([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingWeb(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Combine Curated Pinterest Pins + Live Fetched Pinterest Pins
  const displayedPins = useMemo(() => {
    const q = searchQuery.trim();

    if (!q) {
      return CURATED_PINS.filter(
        (pin) => activeCategory === "all" || pin.category === activeCategory
      );
    }

    // Score & sort curated pins across ALL categories when searching
    const scoredLocal = CURATED_PINS.map((pin) => ({
      pin,
      score: scorePinAgainstQuery(pin, q),
    }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.pin);

    // Deduplicate by image URL between local curated pins and live Pinterest pins
    const seenImgs = new Set<string>();
    const combined: CakePin[] = [];

    for (const p of [...scoredLocal, ...livePins]) {
      if (!p.img || seenImgs.has(p.img)) continue;
      seenImgs.add(p.img);
      combined.push(p);
    }

    return combined;
  }, [searchQuery, activeCategory, livePins]);

  // Build Direct WhatsApp Chat Link With Cake Image URL & Customer Preferences
  const buildWhatsAppLink = (pin: CakePin, extraNote?: string) => {
    const lines = [
      `Hi CakeUrban! 🎂 Mujhe ye custom cake banwana hai:`,
      ``,
      `📌 *Cake Design:* ${pin.title}`,
      `⚖️ *Selected Weight:* ${selectedWeight}`,
      `🍫 *Preferred Flavor:* ${selectedFlavor} (100% Eggless)`,
      `💰 *Ref Starting Price:* ₹${pin.priceInr}`,
      ...(extraNote?.trim() ? [`✍️ *Custom Note:* ${extraNote.trim()}`] : []),
      ``,
      `🖼️ *Pinterest Cake Photo Link:*`,
      pin.img,
      ...(pin.pinUrl ? [`🔗 *Pinterest Pin:* ${pin.pinUrl}`] : []),
      ``,
      `Please confirm final price & delivery slot!`,
    ];
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleCustomLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPasteUrl.trim()) return;
    const msg = [
      `Hi CakeUrban! 🎂 Maine Pinterest/Instagram par ye custom cake dekha hai:`,
      ``,
      `🔗 *Cake Link / Idea:* ${customPasteUrl.trim()}`,
      `⚖️ *Weight:* ${selectedWeight}`,
      `🍫 *Flavor:* ${selectedFlavor} (100% Eggless)`,
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
            <span className="truncate">Live Pinterest Custom Cake Search · 100% Eggless</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight">
            Search Any <span className="text-blaze-500">Pinterest Cake</span> & Chat on WhatsApp
          </h1>

          <p className="text-ink-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Koi bhi cake theme search karein (jaise Doraemon, Butterfly, 2-Tier Engagement) aur pasand aane par photo ke niche{" "}
            <span className="text-emerald-400 font-semibold">"Chat About This Cake"</span> dabayein!
          </p>

          {/* Main Pinterest Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const el = document.getElementById("pins-grid");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="pt-2"
          >
            <div className="relative flex items-center bg-ink-950 border-2 border-ink-700 focus-within:border-blaze-500 rounded-full overflow-hidden shadow-2xl transition-colors">
              <span className="pl-3.5 sm:pl-5 text-ink-400 shrink-0">
                <Ic.search className="w-4 h-4 sm:w-5 sm:h-5 text-blaze-500" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeCategory !== "all") setActiveCategory("all");
                }}
                placeholder="Search any Pinterest cake: 'Butterfly', 'Doraemon', 'Shinchan', '2 Tier'..."
                className="w-full min-w-0 bg-transparent px-2.5 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-ink-50 placeholder-ink-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-2 text-ink-400 hover:text-ink-100 font-mono text-xs shrink-0"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="mr-1.5 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#E60023] hover:bg-[#cc001f] text-white font-mono text-[10px] sm:text-xs uppercase font-bold tracking-wider transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </form>

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
                    ? "bg-[#E60023] text-white border-[#E60023] font-bold"
                    : "bg-ink-900/90 text-ink-300 border-ink-700 hover:border-blaze-400 hover:text-ink-100"
                }`}
              >
                📌 {term}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Weight & Flavor Selector Strip (Included in WhatsApp Message Automatically!) */}
        <div className="mt-5 pt-4 border-t border-ink-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
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

          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] uppercase text-gold-400 shrink-0">2. Flavor:</span>
            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              aria-label="Select cake flavor"
              className="bg-ink-950 border border-ink-700 focus:border-blaze-500 rounded px-2.5 py-1 text-xs font-mono text-ink-100 outline-none flex-1 sm:flex-initial min-w-0 truncate"
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
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-mono text-xs text-ink-300 truncate">
              Pinterest results for <span className="text-blaze-400 font-bold">"{searchQuery}"</span>{" "}
              <span className="text-ink-400">({displayedPins.length} pins)</span>
            </p>
            {isSearchingWeb && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E60023]/20 border border-[#E60023]/40 text-[#ff4d67] font-mono text-[10px] animate-pulse shrink-0">
                Loading live Pinterest pins...
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="font-mono text-[11px] text-blaze-400 hover:underline shrink-0"
          >
            Clear Search ✕
          </button>
        </div>
      )}

      {/* Loading Skeleton when Searching Live Pinterest with 0 Local Matches Yet */}
      {isSearchingWeb && displayedPins.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/5] bg-ink-800/70" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-ink-800 rounded w-3/4" />
                <div className="h-8 bg-ink-800 rounded w-full mt-2" />
              </div>
            </div>
          ))}
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
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== FALLBACK_CAKE_IMG) {
                        target.src = FALLBACK_CAKE_IMG;
                      }
                    }}
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
              className="flex-1 min-w-0 bg-ink-950 border border-ink-700 focus:border-blaze-500 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-ink-100 outline-none"
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
              <img
                src={previewPin.img}
                alt={previewPin.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src !== FALLBACK_CAKE_IMG) {
                    target.src = FALLBACK_CAKE_IMG;
                  }
                }}
                className="w-full h-full object-cover"
              />
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
