import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  PRODUCTS,
  BLOG_POSTS,
  SEED_PARTNERS,
  SEED_API_KEYS,
  type Product,
  type VendorPartner,
  type AndroidApiKey,
  type Order,
} from "./src/data/catalog.ts";
import {
  DELHI_NCR_CITIES,
  getSeoAreaBySlug,
  isProgrammaticSeoSlug,
  SEO_INTENTS,
} from "./src/data/seoLocations.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

let cachedCookie = "";
let cachedCsrf = "";
let cookieTimestamp = 0;

interface LivePinItem {
  id: string;
  title: string;
  img: string;
  priceInr: number;
  startingWeight: string;
  badge: string;
  pinUrl?: string;
}

const searchCache = new Map<string, { timestamp: number; pins: LivePinItem[] }>();

const TYPO_CORRECTIONS: Record<string, string> = {
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
  ferrero: "ferrero rocher",
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

function normalizeTypos(input: string): string {
  return input
    .toLowerCase()
    .split(/(\s+)/)
    .map((part) => {
      const clean = part.replace(/[^a-z0-9]/g, "");
      if (TYPO_CORRECTIONS[clean]) {
        return TYPO_CORRECTIONS[clean];
      }
      return part;
    })
    .join("");
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function ensurePinterestSession(forceRefresh = false): Promise<{ cookieStr: string; csrf: string }> {
  const now = Date.now();
  if (!forceRefresh && cachedCsrf && cachedCookie && now - cookieTimestamp < 1000 * 60 * 30) {
    return { cookieStr: cachedCookie, csrf: cachedCsrf };
  }

  const initRes = await fetchWithTimeout(
    "https://www.pinterest.com/",
    { headers: { "User-Agent": USER_AGENT } },
    4000
  );

  const rawCookies =
    typeof initRes.headers.getSetCookie === "function"
      ? initRes.headers.getSetCookie()
      : [initRes.headers.get("set-cookie") || ""];

  const cookieStr = rawCookies
    .map((c) => c.split(";")[0])
    .filter(Boolean)
    .join("; ");
  const csrfMatch = cookieStr.match(/csrftoken=([^;]+)/);
  const csrf = csrfMatch ? csrfMatch[1] : "";

  if (csrf) {
    cachedCookie = cookieStr;
    cachedCsrf = csrf;
    cookieTimestamp = now;
  }

  return { cookieStr, csrf };
}

function cleanPinTitle(rawTitle: string, fallbackQuery: string): string {
  const cleaned = rawTitle
    .replace(/#[^\s#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned || cleaned.length < 3 || /^[@0-9_\-.+⊹𖥔˖\s]+$/.test(cleaned)) {
    const capitalized = fallbackQuery
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\s+Cake(\s+Design)?$/i, "");
    return `Custom ${capitalized} Cake`;
  }
  return cleaned.length > 68 ? `${cleaned.slice(0, 65).trim()}...` : cleaned;
}

async function searchPinterestCakes(rawQuery: string): Promise<LivePinItem[]> {
  const normalized = normalizeTypos(rawQuery.trim());
  if (!normalized) return [];

  const cached = searchCache.get(normalized);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 20) {
    return cached.pins;
  }

  const baseClean =
    normalized
      .replace(/\b(custom\s+)?cake(s)?(\s+design(s)?)?(\s+ideas?)?\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() || normalized;

  // High-precision bakery cake queries so fruit/flavor queries return round frosted celebration cakes
  const searchQueries = [
    `${baseClean} cake design`,
    `${baseClean} birthday cake`,
    `${baseClean} custom cake`,
  ];

  let session = await ensurePinterestSession(false);

  const fetchFromPinterest = async (qStr: string, cookieStr: string, csrf: string) => {
    const sourceUrl = `/search/pins/?q=${encodeURIComponent(qStr)}&rs=typed`;
    const dataObj = {
      options: {
        query: qStr,
        scope: "pins",
        applied_unified_filters: null,
        auto_correction_disabled: false,
        redux_normalize_feed: true,
        rs: "typed",
      },
      context: {},
    };

    const apiUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=${encodeURIComponent(
      sourceUrl
    )}&data=${encodeURIComponent(JSON.stringify(dataObj))}`;

    return fetchWithTimeout(
      apiUrl,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json, text/javascript, */*, q=0.01",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRFToken": csrf,
          "X-Pinterest-AppState": "active",
          "X-Pinterest-Source-Url": sourceUrl,
          "X-Pinterest-PWS-Handler": "www/search/[scope].js",
          Referer: `https://www.pinterest.com${sourceUrl}`,
          Cookie: cookieStr,
        },
      },
      4500
    );
  };

  let responses = await Promise.allSettled(
    searchQueries.map((qStr) => fetchFromPinterest(qStr, session.cookieStr, session.csrf))
  );

  const firstFulfilled = responses.find((r) => r.status === "fulfilled" && r.value.ok);
  if (!firstFulfilled) {
    session = await ensurePinterestSession(true);
    responses = await Promise.allSettled(
      searchQueries.map((qStr) => fetchFromPinterest(qStr, session.cookieStr, session.csrf))
    );
  }

  const queryBatchLists: any[][] = [];
  for (const r of responses) {
    if (r.status === "fulfilled" && r.value.ok) {
      try {
        const json: any = await r.value.json();
        const items: any[] = json?.resource_response?.data?.results || [];
        queryBatchLists.push(items);
      } catch {
        // Ignore individual parse errors
      }
    }
  }

  // Interleave results across the 3 exact queries so top hits from each appear early
  const allResults: any[] = [];
  const maxLen = Math.max(0, ...queryBatchLists.map((l) => l.length));
  for (let idx = 0; idx < maxLen; idx++) {
    for (const list of queryBatchLists) {
      if (idx < list.length) {
        allResults.push(list[idx]);
      }
    }
  }

  const queryTokens = baseClean
    .toLowerCase()
    .split(/[\s,/-]+/)
    .filter((t) => t.length > 1 && !["cake", "cakes", "design", "custom", "for", "with", "the", "and"].includes(t));

  const seenUrls = new Set<string>();
  const scoredCandidates: { pin: LivePinItem; relevance: number; order: number }[] = [];

  const isTieredQuery = /2\s*tier|3\s*tier|wedding|engagement|anniversary|ring/i.test(baseClean);

  for (let i = 0; i < allResults.length; i++) {
    const item = allResults[i];
    const imgUrl: string | undefined =
      item?.images?.["736x"]?.url ||
      item?.images?.["564x"]?.url ||
      item?.images?.["474x"]?.url ||
      item?.images?.orig?.url;

    if (!imgUrl || seenUrls.has(imgUrl)) continue;
    seenUrls.add(imgUrl);

    const rawTitle =
      item?.grid_title ||
      item?.title ||
      item?.seo_alt_text ||
      item?.description ||
      "";

    const fullText = [
      item?.grid_title,
      item?.title,
      item?.seo_alt_text,
      item?.description,
      item?.rich_summary?.display_name,
      item?.rich_summary?.display_description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    // Calculate relevance score so exact subject matches rank at the top
    let relevance = 10;
    if (fullText.includes(baseClean.toLowerCase())) {
      relevance += 50;
    }
    for (const tok of queryTokens) {
      if (fullText.includes(tok)) {
        relevance += 25;
      }
    }
    if (fullText.includes("cake") || fullText.includes("bento") || fullText.includes("fondant") || fullText.includes("frosting")) {
      relevance += 15;
    }

    const title = cleanPinTitle(String(rawTitle), baseClean);
    const basePrice = isTieredQuery ? 1599 + (i % 5) * 200 : 799 + (i % 6) * 100;
    const startingWeight = isTieredQuery ? "1.5 Kg" : i % 3 === 0 ? "0.5 Kg" : "1.0 Kg";

    scoredCandidates.push({
      relevance,
      order: i,
      pin: {
        id: `pin-live-${item?.id || i}-${Date.now()}`,
        title,
        img: imgUrl,
        priceInr: basePrice,
        startingWeight,
        badge: "Custom Design",
        pinUrl: item?.id ? `https://www.pinterest.com/pin/${item.id}/` : undefined,
      },
    });
  }

  scoredCandidates.sort((a, b) => {
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    return a.order - b.order;
  });

  const pins = scoredCandidates.slice(0, 44).map((c) => c.pin);

  if (pins.length > 0) {
    searchCache.set(normalized, { timestamp: Date.now(), pins });
  }

  return pins;
}

