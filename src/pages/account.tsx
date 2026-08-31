import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../lib/store";
import type { Order, OrderStatus } from "../data/catalog";
import { Ic, Modal, PImg, Stars } from "../components/ui";
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
          <div className="flex items-center gap-2"><Ic.cake className="w-7 h-7 text-blaze-500" /><span className="font-display font-extrabold text-xl">CakeUrban</span></div>
          <div className="text-right font-mono text-xs text-ink-400"><p>INVOICE — {order.id}</p><p>{new Date(order.date).toLocaleDateString()}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-6 py-5 text-sm">
          <div><p className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase mb-1.5">Billed to</p><p className="font-semibold">{order.email}</p><p className="text-ink-300 text-sm mt-1">{order.address}</p></div>
          <div className="text-right"><p className="font-mono text-[10px] tracking-[0.2em] text-ink-500 uppercase mb-1.5">Fulfilled by</p><p className="font-semibold">CakeUrban Bakehouse</p><p className="text-ink-300 text-sm mt-1">14 Sugar Lane, Austin TX</p></div>
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
        <p className="font-mono text-[9px] text-ink-500 mt-6 tracking-wide">Payment: {order.payment} · Delivery: {order.method} · Thank you for baking with CakeUrban</p>
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
  const { user, updateProfile, orders, fmt, t, cancelOrder, logout, addresses, saveAddress, deleteAddress, payMethods, addPayMethod, deletePayMethod, wishlist, products, toast } = store;
  const { openAuth } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") ?? "overview";
  const [expanded, setExpanded] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<Order | null>(null);

  // Profile Edit State
  const [profName, setProfName] = useState(user?.name ?? "");
  const [profPhone, setProfPhone] = useState(user?.phone ? user.phone.replace(/\D/g, "").slice(-10) : "");
  const [profPhoto, setProfPhoto] = useState(user?.photoURL ?? "");
  const [profSaving, setProfSaving] = useState(false);

  // Address State
  const [addrForm, setAddrForm] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<string | null>(null);
  const [addr, setAddr] = useState({ id: "", label: "Home", name: "", line1: "", city: "Faridabad", zip: "121002", country: "India", phone: "" });
  
  // Card State
  const [cardForm, setCardForm] = useState(false);
  const [newCard, setNewCard] = useState("");

  useEffect(() => {
    if (user) {
      setProfName(user.name);
      setProfPhone(user.phone ? user.phone.replace(/\D/g, "").slice(-10) : "");
      setProfPhoto(user.photoURL ?? "");
    }
  }, [user]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <Ic.lock className="w-12 h-12 mx-auto text-ink-600 mb-5" />
        <h1 className="font-display text-3xl font-black uppercase">Member area</h1>
        <p className="text-ink-400 mt-3">Sign in to see orders, live delivery tracking, addresses and saved bakes.</p>
        <button onClick={() => openAuth("login")} className="clip-btn mt-8 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-9 py-4 transition-colors">Sign in / create account</button>
        <p className="font-mono text-[10px] text-ink-500 mt-5">WhatsApp Concierge: +91 7318531953</p>
      </div>
    );
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("error", "Image file must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setProfPhoto(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = profPhone.replace(/\D/g, "");
    if (!profName.trim()) {
      toast("error", "Please enter your name.");
      return;
    }
    if (cleanPhone.length < 10) {
      toast("error", "A valid 10-digit mobile phone number is required.");
      return;
    }
    setProfSaving(true);
    await updateProfile({
      name: profName.trim(),
      phone: `+91 ${cleanPhone.slice(-10)}`,
      photoURL: profPhoto || undefined,
    });
    setProfSaving(false);
    toast("success", "Profile details synced live to database!");
  };

  const openNewAddress = () => {
    setEditingAddrId(null);
    setAddr({
      id: `a${Date.now()}`,
      label: "Home",
      name: user.name,
      line1: "",
      city: "Faridabad",
      zip: "121002",
      country: "India",
      phone: user.phone ? user.phone.replace(/\D/g, "").slice(-10) : "",
    });
    setAddrForm(true);
  };

  const openEditAddress = (existing: typeof addr) => {
    setEditingAddrId(existing.id);
    setAddr({ ...existing });
    setAddrForm(true);
  };

  const handleSaveAddress = () => {
    if (!addr.line1.trim() || !addr.city.trim() || !addr.name.trim()) {
      toast("error", "Name, street address, and city are required.");
      return;
    }
    const cleanP = addr.phone.replace(/\D/g, "");
    if (cleanP.length < 10) {
      toast("error", "Please enter a valid 10-digit phone number for delivery updates.");
      return;
    }
    saveAddress({
      ...addr,
      phone: `+91 ${cleanP.slice(-10)}`,
    });
    setAddrForm(false);
    toast("success", editingAddrId ? "Address updated successfully!" : "New address saved to your account!");
  };

  const myOrders = orders.filter((o) => o.email === user.email || o.email.startsWith("customer")).slice(0, user.email.startsWith("customer") ? 0 : undefined).filter((o) => o.email === user.email || o.id === "CU-9100");
  const shown = myOrders.length ? myOrders : orders.slice(0, 4);
  const tabs = [
    ["overview", "Overview", Ic.chart],
    ["profile", "My Profile", Ic.user],
    ["orders", "Orders", Ic.box],
    ["wishlist", t("wishlist"), Ic.heart],
    ["addresses", "Addresses", Ic.pin],
    ["payments", "Payments", Ic.card],
    ["settings", "Settings", Ic.settings],
  ] as const;
  const wishItems = products.filter((p) => wishlist.includes(p.id));
  const spend = shown.reduce((s, o) => s + o.total, 0);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="flex flex-wrap items-center justify-between gap-6 mb-10 pb-8 border-b border-ink-800">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-ink-800 border-2 border-blaze-500 shrink-0 grid place-items-center">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <Ic.user className="w-8 h-8 text-ink-300" />
            )}
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500">MEMBER DASHBOARD</p>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase mt-1">{user.name}</h1>
            <p className="font-mono text-xs text-ink-400 mt-1">
              {user.email} · {user.phone ? <span className="text-emerald-400 font-semibold">{user.phone}</span> : <span className="text-danger-400">Phone Missing</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/917318531953?text=Hi%20CakeUrban,%20I%20am%20logged%20in%20and%20need%20assistance%20with%20my%20order"
            target="_blank"
            rel="noreferrer"
            className="clip-btn bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs tracking-wider uppercase px-4 py-3 transition-colors flex items-center gap-2 font-bold"
          >
            <Ic.whatsapp className="w-4 h-4 fill-current" /> WhatsApp Help
          </a>
          {user.role === "admin" && (
            <Link to="/admin" className="clip-btn bg-gold-400 text-ink-950 hover:bg-gold-400/80 font-mono text-xs tracking-[0.2em] uppercase px-5 py-3 transition-colors flex items-center gap-2">
              <Ic.shield className="w-4 h-4" /> Admin console
            </Link>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-8 items-start">
        <aside className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2">
          {tabs.map(([k, label, Icon]) => (
            <button key={k} onClick={() => setParams({ tab: k })} className={`flex items-center gap-3 px-4 py-3 font-mono text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-colors border-l-2 ${tab === k ? "border-blaze-500 bg-ink-850 text-ink-50 font-bold" : "border-transparent text-ink-400 hover:text-ink-100"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 font-mono text-xs tracking-[0.15em] uppercase text-danger-400 hover:bg-danger-500/10 border-l-2 border-transparent mt-2 whitespace-nowrap"><Ic.logout className="w-4 h-4" /> Sign out</button>
        </aside>

        <div className="min-w-0">
          {/* PROFILE EDIT TAB */}
          {tab === "profile" && (
            <div className="space-y-6 anim-fade-up max-w-2xl">
              <div className="border border-ink-700/60 bg-ink-850 clip-tile p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-ink-800">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase">Edit Profile</h3>
                    <p className="text-xs text-ink-400 mt-1">Manage your identity, mandatory phone number, and avatar.</p>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 clip-tag">
                    ● Realtime DB Synced
                  </span>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 bg-ink-900 border border-ink-750 clip-tag">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-ink-950 border-2 border-blaze-500 shrink-0 grid place-items-center">
                      {profPhoto ? (
                        <img src={profPhoto} alt={profName} className="w-full h-full object-cover" />
                      ) : (
                        <Ic.user className="w-10 h-10 text-ink-400" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-ink-100">Profile Picture</p>
                      <p className="text-xs text-ink-400">Upload a crisp photo for personalized bakery receipts and account identification (Max 2MB).</p>
                      <div className="flex gap-2">
                        <label className="clip-btn inline-flex items-center gap-2 bg-ink-800 hover:bg-ink-700 text-ink-100 border border-ink-600 font-mono text-xs uppercase px-3.5 py-2 cursor-pointer transition-colors">
                          <Ic.camera className="w-3.5 h-3.5 text-blaze-400" /> Choose Photo
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                        {profPhoto && (
                          <button
                            type="button"
                            onClick={() => setProfPhoto("")}
                            className="clip-tag border border-ink-700 hover:border-danger-400 text-ink-400 hover:text-danger-400 font-mono text-xs uppercase px-3 py-2 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-ink-300 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm text-ink-100 transition-colors"
                      placeholder="e.g. Abhi Sharma"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-ink-300 mb-1.5">Mobile Phone Number (Mandatory) *</label>
                    <div className="flex">
                      <span className="flex items-center justify-center px-4 bg-ink-900 border border-r-0 border-ink-600 font-mono text-sm text-ink-200 select-none">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="flex-1 bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 font-mono text-sm text-ink-100 transition-colors placeholder:text-ink-500"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <p className="font-mono text-[10px] text-ink-500 mt-1.5">Used for live SMS rider dispatch and WhatsApp cake preview verification.</p>
                  </div>

                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-ink-300 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-ink-900 border border-ink-700 opacity-70 cursor-not-allowed outline-none px-4 py-3 text-sm text-ink-400"
                    />
                    <p className="font-mono text-[10px] text-ink-500 mt-1">Managed via Firebase Authentication.</p>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={profSaving}
                      className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 disabled:opacity-60 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3.5 font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      {profSaving ? "Saving to Cloud..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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

              {/* Quick Profile preview tile */}
              <div className="border border-ink-700/60 bg-ink-850 clip-tile p-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-ink-900 border border-blaze-500 grid place-items-center">
                    {user.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : <Ic.user className="w-6 h-6 text-ink-400" />}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm uppercase">{user.name}</h4>
                    <p className="font-mono text-xs text-ink-400">{user.phone || "No phone linked"} · {user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setParams({ tab: "profile" })}
                  className="clip-tag border border-ink-600 hover:border-blaze-500 text-blaze-400 font-mono text-xs uppercase px-4 py-2 flex items-center gap-1.5 transition-colors"
                >
                  <Ic.edit className="w-3.5 h-3.5" /> Edit Profile & Photo
                </button>
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
                            <span className="w-12 h-12 bg-ink-900 clip-tag overflow-hidden shrink-0"><PImg src={it.img} crop={it.crop} filter={it.imgFilter} alt={it.name} className="w-full h-full object-cover" /></span>
                            <span className="flex-1 text-sm">{it.name} <span className="font-mono text-[10px] text-ink-500">· {it.color} / {it.size} × {it.qty}</span></span>
                            <span className="font-mono tabnum text-sm">{fmt(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                      <p className="font-mono text-[11px] text-ink-500 mt-4">Ship to: {o.address} · Paid via {o.payment}</p>
                      <div className="flex gap-3 mt-5 flex-wrap">
                        <button onClick={() => setInvoice(o)} className="clip-tag border border-ink-600 hover:border-blaze-500 hover:text-blaze-400 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-2 transition-colors"><Ic.print className="w-3.5 h-3.5" /> Invoice</button>
                        <a
                          href={`https://wa.me/917318531953?text=${encodeURIComponent(`Hi CakeUrban, I want live tracking for my Order ${o.id}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="clip-tag border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase flex items-center gap-1.5 transition-colors"
                        >
                          <Ic.whatsapp className="w-3.5 h-3.5 fill-current" /> WhatsApp Track
                        </a>
                        {(o.status === "pending" || o.status === "processing") && (
                          <button onClick={() => cancelOrder(o.id)} className="clip-tag border border-danger-500/50 text-danger-400 hover:bg-danger-500 hover:text-ink-50 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors">Cancel order</button>
                        )}
                        {o.status === "delivered" && <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase text-volt-400"><Ic.check className="w-3.5 h-3.5" /> Delivered — fresh from oven</span>}
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
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-5">{wishItems.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
              )}
            </div>
          )}

          {/* ADDRESSES MANAGEMENT */}
          {tab === "addresses" && (
            <div className="anim-fade-up space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold uppercase">Saved Delivery Addresses</h3>
                  <p className="text-xs text-ink-400 mt-1">Manage multiple addresses for instant checkout delivery.</p>
                </div>
                <button
                  onClick={openNewAddress}
                  className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-wider uppercase px-4 py-2.5 transition-colors flex items-center gap-2 font-bold"
                >
                  <Ic.plus className="w-4 h-4" /> Add Address
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {addresses.map((a) => (
                  <div key={a.id} className="border border-ink-700/60 bg-ink-850 clip-tile p-6 relative group flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase bg-blaze-500/10 px-2 py-0.5 clip-tag border border-blaze-500/30">
                          {a.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditAddress(a)}
                            className="text-ink-400 hover:text-blaze-400 p-1 transition-colors"
                            title="Edit Address"
                          >
                            <Ic.edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { deleteAddress(a.id); toast("info", "Address removed"); }}
                            className="text-ink-400 hover:text-danger-400 p-1 transition-colors"
                            title="Delete Address"
                          >
                            <Ic.trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold text-base text-ink-100">{a.name}</p>
                      <p className="text-sm text-ink-300 mt-1.5 leading-relaxed">{a.line1}</p>
                      <p className="text-sm text-ink-300">{a.city}, {a.zip} · {a.country}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-ink-800 flex items-center justify-between">
                      <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                        <Ic.phone className="w-3.5 h-3.5" /> {a.phone || user.phone}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  onClick={openNewAddress}
                  className="border border-dashed border-ink-600 hover:border-blaze-500 hover:text-blaze-400 clip-tile min-h-40 grid place-items-center font-mono text-xs tracking-[0.2em] uppercase transition-colors text-ink-400 p-6"
                >
                  <span className="flex items-center gap-2"><Ic.plus className="w-4 h-4" /> Add New Address</span>
                </button>
              </div>

              {/* Add / Edit Address Modal */}
              <Modal open={addrForm} onClose={() => setAddrForm(false)}>
                <div className="p-8 max-w-lg mx-auto">
                  <h3 className="font-display text-xl font-bold uppercase mb-2">
                    {editingAddrId ? "Edit Delivery Address" : "Add Delivery Address"}
                  </h3>
                  <p className="text-xs text-ink-400 mb-6">Enter exact street and contact details for live GPS rider delivery.</p>

                  <div className="space-y-3.5">
                    <div className="flex gap-2">
                      {["Home", "Office", "Celebration Venue", "Other"].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setAddr({ ...addr, label: lbl })}
                          className={`flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider clip-tag border transition-colors ${addr.label === lbl ? "border-blaze-500 bg-blaze-500 text-ink-50 font-bold" : "border-ink-700 bg-ink-900 text-ink-400 hover:text-ink-200"}`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Recipient Name *</label>
                      <input
                        placeholder="e.g. Abhi Kumar"
                        value={addr.name}
                        onChange={(e) => setAddr({ ...addr, name: e.target.value })}
                        className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-2.5 text-sm transition-colors text-ink-100"
                      />
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Mobile Phone Number (Mandatory) *</label>
                      <div className="flex">
                        <span className="flex items-center justify-center px-3 bg-ink-900 border border-r-0 border-ink-600 font-mono text-xs text-ink-200 select-none">+91</span>
                        <input
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={addr.phone.replace(/\D/g, "").slice(0, 10)}
                          onChange={(e) => setAddr({ ...addr, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          className="flex-1 bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-2.5 font-mono text-sm transition-colors text-ink-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">House / Flat / Street / Landmark *</label>
                      <input
                        placeholder="Flat 402, Green Valley Apartments, Sector 15"
                        value={addr.line1}
                        onChange={(e) => setAddr({ ...addr, line1: e.target.value })}
                        className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-2.5 text-sm transition-colors text-ink-100"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">City *</label>
                        <input
                          placeholder="Faridabad"
                          value={addr.city}
                          onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                          className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-2.5 text-sm transition-colors text-ink-100"
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Pincode *</label>
                        <input
                          placeholder="121002"
                          value={addr.zip}
                          onChange={(e) => setAddr({ ...addr, zip: e.target.value })}
                          className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-2.5 text-sm transition-colors text-ink-100"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex gap-3">
                      <button
                        onClick={handleSaveAddress}
                        className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3.5 transition-colors font-bold"
                      >
                        {editingAddrId ? "Update Address" : "Save Address"}
                      </button>
                      <button
                        onClick={() => setAddrForm(false)}
                        className="clip-tag border border-ink-700 hover:border-ink-500 font-mono text-xs tracking-wider uppercase px-4 py-3.5 text-ink-300"
                      >
                        Cancel
                      </button>
                    </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold uppercase">Profile</h3>
                  <button
                    onClick={() => setParams({ tab: "profile" })}
                    className="font-mono text-xs text-blaze-400 hover:text-blaze-300 uppercase tracking-wider flex items-center gap-1"
                  >
                    <Ic.edit className="w-3.5 h-3.5" /> Edit Profile & Photo
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-ink-900 border border-blaze-500 grid place-items-center">
                    {user.photoURL ? <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" /> : <Ic.user className="w-5 h-5 text-ink-400" />}
                  </div>
                  <div>
                    <p className="text-sm text-ink-100 font-semibold">{user.name}</p>
                    <p className="text-xs text-ink-400">{user.email}</p>
                  </div>
                </div>
                <p className="font-mono text-[11px] text-emerald-400">Mobile: {user.phone || "No phone provided"}</p>
                <p className="font-mono text-[10px] text-ink-500 mt-2 tracking-wide uppercase">Role: {user.role} · Email verified ✓ · Realtime DB Synced</p>
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
