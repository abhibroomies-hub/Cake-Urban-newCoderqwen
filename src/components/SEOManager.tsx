import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "../lib/store";
import { generateAreaStructuredData } from "../lib/seoHelpers";

export function SEOManager() {
  const { pathname } = useLocation();
  const { products } = useStore();

  useEffect(() => {
    const siteUrl = "https://www.cakeurban.com";
    const currentUrl = `${siteUrl}${pathname}`;
    let title = "CakeUrban — Luxury Gourmet Cakes, Cookies & Gift Hampers in Delhi NCR";
    let desc = "Order handcrafted gourmet cookies, artisan cakes, and luxury gift hampers with express delivery across Delhi, Gurgaon, Noida, and Faridabad.";
    let image = `${siteUrl}/og-image.jpg`;
    let schemaList: any[] = [];

    // Base Organization Schema
    const orgSchema = {
      "@context": "https://schema.org",
      "@type": "Bakery",
      "@id": `${siteUrl}/#bakery`,
      "name": "CakeUrban",
      "url": siteUrl,
      "logo": `${siteUrl}/logo.png`,
      "image": image,
      "telephone": "+91-7318531953",
      "priceRange": "₹₹",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Sector 15 / Central Kitchen Hub",
        "addressLocality": "Faridabad",
        "addressRegion": "Haryana",
        "postalCode": "121007",
        "addressCountry": "IN"
      },
      "areaServed": ["Delhi", "Faridabad", "Noida", "Gurgaon", "Ghaziabad"],
      "sameAs": [
        "https://www.instagram.com/cakeurban",
        "https://www.facebook.com/cakeurban"
      ]
    };
    schemaList.push(orgSchema);

    // Route-specific dynamic metadata & schema
    if (pathname.startsWith("/product/")) {
      const productId = pathname.split("/product/")[1];
      const product = products.find((p) => p.id === productId);
      if (product) {
        title = `${product.name} | Buy Online | CakeUrban`;
        desc = product.desc || `Order fresh ${product.name} with express delivery across Delhi NCR.`;
        if (product.img) image = product.img;

        // Automated Product Schema (works for any newly added product instantly!)
        const productSchema = {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "image": [product.img],
          "description": product.desc,
          "brand": {
            "@type": "Brand",
            "name": "CakeUrban"
          },
          "offers": {
            "@type": "Offer",
            "url": currentUrl,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "CakeUrban"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": product.rating || "4.9",
            "reviewCount": (product as any).reviewsCount || "128"
          }
        };

        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
            { "@type": "ListItem", "position": 2, "name": "Shop", "item": `${siteUrl}/shop` },
            { "@type": "ListItem", "position": 3, "name": product.name, "item": currentUrl }
          ]
        };

        schemaList.push(productSchema, breadcrumbSchema);
      }
    } else if (pathname === "/shop") {
      title = "Shop Gourmet Cookies, Cakes & Gift Hampers | CakeUrban";
      desc = "Explore our handcrafted menu of 72-hr fermented cookies, gourmet celebration cakes, and festive gift hampers.";
    } else if (pathname.startsWith("/cookies-")) {
      const city = pathname.replace("/cookies-", "");
      const cityName = city.charAt(0).toUpperCase() + city.slice(1);
      title = `Best Gourmet Cookies in ${cityName} | Luxury Cookie Boxes | CakeUrban`;
      desc = `Order freshly baked gourmet cookies in ${cityName} with express delivery. Try our signature choc-chip, red velvet, and sea-salt caramel cookies.`;
    } else if (pathname.startsWith("/cakes-in/")) {
      const city = pathname.split("/cakes-in/")[1];
      const cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : "Delhi NCR";
      title = `Online Cake & Gift Delivery in ${cityName} | Same Day & Midnight | CakeUrban`;
      desc = `Order delicious cakes and gift hampers in ${cityName}. 100% eggless options available with midnight and express delivery.`;
    } else if (pathname.startsWith("/cake-delivery-in/")) {
      const areaSlug = pathname.split("/cake-delivery-in/")[1];
      title = `Cake & Cookie Delivery in ${areaSlug?.replace(/-/g, " ")} | CakeUrban`;
      desc = `Freshly baked cakes and gourmet cookies delivered directly to your doorstep in ${areaSlug?.replace(/-/g, " ")}. Order online now!`;
    }

    // Update document head elements
    document.title = title;

    // Update or create meta description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", desc);

    // Update or create canonical link
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", currentUrl);

    // OpenGraph tags
    const ogTags = [
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: currentUrl },
      { property: "og:image", content: image },
      { property: "og:type", content: "website" },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: title },
      { property: "twitter:description", content: desc },
      { property: "twitter:image", content: image }
    ];

    ogTags.forEach((tag) => {
      let el = document.querySelector(`meta[property='${tag.property}'], meta[name='${tag.property}']`);
      if (!el) {
        el = document.createElement("meta");
        if (tag.property.startsWith("twitter:")) {
          el.setAttribute("name", tag.property);
        } else {
          el.setAttribute("property", tag.property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", tag.content);
    });

    // Remove previous dynamic JSON-LD scripts
    document.querySelectorAll("script.dynamic-seo-schema").forEach((el) => el.remove());

    // Inject JSON-LD schema graphs
    schemaList.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.className = "dynamic-seo-schema";
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [pathname, products]);

  return null;
}
