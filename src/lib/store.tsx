import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  PRODUCTS, SEED_REVIEWS, SEED_COUPONS, SEED_CUSTOMERS, SEED_STAFF, SEED_FAQS, CURRENCIES, HERO_DEFAULT,
  type Product, type Review, type Coupon, type Customer, type Staff, type Faq, type CartItem, type Address,
  type PaymentMethod, type Order, type OrderStatus, type OrderItem,
} from "../data/catalog";
import { translate, type Lang } from "./i18n";

export type User = { name: string; email: string; role: "customer" | "admin" };
export type Toast = { id: number; kind: "success" | "error" | "info"; msg: string };
export type Notif = { id: number; text: string; at: string; read: boolean };
export type ChatMsg = { from: "user" | "support"; text: string; at: string };
export type Settings = {
  announcement: string;
  hero: { kicker: string; titleA: string; titleB: string; sub: string };
  faqs: Faq[];
  zones: { zone: string; rate: number; freeOver: number }[];
  payments: { card: boolean; razorpay: boolean; paypal: boolean; cod: boolean };
  socials: { instagram: string; twitter: string; youtube: string };
  seo: { title: string; description: string };
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
  announcement: "OVENS ON FROM 6 AM — FREE SAME-DAY DELIVERY OVER $49 — EGGLESS OPTIONS DAILY",
  hero: HERO_DEFAULT,
  faqs: SEED_FAQS,
  zones: [
    { zone: "City (same-day)", rate: 4.9, freeOver: 49 },
    { zone: "National (next-morning)", rate: 9, freeOver: 90 },
    { zone: "International (chilled)", rate: 19, freeOver: 150 },
  ],
  payments: { card: true, razorpay: true, paypal: true, cod: false },
  socials: { instagram: "instagram.com/cakeurban", twitter: "x.com/cakeurban", youtube: "youtube.com/@cakeurban" },
  seo: { title: "CakeUrban — Artisan Cakes & Cookies", description: "Signature layer cakes, 72-hour cookies and macarons, baked fresh daily and delivered same-day." },
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
    users: [
      { name: "Aisha Verma", email: "admin@cakeurban.com", pass: "demo123", role: "admin" },
      { name: "Jordan Miles", email: "user@cakeurban.com", pass: "demo123", role: "customer" },
    ],
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
  requestSignup: (name: string, email: string, pass: string) => { ok: boolean; msg: string; code?: string };
  verifySignup: (code: string) => { ok: boolean; msg: string };
  pendingOtp: { name: string; email: string; pass: string; code: string } | null;
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
  customProducts: Product[];
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
  const [pendingOtp, setPendingOtp] = useState<{ name: string; email: string; pass: string; code: string } | null>(null);
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

  const [customProducts, setCustomProducts] = useState<Product[]>(() => {
    try { return JSON.parse(localStorage.getItem("cakeurban_custom_products") || "[]") as Product[]; } catch { return []; }
  });
  const products: Product[] = useMemo(
    () => PRODUCTS.map((p) => ({ ...p, stock: state.stockMap[p.id] ?? p.stock })).concat(customProducts),
    [state.stockMap, customProducts]
  );
  const persistCustom = (list: Product[]) => {
    setCustomProducts(list);
    try { localStorage.setItem("cakeurban_custom_products", JSON.stringify(list)); } catch { /* */ }
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
  const redeemCoupon: Store["redeemCoupon"] = (code) =>
    setState((s) => ({ ...s, coupons: s.coupons.map((c) => (c.code.toLowerCase() === code.trim().toLowerCase() ? { ...c, used: c.used + 1 } : c)) }));

  const pushNotif: Store["pushNotif"] = (text) =>
    setState((s) => ({ ...s, notifs: [{ id: Date.now(), text, at: new Date().toISOString(), read: false }, ...s.notifs] }));

  const login: Store["login"] = (email, pass) => {
    const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || u.pass !== pass) return { ok: false, msg: "Invalid credentials. Try the demo accounts below." };
    const user = { name: u.name, email: u.email, role: u.role };
    setState((s) => ({ ...s, user }));
    toast("success", `${t("signedIn")} ${u.name}`);
    return { ok: true, msg: "" };
  };

  const requestSignup: Store["requestSignup"] = (name, email, pass) => {
    if (state.users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase()))
      return { ok: false, msg: "Account already exists — sign in instead." };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setPendingOtp({ name, email: email.trim(), pass, code });
    toast("info", `Demo SMS → your OTP is ${code}`);
    return { ok: true, msg: "", code };
  };

  const verifySignup: Store["verifySignup"] = (code) => {
    if (!pendingOtp) return { ok: false, msg: "No pending verification" };
    if (code !== pendingOtp.code) return { ok: false, msg: "Incorrect code — check the demo SMS toast." };
    const u = { name: pendingOtp.name, email: pendingOtp.email, pass: pendingOtp.pass, role: "customer" as const };
    setState((s) => ({ ...s, users: [...s.users, u], user: { name: u.name, email: u.email, role: u.role } }));
    setPendingOtp(null);
    toast("success", `Welcome to CakeUrban, ${u.name.split(" ")[0]} — email verified ✓`);
    pushNotif("Email verified — account created");
    return { ok: true, msg: "" };
  };

  const socialLogin: Store["socialLogin"] = (provider) => {
    const user = { name: `${provider} User`, email: `user@${provider.toLowerCase()}.demo`, role: "customer" as const };
    setState((s) => ({ ...s, user }));
    toast("success", `Signed in with ${provider} (demo OAuth)`);
  };
  const logout = () => { setState((s) => ({ ...s, user: null })); toast("info", "Signed out"); };

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
    setState((s) => ({
      ...s,
      orders: [order, ...s.orders],
      cart: [],
      stockMap: Object.fromEntries(
        Object.entries(items.reduce<Record<string, number>>((m, it) => ((m[it.productId] = (m[it.productId] || 0) + it.qty), m), {}))
          .map(([pid, q]) => {
            const p = PRODUCTS.find((x) => x.id === pid);
            const base = s.stockMap[pid] ?? p?.stock ?? 0;
            return [pid, Math.max(0, base - q)];
          })
      ),
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
      return {
        ...s, stockMap,
        orders: s.orders.map((x) => x.id === id ? { ...x, status: "cancelled" as OrderStatus, timeline: [...x.timeline, { status: "cancelled" as OrderStatus, at: new Date().toISOString() }] } : x),
      };
    });
    pushNotif(`Order ${id} cancelled — refund initiated`);
    toast("info", `Order ${id} cancelled`);
  };

  const setOrderStatus: Store["setOrderStatus"] = (id, st) => {
    setState((s) => ({ ...s, orders: s.orders.map((x) => (x.id === id ? { ...x, status: st, timeline: [...x.timeline, { status: st, at: new Date().toISOString() }] } : x)) }));
    pushNotif(`Order ${id} is now ${st}`);
  };

  const addReview: Store["addReview"] = (r) =>
    setState((s) => ({ ...s, reviews: [{ ...r, id: `r${Date.now()}`, date: new Date().toISOString().slice(0, 10) }, ...s.reviews] }));

  const setStock: Store["setStock"] = (id, stock) => setState((s) => ({ ...s, stockMap: { ...s.stockMap, [id]: Math.max(0, stock) } }));
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
  const addCoupon: Store["addCoupon"] = (c) => setState((s) => ({ ...s, coupons: [c, ...s.coupons] }));
  const toggleCoupon: Store["toggleCoupon"] = (code) => setState((s) => ({ ...s, coupons: s.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)) }));
  const deleteCoupon: Store["deleteCoupon"] = (code) => setState((s) => ({ ...s, coupons: s.coupons.filter((c) => c.code !== code) }));
  const addStaff: Store["addStaff"] = (st) => setState((s) => ({ ...s, staff: [...s.staff, st] }));
  const removeStaff: Store["removeStaff"] = (id) => setState((s) => ({ ...s, staff: s.staff.filter((x) => x.id !== id) }));
  const setStaffRole: Store["setStaffRole"] = (id, role) => setState((s) => ({ ...s, staff: s.staff.map((x) => (x.id === id ? { ...x, role } : x)) }));
  const toggleCustomer: Store["toggleCustomer"] = (id) => setState((s) => ({ ...s, customers: s.customers.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)) }));
  const addProduct: Store["addProduct"] = (p) => { persistCustom([...customProducts, p]); toast("success", `Product "${p.name}" created`); };
  const updateProduct: Store["updateProduct"] = (p) => {
    if (customProducts.some((x) => x.id === p.id)) persistCustom(customProducts.map((x) => (x.id === p.id ? p : x)));
    else setState((s) => ({ ...s, stockMap: { ...s.stockMap, [p.id]: p.stock } }));
    toast("success", `Product "${p.name}" updated`);
  };
  const deleteProduct: Store["deleteProduct"] = (id) => { persistCustom(customProducts.filter((x) => x.id !== id)); toast("info", "Product deleted"); };

  const value: Store = {
    ...state, products, customProducts, t, fmt, toast, toasts, dismissToast: (id) => setToasts((ts) => ts.filter((x) => x.id !== id)),
    set, toggleTheme: () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    cartAdd, cartQty, cartRemove, saveForLater, moveSavedToCart, removeSaved, toggleWish, toggleCompare,
    clearCompare: () => setState((s) => ({ ...s, compare: [] })), cartCount, cartSubtotal, couponFor, redeemCoupon,
    login, requestSignup, verifySignup, pendingOtp, socialLogin, logout, placeOrder, cancelOrder, setOrderStatus,
    addReview, setStock, pushNotif, markNotifsRead, sendChat, subscribe, saveAddress, deleteAddress,
    addPayMethod, deletePayMethod, addCoupon, toggleCoupon, deleteCoupon, addStaff, removeStaff, setStaffRole,
    toggleCustomer, addProduct, updateProduct, deleteProduct,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