const SITEMAP_THEME_SLUGS = [
  "birthday-cake",
  "anniversary-cake",
  "butterfly-cake",
  "doraemon-cake",
  "spiderman-cake",
  "barbie-doll-cake",
  "2-tier-wedding-cake",
  "engagement-ring-cake",
  "vintage-heart-cake",
  "unicorn-cake",
  "cocomelon-cake",
  "shinchan-cake",
  "1st-birthday-cake",
  "boss-baby-cake",
  "jungle-safari-cake",
  "cricket-theme-cake",
  "frozen-elsa-cake",
  "avengers-cake",
  "car-theme-cake",
  "bento-lunchbox-cake",
  "bride-to-be-cake",
  "baby-shower-cake",
  "25th-anniversary-cake",
  "50th-anniversary-cake",
  "rasmalai-cake",
  "belgian-chocolate-cake",
  "red-velvet-heart-cake",
  "pinata-smash-cake",
  "photo-cake",
  "makeup-theme-cake",
  "peppa-pig-cake",
  "minions-cake",
  "harry-potter-cake",
  "football-theme-cake",
  "gym-fitness-cake",
  "princess-crown-cake",
  "doctor-theme-cake",
  "ca-chartered-accountant-cake",
  "mahakal-shiva-cake",
  "khatu-shyam-cake",
  "thar-suv-cake",
  "bullet-bike-cake",
  "motu-patlu-cake",
  "naruto-anime-cake",
  "bts-kpop-cake",
  "free-fire-pubg-cake",
  "haldi-mehndi-cake",
  "roka-ceremony-cake",
  "karwa-chauth-cake",
  "parents-anniversary-cake",
  "pineapple-cake",
  "butterscotch-cake",
  "black-forest-cake",
  "strawberry-cake",
  "mango-cake",
  "fresh-fruit-cake",
];

const SITEMAP_CITIES = ["faridabad", "gurgaon", "noida", "delhi", "ghaziabad"];

const SITEMAP_SECTORS = [
  "sector-15-faridabad",
  "sector-16-faridabad",
  "sector-21c-faridabad",
  "nit-faridabad",
  "greenfield-colony-faridabad",
  "greater-faridabad-neharpar",
  "dlf-phase-5-gurgaon",
  "cyber-city-gurgaon",
  "golf-course-road-gurgaon",
  "sohna-road-gurgaon",
  "sushant-lok-gurgaon",
  "sector-18-noida",
  "sector-62-noida",
  "sector-137-noida",
  "greater-noida-west",
  "greater-kailash-delhi",
  "saket-delhi",
  "hauz-khas-delhi",
  "defence-colony-delhi",
  "vasant-kunj-delhi",
  "indirapuram-ghaziabad",
  "vaishali-ghaziabad",
];

