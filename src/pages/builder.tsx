import React, { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { Ic } from "../components/ui";
import {
  getAutoSeoThemes,
  recordAutoSeoSearch,
  subscribeAutoSeoUpdates,
} from "../lib/autoSeoEngine";

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

// Instant 0ms client-side memory cache for searched cake themes & home showcase tabs
const clientSearchCache = new Map<string, CakePin[]>();

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
  "Birthday Cake",
  "Anniversary Cake",
  "Theme Cake",
  "Butterfly Cake",
  "Vintage Heart",
  "1st Birthday Boy",
  "Birthday For Girl",
  "Spiderman",
  "Doraemon",
  "Shinchan",
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
  "Boss Baby",
  "Frozen Elsa",
  "Avengers",
  "Jungle Theme",
  "Car Theme",
  "Red Velvet Heart",
  "Pineapple Cake",
  "Butterscotch Cake",
  "Black Forest Cake",
  "Fresh Fruit Cake",
  "Strawberry Cake",
];

const SMART_SUGGESTIONS_POOL = [
  "Birthday Cake For Boy",
  "Birthday Cake For Girl",
  "1st Birthday Theme Cake",
  "Husband Birthday Cake",
  "Wife Birthday Cake",
  "Butterfly Birthday Cake",
  "Chocolate Truffle Birthday Cake",
  "Fresh Cream Pineapple Birthday Cake",
  "Butterscotch Caramel Crunch Cake",
  "Classic Black Forest Cherry Cake",
  "Fresh Fruit & Almond Cake",
  "Pink Strawberry Cream Cake",
  "Royal Alphonso Mango Cake",
  "2 Tier Birthday Cake",
  "1st Anniversary Heart Cake",
  "25th Silver Jubilee Anniversary Cake",
  "Romantic Red Heart Anniversary Cake",
  "Couple Photo Anniversary Cake",
  "Vintage Lambeth Heart Cake",
  "Spiderman Superhero Theme Cake",
  "Doraemon Cartoon Theme Cake",
  "Shinchan Naughty Theme Cake",
  "Barbie Princess Doll Cake",
  "Cocomelon 1st Birthday Cake",
  "Unicorn Rainbow Theme Cake",
  "Boss Baby Blue Theme Cake",
  "Frozen Elsa Ice Castle Cake",
  "Cricket Stadium Theme Cake",
  "Luxury Make Up Theme Cake",
  "Car & Racing Theme Cake",
  "Jungle Safari Animal Theme Cake",
  "2 Tier Royal Wedding Cake",
  "Engagement Ring Platter Cake",
  "Bride To Be Bachelorette Cake",
  "Korean Bento Minimalist Cake",
  "Royal Rasmalai Pistachio Cake",
  "Lotus Biscoff Drip Cake",
  "Ferrero Rocher Gold Hazelnut Cake",
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
    badge: "#1 Bestseller",
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
    badge: "Coquette Style",
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
    badge: "Magical Theme",
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

  // Pineapple, Butterscotch, Black Forest, Strawberry, Mango & Fresh Fruit Cakes
  {
    id: "pin-pineapple-tropical-1",
    title: "Fresh Cream Tropical Pineapple Birthday Cake 🍍",
    category: "birthday",
    img: "https://i.pinimg.com/736x/35/e5/42/35e542121b3850641ab34dcaa0506d1c.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 899,
    badge: "Fresh Pineapple",
    tags: ["pineapple", "pneapple", "pinapple", "pineaple", "fruit", "yellow", "fresh cream", "birthday", "anniversary"],
  },
  {
    id: "pin-pineapple-celebration-2",
    title: "Classic Bakery Pineapple & Cherry Celebration Cake 🍍🍒",
    category: "birthday",
    img: "https://i.pinimg.com/736x/34/6f/d1/346fd1988370bc9f3b4487c7308b36fe.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 849,
    badge: "Bestseller",
    tags: ["pineapple", "pneapple", "pinapple", "pineaple", "cherry", "fruit", "cream", "birthday"],
  },
  {
    id: "pin-pineapple-elegant-3",
    title: "Elegant Golden Pineapple Crown Designer Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/65/c9/f3/65c9f3962dfbcc0bc5965d1585289442.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 999,
    tags: ["pineapple", "pneapple", "pinapple", "pineaple", "golden", "fruit", "birthday", "theme"],
  },
  {
    id: "pin-pineapple-delight-4",
    title: "Rich Whipped Cream & Juicy Pineapple Slice Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/c4/a2/9d/c4a29daa8c1550131e46029c42f9406e.jpg",
    startingWeight: "0.5 Kg",
    priceInr: 699,
    tags: ["pineapple", "pneapple", "pinapple", "pineaple", "fruit", "birthday"],
  },
  {
    id: "pin-pineapple-party-5",
    title: "Royal Yellow & White Pineapple Birthday Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/45/73/a1/4573a156d8744817fed4e9bbaab16663.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 899,
    tags: ["pineapple", "pneapple", "pinapple", "pineaple", "yellow", "birthday"],
  },
  {
    id: "pin-butterscotch-crunch-1",
    title: "Caramel Butterscotch Praline Crunch Cake 🍯",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/7f/78/d1/7f78d12a20d95c35280609edeeedb0ff.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 899,
    badge: "Caramel Crunch",
    tags: ["butterscotch", "buterscotch", "caramel", "crunch", "praline", "birthday", "anniversary"],
  },
  {
    id: "pin-butterscotch-birthday-2",
    title: "Royal Butterscotch Drip & Nougat Birthday Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/7e/2f/2e/7e2f2ef5cc976ab604a4d9d114ac4832.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 949,
    tags: ["butterscotch", "buterscotch", "caramel", "birthday"],
  },
  {
    id: "pin-black-forest-1",
    title: "Classic German Black Forest Cherry & Chocolate Flakes Cake 🍒",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/f1/be/be/f1bebed1cbe96aaf2cc0e827dff89989.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 899,
    badge: "Classic Hit",
    tags: ["black forest", "blackforest", "blak forest", "cherry", "chocolate", "birthday"],
  },
  {
    id: "pin-black-forest-2",
    title: "Rich White Cream & Dark Chocolate Black Forest Gateau",
    category: "chocolate",
    img: "https://i.pinimg.com/736x/83/af/eb/83afeb80790520320d2892dae943e7ae.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 949,
    tags: ["black forest", "blackforest", "cherry", "chocolate", "birthday"],
  },
  {
    id: "pin-strawberry-fresh-1",
    title: "Fluffy Fresh Pink Strawberry Cream Celebration Cake 🍓",
    category: "birthday",
    img: "https://i.pinimg.com/736x/44/fd/4a/44fd4a40252b82aa7a447a7ce9570599.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 999,
    badge: "Fresh Berry",
    tags: ["strawberry", "straberry", "berry", "pink", "fruit", "girl", "birthday"],
  },
  {
    id: "pin-strawberry-cake-2",
    title: "Lush Strawberry Glaze & Whipped Frosting Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/1f/fb/aa/1ffbaa3457a770958dea0f5522ef3671.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1049,
    tags: ["strawberry", "straberry", "berry", "fruit", "birthday", "anniversary"],
  },
  {
    id: "pin-mango-fresh-1",
    title: "Royal Alphonso Mango Fresh Cream Summer Cake 🥭",
    category: "birthday",
    img: "https://i.pinimg.com/736x/34/58/d4/3458d452a52728481dfbb45ff8f11888.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1099,
    badge: "Seasonal Hit",
    tags: ["mango", "alphonso", "fruit", "yellow", "birthday"],
  },
  {
    id: "pin-fresh-fruit-1",
    title: "Exotic Seasonal Fresh Fruit & Roasted Almond Cake 🥝🍓",
    category: "birthday",
    img: "https://i.pinimg.com/736x/05/deb2/05deb28f58475049797565c9040adfcd.jpg".replace("/05/deb2/", "/05/de/b2/"),
    startingWeight: "1.0 Kg",
    priceInr: 1149,
    badge: "Fresh Fruits",
    tags: ["fruit", "fresh fruit", "mixed fruit", "kiwi", "strawberry", "pineapple", "birthday", "anniversary"],
  },
  {
    id: "pin-fresh-fruit-2",
    title: "Luxury Fresh Berries & Tropical Fruit Overload Cake",
    category: "birthday",
    img: "https://i.pinimg.com/736x/1a/dc/e5/1adce5702126f492685c6b2100554f16.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    tags: ["fruit", "fresh fruit", "mixed fruit", "berries", "birthday"],
  },

  // Additional Popular Kids & Custom Themes (Shinchan, Boss Baby, Elsa, Doctor, Gym, Mahakal)
  {
    id: "pin-shinchan-1",
    title: "Naughty 3D Shinchan & Shiro Happy Birthday Cake 🖍️",
    category: "kids",
    img: "https://i.pinimg.com/736x/54/c9/26/54c926ed7dc8e06a72cce9b1e09c8b95.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "Shinchan Hit",
    tags: ["shinchan", "sinchan", "shinchain", "cartoon", "anime", "kids", "boy", "birthday"],
  },
  {
    id: "pin-shinchan-2",
    title: "Shinchan Fun House Colorful Birthday Cake",
    category: "kids",
    img: "https://i.pinimg.com/736x/50/93/08/5093080f192ce7b0d22b7b99653625be.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1249,
    tags: ["shinchan", "sinchan", "cartoon", "kids", "birthday"],
  },
  {
    id: "pin-boss-baby-1",
    title: "Boss Baby Blue Suit & Bottle 1st Birthday Cake 👶🍼",
    category: "kids",
    img: "https://i.pinimg.com/736x/6c/d9/11/6cd9110295db6495a3dbc01d60c28a7d.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "1st Birthday",
    tags: ["boss baby", "bossbaby", "baby", "1st birthday", "boy", "kids", "blue", "birthday"],
  },
  {
    id: "pin-frozen-elsa-1",
    title: "Magical Disney Frozen Princess Elsa Snowflake Cake ❄️",
    category: "kids",
    img: "https://i.pinimg.com/736x/9e/77/3c/9e773c6289b61f6d769dccabd92ca265.jpg",
    startingWeight: "1.5 Kg",
    priceInr: 1499,
    badge: "Frozen Elsa",
    tags: ["frozen", "elsa", "princess", "snowflake", "blue", "girl", "kids", "doll", "birthday"],
  },
  {
    id: "pin-doctor-theme-1",
    title: "Doctor Stethoscope & Medical Coat MBBS Celebration Cake 🩺",
    category: "birthday",
    img: "https://i.pinimg.com/736x/ce/95/07/ce95077385eccbb110b13ddbb42d2683.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1299,
    badge: "Doctor Theme",
    tags: ["doctor", "mbbs", "medical", "hospital", "stethoscope", "nurse", "graduation", "birthday"],
  },
  {
    id: "pin-gym-theme-1",
    title: "Gym Dumbbell & Fitness Bodybuilder Champion Cake 💪",
    category: "birthday",
    img: "https://i.pinimg.com/736x/80/d4/ea/80d4ea21c0320af02b04a0bbefaa32be.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1249,
    badge: "Fitness Fan",
    tags: ["gym", "fitness", "workout", "dumbbell", "bodybuilder", "protein", "boy", "mens", "birthday"],
  },
  {
    id: "pin-mahakal-theme-1",
    title: "Har Har Mahadev Trishul & Damru Mahakal Theme Cake 🔱",
    category: "birthday",
    img: "https://i.pinimg.com/736x/5f/cb/fd/5fcbfdbcbabafad2367f78e11ad3d231.jpg",
    startingWeight: "1.0 Kg",
    priceInr: 1199,
    badge: "Mahakal Special",
    tags: ["mahakal", "shiva", "mahadev", "trishul", "bholenath", "birthday"],
  },
];

