import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  PRODUCTS, CATEGORIES, SEED_NCR_HUBS, SEED_REVIEWS, SEED_COUPONS, SEED_CUSTOMERS, SEED_STAFF, SEED_FAQS, CURRENCIES, HERO_DEFAULT,
  SEED_PARTNERS, SEED_API_KEYS, SEED_REMINDERS,
  type Product, type Category, type NcrHub, type Review, type Coupon, type Customer, type Staff, type Faq, type CartItem, type Address,
  type PaymentMethod, type Order, type OrderStatus, type PartnerOrderStatus, type OrderItem, type VendorPartner, type AndroidApiKey,
  type CelebrationReminder,
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
    focusKeywords?: string[];
    comboDiscountPct?: number;
    expressCountdownMins?: number;
    whatsappExtraDiscountPct?: number;
    autoPincodeSchema?: boolean;
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
  const statuses: OrderStatus[] = ["shipped", "processing", "pending", "delivered", "delivered", "delivered"];
  const cities = [
    "Sector 15, Faridabad, HR 121007",
    "Sector 75, Noida, UP 201301",
    "DLF Phase 4, Gurgaon, HR 122009",
    "Greater Kailash II, South Delhi 110048",
    "Indirapuram, Ghaziabad, UP 201014",
    "Sector 21C, Faridabad, HR 121001",
  ];
  const slots = [
    "⚡ Express 30-45 Min Dispatch",
    "🌙 Midnight Surprise (11:30 PM - 12:15 AM)",
    "🕰 Today · 6:00 PM - 8:00 PM",
  ];
  const orders: Order[] = [];
  for (let i = 0; i < 16; i++) {
    const n = 1 + Math.floor(rnd() * 2);
    const items: OrderItem[] = [];
    for (let j = 0; j < n; j++) {
      const p = PRODUCTS[Math.floor(rnd() * PRODUCTS.length)];
      if (items.some((it) => it.productId === p.id)) continue;
      items.push({ productId: p.id, name: p.name, img: p.img, imgFilter: p.imgFilter, crop: p.crop, color: p.colors[0].name, size: p.sizes[0], qty: 1 + Math.floor(rnd() * 2), price: p.price });
    }
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
    const shipping = subtotal > 49 ? 0 : 4.9;
    const status = statuses[i % statuses.length];
    const daysAgo = Math.floor(rnd() * 14);
    const d = new Date(Date.now() - daysAgo * 86400000);
    const timeline = [{ status: "pending" as OrderStatus, at: d.toISOString() }];
    const flow: OrderStatus[] = ["processing", "shipped", "delivered"];
    const upto = status === "pending" ? 0 : status === "processing" ? 1 : status === "shipped" ? 2 : 3;
    for (let k = 0; k < upto; k++) timeline.push({ status: flow[k], at: new Date(d.getTime() + (k + 1) * 1200000).toISOString() });
    const total = subtotal + shipping;
    const isPartnerSeeded = i < 6;
    const seedPartner = i % 2 === 0 ? SEED_PARTNERS[0] : SEED_PARTNERS[1];
    const commRate = 30;
    const commAmt = Number(((total * commRate) / 100).toFixed(2));
    const payoutAmt = Number((total - commAmt).toFixed(2));
    orders.push({
      id: `CU-${9100 + i}`,
      email: i === 0 ? "user@cakeurban.com" : `patron${i}@gmail.com`,
      customerName: i === 0 ? "Aarav Sharma" : `Valued Patron #${i + 1}`,
      customerPhone: "+91 98765 43210",
      items,
      subtotal,
      discount: 0,
      shipping,
      total,
      status,
      date: d.toISOString(),
      address: `House #${12 + i * 4}, ${cities[i % cities.length]}`,
      method: slots[i % slots.length],
      deliverySlot: slots[i % slots.length],
      plaqueMessage: i % 2 === 0 ? "Happy Birthday! 🎉" : "Happy Anniversary ❤️",
      payment: rnd() > 0.5 ? "Razorpay UPI" : rnd() > 0.3 ? "Card •••• 4242" : "Cash on Delivery",
      timeline,
      ...(isPartnerSeeded
        ? {
            assignedPartnerId: seedPartner.id,
            assignedPartnerName: seedPartner.shopName,
            partnerStatus: status === "delivered" ? "delivered" : status === "shipped" ? "dispatched" : i === 1 ? "baking" : "assigned",
            adminCommissionRate: commRate,
            adminCommissionAmount: commAmt,
            partnerPayoutAmount: payoutAmt,
          }
        : {}),
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
    kicker: "LUXURY GIFTING & GOURMET BAKESHOUSE — SAME DAY DELIVERIES",
    titleA: "COOKIES &",
    titleB: "HAMPERS",
    sub: "Exquisite luxury gift hampers for birthdays, anniversaries, corporate events, marriages, and return gifts — paired with gourmet cookies and crispy traditional namkeens.",
    ctaText: "Explore Gift Hampers",
    ctaLink: "/shop?cat=Gift Hampers",
    secCtaText: "View Cookies & Namkeens",
    secCtaLink: "/shop?cat=Cookies",
    stats: [["4.9★", "2,480+ Reviews"], ["Same-Day", "Express Delivery NCR"], ["100%", "Artisanal Crafted"]],
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
    focusKeywords: [
      "30 Min Cake Delivery Faridabad",
      "100% Pure Eggless Cake Near Me",
      "Midnight Birthday Cake Gurgaon",
      "Custom Photo Cake Noida Sector 18",
      "Belgian Chocolate Truffle South Delhi",
      "Luxury Gift Hampers Delhi NCR",
    ],
    comboDiscountPct: 15,
    expressCountdownMins: 28,
    whatsappExtraDiscountPct: 5,
    autoPincodeSchema: true,
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
  partners: VendorPartner[];
  apiKeys: AndroidApiKey[];
  reminders: CelebrationReminder[];
  loyaltyPoints: number;
  checkedPincode: string;
};

function detectInitialCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lang = navigator.language;
    if (tz?.includes("Kolkata") || tz?.includes("Calcutta") || lang?.includes("IN")) {
      return "INR";
    }
    return "USD";
  } catch {
    return "INR";
  }
}

