import { useMemo, useRef, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useStore } from "../lib/store";
import { CATEGORIES, PRODUCTS, BLOG_POSTS, type Coupon, type Product, type Staff } from "../data/catalog";
import { Ic, Modal } from "../components/ui";
import { useAuth } from "../components/chrome";
import { StatusPill } from "./account";
import type { OrderStatus } from "../data/catalog";

const NAV = [
  ["dashboard", "Dashboard", Ic.chart], ["orders", "Orders", Ic.box], ["products", "Products", Ic.tag],
  ["customers", "Customers", Ic.users], ["coupons", "Coupons", Ic.tag], ["content", "Content", Ic.mail],
  ["support", "Support", Ic.chat], ["staff", "Staff", Ic.users], ["reports", "Reports", Ic.download],
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
  const [editP, setEditP] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [invoice, setInvoice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
              <div className="flex items-center gap-3 flex-wrap">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="bg-ink-900 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-xs font-mono flex-1 min-w-48 transition-colors" />
                <button onClick={() => { setIsNew(true); setEditP({ id: `new-${Date.now()}`, name: "", brand: "VOLTA Lab", category: "Footwear", price: 99, img: PRODUCTS[0].img, rating: 0, ratingCount: 0, stock: 10, sku: `VL-${Math.floor(Math.random() * 9000 + 1000)}`, colors: [{ name: "Default", hex: "#76839c" }], sizes: ["One size"], desc: "", specs: [["Weight", "—"]], tag: "NEW" }); }} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] tracking-[0.15em] uppercase px-5 py-2.5 flex items-center gap-2 transition-colors"><Ic.plus className="w-3.5 h-3.5" /> Add product</button>
              </div>
              <div className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead><tr className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500 border-b border-ink-800">
                      <th className="text-left p-4">Product</th><th className="text-left p-4">Category</th><th className="text-left p-4">Price</th><th className="text-left p-4">Stock</th><th className="text-left p-4">Rating</th><th className="text-right p-4">Actions</th>
                    </tr></thead>
                    <tbody>
                      {products.filter((p) => (p.name + p.brand + p.sku).toLowerCase().includes(q.toLowerCase())).map((p) => (
                        <tr key={p.id} className="border-b border-ink-800/60 hover:bg-ink-800/40 transition-colors">
                          <td className="p-4"><div className="flex items-center gap-3"><span className="w-10 h-10 bg-ink-900 clip-tag overflow-hidden shrink-0"><img src={p.img} alt="" className="w-full h-full object-cover" style={p.imgFilter ? { filter: p.imgFilter } : undefined} /></span><span><span className="block font-semibold text-xs">{p.name}</span><span className="block font-mono text-[9px] text-ink-500">{p.sku} · {p.brand}</span></span></div></td>
                          <td className="p-4 font-mono text-[11px] text-ink-300">{p.category}</td>
                          <td className="p-4 font-mono tabnum text-xs">{fmt(p.price)}</td>
                          <td className="p-4">
                            <span className={`font-mono text-xs ${p.stock <= 5 ? "text-gold-400" : "text-volt-400"}`}>{p.stock}</span>
                            <button onClick={() => store.setStock(p.id, p.stock + 10)} className="ml-2 font-mono text-[9px] text-cobalt-300 hover:text-cobalt-400">+10</button>
                          </td>
                          <td className="p-4 font-mono text-xs text-gold-400">★ {p.rating.toFixed(1)}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => { setIsNew(false); setEditP({ ...p }); }} className="p-1.5 text-ink-400 hover:text-cobalt-300 transition-colors"><Ic.settings className="w-4 h-4" /></button>
                            <button onClick={() => store.deleteProduct(p.id)} className="p-1.5 text-ink-400 hover:text-danger-400 transition-colors"><Ic.trash className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

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

      {/* product editor */}
      {editP && (
        <Modal open onClose={() => setEditP(null)}>
          <div className="p-8">
            <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase">{isNew ? "Create product" : `Edit — ${editP.sku}`}</p>
            <h3 className="font-display text-xl font-bold uppercase mt-1 mb-5">{isNew ? "New product" : editP.name}</h3>
            <div className="space-y-3">
              <input value={editP.name} onChange={(e) => setEditP({ ...editP, name: e.target.value })} placeholder="Product name" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm transition-colors" />
              <div className="grid grid-cols-2 gap-3">
                <select value={editP.brand} onChange={(e) => setEditP({ ...editP, brand: e.target.value })} className="bg-ink-950 border border-ink-600 outline-none px-3 py-3 text-sm cursor-pointer">{["VOLTA Lab", "Aeon", "Northline", "Kinetik"].map((b) => <option key={b}>{b}</option>)}</select>
                <select value={editP.category} onChange={(e) => setEditP({ ...editP, category: e.target.value })} className="bg-ink-950 border border-ink-600 outline-none px-3 py-3 text-sm cursor-pointer">{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <label className="block"><span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500">Price $</span><input type="number" value={editP.price} onChange={(e) => setEditP({ ...editP, price: +e.target.value })} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm mt-1 transition-colors" /></label>
                <label className="block"><span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500">Stock</span><input type="number" value={editP.stock} onChange={(e) => setEditP({ ...editP, stock: +e.target.value })} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm mt-1 transition-colors" /></label>
                <label className="block"><span className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink-500">Tag</span><input value={editP.tag ?? ""} onChange={(e) => setEditP({ ...editP, tag: e.target.value || undefined })} placeholder="NEW" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-sm mt-1 transition-colors" /></label>
              </div>
              <textarea value={editP.desc} onChange={(e) => setEditP({ ...editP, desc: e.target.value })} placeholder="Description" rows={2} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm resize-none transition-colors" />
              <p className="font-mono text-[9px] text-ink-500 tracking-wide">Variants (size/color/price) · media library · bulk edit available in full build — core fields persisted to the demo DB.</p>
              <button onClick={() => { if (!editP.name.trim()) { store.toast("error", "Name required"); return; } if (isNew) store.addProduct(editP); else store.updateProduct(editP); setEditP(null); }} className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3.5 transition-colors">{isNew ? "Create" : "Save changes"}</button>
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
