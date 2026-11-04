import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../lib/store";
import { DELHI_NCR_CITIES, getSeoAreaBySlug, isProgrammaticSeoSlug, SEO_INTENTS } from "../data/seoLocations";
import { BLOG_POSTS, resolveNcrPincode } from "../data/catalog";
import { SEO_CUSTOM_CAKE_THEMES, parseThemeAndCityFromSlug } from "../pages/builder";
import {
  getAutoSeoThemes,
  initAutoSeoRealtimeSync,
  recordAutoSeoSearch,
  subscribeAutoSeoUpdates,
} from "../lib/autoSeoEngine";

const CITY_GEO_COORDS: Record<string, { region: string; placename: string; lat: number; lng: number; postal: string }> = {
  faridabad: { region: "IN-HR", placename: "Faridabad, Haryana, Delhi NCR", lat: 28.4089, lng: 77.3178, postal: "121007" },
  gurgaon: { region: "IN-HR", placename: "Gurgaon (Gurugram), Haryana, Delhi NCR", lat: 28.4595, lng: 77.0266, postal: "122002" },
  noida: { region: "IN-UP", placename: "Noida & Greater Noida, Uttar Pradesh, Delhi NCR", lat: 28.5355, lng: 77.3910, postal: "201301" },
  delhi: { region: "IN-DL", placename: "South Delhi & New Delhi, Delhi NCR", lat: 28.5494, lng: 77.2001, postal: "110048" },
  ghaziabad: { region: "IN-UP", placename: "Indirapuram, Ghaziabad, Uttar Pradesh, Delhi NCR", lat: 28.6415, lng: 77.3714, postal: "201014" },
};