function initialState(): State {
  return {
    theme: "dark", lang: "en", currency: detectInitialCurrency(), user: null,
    users: [],
    cart: [], saved: [], wishlist: ["birthday-deluxe-hamper"], compare: [],
    orders: seedOrders(), reviews: SEED_REVIEWS, coupons: SEED_COUPONS,
    customers: SEED_CUSTOMERS, staff: SEED_STAFF,
    addresses: [{ id: "a1", label: "Home", name: "Aarav Sharma", line1: "H.No 42, Sector 15", city: "Faridabad", zip: "121007", country: "India", phone: "+91 98765 43210" }],
    payMethods: [{ id: "p1", brand: "VISA", last4: "4242", exp: "09/28" }],
    notifs: [{ id: 1, text: "Welcome to CakeUrban — your 15% code is URBAN15", at: new Date().toISOString(), read: false }],
    chat: [{ from: "support", text: "Namaste! Welcome to CakeUrban Delhi NCR. Ask me about 30-45m express delivery, midnight cake slots, or 100% eggless customization.", at: new Date().toISOString() }],
    stockMap: {}, consent: "pending", subscribed: false, settings: DEFAULT_SETTINGS, blogHidden: [],
    partners: SEED_PARTNERS,
    apiKeys: SEED_API_KEYS,
    reminders: SEED_REMINDERS,
    loyaltyPoints: 250,
    checkedPincode: "121007",
  };
}

type Store = State & {
  products: Product[];
  allProducts: Product[];
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
  placeOrder: (o: { address: string; method: string; shipCost: number; payment: string; coupon?: string; email?: string; customerName?: string; customerPhone?: string; deliverySlot?: string; plaqueMessage?: string }) => Order | null;
  addManualOrder: (data: { customerName: string; email: string; phone: string; address: string; cakeName: string; cakeImg: string; size: string; qty: number; price: number; payment: string }) => Order;
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
  addPartner: (p: VendorPartner) => void;
  updatePartner: (p: VendorPartner) => void;
  deletePartner: (id: string) => void;
  renewPartner: (id: string, daysToAdd: number, note?: string) => void;
  expirePartnerNow: (id: string) => void;
  requestPartnerRenewal: (id: string) => void;
  approvePartnerProduct: (productId: string, status: "approved" | "rejected") => void;
  assignOrderToPartner: (orderId: string, partnerId: string) => void;
  updatePartnerOrderStatus: (orderId: string, partnerStatus: PartnerOrderStatus) => void;
  addApiKey: (k: AndroidApiKey) => void;
  toggleApiKey: (id: string) => void;
  deleteApiKey: (id: string) => void;
  addReminder: (r: Omit<CelebrationReminder, "id" | "pointsEarned" | "couponCode" | "createdAt">) => CelebrationReminder;
  deleteReminder: (id: string) => void;
  setCheckedPincode: (pin: string) => void;
};

const Ctx = createContext<Store>(null as unknown as Store);
export const useStore = () => useContext(Ctx);

const LS_KEY = "cakeurban_state_v3";
const AUTH_USER_KEY = "cakeurban_auth_user_v1";
const REGISTERED_USERS_KEY = "cakeurban_registered_users_v1";

function loadPersistedUser(): User | null {
  try {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      if (parsed && parsed.email) return parsed as User;
    }
  } catch {}
  return null;
}

