import { AreaData } from "../data/seoLocations";

export interface SchemaOptions {
  siteUrl?: string;
  currentPath?: string;
  ratingValue?: string;
  reviewCount?: string;
}

const CITY_COORDS: Record<string, { lat: number; lng: number; region: string }> = {
  faridabad: { lat: 28.4089, lng: 77.3178, region: "Haryana" },
  gurgaon: { lat: 28.4595, lng: 77.0266, region: "Haryana" },
  noida: { lat: 28.5355, lng: 77.3910, region: "Uttar Pradesh" },
  delhi: { lat: 28.5494, lng: 77.2001, region: "Delhi" },
  ghaziabad: { lat: 28.6415, lng: 77.3714, region: "Uttar Pradesh" },
};

/**
 * Generates advanced JSON-LD structured data graph for hyperlocal area pages.
 * Incorporates Bakery/LocalBusiness, GeoCoordinates, Service Area, AggregateRating, VideoObject, BreadcrumbList, and FAQPage.
 */
export function generateAreaStructuredData(area: AreaData, options: SchemaOptions = {}) {
  const baseUrl = options.siteUrl || "https://www.cakeurban.com";
  const pathPart =
    options.currentPath ||
    (typeof window !== "undefined" ? window.location.pathname : `/cake-delivery-in/${area.slug}`);
  const exactPageUrl = `${baseUrl}${pathPart.startsWith("/") ? pathPart : `/${pathPart}`}`;
  const rating = options.ratingValue || "4.9";
  const reviews = options.reviewCount || "318";
  const coords = CITY_COORDS[area.citySlug] || CITY_COORDS.faridabad;
  const heroThumb = "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Bakery", "FoodEstablishment", "LocalBusiness"],
        "@id": `${exactPageUrl}#localbusiness`,
        name: area.intentTitle
          ? `CakeUrban — ${area.intentTitle}`
          : `CakeUrban — ${area.areaName}, ${area.cityName}`,
        description: area.metaDesc,
        url: exactPageUrl,
        image: heroThumb,
        telephone: "+91-7318531953",
        priceRange: "₹₹",
        servesCuisine: [
          "100% Pure Eggless Cakes",
          "Healthy Sugar-Free Cakes",
          "Belgian Chocolate Truffle",
          "72-Hour Cold-Fermented Cookies",
          "Luxury Gift Hampers",
          "Crispy Traditional Namkeens",
        ],
        address: {
          "@type": "PostalAddress",
          streetAddress: `Near ${area.landmarks[0] || area.areaName}`,
          addressLocality: `${area.areaName}, ${area.cityName}`,
          addressRegion: coords.region,
          postalCode: area.pincode,
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: coords.lat,
          longitude: coords.lng,
        },
        areaServed: {
          "@type": "Place",
          name: `${area.areaName}, ${area.cityName} (${area.pincode})`,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount: reviews,
          bestRating: "5",
          worstRating: "1",
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          opens: "00:00",
          closes: "23:59",
        },
      },
      {
        "@type": "VideoObject",
        "@id": `${exactPageUrl}#watch-video`,
        name: `How CakeUrban Bakes & Delivers 100% Eggless Cakes in ${area.areaName}, ${area.cityName}`,
        description: `Watch how CakeUrban's central patisserie freshly bakes 100% pure eggless Belgian chocolate, sugar-free, and custom theme cakes with ${area.sla} chilled delivery in ${area.areaName}, ${area.cityName} (PIN ${area.pincode}).`,
        thumbnailUrl: [heroThumb],
        uploadDate: "2026-01-15T08:00:00+05:30",
        duration: "PT0M45S",
        contentUrl: "https://assets.mixkit.co/videos/preview/mixkit-confectioner-decorating-a-chocolate-cake-41444-large.mp4",
        embedUrl: exactPageUrl,
        publisher: {
          "@type": "Organization",
          name: "CakeUrban",
          logo: {
            "@type": "ImageObject",
            url: heroThumb,
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${exactPageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: `${area.cityName} Hub`,
            item: `${baseUrl}/cakes-in/${area.citySlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: area.intentTitle || area.areaName,
            item: exactPageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${exactPageUrl}#faq`,
        mainEntity: area.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };
}

export function injectInternalLinks(content: string, allAreas: AreaData[]): string {
  let processed = content;
  const sortedAreas = [...allAreas].sort((a, b) => b.areaName.length - a.areaName.length);

  for (const area of sortedAreas.slice(0, 15)) {
    const regex = new RegExp(`\\b(${area.areaName})\\b`, "gi");
    let replaced = false;
    processed = processed.replace(regex, (match) => {
      if (!replaced) {
        replaced = true;
        return `<a href="/cake-delivery-in/${area.slug}" class="text-blaze-400 hover:underline font-semibold">${match}</a>`;
      }
      return match;
    });
  }
  return processed;
}

export function generateXmlSitemap(baseUrl: string = "https://www.cakeurban.com", areas: AreaData[]): string {
  const staticUrls = [
    { url: baseUrl, priority: "1.0", changefreq: "daily" },
    { url: `${baseUrl}/shop`, priority: "0.9", changefreq: "daily" },
    { url: `${baseUrl}/delivery-locations`, priority: "0.9", changefreq: "weekly" },
    { url: `${baseUrl}/builder`, priority: "0.8", changefreq: "weekly" },
    { url: `${baseUrl}/track`, priority: "0.7", changefreq: "weekly" },
    { url: `${baseUrl}/blog`, priority: "0.8", changefreq: "weekly" },
    { url: `${baseUrl}/about`, priority: "0.6", changefreq: "monthly" },
    { url: `${baseUrl}/contact`, priority: "0.7", changefreq: "monthly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const s of staticUrls) {
    xml += `  <url>\n`;
    xml += `    <loc>${s.url}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>${s.changefreq}</changefreq>\n`;
    xml += `    <priority>${s.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  for (const area of areas) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/cake-delivery-in/${area.slug}</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}