export function SEOManager() {
  const { pathname, search } = useLocation();
  const { products, settings, checkedPincode } = useStore();
  const [autoThemes, setAutoThemes] = useState(() => getAutoSeoThemes());

  useEffect(() => {
    initAutoSeoRealtimeSync();
    return subscribeAutoSeoUpdates(() => {
      setAutoThemes(getAutoSeoThemes());
    });
  }, []);

  useEffect(() => {
    const origin = "https://www.cakeurban.com";
    const params = new URLSearchParams(search);
    const queryParam = params.get("q")?.trim() || "";
    if (queryParam.length >= 3) {
      recordAutoSeoSearch(queryParam);
    }
    const cleanPath = pathname.replace(/\/+$/, "") || "/";
    const canonicalUrl = cleanPath === "/" ? `${origin}/` : `${origin}${cleanPath}`;

    let title =
      "CakeUrban — #1 Custom Theme Cakes (Birthday, Anniversary, Cartoon, Wedding), 100% Eggless Bakery, Cookies & Gift Hampers";
    let description =
      "Search & order any Custom Theme Cake (Birthday, Anniversary, Butterfly, Doraemon, Spiderman, Barbie, 2-Tier Wedding), 100% pure eggless cakes, gourmet cookies & luxury gift hampers across Faridabad, Gurgaon, Noida, Delhi & Ghaziabad. WhatsApp: +91 7318531953.";
    let keywords =
      "custom theme cake online, birthday cake delivery faridabad gurgaon noida delhi, anniversary cake design, butterfly cake, doraemon cake, spiderman cake, barbie doll cake, unicorn cake, cocomelon cake, shinchan cake, 2 tier wedding cake, engagement ring cake, vintage heart cake, 100% eggless cake near me, gourmet cookies delhi ncr, luxury gift hampers, cakeurban";
    let ogImage = "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png";
    let ogType = "website";
    let activeCityKey = "faridabad";

    let pageSchema: Record<string, unknown> | null = null;

    // 1. Product Detail Route
    if (pathname.startsWith("/product/")) {
      const prodId = pathname.replace("/product/", "");
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        title = prod.seoTitle || `${prod.name} — 30-Min Express Delivery in Delhi NCR | CakeUrban`;
        description =
          prod.seoDesc ||
          `Order ${prod.name} online at CakeUrban. ${prod.desc} 100% Pure Eggless, freshly baked to order with 30-45 mins express & 12 AM midnight delivery across Faridabad, Gurgaon, Noida & Delhi.`;
        keywords =
          prod.seoKeywords ||
          `${prod.name.toLowerCase()}, buy ${prod.name.toLowerCase()} online delhi ncr, ${prod.category.toLowerCase()} delivery faridabad gurgaon noida, eggless ${prod.name.toLowerCase()}, cakeurban`;
        ogImage = prod.img;
        ogType = "product";

        pageSchema = {
          "@type": "Product",
          "@id": `${canonicalUrl}#product`,
          name: prod.name,
          image: [prod.img],
          description: prod.desc,
          sku: prod.sku,
          brand: {
            "@type": "Brand",
            name: "CakeUrban",
          },
          category: prod.category,
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            priceCurrency: "INR",
            price: Math.round(prod.price * 83.4),
            priceValidUntil: "2027-12-31",
            itemCondition: "https://schema.org/NewCondition",
            availability: prod.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: {
              "@type": "Organization",
              name: "CakeUrban Bakehouse Delhi NCR",
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "MonetaryAmount",
                value: "0",
                currency: "INR",
              },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "HUR" },
                transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "HUR" },
              },
            },
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: prod.rating.toString(),
            reviewCount: prod.ratingCount.toString(),
            bestRating: "5",
            worstRating: "1",
          },
        };
      }
    }
    // 2. City Hub Route (/cakes-in/:citySlug)
    else if (pathname.startsWith("/cakes-in/")) {
      const citySlug = pathname.replace("/cakes-in/", "").toLowerCase();
      const city = DELHI_NCR_CITIES[citySlug];
      if (city) {
        activeCityKey = citySlug in CITY_GEO_COORDS ? citySlug : "faridabad";
        title = city.title;
        description = city.metaDesc;
        keywords = `cake delivery in ${city.cityName.toLowerCase()}, midnight cake delivery ${city.cityName.toLowerCase()}, eggless bakery ${city.cityName.toLowerCase()}, gift hampers ${city.cityName.toLowerCase()}, gourmet cookies ${city.cityName.toLowerCase()}, cakeurban ${city.cityName.toLowerCase()}`;
      }
    }
    // 3. Hyperlocal Area Intent Routes (all 10 SEO_INTENTS prefixes)
    else if (
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
        activeCityKey = area.citySlug in CITY_GEO_COORDS ? area.citySlug : "faridabad";
        title = area.title;
        description = area.metaDesc;
        keywords = `${area.areaName.toLowerCase()} cake delivery, midnight cake delivery ${area.areaName.toLowerCase()}, eggless cake ${area.areaName.toLowerCase()} ${area.pincode}, best bakery near ${area.landmarks[0]?.toLowerCase() || area.areaName.toLowerCase()}, gift hampers ${area.cityName.toLowerCase()}`;
      }
    }
    // 4. Cookies & Hampers City Routes
    else if (pathname.startsWith("/cookies-") || pathname.startsWith("/cookies/")) {
      const cityKey = pathname.replace(/^\/cookies[-/]/, "").toLowerCase();
      if (cityKey in CITY_GEO_COORDS) activeCityKey = cityKey;
      const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
      title = `Best Gourmet Cookies, Namkeens & Luxury Gift Hampers in ${cityName} | 35-Min Delivery | CakeUrban`;
      description = `Order 72-hour cold-fermented choc-chip cookies, French macarons, roasted makhana & luxury corporate/birthday gift hampers in ${cityName} with 35-min express & midnight delivery.`;
      keywords = `gourmet cookies ${cityKey}, gift hampers ${cityKey}, corporate gifting ${cityKey}, choc chip cookies delivery ${cityKey}, namkeen gift box ${cityKey}`;
    }
    // 5. Custom Theme Cake Search & Dedicated Theme Routes (/builder, /builder?q=..., /custom-cake/:themeSlug)
    else if (pathname === "/builder" || pathname.startsWith("/custom-cake/")) {
      const slugPart = pathname.startsWith("/custom-cake/")
        ? pathname.replace("/custom-cake/", "").trim()
        : "";
      const parsedSlug = slugPart ? parseThemeAndCityFromSlug(slugPart) : null;
      if (parsedSlug?.citySlug && parsedSlug.citySlug in CITY_GEO_COORDS) {
        activeCityKey = parsedSlug.citySlug;
      }

      const activeThemeName = queryParam
        ? queryParam.replace(/\b\w/g, (l) => l.toUpperCase())
        : parsedSlug
        ? parsedSlug.themeLabel
        : "";

      const targetCityLabel = parsedSlug?.cityName || "Delhi NCR (Faridabad, Gurgaon, Noida, Delhi & Ghaziabad)";

      if (activeThemeName) {
        const cleanTheme = /cake/i.test(activeThemeName) ? activeThemeName : `${activeThemeName} Cake`;
        title = parsedSlug?.cityName
          ? `Custom ${cleanTheme} Delivery in ${parsedSlug.cityName} (100% Eggless) — 30-45 Min & Midnight | CakeUrban`
          : `Best Custom ${cleanTheme} Designs Online (100% Eggless) — Same Day Delivery in Delhi NCR | CakeUrban`;
        description = parsedSlug?.matchedTheme?.desc
          ? `${parsedSlug.matchedTheme.desc}. Browse 40+ latest ${cleanTheme} designs in ${targetCityLabel} & order 100% pure eggless on WhatsApp (+91 7318531953) with express & 12 AM midnight delivery.`
          : `Explore 40+ trending custom ${cleanTheme} designs in ${targetCityLabel} at CakeUrban! 100% pure eggless, freshly baked to order with same-day & midnight delivery. Chat on WhatsApp: +91 7318531953.`;
        keywords = `${cleanTheme.toLowerCase()}, custom ${cleanTheme.toLowerCase()} in ${targetCityLabel.toLowerCase()}, ${cleanTheme.toLowerCase()} design photo, eggless ${cleanTheme.toLowerCase()} near me, ${cleanTheme.toLowerCase()} delivery faridabad gurgaon noida delhi, order ${cleanTheme.toLowerCase()} on whatsapp, cakeurban`;
        ogType = "product";

        pageSchema = {
          "@type": "Product",
          "@id": `${canonicalUrl}#custom-theme-cake`,
          name: parsedSlug?.cityName
            ? `Custom ${cleanTheme} in ${parsedSlug.cityName} (100% Pure Eggless)`
            : `Custom ${cleanTheme} (100% Pure Eggless)`,
          image: [ogImage],
          description,
          brand: { "@type": "Brand", name: "CakeUrban" },
          category: "Custom Theme Cakes",
          offers: {
            "@type": "AggregateOffer",
            url: canonicalUrl,
            priceCurrency: "INR",
            lowPrice: "599",
            highPrice: "4999",
            offerCount: "44",
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "CakeUrban Custom Cake Studio" },
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "2480",
            bestRating: "5",
            worstRating: "1",
          },
        };
      } else {
        title =
          "Custom Theme Cake Search Studio — Birthday, Anniversary, Cartoon, Butterfly & Wedding Cakes | CakeUrban";
        description =
          "Search 1000+ custom cake designs for any theme (Birthday, Anniversary, Butterfly, Doraemon, Spiderman, Barbie Doll, Unicorn, Cocomelon, 2-Tier Wedding, Vintage Heart) & order 100% pure eggless on WhatsApp (+91 7318531953).";
        keywords =
          "custom cake design search, theme cake online delhi ncr, birthday cake designs, anniversary cake designs, butterfly cake, doraemon cake, spiderman cake, barbie doll cake, 2 tier wedding cake, vintage heart cake, eggless custom cake faridabad gurgaon noida delhi";
      }
    }
    // 6. Other Core Routes
    else if (pathname === "/shop") {
      title = "Shop Gourmet Cookies, Eggless Cakes, Namkeens & Luxury Gift Hampers | CakeUrban Delhi NCR";
      description =
        "Browse CakeUrban's complete menu of 100% eggless Belgian chocolate cakes, molten choc-chip cookies, royal Bikaneri namkeens, and luxury gift hampers. 30-45 mins express delivery.";
    } else if (pathname === "/track") {
      title = "Live Order & GPS Rider Tracker — Cold-Chain Telemetry | CakeUrban";
      description =
        "Track your CakeUrban order in real time from oven baking and 4°C cold-box sealing to live GPS rider arrival across Faridabad, Gurgaon, Noida & Delhi.";
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
        ogImage = post.img;
        ogType = "article";
        pageSchema = {
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.img,
          datePublished: post.date,
          author: { "@type": "Organization", name: "CakeUrban Bakehouse" },
          publisher: { "@id": `${origin}/#bakery` },
          mainEntityOfPage: canonicalUrl,
        };
      } else {
        title = "The CakeUrban Journal — Artisan Baking & Delhi NCR Celebration Guides";
        description =
          "Read expert guides on 72-hour cold-fermented cookies, pure eggless patisserie science, and the best birthday & Diwali gift hampers in Faridabad, Gurgaon, Noida & Delhi.";
      }
    } else if (pathname === "/about") {
      title = "About CakeUrban — 100% Pure Eggless Artisan Bakehouse in Delhi NCR";
      description =
        "Founded in 2021, CakeUrban bakes 100% pure eggless Belgian chocolate cakes, 72-hour fermented cookies & luxury hampers across 5 kitchen hubs in Delhi NCR.";
    } else if (pathname === "/contact") {
      title = "Contact CakeUrban — 24×7 Express & Midnight Delivery Hotline (+91 7318531953)";
      description =
        "Contact CakeUrban Central Bakehouse in Sector 15 Faridabad, Delhi NCR. Call or WhatsApp +91 7318531953 for urgent 30-min cake delivery, custom cakes & bulk corporate hampers.";
    } else if (isProgrammaticSeoSlug(pathname)) {
      const area = getSeoAreaBySlug(pathname, "standard");
      if (area) {
        activeCityKey = area.citySlug in CITY_GEO_COORDS ? area.citySlug : "faridabad";
        title = area.title;
        description = area.metaDesc;
        keywords = `${area.intentTitle?.toLowerCase() || area.areaName.toLowerCase()}, ${area.areaName.toLowerCase()} cake delivery, midnight cake delivery ${area.areaName.toLowerCase()}, eggless cake ${area.areaName.toLowerCase()} ${area.pincode}, cakeurban ${area.cityName.toLowerCase()}`;
        pageSchema = {
          "@type": "Product",
          "@id": `${canonicalUrl}#product`,
          name: area.intentTitle || `Cake Delivery in ${area.areaName}, ${area.cityName}`,
          image: [ogImage],
          description: area.metaDesc,
          brand: { "@type": "Brand", name: "CakeUrban" },
          offers: {
            "@type": "AggregateOffer",
            url: canonicalUrl,
            priceCurrency: "INR",
            lowPrice: "599",
            highPrice: "4999",
            offerCount: "24",
            availability: "https://schema.org/InStock",
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "2480",
            bestRating: "5",
            worstRating: "1",
          },
        };
      }
    }

    // Apply Document Title
    document.title = title;

    // Helper to update or create meta tags
    const setMetaTag = (attrName: "name" | "property", attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const geoInfo = CITY_GEO_COORDS[activeCityKey] || CITY_GEO_COORDS.faridabad;

    const autoKeywordSnippet = autoThemes
      .slice(0, 18)
      .map((t) => `${t.label.toLowerCase()}, eggless ${t.label.toLowerCase()} delhi ncr`)
      .join(", ");
    const adminFocusSnippet = (settings.seo?.focusKeywords || []).map((k) => k.toLowerCase()).join(", ");
    const resolvedPin = resolveNcrPincode(checkedPincode || "121007");
    const pinSnippet = resolvedPin
      ? `cake delivery ${resolvedPin.pincode}, ${resolvedPin.areaName.toLowerCase()} cake shop, ${resolvedPin.city.toLowerCase()} 30 min bakery`
      : "";
    const combinedKeywords = [keywords, adminFocusSnippet, pinSnippet, autoKeywordSnippet]
      .filter(Boolean)
      .join(", ");

    const mergedThemeList = [
      ...autoThemes.map((t) => ({ slug: t.slug, label: t.label, desc: t.desc })),
      ...SEO_CUSTOM_CAKE_THEMES.filter(
        (staticT) => !autoThemes.some((autoT) => autoT.slug === staticT.slug)
      ),
    ];

    setMetaTag("name", "description", description);
    setMetaTag("name", "keywords", combinedKeywords);
    setMetaTag("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setMetaTag("name", "geo.region", geoInfo.region);
    setMetaTag("name", "geo.placename", geoInfo.placename);
    setMetaTag("name", "geo.position", `${geoInfo.lat};${geoInfo.lng}`);
    setMetaTag("name", "ICBM", `${geoInfo.lat}, ${geoInfo.lng}`);

    // OpenGraph & Twitter Cards
    setMetaTag("property", "og:title", title);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:image", ogImage);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:locale", "en_IN");
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", title);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", ogImage);

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Build BreadcrumbList dynamically
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: origin,
      },
      ...segments.map((seg, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        item: `${origin}/${segments.slice(0, index + 1).join("/")}`,
      })),
    ];

    // Multi-Hub LocalBusiness + GEO Answer Engine Knowledge Graph
    const graphNodes: Record<string, unknown>[] = [
      {
        "@type": ["Bakery", "FoodEstablishment", "LocalBusiness"],
        "@id": `${origin}/#bakery`,
        name: "CakeUrban",
        alternateName: ["Cake Urban", "CakeUrban Bakehouse", "CakeUrban Delhi NCR", "CakeUrban Faridabad"],
        url: origin,
        telephone: "+91-7318531953",
        email: "hello@cakeurban.com",
        priceRange: "₹₹",
        image: ogImage,
        logo: ogImage,
        servesCuisine: [
          "100% Pure Eggless Cakes",
          "Belgian Chocolate Truffle Cakes",
          "72-Hour Cold-Fermented Gourmet Cookies",
          "Luxury Birthday, Anniversary & Corporate Gift Hampers",
          "Traditional Royal Bikaneri Namkeens & Roasted Makhana",
          ...autoThemes.slice(0, 12).map((t) => `100% Eggless Custom ${t.label}`),
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: "Sector 15 Central Bakehouse Hub",
          addressLocality: "Faridabad",
          addressRegion: "Haryana",
          postalCode: geoInfo.postal,
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: geoInfo.lat,
          longitude: geoInfo.lng,
        },
        areaServed: [
          {
            "@type": "GeoCircle",
            geoMidpoint: { "@type": "GeoCoordinates", latitude: 28.5245, longitude: 77.2500 },
            geoRadius: "45000",
          },
          { "@type": "City", name: "Faridabad" },
          { "@type": "City", name: "Gurgaon" },
          { "@type": "City", name: "Noida" },
          { "@type": "City", name: "New Delhi" },
          { "@type": "City", name: "Ghaziabad" },
        ],
        department: Object.entries(CITY_GEO_COORDS).map(([slug, g]) => ({
          "@type": "Bakery",
          name: `CakeUrban ${slug.charAt(0).toUpperCase() + slug.slice(1)} Express Hub`,
          telephone: "+91-7318531953",
          url: `${origin}/cakes-in/${slug}`,
          address: {
            "@type": "PostalAddress",
            addressLocality: slug.charAt(0).toUpperCase() + slug.slice(1),
            addressRegion: g.region,
            postalCode: g.postal,
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: g.lat,
            longitude: g.lng,
          },
        })),
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          bestRating: "5",
          worstRating: "1",
          ratingCount: "2480",
          reviewCount: "2480",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            opens: "00:00",
            closes: "23:59",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: origin,
        name: "CakeUrban",
        publisher: { "@id": `${origin}/#bakery` },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: `${origin}/builder?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
          {
            "@type": "SearchAction",
            target: `${origin}/shop?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: breadcrumbItems,
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        isPartOf: { "@id": `${origin}/#website` },
        about: { "@id": `${origin}/#bakery` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["#seo-main-heading", "#seo-direct-summary", "#geo-answer-capsule", "h1"],
        },
      },
      {
        "@type": "VideoObject",
        "@id": `${canonicalUrl}#video`,
        name: `${title.split("|")[0].trim()} — Live Patisserie & 30-Min Cold-Chain Delivery`,
        description,
        thumbnailUrl: [ogImage],
        uploadDate: "2026-01-15T08:00:00+05:30",
        duration: "PT0M45S",
        contentUrl: "https://assets.mixkit.co/videos/preview/mixkit-confectioner-decorating-a-chocolate-cake-41444-large.mp4",
        embedUrl: canonicalUrl,
        publisher: {
          "@type": "Organization",
          name: "CakeUrban",
          logo: {
            "@type": "ImageObject",
            url: ogImage,
          },
        },
      },
      {
        "@type": "HowTo",
        "@id": `${origin}/#howto-custom-cake`,
        name: "How to Order Any Custom Theme Cake Online at CakeUrban",
        description:
          "Order any custom birthday, anniversary, cartoon, butterfly, pineapple, or 2-tier wedding cake in 100% pure eggless with express delivery across Delhi NCR.",
        totalTime: "PT2M",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Search Any Cake Theme",
            text: "Visit CakeUrban.com/builder and search your desired cake theme (such as Butterfly, Doraemon, Spiderman, Barbie, Pineapple, 2-Tier Wedding, Doctor, or Vintage Heart).",
            url: `${origin}/builder`,
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Preview Full Uncropped Cake Photo",
            text: "Tap any cake photo to open the full-screen zoomable preview and type your custom cake message or note.",
            url: `${origin}/builder`,
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Chat Directly on WhatsApp (+91 7318531953)",
            text: "Tap 'Chat About This Cake' to send the selected cake photo directly to our head bakers on WhatsApp for instant price quote and 30–45 min or midnight delivery.",
            url: "https://wa.me/917318531953",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#geo-faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Where can I order 100% eggless custom theme cakes in Faridabad, Gurgaon, Noida, and Delhi NCR?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "CakeUrban (+91 7318531953) bakes 100% pure eggless custom theme cakes—including Birthday, Anniversary, Butterfly, Pineapple, Doraemon, Spiderman, Barbie Doll, and 2-Tier Wedding cakes—with 30–45 minute express and 12 AM midnight delivery across Faridabad, Gurgaon, Noida, Delhi, and Ghaziabad.",
            },
          },
          ...mergedThemeList.slice(0, 6).map((t) => ({
            "@type": "Question",
            name: `Can I customize and order an eggless ${t.label} on WhatsApp with same-day delivery?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `Yes! Browse 40+ live ${t.label} designs on CakeUrban (${origin}/custom-cake/${t.slug}) and tap 'Chat About This Cake' to customize your design on WhatsApp (+91 7318531953) with same-day & midnight delivery.`,
            },
          })),
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${origin}/#custom-cake-themes`,
        name: "CakeUrban Popular & Trending Custom Theme Cakes (100% Eggless)",
        itemListElement: mergedThemeList.slice(0, 48).map((t, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${origin}/custom-cake/${t.slug}`,
          name: `Custom ${t.label} (100% Eggless)`,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${origin}/#bestsellers`,
        name: "CakeUrban Top Selling Cakes, Cookies & Luxury Gift Hampers",
        itemListElement: products.slice(0, 6).map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${origin}/product/${p.id}`,
          name: p.name,
        })),
      },
    ];

    if (pageSchema) {
      graphNodes.push(pageSchema);
    }

    let scriptTag = document.getElementById("dynamic-seo-json-ld") as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "dynamic-seo-json-ld";
      scriptTag.setAttribute("type", "application/ld+json");
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": graphNodes,
    });
  }, [pathname, search, products, autoThemes, settings.seo, checkedPincode]);

  return null;
}
export default SEOManager;
