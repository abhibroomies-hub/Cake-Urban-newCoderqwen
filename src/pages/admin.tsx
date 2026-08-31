import { useMemo, useRef, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useStore } from "../lib/store";
import { CATEGORIES, PRODUCTS, BLOG_POSTS, type Coupon, type Product, type Staff } from "../data/catalog";
import { Ic, Modal } from "../components/ui";
import { useAuth } from "../components/chrome";
import { StatusPill } from "./account";
import type { OrderStatus } from "../data/catalog";
import { CategoriesManager } from "../components/admin/CategoriesManager";
import { CmsManager } from "../components/admin/CmsManager";
import { NcrHubsManager } from "../components/admin/NcrHubsManager";
import { SeoAiManager } from "../components/admin/SeoAiManager";

const NAV = [
  ["dashboard", "Dashboard", Ic.chart],
  ["orders", "Orders", Ic.box],
  ["products", "Products", Ic.tag],
  ["categories", "Categories CMS", Ic.grid],
  ["cms", "Header & Home CMS", Ic.eye],
  ["ncr_hubs", "Delhi NCR Hubs", Ic.map],
  ["seo", "SEO & AI Domination", Ic.sparkle],
  ["customers", "Customers", Ic.users],
  ["coupons", "Coupons", Ic.tag],
  ["content", "Content & FAQs", Ic.mail],
  ["support", "Support", Ic.chat],
  ["staff", "Staff", Ic.users],
  ["reports", "Reports", Ic.download],
  ["settings", "Settings", Ic.settings],
] as const;

function Kpi({ label, value, delta, icon: Icon }: { label: string; value: string; delta: string; icon: (p: { className?: string }) => React.ReactElement }) {
  const up = delta.startsWith("+");
  return (
    <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5 hover:border-blaze-500/50 transition-colors">
      <div className="flex justify-between items-start"><p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400">{label}</p><Icon className="w-4 h-4 text-blaze-500" /></div>
      <p className="font-display text-3xl font-black mt-3 tabnum">{value}</p>
      <p className={`font-mono text-[11px] mt-1 ${up ? "text-volt-400" : "text-danger-400"}`}>{delta} vs last 30d</p>
    </div>
  );
}

