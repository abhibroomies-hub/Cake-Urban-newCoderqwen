import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../lib/store";
import type { Order, OrderStatus } from "../data/catalog";
import { Ic, ImgX, Modal, Stars } from "../components/ui";
import { ProductCard } from "../components/product";
import { useAuth } from "../components/chrome";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "text-gold-400 border-gold-400/50 bg-gold-400/10",
  processing: "text-cobalt-300 border-cobalt-500/50 bg-cobalt-500/10",
  shipped: "text-volt-400 border-volt-500/50 bg-volt-400/10",
  delivered: "text-volt-400 border-volt-500/50 bg-volt-400/10",
  cancelled: "text-danger-400 border-danger-500/50 bg-danger-500/10",
};
export function StatusPill({ s }: { s: OrderStatus }) {
  return <span className={`clip-tag border font-mono text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 ${STATUS_COLORS[s]}`}>{s}</span>;
}

function Timeline({ order }: { order: Order }) {
  const flow: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];
  const reached = order.timeline.map((t) => t.status);
  return (
    <div className="flex items-start mt-6">
      {flow.map((s, i) => {
        const hit = reached.includes(s);
        const cancelled = order.status === "cancelled";
        return (
          <div key={s} className="flex-1 relative">
            {i > 0 && <span className={`absolute top-3 right-1/2 left-[-50%] h-px ${hit ? "bg-blaze-500" : "bg-ink-700"}`} />}
            <div className="flex flex-col items-center gap-2 relative">
              <span className={`w-6 h-6 grid place-items-center border-2 ${hit && !cancelled ? "bg-blaze-500 border-blaze-500 text-ink-50" : cancelled ? "border-ink-700 text-ink-600" : "border-ink-600 text-ink-600"}`}>
                {hit ? <Ic.check className="w-3.5 h-3.5" /> : <span className="w-1.5 h-1.5 bg-current rounded-full" />}
              </span>
              <span className={`font-mono text-[9px] tracking-[0.15em] uppercase ${hit && !cancelled ? "text-ink-100" : "text-ink-500"}`}>{s}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Invoice({ order, onClose }: { order: Order; onClose: () => void }) {
  const { fmt } = useStore();
  return (
    <Modal open onClose={onClose}>
      <div className="print-zone p-8">
        <div className="flex items-center justify-between border-b-2 border-ink-700 pb-5">
          <div className="flex items-center gap-2"><Ic.bolt className="w-7 h-7 text-blaze-500" /><span className="font-display font-extrabold text-xl">VOLTA</span></div>
          <div className="text-right font-mono text-xs text-ink-400"><p>INVOICE — {order.id}</p><p>{new Date(order.date).toLocaleDateString()}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-6 py-5 text-sm">
          <div><p className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase mb-1.5">Billed to</p><p className="font-semibold">{order.email}</p><p className="text-ink-300 text-sm mt-1">{order.address}</p></div>
          <div className="text-right"><p className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase mb-1.5">Fulfilled by</p><p className="font-semibold">VOLTA Supply Co.</p><p className="text-ink-300 text-sm mt-1">1 Propulsion Way, Austin TX</p></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="font-mono text-[10px] tracking-[0.15em] text-ink-500 uppercase border-b border-ink-700"><th className="text-left py-2.5">Item</th><th className="text-center">Qty</th><th className="text-right">Amount</th></tr></thead>
          <tbody>
            {order.items.map((it, i) => (
              <tr key={i} className="border-b border-ink-800"><td className="py-3">{it.name} <span className="font-mono text-[10px] text-ink-500">· {it.color} / {it.size}</span></td><td className="text-center font-mono">{it.qty}</td><td className="text-right font-mono tabnum">{fmt(it.price * it.qty)}</td></tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-5">
          <div className="w-56 space-y-1.5 font-mono text-sm">
            <div className="flex justify-between text-ink-400"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-volt-400"><span>Discount</span><span>−{fmt(order.discount)}</span></div>}
            <div className="flex justify-between text-ink-400"><span>Shipping</span><span>{order.shipping === 0 ? "FREE" : fmt(order.shipping)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-ink-700"><span>Total</span><span>{fmt(order.total)}</span></div>
          </div>
        </div>
        <p className="font-mono text-[9px] text-ink-500 mt-6 tracking-wide">Payment: {order.payment} · Delivery: {order.method} · Thank you for moving with VOLTA ⚡</p>
      </div>
      <div className="flex gap-3 p-6 pt-0">
        <button onClick={() => window.print()} className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3 transition-colors flex items-center justify-center gap-2"><Ic.print className="w-4 h-4" /> Print / PDF</button>
        <button onClick={onClose} className="clip-btn flex-1 border border-ink-600 hover:border-ink-400 font-mono text-xs tracking-[0.2em] uppercase py-3 transition-colors">Close</button>
      </div>
    </Modal>
  );
}

export default function Account() {
  const store = useStore();
  const { user, orders, fmt, t, cancelOrder, logout, addresses, saveAddress, deleteAddress, payMethods, addPayMethod, deletePayMethod, wishlist, products, toast } = store;
  const { openAuth } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  const [expanded, setExpanded] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Order | null>(null);
  const [addrForm, setAddrForm] = useState(false);
  const [addr, setAddr] = useState({ id: "", label: "Home", name: "", line1: "", city: "", zip: "", country: "United States", phone: "" });
  const [cardForm, setCardForm] = useState(false);
  const [newCard, setNewCard] = useState("");

  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <Ic.lock className="w-12 h-12 mx-auto text-ink-600 mb-5" />
        <h1 className="font-display text-3xl font-black uppercase">Member area</h1>
        <p className="text-ink-400 mt-3">Sign in to see orders, tracking, addresses and saved gear.</p>
        <button onClick={() => openAuth("login")} className="clip-btn mt-8 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-9 py-4 transition-colors">Sign in / create account</button>
        <p className="font-mono text-[10px] text-ink-500 mt-5">Demo: user@volta.shop / demo123</p>
      </div>
    );
  }

  const myOrders = orders.filter((o) => o.email === user.email || o.email.startsWith("customer")).slice(0, user.email.startsWith("customer") ? 0 : undefined).filter((o) => o.email === user.email || o.id === "VL-9100");
  const shown = myOrders.length ? myOrders : orders.slice(0, 4);
  const tabs = [
    ["overview", "Overview", Ic.chart], ["orders", "Orders", Ic.box], ["wishlist", t("wishlist"), Ic.heart],
    ["addresses", "Addresses", Ic.pin], ["payments", "Payments", Ic.card], ["settings", "Settings", Ic.settings],
  ] as const;
  const wishItems = products.filter((p) => wishlist.includes(p.id));
  const spend = shown.reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500">MEMBER DASHBOARD</p>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase mt-2">Hey, {user.name.split(" ")[0]}</h1>
          <p className="font-mono text-xs text-ink-400 mt-2">{user.email} · {user.role === "admin" ? "ADMIN ACCESS" : "Velocity member"}</p>
        </div>
        {user.role === "admin" && <Link to="/admin" className="clip-btn bg-gold-400 text-ink-950 hover:bg-gold-400/80 font-mono text-xs tracking-[0.2em] uppercase px-6 py-3.5 transition-colors flex items-center gap-2"><Ic.shield className="w-4 h-4" /> Admin console</Link>}
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8 items-start">
        <aside className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2">
          {tabs.map(([k, label, Icon]) => (
            <button key={k} onClick={() => setParams({ tab: k })} className={`flex items-center gap-3 px-4 py-3 font-mono text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-colors border-l-2 ${tab === k ? "border-blaze-500 bg-ink-850 text-ink-50" : "border-transparent text-ink-400 hover:text-ink-100"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 font-mono text-xs tracking-[0.15em] uppercase text-danger-400 hover:bg-danger-500/10 border-l-2 border-transparent mt-2 whitespace-nowrap"><Ic.logout className="w-4 h-4" /> Sign out</button>
        </aside>

        <div className="min-w-0">
          {tab === "overview" && (
            <div className="space-y-6 anim-fade-up">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  [String(shown.length), "Orders", Ic.box], [fmt(spend), "Lifetime spend", Ic.chart], [String(wishlist.length), "Saved items", Ic.heart],
                ].map(([n, l, Icon]: unknown[]) => {
                  const IconC = Icon as (p: { className?: string }) => React.ReactElement;
                  return (
                    <div key={l as string} className="border border-ink-700/60 bg-ink-850 clip-tile p-6 hover:border-blaze-500/50 transition-colors">
                      <IconC className="w-5 h-5 text-blaze-500" />
                      <p className="font-display text-3xl font-black mt-3 tabnum">{n as string}</p>
                      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-400 mt-1">{l as string}</p>
                    </div>
                  );
                })}
              </div>
              <div className="border border-ink-700/60 bg-ink-850 clip-tile p-6">
                <div className="flex justify-between items-center mb-4"><h3 className="font-display font-bold uppercase">Recent orders</h3><button onClick={() => setParams({ tab: "orders" })} className="font-mono text-[10px] tracking-[0.2em] uppercase text-blaze-400 hover:text-blaze-300">{t("viewAll")} →</button></div>
                {shown.slice(0, 3).map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-4 py-3 border-t border-ink-800 first:border-0 flex-wrap">
                    <span className="font-mono text-sm">{o.id}</span>
                    <span className="font-mono text-[11px] text-ink-400">{new Date(o.date).toLocaleDateString()}</span>
                    <StatusPill s={o.status} />
                    <span className="font-mono tabnum text-sm font-bold">{fmt(o.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-4 anim-fade-up">
              {shown.map((o) => (
                <div key={o.id} className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
                  <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="w-full flex items-center justify-between gap-4 p-5 flex-wrap text-left hover:bg-ink-800/50 transition-colors">
                    <span className="font-mono text-sm font-bold">{o.id}</span>
                    <span className="font-mono text-[11px] text-ink-400">{new Date(o.date).toLocaleDateString()} · {o.method}</span>
                    <StatusPill s={o.status} />
                    <span className="font-mono tabnum font-bold">{fmt(o.total)}</span>
                    <Ic.chev className={`w-4 h-4 text-ink-500 transition-transform ${expanded === o.id ? "rotate-180" : ""}`} />
                  </button>
                  {expanded === o.id && (
                    <div className="px-5 pb-6 border-t border-ink-800 anim-fade-in">
                      <Timeline order={o} />
                      <div className="mt-6 space-y-2.5">
                        {o.items.map((it, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-12 h-12 bg-ink-900 clip-tag overflow-hidden shrink-0"><ImgX src={it.img} alt={it.name} className="w-full h-full object-cover" style={it.imgFilter ? { filter: it.imgFilter } : undefined} /></span>
                            <span className="flex-1 text-sm">{it.name} <span className="font-mono text-[10px] text-ink-500">· {it.color} / {it.size} × {it.qty}</span></span>
                            <span className="font-mono tabnum text-sm">{fmt(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-mono text-[11px] text-ink-500 mt-4">Ship to: {o.address} · Paid via {o.payment}</p>
                      <div className="flex gap-3 mt-5 flex-wrap">
                        <button onClick={() => setInvoice(o)} className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors"><Ic.print className="w-3.5 h-3.5" /> Invoice</button>
                        {(o.status === "pending" || o.status === "processing") && (
                          <button onClick={() => cancelOrder(o.id)} className="clip-tag border border-danger-500/50 text-danger-400 hover:bg-danger-500 hover:text-ink-50 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors">Cancel order</button>
                        )}
                        {o.status === "delivered" && <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase text-volt-400"><Ic.check className="w-3.5 h-3.5" /> Delivered — rate your gear on the product page</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "wishlist" && (
            <div className="anim-fade-up">
              {wishItems.length === 0 ? <p className="text-sm text-ink-400 border border-dashed border-ink-700 p-10 text-center">Wishlist is empty — tap ♥ on any product.</p> : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">{wishItems.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
              )}
            </div>
          )}

          {tab === "addresses" && (
            <div className="anim-fade-up">
              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div key={a.id} className="border border-ink-700/60 bg-ink-850 clip-tile p-6 relative group">
                    <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase">{a.label}</p>
                    <p className="font-semibold mt-2">{a.name}</p>
                    <p className="text-sm text-ink-300 mt-1">{a.line1}<br />{a.city} {a.zip}, {a.country}<br /><span className="font-mono text-xs text-ink-500">{a.phone}</span></p>
                    <button onClick={() => { deleteAddress(a.id); toast("info", "Address removed"); }} className="absolute top-4 right-4 p-1.5 text-ink-500 hover:text-danger-400 opacity-0 group-hover:opacity-100 transition-all"><Ic.trash className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => { setAddrForm(true); setAddr({ id: `a${Date.now()}`, label: "Home", name: user.name, line1: "", city: "", zip: "", country: "United States", phone: "" }); }} className="border border-dashed border-ink-600 hover:border-blaze-500 hover:text-blaze-400 clip-tile min-h-40 grid place-items-center font-mono text-xs tracking-[0.2em] uppercase transition-colors text-ink-400">
                  <span className="flex items-center gap-2"><Ic.plus className="w-4 h-4" /> Add address</span>
                </button>
              </div>
              <Modal open={addrForm} onClose={() => setAddrForm(false)}>
                <div className="p-8">
                  <h3 className="font-display text-xl font-bold uppercase mb-5">New address</h3>
                  <div className="space-y-3">
                    {([["label", "Label (Home / Office)"], ["name", "Full name"], ["line1", "Street address"], ["city", "City"], ["zip", "ZIP"], ["country", "Country"], ["phone", "Phone"]] as const).map(([k, ph]) => (
                      <input key={k} placeholder={ph} value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm transition-colors" />
                    ))}
                    <button onClick={() => { if (!addr.line1 || !addr.city) { toast("error", "Street and city required"); return; } saveAddress(addr); setAddrForm(false); toast("success", "Address saved"); }} className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3.5 transition-colors">Save address</button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {tab === "payments" && (
            <div className="anim-fade-up">
              <div className="grid sm:grid-cols-2 gap-4">
                {payMethods.map((m) => (
                  <div key={m.id} className="relative border border-ink-700/60 bg-gradient-to-br from-ink-800 to-ink-850 clip-tile p-6 overflow-hidden group">
                    <div className="absolute -right-6 -top-10 font-display font-black text-[7rem] leading-none text-outline opacity-30 select-none">{m.brand === "VISA" ? "V" : "M"}</div>
                    <p className="font-mono text-[10px] tracking-[0.25em] text-ink-400 uppercase">{m.brand}</p>
                    <p className="font-mono text-lg tracking-[0.2em] mt-6">•••• •••• •••• {m.last4}</p>
                    <p className="font-mono text-xs text-ink-400 mt-1">Expires {m.exp}</p>
                    <button onClick={() => { deletePayMethod(m.id); toast("info", "Card removed"); }} className="absolute top-4 right-4 p-1.5 text-ink-500 hover:text-danger-400 opacity-0 group-hover:opacity-100 transition-all"><Ic.trash className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setCardForm(true)} className="border border-dashed border-ink-600 hover:border-blaze-500 hover:text-blaze-400 clip-tile min-h-40 grid place-items-center font-mono text-xs tracking-[0.2em] uppercase transition-colors text-ink-400">
                  <span className="flex items-center gap-2"><Ic.plus className="w-4 h-4" /> Add card</span>
                </button>
              </div>
              <Modal open={cardForm} onClose={() => setCardForm(false)}>
                <div className="p-8">
                  <h3 className="font-display text-xl font-bold uppercase mb-5">Add payment method</h3>
                  <input placeholder="Card number (tokenized — never stored raw)" value={newCard} onChange={(e) => setNewCard(e.target.value)} className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm mb-3 transition-colors" />
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <input placeholder="MM/YY" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm transition-colors" />
                    <input placeholder="CVC" className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm transition-colors" />
                  </div>
                  <button onClick={() => { if (newCard.replace(/\s/g, "").length < 12) { toast("error", "Enter a valid card number"); return; } addPayMethod({ id: `p${Date.now()}`, brand: newCard.startsWith("5") ? "MASTERCARD" : "VISA", last4: newCard.slice(-4), exp: "12/29" }); setCardForm(false); setNewCard(""); toast("success", "Card tokenized & saved"); }} className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3.5 transition-colors">Save card</button>
                </div>
              </Modal>
              <p className="font-mono text-[10px] text-ink-500 mt-5 flex items-center gap-2"><Ic.shield className="w-4 h-4 text-volt-400" /> PCI-DSS compliant tokenization via Stripe Vault (demo).</p>
            </div>
          )}

          {tab === "settings" && (
            <div className="anim-fade-up space-y-4 max-w-xl">
              <div className="border border-ink-700/60 bg-ink-850 clip-tile p-6">
                <h3 className="font-display font-bold uppercase mb-4">Profile</h3>
                <p className="text-sm text-ink-300">{user.name} · {user.email}</p>
                <p className="font-mono text-[10px] text-ink-500 mt-2 tracking-wide uppercase">Role: {user.role} · Email verified ✓ · JWT session active</p>
              </div>
              <div className="border border-ink-700/60 bg-ink-850 clip-tile p-6">
                <h3 className="font-display font-bold uppercase mb-4">Preferences</h3>
                <div className="flex gap-3">
                  <button onClick={store.toggleTheme} className="clip-tag border border-ink-600 hover:border-blaze-500 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors">{store.theme === "dark" ? <Ic.sun className="w-4 h-4" /> : <Ic.moon className="w-4 h-4" />} {store.theme === "dark" ? "Light mode" : "Dark mode"}</button>
                  <select value={store.lang} onChange={(e) => store.set({ lang: e.target.value as "en" | "hi" | "es" })} className="bg-ink-950 border border-ink-600 outline-none px-3 font-mono text-xs uppercase cursor-pointer">
                    <option value="en">English</option><option value="hi">हिन्दी</option><option value="es">Español</option>
                  </select>
                  <select value={store.currency} onChange={(e) => store.set({ currency: e.target.value })} className="bg-ink-950 border border-ink-600 outline-none px-3 font-mono text-xs cursor-pointer">
                    <option value="USD">USD $</option><option value="EUR">EUR €</option><option value="GBP">GBP £</option><option value="INR">INR ₹</option>
                  </select>
                </div>
              </div>
              <div className="border border-danger-500/30 bg-danger-500/5 clip-tile p-6">
                <h3 className="font-display font-bold uppercase text-danger-400 mb-2">GDPR — your data</h3>
                <p className="text-sm text-ink-300 mb-4">Export or erase everything we hold about you. Response within 30 days.</p>
                <div className="flex gap-3">
                  <button onClick={() => toast("success", "Data export queued — download link will be emailed")} className="clip-tag border border-ink-600 hover:border-volt-400 hover:text-volt-400 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors">Export data</button>
                  <button onClick={() => toast("info", "Erasure request submitted (demo)")} className="clip-tag border border-danger-500/50 text-danger-400 hover:bg-danger-500 hover:text-ink-50 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors">Delete account</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {invoice && <Invoice order={invoice} onClose={() => setInvoice(null)} />}
    </div>
  );
}