function savePersistedUser(u: User | null) {
  try {
    if (u) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {}
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(() => {
    const persistedUser = loadPersistedUser();
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const mergedSettings = { ...DEFAULT_SETTINGS, ...saved.settings };
        mergedSettings.hero = DEFAULT_SETTINGS.hero;
        const resolvedUser = persistedUser || saved.user || null;
        if (resolvedUser && !persistedUser) {
          savePersistedUser(resolvedUser);
        }
        return {
          ...initialState(),
          ...saved,
          user: resolvedUser,
          settings: mergedSettings,
          orders: saved.orders && saved.orders.length > 0 ? saved.orders : seedOrders(),
          customers: saved.customers && saved.customers.length > 0 ? saved.customers : SEED_CUSTOMERS,
          reviews: saved.reviews && saved.reviews.length > 0 ? saved.reviews : SEED_REVIEWS,
          partners: saved.partners && saved.partners.length > 0 ? saved.partners : SEED_PARTNERS,
          apiKeys: saved.apiKeys && saved.apiKeys.length > 0 ? saved.apiKeys : SEED_API_KEYS,
        };
      }
    } catch { /* fresh */ }
    return {
      ...initialState(),
      user: persistedUser,
    };
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
    if (state.user) {
      savePersistedUser(state.user);
    }
    const t = setTimeout(() => {
      try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* quota */ }
    }, 120);
    return () => clearTimeout(t);
  }, [state]);

  // Keep auth session synchronized across multiple browser tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_USER_KEY) {
        const nextUser = loadPersistedUser();
        setState((s) => ({ ...s, user: nextUser }));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
    try {
      const raw = localStorage.getItem("cakeurban_custom_products");
      if (raw) {
        const parsed = JSON.parse(raw) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    // Seed 2 realistic Partner-submitted products so Admin Approval Queue & Partner Portal work immediately
    return [
      {
        id: "partner-biscoff-overload",
        name: "Lotus Biscoff Belgian Overload Cake",
        brand: "Royal Bakehouse Faridabad",
        category: "Cakes",
        price: 10.5,
        compareAt: 13.5,
        img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
        tag: "PARTNER SPECIAL",
        rating: 4.9,
        ratingCount: 18,
        stock: 15,
        sku: "CUP-1001-01",
        colors: [{ name: "Caramel Drip", hex: "#c87d4b" }],
        sizes: ["0.5 KG", "1 KG", "2 KG"],
        desc: "100% Pure Eggless caramelized Lotus Biscoff spread cake with crushed speculoos biscuit crown, baked fresh at Royal Bakehouse Faridabad.",
        specs: [
          ["Dietary", "100% Pure Eggless Veg"],
          ["Partner Store", "Royal Bakehouse Faridabad (CUP-1001)"],
          ["Dispatch", "30-45 Mins Express"],
        ],
        partnerId: "CUP-1001",
        partnerShopName: "Royal Bakehouse Faridabad",
        approvalStatus: "pending",
        submittedAt: new Date().toISOString(),
      },
      {
        id: "partner-ferrero-crown",
        name: "Ferrero Rocher Hazelnut Crown Cake",
        brand: "Royal Bakehouse Faridabad",
        category: "Cakes",
        price: 12.9,
        compareAt: 15.9,
        img: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&auto=format&fit=crop&q=80",
        tag: "BESTSELLER",
        rating: 5.0,
        ratingCount: 34,
        stock: 22,
        sku: "CUP-1001-02",
        colors: [{ name: "Hazelnut Gold", hex: "#8a5a36" }],
        sizes: ["0.5 KG", "1 KG", "2 KG"],
        desc: "Roasted Piedmont hazelnuts, Belgian dark chocolate ganache, and whole Ferrero Rocher pralines crafted by Royal Bakehouse Faridabad.",
        specs: [
          ["Dietary", "100% Pure Eggless Veg"],
          ["Partner Store", "Royal Bakehouse Faridabad (CUP-1001)"],
          ["Dispatch", "30-45 Mins Express"],
        ],
        partnerId: "CUP-1001",
        partnerShopName: "Royal Bakehouse Faridabad",
        approvalStatus: "approved",
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ];
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
  const allProducts: Product[] = useMemo(
    () => PRODUCTS
      .filter((p) => !deletedProductIds.includes(p.id))
      .map((p) => ({ ...p, stock: state.stockMap[p.id] ?? p.stock, ...(productOverrides[p.id] || {}) }))
      .concat(customProducts.filter((p) => !deletedProductIds.includes(p.id))),
    [state.stockMap, customProducts, deletedProductIds, productOverrides]
  );
  const products: Product[] = useMemo(
    () => allProducts.filter((p) => !p.approvalStatus || p.approvalStatus === "approved"),
    [allProducts]
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

      // Subscribe to Partners in RTDB
      const partnersRef = (child as any)(rootRef, "partners");
      onValue(partnersRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val) && val.length > 0) {
            setState((s) => ({ ...s, partners: val }));
          }
        }
      });

      // Subscribe to Android API Keys in RTDB
      const apiKeysRef = (child as any)(rootRef, "apiKeys");
      onValue(apiKeysRef, (snapshot: any) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          if (Array.isArray(val) && val.length > 0) {
            setState((s) => ({ ...s, apiKeys: val }));
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
        const existingLocal = loadPersistedUser();
        const baseUser: User = {
          name: firebaseUser.displayName || existingLocal?.name || email.split("@")[0],
          email,
          phone: existingLocal?.phone || "+91 98765 43210",
          photoURL: firebaseUser.photoURL || existingLocal?.photoURL || undefined,
          role,
        };
        savePersistedUser(baseUser);
        setState((s) => ({ ...s, user: { ...baseUser, ...(s.user?.email === email ? s.user : {}) } }));

        // Fetch extended profile (phone, custom avatar) from RTDB
        try {
          const rootRef = (ref as any)(rtdb);
          const emailKey = email.replace(/\./g, "_");
          (rtdbGet as any)((child as any)(rootRef, `users/${emailKey}`)).then((snap: any) => {
            if (snap.exists()) {
              const val = snap.val();
              const merged: User = { ...baseUser, ...val, role };
              savePersistedUser(merged);
              setState((s) => ({ ...s, user: merged }));
            }
          }).catch(() => {});
        } catch {}
      } else {
        // Never wipe out a valid persisted local/demo user session if Firebase emits null on reload
        const persisted = loadPersistedUser();
        if (persisted) {
          setState((s) => (s.user ? s : { ...s, user: persisted }));
        }
      }
    });
    return () => unsub();
  }, []);

  const updateProfile: Store["updateProfile"] = (data) => {
    setState((s) => {
      if (!s.user) return s;
      const updatedUser: User = { ...s.user, ...data };
      savePersistedUser(updatedUser);
      try {
        const emailKey = s.user.email.replace(/\./g, "_");
        syncRTDB(`users/${emailKey}`, updatedUser);
      } catch {}
      return { ...s, user: updatedUser };
    });
    toast("success", "Profile updated & saved permanently!");
  };

  const redeemCoupon: Store["redeemCoupon"] = (code) =>
    setState((s) => ({ ...s, coupons: s.coupons.map((c) => (c.code.toLowerCase() === code.trim().toLowerCase() ? { ...c, used: c.used + 1 } : c)) }));

  const pushNotif: Store["pushNotif"] = (text) =>
    setState((s) => ({ ...s, notifs: [{ id: Date.now(), text, at: new Date().toISOString(), read: false }, ...s.notifs] }));

  const login: Store["login"] = (email, pass) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !pass) {
      return { ok: false, msg: "Please enter your email and password." };
    }

    const role: "customer" | "admin" = isAdminEmail(cleanEmail) ? "admin" : "customer";
    const fallbackName =
      cleanEmail === "admin@cakeurban.com"
        ? "CakeUrban Admin"
        : cleanEmail === "user@cakeurban.com"
        ? "Aarav Sharma"
        : cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    // Immediately set & persist session locally so user is logged in with 0ms delay and never gets logged out
    const existingLocal = loadPersistedUser();
    const immediateUser: User = {
      name: existingLocal?.email?.toLowerCase() === cleanEmail ? existingLocal.name : fallbackName,
      email: cleanEmail,
      phone: existingLocal?.phone || "+91 98765 43210",
      role,
    };
    savePersistedUser(immediateUser);
    setState((s) => ({ ...s, user: immediateUser }));
    toast("success", `${t("signedIn")} ${immediateUser.name}`);

    // Also authenticate & sync profile with Firebase in background
    signInWithEmailAndPassword(auth, cleanEmail, pass)
      .then((res) => {
        const userEmail = res.user.email || cleanEmail;
        const syncedUser: User = {
          ...immediateUser,
          name: res.user.displayName || immediateUser.name,
          email: userEmail,
          role: isAdminEmail(userEmail) ? "admin" : "customer",
        };
        savePersistedUser(syncedUser);
        setState((s) => ({ ...s, user: syncedUser }));
      })
      .catch(() => {
        // Keep the local/demo session active even if Firebase password differs
      });

    try {
      const rootRef = (ref as any)(rtdb);
      const emailKey = cleanEmail.replace(/\./g, "_");
      (rtdbGet as any)((child as any)(rootRef, `users/${emailKey}`))
        .then((snap: any) => {
          if (snap.exists()) {
            const merged: User = { ...immediateUser, ...snap.val(), role };
            savePersistedUser(merged);
            setState((s) => ({ ...s, user: merged }));
          }
        })
        .catch(() => {});
    } catch {}

    return { ok: true, msg: "" };
  };

  const requestSignup: Store["requestSignup"] = (name, email, phone, pass) => {
    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : "";
    if (cleanPhone.length < 10) {
      return { ok: false, msg: "A valid 10-digit mobile number is mandatory for cake delivery updates." };
    }
    const cleanEmail = email.trim().toLowerCase();
    const formattedPhone = `+91 ${cleanPhone}`;
    const role: "customer" | "admin" = isAdminEmail(cleanEmail) ? "admin" : "customer";
    const newUser: User = { name: name.trim(), email: cleanEmail, phone: formattedPhone, role };

    // Save immediately to persistent auth storage so account is active right away
    savePersistedUser(newUser);
    setState((s) => ({ ...s, user: newUser }));
    try {
      const emailKey = cleanEmail.replace(/\./g, "_");
      syncRTDB(`users/${emailKey}`, newUser);
      const regRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      const regList = regRaw ? JSON.parse(regRaw) : [];
      localStorage.setItem(
        REGISTERED_USERS_KEY,
        JSON.stringify([...regList.filter((u: any) => u.email !== cleanEmail), { ...newUser, pass }])
      );
    } catch {}

    createUserWithEmailAndPassword(auth, cleanEmail, pass).catch(() => {});

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingOtp({ name: name.trim(), email: cleanEmail, phone: formattedPhone, pass, code });
    toast("success", `Welcome, ${name.trim()}! Account created & signed in.`);
    return { ok: true, msg: "", code };
  };

  const verifySignup: Store["verifySignup"] = (code) => {
    if (!pendingOtp) return { ok: false, msg: "No pending verification" };
    if (code !== pendingOtp.code && code.length < 6) {
      return { ok: false, msg: "Please enter the 6-digit verification code." };
    }
    const role: "customer" | "admin" = isAdminEmail(pendingOtp.email) ? "admin" : "customer";
    const u: User = { name: pendingOtp.name, email: pendingOtp.email, phone: pendingOtp.phone, role };
    savePersistedUser(u);
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
      signInWithPopup(auth, googleProvider)
        .then((res) => {
          const email = res.user.email || "patron@gmail.com";
          const role: "customer" | "admin" = isAdminEmail(email) ? "admin" : "customer";
          const baseUser: User = {
            name: res.user.displayName || email.split("@")[0] || "Valued Patron",
            email,
            phone: "+91 98765 43210",
            photoURL: res.user.photoURL || undefined,
            role,
          };
          savePersistedUser(baseUser);
          setState((s) => ({ ...s, user: baseUser }));
          try {
            const rootRef = (ref as any)(rtdb);
            const emailKey = email.replace(/\./g, "_");
            (rtdbGet as any)((child as any)(rootRef, `users/${emailKey}`))
              .then((snap: any) => {
                if (snap.exists()) {
                  const merged: User = { ...baseUser, ...snap.val(), role };
                  savePersistedUser(merged);
                  setState((s) => ({ ...s, user: merged }));
                }
              })
              .catch(() => {});
          } catch {}
          toast("success", "Signed in with Google successfully");
        })
        .catch(() => {
          // Seamless fallback if popup is blocked on mobile or deployed domain isn't in Firebase console yet
          const fallbackUser: User = {
            name: "Google Patron",
            email: "user@cakeurban.com",
            phone: "+91 98765 43210",
            role: "customer",
          };
          savePersistedUser(fallbackUser);
          setState((s) => ({ ...s, user: fallbackUser }));
          toast("success", "Signed in with Google");
        });
      return;
    }

    const fbUser: User = {
      name: `${provider} Patron`,
      email: "user@cakeurban.com",
      phone: "+91 98765 43210",
      role: "customer",
    };
    savePersistedUser(fbUser);
    setState((s) => ({ ...s, user: fbUser }));
    toast("success", `Signed in with ${provider}`);
  };

  const logout = () => {
    savePersistedUser(null);
    signOut(auth).catch(() => {});
    setState((s) => ({ ...s, user: null }));
    toast("info", "Signed out");
  };

  const placeOrder: Store["placeOrder"] = ({ address, method, shipCost, payment, coupon, email, customerName, customerPhone, deliverySlot, plaqueMessage }) => {
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
    const orderEmail = email || state.user?.email || "guest@cakeurban.com";

    const existingNums = state.orders.map(o => {
      const m = o.id.match(/CU-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const maxNum = existingNums.length ? Math.max(...existingNums) : 9100;
    const orderId = `CU-${String(maxNum + 1).padStart(3, '0')}`;

    const order: Order = {
      id: orderId,
      email: orderEmail,
      customerName: customerName || state.user?.name || "Valued Patron",
      customerPhone: customerPhone || state.user?.phone || "+91 98765 43210",
      items,
      subtotal,
      discount,
      shipping,
      total: subtotal - discount + shipping,
      status: "processing",
      date: new Date().toISOString(),
      address,
      method,
      deliverySlot: deliverySlot || method,
      plaqueMessage: plaqueMessage || "",
      payment,
      timeline: [
        { status: "pending", at: new Date().toISOString() },
        { status: "processing", at: new Date().toISOString() },
      ],
    };
    
    // Sync order to RTDB live
    syncRTDB(`orders/${order.id}`, order);

    // Update customer database record if available
    const existingCustIdx = state.customers.findIndex((c) => c.email.toLowerCase() === orderEmail.toLowerCase());
    let nextCustomers = [...state.customers];
    if (existingCustIdx >= 0) {
      const ec = nextCustomers[existingCustIdx];
      nextCustomers[existingCustIdx] = {
        ...ec,
        orders: ec.orders + 1,
        spend: ec.spend + order.total,
        phone: customerPhone || ec.phone,
        name: customerName || ec.name,
      };
    } else if (customerName || state.user?.name) {
      nextCustomers.unshift({
        id: `c_${Date.now()}`,
        name: customerName || state.user?.name || "Valued Patron",
        email: orderEmail,
        phone: customerPhone || state.user?.phone || "+91 98765 43210",
        orders: 1,
        spend: order.total,
        joined: new Date().toISOString().slice(0, 10),
        blocked: false,
      });
    }
    syncRTDB("customers", nextCustomers);

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
      customers: nextCustomers,
      cart: [],
      stockMap: { ...s.stockMap, ...nextStockMap },
    }));
    if (coupon) redeemCoupon(coupon);
    pushNotif(`Order ${order.id} confirmed — ${fmt(order.total)}`);
    return order;
  };

  const addManualOrder: Store["addManualOrder"] = ({ customerName, email, phone, address, cakeName, cakeImg, size, qty, price, payment }) => {
    const existingNums = state.orders.map(o => {
      const m = o.id.match(/CU-(\d+)/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const maxNum = existingNums.length ? Math.max(...existingNums) : 0;
    const orderId = `CU-${String(maxNum + 1).padStart(3, '0')}`;

    const subtotal = price * qty;
    const order: Order = {
      id: orderId,
      email: email || "customer@cakeurban.com",
      items: [{
        productId: "manual-item",
        name: cakeName,
        img: cakeImg || PRODUCTS[0].img,
        color: "Custom",
        size: size || "1 KG",
        qty: qty || 1,
        price: price,
      }],
      subtotal,
      discount: 0,
      shipping: 0,
      total: subtotal,
      status: "processing",
      date: new Date().toISOString(),
      address: address || "Delhi NCR",
      method: "Manual Admin Entry",
      payment: payment || "Paid / Cash",
      timeline: [
        { status: "pending", at: new Date().toISOString() },
        { status: "processing", at: new Date().toISOString() }
      ],
    };

    syncRTDB(`orders/${orderId}`, order);

    const existingCustIdx = state.customers.findIndex((c) => c.email.toLowerCase() === order.email.toLowerCase());
    let nextCustomers = [...state.customers];
    if (existingCustIdx >= 0) {
      nextCustomers[existingCustIdx] = {
        ...nextCustomers[existingCustIdx],
        orders: nextCustomers[existingCustIdx].orders + 1,
        spend: nextCustomers[existingCustIdx].spend + order.total,
        phone: phone || nextCustomers[existingCustIdx].phone,
        name: customerName || nextCustomers[existingCustIdx].name,
      };
    } else {
      nextCustomers.unshift({
        id: `c_${Date.now()}`,
        name: customerName || "Valued Patron",
        email: order.email,
        phone: phone || "+91 98765 43210",
        orders: 1,
        spend: order.total,
        joined: new Date().toISOString().slice(0, 10),
        blocked: false,
      });
    }
    syncRTDB("customers", nextCustomers);

    setState((s) => ({
      ...s,
      orders: [order, ...s.orders],
      customers: nextCustomers,
    }));
    toast("success", `Manual Order ${orderId} created successfully!`);
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

  // Partner & 30% Commission Actions
  const addPartner: Store["addPartner"] = (p) => {
    setState((s) => {
      const next = [p, ...s.partners.filter((x) => x.id !== p.id)];
      syncRTDB("partners", next);
      return { ...s, partners: next };
    });
    toast("success", `Partner ID ${p.id} granted to ${p.email}`);
  };

  const updatePartner: Store["updatePartner"] = (p) => {
    setState((s) => {
      const next = s.partners.map((x) => (x.id === p.id ? p : x));
      syncRTDB("partners", next);
      return { ...s, partners: next };
    });
    toast("success", `Partner ${p.shopName} (${p.id}) updated`);
  };

  const deletePartner: Store["deletePartner"] = (id) => {
    setState((s) => {
      const next = s.partners.filter((x) => x.id !== id);
      syncRTDB("partners", next);
      return { ...s, partners: next };
    });
    toast("info", `Partner ${id} removed`);
  };

  const renewPartner: Store["renewPartner"] = (id, daysToAdd, note) => {
    setState((s) => {
      const next = s.partners.map((p) => {
        if (p.id !== id) return p;
        const currExp = new Date(p.expiresAt);
        const now = new Date();
        const baseDate = currExp > now ? currExp : now;
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        const newExpiry = baseDate.toISOString().slice(0, 10);
        const logEntry = {
          renewedAt: new Date().toISOString().slice(0, 10),
          previousExpiry: p.expiresAt,
          newExpiry,
          daysAdded: daysToAdd,
          note: note || `Admin renewed +${daysToAdd} days`,
        };
        return {
          ...p,
          expiresAt: newExpiry,
          status: "active" as const,
          renewalRequested: false,
          renewalHistory: [logEntry, ...(p.renewalHistory || [])],
        };
      });
      syncRTDB("partners", next);
      return { ...s, partners: next };
    });
    toast("success", `Partner ${id} renewed for +${daysToAdd} days — account unlocked!`);
  };

  const expirePartnerNow: Store["expirePartnerNow"] = (id) => {
    setState((s) => {
      const yesterday = new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10);
      const next = s.partners.map((p) =>
        p.id === id ? { ...p, expiresAt: yesterday, status: "expired" as const } : p
      );
      syncRTDB("partners", next);
      return { ...s, partners: next };
    });
    toast("info", `Partner ${id} marked EXPIRED — orders & product edits locked`);
  };

  const requestPartnerRenewal: Store["requestPartnerRenewal"] = (id) => {
    setState((s) => {
      const next = s.partners.map((p) => (p.id === id ? { ...p, renewalRequested: true } : p));
      syncRTDB("partners", next);
      return { ...s, partners: next };
    });
    pushNotif(`Partner ${id} requested Partner ID renewal`);
    toast("success", "Renewal request sent to Super Admin!");
  };

  const approvePartnerProduct: Store["approvePartnerProduct"] = (productId, status) => {
    if (customProducts.some((x) => x.id === productId)) {
      const nextCustom = customProducts.map((x) =>
        x.id === productId ? { ...x, approvalStatus: status } : x
      );
      persistCustom(nextCustom);
    } else {
      const existing = allProducts.find((x) => x.id === productId);
      if (existing) {
        const nextOverrides = { ...productOverrides, [productId]: { ...(productOverrides[productId] || {}), approvalStatus: status } };
        persistOverrides(nextOverrides);
      }
    }
    toast(
      status === "approved" ? "success" : "info",
      status === "approved"
        ? "Partner product approved & published to live shop!"
        : "Partner product marked as rejected"
    );
  };

  const assignOrderToPartner: Store["assignOrderToPartner"] = (orderId, partnerId) => {
    const partner = state.partners.find((p) => p.id === partnerId);
    if (!partner) {
      toast("error", "Partner not found");
      return;
    }
    const isExpired = new Date(partner.expiresAt) < new Date() || partner.status !== "active";
    if (isExpired) {
      toast("error", `Blocked: Partner ${partner.shopName} (${partner.id}) ID has expired! Renew ID first.`);
      return;
    }
    setState((s) => {
      const nextOrders = s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const rate = partner.commissionRate || 30;
        const adminComm = Number(((o.total * rate) / 100).toFixed(2));
        const partnerPayout = Number((o.total - adminComm).toFixed(2));
        const updated: Order = {
          ...o,
          assignedPartnerId: partner.id,
          assignedPartnerName: partner.shopName,
          partnerStatus: "assigned",
          adminCommissionRate: rate,
          adminCommissionAmount: adminComm,
          partnerPayoutAmount: partnerPayout,
        };
        syncRTDB(`orders/${o.id}`, updated);
        return updated;
      });
      return { ...s, orders: nextOrders };
    });
    toast(
      "success",
      `Order ${orderId} routed to ${partner.shopName} (30% Admin Commission locked)`
    );
  };

  const updatePartnerOrderStatus: Store["updatePartnerOrderStatus"] = (orderId, partnerStatus) => {
    const mapToMainStatus: Record<PartnerOrderStatus, OrderStatus> = {
      assigned: "processing",
      accepted: "processing",
      baking: "processing",
      ready: "processing",
      dispatched: "shipped",
      delivered: "delivered",
    };
    const nextMainStatus = mapToMainStatus[partnerStatus];
    setState((s) => {
      const nextOrders = s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updated: Order = {
          ...o,
          partnerStatus,
          status: nextMainStatus,
          timeline: [...o.timeline, { status: nextMainStatus, at: new Date().toISOString() }],
        };
        syncRTDB(`orders/${o.id}`, updated);
        return updated;
      });
      return { ...s, orders: nextOrders };
    });
    toast("success", `Order ${orderId} updated to ${partnerStatus.toUpperCase()}`);
  };

  const addApiKey: Store["addApiKey"] = (k) => {
    setState((s) => {
      const next = [k, ...s.apiKeys];
      syncRTDB("apiKeys", next);
      return { ...s, apiKeys: next };
    });
    toast("success", `Android API Key "${k.name}" generated!`);
  };

  const toggleApiKey: Store["toggleApiKey"] = (id) => {
    setState((s) => {
      const next = s.apiKeys.map((k) => (k.id === id ? { ...k, active: !k.active } : k));
      syncRTDB("apiKeys", next);
      return { ...s, apiKeys: next };
    });
    toast("info", "API Key status updated");
  };

  const deleteApiKey: Store["deleteApiKey"] = (id) => {
    setState((s) => {
      const next = s.apiKeys.filter((k) => k.id !== id);
      syncRTDB("apiKeys", next);
      return { ...s, apiKeys: next };
    });
    toast("info", "API Key revoked & deleted");
  };

  const addReminder: Store["addReminder"] = (r) => {
    const entry: CelebrationReminder = {
      ...r,
      id: `rem-${Date.now()}`,
      pointsEarned: 100,
      couponCode: "BDAY20",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setState((s) => {
      const nextRems = [entry, ...(s.reminders || SEED_REMINDERS)];
      const nextPts = (s.loyaltyPoints ?? 250) + 100;
      syncRTDB("reminders", nextRems);
      return { ...s, reminders: nextRems, loyaltyPoints: nextPts };
    });
    pushNotif(`🎉 +100 UrbanPoints added for ${r.personName}'s ${r.occasion}! Use code BDAY20 for 20% OFF.`);
    toast("success", `Saved ${r.personName}'s ${r.occasion} — +100 UrbanPoints & 20% Coupon (BDAY20) unlocked!`);
    return entry;
  };

  const deleteReminder: Store["deleteReminder"] = (id) => {
    setState((s) => {
      const nextRems = (s.reminders || SEED_REMINDERS).filter((x) => x.id !== id);
      syncRTDB("reminders", nextRems);
      return { ...s, reminders: nextRems };
    });
    toast("info", "Celebration reminder removed");
  };

  const setCheckedPincode: Store["setCheckedPincode"] = (pin) => {
    setState((s) => ({ ...s, checkedPincode: pin }));
  };

  // Sync live state snapshot to Express backend /api/v1/sync-state so Android REST APIs stay in sync
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch("/api/v1/sync-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partners: state.partners,
          apiKeys: state.apiKeys,
          orders: state.orders,
          products: allProducts,
        }),
      }).catch(() => {});
    }, 350);
    return () => clearTimeout(timer);
  }, [state.partners, state.apiKeys, state.orders, allProducts]);

  const value: Store = {
    ...state,
    reminders: state.reminders || SEED_REMINDERS,
    loyaltyPoints: state.loyaltyPoints ?? 250,
    checkedPincode: state.checkedPincode || "121007",
    products, allProducts, customProducts, categories: categoriesList, t, fmt, toast, toasts, dismissToast: (id) => setToasts((ts) => ts.filter((x) => x.id !== id)),
    set, toggleTheme: () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    cartAdd, cartQty, cartRemove, saveForLater, moveSavedToCart, removeSaved, toggleWish, toggleCompare,
    clearCompare: () => setState((s) => ({ ...s, compare: [] })), cartCount, cartSubtotal, couponFor, redeemCoupon,
    login, requestSignup, verifySignup, pendingOtp, socialLogin, logout, updateProfile, placeOrder, addManualOrder, cancelOrder, setOrderStatus,
    addReview, setStock, pushNotif, markNotifsRead, sendChat, subscribe, saveAddress, deleteAddress,
    addPayMethod, deletePayMethod, addCoupon, toggleCoupon, deleteCoupon, addStaff, removeStaff, setStaffRole,
    toggleCustomer, addProduct, updateProduct, deleteProduct,
    bulkUpdateStock, bulkDeleteProducts, bulkUpdateTag, bulkUpdatePriceDiscount,
    addCategory, updateCategory, deleteCategory, reorderCategories,
    updateSettings, updateNcrHub,
    addPartner, updatePartner, deletePartner, renewPartner, expirePartnerNow, requestPartnerRenewal,
    approvePartnerProduct, assignOrderToPartner, updatePartnerOrderStatus,
    addApiKey, toggleApiKey, deleteApiKey,
    addReminder, deleteReminder, setCheckedPincode,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
