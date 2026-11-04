// Zero-dependency Sitemap Generator & Vercel Serverless Handler for CakeUrban
// Generates 10,000+ valid, crawlable Programmatic SEO Landing Page URLs per sitemap link.

const CANONICAL_SITE_URL = "https://www.cakeurban.com";

export const NCR_CITY_LOCALITIES = {
  faridabad: [
    "sector-15-faridabad",
    "sector-15a-faridabad",
    "sector-16-faridabad",
    "sector-16a-faridabad",
    "sector-14-faridabad",
    "sector-17-faridabad",
    "sector-19-faridabad",
    "sector-21-faridabad",
    "sector-21a-faridabad",
    "sector-21b-faridabad",
    "sector-21c-faridabad",
    "sector-21d-faridabad",
    "sector-28-faridabad",
    "sector-29-faridabad",
    "sector-30-faridabad",
    "sector-31-faridabad",
    "sector-37-faridabad",
    "sector-45-faridabad",
    "sector-46-faridabad",
    "sector-48-faridabad",
    "sector-55-faridabad",
    "sector-62-faridabad",
    "sector-64-faridabad",
    "sector-65-faridabad",
    "sector-75-faridabad",
    "sector-76-faridabad",
    "sector-77-faridabad",
    "sector-78-faridabad",
    "sector-79-faridabad",
    "sector-80-faridabad",
    "sector-81-faridabad",
    "sector-82-faridabad",
    "sector-83-faridabad",
    "sector-84-faridabad",
    "sector-85-faridabad",
    "sector-86-faridabad",
    "sector-87-faridabad",
    "sector-88-faridabad",
    "sector-89-faridabad",
    "nit-faridabad",
    "nit-1-faridabad",
    "nit-2-faridabad",
    "nit-3-faridabad",
    "nit-5-faridabad",
    "greenfields-faridabad",
    "greenfield-colony-faridabad",
    "charmwood-village-faridabad",
    "surajkund-faridabad",
    "ballabgarh-faridabad",
    "greater-faridabad-neharpar",
  ],
  gurgaon: [
    "dlf-phase-gurgaon",
    "dlf-phase-1-gurgaon",
    "dlf-phase-2-gurgaon",
    "dlf-phase-3-gurgaon",
    "dlf-phase-4-gurgaon",
    "dlf-phase-5-gurgaon",
    "golf-course-road-gurgaon",
    "golf-course-extension-gurgaon",
    "sohna-road-gurgaon",
    "cyber-city-gurgaon",
    "udyog-vihar-gurgaon",
    "mg-road-gurgaon",
    "sushant-lok-gurgaon",
    "sushant-lok-1-gurgaon",
    "sushant-lok-2-gurgaon",
    "sushant-lok-3-gurgaon",
    "palam-vihar-gurgaon",
    "south-city-1-gurgaon",
    "south-city-2-gurgaon",
    "nirvana-country-gurgaon",
    "ardee-city-gurgaon",
    "manesar-gurgaon",
    "dwarka-expressway-gurgaon",
    "sector-14-gurgaon",
    "sector-15-gurgaon",
    "sector-17-gurgaon",
    "sector-21-gurgaon",
    "sector-22-gurgaon",
    "sector-23-gurgaon",
    "sector-29-gurgaon",
    "sector-31-gurgaon",
    "sector-40-gurgaon",
    "sector-43-gurgaon",
    "sector-45-gurgaon",
    "sector-46-gurgaon",
    "sector-47-gurgaon",
    "sector-48-gurgaon",
    "sector-49-gurgaon",
    "sector-50-gurgaon",
    "sector-51-gurgaon",
    "sector-52-gurgaon",
    "sector-53-gurgaon",
    "sector-54-gurgaon",
    "sector-55-gurgaon",
    "sector-56-gurgaon",
    "sector-57-gurgaon",
    "sector-65-gurgaon",
    "sector-67-gurgaon",
    "sector-70-gurgaon",
    "sector-82-gurgaon",
  ],
  noida: [
    "sector-18-noida",
    "sector-15-noida",
    "sector-16-noida",
    "sector-19-noida",
    "sector-22-noida",
    "sector-25-noida",
    "sector-26-noida",
    "sector-27-noida",
    "sector-29-noida",
    "sector-34-noida",
    "sector-37-noida",
    "sector-41-noida",
    "sector-44-noida",
    "sector-45-noida",
    "sector-47-noida",
    "sector-50-noida",
    "sector-51-noida",
    "sector-52-noida",
    "sector-55-noida",
    "sector-56-noida",
    "sector-61-noida",
    "sector-62-noida",
    "sector-63-noida",
    "sector-70-noida",
    "sector-71-noida",
    "sector-72-noida",
    "sector-73-noida",
    "sector-74-noida",
    "sector-75-noida",
    "sector-76-noida",
    "sector-77-noida",
    "sector-78-noida",
    "sector-79-noida",
    "sector-93-noida",
    "sector-100-noida",
    "sector-104-noida",
    "sector-110-noida",
    "sector-120-noida",
    "sector-121-noida",
    "sector-122-noida",
    "sector-128-noida",
    "sector-135-noida",
    "sector-137-noida",
    "sector-143-noida",
    "sector-150-noida",
    "greater-noida-west",
    "gaur-city-noida",
    "pari-chowk-greater-noida",
    "alpha-1-greater-noida",
    "knowledge-park-greater-noida",
  ],
  delhi: [
    "greater-kailash-delhi",
    "greater-kailash-1-delhi",
    "greater-kailash-2-delhi",
    "saket-delhi",
    "hauz-khas-delhi",
    "vasant-kunj-delhi",
    "vasant-vihar-delhi",
    "defence-colony-delhi",
    "lajpat-nagar-delhi",
    "south-extension-delhi",
    "malviya-nagar-delhi",
    "green-park-delhi",
    "kalkaji-delhi",
    "nehru-place-delhi",
    "cr-park-delhi",
    "new-friends-colony-delhi",
    "jamia-nagar-delhi",
    "okhla-delhi",
    "connaught-place-delhi",
    "karol-bagh-delhi",
    "rajouri-garden-delhi",
    "punjabi-bagh-delhi",
    "janakpuri-delhi",
    "dwarka-sector-7-delhi",
    "dwarka-sector-10-delhi",
    "dwarka-sector-12-delhi",
    "dwarka-sector-21-delhi",
    "rohini-sector-7-delhi",
    "rohini-sector-9-delhi",
    "rohini-sector-13-delhi",
    "pitampura-delhi",
    "shalimar-bagh-delhi",
    "model-town-delhi",
    "kamla-nagar-delhi",
    "civil-lines-delhi",
    "mayur-vihar-phase-1-delhi",
    "mayur-vihar-phase-2-delhi",
    "mayur-vihar-phase-3-delhi",
    "preet-vihar-delhi",
    "laxmi-nagar-delhi",
    "shahdara-delhi",
    "patparganj-delhi",
    "paschim-vihar-delhi",
    "vikaspuri-delhi",
    "uttam-nagar-delhi",
    "tilak-nagar-delhi",
    "moti-nagar-delhi",
    "kirti-nagar-delhi",
    "naraina-delhi",
    "chanakyapuri-delhi",
  ],
  ghaziabad: [
    "indirapuram-ghaziabad",
    "vaishali-ghaziabad",
    "vasundhara-ghaziabad",
    "raj-nagar-extension-ghaziabad",
    "crossings-republik-ghaziabad",
    "kavi-nagar-ghaziabad",
    "raj-nagar-ghaziabad",
    "shastri-nagar-ghaziabad",
    "nehru-nagar-ghaziabad",
    "patel-nagar-ghaziabad",
    "lohia-nagar-ghaziabad",
    "govindpuram-ghaziabad",
    "swaran-jayanti-puram-ghaziabad",
    "sanjay-nagar-ghaziabad",
    "pratap-vihar-ghaziabad",
    "siddharth-vihar-ghaziabad",
    "vijay-nagar-ghaziabad",
    "mohan-nagar-ghaziabad",
    "sahibabad-ghaziabad",
    "shalimar-garden-ghaziabad",
    "dilshad-extension-ghaziabad",
    "rajendra-nagar-ghaziabad",
    "lajpat-nagar-ghaziabad",
    "ramprastha-ghaziabad",
    "chander-nagar-ghaziabad",
    "surya-nagar-ghaziabad",
    "brij-vihar-ghaziabad",
    "kaushambi-ghaziabad",
    "abhipuram-ghaziabad",
    "ahinsa-khand-1-indirapuram",
    "ahinsa-khand-2-indirapuram",
    "gyan-khand-1-indirapuram",
    "gyan-khand-2-indirapuram",
    "gyan-khand-3-indirapuram",
    "gyan-khand-4-indirapuram",
    "nyay-khand-1-indirapuram",
    "nyay-khand-2-indirapuram",
    "nyay-khand-3-indirapuram",
    "niti-khand-1-indirapuram",
    "niti-khand-2-indirapuram",
    "niti-khand-3-indirapuram",
    "shakti-khand-1-indirapuram",
    "shakti-khand-2-indirapuram",
    "shakti-khand-3-indirapuram",
    "shakti-khand-4-indirapuram",
    "vaishali-sector-1-ghaziabad",
    "vaishali-sector-2-ghaziabad",
    "vaishali-sector-3-ghaziabad",
    "vaishali-sector-4-ghaziabad",
    "vaishali-sector-5-ghaziabad",
  ],
};