let apiState: {
  partners: VendorPartner[];
  apiKeys: AndroidApiKey[];
  products: Product[];
  orders: Order[];
} = {
  partners: [...SEED_PARTNERS],
  apiKeys: [...SEED_API_KEYS],
  products: [...PRODUCTS],
  orders: [
    {
      id: "CU-9100",
      email: "user@cakeurban.com",
      customerName: "Aarav Sharma",
      customerPhone: "+91 98765 43210",
      items: [
        {
          productId: PRODUCTS[0].id,
          name: PRODUCTS[0].name,
          img: PRODUCTS[0].img,
          color: PRODUCTS[0].colors[0].name,
          size: PRODUCTS[0].sizes[0],
          qty: 1,
          price: PRODUCTS[0].price,
        },
      ],
      subtotal: PRODUCTS[0].price,
      discount: 0,
      shipping: 0,
      total: PRODUCTS[0].price,
      status: "processing",
      date: new Date().toISOString(),
      address: "House #12, Sector 15, Faridabad, HR 121007",
      method: "⚡ Express 30-45 Min Dispatch",
      deliverySlot: "⚡ Express 30-45 Min Dispatch",
      plaqueMessage: "Happy Birthday! 🎉",
      payment: "Razorpay UPI",
      timeline: [{ status: "pending", at: new Date().toISOString() }],
      assignedPartnerId: "CUP-1001",
      assignedPartnerName: "Royal Bakehouse Faridabad",
      partnerStatus: "baking",
      adminCommissionRate: 30,
      adminCommissionAmount: Number(((PRODUCTS[0].price * 30) / 100).toFixed(2)),
      partnerPayoutAmount: Number(((PRODUCTS[0].price * 70) / 100).toFixed(2)),
    },
  ],
};

