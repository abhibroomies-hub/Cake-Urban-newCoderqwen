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

  const baseClean = rawQuery.trim().replace(/\bcake(s)?(\s+design(s)?)?\b/gi, "").trim() || rawQuery.trim();
  const searchQueries = [
    `${baseClean} cake design`,
    `${baseClean} custom birthday cake aesthetic ideas`,
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

  const allResults: any[] = [];
  for (const r of responses) {
    if (r.status === "fulfilled" && r.value.ok) {
      try {
        const json: any = await r.value.json();
        const items: any[] = json?.resource_response?.data?.results || [];
        allResults.push(...items);
      } catch {
        // Ignore individual parse errors
      }
    }
  }

  const seenUrls = new Set<string>();
  const pins: LivePinItem[] = [];

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

    const title = cleanPinTitle(String(rawTitle), baseClean);
    const basePrice = isTieredQuery ? 1599 + (i % 5) * 200 : 799 + (i % 6) * 100;
    const startingWeight = isTieredQuery ? "1.5 Kg" : i % 3 === 0 ? "0.5 Kg" : "1.0 Kg";

    pins.push({
      id: `pin-live-${item?.id || i}-${Date.now()}`,
      title,
      img: imgUrl,
      priceInr: basePrice,
      startingWeight,
      badge: "Custom Design",
      pinUrl: item?.id ? `https://www.pinterest.com/pin/${item.id}/` : undefined,
    });

    if (pins.length >= 40) break;
  }

  if (pins.length > 0) {
    searchCache.set(normalized, { timestamp: Date.now(), pins });
  }

  return pins;
}

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