// 205 High-Intent Cake Themes, Occasions, Flavors & Custom Designs
export const PROGRAMMATIC_CAKE_THEMES = [
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
  "sugar-free-cake",
  "lotus-biscoff-cake",
  "ferrero-rocher-cake",
  "blueberry-cheesecake",
  "nutella-hazelnut-cake",
  "tiramisu-cake",
  "chocolate-truffle-cake",
  "white-forest-cake",
  "choco-chip-cake",
  "kitkat-gems-cake",
  "oreo-chocolate-cake",
  "coffee-mocha-cake",
  "caramel-crunch-cake",
  "pistachio-rabri-cake",
  "gulab-jamun-cake",
  "kaju-katli-cake",
  "kesar-badam-cake",
  "paan-gulkand-cake",
  "motichoor-laddoo-cake",
  "3-tier-wedding-cake",
  "royal-reception-cake",
  "nikah-ceremony-cake",
  "sangeet-night-cake",
  "bachelorette-party-cake",
  "groom-to-be-cake",
  "welcome-baby-boy-cake",
  "welcome-baby-girl-cake",
  "gender-reveal-cake",
  "half-birthday-6-months-cake",
  "2nd-birthday-cake",
  "3rd-birthday-cake",
  "5th-birthday-cake",
  "10th-birthday-cake",
  "18th-birthday-cake",
  "21st-birthday-cake",
  "25th-birthday-cake",
  "30th-birthday-cake",
  "40th-birthday-cake",
  "50th-birthday-gold-cake",
  "60th-birthday-cake",
  "75th-birthday-cake",
  "1st-anniversary-cake",
  "5th-anniversary-cake",
  "10th-anniversary-cake",
  "15th-anniversary-cake",
  "20th-anniversary-cake",
  "30th-anniversary-cake",
  "40th-anniversary-cake",
  "husband-birthday-cake",
  "wife-birthday-cake",
  "boyfriend-birthday-cake",
  "girlfriend-birthday-cake",
  "mother-birthday-cake",
  "father-birthday-cake",
  "brother-birthday-cake",
  "sister-birthday-cake",
  "best-friend-birthday-cake",
  "daughter-birthday-cake",
  "son-birthday-cake",
  "boss-corporate-cake",
  "farewell-office-cake",
  "retirement-party-cake",
  "promotion-celebration-cake",
  "housewarming-griha-pravesh-cake",
  "new-car-celebration-cake",
  "graduation-convocation-cake",
  "ca-final-pass-cake",
  "neet-doctor-selection-cake",
  "iit-jee-success-cake",
  "advocate-lawyer-theme-cake",
  "police-ips-officer-cake",
  "army-soldier-theme-cake",
  "pilot-aviation-theme-cake",
  "software-engineer-coder-cake",
  "architect-engineer-cake",
  "teacher-day-special-cake",
  "mothers-day-special-cake",
  "fathers-day-special-cake",
  "valentines-day-heart-cake",
  "womens-day-special-cake",
  "christmas-plum-cake",
  "new-year-party-cake",
  "diwali-gift-hamper-cake",
  "rakhi-rakshabandhan-cake",
  "holi-colorful-cake",
  "janmashtami-matki-cake",
  "ganesh-chaturthi-cake",
  "eid-mubarak-moon-cake",
  "lohri-festival-cake",
  "chhota-bheem-cake",
  "ben-10-cartoon-cake",
  "paw-patrol-cake",
  "masha-and-bear-cake",
  "mickey-mouse-cake",
  "minnie-mouse-cake",
  "donald-duck-cake",
  "tom-and-jerry-cake",
  "pokemon-pikachu-cake",
  "sonic-hedgehog-cake",
  "super-mario-cake",
  "minecraft-block-cake",
  "roblox-gaming-cake",
  "gta-gaming-cake",
  "ps5-playstation-cake",
  "batman-dark-knight-cake",
  "superman-hero-cake",
  "iron-man-marvel-cake",
  "captain-america-cake",
  "hulk-smash-cake",
  "thor-hammer-cake",
  "black-panther-cake",
  "wonder-woman-cake",
  "cinderella-princess-cake",
  "snow-white-princess-cake",
  "rapunzel-tangled-cake",
  "little-mermaid-ariel-cake",
  "moana-island-cake",
  "hello-kitty-pink-cake",
  "kuromi-aesthetic-cake",
  "cinnamoroll-sanrio-cake",
  "teddy-bear-fondant-cake",
  "panda-bamboo-cake",
  "dinosaur-jurassic-cake",
  "space-astronaut-galaxy-cake",
  "solar-system-planet-cake",
  "ocean-under-the-sea-cake",
  "mermaid-tail-pastel-cake",
  "rainbow-cloud-pastel-cake",
  "hot-air-balloon-baby-cake",
  "carousel-royal-baby-cake",
  "prince-crown-blue-cake",
  "little-princess-pink-cake",
  "mercedes-benz-car-cake",
  "bmw-luxury-car-cake",
  "audi-sports-car-cake",
  "ferrari-racing-car-cake",
  "lamborghini-supercar-cake",
  "fortuner-suv-car-cake",
  "scorpio-black-suv-cake",
  "ktm-duke-bike-cake",
  "harley-davidson-bike-cake",
  "tractor-farming-theme-cake",
  "train-thomas-engine-cake",
  "airplane-cloud-theme-cake",
  "music-guitar-piano-cake",
  "camera-photography-cake",
  "painting-artist-palette-cake",
  "stock-market-bull-trading-cake",
  "bitcoin-crypto-theme-cake",
];

