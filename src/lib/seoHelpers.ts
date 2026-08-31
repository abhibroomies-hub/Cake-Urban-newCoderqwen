import { AreaData } from "../data/seoLocations";

export interface SchemaOptions {
  siteUrl?: string;
  ratingValue?: string;
  reviewCount?: string;
}

/**
 * Generates advanced JSON-LD structured data graph for area pages.
 * Incorporates LocalBusiness/FoodEstablishment, AggregateRating, BreadcrumbList, and FAQPage.
 */
export function generateAreaStructuredData(area: AreaData, options: SchemaOptions = {}) {
  const baseUrl = options.siteUrl || "https://cakeurban.com";
  const rating = options.ratingValue || "4.8";
  const reviews = options.reviewCount || "142";

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FoodEstablishment",
        "@id": `${baseUrl}/#bakery`,
        "name": `CakeUrban - ${area.areaName} ${area.cityName}`,
        "description": area.metaDesc,
        "url": `${baseUrl}/cake-delivery-in/${area.slug}`,
        "telephone": "+91-7318531953",
        "priceRange": "₹₹",
        "servesCuisine": "100% Pure Eggless Cakes, Artisanal Cakes, Midnight Deliveries, Custom Designer Cakes, Belgian Truffle",
        "areaServed": {
          "@type": "AdministrativeArea",
          "name": `${area.areaName}, ${area.cityName}`
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": rating,
          "reviewCount": reviews,
          "bestRating": "5",
          "worstRating": "1"
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "09:00",
          "closes": "00:00"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": `${area.cityName} Hub`,
            "item": `${baseUrl}/cakes-in/${area.citySlug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": area.areaName,
            "item": `${baseUrl}/cake-delivery-in/${area.slug}`
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": area.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  };
}

/**
 * Automated Internal Linking Utility:
 * Scans text content and injects internal hyperlinks for known area or city keywords.
 */
export function injectInternalLinks(content: string, allAreas: AreaData[]): string {
  let processed = content;
  // Sort areas by name length descending to avoid partial replacements
  const sortedAreas = [...allAreas].sort((a, b) => b.areaName.length - a.areaName.length);

  for (const area of sortedAreas.slice(0, 15)) {
    const regex = new RegExp(`\\b(${area.areaName})\\b`, "gi");
    // Replace only the first occurrence in the text to avoid spamming links
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

/**
 * Generates an XML Sitemap string for all static and programmatic SEO routes.
 */
export function generateXmlSitemap(baseUrl: string = "https://cakeurban.com", areas: AreaData[]): string {
  const staticUrls = [
    { url: baseUrl, priority: "1.0", changefreq: "daily" },
    { url: `${baseUrl}/shop`, priority: "0.9", changefreq: "daily" },
    { url: `${baseUrl}/delivery-locations`, priority: "0.8", changefreq: "weekly" },
    { url: `${baseUrl}/builder`, priority: "0.7", changefreq: "monthly" },
    { url: `${baseUrl}/contact`, priority: "0.5", changefreq: "monthly" },
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
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}
