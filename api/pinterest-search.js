const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

let cachedCookie = "";
let cachedCsrf = "";
let cookieTimestamp = 0;

const searchCache = new Map();

const TYPO_CORRECTIONS = {
  pneapple: "pineapple",
  pinapple: "pineapple",
  pineaple: "pineapple",
  pinaple: "pineapple",
  pinaaple: "pineapple",
  painapple: "pineapple",
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
  rasmलाई: "rasmalai",
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

function normalizeTypos(input) {
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

async function fetchWithTimeout(url, options = {}, timeoutMs = 4500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function ensurePinterestSession(forceRefresh = false) {
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

function cleanPinTitle(rawTitle, fallbackQuery) {
  const cleaned = String(rawTitle || "")
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

async function searchPinterestCakes(rawQuery) {
  const correctedQuery = normalizeTypos(rawQuery.trim());
  if (!correctedQuery) return [];

  const cached = searchCache.get(correctedQuery);
  if (cached && Date.now() - cached.timestamp < 1000 * 60 * 20) {
    return cached.pins;
  }

  const baseClean =
    correctedQuery
      .replace(/\b(custom\s+)?cake(s)?(\s+design(s)?)?(\s+ideas?)?\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() || correctedQuery;

  const searchQueries = [
    `${baseClean} cake design`,
    `${baseClean} birthday cake`,
    `${baseClean} custom cake`,
  ];

  let session = await ensurePinterestSession(false);

  const fetchFromPinterest = async (qStr, cookieStr, csrf) => {
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

  const queryBatchLists = [];
  for (const r of responses) {
    if (r.status === "fulfilled" && r.value.ok) {
      try {
        const json = await r.value.json();
        const items = json?.resource_response?.data?.results || [];
        queryBatchLists.push(items);
      } catch {
        // Ignore parse error
      }
    }
  }

  const allResults = [];
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

  const seenUrls = new Set();
  const scoredCandidates = [];
  const isTieredQuery = /2\s*tier|3\s*tier|wedding|engagement|anniversary|ring/i.test(baseClean);

  for (let i = 0; i < allResults.length; i++) {
    const item = allResults[i];
    const imgUrl =
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

    const title = cleanPinTitle(rawTitle, baseClean);
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
    searchCache.set(correctedQuery, { timestamp: Date.now(), pins });
  }
  return pins;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate=1800");

  const q = String(req.query?.q || "").trim();
  if (!q) {
    return res.status(200).json({ pins: [] });
  }

  try {
    const pins = await searchPinterestCakes(q);
    return res.status(200).json({ query: q, correctedQuery: normalizeTypos(q), count: pins.length, pins });
  } catch (err) {
    return res.status(200).json({ query: q, count: 0, pins: [], error: "fallback" });
  }
}
