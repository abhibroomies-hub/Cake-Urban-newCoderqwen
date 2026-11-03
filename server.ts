import express from "express";
import path from "path";
import { fileURLToPath } from "url";

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

async function ensurePinterestSession(forceRefresh = false): Promise<{ cookieStr: string; csrf: string }> {
  const now = Date.now();
  if (!forceRefresh && cachedCsrf && cachedCookie && now - cookieTimestamp < 1000 * 60 * 30) {
    return { cookieStr: cachedCookie, csrf: cachedCsrf };
  }

  const initRes = await fetch("https://www.pinterest.com/", {
    headers: { "User-Agent": USER_AGENT },
  });

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
  const normalized = rawQuery.trim().toLowerCase();
  if (!normalized) return [];

  const cached = searchCache.get(normalized);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 20) {
    return cached.pins;
  }

  const baseClean =
    rawQuery
      .trim()
      .replace(/\b(custom\s+)?cake(s)?(\s+design(s)?)?(\s+ideas?)?\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() || rawQuery.trim();

  // High-precision Pinterest cake queries without unrelated filler words
  const searchQueries = [
    `${baseClean} cake`,
    `${baseClean} cake design`,
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

    return fetch(apiUrl, {
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
    });
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

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.get("/api/pinterest-search", async (req, res) => {
    const q = String(req.query.q || "").trim();
    if (!q) {
      res.json({ pins: [] });
      return;
    }

    try {
      const pins = await searchPinterestCakes(q);
      res.json({ query: q, count: pins.length, pins });
    } catch (err: any) {
      console.error("Pinterest search error:", err?.message || err);
      res.status(200).json({ query: q, count: 0, pins: [], error: "fallback" });
    }
  });

  // Dynamic Auto-Expanding XML Sitemap (300+ High-Intent SEO & Programmatic Theme × City URLs)
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = process.env.APP_URL || `https://${req.get("host") || "www.cakeurban.com"}`;
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

    // 50+ Custom Theme Cake Landing Pages
    for (const slug of SITEMAP_THEME_SLUGS) {
      urls.push({
        loc: `${baseUrl}/custom-cake/${slug}`,
        changefreq: "daily",
        priority: "0.94",
      });
    }

    // Programmatic Theme × City Combinations (Top 25 Themes × 5 Cities = 125 Hyperlocal Theme Pages)
    for (const slug of SITEMAP_THEME_SLUGS.slice(0, 25)) {
      for (const city of SITEMAP_CITIES) {
        urls.push({
          loc: `${baseUrl}/custom-cake/${slug}-in-${city}`,
          changefreq: "daily",
          priority: "0.91",
        });
      }
    }

    // City Hubs & Cookie Hubs
    for (const city of SITEMAP_CITIES) {
      urls.push({ loc: `${baseUrl}/cakes-in/${city}`, changefreq: "daily", priority: "0.95" });
      urls.push({ loc: `${baseUrl}/cookies-${city}`, changefreq: "weekly", priority: "0.90" });
    }

    // Hyperlocal Sector Intent Pages
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

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map(
        (u) =>
          `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
      )
      .join("\n")}\n</urlset>`;

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

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.use((_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    // Pre-warm Pinterest session token in background
    ensurePinterestSession().catch(() => {});
  });
}

startServer();