export default function Admin() {
  const store = useStore();
  const { user, orders, products, customers, coupons, staff, chat, settings, fmt } = store;
  const { openAuth } = useAuth();
  const [tab, setTab] = useState<string>("dashboard");
  const [q, setQ] = useState("");
  const [productCatFilter, setProductCatFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editP, setEditP] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [invoice, setInvoice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const revSeries = useMemo(() => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(Date.now() - (29 - i) * 86400000);
      const key = d.toISOString().slice(0, 10);
      const rev = orders.filter((o) => o.date.slice(0, 10) === key && o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
      return { day: d.toLocaleDateString([], { day: "numeric" }), rev: Math.round(rev) };
    });
    return days;
  }, [orders]);

  const catSeries = useMemo(() => CATEGORIES.map((c) => ({
    name: c.name.slice(0, 6),
    sales: orders.reduce((s, o) => s + o.items.filter((it) => PRODUCTS.find((p) => p.id === it.productId)?.category === c.name).reduce((x, it) => x + it.price * it.qty, 0), 0),
  })), [orders]);

  const totalRev = revSeries.reduce((s, d) => s + d.rev, 0);
  const lowStock = products.filter((p) => p.stock <= 5);
  const topProducts = useMemo(() => {
    const m = new Map<string, { name: string; qty: number; rev: number }>();
    orders.forEach((o) => o.items.forEach((it) => {
      const e = m.get(it.productId) ?? { name: it.name, qty: 0, rev: 0 };
      e.qty += it.qty; e.rev += it.price * it.qty;
      m.set(it.productId, e);
    }));
    return [...m.values()].sort((a, b) => b.rev - a.rev).slice(0, 5);
  }, [orders]);

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <Ic.shield className="w-14 h-14 mx-auto text-gold-400 mb-5" />
        <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400 uppercase">Restricted zone</p>
        <h1 className="font-display text-4xl font-black uppercase mt-3">Admin console</h1>
        <p className="text-ink-400 mt-4">Role-based access — Super Admin, Manager or Staff required. Session is JWT-secured.</p>
        <button onClick={() => openAuth("login")} className="clip-btn mt-8 bg-gold-400 text-ink-950 hover:bg-gold-400/80 font-mono text-xs tracking-[0.2em] uppercase px-9 py-4 transition-colors">Admin sign in</button>
        <p className="font-mono text-[10px] text-ink-500 mt-5">Demo: admin@volta.shop / demo123</p>
      </div>
    );
  }

  const exportCSV = () => {
    const rows = [["id", "name", "brand", "category", "price", "stock", "rating", "sku"].join(",")];
    products.forEach((p) => rows.push([p.id, `"${p.name}"`, p.brand, p.category, p.price, p.stock, p.rating, p.sku].join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "volta-products.csv"; a.click();
    store.toast("success", `Exported ${products.length} products to CSV`);
  };
  const importCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split("\n").slice(1).filter(Boolean);
      let n = 0;
      lines.forEach((line) => {
        const [name, brand, category, price, stock] = line.split(",").map((s) => s.replace(/"/g, "").trim());
        if (!name) return;
        store.addProduct({
          id: `imp-${Date.now()}-${n}`, name, brand: brand || "VOLTA Lab", category: category || "Accessories",
          price: parseFloat(price) || 99, img: PRODUCTS[0].img, rating: 4.2, ratingCount: 0,
          stock: parseInt(stock) || 10, sku: `IMP-${1000 + n}`, colors: [{ name: "Import", hex: "#76839c" }],
          sizes: ["One size"], desc: "Imported via CSV.", specs: [["Imported", "Yes"]], tag: "NEW",
        });
        n++;
      });
      store.toast("success", `Imported ${n} products from CSV`);
    };
    reader.readAsText(file);
  };

  const filteredOrders = orders.filter((o) => (o.id + o.email).toLowerCase().includes(q.toLowerCase()));
  const inv = orders.find((o) => o.id === invoice);

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-gold-400">COMMAND CENTER</p>
          <h1 className="font-display text-3xl md:text-4xl font-black uppercase mt-2">Admin console</h1>
          <p className="font-mono text-xs text-ink-400 mt-2">{user.name} · Super Admin · live inventory sync</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="clip-tag border border-ink-600 hover:border-volt-400 hover:text-volt-400 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors"><Ic.download className="w-3.5 h-3.5" /> CSV</button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} className="clip-tag border border-ink-600 hover:border-cobalt-400 hover:text-cobalt-300 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors"><Ic.upload className="w-3.5 h-3.5" /> Import</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[210px_1fr] gap-6 items-start">
        <aside className="flex lg:flex-col gap-1 overflow-x-auto pb-2">
          {NAV.map(([k, label, Icon]) => (
            <button key={k} onClick={() => { setTab(k); setQ(""); }} className={`flex items-center gap-3 px-4 py-2.5 font-mono text-[11px] tracking-[0.15em] uppercase whitespace-nowrap border-l-2 transition-colors ${tab === k ? "border-gold-400 bg-ink-850 text-ink-50" : "border-transparent text-ink-400 hover:text-ink-100"}`}>
              <Icon className="w-4 h-4" /> {label}
              {k === "support" && <span className="ml-auto w-1.5 h-1.5 bg-volt-400 rounded-full" />}
              {k === "products" && lowStock.length > 0 && <span className="ml-auto font-mono text-[9px] text-gold-400">{lowStock.length}⚠</span>}
            </button>
          ))}
        </aside>

        <div className="min-w-0">
          {/* ===== DASHBOARD ===== */}
          {tab === "dashboard" && (
            <div className="space-y-6 anim-fade-up">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <Kpi label="Revenue 30d" value={fmt(totalRev)} delta="+18.4%" icon={Ic.chart} />
                <Kpi label="Orders" value={String(orders.length)} delta="+9.1%" icon={Ic.box} />
                <Kpi label="Customers" value={String(customers.length + 12840)} delta="+412" icon={Ic.users} />
                <Kpi label="Avg. order" value={fmt(totalRev / Math.max(1, orders.length))} delta="+2.3%" icon={Ic.tag} />
              </div>
              <div className="grid xl:grid-cols-[1.6fr_1fr] gap-4">
                <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Revenue — last 30 days (live)</p>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <AreaChart data={revSeries}>
                        <defs>
                          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff4d12" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#ff4d12" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#2a3240" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" tick={{ fill: "#76839c", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={{ stroke: "#2a3240" }} interval={4} />
                        <YAxis tick={{ fill: "#76839c", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} width={54} />
                        <Tooltip contentStyle={{ background: "#141821", border: "1px solid #2a3240", fontFamily: "JetBrains Mono", fontSize: 11 }} labelStyle={{ color: "#9aa6bd" }} />
                        <Area type="monotone" dataKey="rev" stroke="#ff4d12" strokeWidth={2} fill="url(#rev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Sales by category</p>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <BarChart data={catSeries}>
                        <CartesianGrid stroke="#2a3240" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#76839c", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={{ stroke: "#2a3240" }} />
                        <YAxis tick={{ fill: "#76839c", fontSize: 10, fontFamily: "JetBrains Mono" }} tickLine={false} axisLine={false} width={50} />
                        <Tooltip cursor={{ fill: "rgba(255,77,18,0.06)" }} contentStyle={{ background: "#141821", border: "1px solid #2a3240", fontFamily: "JetBrains Mono", fontSize: 11 }} />
                        <Bar dataKey="sales" fill="#3e63dd" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="grid xl:grid-cols-2 gap-4">
                <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Top sellers</p>
                  {topProducts.map((tp, i) => (
                    <div key={tp.name} className="flex items-center gap-3 py-2.5 border-t border-ink-800 first:border-0">
                      <span className="font-mono text-xs text-ink-500 w-5">{String(i + 1).padStart(2, "0")}</span>
                      <span className="flex-1 text-sm truncate">{tp.name}</span>
                      <span className="font-mono text-[11px] text-ink-400">{tp.qty} sold</span>
                      <span className="font-mono tabnum text-sm font-bold text-volt-400">{fmt(tp.rev)}</span>
                    </div>
                  ))}
                </div>
                <div className="border border-gold-400/30 bg-ink-850 clip-tile p-5">
                  <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-gold-400 mb-4">⚠ Low stock alerts ({lowStock.length})</p>
                  {lowStock.length === 0 && <p className="text-sm text-ink-400">All healthy. Nothing below threshold.</p>}
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2.5 border-t border-ink-800 first:border-0">
                      <span className="flex-1 text-sm truncate">{p.name}</span>
                      <span className="font-mono text-[11px] text-gold-400">{p.stock} left</span>
                      <button onClick={() => { store.setStock(p.id, p.stock + 20); store.toast("success", `Restocked ${p.name} +20`); }} className="clip-tag bg-volt-400/15 text-volt-400 hover:bg-volt-400 hover:text-ink-950 font-mono text-[9px] tracking-[0.15em] uppercase px-2.5 py-1.5 transition-colors">Restock +20</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== ORDERS ===== */}
          {tab === "orders" && (
            <div className="anim-fade-up border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
              <div className="p-4 border-b border-ink-800 flex items-center gap-3 flex-wrap">
                <h3 className="font-display font-bold uppercase mr-auto">Orders ({filteredOrders.length})</h3>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order / email…" className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-xs font-mono w-52 transition-colors" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead><tr className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500 border-b border-ink-800">
                    <th className="text-left p-4">Order</th><th className="text-left p-4">Customer</th><th className="text-left p-4">Items</th><th className="text-left p-4">Total</th><th className="text-left p-4">Status</th><th className="text-right p-4">Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredOrders.slice(0, 20).map((o) => (
                      <tr key={o.id} className="border-b border-ink-800/60 hover:bg-ink-800/40 transition-colors">
                        <td className="p-4 font-mono text-xs">{o.id}<span className="block text-ink-500 text-[10px] mt-0.5">{new Date(o.date).toLocaleDateString()}</span></td>
                        <td className="p-4 text-xs">{o.email}</td>
                        <td className="p-4 font-mono text-xs">{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                        <td className="p-4 font-mono tabnum text-xs font-bold">{fmt(o.total)}</td>
                        <td className="p-4">
                          <select value={o.status} onChange={(e) => { store.setOrderStatus(o.id, e.target.value as OrderStatus); store.toast("success", `${o.id} → ${e.target.value} (customer notified)`); }}
                            className="bg-ink-950 border border-ink-600 outline-none font-mono text-[10px] uppercase px-2 py-1.5 cursor-pointer">
                            {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => setInvoice(o.id)} title="Invoice" className="p-1.5 text-ink-400 hover:text-blaze-400 transition-colors"><Ic.print className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== PRODUCTS ===== */}
          {tab === "products" && (
            <div className="anim-fade-up space-y-4">
              {/* Top Controls: Search, Category Filter, and Add Button */}
              <div className="flex items-center gap-3 flex-wrap justify-between bg-ink-850 border border-ink-700/60 p-4 clip-tile">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by name, SKU, category, tag…"
                    className="bg-ink-900 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono flex-1 transition-colors"
                  />
                  <select
                    value={productCatFilter}
                    onChange={(e) => setProductCatFilter(e.target.value)}
                    className="bg-ink-900 border border-ink-600 outline-none px-3 py-2 text-xs cursor-pointer text-ink-200"
                  >
                    <option value="All">All Categories ({products.length})</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                    <option value="LowStock">Low Stock (≤5)</option>
                    <option value="Eggless">100% Eggless</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsNew(true);
                      setEditP({
                        id: `cake-${Date.now()}`,
                        name: "",
                        brand: "Noir Collection",
                        category: "Cakes",
                        price: 34,
                        compareAt: 42,
                        img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
                        rating: 4.9,
                        ratingCount: 12,
                        stock: 15,
                        sku: `CU-${Math.floor(Math.random() * 9000 + 1000)}`,
                        colors: [
                          { name: "Belgian Dark", hex: "#3a2318" },
                          { name: "Raspberry Gold", hex: "#b8324f" },
                        ],
                        sizes: ["½ KG", "1 KG", "1.5 KG", "2 KG"],
                        desc: "100% Pure eggless artisan cake crafted with premium Belgian chocolate and layered to perfection. Baked fresh on order.",
                        specs: [["Dietary", "100% Pure Eggless Vegetarian"], ["Delivery", "30-45 Mins Express"], ["Shelf Life", "48 Hours Chilled"]],
                        tag: "100% EGGLESS",
                      });
                    }}
                    className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-2.5 flex items-center gap-2 transition-colors font-bold shadow-lg shadow-blaze-500/20"
                  >
                    <Ic.plus className="w-4 h-4" /> Add New Item / Cake
                  </button>
                </div>
              </div>

              {/* Multi-Select Floating / Sticky Action Bar */}
              {selectedIds.length > 0 && (
                <div className="bg-blaze-950/90 border-2 border-blaze-500/80 p-3.5 clip-tile flex items-center justify-between gap-3 flex-wrap text-xs shadow-xl animate-fade-in">
                  <div className="flex items-center gap-2 font-mono text-ink-100">
                    <span className="bg-blaze-500 text-ink-950 font-bold px-2 py-0.5 rounded text-[11px]">
                      {selectedIds.length} SELECTED
                    </span>
                    <span>of {products.length} products</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => store.bulkUpdateStock(selectedIds, { mode: "add", value: 10 })}
                      className="bg-ink-800 hover:bg-ink-700 text-volt-400 font-mono text-[10px] uppercase px-2.5 py-1.5 border border-ink-600 rounded transition-colors"
                      title="Add 10 units to selected"
                    >
                      +10 Stock
                    </button>
                    <button
                      onClick={() => store.bulkUpdateStock(selectedIds, { mode: "set", value: 25 })}
                      className="bg-ink-800 hover:bg-ink-700 text-ink-100 font-mono text-[10px] uppercase px-2.5 py-1.5 border border-ink-600 rounded transition-colors"
                    >
                      Set Stock: 25
                    </button>
                    <button
                      onClick={() => store.bulkUpdateStock(selectedIds, { mode: "set", value: 0 })}
                      className="bg-ink-800 hover:bg-ink-700 text-danger-400 font-mono text-[10px] uppercase px-2.5 py-1.5 border border-danger-500/40 rounded transition-colors"
                    >
                      Mark Out of Stock
                    </button>
                    <button
                      onClick={() => store.bulkUpdateTag(selectedIds, "100% EGGLESS")}
                      className="bg-ink-800 hover:bg-ink-700 text-emerald-400 font-mono text-[10px] uppercase px-2.5 py-1.5 border border-emerald-500/40 rounded transition-colors"
                    >
                      Tag: Eggless
                    </button>
                    <button
                      onClick={() => store.bulkUpdateTag(selectedIds, "BEST SELLER")}
                      className="bg-ink-800 hover:bg-ink-700 text-gold-400 font-mono text-[10px] uppercase px-2.5 py-1.5 border border-gold-500/40 rounded transition-colors"
                    >
                      Tag: Best Seller
                    </button>
                    <button
                      onClick={() => store.bulkUpdatePriceDiscount(selectedIds, 10)}
                      className="bg-ink-800 hover:bg-ink-700 text-blaze-400 font-mono text-[10px] uppercase px-2.5 py-1.5 border border-blaze-500/40 rounded transition-colors"
                    >
                      10% Discount
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`)) {
                          store.bulkDeleteProducts(selectedIds);
                          setSelectedIds([]);
                        }
                      }}
                      className="bg-danger-600 hover:bg-danger-500 text-white font-mono text-[10px] uppercase px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 font-bold"
                    >
                      <Ic.trash className="w-3.5 h-3.5" /> Delete ({selectedIds.length})
                    </button>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="text-ink-400 hover:text-ink-200 font-mono text-[10px] uppercase px-2 py-1 underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[840px]">
                    <thead>
                      <tr className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-400 border-b border-ink-800 bg-ink-900/60">
                        <th className="p-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={
                              products.length > 0 &&
                              products.filter((p) => {
                                if (productCatFilter === "LowStock") return p.stock <= 5;
                                if (productCatFilter === "Eggless") return (p.tag || "").includes("EGGLESS") || (p.desc || "").toLowerCase().includes("eggless");
                                if (productCatFilter !== "All") return p.category === productCatFilter;
                                return true;
                              }).filter((p) => (p.name + p.brand + p.sku + (p.tag || "")).toLowerCase().includes(q.toLowerCase())).every((p) => selectedIds.includes(p.id))
                            }
                            onChange={(e) => {
                              const visible = products.filter((p) => {
                                if (productCatFilter === "LowStock") return p.stock <= 5;
                                if (productCatFilter === "Eggless") return (p.tag || "").includes("EGGLESS") || (p.desc || "").toLowerCase().includes("eggless");
                                if (productCatFilter !== "All") return p.category === productCatFilter;
                                return true;
                              }).filter((p) => (p.name + p.brand + p.sku + (p.tag || "")).toLowerCase().includes(q.toLowerCase()));
                              
                              if (e.target.checked) {
                                setSelectedIds(Array.from(new Set([...selectedIds, ...visible.map((p) => p.id)])));
                              } else {
                                const visibleSet = new Set(visible.map((p) => p.id));
                                setSelectedIds(selectedIds.filter((id) => !visibleSet.has(id)));
                              }
                            }}
                            className="w-4 h-4 cursor-pointer accent-blaze-500 rounded"
                          />
                        </th>
                        <th className="text-left p-4">Item & Baker Details</th>
                        <th className="text-left p-4">Category</th>
                        <th className="text-left p-4">Price</th>
                        <th className="text-left p-4">Stock Status</th>
                        <th className="text-left p-4">Badge / Tag</th>
                        <th className="text-left p-4">Rating</th>
                        <th className="text-right p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter((p) => {
                          if (productCatFilter === "LowStock") return p.stock <= 5;
                          if (productCatFilter === "Eggless") return (p.tag || "").includes("EGGLESS") || (p.desc || "").toLowerCase().includes("eggless");
                          if (productCatFilter !== "All") return p.category === productCatFilter;
                          return true;
                        })
                        .filter((p) => (p.name + p.brand + p.sku + (p.tag || "")).toLowerCase().includes(q.toLowerCase()))
                        .map((p) => {
                          const isSelected = selectedIds.includes(p.id);
                          return (
                            <tr
                              key={p.id}
                              className={`border-b border-ink-800/60 hover:bg-ink-800/40 transition-colors ${
                                isSelected ? "bg-blaze-500/10" : ""
                              }`}
                            >
                              <td className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) setSelectedIds([...selectedIds, p.id]);
                                    else setSelectedIds(selectedIds.filter((id) => id !== p.id));
                                  }}
                                  className="w-4 h-4 cursor-pointer accent-blaze-500 rounded"
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <span className="w-12 h-12 bg-ink-900 clip-tag overflow-hidden shrink-0 border border-ink-700/60 relative">
                                    <img
                                      src={p.img}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                      style={p.imgFilter ? { filter: p.imgFilter } : undefined}
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80";
                                      }}
                                    />
                                  </span>
                                  <div>
                                    <span className="block font-semibold text-xs text-ink-100">{p.name}</span>
                                    <span className="block font-mono text-[9px] text-ink-400">
                                      {p.sku} · {p.brand}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[11px] text-ink-300">
                                <span className="bg-ink-800 px-2 py-0.5 rounded text-[10px] border border-ink-700">
                                  {p.category}
                                </span>
                              </td>
                              <td className="p-4 font-mono tabnum text-xs">
                                <span className="font-bold text-ink-100">{fmt(p.price)}</span>
                                {p.compareAt && p.compareAt > p.price && (
                                  <span className="block text-[10px] text-ink-500 line-through">
                                    {fmt(p.compareAt)}
                                  </span>
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                      p.stock === 0
                                        ? "bg-danger-500/20 text-danger-400 border border-danger-500/30"
                                        : p.stock <= 5
                                        ? "bg-gold-500/20 text-gold-400 border border-gold-500/30"
                                        : "bg-volt-500/20 text-volt-400 border border-volt-500/30"
                                    }`}
                                  >
                                    {p.stock === 0 ? "Out of Stock" : `${p.stock} in stock`}
                                  </span>
                                  <button
                                    onClick={() => store.setStock(p.id, p.stock + 10)}
                                    className="font-mono text-[9px] text-blaze-400 hover:text-blaze-300 bg-ink-800 hover:bg-ink-700 px-1.5 py-0.5 rounded border border-ink-600 transition-colors"
                                    title="Add 10 units"
                                  >
                                    +10
                                  </button>
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[10px]">
                                {p.tag ? (
                                  <span className="bg-blaze-500/15 text-blaze-300 px-2 py-0.5 rounded border border-blaze-500/30">
                                    {p.tag}
                                  </span>
                                ) : (
                                  <span className="text-ink-600">—</span>
                                )}
                              </td>
                              <td className="p-4 font-mono text-xs text-gold-400">★ {p.rating.toFixed(1)}</td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      setIsNew(false);
                                      setEditP({ ...p });
                                    }}
                                    className="p-2 text-ink-300 hover:text-blaze-400 hover:bg-ink-800 rounded transition-colors"
                                    title="Edit Product"
                                  >
                                    <Ic.settings className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove "${p.name}" from catalog?`)) {
                                        store.deleteProduct(p.id);
                                      }
                                    }}
                                    className="p-2 text-ink-400 hover:text-danger-400 hover:bg-ink-800 rounded transition-colors"
                                    title="Delete Product"
                                  >
                                    <Ic.trash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ===== CATEGORIES CMS ===== */}
          {tab === "categories" && <CategoriesManager />}

          {/* ===== HEADER & HOME CMS ===== */}
          {tab === "cms" && <CmsManager />}

          {/* ===== DELHI NCR HUBS ===== */}
          {tab === "ncr_hubs" && <NcrHubsManager />}

          {/* ===== SEO & AI SEARCH DOMINATION ===== */}
          {tab === "seo" && <SeoAiManager />}

          {/* ===== CUSTOMERS ===== */}
          {tab === "customers" && (
            <div className="anim-fade-up border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
              <div className="p-4 border-b border-ink-800 flex items-center gap-3">
                <h3 className="font-display font-bold uppercase mr-auto">Customers ({customers.length})</h3>
                <button onClick={() => store.toast("success", `Promo blast queued to ${customers.filter((c) => !c.blocked).length} subscribers (Mailchimp)`)} className="clip-tag bg-cobalt-500 hover:bg-cobalt-400 text-ink-50 font-mono text-[9px] tracking-[0.15em] uppercase px-3 py-2 flex items-center gap-2 transition-colors"><Ic.mail className="w-3.5 h-3.5" /> Send promo email</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[680px]">
                  <thead><tr className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500 border-b border-ink-800">
                    <th className="text-left p-4">Customer</th><th className="text-left p-4">Joined</th><th className="text-left p-4">Orders</th><th className="text-left p-4">Spend</th><th className="text-right p-4">Status</th>
                  </tr></thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} className={`border-b border-ink-800/60 hover:bg-ink-800/40 transition-colors ${c.blocked ? "opacity-50" : ""}`}>
                        <td className="p-4"><span className="block font-semibold text-xs">{c.name}</span><span className="block font-mono text-[10px] text-ink-500">{c.email}</span></td>
                        <td className="p-4 font-mono text-[11px] text-ink-300">{c.joined}</td>
                        <td className="p-4 font-mono text-xs">{c.orders}</td>
                        <td className="p-4 font-mono tabnum text-xs font-bold">{fmt(c.spend)}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => { store.toggleCustomer(c.id); store.toast(c.blocked ? "success" : "info", `${c.name} ${c.blocked ? "unblocked" : "blocked"}`); }}
                            className={`clip-tag font-mono text-[9px] tracking-[0.15em] uppercase px-3 py-1.5 border transition-colors ${c.blocked ? "border-danger-500/50 text-danger-400 hover:bg-danger-500 hover:text-ink-50" : "border-volt-500/50 text-volt-400 hover:bg-volt-400 hover:text-ink-950"}`}>
                            {c.blocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===== COUPONS ===== */}
          {tab === "coupons" && <CouponsTab />}

          {/* ===== CONTENT ===== */}
          {tab === "content" && <ContentTab />}

          {/* ===== SUPPORT ===== */}
          {tab === "support" && (
            <div className="anim-fade-up grid md:grid-cols-[240px_1fr] gap-4">
              <div className="border border-ink-700/60 bg-ink-850 clip-tile p-4">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500 mb-3">Threads</p>
                {["Jordan Miles", "Guest · web chat"].map((n, i) => (
                  <button key={n} className={`w-full text-left px-3 py-3 mb-1 border-l-2 transition-colors ${i === 0 ? "border-blaze-500 bg-ink-800" : "border-transparent text-ink-400"}`}>
                    <span className="block text-xs font-semibold">{n}</span>
                    <span className="block font-mono text-[9px] text-ink-500 mt-0.5">{i === 0 ? "2 min ago" : "1 h ago"}</span>
                  </button>
                ))}
              </div>
              <div className="border border-ink-700/60 bg-ink-850 clip-tile flex flex-col h-105">
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                  {chat.map((m, i) => (
                    <div key={i} className={`flex ${m.from === "user" ? "" : "justify-end"}`}>
                      <div className={`max-w-[80%] px-3 py-2 text-xs clip-tag ${m.from === "user" ? "bg-ink-800" : "bg-cobalt-500 text-ink-50"}`}>{m.text}</div>
                    </div>
                  ))}
                </div>
                <AdminReply />
              </div>
            </div>
          )}

          {/* ===== STAFF ===== */}
          {tab === "staff" && <StaffTab staff={staff} />}

          {/* ===== REPORTS ===== */}
          {tab === "reports" && (
            <div className="anim-fade-up space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                {[["Sales report", "30-day revenue, orders, AOV", Ic.chart], ["Customer report", "Cohorts, LTV, retention", Ic.users], ["Product report", "Units, returns, margin", Ic.tag]].map(([title, sub, Icon]: unknown[]) => {
                  const IconC = Icon as (p: { className?: string }) => React.ReactElement;
                  return (
                    <div key={title as string} className="border border-ink-700/60 bg-ink-850 clip-tile p-6">
                      <IconC className="w-5 h-5 text-blaze-500" />
                      <p className="font-display font-bold mt-3">{title as string}</p>
                      <p className="text-xs text-ink-400 mt-1">{sub as string}</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={exportCSV} className="clip-tag bg-volt-400/15 text-volt-400 hover:bg-volt-400 hover:text-ink-950 font-mono text-[9px] tracking-[0.15em] uppercase px-3 py-2 transition-colors">Excel/CSV</button>
                        <button onClick={() => store.toast("success", "PDF report generated — check downloads")} className="clip-tag bg-blaze-500/15 text-blaze-400 hover:bg-blaze-500 hover:text-ink-50 font-mono text-[9px] tracking-[0.15em] uppercase px-3 py-2 transition-colors">PDF</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
                <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Visitors — realtime</p>
                <div className="h-48"><ResponsiveContainer><AreaChart data={revSeries.map((d, i) => ({ ...d, rev: 40 + Math.round(60 * Math.abs(Math.sin(i / 3))) }))}><Area type="monotone" dataKey="rev" stroke="#c8f04b" strokeWidth={2} fill="rgba(200,240,75,0.08)" /><XAxis dataKey="day" hide /><YAxis hide /></AreaChart></ResponsiveContainer></div>
              </div>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {tab === "settings" && <SettingsTab />}
        </div>
      </div>

      {/* Product Editor Modal */}
      {editP && (
        <Modal open onClose={() => setEditP(null)}>
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-800 pb-3 mb-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
                  {isNew ? "✨ New Bakery Item" : `Edit Item — ${editP.sku}`}
                </p>
                <h3 className="font-display text-xl font-bold uppercase mt-0.5">
                  {isNew ? "Add Item to Live Catalog" : editP.name}
                </h3>
              </div>
              <button
                onClick={() => setEditP(null)}
                className="p-1.5 text-ink-400 hover:text-ink-100 rounded-lg hover:bg-ink-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Image Selection & Preview */}
              <div>
                <label className="block font-mono text-[10px] tracking-[0.15em] uppercase text-ink-300 font-bold mb-2">
                  Cake Photo & Media
                </label>
                <div className="grid sm:grid-cols-[110px_1fr] gap-4 items-start bg-ink-950 p-3.5 border border-ink-700/60 rounded">
                  <div className="w-full aspect-square bg-ink-900 border border-ink-700 rounded overflow-hidden relative shadow-inner">
                    <img
                      src={editP.img}
                      alt={editP.name || "Preview"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={productImageInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setEditP({ ...editP, img: evt.target.result as string });
                                store.toast("success", "Custom cake photo loaded!");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => productImageInputRef.current?.click()}
                        className="bg-ink-800 hover:bg-ink-700 text-ink-100 font-mono text-[10px] uppercase px-3 py-1.5 border border-ink-600 rounded flex items-center gap-1.5 transition-colors"
                      >
                        📷 Upload Photo
                      </button>
                      <span className="text-[10px] text-ink-400 font-mono">or enter direct URL below</span>
                    </div>

                    <input
                      value={editP.img}
                      onChange={(e) => setEditP({ ...editP, img: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-ink-900 border border-ink-700 focus:border-blaze-500 outline-none px-3 py-1.5 text-xs font-mono rounded"
                    />

                    {/* Quick Preset Selector */}
                    <div>
                      <p className="text-[9px] font-mono text-ink-400 uppercase tracking-wider mb-1.5">
                        Quick Preset Gallery:
                      </p>
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {[
                          { name: "Raspberry Noir", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80" },
                          { name: "Belgian Fudge", url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&auto=format&fit=crop&q=80" },
                          { name: "Pistachio Rose", url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80" },
                          { name: "Chantilly Cloud", url: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=800&auto=format&fit=crop&q=80" },
                          { name: "Salted Caramel", url: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80" },
                          { name: "Red Velvet", url: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&auto=format&fit=crop&q=80" },
                          { name: "Bento Cake", url: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=800&auto=format&fit=crop&q=80" },
                          { name: "Macarons Box", url: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800&auto=format&fit=crop&q=80" },
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setEditP({ ...editP, img: preset.url })}
                            className={`w-10 h-10 rounded shrink-0 overflow-hidden border-2 transition-transform hover:scale-105 ${
                              editP.img === preset.url ? "border-blaze-500 scale-105 shadow-md" : "border-ink-700 opacity-70 hover:opacity-100"
                            }`}
                            title={preset.name}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title and Category */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    Cake / Product Name *
                  </label>
                  <input
                    value={editP.name}
                    onChange={(e) => setEditP({ ...editP, name: e.target.value })}
                    placeholder="e.g. Belgian Truffle Royale 100% Eggless"
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2.5 text-sm rounded font-medium transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={editP.category}
                    onChange={(e) => setEditP({ ...editP, category: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-600 outline-none px-3 py-2.5 text-xs cursor-pointer rounded"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand, Pricing & Stock */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    Baker / Brand
                  </label>
                  <select
                    value={editP.brand}
                    onChange={(e) => setEditP({ ...editP, brand: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-600 outline-none px-2.5 py-2 text-xs cursor-pointer rounded"
                  >
                    {["Noir Collection", "Crumb Lab", "Pâtisserie", "Oven Stories", "CakeUrban Atelier"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    Price ({store.currency}) *
                  </label>
                  <input
                    type="number"
                    value={editP.price}
                    onChange={(e) => setEditP({ ...editP, price: Math.max(1, +e.target.value) })}
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-xs rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    MRP / Compare-At
                  </label>
                  <input
                    type="number"
                    value={editP.compareAt || ""}
                    onChange={(e) => setEditP({ ...editP, compareAt: e.target.value ? +e.target.value : undefined })}
                    placeholder="e.g. 45"
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-xs rounded font-mono text-ink-400"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    Units in Stock
                  </label>
                  <input
                    type="number"
                    value={editP.stock}
                    onChange={(e) => setEditP({ ...editP, stock: Math.max(0, +e.target.value) })}
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-xs rounded font-mono text-volt-400 font-bold"
                  />
                </div>
              </div>

              {/* Tag / Badge & SKU */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    Badge Ribbon (Tag)
                  </label>
                  <select
                    value={editP.tag ?? ""}
                    onChange={(e) => setEditP({ ...editP, tag: e.target.value || undefined })}
                    className="w-full bg-ink-950 border border-ink-600 outline-none px-3 py-2 text-xs cursor-pointer rounded"
                  >
                    <option value="">None</option>
                    <option value="100% EGGLESS">100% EGGLESS</option>
                    <option value="BEST SELLER">BEST SELLER</option>
                    <option value="EXPRESS 30M">EXPRESS 30M</option>
                    <option value="NEW">NEW</option>
                    <option value="CHEF SPECIAL">CHEF SPECIAL</option>
                    <option value="VEGAN">VEGAN</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                    SKU Code
                  </label>
                  <input
                    value={editP.sku}
                    onChange={(e) => setEditP({ ...editP, sku: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-600 outline-none px-3 py-2 text-xs rounded font-mono text-ink-300"
                  />
                </div>
              </div>

              {/* Weight & Size Variants */}
              <div>
                <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1.5">
                  Available Weight / Size Options
                </label>
                <div className="flex flex-wrap gap-2">
                  {["½ KG", "1 KG", "1.5 KG", "2 KG", "3 KG", "5 KG", "Box of 6", "Box of 12", "Single Piece"].map((sz) => {
                    const isChecked = (editP.sizes || []).includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          const current = editP.sizes || [];
                          const updated = isChecked ? current.filter((x) => x !== sz) : [...current, sz];
                          setEditP({ ...editP, sizes: updated });
                        }}
                        className={`px-3 py-1 text-[11px] font-mono rounded border transition-colors ${
                          isChecked
                            ? "bg-blaze-500 text-ink-950 border-blaze-400 font-bold"
                            : "bg-ink-900 text-ink-400 border-ink-700 hover:border-ink-500"
                        }`}
                      >
                        {sz} {isChecked ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                  Product Description & Flavor Notes
                </label>
                <textarea
                  value={editP.desc}
                  onChange={(e) => setEditP({ ...editP, desc: e.target.value })}
                  placeholder="Describe the layers, cream, cocoa percentage, sponge texture, and special baking techniques…"
                  rows={3}
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2.5 text-xs rounded resize-none transition-colors"
                />
              </div>

              {/* SEO & Search Engine Optimization helper notes */}
              <div className="bg-ink-900/80 border border-ink-700 p-3 rounded text-[11px] text-ink-300 font-mono">
                <p className="text-volt-400 font-bold flex items-center gap-1.5 mb-1">
                  ⚡ AI & Google Search Optimization
                </p>
                <p className="text-ink-400 text-[10px] leading-relaxed">
                  Products are automatically structured in Schema.org JSON-LD & synced live to Firebase Realtime Database for instantaneous discoverability on Google Search, Gemini, ChatGPT, and Perplexity AI.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!editP.name.trim()) {
                      store.toast("error", "Please provide a product name");
                      return;
                    }
                    if (isNew) {
                      store.addProduct(editP);
                    } else {
                      store.updateProduct(editP);
                    }
                    setEditP(null);
                  }}
                  className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.15em] uppercase py-3.5 font-bold transition-colors shadow-lg shadow-blaze-500/25 flex items-center justify-center gap-2"
                >
                  <Ic.check className="w-4 h-4" /> {isNew ? "Publish Item to Catalog" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditP(null)}
                  className="px-5 py-3.5 bg-ink-800 hover:bg-ink-700 text-ink-300 font-mono text-xs uppercase rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* invoice */}
      {inv && (
        <Modal open onClose={() => setInvoice(null)}>
          <div className="print-zone p-8">
            <div className="flex items-center justify-between border-b-2 border-ink-700 pb-5">
              <div className="flex items-center gap-2"><Ic.bolt className="w-7 h-7 text-blaze-500" /><span className="font-display font-extrabold text-xl">VOLTA</span></div>
              <div className="text-right font-mono text-xs text-ink-400"><p>INVOICE — {inv.id}</p><p>{new Date(inv.date).toLocaleDateString()}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-6 py-5 text-sm">
              <div><p className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase mb-1.5">Billed to</p><p className="font-semibold">{inv.email}</p><p className="text-ink-300 text-sm mt-1">{inv.address}</p></div>
              <div className="text-right"><StatusPill s={inv.status} /></div>
            </div>
            {inv.items.map((it, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-ink-800 text-sm"><span>{it.name} × {it.qty}</span><span className="font-mono tabnum">{fmt(it.price * it.qty)}</span></div>
            ))}
            <div className="flex justify-end mt-4 font-mono"><div className="w-52 space-y-1 text-sm">
              <div className="flex justify-between text-ink-400"><span>Subtotal</span><span>{fmt(inv.subtotal)}</span></div>
              <div className="flex justify-between text-ink-400"><span>Shipping</span><span>{inv.shipping === 0 ? "FREE" : fmt(inv.shipping)}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t border-ink-700"><span>Total</span><span>{fmt(inv.total)}</span></div>
            </div></div>
          </div>
          <div className="p-6 pt-3"><button onClick={() => window.print()} className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3 transition-colors flex items-center justify-center gap-2"><Ic.print className="w-4 h-4" /> Print invoice</button></div>
        </Modal>
      )}
    </div>
  );
}

function AdminReply() {
  const { sendChat } = useStore();
  const [msg, setMsg] = useState("");
  return (
    <div className="p-3 border-t border-ink-700 flex gap-2">
      <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && msg.trim()) { sendChat("support", msg.trim()); setMsg(""); } }} placeholder="Reply as support…" className="flex-1 bg-ink-950 border border-ink-600 focus:border-cobalt-400 outline-none px-3 py-2.5 text-sm transition-colors" />
      <button onClick={() => { if (msg.trim()) { sendChat("support", msg.trim()); setMsg(""); } }} className="clip-tag bg-cobalt-500 hover:bg-cobalt-400 text-ink-50 px-4 transition-colors"><Ic.send className="w-4 h-4" /></button>
    </div>
  );
}

function CouponsTab() {
  const { coupons, fmt, addCoupon, toggleCoupon, deleteCoupon, toast } = useStore();
  const [form, setForm] = useState({ code: "", type: "percent" as Coupon["type"], value: 10, min: 0, expires: "2026-12-31", limit: 1000 });
  return (
    <div className="anim-fade-up space-y-4">
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Create discount</p>
        <div className="grid sm:grid-cols-6 gap-3">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="CODE" className="sm:col-span-2 bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 font-mono text-xs transition-colors" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Coupon["type"] })} className="bg-ink-950 border border-ink-600 outline-none px-3 py-2.5 font-mono text-xs cursor-pointer">
            <option value="percent">% off</option><option value="fixed">$ off</option><option value="ship">Free ship</option>
          </select>
          <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: +e.target.value })} placeholder="Value" className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 font-mono text-xs transition-colors" />
          <input type="date" value={form.expires} onChange={(e) => setForm({ ...form, expires: e.target.value })} className="bg-ink-950 border border-ink-600 outline-none px-3 py-2.5 font-mono text-xs transition-colors" />
          <button onClick={() => { if (!form.code.trim()) { toast("error", "Code required"); return; } addCoupon({ ...form, used: 0, active: true }); toast("success", `Coupon ${form.code} live`); setForm({ ...form, code: "" }); }} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors">Launch</button>
        </div>
      </div>
      <div className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
        <table className="w-full text-sm min-w-[640px]">
          <thead><tr className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500 border-b border-ink-800">
            <th className="text-left p-4">Code</th><th className="text-left p-4">Type</th><th className="text-left p-4">Usage</th><th className="text-left p-4">Expires</th><th className="text-right p-4">Actions</th>
          </tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className={`border-b border-ink-800/60 hover:bg-ink-800/40 transition-colors ${c.active ? "" : "opacity-50"}`}>
                <td className="p-4 font-mono font-bold text-xs text-blaze-400">{c.code}</td>
                <td className="p-4 font-mono text-xs">{c.type === "percent" ? `${c.value}% off` : c.type === "fixed" ? `${fmt(c.value)} off (min ${fmt(c.min)})` : "Free shipping"}</td>
                <td className="p-4 font-mono text-xs">{c.used.toLocaleString()} / {c.limit.toLocaleString()}</td>
                <td className="p-4 font-mono text-xs text-ink-400">{c.expires}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => toggleCoupon(c.code)} className={`clip-tag font-mono text-[9px] tracking-[0.12em] uppercase px-2.5 py-1.5 border transition-colors ${c.active ? "border-volt-500/50 text-volt-400" : "border-ink-600 text-ink-400"}`}>{c.active ? "Active" : "Paused"}</button>
                  <button onClick={() => deleteCoupon(c.code)} className="p-1.5 text-ink-400 hover:text-danger-400 transition-colors"><Ic.trash className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContentTab() {
  const { settings, set, toast, blogHidden } = useStore();
  const [h, setH] = useState(settings.hero);
  const [faq, setFaq] = useState({ q: "", a: "" });
  void blogHidden;
  return (
    <div className="anim-fade-up grid xl:grid-cols-2 gap-4">
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Homepage hero (CMS)</p>
        <div className="space-y-3">
          <input value={h.kicker} onChange={(e) => setH({ ...h, kicker: e.target.value })} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm transition-colors" />
          <div className="grid grid-cols-2 gap-3">
            <input value={h.titleA} onChange={(e) => setH({ ...h, titleA: e.target.value })} className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm transition-colors" />
            <input value={h.titleB} onChange={(e) => setH({ ...h, titleB: e.target.value })} className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm transition-colors" />
          </div>
          <textarea value={h.sub} onChange={(e) => setH({ ...h, sub: e.target.value })} rows={3} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm resize-none transition-colors" />
          <button onClick={() => { set({ settings: { ...settings, hero: h } }); toast("success", "Hero published to storefront"); }} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 transition-colors">Publish</button>
        </div>
      </div>
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">FAQ manager</p>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {settings.faqs.map((f, i) => (
            <div key={i} className="border border-ink-800 p-3">
              <p className="text-xs font-semibold">{f.q}</p>
              <p className="text-[11px] text-ink-400 mt-1">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2 mt-3">
          <input value={faq.q} onChange={(e) => setFaq({ ...faq, q: e.target.value })} placeholder="New question" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-xs transition-colors" />
          <input value={faq.a} onChange={(e) => setFaq({ ...faq, a: e.target.value })} placeholder="Answer" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-xs transition-colors" />
          <button onClick={() => { if (!faq.q || !faq.a) return; set({ settings: { ...settings, faqs: [...settings.faqs, faq] } }); setFaq({ q: "", a: "" }); toast("success", "FAQ added"); }} className="clip-tag bg-ink-100 text-ink-950 hover:bg-blaze-500 hover:text-ink-50 font-mono text-[9px] tracking-[0.15em] uppercase px-4 py-2 transition-colors">Add FAQ</button>
        </div>
      </div>
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5 xl:col-span-2">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Blog posts (content marketing)</p>
        <div className="grid sm:grid-cols-3 gap-3">
          {BLOG_POSTS.map((b: { slug: string; title: string; tag: string }) => (
            <div key={b.slug} className="border border-ink-800 p-4">
              <p className="font-mono text-[9px] tracking-[0.2em] text-blaze-500">{b.tag}</p>
              <p className="text-xs font-semibold mt-1.5 leading-snug">{b.title}</p>
              <div className="flex gap-2 mt-3">
                <span className="clip-tag bg-volt-400/15 text-volt-400 font-mono text-[9px] px-2 py-1 tracking-wider">PUBLISHED</span>
                <button onClick={() => toast("info", "Post unpublished (demo)")} className="font-mono text-[9px] text-ink-500 hover:text-danger-400 tracking-wider">UNPUBLISH</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaffTab({ staff }: { staff: Staff[] }) {
  const { addStaff, removeStaff, setStaffRole, toast } = useStore();
  const [n, setN] = useState({ name: "", email: "" });
  const roleColor: Record<Staff["role"], string> = { "Super Admin": "text-gold-400 border-gold-400/50", Manager: "text-cobalt-300 border-cobalt-500/50", Staff: "text-ink-300 border-ink-600" };
  return (
    <div className="anim-fade-up space-y-4">
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-4">Invite staff member</p>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
          <input value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} placeholder="Full name" className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm transition-colors" />
          <input value={n.email} onChange={(e) => setN({ ...n, email: e.target.value })} placeholder="email@volta.shop" className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm transition-colors" />
          <button onClick={() => { if (!n.name || !n.email.includes("@")) { toast("error", "Name + valid email required"); return; } addStaff({ id: `s${Date.now()}`, ...n, role: "Staff", lastActive: "invited" }); toast("success", `Invite sent to ${n.email}`); setN({ name: "", email: "" }); }} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.15em] uppercase px-5 transition-colors">Invite</button>
        </div>
      </div>
      <div className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-4 p-4 border-b border-ink-800/60 last:border-0 flex-wrap">
            <span className="w-9 h-9 grid place-items-center bg-ink-800 border border-ink-600 rounded-full font-mono text-xs">{s.name[0]}</span>
            <div className="flex-1 min-w-32"><p className="text-sm font-semibold">{s.name}</p><p className="font-mono text-[10px] text-ink-500">{s.email} · last active {s.lastActive}</p></div>
            <select value={s.role} onChange={(e) => { setStaffRole(s.id, e.target.value as Staff["role"]); toast("success", `${s.name} → ${e.target.value}`); }} className={`bg-ink-950 border outline-none font-mono text-[10px] uppercase px-2.5 py-1.5 cursor-pointer ${roleColor[s.role]}`}>
              {["Super Admin", "Manager", "Staff"].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            {s.role !== "Super Admin" && <button onClick={() => { removeStaff(s.id); toast("info", `${s.name} removed`); }} className="p-1.5 text-ink-400 hover:text-danger-400 transition-colors"><Ic.trash className="w-4 h-4" /></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const { settings, set, toast } = useStore();
  const [s, setS] = useState(settings);
  const inp = "bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm w-full transition-colors";
  return (
    <div className="anim-fade-up grid xl:grid-cols-2 gap-4">
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5 space-y-3">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400">Store & SEO</p>
        <input className={inp} value={s.announcement} onChange={(e) => setS({ ...s, announcement: e.target.value })} placeholder="Announcement bar" />
        <input className={inp} value={s.seo.title} onChange={(e) => setS({ ...s, seo: { ...s.seo, title: e.target.value } })} placeholder="SEO title" />
        <textarea className={`${inp} resize-none`} rows={2} value={s.seo.description} onChange={(e) => setS({ ...s, seo: { ...s.seo, description: e.target.value } })} placeholder="Meta description" />
        <input className={inp} value={s.socials.instagram} onChange={(e) => setS({ ...s, socials: { ...s.socials, instagram: e.target.value } })} />
      </div>
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5 space-y-3">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400">Payment gateways</p>
        {([["card", "Cards (Stripe)"], ["razorpay", "Razorpay (UPI)"], ["paypal", "PayPal"], ["cod", "Cash on delivery"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setS({ ...s, payments: { ...s.payments, [k]: !s.payments[k] } })} className="w-full flex items-center justify-between border border-ink-800 p-3 hover:border-ink-600 transition-colors">
            <span className="text-sm">{label}</span>
            <span className={`w-10 h-5.5 p-0.5 border transition-colors ${s.payments[k] ? "bg-volt-400/20 border-volt-400" : "bg-ink-950 border-ink-600"}`}>
              <span className={`block w-4 h-4 transition-transform ${s.payments[k] ? "translate-x-4 bg-volt-400" : "bg-ink-500"}`} />
            </span>
          </button>
        ))}
      </div>
      <div className="border border-ink-700/60 bg-ink-850 clip-tile p-5 xl:col-span-2 space-y-3">
        <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400">Shipping zones & rates</p>
        {s.zones.map((z, i) => (
          <div key={z.zone} className="grid grid-cols-[1fr_110px_110px] gap-3 items-center">
            <span className="text-sm">{z.zone}</span>
            <label className="flex items-center gap-2 font-mono text-xs text-ink-400">$<input type="number" value={z.rate} onChange={(e) => { const zones = [...s.zones]; zones[i] = { ...z, rate: +e.target.value }; setS({ ...s, zones }); }} className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-2 py-2 text-xs w-full transition-colors" /></label>
            <label className="flex items-center gap-2 font-mono text-xs text-ink-400">Free ≥ $<input type="number" value={z.freeOver} onChange={(e) => { const zones = [...s.zones]; zones[i] = { ...z, freeOver: +e.target.value }; setS({ ...s, zones }); }} className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-2 py-2 text-xs w-full transition-colors" /></label>
          </div>
        ))}
        <button onClick={() => { set({ settings: s }); toast("success", "Settings saved & deployed to CDN edge"); }} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.2em] uppercase px-6 py-3 transition-colors">Save all settings</button>
      </div>
    </div>
  );
}
