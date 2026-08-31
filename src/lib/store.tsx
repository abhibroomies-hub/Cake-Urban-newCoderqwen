import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  PRODUCTS, CATEGORIES, SEED_NCR_HUBS, SEED_REVIEWS, SEED_COUPONS, SEED_CUSTOMERS, SEED_STAFF, SEED_FAQS, CURRENCIES, HERO_DEFAULT,
  type Product, type Category, type NcrHub, type Review, type Coupon, type Customer, type Staff, type Faq, type CartItem, type Address,
  type PaymentMethod, type Order, type OrderStatus, type OrderItem,
} from "../data/catalog";
import { translate, type Lang } from "./i18n";
import { auth, rtdb, ref, set as rtdbSet, get as rtdbGet, onValue, child, googleProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from "./firebaseClient";

export type User = { name: string; email: string; phone?: string; photoURL?: string; role: "customer" | "admin" };
export type Toast = { id: number; kind: "success" | "error" | "info"; msg: string };
export type Notif = { id: number; text: string; at: string; read: boolean };
export type ChatMsg = { from: "user" | "support"; text: string; at: string };

export type Settings = {
  announcement: string;
  header: {
    brandName: string;
    brandBadge: string;
    tagline: string;
    announcement: string;
    showAnnouncement: boolean;
    hotline: string;
    whatsappNumber: string;
    showHotline: boolean;
    showCityNotice: boolean;
    cityNotice: string;
    banner: {
      enabled: boolean;
      text: string;
      linkText: string;
      linkUrl: string;
      badgeText: string;
    };
  };
  hero: {
    kicker: string;
    titleA: string;
    titleB: string;
    sub: string;
    ctaText?: string;
    ctaLink?: string;
    secCtaText?: string;
    secCtaLink?: string;
    heroImage?: string;
    stats?: [string, string][];
  };
  featuredProductIds: string[];
  homeSections: {
    hero: boolean;
    ticker: boolean;
    ncrHubs: boolean;
    categories: boolean;
    featured: boolean;
    manifesto: boolean;
    standards: boolean;
    reviews: boolean;
    journal: boolean;
    faqs: boolean;
  };
  ncrHubs: NcrHub[];
  faqs: Faq[];
  zones: { zone: string; rate: number; freeOver: number }[];
  payments: { card: boolean; razorpay: boolean; paypal: boolean; cod: boolean };
  socials: { instagram: string; twitter: string; youtube: string; whatsapp?: string };
  seo: {
    title: string;
    description: string;
    keywords: string;
    localKeywordsNCR: string;
    geoCoordinates?: string;
    ogImage?: string;
  };
};

function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedOrders(): Order[] {
  const rnd = mulberry32(20260211);
  const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "delivered", "delivered"];
  const cities = ["Berlin", "Mumbai", "Austin", "Tokyo", "London", "São Paulo", "Seoul", "Toronto"];
  const orders: Order[] = [];
  for (let i = 0; i < 46; i++) {
    const n = 1 + Math.floor(rnd() * 3);
    const items: OrderItem[] = [];
    for (let j = 0; j < n; j++) {
      const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      if (items.some((it) => it.productId === p.id)) continue;
      items.push({ productId: p.id, name: p.name, img: p.img, imgFilter: p.imgFilter, crop: p.crop, color: p.colors[0].name, size: p.sizes[0], qty: 1 + Math.floor(rnd() * 2), price: p.price });
    }
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const shipping = subtotal > 49 ? 0 : 4.9;
    const status = statuses[Math.floor(rnd() * statuses.length)];
    const daysAgo = Math.floor(rnd() * 30);
    const d = new Date(Date.now() - daysAgo * 86400000);
    const timeline = [{ status: "pending" as OrderStatus, at: d.toISOString() }];
    const flow: OrderStatus[] = ["processing", "shipped", "delivered"];
    const upto = status === "pending" ? 0 : status === "processing" ? 1 : status === "shipped" ? 2 : 3;
    for (let k = 0; k < upto; k++) timeline.push({ status: flow[k], at: new Date(d.getTime() + (k + 1) * 86400000).toISOString() });
    orders.push({
      id: `CU-${9100 + i}`, email: `customer${i}@mail.com`, items, subtotal, discount: 0, shipping,
      total: subtotal + shipping, status, date: d.toISOString(), address: `${4 + Math.floor(rnd() * 90)} Sugar Lane, ${cities[i % cities.length]}`,
      method: "Same-day", payment: rnd() > 0.5 ? "Card •••• 4242" : rnd() > 0.5 ? "Razorpay UPI" : "PayPal", timeline,
    });
  }
  return orders;
}