const TYPO_MAP: Record<string, string> = {
  pneapple: "pineapple",
  pinapple: "pineapple",
  pineaple: "pineapple",
  pinaple: "pineapple",
  pinaaple: "pineapple",
  painapple: "pineapple",
  pneaple: "pineapple",
  buterscotch: "butterscotch",
  butterscoth: "butterscotch",
  buterscoth: "butterscotch",
  choclate: "chocolate",
  chocolat: "chocolate",
  chocalate: "chocolate",
  choclte: "chocolate",
  straberry: "strawberry",
  stawberry: "strawberry",
  strawbery: "strawberry",
  bluberry: "blueberry",
  bluebery: "blueberry",
  blakforest: "black forest",
  blackforest: "black forest",
  blak: "black",
  rasmali: "rasmalai",
  rasmalaiy: "rasmalai",
  redvelvet: "red velvet",
  vanila: "vanilla",
  venilla: "vanilla",
  trufle: "truffle",
  truffel: "truffle",
  biscoff: "lotus biscoff",
  biscof: "lotus biscoff",
  ferero: "ferrero rocher",
  doremon: "doraemon",
  doraemone: "doraemon",
  doramon: "doraemon",
  shinchain: "shinchan",
  sinchan: "shinchan",
  spideman: "spiderman",
  spidermen: "spiderman",
  spidy: "spiderman",
  barbi: "barbie",
  barby: "barbie",
  cocmelon: "cocomelon",
  cocomellon: "cocomelon",
  unicon: "unicorn",
  unicron: "unicorn",
  buterfly: "butterfly",
  butterfy: "butterfly",
  baterfly: "butterfly",
  aniversary: "anniversary",
  anniversery: "anniversary",
  aniversery: "anniversary",
  aniwersary: "anniversary",
  birtday: "birthday",
  brithday: "birthday",
  bday: "birthday",
  engagment: "engagement",
  engajment: "engagement",
  weding: "wedding",
  weeding: "wedding",
};

export function normalizeCakeQuery(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .split(/(\s+)/)
    .map((part) => {
      const clean = part.replace(/[^a-z0-9]/g, "");
      if (TYPO_MAP[clean]) {
        return TYPO_MAP[clean];
      }
      return part;
    })
    .join("");
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (Math.abs(a.length - b.length) > 2) return 99;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function matchesWordOrFuzzy(token: string, haystackText: string, haystackWordList: string[]): boolean {
  if (haystackText.includes(token)) return true;
  if (token.length < 4) return false;
  const maxDist = token.length >= 6 ? 2 : 1;
  for (const w of haystackWordList) {
    if (w.length < 4) continue;
    if (levenshteinDistance(token, w) <= maxDist) {
      return true;
    }
  }
  return false;
}

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
  "eggless",
  "online",
  "best",
  "new",
  "latest",
]);

const GENERIC_MODIFIER_WORDS = new Set([
  "birthday",
  "bday",
  "anniversary",
  "wedding",
  "boy",
  "boys",
  "girl",
  "girls",
  "kids",
  "kid",
  "baby",
  "men",
  "women",
  "husband",
  "wife",
  "mom",
  "dad",
  "tier",
  "party",
  "special",
  "happy",
]);

function scorePinAgainstQuery(pin: CakePin, rawQuery: string): number {
  const q = normalizeCakeQuery(rawQuery);
  if (!q) return 1;

  const haystackWords = [
    pin.title.toLowerCase(),
    pin.category.toLowerCase(),
    (pin.badge || "").toLowerCase(),
    ...pin.tags.map((t) => t.toLowerCase()),
  ].join(" ");

  const haystackWordList = haystackWords
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);

  const rawTokens = q
    .split(/[\s,/-]+/)
    .map((t) => TYPO_MAP[t.trim()] || t.trim())
    .filter((t) => t.length > 1);

  const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
  if (meaningfulTokens.length === 0) {
    return 10;
  }

  // Separate specific subject words (e.g. "pineapple", "doraemon", "doctor") from generic occasion words ("birthday", "boy", "girl")
  const specificTokens = meaningfulTokens.filter((t) => !GENERIC_MODIFIER_WORDS.has(t));
  const requiredTokens = specificTokens.length > 0 ? specificTokens : meaningfulTokens;

  // Every required subject token MUST match (exact or 1-2 char typo-tolerant fuzzy match)
  for (const reqTok of requiredTokens) {
    if (!matchesWordOrFuzzy(reqTok, haystackWords, haystackWordList)) {
      return 0;
    }
  }

  let score = 50;
  if (haystackWords.includes(q)) {
    score += 100;
  }

  for (const token of meaningfulTokens) {
    if (matchesWordOrFuzzy(token, haystackWords, haystackWordList)) {
      score += 25;
      if (pin.title.toLowerCase().includes(token)) {
        score += 20;
      }
      if (pin.tags.some((tag) => tag.toLowerCase() === token)) {
        score += 25;
      }
    }
  }

  return score;
}

export interface SeoCakeThemeItem {
  slug: string;
  label: string;
  query: string;
  desc: string;
}

export const SEO_CUSTOM_CAKE_THEMES: SeoCakeThemeItem[] = [
  { slug: "birthday-cake", label: "Birthday Cake", query: "Birthday Cake", desc: "Custom 100% eggless birthday cakes for boys, girls, kids & adults" },
  { slug: "anniversary-cake", label: "Anniversary Cake", query: "Anniversary Cake", desc: "Romantic couple, heart, 1st, 25th silver & 50th golden anniversary cakes" },
  { slug: "butterfly-cake", label: "Butterfly Cake", query: "Butterfly Cake", desc: "Trending pastel, purple, pink & gold edible butterfly cakes" },
  { slug: "doraemon-cake", label: "Doraemon Cake", query: "Doraemon Cake", desc: "3D Doraemon cartoon birthday cakes for kids in 100% pure eggless" },
  { slug: "spiderman-cake", label: "Spiderman Cake", query: "Spiderman Cake", desc: "Marvel Spiderman web superhero theme birthday cakes for boys" },
  { slug: "barbie-doll-cake", label: "Barbie Doll Cake", query: "Barbie Doll Cake", desc: "Pink princess dress Barbie doll cakes for girls birthday" },
  { slug: "2-tier-wedding-cake", label: "2-Tier Wedding Cake", query: "2 Tier Wedding Cake", desc: "Grand 2-tier & 3-tier royal wedding and reception designer cakes" },
  { slug: "engagement-ring-cake", label: "Engagement Ring Cake", query: "Engagement Ring Cake", desc: "Ring ceremony & roka celebration designer floral tier cakes" },
  { slug: "vintage-heart-cake", label: "Vintage Heart Cake", query: "Vintage Heart Cake", desc: "Lambeth piping coquette ribbon vintage heart aesthetic cakes" },
  { slug: "unicorn-cake", label: "Unicorn Cake", query: "Unicorn Cake", desc: "Magical pastel rainbow unicorn horn birthday cakes for kids" },
  { slug: "cocomelon-cake", label: "Cocomelon Cake", query: "Cocomelon Cake", desc: "JJ & Cocomelon nursery rhyme 1st & 2nd birthday theme cakes" },
  { slug: "shinchan-cake", label: "Shinchan Cake", query: "Shinchan Cake", desc: "Funny naughty Shinchan anime cartoon custom cakes" },
  { slug: "1st-birthday-cake", label: "1st Birthday Cake", query: "1st Birthday Cake", desc: "Milestone number 1 crown, teddy bear & jungle safari cakes" },
  { slug: "boss-baby-cake", label: "Boss Baby Cake", query: "Boss Baby Cake", desc: "Blue suit Boss Baby 1st birthday custom fondant & cream cakes" },
  { slug: "jungle-safari-cake", label: "Jungle Safari Cake", query: "Jungle Safari Cake", desc: "Lion, elephant, giraffe & monkey animal theme jungle cakes" },
  { slug: "cricket-theme-cake", label: "Cricket Theme Cake", query: "Cricket Theme Cake", desc: "Cricket pitch, bat, ball & IPL jersey birthday cakes" },
  { slug: "frozen-elsa-cake", label: "Frozen Elsa Cake", query: "Frozen Elsa Cake", desc: "Disney Frozen ice castle & Princess Elsa snowflake cakes" },
  { slug: "avengers-cake", label: "Avengers Superhero Cake", query: "Avengers Cake", desc: "Iron Man, Captain America, Thor & Hulk superhero cakes" },
  { slug: "car-theme-cake", label: "Car & Racing Cake", query: "Car Theme Cake", desc: "BMW, Mercedes, Ferrari & Hot Wheels racing car birthday cakes" },
  { slug: "bento-lunchbox-cake", label: "Korean Bento Cake", query: "Korean Bento Cake", desc: "Cute mini aesthetic Korean lunchbox cakes for couples & friends" },
  { slug: "bride-to-be-cake", label: "Bride To Be Cake", query: "Bride To Be Cake", desc: "Bachelorette party & bridal shower crown and gown cakes" },
  { slug: "baby-shower-cake", label: "Baby Shower Cake", query: "Baby Shower Cake", desc: "Mom-to-be, boy or girl gender reveal & welcome baby cakes" },
  { slug: "25th-anniversary-cake", label: "25th Silver Jubilee Cake", query: "25th Anniversary Cake", desc: "Silver jubilee 25th marriage anniversary 2-tier cakes" },
  { slug: "50th-anniversary-cake", label: "50th Golden Jubilee Cake", query: "50th Anniversary Cake", desc: "Golden jubilee 50th wedding anniversary royal gold cakes" },
  { slug: "rasmalai-cake", label: "Royal Rasmalai Cake", query: "Rasmalai Cake", desc: "Indian fusion pistachio, saffron & rabri rasmalai cakes" },
  { slug: "belgian-chocolate-cake", label: "Belgian Chocolate Truffle", query: "Chocolate Truffle Cake", desc: "Rich dark Belgian chocolate ganache drip & Ferrero Rocher cakes" },
  { slug: "red-velvet-heart-cake", label: "Red Velvet Heart Cake", query: "Red Velvet Heart Cake", desc: "Romantic red velvet cream cheese heart cakes for anniversary" },
  { slug: "pinata-smash-cake", label: "Pinata Hammer Cake", query: "Pinata Cake", desc: "3D chocolate shell smash pinata cakes with hammer surprise" },
  { slug: "photo-cake", label: "Custom Photo Cake", query: "Photo Cake", desc: "High-resolution edible photo print birthday & anniversary cakes" },
  { slug: "makeup-theme-cake", label: "Makeup & Fashion Cake", query: "Makeup Theme Cake", desc: "MAC lipstick, Chanel bag & vanity mirror designer cakes" },
  { slug: "peppa-pig-cake", label: "Peppa Pig Cake", query: "Peppa Pig Cake", desc: "Cute pink Peppa Pig family cartoon cakes for toddlers" },
  { slug: "minions-cake", label: "Minions Theme Cake", query: "Minions Cake", desc: "Despicable Me yellow Minion 3D birthday cakes" },
  { slug: "harry-potter-cake", label: "Harry Potter Cake", query: "Harry Potter Cake", desc: "Hogwarts, Golden Snitch & Happee Birthdae Harry cakes" },
  { slug: "football-theme-cake", label: "Football & Messi/Ronaldo Cake", query: "Football Theme Cake", desc: "Soccer ball, Real Madrid, Barcelona, Messi & CR7 cakes" },
  { slug: "gym-fitness-cake", label: "Gym & Fitness Cake", query: "Gym Theme Cake", desc: "Dumbbell, protein whey & bodybuilder theme birthday cakes" },
  { slug: "princess-crown-cake", label: "Princess Crown Cake", query: "Princess Crown Cake", desc: "Golden tiara crown pink & white royal princess cakes" },
  { slug: "doctor-theme-cake", label: "Doctor & MBBS Cake", query: "Doctor Cake", desc: "Stethoscope, white coat & medical graduation custom cakes" },
  { slug: "ca-chartered-accountant-cake", label: "CA & Finance Cake", query: "Chartered Accountant Cake", desc: "ICAI CA qualification, calculator & tax audit celebration cakes" },
  { slug: "mahakal-shiva-cake", label: "Mahakal & Shiva Cake", query: "Mahakal Cake", desc: "Trishul, Damru & Lord Shiva spiritual birthday theme cakes" },
  { slug: "khatu-shyam-cake", label: "Khatu Shyam Cake", query: "Khatu Shyam Cake", desc: "Hare Ka Sahara Khatu Shyam Baba Peacock feather custom cakes" },
  { slug: "thar-suv-cake", label: "Mahindra Thar SUV Cake", query: "Thar Car Cake", desc: "3D black & red Mahindra Thar 4x4 off-road SUV custom cakes" },
  { slug: "bullet-bike-cake", label: "Royal Enfield Bullet Cake", query: "Royal Enfield Cake", desc: "Classic 350 Royal Enfield motorcycle rider birthday cakes" },
  { slug: "motu-patlu-cake", label: "Motu Patlu Cake", query: "Motu Patlu Cake", desc: "Furfuri Nagar Motu Patlu samosa cartoon birthday cakes for kids" },
  { slug: "naruto-anime-cake", label: "Naruto & Anime Cake", query: "Naruto Cake", desc: "Naruto Uzumaki, One Piece, Goku Dragon Ball & Demon Slayer cakes" },
  { slug: "bts-kpop-cake", label: "BTS & Blackpink Cake", query: "BTS Cake", desc: "Purple army BTS & Blackpink K-Pop aesthetic birthday cakes" },
  { slug: "free-fire-pubg-cake", label: "Free Fire & BGMI Cake", query: "BGMI PUBG Cake", desc: "Winner Winner Chicken Dinner airdrop & gaming controller cakes" },
  { slug: "haldi-mehndi-cake", label: "Haldi & Mehndi Cake", query: "Haldi Mehndi Cake", desc: "Vibrant yellow marigold Haldi & green Mehndi wedding ceremony cakes" },
  { slug: "roka-ceremony-cake", label: "Roka & Shagun Cake", query: "Roka Ceremony Cake", desc: "Traditional Indian Roka, Tilak & Shagun celebration tier cakes" },
  { slug: "karwa-chauth-cake", label: "Karwa Chauth Cake", query: "Karwa Chauth Cake", desc: "Moonrise, sieve & romantic couple Karwa Chauth special cakes" },
  { slug: "parents-anniversary-cake", label: "Mom & Dad Anniversary Cake", query: "Mom Dad Anniversary Cake", desc: "Special family & parents wedding anniversary custom cakes" },
];

