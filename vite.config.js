import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { buildSitemapByType } from "./api/sitemap.js";
import { buildMerchantFeedXml } from "./api/merchant-feed.js";

function cakeUrbanSitemapPlugin() {
  const SITEMAP_TYPES = [
    "main",
    "faridabad",
    "gurgaon",
    "noida",
    "delhi",
    "ghaziabad",
    "occasions",
    "videos",
  ];

  return {
    name: "cakeurban-sitemap-plugin",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = (req.url || "").split("?")[0];
        if (urlPath === "/merchant-feed.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(buildMerchantFeedXml("https://www.cakeurban.com"));
          return;
        }
        if (urlPath === "/sitemap.xml" || urlPath === "/sitemap-main.xml") {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(buildSitemapByType("main"));
          return;
        }
        const match = urlPath.match(/^\/sitemap-([a-z0-9-]+)\.xml$/i);
        if (match) {
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(buildSitemapByType(match[1]));
          return;
        }
        next();
      });
    },
    closeBundle() {
      try {
        const distDir = path.resolve(process.cwd(), "dist");
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }
        const today = new Date().toISOString().split("T")[0];
        const mainXml = buildSitemapByType("main", "https://www.cakeurban.com", today);
        fs.writeFileSync(path.join(distDir, "sitemap.xml"), mainXml, "utf-8");
        fs.writeFileSync(path.join(distDir, "sitemap-main.xml"), mainXml, "utf-8");

        for (const t of SITEMAP_TYPES) {
          if (t === "main") continue;
          const xml = buildSitemapByType(t, "https://www.cakeurban.com", today);
          fs.writeFileSync(path.join(distDir, `sitemap-${t}.xml`), xml, "utf-8");
        }

        const merchantXml = buildMerchantFeedXml("https://www.cakeurban.com");
        fs.writeFileSync(path.join(distDir, "merchant-feed.xml"), merchantXml, "utf-8");
      } catch (err) {
        console.error("Sitemap build generation warning:", err);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cakeUrbanSitemapPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    hmr: false,
  },
});