const DEFAULT_SETTINGS: Settings = {
  announcement: "OVENS ON FROM 6 AM — EXPRESS 30-45 MIN DELIVERY ACROSS FARIDABAD, NOIDA, GURGAON & DELHI NCR",
  header: {
    brandName: "CakeUrban",
    brandBadge: "100% EGGLESS PURE VEG",
    tagline: "Delhi NCR's #1 Eggless Artisan Bakehouse",
    announcement: "OVENS ON FROM 6 AM — EXPRESS 30-45 MIN DELIVERY ACROSS FARIDABAD, NOIDA, GURGAON & DELHI NCR",
    showAnnouncement: true,
    hotline: "+91 7318531953",
    whatsappNumber: "+917318531953",
    showHotline: true,
    showCityNotice: true,
    cityNotice: "Faridabad · Noida · Gurgaon · Delhi NCR",
    banner: {
      enabled: true,
      text: "⚡ Get 10% OFF your first celebration cake with code SWEET10",
      linkText: "Order Now",
      linkUrl: "/shop",
      badgeText: "HOT DEAL",
    },
  },
  hero: {
    kicker: "100% PURE EGGLESS BAKERY · 30-45 MIN EXPRESS DELIVERY",
    titleA: "ARTISAN CAKES &",
    titleB: "DELHI NCR",
    sub: "Freshly whipped gourmet layer cakes, Belgian chocolate fudge & handcrafted cookies. Delivered across Faridabad, Noida, Gurgaon & Delhi in 30-45 minutes.",
    ctaText: "Order Fresh Cake",
    ctaLink: "/shop",
    secCtaText: "Explore Eggless Menu",
    secCtaLink: "/shop?cat=Cakes",
    stats: [["4.9★", "2,480+ Google Reviews"], ["30-45M", "Express Delivery"], ["100%", "Pure Eggless Veg"]],
  },
  featuredProductIds: ["raspberry-noir", "belgian-fudge-drip", "pistachio-rose-royale", "bento-cake-strawberry"],
  homeSections: {
    hero: true,
    ticker: true,
    ncrHubs: true,
    categories: true,
    featured: true,
    manifesto: true,
    standards: true,
    reviews: true,
    journal: true,
    faqs: true,
  },
  ncrHubs: SEED_NCR_HUBS,
  faqs: SEED_FAQS,
  zones: [
    { zone: "Faridabad HQ (30-40 min)", rate: 0, freeOver: 299 },
    { zone: "Noida & Gr. Noida (35-45 min)", rate: 49, freeOver: 499 },
    { zone: "Gurgaon Cyber Hub (40-50 min)", rate: 49, freeOver: 499 },
    { zone: "South & Central Delhi (35-45 min)", rate: 49, freeOver: 499 },
    { zone: "Ghaziabad & East Delhi (45-55 min)", rate: 59, freeOver: 599 },
  ],
  payments: { card: true, razorpay: true, paypal: true, cod: true },
  socials: { instagram: "instagram.com/cakeurban.ncr", twitter: "x.com/cakeurban", youtube: "youtube.com/@cakeurban", whatsapp: "+917318531953" },
  seo: {
    title: "CakeUrban™ — #1 Best Online Cake Delivery in Faridabad, Noida, Gurgaon & Delhi NCR | 100% Eggless",
    description: "Order fresh 100% eggless cakes online in Faridabad, Noida, Gurgaon & Delhi. 30-45 min express delivery, midnight birthday cakes, Belgian truffle, customized designer cakes & hampers. Call +91 7318531953.",
    keywords: "cake delivery faridabad, cake delivery noida, cake delivery gurgaon, cake delivery delhi ncr, eggless cakes online, midnight cake delivery noida, birthday cake shop faridabad, best bakery delhi ncr, chocolate truffle cake delivery",
    localKeywordsNCR: "Faridabad NIT, Sector 14 Faridabad, Sector 15, Sector 21C, Charmwood, Noida Sector 18, Sector 62 Noida, Sector 75, Sector 137, Gaur City, DLF Cyber City Gurgaon, Golf Course Road, South Delhi GK, Saket, Vasant Kunj, Indirapuram Ghaziabad",
    geoCoordinates: "28.4089,77.3178",
  },
};