const NCR_CITY_MAP: Record<string, string> = {
  faridabad: "Faridabad",
  gurgaon: "Gurgaon",
  noida: "Noida",
  delhi: "Delhi",
  ghaziabad: "Ghaziabad",
};

export function parseThemeAndCityFromSlug(rawSlug: string): {
  themeSlug: string;
  themeQuery: string;
  themeLabel: string;
  citySlug?: string;
  cityName?: string;
  matchedTheme?: SeoCakeThemeItem;
} {
  let cleanSlug = rawSlug.toLowerCase().trim();
  let citySlug: string | undefined;
  let cityName: string | undefined;

  if (cleanSlug.includes("-in-")) {
    const idx = cleanSlug.lastIndexOf("-in-");
    const left = cleanSlug.slice(0, idx);
    const right = cleanSlug.slice(idx + 4);
    if (left && right) {
      cleanSlug = left;
      citySlug = right;
      cityName =
        NCR_CITY_MAP[right] ||
        right
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  }

  const matchedTheme = SEO_CUSTOM_CAKE_THEMES.find(
    (t) => t.slug.toLowerCase() === cleanSlug
  );

  const themeQuery = matchedTheme
    ? matchedTheme.query
    : cleanSlug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
        .trim();

  const themeLabel = matchedTheme ? matchedTheme.label : themeQuery;

  return {
    themeSlug: cleanSlug,
    themeQuery,
    themeLabel,
    citySlug,
    cityName,
    matchedTheme,
  };
}

export function slugToThemeQuery(slug: string): string {
  return parseThemeAndCityFromSlug(slug).themeQuery;
}

export default function CustomCakePinterestFinder() {
  const [searchParams] = useSearchParams();
  const { themeSlug } = useParams<{ themeSlug?: string }>();
  const parsedSlugInfo = useMemo(
    () => (themeSlug ? parseThemeAndCityFromSlug(themeSlug) : null),
    [themeSlug]
  );
  const [searchQuery, setSearchQuery] = useState(() => {
    const qParam = searchParams.get("q");
    if (qParam) return qParam;
    if (themeSlug) return slugToThemeQuery(themeSlug);
    return "";
  });
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get("cat") || "all");
  const [liveResult, setLiveResult] = useState<{ query: string; pins: CakePin[] }>({
    query: "",
    pins: [],
  });
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [previewPin, setPreviewPin] = useState<CakePin | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [customPasteUrl, setCustomPasteUrl] = useState("");
  const [autoSeoThemes, setAutoSeoThemes] = useState(() => getAutoSeoThemes());

  useEffect(() => {
    return subscribeAutoSeoUpdates(() => {
      setAutoSeoThemes(getAutoSeoThemes());
    });
  }, []);

  const allDirectoryThemes = useMemo(() => {
    const seen = new Set<string>();
    const combined: SeoCakeThemeItem[] = [];
    for (const item of [...SEO_CUSTOM_CAKE_THEMES, ...autoSeoThemes]) {
      if (seen.has(item.slug)) continue;
      seen.add(item.slug);
      combined.push(item);
    }
    return combined;
  }, [autoSeoThemes]);

  useEffect(() => {
    const qParam = searchParams.get("q");
    const catParam = searchParams.get("cat");
    if (qParam !== null) {
      setSearchQuery(qParam);
    } else if (themeSlug) {
      setSearchQuery(slugToThemeQuery(themeSlug));
      setActiveCategory("all");
    }
    if (catParam !== null) setActiveCategory(catParam);
  }, [searchParams, themeSlug]);

  const openCakePreview = (pin: CakePin) => {
    setIsImageZoomed(false);
    setPreviewPin(pin);
  };

  const closeCakePreview = () => {
    setIsImageZoomed(false);
    setPreviewPin(null);
  };

  // Lock background page scroll while the full-size cake preview modal is open
  useEffect(() => {
    if (!previewPin) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [previewPin]);

  // Live Custom Cake Search via our /api/pinterest-search endpoint with 0ms client cache & auto-SEO indexing
  useEffect(() => {
    const q = searchQuery.trim();
    const normQ = normalizeCakeQuery(q);
    if (q.length < 2) {
      setLiveResult({ query: "", pins: [] });
      setIsSearchingWeb(false);
      return;
    }

    // Instant 0ms cache hit if this query was already searched in this session
    const cachedPins = clientSearchCache.get(normQ);
    if (cachedPins && cachedPins.length > 0) {
      setLiveResult({ query: normQ, pins: cachedPins });
      setIsSearchingWeb(false);
      recordAutoSeoSearch(normQ);
      return;
    }

    // Immediately mark as searching so we don't show stale results
    setIsSearchingWeb(true);

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      // Automatically record this customer search into the in-built SEO/GEO ranking system
      recordAutoSeoSearch(normQ);

      try {
        const res = await fetch(`/api/pinterest-search?q=${encodeURIComponent(normQ)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("API error");
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("json")) throw new Error("Non-JSON response");
        const data = await res.json();
        const fetchedPins: CakePin[] = (data?.pins || []).map((p: any, idx: number) => ({
          id: p.id || `live-pin-${idx}-${Date.now()}`,
          title: p.title || `Custom ${normQ} Cake`,
          category: "custom",
          img: p.img,
          startingWeight: p.startingWeight || "1.0 Kg",
          priceInr: p.priceInr || 999,
          tags: [normQ, q.toLowerCase(), "custom"],
          badge: "Custom Design",
          pinUrl: p.pinUrl,
        }));
        if (fetchedPins.length > 0) {
          clientSearchCache.set(normQ, fetchedPins);
        }
        if (!controller.signal.aborted) {
          setLiveResult({ query: normQ, pins: fetchedPins });
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setLiveResult({ query: normQ, pins: [] });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingWeb(false);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Combine Live Fetched Pins FIRST + Strictly/Fuzzy Matched Curated Pins (No unrelated filler cakes!)
  const displayedPins = useMemo(() => {
    const q = searchQuery.trim();
    const normQ = normalizeCakeQuery(q);

    if (!q) {
      return CURATED_PINS.filter(
        (pin) => activeCategory === "all" || pin.category === activeCategory
      );
    }

    // Only use live pins if they belong to the current normalized search query
    const currentLivePins = liveResult.query === normQ ? liveResult.pins : [];

    // Strictly score curated pins (with typo tolerance e.g. "pneapple" -> "pineapple")
    const scoredLocal = CURATED_PINS.map((pin) => ({
      pin,
      score: scorePinAgainstQuery(pin, normQ),
    }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.pin);

    // Put LIVE Pinterest results for the exact query FIRST, followed by strict/fuzzy local matches
    const seenImgs = new Set<string>();
    const combined: CakePin[] = [];

    for (const p of [...currentLivePins, ...scoredLocal]) {
      if (!p.img || seenImgs.has(p.img)) continue;
      seenImgs.add(p.img);
      combined.push(p);
    }

    return combined;
  }, [searchQuery, activeCategory, liveResult]);

  // Dynamic Smart Search Suggestions (12+ suggestions) based on user's search input
  const relatedSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return POPULAR_SEARCHES.slice(0, 14);

    const matched = SMART_SUGGESTIONS_POOL.filter(
      (item) =>
        item.toLowerCase().includes(q) &&
        item.toLowerCase() !== q
    );
    const extras = POPULAR_SEARCHES.filter(
      (item) =>
        item.toLowerCase() !== q &&
        !matched.includes(item)
    );
    return [...matched, ...extras].slice(0, 14);
  }, [searchQuery]);

  // Build Direct WhatsApp Chat Link With Cake Image URL & Customer Preferences
  const buildWhatsAppLink = (pin: CakePin, extraNote?: string) => {
    const lines = [
      `Hi CakeUrban! 🎂 Mujhe ye custom cake banwana hai:`,
      ``,
      `🎂 *Cake Design:* ${pin.title}`,
      `✨ *Type:* 100% Pure Eggless Custom Cake`,
      ...(extraNote?.trim() ? [`✍️ *Custom Note:* ${extraNote.trim()}`] : []),
      ``,
      `🖼️ *Selected Cake Photo:*`,
      pin.img,
      ``,
      `Please share price & delivery slot!`,
    ];
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleCustomLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPasteUrl.trim()) return;
    const msg = [
      `Hi CakeUrban! 🎂 Mujhe ye custom cake design banwana hai:`,
      ``,
      `🔗 *Cake Link / Idea:* ${customPasteUrl.trim()}`,
      `✨ *Type:* 100% Pure Eggless Custom Cake`,
      ``,
      `Please check this design and share price & availability!`,
    ].join("\n");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full max-w-none mx-auto px-3.5 sm:px-5 lg:px-6 xl:px-8 py-5 sm:py-8">
      {/* Hero Header + Custom Cake Search Bar */}
      <div className="relative overflow-hidden border border-ink-700/70 bg-gradient-to-b from-ink-850 via-ink-900 to-ink-950 p-4 sm:p-8 clip-tile mb-5 sm:mb-8">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blaze-500/15 border border-blaze-500/40 text-blaze-400 font-mono text-[9px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.18em] uppercase font-bold max-w-full">
            <span className="w-2 h-2 rounded-full bg-blaze-500 animate-ping shrink-0" />
            <span className="truncate">
              {parsedSlugInfo?.cityName
                ? `Custom Cake Studio · ${parsedSlugInfo.cityName} Express Hub · 100% Eggless`
                : "Custom Cake Design Studio · 100% Eggless"}
            </span>
          </div>

          <h1
            id="seo-main-heading"
            className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight"
          >
            {parsedSlugInfo ? (
              <>
                Custom <span className="text-blaze-500">{parsedSlugInfo.themeLabel}</span>{" "}
                {parsedSlugInfo.cityName ? `in ${parsedSlugInfo.cityName}` : "Designs"}
              </>
            ) : (
              <>
                Search Any <span className="text-blaze-500">Custom Cake</span> & Chat on WhatsApp
              </>
            )}
          </h1>

          <p id="seo-direct-summary" className="text-ink-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {parsedSlugInfo?.matchedTheme ? (
              <>
                {parsedSlugInfo.matchedTheme.desc}
                {parsedSlugInfo.cityName ? ` with 30–45 mins express & midnight delivery in ${parsedSlugInfo.cityName}. ` : ". "}
                Pasand aane par photo ke niche <span className="text-emerald-400 font-semibold">"Chat About This Cake"</span> dabayein!
              </>
            ) : (
              <>
                Koi bhi cake theme search karein (jaise Doraemon, Butterfly, 2-Tier Engagement) aur pasand aane par photo ke niche{" "}
                <span className="text-emerald-400 font-semibold">"Chat About This Cake"</span> dabayein!
              </>
            )}
          </p>

          {/* Main Custom Cake Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
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
                type="search"
                enterKeyHint="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeCategory !== "all") setActiveCategory("all");
                }}
                placeholder="Search any cake: 'Pineapple', 'Butterfly', 'Doraemon', '2 Tier'..."
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
                className="mr-1.5 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blaze-500 hover:bg-blaze-400 text-white font-mono text-[10px] sm:text-xs uppercase font-bold tracking-wider transition-colors shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Smart Search Suggestions Strip (14+ Suggestions Always Ready) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1.5 pb-0.5 justify-start">
            <span className="font-mono text-[9px] uppercase tracking-wider text-gold-400 font-bold shrink-0">
              {searchQuery.trim() ? "✨ Related Ideas:" : "🔥 Popular Ideas:"}
            </span>
            {relatedSuggestions.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setSearchQuery(term);
                  setActiveCategory("all");
                }}
                className={`px-2.5 py-1 rounded-full font-mono text-[10px] border transition-all shrink-0 ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? "bg-blaze-500 text-white border-blaze-500 font-bold shadow-sm"
                    : "bg-ink-900/90 text-ink-200 border-ink-700 hover:border-blaze-400 hover:text-white"
                }`}
              >
                🔍 {term}
              </button>
            ))}
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
              Showing cake designs for{" "}
              <span className="text-blaze-400 font-bold">
                "{normalizeCakeQuery(searchQuery)}"
              </span>{" "}
              <span className="text-ink-400">({displayedPins.length} designs)</span>
            </p>
            {isSearchingWeb && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blaze-500/20 border border-blaze-500/40 text-blaze-400 font-mono text-[10px] animate-pulse shrink-0">
                Finding more cake designs...
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5 mb-6">
          {Array.from({ length: 12 }).map((_, i) => (
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

      {/* Responsive Feed (2 Columns on Phone, 3 on Tablet, 4 on Laptop, 5-6 on Large Desktop) */}
      <div id="pins-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
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
                  onClick={() => openCakePreview(pin)}
                  className="relative aspect-[4/5] bg-ink-950 overflow-hidden cursor-zoom-in"
                >
                  <img
                    src={pin.img}
                    alt={pin.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== FALLBACK_CAKE_IMG) {
                        target.src = FALLBACK_CAKE_IMG;
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Top Badge */}
                  {pin.badge && (
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-ink-950/85 backdrop-blur-sm border border-ink-700 font-mono text-[7.5px] sm:text-[9px] tracking-wider uppercase text-gold-400 font-bold truncate max-w-[75%]">
                        {pin.badge}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-950/85 backdrop-blur-sm border border-ink-700 font-mono text-[8px] text-ink-200 shrink-0">
                        🔍 Full View
                      </span>
                    </div>
                  )}

                  {/* Bottom Gradient Overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent p-2.5 sm:p-3 pt-8 flex items-end justify-between">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase block font-bold">
                      100% Pure Eggless
                    </span>
                  </div>
                </div>

                {/* Cake Title */}
                <div className="p-2.5 sm:p-3.5 pb-2">
                  <h3
                    onClick={() => openCakePreview(pin)}
                    className="font-display font-bold text-xs sm:text-sm text-ink-50 group-hover:text-blaze-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {pin.title}
                  </h3>
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
              `Hi CakeUrban! 🎂 Mujhe "${searchQuery}" theme me custom cake chahiye. Please share sample photos & price!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-bold uppercase tracking-wider"
          >
            <Ic.whatsapp className="w-4 h-4 fill-current" /> Chat About "{searchQuery}" Cake on WhatsApp
          </a>
        </div>
      )}

      {/* Paste Any Reference Cake Link Banner at Bottom */}
      <div className="mt-8 sm:mt-12 border border-ink-700/80 bg-ink-850 p-4 sm:p-7 clip-tile">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 sm:gap-6 items-center">
          <div className="min-w-0">
            <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase font-bold">
              ✨ Have a Reference Cake Photo or Link?
            </span>
            <h2 className="font-display text-lg sm:text-2xl font-black uppercase mt-1">
              Paste Any Cake Link or Idea & Get Instant Quote
            </h2>
            <p className="text-xs sm:text-sm text-ink-300 mt-1">
              Agar aapke paas kisi cake ka link ya design idea hai, toh yahan paste karein ya seedha WhatsApp par photo bhejein.
            </p>
          </div>

          <form onSubmit={handleCustomLinkSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customPasteUrl}
              onChange={(e) => setCustomPasteUrl(e.target.value)}
              placeholder="Paste cake link or describe your dream cake..."
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

      {/* SEO Theme Cake Directory + Hyperlocal Theme × City Matrix + GEO Direct Answer Capsule */}
      <section
        id="geo-answer-capsule"
        aria-label="Popular Custom Cake Themes & Google Search Directory"
        className="mt-8 sm:mt-12 border border-ink-800/90 bg-ink-900/70 rounded-xl p-4 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.18em] text-gold-400 uppercase font-bold block">
              🎂 100% Eggless Custom Cake Directory · 50+ Themes · Delhi NCR
            </span>
            <h2 className="font-display text-sm sm:text-lg font-black uppercase text-ink-100 mt-0.5">
              Popular Custom Theme Cakes You Can Order Online
            </h2>
          </div>
          <span className="font-mono text-[10px] text-ink-400">
            Same-Day & 12 AM Midnight Delivery in Faridabad, Gurgaon, Noida, Delhi & Ghaziabad
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {allDirectoryThemes.map((theme) => (
            <Link
              key={theme.slug}
              to={`/custom-cake/${theme.slug}`}
              onClick={() => {
                setSearchQuery(theme.query);
                setActiveCategory("all");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              title={`${theme.label} — ${theme.desc}`}
              className={`px-2.5 py-1 rounded-md font-mono text-[10px] border transition-colors ${
                searchQuery.toLowerCase() === theme.query.toLowerCase()
                  ? "bg-blaze-500 text-white border-blaze-500 font-bold"
                  : "bg-ink-950/80 text-ink-300 border-ink-800 hover:border-blaze-500/60 hover:text-ink-50"
              }`}
            >
              {theme.label}
            </Link>
          ))}
        </div>

        {/* Hyperlocal Theme × City Programmatic SEO Links */}
        <details className="border-t border-ink-800/80 pt-3.5 group">
          <summary className="cursor-pointer list-none flex items-center justify-between font-mono text-[10px] tracking-wider uppercase text-ink-300 hover:text-blaze-400">
            <span>📍 City-Wise Custom Theme Cake Delivery Hubs & AI Quick Facts (Faridabad · Gurgaon · Noida · Delhi · Ghaziabad)</span>
            <span className="text-blaze-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>

          <div className="mt-3.5 space-y-4 text-xs text-ink-300">
            {/* GEO Direct Answer Capsule for AI Search Engines (Google AI Overviews, ChatGPT, Perplexity) */}
            <div className="p-3.5 rounded-lg bg-ink-950/90 border border-ink-800 leading-relaxed">
              <p className="font-mono text-[10px] uppercase text-emerald-400 font-bold mb-1">
                ⚡ Direct Bakery Summary (Verified Facts)
              </p>
              <p>
                <strong>CakeUrban</strong> (<a href="https://wa.me/917318531953" className="text-blaze-400 underline">+91 7318531953</a>) bakes <strong>100% pure eggless custom theme cakes</strong> across 5 kitchen hubs in <strong>Faridabad, Gurgaon, Noida, South Delhi, and Ghaziabad</strong>. Customers can search 1,000+ live cake designs for any occasion—including <em>Birthday, Anniversary, Butterfly, Doraemon, Spiderman, Barbie Doll, 2-Tier Wedding, Engagement Ring, Vintage Heart, Unicorn, Cocomelon, Shinchan, Doctor, CA, Gym, Mahakal, Khatu Shyam, Thar SUV, and Korean Bento cakes</em>—and order directly on WhatsApp with 30–45 minute express or 12 AM midnight delivery.
              </p>
            </div>

            {/* Programmatic Theme × City Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(NCR_CITY_MAP).map(([cSlug, cName]) => (
                <div key={cSlug} className="space-y-1">
                  <p className="font-mono text-[9.5px] uppercase text-gold-400 font-bold">
                    {cName} Custom Cakes
                  </p>
                  <div className="flex flex-col gap-1 text-[11px] text-ink-400">
                    {SEO_CUSTOM_CAKE_THEMES.slice(0, 8).map((t) => (
                      <Link
                        key={`${t.slug}-${cSlug}`}
                        to={`/custom-cake/${t.slug}-in-${cSlug}`}
                        onClick={() => {
                          setSearchQuery(t.query);
                          setActiveCategory("all");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="hover:text-blaze-400 truncate"
                      >
                        {t.label} in {cName}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </details>
      </section>

      {/* Full-Size Cake Lightbox & Zoom Modal Mounted Directly on document.body */}
      {previewPin &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={closeCakePreview}
            className="fixed inset-0 z-[9999] bg-ink-950/95 backdrop-blur-md p-2 sm:p-5 flex items-center justify-center overflow-hidden"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-ink-900 border border-ink-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Top Bar with Title, Zoom Button & Close Button */}
              <div className="flex items-center justify-between gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-ink-800 bg-ink-950/90 shrink-0">
                <div className="min-w-0">
                  <span className="font-mono text-[9px] sm:text-[10px] text-gold-400 uppercase tracking-wider block">
                    🎂 Full Cake Preview · 100% Pure Eggless
                  </span>
                  <h3 className="font-display text-sm sm:text-lg font-black uppercase text-ink-50 truncate">
                    {previewPin.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsImageZoomed((z) => !z)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-100 font-mono text-[10px] sm:text-xs font-bold transition-colors"
                  >
                    {isImageZoomed ? "🔍 Fit Screen" : "🔍 Zoom In +"}
                  </button>
                  <button
                    type="button"
                    onClick={closeCakePreview}
                    aria-label="Close full image preview"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-ink-800 hover:bg-blaze-500 text-white grid place-items-center text-sm font-bold transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Full Uncropped Cake Photo Viewer (Tap to Zoom In/Out) */}
              <div
                onClick={() => setIsImageZoomed((z) => !z)}
                className={`relative bg-ink-950 flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 select-none ${
                  isImageZoomed ? "cursor-zoom-out items-start" : "cursor-zoom-in"
                }`}
              >
                <img
                  src={previewPin.img.replace(/\/(236x|474x)\//, "/736x/")}
                  alt={previewPin.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== previewPin.img) {
                      target.src = previewPin.img;
                    } else if (target.src !== FALLBACK_CAKE_IMG) {
                      target.src = FALLBACK_CAKE_IMG;
                    }
                  }}
                  className={`transition-all duration-300 rounded-lg shadow-2xl ${
                    isImageZoomed
                      ? "w-full sm:w-[85%] max-w-none h-auto object-contain mx-auto"
                      : "max-h-[58vh] sm:max-h-[66vh] w-auto max-w-full object-contain mx-auto"
                  }`}
                />
              </div>

              {/* Bottom Customize & WhatsApp Action Bar */}
              <div className="p-3 sm:p-4 border-t border-ink-800 bg-ink-900 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Cake message or custom note (e.g. Happy Birthday Aarav!)..."
                  className="flex-1 min-w-0 bg-ink-950 border border-ink-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink-100 outline-none focus:border-blaze-500"
                />

                <a
                  href={buildWhatsAppLink(previewPin, customNote)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shrink-0"
                >
                  <Ic.whatsapp className="w-4 h-4 fill-current shrink-0" />
                  <span>Chat About This Cake on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

// ============================================================================
// HOME PAGE SECTION: 1-LINE THEME CARDS + LEFT-TO-RIGHT SCROLLING CUSTOM CAKES
// ============================================================================
const HOME_THEME_CARDS = [
  {
    id: "birthday",
    title: "Birthday Cakes",
    subtitle: "Boys, Girls & Milestone",
    query: "Birthday Butterfly Chocolate Barbie Spiderman",
    searchLinkQuery: "Birthday Cake",
    coverImg: "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg",
    badge: "🎂 #1 Popular",
  },
  {
    id: "anniversary",
    title: "Anniversary Cakes",
    subtitle: "Couple, Heart & 25th",
    query: "Anniversary Heart Couple Red Rose Vintage",
    searchLinkQuery: "Anniversary Cake",
    coverImg: "https://i.pinimg.com/736x/20/9d/01/209d014bf357489993571a7957326293.jpg",
    badge: "❤️ Romantic",
  },
  {
    id: "theme-cake",
    title: "Theme Cakes",
    subtitle: "Cartoon, Car & Custom",
    query: "Spiderman Doraemon Cocomelon Unicorn Barbie Cricket",
    searchLinkQuery: "Theme Cake",
    coverImg: "https://i.pinimg.com/736x/95/55/4f/95554f34bd3d49fa42ba5df3477c6472.jpg",
    badge: "🎨 Custom Theme",
  },
  {
    id: "butterfly",
    title: "Butterfly Cakes",
    subtitle: "Pastel & Lavender",
    query: "Butterfly Pastel Lavender Korean Aesthetic",
    searchLinkQuery: "Butterfly Cake",
    coverImg: "https://i.pinimg.com/736x/66/43/4f/66434f01e84504790655519b5e6dcd35.jpg",
    badge: "🦋 Trending",
  },
  {
    id: "wedding-tier",
    title: "Wedding & 2-Tier",
    subtitle: "Ring & Engagement",
    query: "Wedding Tier Engagement Ring Royal",
    searchLinkQuery: "2 Tier Wedding",
    coverImg: "https://i.pinimg.com/736x/f6/e5/2c/f6e52c7f334a083d3dc691bd72c5e2ef.jpg",
    badge: "💍 Grand Tier",
  },
  {
    id: "vintage-heart",
    title: "Vintage Heart",
    subtitle: "Lambeth & Coquette",
    query: "Vintage Heart Lambeth Pink Ribbon",
    searchLinkQuery: "Vintage Heart",
    coverImg: "https://i.pinimg.com/736x/ed/63/f8/ed63f8e078267950345acfc4b0c970ec.jpg",
    badge: "💖 Most Saved",
  },
  {
    id: "barbie-doll",
    title: "Kids & Doll Cakes",
    subtitle: "Barbie, Unicorn & Elsa",
    query: "Barbie Princess Doll Unicorn Kids",
    searchLinkQuery: "Barbie Doll",
    coverImg: "https://i.pinimg.com/736x/70/4d/fb/704dfb7e71235f428024a03df9d1de97.jpg",
    badge: "👑 Kids Fav",
  },
  {
    id: "rasmalai-truffle",
    title: "Rasmalai & Truffle",
    subtitle: "Pistachio & Belgian",
    query: "Rasmalai Chocolate Truffle Biscoff Ferrero",
    searchLinkQuery: "Rasmalai Cake",
    coverImg: "https://i.pinimg.com/736x/01/72/3c/01723ce38ee879cf798718d9c82cebc4.jpg",
    badge: "🍫 Signature",
  },
];

export function HomeThemeCakeShowcase() {
  const [selectedTheme, setSelectedTheme] = useState(HOME_THEME_CARDS[0]);
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [liveThemeResult, setLiveThemeResult] = useState<{ themeId: string; pins: CakePin[] }>({
    themeId: "",
    pins: [],
  });
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [previewPin, setPreviewPin] = useState<CakePin | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const themeStripRef = useRef<HTMLDivElement>(null);
  const pinsReelRef = useRef<HTMLDivElement>(null);

  const openCakePreview = (pin: CakePin) => {
    setIsImageZoomed(false);
    setPreviewPin(pin);
  };

  const closeCakePreview = () => {
    setIsImageZoomed(false);
    setPreviewPin(null);
  };

  const scrollPinsReel = (dir: "left" | "right") => {
    if (!pinsReelRef.current) return;
    const shift = dir === "left" ? -320 : 320;
    pinsReelRef.current.scrollBy({ left: shift, behavior: "smooth" });
  };

  useEffect(() => {
    if (!previewPin) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [previewPin]);

  // Fetch live custom cake results for the selected theme or custom search query with 0ms client cache
  useEffect(() => {
    const controller = new AbortController();
    const customQ = homeSearchQuery.trim();
    const q = customQ ? normalizeCakeQuery(customQ) : selectedTheme.searchLinkQuery || selectedTheme.query;
    const activeKey = customQ ? `q:${normalizeCakeQuery(customQ)}` : selectedTheme.id;
    const cacheKey = `home:${activeKey}`;

    // Reset horizontal scroll position to start when switching theme or query
    if (pinsReelRef.current) {
      pinsReelRef.current.scrollTo({ left: 0, behavior: "smooth" });
    }

    const cached = clientSearchCache.get(cacheKey) || (customQ ? clientSearchCache.get(q) : undefined);
    if (cached && cached.length > 0) {
      setLiveThemeResult({ themeId: activeKey, pins: cached });
      setIsLoadingLive(false);
      if (customQ) recordAutoSeoSearch(q);
      return;
    }

    setIsLoadingLive(true);
    if (customQ) recordAutoSeoSearch(q);

    fetch(`/api/pinterest-search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        const fetched: CakePin[] = (data?.pins || []).map((p: any, idx: number) => ({
          id: p.id || `home-live-${activeKey}-${idx}`,
          title: p.title || `${customQ || selectedTheme.title} Design`,
          category: "custom",
          img: p.img,
          startingWeight: "1.0 Kg",
          priceInr: 999,
          tags: [activeKey, "custom"],
          badge: customQ ? "Custom Design" : selectedTheme.badge,
        }));
        if (fetched.length > 0) {
          clientSearchCache.set(cacheKey, fetched);
        }
        if (!controller.signal.aborted) {
          setLiveThemeResult({ themeId: activeKey, pins: fetched });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLiveThemeResult({ themeId: activeKey, pins: [] });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingLive(false);
      });

    return () => controller.abort();
  }, [selectedTheme, homeSearchQuery]);

  const homeSuggestions = useMemo(() => {
    const q = homeSearchQuery.trim().toLowerCase();
    if (!q) return POPULAR_SEARCHES.slice(0, 14);
    const matched = SMART_SUGGESTIONS_POOL.filter(
      (item) => item.toLowerCase().includes(q) && item.toLowerCase() !== q
    );
    const extras = POPULAR_SEARCHES.filter(
      (item) => item.toLowerCase() !== q && !matched.includes(item)
    );
    return [...matched, ...extras].slice(0, 14);
  }, [homeSearchQuery]);

  // Pre-loaded curated results + live search results (16+ cards in horizontal reel)
  const themePins = useMemo(() => {
    const customQ = homeSearchQuery.trim();
    const activeKey = customQ ? `q:${normalizeCakeQuery(customQ)}` : selectedTheme.id;
    const currentLive = liveThemeResult.themeId === activeKey ? liveThemeResult.pins : [];

    if (customQ) {
      const normQ = normalizeCakeQuery(customQ);
      const scoredLocal = CURATED_PINS.map((pin) => ({
        pin,
        score: scorePinAgainstQuery(pin, normQ),
      }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.pin);

      const seen = new Set<string>();
      const combined: CakePin[] = [];
      for (const p of [...currentLive, ...scoredLocal]) {
        if (!p.img || seen.has(p.img)) continue;
        seen.add(p.img);
        combined.push(p);
      }
      return combined.slice(0, 24);
    }

    const themeKeywords = selectedTheme.query.toLowerCase().split(/\s+/).filter(Boolean);
    const scoredLocal = CURATED_PINS.filter((pin) => {
      const hay = `${pin.title} ${pin.category} ${pin.tags.join(" ")}`.toLowerCase();
      return themeKeywords.some((kw) => hay.includes(kw));
    });

    const seen = new Set<string>();
    const combined: CakePin[] = [];
    for (const p of [...currentLive, ...scoredLocal]) {
      if (!p.img || seen.has(p.img)) continue;
      seen.add(p.img);
      combined.push(p);
    }

    return combined.slice(0, 24);
  }, [selectedTheme, liveThemeResult, homeSearchQuery]);

  const buildWhatsAppLink = (pin: CakePin, extraNote?: string) => {
    const lines = [
      `Hi CakeUrban! 🎂 Mujhe ye custom theme cake banwana hai:`,
      ``,
      `🎂 *Cake Design:* ${pin.title}`,
      `✨ *Theme:* ${selectedTheme.title} (100% Eggless)`,
      ...(extraNote?.trim() ? [`✍️ *Custom Note:* ${extraNote.trim()}`] : []),
      ``,
      `🖼️ *Selected Cake Photo:*`,
      pin.img,
      ``,
      `Please share price & delivery slot!`,
    ];
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const searchLink = `/builder?q=${encodeURIComponent(
    selectedTheme.searchLinkQuery || selectedTheme.query
  )}`;

  return (
    <section className="w-full max-w-none mx-auto px-3.5 sm:px-5 lg:px-6 xl:px-8 pb-10 sm:pb-14">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-ink-800">
        <div>
          <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-400 uppercase font-bold">
            🎂 Custom Cake Studio — Birthday · Anniversary · Theme Cakes
          </p>
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase mt-0.5 text-ink-50">
            Explore Custom Theme Cakes
          </h2>
          <p className="text-xs sm:text-sm text-ink-300 mt-1">
            Apna celebration theme chunein aur left-to-right swipe karke custom cake designs dekhein!
          </p>
        </div>

        <Link
          to="/builder"
          className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] tracking-[0.14em] uppercase px-4 sm:px-5 py-2.5 font-bold inline-flex items-center gap-2 self-start md:self-auto shrink-0 transition-colors"
        >
          <span>🔍 Search 1000+ Custom Cakes</span>
          <Ic.arrow className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Interactive Pinterest Cake Search Bar + Smart Suggestions right on Home */}
      <div className="mt-4 p-3.5 sm:p-5 bg-ink-900/90 border border-ink-800 rounded-xl space-y-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          <div className="relative flex items-center bg-ink-950 border-2 border-ink-700 focus-within:border-blaze-500 rounded-full overflow-hidden shadow-lg transition-colors">
            <span className="pl-3.5 sm:pl-5 text-ink-400 shrink-0">
              <Ic.search className="w-4 h-4 sm:w-5 sm:h-5 text-blaze-500" />
            </span>
            <input
              type="search"
              value={homeSearchQuery}
              onChange={(e) => setHomeSearchQuery(e.target.value)}
              placeholder="Search any Pinterest cake design: 'Butterfly', 'Doraemon', 'Pineapple', '2 Tier Wedding'..."
              className="w-full min-w-0 bg-transparent px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-ink-50 placeholder-ink-400 outline-none"
            />
            {homeSearchQuery && (
              <button
                type="button"
                onClick={() => setHomeSearchQuery("")}
                className="px-2 text-ink-400 hover:text-ink-100 font-mono text-xs shrink-0"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="mr-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-blaze-500 hover:bg-blaze-400 text-white font-mono text-[10px] sm:text-xs uppercase font-bold tracking-wider transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
          <span className="font-mono text-[9px] uppercase tracking-wider text-gold-400 font-bold shrink-0">
            {homeSearchQuery.trim() ? "✨ Related Ideas:" : "🔥 Popular Ideas:"}
          </span>
          {homeSuggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setHomeSearchQuery(term)}
              className={`px-2.5 py-1 rounded-full font-mono text-[10px] border transition-all shrink-0 ${
                homeSearchQuery.toLowerCase() === term.toLowerCase()
                  ? "bg-blaze-500 text-white border-blaze-500 font-bold shadow-sm"
                  : "bg-ink-950 text-ink-200 border-ink-700 hover:border-blaze-400 hover:text-white"
              }`}
            >
              🔍 {term}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Theme Cake Cards — Strictly 1 Single Horizontal Line on Phone & Full-Width Row on Desktop */}
      <div
        ref={themeStripRef}
        className="flex items-stretch gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory pt-4 pb-2 scroll-smooth"
      >
        {HOME_THEME_CARDS.map((theme) => {
          const isActive = selectedTheme.id === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setSelectedTheme(theme)}
              className={`group relative w-[132px] sm:w-[156px] md:w-[168px] xl:flex-1 xl:min-w-[155px] shrink-0 snap-start rounded-xl overflow-hidden border text-left transition-all duration-300 flex flex-col ${
                isActive
                  ? "border-blaze-500 ring-2 ring-blaze-500/40 bg-ink-850 shadow-lg shadow-blaze-500/20 -translate-y-0.5"
                  : "border-ink-800 hover:border-ink-600 bg-ink-900/90 hover:-translate-y-0.5"
              }`}
            >
              <div className="relative h-[84px] sm:h-[96px] w-full bg-ink-950 overflow-hidden">
                <img
                  src={theme.coverImg}
                  alt={theme.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== FALLBACK_CAKE_IMG) target.src = FALLBACK_CAKE_IMG;
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-ink-950/85 border border-ink-700 font-mono text-[8px] text-gold-400 font-bold truncate max-w-[90%]">
                  {theme.badge}
                </span>
              </div>

              <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
                <p
                  className={`font-display font-bold text-xs leading-tight truncate ${
                    isActive ? "text-blaze-400" : "text-ink-50 group-hover:text-blaze-400"
                  }`}
                >
                  {theme.title}
                </p>
                <p className="font-mono text-[9px] text-ink-400 truncate mt-0.5">
                  {theme.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Theme Header Bar + Left/Right Carousel Controls */}
      <div className="mt-3 mb-3 flex items-center justify-between gap-2 bg-ink-900/90 border border-ink-800 rounded-xl px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <p className="font-mono text-[11px] sm:text-xs text-ink-200 truncate">
            <strong className="text-blaze-400 uppercase">{selectedTheme.title}</strong>{" "}
            <span className="text-ink-400">({themePins.length}+ Designs · Swipe ⇆)</span>
          </p>
          {isLoadingLive && (
            <span className="font-mono text-[10px] text-gold-400 animate-pulse hidden sm:inline shrink-0">
              Loading more...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => scrollPinsReel("left")}
            aria-label="Scroll cake designs left"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-ink-700 bg-ink-950 hover:border-blaze-500 text-ink-100 grid place-items-center text-xs transition-colors"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollPinsReel("right")}
            aria-label="Scroll cake designs right"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-ink-700 bg-ink-950 hover:border-blaze-500 text-ink-100 grid place-items-center text-xs transition-colors"
          >
            →
          </button>
          <Link
            to={searchLink}
            className="ml-1 font-mono text-[10px] sm:text-[11px] text-blaze-400 hover:underline uppercase font-bold shrink-0"
          >
            View All →
          </Link>
        </div>
      </div>

      {/* 2. Left-to-Right Horizontal Scrolling Custom Cake Results Reel with Smooth Animation */}
      <div
        key={selectedTheme.id}
        ref={pinsReelRef}
        className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth pb-3 pt-1 anim-fade-in"
      >
        {themePins.map((pin, idx) => {
          const waHref = buildWhatsAppLink(pin);
          return (
            <div
              key={pin.id}
              style={{ animationDelay: `${Math.min(idx * 45, 360)}ms` }}
              className="anim-zoom group w-[178px] sm:w-[225px] md:w-[248px] shrink-0 snap-start bg-ink-900 border border-ink-800 hover:border-blaze-500/70 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-blaze-500/15 hover:-translate-y-1 min-w-0"
            >
              <div>
                <div
                  onClick={() => openCakePreview(pin)}
                  className="relative aspect-[4/5] bg-ink-950 overflow-hidden cursor-zoom-in"
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
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  />

                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-ink-950/85 backdrop-blur-sm border border-ink-700 font-mono text-[7.5px] sm:text-[9px] tracking-wider uppercase text-gold-400 font-bold truncate max-w-[70%]">
                      {pin.badge || selectedTheme.title}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-ink-950/85 backdrop-blur-sm border border-ink-700 font-mono text-[8px] text-ink-200 shrink-0">
                      🔍 Zoom
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent p-2.5 sm:p-3 pt-8 flex items-end justify-between">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase block font-bold">
                      100% Pure Eggless
                    </span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 pb-1.5">
                  <h3
                    onClick={() => openCakePreview(pin)}
                    className="font-display font-bold text-xs sm:text-sm text-ink-50 group-hover:text-blaze-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {pin.title}
                  </h3>
                  <p className="font-mono text-[9px] sm:text-[10px] text-ink-400 mt-1 truncate">
                    {selectedTheme.title} · Custom Made
                  </p>
                </div>
              </div>

              <div className="p-2 sm:p-3 pt-1">
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

      {/* Bottom CTA to Open Full Custom Cake Search Page */}
      <div className="mt-4 text-center">
        <Link
          to={searchLink}
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-ink-900 hover:bg-ink-850 border border-blaze-500/60 hover:border-blaze-400 text-ink-50 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all shadow-md"
        >
          <span>🎂 Explore All {selectedTheme.title} & Search Any Theme</span>
          <Ic.arrow className="w-3.5 h-3.5 text-blaze-400" />
        </Link>
      </div>

      {/* Crawlable Quick Theme Links for Google SEO Indexing */}
      <div className="mt-5 pt-4 border-t border-ink-800/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-400 shrink-0">
          Popular Cake Themes:
        </span>
        {SEO_CUSTOM_CAKE_THEMES.slice(0, 18).map((theme) => (
          <Link
            key={theme.slug}
            to={`/custom-cake/${theme.slug}`}
            className="px-2.5 py-1 rounded-full bg-ink-900/80 border border-ink-800 hover:border-blaze-500/60 font-mono text-[9.5px] text-ink-300 hover:text-white shrink-0 transition-colors"
          >
            {theme.label}
          </Link>
        ))}
      </div>

      {/* Full-Size Cake Lightbox Modal Mounted Directly on document.body */}
      {previewPin &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={closeCakePreview}
            className="fixed inset-0 z-[9999] bg-ink-950/95 backdrop-blur-md p-2 sm:p-5 flex items-center justify-center overflow-hidden"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-ink-900 border border-ink-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-ink-800 bg-ink-950/90 shrink-0">
                <div className="min-w-0">
                  <span className="font-mono text-[9px] sm:text-[10px] text-gold-400 uppercase tracking-wider block">
                    🎂 Full Cake Preview · 100% Pure Eggless
                  </span>
                  <h3 className="font-display text-sm sm:text-lg font-black uppercase text-ink-50 truncate">
                    {previewPin.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsImageZoomed((z) => !z)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-100 font-mono text-[10px] sm:text-xs font-bold transition-colors"
                  >
                    {isImageZoomed ? "🔍 Fit Screen" : "🔍 Zoom In +"}
                  </button>
                  <button
                    type="button"
                    onClick={closeCakePreview}
                    aria-label="Close full image preview"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-ink-800 hover:bg-blaze-500 text-white grid place-items-center text-sm font-bold transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div
                onClick={() => setIsImageZoomed((z) => !z)}
                className={`relative bg-ink-950 flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 select-none ${
                  isImageZoomed ? "cursor-zoom-out items-start" : "cursor-zoom-in"
                }`}
              >
                <img
                  src={previewPin.img.replace(/\/(236x|474x)\//, "/736x/")}
                  alt={previewPin.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== previewPin.img) {
                      target.src = previewPin.img;
                    } else if (target.src !== FALLBACK_CAKE_IMG) {
                      target.src = FALLBACK_CAKE_IMG;
                    }
                  }}
                  className={`transition-all duration-300 rounded-lg shadow-2xl ${
                    isImageZoomed
                      ? "w-full sm:w-[85%] max-w-none h-auto object-contain mx-auto"
                      : "max-h-[58vh] sm:max-h-[66vh] w-auto max-w-full object-contain mx-auto"
                  }`}
                />
              </div>

              <div className="p-3 sm:p-4 border-t border-ink-800 bg-ink-900 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Cake message or custom note (e.g. Happy Birthday Aarav!)..."
                  className="flex-1 min-w-0 bg-ink-950 border border-ink-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink-100 outline-none focus:border-blaze-500"
                />

                <a
                  href={buildWhatsAppLink(previewPin, customNote)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shrink-0"
                >
                  <Ic.whatsapp className="w-4 h-4 fill-current shrink-0" />
                  <span>Chat About This Cake on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

// ============================================================================
// EMBEDDABLE LIVE PINTEREST CAKE SEARCH + SMART SUGGESTIONS FOR ALL LANDING PAGES
// ============================================================================
export function LandingPinterestCakeSearch({
  initialQuery = "",
  locationLabel = "Delhi NCR",
}: {
  initialQuery?: string;
  locationLabel?: string;
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState("all");
  const [liveResult, setLiveResult] = useState<{ query: string; pins: CakePin[] }>({
    query: "",
    pins: [],
  });
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [previewPin, setPreviewPin] = useState<CakePin | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [customPasteUrl, setCustomPasteUrl] = useState("");

  useEffect(() => {
    setSearchQuery(initialQuery || "");
  }, [initialQuery]);

  useEffect(() => {
    if (!previewPin) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [previewPin]);

  useEffect(() => {
    const q = searchQuery.trim();
    const normQ = normalizeCakeQuery(q);
    if (q.length < 2) {
      setLiveResult({ query: "", pins: [] });
      setIsSearchingWeb(false);
      return;
    }

    const cachedPins = clientSearchCache.get(normQ);
    if (cachedPins && cachedPins.length > 0) {
      setLiveResult({ query: normQ, pins: cachedPins });
      setIsSearchingWeb(false);
      recordAutoSeoSearch(normQ);
      return;
    }

    setIsSearchingWeb(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      recordAutoSeoSearch(normQ);
      try {
        const res = await fetch(`/api/pinterest-search?q=${encodeURIComponent(normQ)}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const fetchedPins: CakePin[] = (data?.pins || []).map((p: any, idx: number) => ({
          id: p.id || `landing-pin-${idx}-${Date.now()}`,
          title: p.title || `Custom ${normQ} Cake`,
          category: "custom",
          img: p.img,
          startingWeight: p.startingWeight || "1.0 Kg",
          priceInr: p.priceInr || 999,
          tags: [normQ, q.toLowerCase(), "custom"],
          badge: "Custom Design",
          pinUrl: p.pinUrl,
        }));
        if (fetchedPins.length > 0) {
          clientSearchCache.set(normQ, fetchedPins);
        }
        if (!controller.signal.aborted) {
          setLiveResult({ query: normQ, pins: fetchedPins });
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setLiveResult({ query: normQ, pins: [] });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearchingWeb(false);
        }
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  const displayedPins = useMemo(() => {
    const q = searchQuery.trim();
    const normQ = normalizeCakeQuery(q);

    if (!q) {
      return CURATED_PINS.filter(
        (pin) => activeCategory === "all" || pin.category === activeCategory
      ).slice(0, 18);
    }

    const currentLivePins = liveResult.query === normQ ? liveResult.pins : [];
    const scoredLocal = CURATED_PINS.map((pin) => ({
      pin,
      score: scorePinAgainstQuery(pin, normQ),
    }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.pin);

    const seenImgs = new Set<string>();
    const combined: CakePin[] = [];
    for (const p of [...currentLivePins, ...scoredLocal]) {
      if (!p.img || seenImgs.has(p.img)) continue;
      seenImgs.add(p.img);
      combined.push(p);
    }
    return combined.slice(0, 24);
  }, [searchQuery, activeCategory, liveResult]);

  const relatedSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return POPULAR_SEARCHES.slice(0, 16);

    const matched = SMART_SUGGESTIONS_POOL.filter(
      (item) => item.toLowerCase().includes(q) && item.toLowerCase() !== q
    );
    const extras = POPULAR_SEARCHES.filter(
      (item) => item.toLowerCase() !== q && !matched.includes(item)
    );
    return [...matched, ...extras].slice(0, 16);
  }, [searchQuery]);

  const buildWhatsAppLink = (pin: CakePin, extraNote?: string) => {
    const lines = [
      `Hi CakeUrban! 🎂 Mujhe ${locationLabel} me ye custom cake banwana hai:`,
      ``,
      `🎂 *Cake Design:* ${pin.title}`,
      `📍 *Delivery Area:* ${locationLabel}`,
      `✨ *Type:* 100% Pure Eggless Custom Cake`,
      ...(extraNote?.trim() ? [`✍️ *Custom Note:* ${extraNote.trim()}`] : []),
      ``,
      `🖼️ *Selected Cake Photo:*`,
      pin.img,
      ``,
      `Please share price & express delivery slot!`,
    ];
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <section
      id="pinterest-cake-search"
      aria-label={`Search Custom Pinterest Cakes in ${locationLabel}`}
      className="my-8 sm:my-10 border border-blaze-500/40 bg-gradient-to-b from-ink-850 via-ink-900 to-ink-950 p-4 sm:p-7 clip-tile rounded-xl shadow-2xl"
    >
      {/* Header + Search Input */}
      <div className="max-w-4xl mx-auto text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blaze-500/15 border border-blaze-500/40 text-blaze-400 font-mono text-[9px] sm:text-[10px] tracking-[0.15em] uppercase font-bold">
          <span className="w-2 h-2 rounded-full bg-blaze-500 animate-ping shrink-0" />
          <span>🎂 Live Pinterest Custom Cake Search · {locationLabel}</span>
        </div>

        <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
          Search Any <span className="text-blaze-500">Custom Cake Design</span> in {locationLabel}
        </h2>

        <p className="text-ink-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Koi bhi cake theme search karein (jaise <strong>Butterfly, Doraemon, 2-Tier Engagement, Rasmalai, Spiderman, Barbie</strong>) ya niche diye suggestions par click karein — aur pasand aane par seedha WhatsApp par order karein!
        </p>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          className="pt-2"
        >
          <div className="relative flex items-center bg-ink-950 border-2 border-ink-700 focus-within:border-blaze-500 rounded-full overflow-hidden shadow-2xl transition-colors">
            <span className="pl-3.5 sm:pl-5 text-ink-400 shrink-0">
              <Ic.search className="w-4 h-4 sm:w-5 sm:h-5 text-blaze-500" />
            </span>
            <input
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeCategory !== "all") setActiveCategory("all");
              }}
              placeholder="Search any cake: 'Butterfly', 'Doraemon', 'Pineapple', '2 Tier Wedding'..."
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
              className="mr-1.5 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-blaze-500 hover:bg-blaze-400 text-white font-mono text-[10px] sm:text-xs uppercase font-bold tracking-wider transition-colors shrink-0"
            >
              Search
            </button>
          </div>
        </form>

        {/* Interactive Smart Suggestions Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-1 justify-start">
          <span className="font-mono text-[9px] uppercase tracking-wider text-gold-400 font-bold shrink-0">
            {searchQuery.trim() ? "✨ Related Suggestions:" : "🔥 Popular Suggestions:"}
          </span>
          {relatedSuggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setSearchQuery(term);
                setActiveCategory("all");
              }}
              className={`px-2.5 py-1 rounded-full font-mono text-[10px] border transition-all shrink-0 ${
                searchQuery.toLowerCase() === term.toLowerCase()
                  ? "bg-blaze-500 text-white border-blaze-500 font-bold shadow-sm"
                  : "bg-ink-900/90 text-ink-200 border-ink-700 hover:border-blaze-400 hover:text-white"
              }`}
            >
              🔍 {term}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-2 mt-4 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id);
              if (searchQuery) setSearchQuery("");
            }}
            className={`px-3 sm:px-4 py-1.5 rounded-full font-mono text-[10px] sm:text-xs uppercase tracking-wider border transition-all shrink-0 ${
              activeCategory === cat.id && !searchQuery
                ? "bg-blaze-500 text-white border-blaze-500 font-bold shadow-md"
                : "bg-ink-900 text-ink-300 border-ink-700/80 hover:border-ink-500"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Active Search Status */}
      {searchQuery.trim() !== "" && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-mono text-xs text-ink-300 truncate">
              Showing Pinterest cake designs for{" "}
              <span className="text-blaze-400 font-bold">"{normalizeCakeQuery(searchQuery)}"</span>{" "}
              in <span className="text-emerald-400">{locationLabel}</span> ({displayedPins.length} designs)
            </p>
            {isSearchingWeb && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blaze-500/20 border border-blaze-500/40 text-blaze-400 font-mono text-[10px] animate-pulse shrink-0">
                Loading live designs...
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="font-mono text-[11px] text-blaze-400 hover:underline shrink-0"
          >
            Reset ✕
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isSearchingWeb && displayedPins.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-ink-800/70" />
              <div className="p-3 space-y-2">
                <div className="h-3.5 bg-ink-800 rounded w-3/4" />
                <div className="h-8 bg-ink-800 rounded w-full mt-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pinterest Cake Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 sm:gap-4">
        {displayedPins.map((pin) => {
          const waHref = buildWhatsAppLink(pin);
          return (
            <div
              key={pin.id}
              className="group bg-ink-900 border border-ink-800 hover:border-blaze-500/60 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-lg hover:shadow-blaze-500/10 min-w-0"
            >
              <div>
                <div
                  onClick={() => {
                    setIsImageZoomed(false);
                    setPreviewPin(pin);
                  }}
                  className="relative aspect-[4/5] bg-ink-950 overflow-hidden cursor-zoom-in"
                >
                  <img
                    src={pin.img}
                    alt={`${pin.title} in ${locationLabel}`}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== FALLBACK_CAKE_IMG) {
                        target.src = FALLBACK_CAKE_IMG;
                      }
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {pin.badge && (
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none gap-1">
                      <span className="px-2 py-0.5 rounded-full bg-ink-950/85 backdrop-blur-sm border border-ink-700 font-mono text-[7.5px] sm:text-[9px] tracking-wider uppercase text-gold-400 font-bold truncate max-w-[75%]">
                        {pin.badge}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-950/85 backdrop-blur-sm border border-ink-700 font-mono text-[8px] text-ink-200 shrink-0">
                        🔍 Zoom
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent p-2.5 pt-7 flex items-end justify-between">
                    <span className="font-mono text-[9px] text-emerald-400 uppercase block font-bold">
                      100% Pure Eggless
                    </span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 pb-1.5">
                  <h3
                    onClick={() => {
                      setIsImageZoomed(false);
                      setPreviewPin(pin);
                    }}
                    className="font-display font-bold text-xs sm:text-sm text-ink-50 group-hover:text-blaze-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                  >
                    {pin.title}
                  </h3>
                </div>
              </div>

              <div className="p-2 sm:p-3 pt-1">
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

      {/* Paste Reference Link or Custom Idea Bar */}
      <div className="mt-5 pt-4 border-t border-ink-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xs sm:text-sm font-bold uppercase text-ink-100">
            ✨ Have a Reference Cake Link or Photo for {locationLabel}?
          </p>
          <p className="text-[11px] text-ink-400">
            Apna cake idea likhein ya link paste karein aur WhatsApp par instant price paayein!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:w-auto flex-1 max-w-lg">
          <input
            type="text"
            value={customPasteUrl}
            onChange={(e) => setCustomPasteUrl(e.target.value)}
            placeholder="Paste cake link or type your cake idea..."
            className="flex-1 min-w-0 bg-ink-950 border border-ink-700 focus:border-blaze-500 rounded-lg px-3 py-2 text-xs text-ink-100 outline-none"
          />
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
              `Hi CakeUrban! 🎂 Mujhe ${locationLabel} me ye custom cake banwana hai:\n\n🔗 Idea/Link: ${
                customPasteUrl.trim() || searchQuery.trim() || "Custom Theme Cake"
              }\n✨ Type: 100% Pure Eggless\n\nPlease share price & delivery slot!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shrink-0"
          >
            <Ic.whatsapp className="w-4 h-4 fill-current" /> Send to WhatsApp
          </a>
        </div>
      </div>

      {/* GSC Video Watch Page Player + Key Moments + ⭐ 4.9/5 Locality Verified Reviews */}
      <div className="mt-5 pt-5 border-t border-ink-800 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left: Prominent Video Watch Card (Fixes GSC "Video isn't on a watch page" across all 10,000+ URLs) */}
        <div
          id="cakeurban-watch-player"
          itemScope
          itemType="https://schema.org/VideoObject"
          className="lg:col-span-5 bg-ink-950 border border-ink-700/80 rounded-xl p-3 sm:p-4 flex flex-col justify-between"
        >
          <meta
            itemProp="name"
            content={`100% Eggless Custom Cake Baking & 30-Min Cold-Chain Delivery in ${locationLabel}`}
          />
          <meta
            itemProp="description"
            content={`Watch how CakeUrban patisserie chefs freshly bake 100% pure eggless Belgian chocolate, rasmalai & custom theme cakes for 30-45 min delivery in ${locationLabel}.`}
          />
          <meta
            itemProp="thumbnailUrl"
            content="https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png"
          />
          <meta itemProp="uploadDate" content="2026-01-15T08:00:00+05:30" />
          <meta
            itemProp="contentUrl"
            content="https://assets.mixkit.co/videos/preview/mixkit-confectioner-decorating-a-chocolate-cake-41444-large.mp4"
          />

          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[9px] uppercase tracking-wider font-bold">
              ▶ Live Kitchen Watch (0:45)
            </span>
            <span className="font-mono text-[9px] text-ink-400">100% Pure Eggless · 4°C Chilled</span>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-ink-800 bg-ink-900 aspect-video">
            <video
              controls
              playsInline
              preload="metadata"
              width={640}
              height={360}
              poster="https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png"
              className="w-full h-full object-cover"
            >
              <source
                src="https://assets.mixkit.co/videos/preview/mixkit-confectioner-decorating-a-chocolate-cake-41444-large.mp4"
                type="video/mp4"
              />
            </video>
          </div>

          <div className="mt-2.5">
            <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-ink-50">
              How We Bake & Deliver 100% Eggless Custom Cakes in {locationLabel}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded bg-ink-900 border border-ink-700 font-mono text-[9px] text-gold-400">
                ⏱ 0:00 Eggless Sponge
              </span>
              <span className="px-2 py-0.5 rounded bg-ink-900 border border-ink-700 font-mono text-[9px] text-blaze-400">
                ⏱ 0:15 Custom Theme Piping
              </span>
              <span className="px-2 py-0.5 rounded bg-ink-900 border border-ink-700 font-mono text-[9px] text-emerald-400">
                ⏱ 0:30 4°C Cold-Box Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Right: ⭐ 4.9/5 Verified Customer Reviews & Rich Snippet Trust Box */}
        <div className="lg:col-span-7 bg-ink-950 border border-ink-700/80 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ink-800">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-gold-400 text-sm">★★★★★</span>
                <span className="font-display font-black text-sm sm:text-base text-ink-50">4.9 / 5.0</span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  2,840+ Verified Orders
                </span>
              </div>
              <p className="text-[11px] text-ink-400 mt-0.5">
                Rated #1 100% Pure Eggless Custom Cake Bakery in {locationLabel} · Starting ₹449 · Free 30-Min Delivery
              </p>
            </div>
            <Link
              to="/delivery-locations"
              className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg bg-ink-900 hover:border-blaze-500 border border-ink-700 text-blaze-400 transition-colors"
            >
              📍 Check Pincode SLA →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
            <div className="p-2.5 rounded-lg bg-ink-900/90 border border-ink-800">
              <div className="flex items-center justify-between text-[10px] font-mono text-gold-400 mb-1">
                <span>★★★★★ Verified Buyer</span>
                <span className="text-emerald-400">⚡ Delivered in 29 mins</span>
              </div>
              <p className="text-xs text-ink-100 leading-snug">
                "Ordered a custom <strong className="text-blaze-400">{searchQuery.trim() || "Butterfly & Rasmalai"}</strong> cake in{" "}
                <strong>{locationLabel}</strong>. 100% pure eggless, super soft sponge & exact Pinterest photo finish!"
              </p>
              <p className="font-mono text-[9px] text-ink-400 mt-1.5">— Aarav Sharma · {locationLabel}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-ink-900/90 border border-ink-800">
              <div className="flex items-center justify-between text-[10px] font-mono text-gold-400 mb-1">
                <span>★★★★★ Midnight Slot</span>
                <span className="text-emerald-400">🌙 12:00 AM Surprise</span>
              </div>
              <p className="text-xs text-ink-100 leading-snug">
                "Sent our reference cake design on WhatsApp (+91 7318531953) at 9 PM and received a chilled 4°C Belgian truffle cake right at midnight in {locationLabel}!"
              </p>
              <p className="font-mono text-[9px] text-ink-400 mt-1.5">— Priya Malhotra · Verified Order</p>
            </div>
          </div>

          {/* Quick Rich Snippet Highlights Strip */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-ink-800 text-center">
            <div className="bg-ink-900/60 rounded px-2 py-1.5">
              <span className="block font-mono text-[9px] text-ink-400 uppercase">Price Range</span>
              <span className="font-display font-bold text-xs text-ink-50">₹449 – ₹2,499</span>
            </div>
            <div className="bg-ink-900/60 rounded px-2 py-1.5">
              <span className="block font-mono text-[9px] text-ink-400 uppercase">Express SLA</span>
              <span className="font-display font-bold text-xs text-emerald-400">30–45 Mins (₹0 Fee)</span>
            </div>
            <div className="bg-ink-900/60 rounded px-2 py-1.5">
              <span className="block font-mono text-[9px] text-ink-400 uppercase">Kitchen Hygiene</span>
              <span className="font-display font-bold text-xs text-gold-400">100% Pure Eggless</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spider-Web Hyperlocal Internal Linking Mesh (Accelerates Googlebot Crawling Across 80,000+ Pages) */}
      <details className="mt-4 pt-3 border-t border-ink-800/80 group">
        <summary className="cursor-pointer list-none flex items-center justify-between text-[11px] font-mono text-ink-400 hover:text-ink-200">
          <span>🔗 Explore Trending Custom Cake Themes & Express NCR Delivery Hubs ({locationLabel})</span>
          <span className="text-blaze-400 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="mt-3 space-y-3 text-left">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-gold-400 mb-1.5">
              🎂 Popular 100% Eggless Custom Cake Themes:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { slug: "butterfly-cake", label: "Butterfly Cake" },
                { slug: "rasmalai-cake", label: "Rasmalai Cake" },
                { slug: "vintage-heart-cake", label: "Vintage Heart Cake" },
                { slug: "belgian-chocolate-truffle-cake", label: "Belgian Chocolate Cake" },
                { slug: "pineapple-cake", label: "Fresh Pineapple Cake" },
                { slug: "red-velvet-cake", label: "Red Velvet Heart Cake" },
                { slug: "doraemon-cake", label: "Doraemon Cake" },
                { slug: "spiderman-cake", label: "Spiderman Cake" },
                { slug: "barbie-doll-cake", label: "Barbie Doll Cake" },
                { slug: "unicorn-cake", label: "Unicorn Cake" },
                { slug: "cocomelon-cake", label: "Cocomelon Cake" },
                { slug: "shinchan-cake", label: "Shinchan Cake" },
                { slug: "2-tier-wedding-cake", label: "2-Tier Wedding Cake" },
                { slug: "engagement-ring-cake", label: "Engagement Ring Cake" },
                { slug: "korean-bento-cake", label: "Korean Bento Cake" },
                { slug: "lotus-biscoff-cake", label: "Lotus Biscoff Cake" },
                { slug: "ferrero-rocher-cake", label: "Ferrero Rocher Cake" },
                { slug: "pinata-hammer-cake", label: "Pinata Hammer Cake" },
                { slug: "photo-pulling-cake", label: "Photo Pulling Cake" },
                { slug: "baby-shower-cake", label: "Baby Shower Cake" },
              ].map((t) => (
                <Link
                  key={t.slug}
                  to={`/custom-cake/${t.slug}`}
                  className="px-2 py-0.5 rounded bg-ink-900 hover:border-blaze-500 border border-ink-800 font-mono text-[9px] text-ink-300 hover:text-blaze-400 transition-colors"
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 mb-1.5">
              ⚡ 30-Min Express Cake Delivery Hubs Across Delhi NCR:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                { to: "/cakes-in/faridabad", label: "Faridabad Hub" },
                { to: "/cakes-in/gurgaon", label: "Gurgaon Hub" },
                { to: "/cakes-in/noida", label: "Noida Hub" },
                { to: "/cakes-in/delhi", label: "Delhi Hub" },
                { to: "/cakes-in/ghaziabad", label: "Ghaziabad Hub" },
                { to: "/cake-delivery-in/sector-15-faridabad", label: "Sector 15 Faridabad" },
                { to: "/cake-delivery-in/nit-faridabad", label: "NIT Faridabad" },
                { to: "/belgian-chocolate-cake-in-greenfield", label: "Greenfield Colony" },
                { to: "/belgian-chocolate-birthday-cake-in-faridabad", label: "Belgian Cake Faridabad" },
                { to: "/baby-shower-cake-delivery-in-sector-45-gurgaon", label: "Sector 45 Gurgaon" },
                { to: "/cake-delivery-in/dlf-phase-4-gurgaon", label: "DLF Phase 4 Gurgaon" },
                { to: "/cake-delivery-in/sector-56-gurgaon", label: "Sector 56 Gurgaon" },
                { to: "/cake-delivery-in/sector-18-noida", label: "Sector 18 Noida" },
                { to: "/cake-delivery-in/sector-62-noida", label: "Sector 62 Noida" },
                { to: "/cake-delivery-in/greater-noida-west", label: "Greater Noida West" },
                { to: "/sugar-free-cake-delivery-in-vasant-kunj", label: "Vasant Kunj Sugar-Free" },
                { to: "/cake-delivery-in/greater-kailash-delhi", label: "Greater Kailash Delhi" },
                { to: "/cake-delivery-in/saket-delhi", label: "Saket South Delhi" },
                { to: "/cake-delivery-in/dwarka-delhi", label: "Dwarka Delhi" },
                { to: "/cake-delivery-in/indirapuram-ghaziabad", label: "Indirapuram Ghaziabad" },
              ].map((hub) => (
                <Link
                  key={hub.to}
                  to={hub.to}
                  className="px-2 py-0.5 rounded bg-ink-900 hover:border-emerald-500 border border-ink-800 font-mono text-[9px] text-ink-300 hover:text-emerald-400 transition-colors"
                >
                  {hub.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </details>

      {/* Lightbox Modal */}
      {previewPin &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setPreviewPin(null)}
            className="fixed inset-0 z-[9999] bg-ink-950/95 backdrop-blur-md p-2 sm:p-5 flex items-center justify-center overflow-hidden"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-ink-900 border border-ink-700 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-ink-800 bg-ink-950/90 shrink-0">
                <div className="min-w-0">
                  <span className="font-mono text-[9px] sm:text-[10px] text-gold-400 uppercase tracking-wider block">
                    🎂 Full Cake Preview · {locationLabel}
                  </span>
                  <h3 className="font-display text-sm sm:text-lg font-black uppercase text-ink-50 truncate">
                    {previewPin.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsImageZoomed((z) => !z)}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-100 font-mono text-[10px] sm:text-xs font-bold transition-colors"
                  >
                    {isImageZoomed ? "🔍 Fit Screen" : "🔍 Zoom In +"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPin(null)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-ink-800 hover:bg-blaze-500 text-white grid place-items-center text-sm font-bold transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div
                onClick={() => setIsImageZoomed((z) => !z)}
                className={`relative bg-ink-950 flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 select-none ${
                  isImageZoomed ? "cursor-zoom-out items-start" : "cursor-zoom-in"
                }`}
              >
                <img
                  src={previewPin.img.replace(/\/(236x|474x)\//, "/736x/")}
                  alt={previewPin.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== FALLBACK_CAKE_IMG) target.src = FALLBACK_CAKE_IMG;
                  }}
                  className={`transition-all duration-300 rounded-lg shadow-2xl ${
                    isImageZoomed
                      ? "w-full sm:w-[85%] max-w-none h-auto object-contain mx-auto"
                      : "max-h-[58vh] sm:max-h-[66vh] w-auto max-w-full object-contain mx-auto"
                  }`}
                />
              </div>

              <div className="p-3 sm:p-4 border-t border-ink-800 bg-ink-900 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Cake message or custom note (e.g. Happy Birthday Aarav!)..."
                  className="flex-1 min-w-0 bg-ink-950 border border-ink-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-ink-100 outline-none focus:border-blaze-500"
                />
                <a
                  href={buildWhatsAppLink(previewPin, customNote)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-ink-950 font-mono text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shrink-0"
                >
                  <Ic.whatsapp className="w-4 h-4 fill-current shrink-0" />
                  <span>Chat About This Cake on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

