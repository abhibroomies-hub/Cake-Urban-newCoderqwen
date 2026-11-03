# Full-Width Desktop Layout & Expanded Grid Plan

A comprehensive responsive layout upgrade for **CakeUrban** that removes wide horizontal margins on desktop screens, fits all pages edge-to-edge with slim breathing padding, and scales product and custom cake grids up to 5–6 columns on large desktop displays.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed User Decisions**
> - **Full-Width Scope**: Expand the desktop layout to full screen width across **all pages** (Top Delivery Bar, Header, Hero, Home sections, Custom Cakes Builder, Shop Catalog, Product Detail, NCR Local Hubs, Checkout, and Footer) with slim edge padding rather than restricting containers to `1280px` (`max-w-7xl`).
> - **Desktop Grid Density**: Scale product and custom cake grids up to **5–6 columns** on large and ultra-wide desktop monitors (`xl:grid-cols-5 2xl:grid-cols-6`) so cards remain well-proportioned across the full viewport width.

---

## 1. Overview & Core Concept

Currently, the application wraps major sections in fixed `max-w-7xl mx-auto` (`1280px`) containers, leaving wide empty dark margins on the left and right edges on `1440px`, `1600px`, and `1920px+` desktop displays. This update transitions CakeUrban to a **fluid full-viewport desktop layout** where navigation, hero showcases, category grids, custom cake inspiration galleries, and shop catalogs span edge-to-edge with consistent, slim horizontal padding (`16px` on mobile/tablet up to `24px–32px` on wide desktop screens).

---

## 2. User Experience & Visual Design

- **Edge-to-Edge Desktop Canvas**:
  - The top utility bar, sticky main header, hero split showcase, and footer stretch cleanly across the full desktop width with slim left/right padding (`px-3.5 sm:px-5 lg:px-6 xl:px-8`), eliminating wasted side gutters.
  - In the Hero section, the left typographic column and right 3D rotating showcase distribute smoothly across the full viewport width while keeping headline proportions balanced.
- **High-Density 5–6 Column Grids on Large Screens**:
  - **Categories ("Pick Your Craving")**: Scales smoothly across the full width so category cards fill the row without dead space.
  - **Custom Cake Theme Cards & Inspiration Gallery**: Scales from 2 columns on mobile to 4 columns on standard laptops, 5 columns on `xl` (`1280px+`), and 6 columns on `2xl` (`1536px+`) screens.
  - **Bestsellers, Hampers & Full Shop Catalog**: Product grids expand to 5–6 columns on wide desktop viewports while preserving uniform card aspect ratios, clean typography, and quick-add interactions.

---

## 3. Key Product Decisions & Trade-Offs

- **Fluid Containers vs. Readability Constraints**:
  - **Decision**: All multi-column layouts, navigation bars, hero banners, and card galleries expand to `100%` viewport width (`w-full max-w-full`), while narrow form modals or focused text blocks retain comfortable internal spacing so lines of text remain easy to read.
  - **Rationale**: E-commerce storefronts and visual cake galleries benefit from maximum horizontal screen real estate, whereas form inputs remain ergonomic when grouped cleanly within the full-width layout.
- **Responsive Column Progression (`2 -> 3 -> 4 -> 5 -> 6`)**:
  - **Decision**: Use progressive breakpoints (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`) rather than stretching 4 cards across a `1920px` screen.
  - **Rationale**: Prevents product and custom cake cards from becoming overly tall or oversized on wide monitors, allowing customers to browse more designs at a glance without excessive vertical scrolling.

---

## 4. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   Full-Viewport Desktop Container Layer                  │
│          (w-full max-w-full + px-3.5 sm:px-5 lg:px-6 xl:px-8)            │
└───────────────────┬──────────────────────────────────┬───────────────────┘
                    │                                  │
                    ▼                                  ▼
┌───────────────────────────────────────┐  ┌───────────────────────────────┐
│        Global Chrome & Hero           │  │   Dynamic Responsive Grids    │
│  • Top Dispatch Bar & Sticky Header   │  │  • Mobile: 2 cols             │
│  • Full-Bleed Split Hero & 3D Deck    │  │  • Tablet/Laptop: 3–4 cols    │
│  • Edge-to-Edge Footer & SEO Directory│  │  • Desktop (xl/2xl): 5–6 cols │
└───────────────────────────────────────┘  └───────────────────────────────┘
```

- **Global & Component Container Normalization**:
  - Override restrictive desktop container caps in the global stylesheet and update layout wrappers across Header, Home, Custom Cake Builder, Shop, Product Detail, NCR Local SEO pages, and Footer to use full viewport width (`w-full max-w-none`) with slim edge padding.
- **Grid Breakpoint Expansion**:
  - Upgrade product, category, and custom cake pin grids across the Home page, Shop page, and Custom Cake Builder to include `xl:grid-cols-5` and `2xl:grid-cols-6` column rules with balanced grid gaps (`gap-3.5 sm:gap-5 lg:gap-6`).