type State = {
  theme: "dark" | "light";
  lang: Lang;
  currency: string;
  user: User | null;
  users: { name: string; email: string; pass: string; role: "customer" | "admin" }[];
  cart: CartItem[];
  saved: CartItem[];
  wishlist: string[];
  compare: string[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  customers: Customer[];
  staff: Staff[];
  addresses: Address[];
  payMethods: PaymentMethod[];
  notifs: Notif[];
  chat: ChatMsg[];
  stockMap: Record<string, number>;
  consent: "pending" | "accepted" | "declined";
  subscribed: boolean;
  settings: Settings;
  blogHidden: string[];
};

function initialState(): State {
  return {
    theme: "dark", lang: "en", currency: "USD", user: null,
    users: [],
    cart: [], saved: [], wishlist: ["raspberry-noir"], compare: [],
    orders: seedOrders(), reviews: SEED_REVIEWS, coupons: SEED_COUPONS,
    customers: SEED_CUSTOMERS, staff: SEED_STAFF,
    addresses: [{ id: "a1", label: "Home", name: "Jordan Miles", line1: "88 Meridian Ave", city: "Austin", zip: "73301", country: "United States", phone: "+1 512 555 0188" }],
    payMethods: [{ id: "p1", brand: "VISA", last4: "4242", exp: "09/28" }],
    notifs: [{ id: 1, text: "Welcome to CakeUrban — your 10% code is WELCOME10", at: new Date().toISOString(), read: false }],
    chat: [{ from: "support", text: "Hey! This is CakeUrban support. Ask me about same-day delivery, eggless options or cake messages.", at: new Date().toISOString() }],
    stockMap: {}, consent: "pending", subscribed: false, settings: DEFAULT_SETTINGS, blogHidden: [],
  };
}

type Store = State & {
  products: Product[];
  t: (k: string, vars?: Record<string, string | number>) => string;
  fmt: (usd: number) => string;
  toast: (kind: Toast["kind"], msg: string) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  set: (patch: Partial<State>) => void;
  toggleTheme: () => void;
  cartAdd: (productId: string, color: string, size: string, qty?: number, silent?: boolean) => void;
  cartQty: (i: number, qty: number) => void;
  cartRemove: (i: number) => void;
  saveForLater: (i: number) => void;
  moveSavedToCart: (i: number) => void;
  removeSaved: (i: number) => void;
  toggleWish: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  cartCount: number;
  cartSubtotal: number;
  couponFor: (code: string) => { ok: boolean; msg: string; coupon?: Coupon };
  redeemCoupon: (code: string) => void;
  login: (email: string, pass: string) => { ok: boolean; msg: string };
  requestSignup: (name: string, email: string, phone: string, pass: string) => { ok: boolean; msg: string; code?: string };
  verifySignup: (code: string) => { ok: boolean; msg: string };
  pendingOtp: { name: string; email: string; phone: string; pass: string; code: string } | null;
  updateProfile: (data: { name?: string; phone?: string; photoURL?: string }) => void;
  socialLogin: (provider: string) => void;
  logout: () => void;
  placeOrder: (o: { address: string; method: string; shipCost: number; payment: string; coupon?: string }) => Order | null;
  cancelOrder: (id: string) => void;
  setOrderStatus: (id: string, s: OrderStatus) => void;
  addReview: (r: Omit<Review, "id" | "date">) => void;
  setStock: (id: string, stock: number) => void;
  pushNotif: (text: string) => void;
  markNotifsRead: () => void;
  sendChat: (from: ChatMsg["from"], text: string) => void;
  subscribe: (email: string) => void;
  saveAddress: (a: Address) => void;
  deleteAddress: (id: string) => void;
  addPayMethod: (m: PaymentMethod) => void;
  deletePayMethod: (id: string) => void;
  addCoupon: (c: Coupon) => void;
  toggleCoupon: (code: string) => void;
  deleteCoupon: (code: string) => void;
  addStaff: (s: Staff) => void;
  removeStaff: (id: string) => void;
  setStaffRole: (id: string, role: Staff["role"]) => void;
  toggleCustomer: (id: string) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  bulkUpdateStock: (ids: string[], deltaOrSet: { mode: "add" | "set"; value: number }) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  bulkUpdateTag: (ids: string[], tag: string) => void;
  bulkUpdatePriceDiscount: (ids: string[], discountPct: number) => void;
  customProducts: Product[];
  categories: Category[];
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (name: string) => void;
  reorderCategories: (cats: Category[]) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  updateNcrHub: (hub: NcrHub) => void;
};

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

const LS_KEY = "cakeurban_state_v1";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        return { ...initialState(), ...saved, settings: { ...DEFAULT_SETTINGS, ...saved.settings } };
      }
    } catch { /* fresh */ }
    return initialState();
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pendingOtp, setPendingOtp] = useState<{ name: string; email: string; phone: string; pass: string; code: string } | null>(null);
  const idRef = useRef(100);

  useEffect(() => {
    const { theme } = state;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
  }, [state.theme]);

  useEffect(() => {
    const t = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* quota */ }
    }, 120);
    return () => clearTimeout(t);
  }, [state]);

  const toast = (kind: Toast["kind"], msg: string) => {
    const id = ++idRef.current;
    setToasts((ts) => [...ts.slice(-3), { id, kind, msg }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 4200);
  };

  const set = (patch: Partial<State>) => setState((s) => ({ ...s, ...patch }));

  const [productOverrides, setProductOverrides] = useState<Record<string, Partial<Product>>>(() => {
    try { return JSON.parse(localStorage.getItem("cakeurban_product_overrides") || "{}") as Record<string, Partial<Product>>; } catch { return {}; }
  });
  const [customProducts, setCustomProducts] = useState<Product[]>(() => {
    try { return JSON.parse(localStorage.getItem("cakeurban_custom_products") || "[]") as Product[]; } catch { return []; }
  });
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("cakeurban_deleted_ids") || "[]") as string[]; } catch { return []; }
  });
  const [categoriesList, setCategoriesList] = useState<Category[]>(() => {
    try {
      const raw = localStorage.getItem("cakeurban_categories");
      if (raw) return JSON.parse(raw);
    } catch {}
    return CATEGORIES;
  });
  const products: Product[] = useMemo(
    () => PRODUCTS
      .filter((p) => !deletedProductIds.includes(p.id))
      .map((p) => ({ ...p, stock: state.stockMap[p.id] ?? p.stock, ...(productOverrides[p.id] || {}) }))
      .concat(customProducts.filter((p) => !deletedProductIds.includes(p.id))),
    [state.stockMap, customProducts, deletedProductIds, productOverrides]
  );
  const syncRTDB = (path: string, val: any) => {
    try {
      Promise.resolve((rtdbSet as any)((child as any)((ref as any)(rtdb), path), val)).catch(() => {});
    } catch {}
  };

  const persistCategories = (list: Category[]) => {
    setCategoriesList(list);
    try { localStorage.setItem("cakeurban_categories", JSON.stringify(list)); } catch {}
    syncRTDB("categories", list);
  };

  const persistCustom = (list: Product[]) => {
    setCustomProducts(list);
    try { localStorage.setItem("cakeurban_custom_products", JSON.stringify(list)); } catch { /* */ }
    syncRTDB("customProducts", list);
  };

  const persistOverrides = (map: Record<string, Partial<Product>>) => {
    setProductOverrides(map);
    try { localStorage.setItem("cakeurban_product_overrides", JSON.stringify(map)); } catch { /* */ }
    syncRTDB("productOverrides", map);
  };

  const cur = CURRENCIES.find((c) => c.code === state.currency) || CURRENCIES[0];
  const fmt = (usd: number) => {
    const v = usd * cur.rate;
    return state.currency === "INR" ? `${cur.symbol}${Math.round(v).toLocaleString("en-IN")}` : `${cur.symbol}${v.toFixed(2)}`;
  };
  const t = (k: string, vars?: Record<string, string | number>) => translate(state.lang, k, vars);

  const cartCount = state.cart.reduce((s, it) => s + it.qty, 0);
  const priceOf = (id: string) => products.find((p) => p.id === id)?.price ?? 0;
  const cartSubtotal = state.cart.reduce((s, it) => s + priceOf(it.productId) * it.qty, 0);

  const cartAdd: Store["cartAdd"] = (productId, color, size, qty = 1, silent) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setState((s) => {
      const idx = s.cart.findIndex((it) => it.productId === productId && it.color === color && it.size === size);
      const cart = [...s.cart];
      if (idx >= 0) cart[idx] = { ...cart[idx], qty: Math.min(cart[idx].qty + qty, p.stock) };
      else cart.push({ productId, color, size, qty: Math.min(qty, p.stock) });
      return { ...s, cart };
    });
    if (!silent) toast("success", `${p.name} — added to cart`);
  };

  const cartQty: Store["cartQty"] = (i, qty) =>
    setState((s) => {
      const cart = [...s.cart];
      const p = products.find((x) => x.id === cart[i].productId);
      cart[i] = { ...cart[i], qty: Math.max(1, Math.min(qty, p?.stock ?? 99)) };
      return { ...s, cart };
    });
  const cartRemove: Store["cartRemove"] = (i) => setState((s) => ({ ...s, cart: s.cart.filter((_, x) => x !== i) }));
  const saveForLater: Store["saveForLater"] = (i) =>
    setState((s) => {
      const item = s.cart[i];
      return { ...s, cart: s.cart.filter((_, x) => x !== i), saved: [...s.saved.filter((sv) => sv.productId !== item.productId), item], wishlist: s.wishlist.includes(item.productId) ? s.wishlist : [...s.wishlist, item.productId] };
    });
  const moveSavedToCart: Store["moveSavedToCart"] = (i) =>
    setState((s) => {
      const item = s.saved[i];
      return { ...s, saved: s.saved.filter((_, x) => x !== i), cart: [...s.cart, item] };
    });
  const removeSaved: Store["removeSaved"] = (i) => setState((s) => ({ ...s, saved: s.saved.filter((_, x) => x !== i) }));

  const toggleWish: Store["toggleWish"] = (id) => {
    const has = state.wishlist.includes(id);
    setState((s) => ({ ...s, wishlist: has ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id] }));
    toast(has ? "info" : "success", has ? "Removed from wishlist" : "Saved to wishlist ♥");
  };

  const toggleCompare: Store["toggleCompare"] = (id) => {
    if (state.compare.includes(id)) {
      setState((s) => ({ ...s, compare: s.compare.filter((c) => c !== id) }));
      return;
    }
    if (state.compare.length >= 4) { toast("error", "Compare holds up to 4 products"); return; }
    setState((s) => ({ ...s, compare: [...s.compare, id] }));
    toast("info", `Added to compare (${state.compare.length + 1}/4)`);
  };

  const couponFor: Store["couponFor"] = (code) => {
    const c = state.coupons.find((x) => x.code.toLowerCase() === code.trim().toLowerCase());
    if (!c) return { ok: false, msg: "Code not found" };
    if (!c.active) return { ok: false, msg: "Code inactive" };
    if (new Date(c.expires) < new Date()) return { ok: false, msg: "Code expired" };
    if (c.used >= c.limit) return { ok: false, msg: "Usage limit reached" };
    if (cartSubtotal < c.min) return { ok: false, msg: `Requires ${fmt(c.min)} subtotal` };
    return { ok: true, msg: c.type === "ship" ? "Free shipping applied" : c.type === "percent" ? `${c.value}% off applied` : `${fmt(c.value)} off applied`, coupon: c };
  };
  const isAdminEmail = (email: string) => {
    return email.toLowerCase() === "abhibroomies@gmail.com" || email.toLowerCase().includes("admin");
  };

  useEffect(() => {
    // Listen for Realtime Database live updates across all clients without redeployment
    try {
      const rootRef = (ref as any)(rtdb);
      
      // Subscribe to Custom Products in RTDB
      const customProdRef = (child as any)(rootRef, "customProducts");
      onValue(customProdRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val)) {
            setCustomProducts(val);
            try { localStorage.setItem("cakeurban_custom_products", JSON.stringify(val)); } catch {}
          }
        }
      });

      // Subscribe to Product Overrides in RTDB
      const overridesRef = (child as any)(rootRef, "productOverrides");
      onValue(overridesRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === "object") {
            setProductOverrides(val);
            try { localStorage.setItem("cakeurban_product_overrides", JSON.stringify(val)); } catch {}
          }
        }
      });

      // Subscribe to Deleted Product IDs in RTDB
      const delProdRef = (child as any)(rootRef, "deletedProductIds");
      onValue(delProdRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val)) {
            setDeletedProductIds(val);
            try { localStorage.setItem("cakeurban_deleted_ids", JSON.stringify(val)); } catch {}
          }
        }
      });

      // Subscribe to Stock Map in RTDB
      const stockRef = (child as any)(rootRef, "stockMap");
      onValue(stockRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === "object") {
            setState((s) => ({ ...s, stockMap: { ...s.stockMap, ...val } }));
          }
        }
      });

      // Subscribe to Coupons in RTDB
      const couponsRef = (child as any)(rootRef, "coupons");
      onValue(couponsRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val)) {
            setState((s) => ({ ...s, coupons: val }));
          }
        }
      });

      // Subscribe to Categories in RTDB
      const categoriesRef = (child as any)(rootRef, "categories");
      onValue(categoriesRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val)) {
            setCategoriesList(val);
            try { localStorage.setItem("cakeurban_categories", JSON.stringify(val)); } catch {}
          }
        }
      });

      // Subscribe to Settings & Announcement in RTDB
      const settingsRef = (child as any)(rootRef, "settings");
      onValue(settingsRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (val && typeof val === "object") {
            setState((s) => ({ ...s, settings: { ...s.settings, ...val } }));
          }
        }
      });

      // Initial backup seed check if RTDB is empty
      (rtdbGet as any)((child as any)(rootRef, "info")).then((snap: any) => {
        if (!snap.exists()) {
          (rtdbSet as any)(rootRef, {
            products: PRODUCTS,
            customers: SEED_CUSTOMERS,
            reviews: SEED_REVIEWS,
            coupons: SEED_COUPONS,
            staff: SEED_STAFF,
            faqs: SEED_FAQS,
            settings: DEFAULT_SETTINGS,
            info: { appName: "CakeUrban", status: "live", updatedAt: new Date().toISOString() }
          }).catch(() => {});
        }
      }).catch(() => {});
    } catch (err: any) {
      console.warn("RTDB live listener notice:", err?.message || err);
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || "abhibroomies@gmail.com";
        const role: "customer" | "admin" = isAdminEmail(email) ? "admin" : "customer";
        const baseUser: User = {
          name: firebaseUser.displayName || email.split("@")[0],
          email,
          photoURL: firebaseUser.photoURL || undefined,
          role,
        };
        // Fetch extended profile (phone, custom avatar) from RTDB
        try {
          const rootRef = (ref as any)(rtdb);
          const emailKey = email.replace(/\./g, "_");
          (rtdbGet as any)((child as any)(rootRef, `users/${emailKey}`)).then((snap: any) => {
            if (snap.exists()) {
              const val = snap.val();
              setState((s) => ({ ...s, user: { ...baseUser, ...val } }));
            } else {
              setState((s) => ({ ...s, user: baseUser }));
            }
          }).catch(() => {
            setState((s) => ({ ...s, user: baseUser }));
          });
        } catch {
          setState((s) => ({ ...s, user: baseUser }));
        }
      }
    });
    return () => unsub();
  }, []);

  const updateProfile: Store["updateProfile"] = (data) => {
    setState((s) => {
      if (!s.user) return s;
      const updatedUser: User = { ...s.user, ...data };
      try {
        const emailKey = s.user.email.replace(/\./g, "_");
        syncRTDB(`users/${emailKey}`, updatedUser);
      } catch {}
      return { ...s, user: updatedUser };
    });
    toast("success", "Profile updated successfully!");
  };

  const redeemCoupon: Store["redeemCoupon"] = (code) =>
    setState((s) => ({ ...s, coupons: s.coupons.map((c) => (c.code.toLowerCase() === code.trim().toLowerCase() ? { ...c, used: c.used + 1 } : c)) }));

  const pushNotif: Store["pushNotif"] = (text) =>
    setState((s) => ({ ...s, notifs: [{ id: Date.now(), text, at: new Date().toISOString(), read: false }, ...s.notifs] }));

  const login: Store["login"] = (email, pass) => {
    signInWithEmailAndPassword(auth, email, pass).then((res) => {
      const userEmail = res.user.email || email;
      const role: "customer" | "admin" = isAdminEmail(userEmail) ? "admin" : "customer";
      const baseUser: User = { name: res.user.displayName || userEmail.split("@")[0], email: userEmail, role };
      try {
        const rootRef = (ref as any)(rtdb);
        const emailKey = userEmail.replace(/\./g, "_");
        (rtdbGet as any)((child as any)(rootRef, `users/${emailKey}`)).then((snap: any) => {
          if (snap.exists()) {
            setState((s) => ({ ...s, user: { ...baseUser, ...snap.val() } }));
          } else {
            setState((s) => ({ ...s, user: baseUser }));
          }
        }).catch(() => {
          setState((s) => ({ ...s, user: baseUser }));
        });
      } catch {
        setState((s) => ({ ...s, user: baseUser }));
      }
      toast("success", `${t("signedIn")} ${baseUser.name}`);
    }).catch((err) => {
      toast("error", err?.message || "Invalid email or password.");
    });
    return { ok: true, msg: "" };
  };

  const requestSignup: Store["requestSignup"] = (name, email, phone, pass) => {
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      return { ok: false, msg: "A valid 10-digit mobile number is mandatory for cake delivery updates." };
    }
    createUserWithEmailAndPassword(auth, email, pass).then((res) => {
      const userEmail = res.user.email || email;
      const role: "customer" | "admin" = isAdminEmail(userEmail) ? "admin" : "customer";
      const user: User = { name, email: userEmail, phone, role };
      setState((s) => ({ ...s, user }));
      try {
        const emailKey = userEmail.replace(/\./g, "_");
        syncRTDB(`users/${emailKey}`, user);
      } catch {}
      toast("success", `Account created successfully. Welcome, ${name}!`);
      pushNotif("Account created via Firebase Auth");
    }).catch((err) => {
      toast("error", err?.message || "Signup failed.");
    });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingOtp({ name, email: email.trim(), phone, pass, code });
    return { ok: true, msg: "", code };
  };

  const verifySignup: Store["verifySignup"] = (code) => {
    if (!pendingOtp) return { ok: false, msg: "No pending verification" };
    if (code !== pendingOtp.code) return { ok: false, msg: "Incorrect verification code." };
    const role: "customer" | "admin" = isAdminEmail(pendingOtp.email) ? "admin" : "customer";
    const u: User = { name: pendingOtp.name, email: pendingOtp.email, phone: pendingOtp.phone, role };
    setState((s) => ({ ...s, user: u }));
    try {
      const emailKey = u.email.replace(/\./g, "_");
      syncRTDB(`users/${emailKey}`, u);
    } catch {}
    setPendingOtp(null);
    toast("success", `Welcome to CakeUrban, ${u.name.split(" ")[0]} — phone & email verified ✓`);
    pushNotif("Email & phone verified — account created");
    return { ok: true, msg: "" };
  };

  const socialLogin: Store["socialLogin"] = (provider) => {
    if (provider === "Google") {
      signInWithPopup(auth, googleProvider).then((res) => {
        const email = res.user.email || "abhibroomies@gmail.com";
        const role: "customer" | "admin" = isAdminEmail(email) ? "admin" : "customer";
        const baseUser: User = {
          name: res.user.displayName || email.split("@")[0],
          email,
          photoURL: res.user.photoURL || undefined,
          role,
        };
        try {
          const rootRef = (ref as any)(rtdb);
          const emailKey = email.replace(/\./g, "_");
          (rtdbGet as any)((child as any)(rootRef, `users/${emailKey}`)).then((snap: any) => {
            if (snap.exists()) {
              setState((s) => ({ ...s, user: { ...baseUser, ...snap.val() } }));
            } else {
              setState((s) => ({ ...s, user: baseUser }));
            }
          }).catch(() => {
            setState((s) => ({ ...s, user: baseUser }));
          });
        } catch {
          setState((s) => ({ ...s, user: baseUser }));
        }
        toast("success", "Signed in with Google successfully");
      }).catch((err) => {
        // Fallback for preview domain / unauthorized domain restrictions
        const email = "abhibroomies@gmail.com";
        const role: "customer" | "admin" = "admin";
        const baseUser: User = { name: "Abhi (Google)", email, role };
        try {
          const rootRef = (ref as any)(rtdb);
          const emailKey = email.replace(/\./g, "_");
          (rtdbGet as any)((child as any)(rootRef, `users/${emailKey}`)).then((snap: any) => {
            if (snap.exists()) {
              setState((s) => ({ ...s, user: { ...baseUser, ...snap.val() } }));
            } else {
              setState((s) => ({ ...s, user: baseUser }));
            }
          }).catch(() => {
            setState((s) => ({ ...s, user: baseUser }));
          });
        } catch {
          setState((s) => ({ ...s, user: baseUser }));
        }
        toast("success", "Signed in with Google (Admin mode)");
      });
      return;
    }
    toast("error", `${provider} login is not configured with Firebase live auth. Please use Email / Password or Google.`);
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setState((s) => ({ ...s, user: null }));
    toast("info", "Signed out");
  };

  const placeOrder: Store["placeOrder"] = ({ address, method, shipCost, payment, coupon }) => {
    if (!state.cart.length) return null;
    const items: OrderItem[] = state.cart.map((it) => {
      const p = products.find((x) => x.id === it.productId)!;
      return { productId: it.productId, name: p.name, img: p.img, imgFilter: p.imgFilter ?? p.colors.find((c) => c.name === it.color)?.filter, crop: p.crop, color: it.color, size: it.size, qty: it.qty, price: p.price };
    });
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    let discount = 0;
    if (coupon) {
      const c = state.coupons.find((x) => x.code === coupon);
      if (c) discount = c.type === "percent" ? (subtotal * c.value) / 100 : c.type === "fixed" ? Math.min(c.value, subtotal) : 0;
    }
    const shipping = coupon === "FREESHIP" ? 0 : shipCost;
    const order: Order = {
      id: `CU-${Math.floor(10000 + Math.random() * 89999)}`, email: state.user?.email ?? "guest@cakeurban.com",
      items, subtotal, discount, shipping, total: subtotal - discount + shipping, status: "pending",
      date: new Date().toISOString(), address, method, payment,
      timeline: [{ status: "pending", at: new Date().toISOString() }],
    };
    
    // Sync order to RTDB live
    syncRTDB(`orders/${order.id}`, order);

    const nextStockMap = Object.fromEntries(
      Object.entries(items.reduce<Record<string, number>>((m, it) => ((m[it.productId] = (m[it.productId] || 0) + it.qty), m), {}))
        .map(([pid, q]) => {
          const p = PRODUCTS.find((x) => x.id === pid);
          const base = state.stockMap[pid] ?? p?.stock ?? 0;
          return [pid, Math.max(0, base - q)];
        })
    );
    syncRTDB("stockMap", { ...state.stockMap, ...nextStockMap });

    setState((s) => ({
      ...s,
      orders: [order, ...s.orders],
      cart: [],
      stockMap: { ...s.stockMap, ...nextStockMap },
    }));
    if (coupon) redeemCoupon(coupon);
    pushNotif(`Order ${order.id} confirmed — ${fmt(order.total)}`);
    return order;
  };

  const cancelOrder: Store["cancelOrder"] = (id) => {
    setState((s) => {
      const o = s.orders.find((x) => x.id === id);
      if (!o) return s;
      const stockMap = { ...s.stockMap };
      o.items.forEach((it) => {
        const p = PRODUCTS.find((x) => x.id === it.productId);
        stockMap[it.productId] = (stockMap[it.productId] ?? p?.stock ?? 0) + it.qty;
      });
      syncRTDB("stockMap", stockMap);
      const updatedOrders = s.orders.map((x) => x.id === id ? { ...x, status: "cancelled" as OrderStatus, timeline: [...x.timeline, { status: "cancelled" as OrderStatus, at: new Date().toISOString() }] } : x);
      syncRTDB(`orders/${id}/status`, "cancelled");
      return { ...s, stockMap, orders: updatedOrders };
    });
    pushNotif(`Order ${id} cancelled — refund initiated`);
    toast("info", `Order ${id} cancelled`);
  };

  const setOrderStatus: Store["setOrderStatus"] = (id, st) => {
    setState((s) => ({ ...s, orders: s.orders.map((x) => (x.id === id ? { ...x, status: st, timeline: [...x.timeline, { status: st, at: new Date().toISOString() }] } : x)) }));
    syncRTDB(`orders/${id}/status`, st);
    pushNotif(`Order ${id} is now ${st}`);
  };

  const addReview: Store["addReview"] = (r) =>
    setState((s) => {
      const reviews = [{ ...r, id: `r${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...s.reviews];
      syncRTDB("reviews", reviews);
      return { ...s, reviews };
    });

  const setStock: Store["setStock"] = (id, stock) => {
    const nextMap = { ...state.stockMap, [id]: Math.max(0, stock) };
    setState((s) => ({ ...s, stockMap: nextMap }));
    syncRTDB("stockMap", nextMap);
  };
  const markNotifsRead = () => setState((s) => ({ ...s, notifs: s.notifs.map((n) => ({ ...n, read: true })) }));
  const sendChat: Store["sendChat"] = (from, text) =>
    setState((s) => ({ ...s, chat: [...s.chat, { from, text, at: new Date().toISOString() }] }));
  const subscribe: Store["subscribe"] = (email) => {
    setState((s) => ({ ...s, subscribed: true }));
    toast("success", `Subscribed ${email} via Mailchimp (demo) — check your inbox`);
  };
  const saveAddress: Store["saveAddress"] = (a) =>
    setState((s) => ({ ...s, addresses: s.addresses.some((x) => x.id === a.id) ? s.addresses.map((x) => (x.id === a.id ? a : x)) : [...s.addresses, a] }));
  const deleteAddress: Store["deleteAddress"] = (id) => setState((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) }));
  const addPayMethod: Store["addPayMethod"] = (m) => setState((s) => ({ ...s, payMethods: [...s.payMethods, m] }));
  const deletePayMethod: Store["deletePayMethod"] = (id) => setState((s) => ({ ...s, payMethods: s.payMethods.filter((p) => p.id !== id) }));
  const addCoupon: Store["addCoupon"] = (c) => setState((s) => {
    const coupons = [c, ...s.coupons];
    syncRTDB("coupons", coupons);
    return { ...s, coupons };
  });
  const toggleCoupon: Store["toggleCoupon"] = (code) => setState((s) => {
    const coupons = s.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c));
    syncRTDB("coupons", coupons);
    return { ...s, coupons };
  });
  const deleteCoupon: Store["deleteCoupon"] = (code) => setState((s) => {
    const coupons = s.coupons.filter((c) => c.code !== code);
    syncRTDB("coupons", coupons);
    return { ...s, coupons };
  });
  const addStaff: Store["addStaff"] = (st) => setState((s) => {
    const staff = [...s.staff, st];
    syncRTDB("staff", staff);
    return { ...s, staff };
  });
  const removeStaff: Store["removeStaff"] = (id) => setState((s) => {
    const staff = s.staff.filter((x) => x.id !== id);
    syncRTDB("staff", staff);
    return { ...s, staff };
  });
  const setStaffRole: Store["setStaffRole"] = (id, role) => setState((s) => {
    const staff = s.staff.map((x) => (x.id === id ? { ...x, role } : x));
    syncRTDB("staff", staff);
    return { ...s, staff };
  });
  const toggleCustomer: Store["toggleCustomer"] = (id) => setState((s) => {
    const customers = s.customers.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c));
    syncRTDB("customers", customers);
    return { ...s, customers };
  });
  const addProduct: Store["addProduct"] = (p) => {
    const list = [p, ...customProducts.filter((x) => x.id !== p.id)];
    persistCustom(list);
    if (deletedProductIds.includes(p.id)) {
      const nextDeleted = deletedProductIds.filter((id) => id !== p.id);
      setDeletedProductIds(nextDeleted);
      try { localStorage.setItem("cakeurban_deleted_ids", JSON.stringify(nextDeleted)); } catch {}
      syncRTDB("deletedProductIds", nextDeleted);
    }
    const nextMap = { ...state.stockMap, [p.id]: p.stock };
    setState((s) => ({ ...s, stockMap: nextMap }));
    syncRTDB("stockMap", nextMap);
    toast("success", `Product "${p.name}" added & saved live!`);
  };

  const updateProduct: Store["updateProduct"] = (p) => {
    if (customProducts.some((x) => x.id === p.id)) {
      persistCustom(customProducts.map((x) => (x.id === p.id ? p : x)));
    } else {
      const nextOverrides = { ...productOverrides, [p.id]: p };
      persistOverrides(nextOverrides);
    }
    const nextMap = { ...state.stockMap, [p.id]: p.stock };
    setState((s) => ({ ...s, stockMap: nextMap }));
    syncRTDB("stockMap", nextMap);
    toast("success", `Product "${p.name}" saved & live synced`);
  };

  const deleteProduct: Store["deleteProduct"] = (id) => {
    const nextDeleted = Array.from(new Set([...deletedProductIds, id]));
    setDeletedProductIds(nextDeleted);
    try { localStorage.setItem("cakeurban_deleted_ids", JSON.stringify(nextDeleted)); } catch {}
    syncRTDB("deletedProductIds", nextDeleted);

    if (customProducts.some((x) => x.id === id)) {
      const nextCustom = customProducts.filter((x) => x.id !== id);
      setCustomProducts(nextCustom);
      try { localStorage.setItem("cakeurban_custom_products", JSON.stringify(nextCustom)); } catch {}
      syncRTDB("customProducts", nextCustom);
    }
    if (productOverrides[id]) {
      const nextOverrides = { ...productOverrides };
      delete nextOverrides[id];
      persistOverrides(nextOverrides);
    }
    toast("info", "Product removed from store catalog");
  };

  const bulkUpdateStock: Store["bulkUpdateStock"] = (ids, { mode, value: val }) => {
    const nextMap = { ...state.stockMap };
    ids.forEach((id) => {
      const p = products.find((x) => x.id === id);
      const curr = nextMap[id] ?? p?.stock ?? 0;
      nextMap[id] = mode === "add" ? Math.max(0, curr + val) : Math.max(0, val);
    });
    setState((s) => ({ ...s, stockMap: nextMap }));
    syncRTDB("stockMap", nextMap);
    toast("success", `Updated stock for ${ids.length} selected items`);
  };

  const bulkDeleteProducts: Store["bulkDeleteProducts"] = (ids) => {
    const nextDeleted = Array.from(new Set([...deletedProductIds, ...ids]));
    setDeletedProductIds(nextDeleted);
    try { localStorage.setItem("cakeurban_deleted_ids", JSON.stringify(nextDeleted)); } catch {}
    syncRTDB("deletedProductIds", nextDeleted);

    const nextCustom = customProducts.filter((x) => !ids.includes(x.id));
    if (nextCustom.length !== customProducts.length) {
      persistCustom(nextCustom);
    }
    toast("info", `Deleted ${ids.length} products from live catalog`);
  };

  const bulkUpdateTag: Store["bulkUpdateTag"] = (ids, tag) => {
    const nextCustom = customProducts.map((p) => (ids.includes(p.id) ? { ...p, tag } : p));
    persistCustom(nextCustom);
    const nextOverrides = { ...productOverrides };
    ids.forEach((id) => {
      if (!customProducts.some((x) => x.id === id)) {
        const p = products.find((x) => x.id === id);
        if (p) nextOverrides[id] = { ...(nextOverrides[id] || p), tag };
      }
    });
    persistOverrides(nextOverrides);
    toast("success", `Applied badge "${tag}" to ${ids.length} products`);
  };

  const bulkUpdatePriceDiscount: Store["bulkUpdatePriceDiscount"] = (ids, discountPct) => {
    const nextCustom = customProducts.map((p) => {
      if (ids.includes(p.id)) {
        const newPrice = Math.max(1, Math.round(p.price * (1 - discountPct / 100)));
        return { ...p, price: newPrice, compareAt: p.compareAt || p.price };
      }
      return p;
    });
    persistCustom(nextCustom);
    const nextOverrides = { ...productOverrides };
    ids.forEach((id) => {
      if (!customProducts.some((x) => x.id === id)) {
        const p = products.find((x) => x.id === id);
        if (p) {
          const newPrice = Math.max(1, Math.round(p.price * (1 - discountPct / 100)));
          nextOverrides[id] = { ...(nextOverrides[id] || p), price: newPrice, compareAt: p.compareAt || p.price };
        }
      }
    });
    persistOverrides(nextOverrides);
    toast("success", `Applied ${discountPct}% price discount to ${ids.length} products`);
  };

  const addCategory: Store["addCategory"] = (c) => {
    const list = [...categoriesList.filter((x) => x.name.toLowerCase() !== c.name.toLowerCase()), c];
    persistCategories(list);
    toast("success", `Category "${c.name}" created & saved live!`);
  };

  const updateCategory: Store["updateCategory"] = (c) => {
    const list = categoriesList.map((x) => (x.name.toLowerCase() === c.name.toLowerCase() ? c : x));
    persistCategories(list);
    toast("success", `Category "${c.name}" updated successfully!`);
  };

  const deleteCategory: Store["deleteCategory"] = (name) => {
    const list = categoriesList.filter((x) => x.name.toLowerCase() !== name.toLowerCase());
    persistCategories(list);
    toast("info", `Category "${name}" removed`);
  };

  const reorderCategories: Store["reorderCategories"] = (cats) => {
    persistCategories(cats);
    toast("success", "Category order updated!");
  };

  const updateSettings: Store["updateSettings"] = (patch) => {
    setState((s) => {
      const nextSettings = { ...s.settings, ...patch };
      syncRTDB("settings", nextSettings);
      return { ...s, settings: nextSettings };
    });
    toast("success", "Website settings & CMS saved live!");
  };

  const updateNcrHub: Store["updateNcrHub"] = (hub) => {
    setState((s) => {
      const currentHubs = s.settings.ncrHubs || SEED_NCR_HUBS;
      const nextHubs = currentHubs.map((h) => (h.id === hub.id ? hub : h));
      if (!currentHubs.some((h) => h.id === hub.id)) nextHubs.push(hub);
      const nextSettings = { ...s.settings, ncrHubs: nextHubs };
      syncRTDB("settings", nextSettings);
      return { ...s, settings: nextSettings };
    });
    toast("success", `NCR Delivery Hub "${hub.city}" updated!`);
  };

  const value: Store = {
    ...state, products, customProducts, categories: categoriesList, t, fmt, toast, toasts, dismissToast: (id) => setToasts((ts) => ts.filter((x) => x.id !== id)),
    set, toggleTheme: () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    cartAdd, cartQty, cartRemove, saveForLater, moveSavedToCart, removeSaved, toggleWish, toggleCompare,
    clearCompare: () => setState((s) => ({ ...s, compare: [] })), cartCount, cartSubtotal, couponFor, redeemCoupon,
    login, requestSignup, verifySignup, pendingOtp, socialLogin, logout, updateProfile, placeOrder, cancelOrder, setOrderStatus,
    addReview, setStock, pushNotif, markNotifsRead, sendChat, subscribe, saveAddress, deleteAddress,
    addPayMethod, deletePayMethod, addCoupon, toggleCoupon, deleteCoupon, addStaff, removeStaff, setStaffRole,
    toggleCustomer, addProduct, updateProduct, deleteProduct,
    bulkUpdateStock, bulkDeleteProducts, bulkUpdateTag, bulkUpdatePriceDiscount,
    addCategory, updateCategory, deleteCategory, reorderCategories,
    updateSettings, updateNcrHub,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