const CORE_PRODUCT_IDS = [
  "cake-belgian-truffle",
  "cake-red-velvet",
  "cake-rasmalai",
  "cake-lotus-biscoff",
  "cake-blueberry-cheese",
  "cake-ferrero-rocher",
  "cake-pineapple-fresh",
  "cake-butterscotch",
  "cake-black-forest",
  "cake-fresh-fruit",
  "cookie-choc-chip",
  "cookie-double-fudge",
  "hamper-royal-celebration",
  "hamper-corporate-gold",
];

const GSC_PRIORITY_SLUGS = [
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

const DELIVERY_INTENT_PREFIXES = [
  "cake-delivery-in",
  "midnight-cake-delivery-in",
  "birthday-cake-delivery-in",
  "eggless-cake-delivery-in",
  "anniversary-cake-delivery-in",
  "photo-cake-delivery-in",
  "custom-cake-delivery-in",
  "chocolate-cake-delivery-in",
  "pinata-cake-delivery-in",
  "same-day-cake-delivery-in",
];

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapUrlsetXml(urlStrings, today) {
  const safeToday = escapeXml(today);
  const rows = new Array(urlStrings.length);
  for (let i = 0; i < urlStrings.length; i++) {
    rows[i] = `<url><loc>${escapeXml(urlStrings[i])}</loc><lastmod>${safeToday}</lastmod></url>`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join("\n")}\n</urlset>`;
}

export function buildSitemapByType(rawType = "main", baseUrl = CANONICAL_SITE_URL, todayStr) {
  const today = todayStr || new Date().toISOString().split("T")[0];
  const type = String(rawType || "main")
    .toLowerCase()
    .replace(/^sitemap-/, "")
    .replace(/\.xml$/, "")
    .trim();

  // 1. City-Specific Sitemaps: faridabad, gurgaon, noida, delhi, ghaziabad (10,200+ URLs each)
  if (NCR_CITY_LOCALITIES[type]) {
    const localities = NCR_CITY_LOCALITIES[type];
    const urls = [
      `${baseUrl}/cakes-in/${type}`,
      `${baseUrl}/cookies-${type}`,
    ];

    // Standard 10 delivery intent prefixes × 50 localities = 500 URLs
    for (const loc of localities) {
      for (const prefix of DELIVERY_INTENT_PREFIXES) {
        urls.push(`${baseUrl}/${prefix}/${loc}`);
      }
    }

    // 205 Cake Themes × 50 localities = 10,250 programmatic single-segment landing URLs
    for (const theme of PROGRAMMATIC_CAKE_THEMES) {
      urls.push(`${baseUrl}/custom-cake/${theme}-in-${type}`);
      for (const loc of localities) {
        urls.push(`${baseUrl}/${theme}-delivery-in-${loc}`);
      }
    }

    return wrapUrlsetXml(urls, today);
  }

  // 2. Occasions & Custom Cake Theme Sitemap: sitemap-occasions.xml (10,300+ URLs)
  if (type === "occasions") {
    const urls = [];
    const allLocalities = [
      ...NCR_CITY_LOCALITIES.faridabad.slice(0, 10),
      ...NCR_CITY_LOCALITIES.gurgaon.slice(0, 10),
      ...NCR_CITY_LOCALITIES.noida.slice(0, 10),
      ...NCR_CITY_LOCALITIES.delhi.slice(0, 10),
      ...NCR_CITY_LOCALITIES.ghaziabad.slice(0, 10),
    ];

    for (const slug of GSC_PRIORITY_SLUGS) {
      urls.push(`${baseUrl}/${slug}`);
    }

    for (const theme of PROGRAMMATIC_CAKE_THEMES) {
      urls.push(`${baseUrl}/custom-cake/${theme}`);
      for (const city of Object.keys(NCR_CITY_LOCALITIES)) {
        urls.push(`${baseUrl}/custom-cake/${theme}-in-${city}`);
      }
      // 205 themes × 50 top NCR hubs = 10,250 custom cake landing pages
      for (const loc of allLocalities) {
        urls.push(`${baseUrl}/custom-cake/${theme}-in-${loc}`);
      }
    }

    return wrapUrlsetXml(urls, today);
  }

  // 3. Videos Sitemap: sitemap-videos.xml (10,000+ Video Watch Pages)
  if (type === "videos") {
    const heroThumb = escapeXml(
      "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png"
    );
    const videoUrl = escapeXml(
      "https://assets.mixkit.co/videos/preview/mixkit-confectioner-decorating-a-chocolate-cake-41444-large.mp4"
    );

    const watchEntries = [
      {
        loc: `${baseUrl}/`,
        title: "CakeUrban 100% Pure Eggless Custom Theme Cakes and 30-Min Cold-Chain Delivery",
        desc: "Watch how CakeUrban freshly bakes 100% pure eggless Belgian chocolate, sugar-free, birthday and anniversary cakes across Delhi NCR.",
      },
    ];

    for (const s of GSC_PRIORITY_SLUGS) {
      const label = s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      watchEntries.push({
        loc: `${baseUrl}/${s}`,
        title: `${label} - CakeUrban Live Patisserie and Express Delivery`,
        desc: `Watch how CakeUrban bakes and delivers ${label} in 100% pure eggless with 30-45 min cold-chain doorstep service.`,
      });
    }

    const top50Localities = [
      ...NCR_CITY_LOCALITIES.faridabad.slice(0, 10),
      ...NCR_CITY_LOCALITIES.gurgaon.slice(0, 10),
      ...NCR_CITY_LOCALITIES.noida.slice(0, 10),
      ...NCR_CITY_LOCALITIES.delhi.slice(0, 10),
      ...NCR_CITY_LOCALITIES.ghaziabad.slice(0, 10),
    ];

    for (const theme of PROGRAMMATIC_CAKE_THEMES.slice(0, 200)) {
      const themeLabel = theme.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      for (const loc of top50Localities) {
        const locLabel = loc.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        watchEntries.push({
          loc: `${baseUrl}/${theme}-delivery-in-${loc}`,
          title: `100% Eggless ${themeLabel} Delivery in ${locLabel} - CakeUrban Kitchen`,
          desc: `Watch CakeUrban patisserie chefs prepare 100% pure eggless ${themeLabel} for 30-45 min delivery in ${locLabel}.`,
        });
      }
    }

    const rows = watchEntries.map(
      (v) =>
        `<url><loc>${escapeXml(v.loc)}</loc><video:video><video:thumbnail_loc>${heroThumb}</video:thumbnail_loc><video:title>${escapeXml(v.title)}</video:title><video:description>${escapeXml(v.desc)}</video:description><video:content_loc>${videoUrl}</video:content_loc><video:duration>45</video:duration><video:publication_date>2026-01-15T08:00:00+05:30</video:publication_date><video:family_friendly>yes</video:family_friendly></video:video></url>`
    );

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${rows.join("\n")}\n</urlset>`;
  }

  // 4. Master Sitemap: sitemap.xml & sitemap-main.xml (10,300+ High-Intent URLs)
  const mainUrls = [
    `${baseUrl}/`,
    `${baseUrl}/builder`,
    `${baseUrl}/shop`,
    `${baseUrl}/delivery-locations`,
    `${baseUrl}/track`,
    `${baseUrl}/blog`,
    `${baseUrl}/about`,
    `${baseUrl}/contact`,
  ];

  for (const pid of CORE_PRODUCT_IDS) {
    mainUrls.push(`${baseUrl}/product/${pid}`);
  }

  for (const slug of GSC_PRIORITY_SLUGS) {
    mainUrls.push(`${baseUrl}/${slug}`);
  }

  for (const city of Object.keys(NCR_CITY_LOCALITIES)) {
    mainUrls.push(`${baseUrl}/cakes-in/${city}`);
    mainUrls.push(`${baseUrl}/cookies-${city}`);
  }

  for (const theme of PROGRAMMATIC_CAKE_THEMES) {
    mainUrls.push(`${baseUrl}/custom-cake/${theme}`);
    for (const city of Object.keys(NCR_CITY_LOCALITIES)) {
      mainUrls.push(`${baseUrl}/custom-cake/${theme}-in-${city}`);
    }
  }

  const top50Hubs = [
    ...NCR_CITY_LOCALITIES.faridabad.slice(0, 10),
    ...NCR_CITY_LOCALITIES.gurgaon.slice(0, 10),
    ...NCR_CITY_LOCALITIES.noida.slice(0, 10),
    ...NCR_CITY_LOCALITIES.delhi.slice(0, 10),
    ...NCR_CITY_LOCALITIES.ghaziabad.slice(0, 10),
  ];

  for (const loc of top50Hubs) {
    for (const prefix of DELIVERY_INTENT_PREFIXES) {
      mainUrls.push(`${baseUrl}/${prefix}/${loc}`);
    }
  }

  // 180 top themes × 50 top NCR hubs = 9,000+ hyperlocal theme delivery pages in main sitemap
  for (const theme of PROGRAMMATIC_CAKE_THEMES.slice(0, 185)) {
    for (const loc of top50Hubs) {
      mainUrls.push(`${baseUrl}/${theme}-delivery-in-${loc}`);
    }
  }

  return wrapUrlsetXml(mainUrls, today);
}

export default function handler(req, res) {
  try {
    const rawType = req.query?.type || req.url?.replace(/^\/sitemap-?|\.xml.*$/g, "") || "main";
    const xml = buildSitemapByType(rawType, CANONICAL_SITE_URL);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`);
  }
}
