# CakeUrban — Visual-First Declutter & End-to-End Mobile UI Plan

## 1. Goal & Context
Make **CakeUrban** fast to scan, visual-first, and effortless on both mobile and desktop by removing walls of text, keeping only high-converting sections on the Home page, simplifying Product Cards across all grids, and tucking secondary copy behind clean collapsible accordions.

---

## 2. Planned Changes

### A. Home Page Streamlining (`src/pages/home.tsx`)
- **Keep Only Core Sections**:
  1. **Hero Section**: Punchy 1-line subtitle (under 15 words), clean CTA buttons (`Shop Now`, `Customizer`, `Track Order`), compact trust stats, and desktop-only `HeroRing` carousel.
  2. **Visual Categories ("Pick Your Craving")**: Clean image tiles showing category title only (remove long subcategory lists on cards).
  3. **Product Showcases**: Signature Selection (`Fresh From The Oven`), Cookies & Namkeens, and Celebration Gift Hampers with 2-column mobile grid and horizontal swipe reel toggle.
  4. **Customer Photo Reviews (`CustomerReviewsShowcase`)**: Unboxing photo strip + concise review cards (clamped to 2 lines with full view in photo modal).
- **Remove Wordy Clutter**: Remove the verbose "Explore More CakeUrban Experiences" text blocks, inline "NCR Express Hubs" text cards (already accessible via the top Hub Selector modal & Footer), "Bakehouse Standard" essay section, Home FAQ wall, and Blog Journal teaser from the Home page.

### B. Minimalist Product Cards (`src/components/product.tsx`)
- **Show Only**:
  - Product Photo + concise top badge (`BESTSELLER` / `NEW`) + Wishlist heart icon
  - Product Name (clean 1–2 line title)
  - Star Rating (`★ 4.9`)
  - Price (`₹...`) + **Add (`+ Add`)** button
- **Remove from Cards**: Brand subtitle, category label, multi-line description, color swatch dots, and low-stock warning text so mobile 2-column grids look crisp, balanced, and spacious.

### C. Collapsible Product Page & Clean Checkout (`src/pages/product.tsx`, `src/pages/checkout.tsx`, `src/components/DeliverySlotPicker.tsx`)
- **Product Detail Page**:
  - Above the fold: Photo gallery, title, rating, price, size/variant selector, `Add to Cart` / `Buy Now` buttons, and compact Delivery Slot Picker.
  - Move the **Product Description**, **Ingredients & Specifications**, **100% Eggless Promise**, and **Express Delivery Info** inside clean collapsible accordion tabs (closed by default so there is zero text clutter above the fold).
- **Delivery Slot Picker & Checkout**:
  - Make the Delivery Slot Picker compact on mobile (2x2 slot pills, collapsible optional cake plaque message toggle instead of an always-open text box).
  - Remove unnecessary explanatory paragraphs on the Checkout, Shop, Builder, Track Order, and Footer views.

### D. End-to-End Mobile UI Polish (`src/components/chrome.tsx`, `src/pages/shop.tsx`, `src/pages/builder.tsx`, `src/pages/other.tsx`)
- Trim the Footer bio and remove duplicate SEO link walls at the bottom of the footer.
- Ensure all horizontal tab bars, modals, cart drawer, and bottom mobile navigation bar have zero text overflow or overlapping elements on 360px–430px mobile screens.

---

## 3. Verification Plan
1. Run `lint_applet` and `compile_applet` to ensure zero TypeScript or build errors.
2. Verify all routes (`/`, `/shop`, `/product/:id`, `/builder`, `/checkout`, `/track`, `/account`, `/delivery-locations`) render cleanly on mobile and desktop viewports.