function isServerPartnerExpired(p: VendorPartner): boolean {
  const exp = new Date(p.expiresAt);
  const now = new Date();
  const diffDays = Math.ceil((exp.setHours(23, 59, 59, 999) - now.getTime()) / 86400000);
  return diffDays < 0 || p.status === "expired" || p.status === "suspended";
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "5mb" }));

  // CORS headers for Android Retrofit / OkHttp clients
  app.use("/api/v1", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  // Web Store -> Backend API State Synchronization
  app.post("/api/v1/sync-state", (req, res) => {
    try {
      const { partners, apiKeys, products, orders } = req.body || {};
      if (Array.isArray(partners) && partners.length > 0) apiState.partners = partners;
      if (Array.isArray(apiKeys) && apiKeys.length > 0) apiState.apiKeys = apiKeys;
      if (Array.isArray(products) && products.length > 0) apiState.products = products;
      if (Array.isArray(orders) && orders.length > 0) apiState.orders = orders;
      res.json({ ok: true, syncedAt: new Date().toISOString() });
    } catch {
      res.status(200).json({ ok: false });
    }
  });

  // 1. Android API Health & Gateway Status
  app.get("/api/v1/health", (_req, res) => {
    res.json({
      status: "online",
      service: "CakeUrban Android REST API Gateway",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      stats: {
        liveApprovedProducts: apiState.products.filter(
          (p) => !p.approvalStatus || p.approvalStatus === "approved"
        ).length,
        pendingPartnerApprovals: apiState.products.filter((p) => p.approvalStatus === "pending")
          .length,
        totalPartners: apiState.partners.length,
        activePartners: apiState.partners.filter((p) => !isServerPartnerExpired(p)).length,
        totalOrders: apiState.orders.length,
      },
    });
  });

  // 2. Android Catalog Endpoint (Approved Storefront Items or Partner Filtered)
  app.get("/api/v1/products", (req, res) => {
    const category = String(req.query.category || "").trim().toLowerCase();
    const partnerId = String(req.query.partnerId || "").trim().toUpperCase();
    const includePending = req.query.includePending === "true";

    let list = apiState.products;
    if (!includePending && !partnerId) {
      list = list.filter((p) => !p.approvalStatus || p.approvalStatus === "approved");
    }
    if (category) {
      list = list.filter((p) => p.category.toLowerCase() === category);
    }
    if (partnerId) {
      list = list.filter((p) => (p.partnerId || "").toUpperCase() === partnerId);
    }
    res.json({
      ok: true,
      count: list.length,
      currencyBase: "USD",
      inrRate: 83.4,
      products: list,
    });
  });

  // 3. Partners Directory & Expiry Status
  app.get("/api/v1/partners", (_req, res) => {
    const enriched = apiState.partners.map((p) => {
      const expired = isServerPartnerExpired(p);
      return {
        ...p,
        isLocked: expired,
        effectiveStatus: expired ? "expired" : "active",
      };
    });
    res.json({ ok: true, count: enriched.length, partners: enriched });
  });

  // 4. Partner Store Specific Dashboard (For Partner Android App)
  app.get("/api/v1/partner/:partnerId/dashboard", (req, res) => {
    const partnerId = String(req.params.partnerId || "").toUpperCase();
    const partner = apiState.partners.find((p) => p.id.toUpperCase() === partnerId);
    if (!partner) {
      res.status(404).json({ ok: false, error: "PARTNER_NOT_FOUND" });
      return;
    }
    const isLocked = isServerPartnerExpired(partner);
    const storeProducts = apiState.products.filter(
      (p) => (p.partnerId || "").toUpperCase() === partnerId
    );
    const storeOrders = apiState.orders.filter(
      (o) => (o.assignedPartnerId || "").toUpperCase() === partnerId
    );
    const grossGmv = storeOrders.reduce((s, o) => s + o.total, 0);
    const adminCommission = storeOrders.reduce(
      (s, o) =>
        s + (o.adminCommissionAmount ?? (o.total * (partner.commissionRate || 30)) / 100),
      0
    );
    const netPartnerPayout = Math.max(0, grossGmv - adminCommission);

    res.json({
      ok: true,
      partner: {
        ...partner,
        isLocked,
        lockMessage: isLocked
          ? "Partner ID has expired. New orders and product uploads/edits are locked until Super Admin renews your Partner ID."
          : null,
      },
      financials: {
        commissionRatePct: partner.commissionRate || 30,
        partnerSharePct: 100 - (partner.commissionRate || 30),
        grossGmv: Number(grossGmv.toFixed(2)),
        adminCommission: Number(adminCommission.toFixed(2)),
        netPartnerPayout: Number(netPartnerPayout.toFixed(2)),
      },
      productsCount: storeProducts.length,
      products: storeProducts,
      ordersCount: storeOrders.length,
      orders: storeOrders,
    });
  });

  // 5. Partner Upload New Product via Android App (Enforces Expiry Lock & Pending Admin Approval)
  app.post("/api/v1/partner/:partnerId/products", (req, res) => {
    const partnerId = String(req.params.partnerId || "").toUpperCase();
    const partner = apiState.partners.find((p) => p.id.toUpperCase() === partnerId);
    if (!partner) {
      res.status(404).json({ ok: false, error: "PARTNER_NOT_FOUND" });
      return;
    }
    if (isServerPartnerExpired(partner)) {
      res.status(403).json({
        ok: false,
        error: "PARTNER_ID_EXPIRED",
        message: `Partner ID ${partner.id} expired on ${partner.expiresAt}. Renew with Super Admin to upload products.`,
      });
      return;
    }

    const body = req.body || {};
    const newProd: Product = {
      id: body.id || `partner-${partner.id.toLowerCase()}-${Date.now()}`,
      name: String(body.name || "Partner Artisan Cake"),
      brand: partner.shopName,
      category: String(body.category || "Cakes"),
      price: Number(body.price) || 9.5,
      compareAt: body.compareAt ? Number(body.compareAt) : undefined,
      img:
        body.img ||
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
      tag: "PARTNER FRESH",
      rating: 4.9,
      ratingCount: 1,
      stock: Number(body.stock) ?? 15,
      sku: `${partner.id}-${Date.now().toString().slice(-4)}`,
      colors: [{ name: "Signature", hex: "#e07a5f" }],
      sizes: Array.isArray(body.sizes) ? body.sizes : ["0.5 KG", "1 KG", "2 KG"],
      desc: String(
        body.desc || `100% Pure Eggless bake crafted at ${partner.shopName} (${partner.cityHub}).`
      ),
      specs: [
        ["Dietary", "100% Pure Eggless Veg"],
        ["Partner Store", `${partner.shopName} (${partner.id})`],
      ],
      partnerId: partner.id,
      partnerShopName: partner.shopName,
      approvalStatus: "pending",
      submittedAt: new Date().toISOString(),
    };

    apiState.products.unshift(newProd);
    res.status(201).json({
      ok: true,
      message: "Product uploaded and queued for Super Admin approval.",
      product: newProd,
    });
  });

  // 6. Partner Edit Existing Product via Android App (Enforces Expiry Lock & Re-queues Approval)
  app.put("/api/v1/partner/:partnerId/products/:productId", (req, res) => {
    const partnerId = String(req.params.partnerId || "").toUpperCase();
    const productId = String(req.params.productId || "");
    const partner = apiState.partners.find((p) => p.id.toUpperCase() === partnerId);
    if (!partner) {
      res.status(404).json({ ok: false, error: "PARTNER_NOT_FOUND" });
      return;
    }
    if (isServerPartnerExpired(partner)) {
      res.status(403).json({
        ok: false,
        error: "PARTNER_ID_EXPIRED",
        message: `Partner ID ${partner.id} expired on ${partner.expiresAt}. Product edits are locked until renewed.`,
      });
      return;
    }

    const idx = apiState.products.findIndex((p) => p.id === productId);
    if (idx < 0) {
      res.status(404).json({ ok: false, error: "PRODUCT_NOT_FOUND" });
      return;
    }

    const updated: Product = {
      ...apiState.products[idx],
      ...req.body,
      id: productId,
      partnerId: partner.id,
      partnerShopName: partner.shopName,
      approvalStatus: "pending",
      submittedAt: new Date().toISOString(),
    };
    apiState.products[idx] = updated;
    res.json({
      ok: true,
      message: "Product updated and queued for Super Admin approval.",
      product: updated,
    });
  });

  // 7. Orders Feed & Creation for Android Apps
  app.get("/api/v1/orders", (req, res) => {
    const partnerId = String(req.query.partnerId || "").trim().toUpperCase();
    const email = String(req.query.email || "").trim().toLowerCase();
    let list = apiState.orders;
    if (partnerId) {
      list = list.filter((o) => (o.assignedPartnerId || "").toUpperCase() === partnerId);
    }
    if (email) {
      list = list.filter((o) => o.email.toLowerCase() === email);
    }
    res.json({ ok: true, count: list.length, orders: list });
  });

  app.patch("/api/v1/orders/:orderId/status", (req, res) => {
    const orderId = String(req.params.orderId || "");
    const { partnerStatus, status } = req.body || {};
    const idx = apiState.orders.findIndex((o) => o.id === orderId);
    if (idx < 0) {
      res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });
      return;
    }
    const existing = apiState.orders[idx];
    if (existing.assignedPartnerId) {
      const p = apiState.partners.find((x) => x.id === existing.assignedPartnerId);
      if (p && isServerPartnerExpired(p)) {
        res.status(403).json({
          ok: false,
          error: "PARTNER_ID_EXPIRED",
          message: "Partner ID is expired. Renew with Super Admin to update orders.",
        });
        return;
      }
    }
    const updated: Order = {
      ...existing,
      ...(partnerStatus ? { partnerStatus } : {}),
      ...(status ? { status } : {}),
    };
    apiState.orders[idx] = updated;
    res.json({ ok: true, order: updated });
  });

  // 8. Admin 30% Commission Financial Ledger Summary
  app.get("/api/v1/commission-summary", (_req, res) => {
    const partnerOrders = apiState.orders.filter((o) => Boolean(o.assignedPartnerId));
    const totalPartnerGmv = partnerOrders.reduce((s, o) => s + o.total, 0);
    const totalAdminCommission30Pct = partnerOrders.reduce(
      (s, o) => s + (o.adminCommissionAmount ?? (o.total * (o.adminCommissionRate || 30)) / 100),
      0
    );
    const totalPartnerPayout70Pct = Math.max(0, totalPartnerGmv - totalAdminCommission30Pct);

    res.json({
      ok: true,
      commissionModel: "30% CakeUrban Platform Commission / 70% Partner Store Payout",
      routedOrdersCount: partnerOrders.length,
      totalPartnerGmv: Number(totalPartnerGmv.toFixed(2)),
      totalAdminCommissionEarned: Number(totalAdminCommission30Pct.toFixed(2)),
      totalPartnerNetPayout: Number(totalPartnerPayout70Pct.toFixed(2)),
      partnerBreakdown: apiState.partners.map((p) => {
        const pOrders = partnerOrders.filter((o) => o.assignedPartnerId === p.id);
        const gmv = pOrders.reduce((s, o) => s + o.total, 0);
        const adminCut = pOrders.reduce(
          (s, o) => s + (o.adminCommissionAmount ?? (o.total * (p.commissionRate || 30)) / 100),
          0
        );
        return {
          partnerId: p.id,
          shopName: p.shopName,
          email: p.email,
          expiresAt: p.expiresAt,
          isLocked: isServerPartnerExpired(p),
          ordersCount: pOrders.length,
          grossSales: Number(gmv.toFixed(2)),
          admin30PctCommission: Number(adminCut.toFixed(2)),
          partner70PctPayout: Number(Math.max(0, gmv - adminCut).toFixed(2)),
        };
      }),
    });
  });

  // Autonomous SEO & GEO Auto-Indexer: receives new customer cake search themes and adds them to Sitemap & GEO Feed
  app.post("/api/seo-auto-index", (req, res) => {
    try {
      const rawSlug = String(req.body?.slug || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/(^-|-$)/g, "");
      if (rawSlug && rawSlug.length >= 4 && rawSlug.length <= 65) {
        const finalSlug = rawSlug.endsWith("-cake") ? rawSlug : `${rawSlug}-cake`;
        if (!SITEMAP_THEME_SLUGS.includes(finalSlug) && SITEMAP_THEME_SLUGS.length < 250) {
          SITEMAP_THEME_SLUGS.push(finalSlug);
        }
      }
      res.status(200).json({ ok: true, totalIndexedThemes: SITEMAP_THEME_SLUGS.length });
    } catch {
      res.status(200).json({ ok: false });
    }
  });

  app.get("/api/seo-auto-index", (_req, res) => {
    res.json({ totalIndexedThemes: SITEMAP_THEME_SLUGS.length, slugs: SITEMAP_THEME_SLUGS });
  });

  app.get("/api/pinterest-search", async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) {
      res.json({ pins: [] });
      return;
    }

    // Also auto-index valid customer searches directly on the server
    const autoSlug = normalizeTypos(q)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    if (autoSlug.length >= 3 && autoSlug.length <= 50) {
      const slugWithCake = autoSlug.endsWith("-cake") ? autoSlug : `${autoSlug}-cake`;
      if (!SITEMAP_THEME_SLUGS.includes(slugWithCake) && SITEMAP_THEME_SLUGS.length < 250) {
        SITEMAP_THEME_SLUGS.push(slugWithCake);
      }
    }

    try {
      const pins = await searchPinterestCakes(q);
      res.json({ query: q, count: pins.length, pins });
    } catch (err: any) {
      console.error("Pinterest search error:", err?.message || err);
      res.status(200).json({ query: q, count: 0, pins: [], error: "fallback" });
    }
  });

  const GSC_HIGH_INTENT_SINGLE_SLUGS = [
    "sugar-free-cake-delivery-in-vasant-kunj",
    "baby-shower-cake-delivery-in-sector-45-gurgaon",
    "belgian-chocolate-birthday-cake-in-faridabad",
    "belgian-chocolate-cake-in-greenfield",
    "rasmalai-cake-delivery-in-sector-15-faridabad",
    "butterfly-cake-delivery-in-dlf-phase-5-gurgaon",
    "eggless-birthday-cake-delivery-in-sector-18-noida",
    "midnight-cake-delivery-in-greater-kailash-delhi",
    "anniversary-heart-cake-delivery-in-indirapuram-ghaziabad",
    "2-tier-wedding-cake-delivery-in-gurgaon",
    "doraemon-cartoon-cake-delivery-in-faridabad",
    "spiderman-birthday-cake-delivery-in-noida",
    "barbie-doll-cake-delivery-in-south-delhi",
    "red-velvet-cake-delivery-in-sector-21c-faridabad",
    "lotus-biscoff-cake-delivery-in-cyber-city-gurgaon",
    "fresh-fruit-cake-delivery-in-saket-delhi",
    "pinata-smash-cake-delivery-in-sector-62-noida",
    "bento-lunchbox-cake-delivery-in-hauz-khas-delhi",
    "ferrero-rocher-cake-delivery-in-golf-course-road-gurgaon",
    "pineapple-birthday-cake-delivery-in-nit-faridabad",
  ];

  const CANONICAL_SITE_URL = "https://www.cakeurban.com";

  const renderUrlSetXml = (
    urls: { loc: string; changefreq: string; priority: string }[],
    lastmodDate: string
  ) =>
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><lastmod>${lastmodDate}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("\n")}\n</urlset>`;

  const buildMainSitemapXml = (baseUrl: string, today: string) => {
    const urls: { loc: string; changefreq: string; priority: string }[] = [
      { loc: `${baseUrl}/`, changefreq: "daily", priority: "1.0" },
      { loc: `${baseUrl}/builder`, changefreq: "daily", priority: "0.99" },
      { loc: `${baseUrl}/shop`, changefreq: "daily", priority: "0.95" },
      { loc: `${baseUrl}/delivery-locations`, changefreq: "daily", priority: "0.95" },
      { loc: `${baseUrl}/track`, changefreq: "weekly", priority: "0.85" },
      { loc: `${baseUrl}/blog`, changefreq: "weekly", priority: "0.85" },
      { loc: `${baseUrl}/about`, changefreq: "monthly", priority: "0.75" },
      { loc: `${baseUrl}/contact`, changefreq: "monthly", priority: "0.80" },
    ];

    for (const p of apiState.products.filter(
      (prod) => !prod.approvalStatus || prod.approvalStatus === "approved"
    )) {
      urls.push({
        loc: `${baseUrl}/product/${p.id}`,
        changefreq: "weekly",
        priority: "0.92",
      });
    }

    for (const post of BLOG_POSTS) {
      urls.push({
        loc: `${baseUrl}/blog/${post.slug}`,
        changefreq: "monthly",
        priority: "0.84",
      });
    }

    for (const singleSlug of GSC_HIGH_INTENT_SINGLE_SLUGS) {
      urls.push({
        loc: `${baseUrl}/${singleSlug}`,
        changefreq: "daily",
        priority: "0.94",
      });
    }

    for (const slug of SITEMAP_THEME_SLUGS) {
      urls.push({
        loc: `${baseUrl}/custom-cake/${slug}`,
        changefreq: "daily",
        priority: "0.94",
      });
    }

    for (const slug of SITEMAP_THEME_SLUGS.slice(0, 25)) {
      for (const city of SITEMAP_CITIES) {
        urls.push({
          loc: `${baseUrl}/custom-cake/${slug}-in-${city}`,
          changefreq: "daily",
          priority: "0.91",
        });
      }
    }

    for (const city of SITEMAP_CITIES) {
      urls.push({ loc: `${baseUrl}/cakes-in/${city}`, changefreq: "daily", priority: "0.95" });
      urls.push({ loc: `${baseUrl}/cookies-${city}`, changefreq: "weekly", priority: "0.90" });
    }

    const intents = [
      "cake-delivery-in",
      "midnight-cake-delivery-in",
      "birthday-cake-delivery-in",
      "eggless-cake-delivery-in",
      "custom-cake-delivery-in",
      "anniversary-cake-delivery-in",
    ];
    for (const sector of SITEMAP_SECTORS) {
      for (const intent of intents) {
        urls.push({
          loc: `${baseUrl}/${intent}/${sector}`,
          changefreq: "weekly",
          priority: "0.88",
        });
      }
    }

    return renderUrlSetXml(urls, today);
  };

  const buildSubSitemapXml = (cityKey: string, baseUrl: string, today: string): string | null => {
    if (cityKey === "occasions") {
      const urls: { loc: string; changefreq: string; priority: string }[] = [];
      for (const slug of SITEMAP_THEME_SLUGS) {
        urls.push({ loc: `${baseUrl}/custom-cake/${slug}`, changefreq: "daily", priority: "0.94" });
        for (const city of SITEMAP_CITIES) {
          urls.push({
            loc: `${baseUrl}/custom-cake/${slug}-in-${city}`,
            changefreq: "weekly",
            priority: "0.90",
          });
        }
      }
      for (const singleSlug of GSC_HIGH_INTENT_SINGLE_SLUGS) {
        urls.push({ loc: `${baseUrl}/${singleSlug}`, changefreq: "daily", priority: "0.93" });
      }
      return renderUrlSetXml(urls, today);
    }

    if (cityKey === "videos") {
      const heroThumb =
        "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png";
      const videoUrl =
        "https://assets.mixkit.co/videos/preview/mixkit-confectioner-decorating-a-chocolate-cake-41444-large.mp4";
      const watchPages = [
        {
          loc: `${baseUrl}/`,
          title: "CakeUrban — How We Bake & Deliver 100% Pure Eggless Custom Theme Cakes in 30–45 Mins",
          desc: "Watch how CakeUrban freshly bakes 100% pure eggless Belgian chocolate, sugar-free, birthday, and anniversary cakes with 30-45 minute cold-chain delivery across Delhi NCR.",
        },
        ...SITEMAP_CITIES.map((c) => ({
          loc: `${baseUrl}/cakes-in/${c}`,
          title: `How CakeUrban Bakes & Delivers 100% Eggless Cakes in ${c.charAt(0).toUpperCase() + c.slice(1)}`,
          desc: `Watch live patisserie preparation and 4°C cold-box express cake delivery across ${c.charAt(0).toUpperCase() + c.slice(1)}.`,
        })),
        ...SITEMAP_SECTORS.map((s) => ({
          loc: `${baseUrl}/cake-delivery-in/${s}`,
          title: `Live Patisserie & 30-Min Cold-Chain Cake Delivery in ${s.replace(/-/g, " ")}`,
          desc: `Watch how CakeUrban bakes 100% pure eggless cakes and delivers in 30-45 minutes across ${s.replace(/-/g, " ")}.`,
        })),
        ...GSC_HIGH_INTENT_SINGLE_SLUGS.map((s) => ({
          loc: `${baseUrl}/${s}`,
          title: `${s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} — CakeUrban Live Patisserie`,
          desc: `Watch CakeUrban prepare and dispatch ${s.replace(/-/g, " ")} in 100% pure eggless with chilled doorstep delivery.`,
        })),
      ];

      return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${watchPages
        .map(
          (v) => `  <url>
    <loc>${v.loc}</loc>
    <video:video>
      <video:thumbnail_loc>${heroThumb}</video:thumbnail_loc>
      <video:title>${v.title.replace(/&/g, "&amp;")}</video:title>
      <video:description>${v.desc.replace(/&/g, "&amp;")}</video:description>
      <video:content_loc>${videoUrl}</video:content_loc>
      <video:duration>45</video:duration>
      <video:publication_date>2026-01-15T08:00:00+05:30</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>
  </url>`
        )
        .join("\n")}\n</urlset>`;
    }

    const cityData = DELHI_NCR_CITIES[cityKey];
    if (!cityData) return null;

    const cityUrls: { loc: string; changefreq: string; priority: string }[] = [
      { loc: `${baseUrl}/cakes-in/${cityKey}`, changefreq: "daily", priority: "0.96" },
      { loc: `${baseUrl}/cookies-${cityKey}`, changefreq: "weekly", priority: "0.92" },
    ];
    for (const area of cityData.areas) {
      for (const cfg of Object.values(SEO_INTENTS)) {
        cityUrls.push({
          loc: `${baseUrl}/${cfg.prefix}/${area.slug}`,
          changefreq: "weekly",
          priority: "0.89",
        });
      }
      cityUrls.push({
        loc: `${baseUrl}/belgian-chocolate-cake-in-${area.slug}`,
        changefreq: "weekly",
        priority: "0.88",
      });
      cityUrls.push({
        loc: `${baseUrl}/sugar-free-cake-delivery-in-${area.slug}`,
        changefreq: "weekly",
        priority: "0.88",
      });
    }

    return renderUrlSetXml(cityUrls, today);
  };

  // Write physical XML sitemaps to /public (and /dist if built) so static CDNs (Vercel/Cloudflare) serve 100% valid XML
  const syncStaticSitemapsToDisk = () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const mainXml = buildMainSitemapXml(CANONICAL_SITE_URL, today);
      const filesMap: Record<string, string> = {
        "sitemap.xml": mainXml,
        "sitemap-main.xml": mainXml,
      };
      for (const subKey of ["faridabad", "gurgaon", "noida", "delhi", "ghaziabad", "occasions", "videos"]) {
        const subXml = buildSubSitemapXml(subKey, CANONICAL_SITE_URL, today);
        if (subXml) {
          filesMap[`sitemap-${subKey}.xml`] = subXml;
        }
      }

      const publicDir = path.resolve(__dirname, "public");
      const distDir = path.resolve(__dirname, "dist");
      for (const [filename, xmlContent] of Object.entries(filesMap)) {
        if (fs.existsSync(publicDir)) {
          fs.writeFileSync(path.join(publicDir, filename), xmlContent, "utf-8");
        }
        if (fs.existsSync(distDir)) {
          fs.writeFileSync(path.join(distDir, filename), xmlContent, "utf-8");
        }
      }
    } catch (e) {
      console.error("Failed to sync static sitemaps:", e);
    }
  };

  syncStaticSitemapsToDisk();

  // Master XML Sitemap (500+ High-Intent SEO, Product, Single-Segment GSC & Programmatic Theme × City URLs)
  app.get(["/sitemap.xml", "/sitemap-main.xml"], (_req, res) => {
    const today = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(buildMainSitemapXml(CANONICAL_SITE_URL, today));
  });

  // City-Specific Sub-Sitemaps referenced in robots.txt
  app.get("/sitemap-:cityKey.xml", (req, res, next) => {
    const cityKey = String(req.params.cityKey || "").toLowerCase();
    const today = new Date().toISOString().split("T")[0];
    const xml = buildSubSitemapXml(cityKey, CANONICAL_SITE_URL, today);
    if (!xml) {
      next();
      return;
    }
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  });

  // Machine-Readable GEO Knowledge Feed for AI Search Crawlers (ChatGPT, Perplexity, Gemini, SGE)
  app.get("/api/geo-feed", (_req, res) => {
    res.json({
      brand: "CakeUrban",
      dietary: "100% Pure Vegetarian & Eggless",
      whatsappHotline: "+91 7318531953",
      expressSlaMinutes: "30-45",
      midnightDeliveryWindow: "11:30 PM - 12:15 AM",
      citiesServed: ["Faridabad", "Gurgaon", "Noida", "Delhi", "Ghaziabad"],
      supportedCustomCakeThemes: SITEMAP_THEME_SLUGS,
      customCakeSearchUrl: "/builder",
    });
  });

  // Server-Side Dynamic Canonical & Meta Tag Resolver (Prevents Duplicate Canonical & Crawled-Not-Indexed in GSC)
  const resolveServerSeoForPath = (rawPath: string, origin: string) => {
    const pathname = rawPath.split("?")[0].replace(/\/+$/, "") || "/";
    const canonicalUrl = pathname === "/" ? `${origin}/` : `${origin}${pathname}`;
    let title =
      "CakeUrban — #1 Custom Theme Cakes (Birthday, Anniversary, Cartoon, Wedding), 100% Eggless Bakery, Cookies & Gift Hampers";
    let description =
      "Search & order any Custom Theme Cake (Birthday, Anniversary, Butterfly, Doraemon, Spiderman, Barbie, 2-Tier Wedding), 100% pure eggless cakes, gourmet cookies & luxury gift hampers across Faridabad, Gurgaon, Noida, Delhi & Ghaziabad. WhatsApp: +91 7318531953.";

    if (pathname.startsWith("/product/")) {
      const prodId = pathname.replace("/product/", "");
      const prod = apiState.products.find((p) => p.id === prodId);
      if (prod) {
        title = prod.seoTitle || `${prod.name} — 30-Min Express Delivery in Delhi NCR | CakeUrban`;
        description =
          prod.seoDesc ||
          `Order ${prod.name} online at CakeUrban. ${prod.desc} 100% Pure Eggless, freshly baked to order with 30-45 mins express & 12 AM midnight delivery.`;
      }
    } else if (pathname.startsWith("/cakes-in/")) {
      const citySlug = pathname.replace("/cakes-in/", "").toLowerCase();
      const city = DELHI_NCR_CITIES[citySlug];
      if (city) {
        title = city.title;
        description = city.metaDesc;
      }
    } else if (
      Object.values(SEO_INTENTS).some((cfg) => pathname.startsWith(`/${cfg.prefix}/`))
    ) {
      let matchedIntent = "standard";
      let areaSlug = "";
      for (const [key, cfg] of Object.entries(SEO_INTENTS)) {
        if (pathname.startsWith(`/${cfg.prefix}/`)) {
          matchedIntent = key;
          areaSlug = pathname.replace(`/${cfg.prefix}/`, "");
          break;
        }
      }
      const area = getSeoAreaBySlug(areaSlug, matchedIntent);
      if (area) {
        title = area.title;
        description = area.metaDesc;
      }
    } else if (pathname.startsWith("/cookies-") || pathname.startsWith("/cookies/")) {
      const cityKey = pathname.replace(/^\/cookies[-/]/, "").toLowerCase();
      const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
      title = `Best Gourmet Cookies, Namkeens & Luxury Gift Hampers in ${cityName} | 35-Min Delivery | CakeUrban`;
      description = `Order 72-hour cold-fermented choc-chip cookies, French macarons, roasted makhana & luxury corporate/birthday gift hampers in ${cityName} with 35-min express & midnight delivery.`;
    } else if (pathname === "/builder" || pathname.startsWith("/custom-cake/")) {
      const slugPart = pathname.startsWith("/custom-cake/")
        ? pathname.replace("/custom-cake/", "").trim()
        : "";
      if (slugPart) {
        const readable = slugPart
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        title = `Custom ${readable} (100% Eggless) — 30-45 Min & Midnight Delivery | CakeUrban`;
        description = `Browse 40+ trending custom ${readable} designs at CakeUrban! 100% pure eggless, freshly baked to order with same-day & 12 AM midnight delivery across Faridabad, Gurgaon, Noida & Delhi NCR.`;
      } else {
        title =
          "Custom Theme Cake Search Studio — Birthday, Anniversary, Cartoon, Butterfly & Wedding Cakes | CakeUrban";
        description =
          "Search 1000+ custom cake designs for any theme (Birthday, Anniversary, Butterfly, Doraemon, Spiderman, Barbie Doll, 2-Tier Wedding) & order 100% pure eggless on WhatsApp (+91 7318531953).";
      }
    } else if (pathname === "/shop") {
      title = "Shop Gourmet Cookies, Eggless Cakes, Namkeens & Luxury Gift Hampers | CakeUrban Delhi NCR";
      description =
        "Browse CakeUrban's complete menu of 100% eggless Belgian chocolate cakes, molten choc-chip cookies, royal Bikaneri namkeens, and luxury gift hampers. 30-45 mins express delivery.";
    } else if (pathname === "/delivery-locations") {
      title = "Express Cake & Gift Hamper Delivery Locations Across Delhi NCR (100+ Sectors) | CakeUrban";
      description =
        "View all 5 CakeUrban kitchen hubs and 100+ express delivery sectors across Faridabad, Gurgaon, Noida, South Delhi, and Ghaziabad with 30-45 min SLA.";
    } else if (pathname.startsWith("/blog")) {
      const slug = pathname.replace("/blog/", "").replace("/blog", "");
      const post = BLOG_POSTS.find((p) => p.slug === slug);
      if (post) {
        title = `${post.title} | CakeUrban Journal`;
        description = post.excerpt;
      } else {
        title = "The CakeUrban Journal — Artisan Baking & Delhi NCR Celebration Guides";
      }
    } else if (pathname === "/about") {
      title = "About CakeUrban — 100% Pure Eggless Artisan Bakehouse in Delhi NCR";
    } else if (pathname === "/contact") {
      title = "Contact CakeUrban — 24×7 Express & Midnight Delivery Hotline (+91 7318531953)";
    } else if (isProgrammaticSeoSlug(pathname)) {
      const area = getSeoAreaBySlug(pathname, "standard");
      if (area) {
        title = area.title;
        description = area.metaDesc;
      }
    }

    return { title, description, canonicalUrl };
  };

  const injectSeoIntoHtml = (rawHtml: string, reqPath: string, origin: string): string => {
    const { title, description, canonicalUrl } = resolveServerSeoForPath(reqPath, origin);
    const safeTitle = title.replace(/"/g, "&quot;");
    const safeDesc = description.replace(/"/g, "&quot;");

    return rawHtml
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${safeDesc}" />`
      )
      .replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${safeTitle}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${safeDesc}" />`
      )
      .replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${safeTitle}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${safeDesc}" />`
      );
  };

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    const indexHtmlPath = path.join(distPath, "index.html");
    const cachedTemplate = fs.existsSync(indexHtmlPath)
      ? fs.readFileSync(indexHtmlPath, "utf-8")
      : "";

    app.use(express.static(distPath, { index: false }));
    app.use((req, res) => {
      if (cachedTemplate) {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.send(injectSeoIntoHtml(cachedTemplate, req.path, CANONICAL_SITE_URL));
      } else {
        res.sendFile(indexHtmlPath);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    // Pre-warm Pinterest session token in background
    ensurePinterestSession().catch(() => {});
  });
}

startServer();

