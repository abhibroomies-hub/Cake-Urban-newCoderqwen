import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../lib/store";
import type { Order } from "../data/catalog";
import { Ic, PImg } from "../components/ui";
import { useAuth } from "../components/chrome";

const STEPS = ["Information", "Shipping", "Payment"];

export default function Checkout() {
  const { cart, products, fmt, t, cartSubtotal, couponFor, placeOrder, user, addresses, settings, toast } = useStore();
  const { openAuth } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [info, setInfo] = useState({
    email: user?.email ?? "",
    name: user?.name ?? "",
    phone: user?.phone ? user.phone.replace(/\D/g, "").slice(-10) : (addresses[0]?.phone ? addresses[0].phone.replace(/\D/g, "").slice(-10) : ""),
    addr: addresses[0]?.line1 ?? "",
    city: addresses[0]?.city ?? "Faridabad",
    zip: addresses[0]?.zip ?? "121002",
    country: addresses[0]?.country ?? "India",
  });
  const [shipIdx, setShipIdx] = useState(0);
  const [payTab, setPayTab] = useState<"card" | "razorpay" | "paypal">("card");
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; type: string; value: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const [err, setErr] = useState("");

  const shipMethods = [
    { label: "Same-day rider", eta: "Within ~90 minutes (order by 4 PM)", cost: cartSubtotal >= (settings.zones[0]?.freeOver ?? 49) ? 0 : settings.zones[0]?.rate ?? 4.9 },
    { label: "Next-morning", eta: "Before 11 AM tomorrow, chilled", cost: cartSubtotal >= 90 ? 0 : 9 },
    { label: "Celebration slot", eta: "Pick a 2-hour window, dressed & boxed", cost: 19 },
  ];
  const discount = applied?.type === "percent" ? (cartSubtotal * applied.value) / 100 : applied?.type === "fixed" ? Math.min(applied.value, cartSubtotal) : 0;
  const shipCost = applied?.type === "ship" ? 0 : shipMethods[shipIdx].cost;
  const total = cartSubtotal - discount + shipCost;

  const next = () => {
    setErr("");
    if (step === 0) {
      const cleanPhone = info.phone.replace(/\D/g, "");
      if (!info.email.includes("@") || !info.name.trim() || !info.addr.trim() || !info.city.trim()) {
        setErr("Please fill in your email, full name, street address, and city.");
        return;
      }
      if (cleanPhone.length < 10) {
        setErr("Mandatory Mobile Number: Please enter a valid 10-digit phone number for live delivery dispatch and WhatsApp tracking.");
        return;
      }
    }
    if (step === 1 && shipIdx < 0) { setErr("Pick a delivery method."); return; }
    setStep(step + 1);
  };

  const confirm = () => {
    setErr("");
    if (payTab === "card") {
      if (card.num.replace(/\s/g, "").length < 12 || !card.exp || card.cvc.length < 3) { setErr("Enter valid card details (any test numbers work)."); return; }
    }
    setProcessing(true);
    setTimeout(() => {
      const order = placeOrder({
        address: `${info.addr}, ${info.city} ${info.zip}, ${info.country}`,
        method: shipMethods[shipIdx].label,
        shipCost,
        payment: payTab === "card" ? `Card •••• ${card.num.slice(-4) || "4242"}` : payTab === "razorpay" ? "Razorpay UPI" : "PayPal",
        coupon: applied?.code,
        email: info.email,
        customerName: info.name,
        customerPhone: info.phone,
      });
      setProcessing(false);
      setDone(order);
      window.scrollTo({ top: 0 });
    }, 1400);
  };

  /* ---------- success ---------- */
  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="anim-check inline-grid place-items-center w-24 h-24 border-2 border-volt-400 text-volt-400 clip-tile bg-volt-400/10">
          <Ic.check className="w-12 h-12" strokeWidth={2.4} />
        </div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-volt-400 uppercase mt-8">{t("orderPlaced")}</p>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase mt-3">Order <span className="text-blaze-500">{done.id}</span></h1>
        <p className="text-ink-300 mt-4 max-w-md mx-auto">Confirmation pushed to your notifications and emailed to <span className="text-ink-100">{done.email}</span>. Track it live from your dashboard.</p>
        <div className="mt-10 border border-ink-700/60 bg-ink-850 clip-tile p-6 text-left">
          <div className="flex justify-between font-mono text-sm"><span className="text-ink-400">Items</span><span>{done.items.reduce((s, i) => s + i.qty, 0)}</span></div>
          <div className="flex justify-between font-mono text-sm mt-2"><span className="text-ink-400">Delivery</span><span>{done.method}</span></div>
          <div className="flex justify-between font-mono text-sm mt-2"><span className="text-ink-400">Payment</span><span>{done.payment}</span></div>
          <div className="flex justify-between font-mono text-lg font-bold mt-4 pt-4 border-t border-ink-700"><span>{t("total")}</span><span className="tabnum">{fmt(done.total)}</span></div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Link to="/account?tab=orders" className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-7 py-3.5 transition-colors">Track order</Link>
          <Link to="/shop" className="clip-btn border border-ink-600 hover:border-ink-300 font-mono text-xs tracking-[0.2em] uppercase px-7 py-3.5 transition-colors">{t("continueShopping")}</Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 text-center">
        <Ic.bag className="w-12 h-12 mx-auto text-ink-600 mb-5" />
        <h1 className="font-display text-3xl font-black uppercase">{t("emptyCart")}</h1>
        <p className="text-ink-400 mt-3">Add something sweet first — checkout will be waiting.</p>
        <Link to="/shop" className="clip-btn inline-block mt-8 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-8 py-4 transition-colors">{t("shopNow")}</Link>
      </div>
    );
  }

  const inp = "w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-4 py-3 text-sm transition-colors placeholder:text-ink-500";

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
      <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500">SECURE CHECKOUT</p>
      <h1 className="font-display text-4xl md:text-5xl font-black uppercase mt-2">{t("checkout")}</h1>

      {/* step indicator */}
      <div className="flex items-center gap-0 mt-8 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button onClick={() => i < step && setStep(i)} className={`flex items-center gap-2.5 ${i < step ? "cursor-pointer" : "cursor-default"}`}>
              <span className={`w-8 h-8 grid place-items-center font-mono text-xs border transition-colors ${i < step ? "bg-volt-400 text-ink-950 border-volt-400" : i === step ? "bg-blaze-500 text-ink-50 border-blaze-500" : "border-ink-600 text-ink-500"}`}>
                {i < step ? <Ic.check className="w-4 h-4" /> : i + 1}
              </span>
              <span className={`font-mono text-[10px] tracking-[0.2em] uppercase hidden sm:block ${i === step ? "text-ink-100" : "text-ink-500"}`}>{s}</span>
            </button>
            {i < 2 && <span className={`flex-1 h-px mx-4 ${i < step ? "bg-volt-400" : "bg-ink-700"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10 items-start">
        <div>
          <motion.div key={step} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
            {step === 0 && (
              <div className="space-y-4">
                {!user && (
                  <button onClick={() => openAuth("login")} className="w-full flex items-center justify-between border border-cobalt-500/50 bg-cobalt-500/10 p-4 clip-tag hover:border-cobalt-400 transition-colors">
                    <span className="text-sm text-ink-200">Have an account? <span className="text-cobalt-300 font-semibold">Sign in</span> for one-tap checkout.</span>
                    <Ic.user className="w-5 h-5 text-cobalt-300" />
                  </button>
                )}
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 clip-tag flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 text-xs text-emerald-200">
                    <Ic.whatsapp className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Need urgent 30-min delivery slot or custom cake text? WhatsApp: <strong>+91 7318531953</strong></span>
                  </div>
                  <a
                    href="https://wa.me/917318531953?text=Hi%20CakeUrban,%20I%20need%20help%20with%20my%20cake%20checkout%20order"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider"
                  >
                    Chat Now →
                  </a>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Email Address *</label>
                    <input className={inp} type="email" placeholder="you@example.com" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Mobile Phone (Mandatory) *</label>
                    <div className="flex">
                      <span className="flex items-center justify-center px-3 bg-ink-900 border border-r-0 border-ink-600 font-mono text-xs text-ink-300 select-none">+91</span>
                      <input className={inp} type="tel" maxLength={10} placeholder="10-digit mobile number" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Recipient Full Name *</label>
                  <input className={inp} placeholder="Full Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">House / Flat / Street Address *</label>
                  <input className={inp} placeholder="Flat / House / Sector / Landmark" value={info.addr} onChange={(e) => setInfo({ ...info, addr: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">City / Region *</label>
                    <input className={inp} placeholder="e.g. Faridabad / Gurgaon" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Pincode *</label>
                    <input className={inp} placeholder="e.g. 121002" value={info.zip} onChange={(e) => setInfo({ ...info, zip: e.target.value })} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-400 mb-1">Country</label>
                    <input className={inp} placeholder="Country" value={info.country} onChange={(e) => setInfo({ ...info, country: e.target.value })} />
                  </div>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-3">
                {shipMethods.map((m, i) => (
                  <button key={m.label} onClick={() => setShipIdx(i)} className={`w-full flex items-center justify-between border p-5 clip-tag transition-all ${i === shipIdx ? "border-blaze-500 bg-blaze-500/10" : "border-ink-700 hover:border-ink-500"}`}>
                    <span className="flex items-center gap-4">
                      <span className={`w-4 h-4 rounded-full border-2 grid place-items-center ${i === shipIdx ? "border-blaze-500" : "border-ink-600"}`}>{i === shipIdx && <span className="w-1.5 h-1.5 rounded-full bg-blaze-500" />}</span>
                      <span className="text-left">
                        <span className="block font-display font-semibold">{m.label}</span>
                        <span className="block font-mono text-[11px] text-ink-400 mt-0.5">{m.eta}</span>
                      </span>
                    </span>
                    <span className="font-mono tabnum font-bold">{m.cost === 0 ? <span className="text-volt-400">FREE</span> : fmt(m.cost)}</span>
                  </button>
                ))}
                <p className="font-mono text-[10px] text-ink-500 tracking-wide flex items-center gap-2 pt-2"><Ic.truck className="w-4 h-4 text-blaze-500" /> Rates from your shipping zone settings · duties pre-calculated</p>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="flex border border-ink-600 font-mono text-[11px] tracking-[0.15em] uppercase">
                  {([["card", "Card"], ["razorpay", "Razorpay"], ["paypal", "PayPal"]] as const).filter(([k]) => k === "card" ? settings.payments.card : k === "razorpay" ? settings.payments.razorpay : settings.payments.paypal).map(([k, label]) => (
                    <button key={k} onClick={() => setPayTab(k)} className={`flex-1 py-3.5 transition-colors ${payTab === k ? "bg-blaze-500 text-ink-50" : "text-ink-400 hover:text-ink-100"}`}>{label}</button>
                  ))}
                </div>
                <div className="border border-ink-700 border-t-0 p-6 space-y-4">
                  {payTab === "card" && (
                    <>
                      <div className="relative">
                        <input className={inp} placeholder="Card number — 4242 4242 4242 4242" value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value })} />
                        <Ic.card className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input className={inp} placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
                        <input className={inp} placeholder="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
                      </div>
                    </>
                  )}
                  {payTab === "razorpay" && (
                    <div className="text-center py-6">
                      <p className="font-display font-bold text-lg">Razorpay Checkout</p>
                      <p className="text-sm text-ink-400 mt-2">UPI · Cards · Netbanking · Wallets. You'll be redirected to the secure Razorpay window (simulated in demo).</p>
                      <p className="font-mono text-[10px] text-volt-400 mt-4 tracking-wider">PCI-DSS · 256-BIT TLS</p>
                    </div>
                  )}
                  {payTab === "paypal" && (
                    <div className="text-center py-6">
                      <p className="font-display font-bold text-lg">PayPal Express</p>
                      <p className="text-sm text-ink-400 mt-2">Pay with your PayPal balance or linked cards. Buyer protection included (simulated in demo).</p>
                    </div>
                  )}
                  <p className="font-mono text-[10px] text-ink-500 flex items-center gap-2"><Ic.lock className="w-3.5 h-3.5 text-volt-400" /> Encrypted end-to-end — card data never touches our servers.</p>
                </div>
              </div>
            )}
          </motion.div>
          {err && <p className="mt-4 font-mono text-xs text-danger-400 border border-danger-500/40 bg-danger-500/10 p-3 clip-tag">{err}</p>}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="font-mono text-xs tracking-[0.18em] uppercase text-ink-400 hover:text-ink-100 transition-colors">← Back</button>
            ) : <Link to="/shop" className="font-mono text-xs tracking-[0.18em] uppercase text-ink-400 hover:text-ink-100 transition-colors">← {t("continueShopping")}</Link>}
            {step < 2 ? (
              <button onClick={next} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-8 py-3.5 transition-colors flex items-center gap-2">Continue <Ic.arrow className="w-4 h-4" /></button>
            ) : (
              <button onClick={confirm} disabled={processing} className="clip-btn bg-blaze-500 hover:bg-blaze-400 disabled:opacity-60 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-8 py-3.5 transition-colors flex items-center gap-3">
                {processing ? <><span className="w-4 h-4 border-2 border-ink-50 border-t-transparent rounded-full animate-spin" /> Processing…</> : <>Pay {fmt(total)} <Ic.lock className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>

        {/* summary */}
        <aside className="border border-ink-700/60 bg-ink-850 clip-tile p-6 lg:sticky lg:top-28">
          <h3 className="font-display font-bold uppercase tracking-wide mb-5">Order summary</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {cart.map((it) => {
              const p = products.find((x) => x.id === it.productId);
              if (!p) return null;
              return (
                <div key={`${it.productId}${it.color}${it.size}`} className="flex items-center gap-3">
                  <span className="relative w-14 h-14 bg-ink-900 clip-tag overflow-hidden shrink-0">
                    <PImg src={p.img} crop={p.crop} filter={p.imgFilter} alt={p.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-0 -right-0 w-5 h-5 grid place-items-center bg-blaze-500 text-ink-50 font-mono text-[9px]">{it.qty}</span>
                  </span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{p.name}</p><p className="font-mono text-[10px] text-ink-500">{it.color} · {it.size}</p></div>
                  <span className="font-mono tabnum text-sm">{fmt(p.price * it.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-5">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("couponPh")} className="flex-1 bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 font-mono text-xs uppercase transition-colors" />
            <button onClick={() => {
              const r = couponFor(code);
              if (r.ok && r.coupon) { setApplied({ code: r.coupon.code, type: r.coupon.type, value: r.coupon.value }); toast("success", r.msg); }
              else toast("error", r.msg);
            }} className="clip-tag bg-ink-100 text-ink-950 hover:bg-blaze-500 hover:text-ink-50 font-mono text-xs tracking-[0.12em] uppercase px-4 transition-colors">{t("apply")}</button>
          </div>
          <div className="space-y-2.5 mt-5 pt-5 border-t border-ink-700 font-mono text-sm">
            <div className="flex justify-between"><span className="text-ink-400">{t("subtotal")}</span><span className="tabnum">{fmt(cartSubtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-volt-400"><span>{t("discount")} ({applied?.code})</span><span className="tabnum">−{fmt(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-ink-400">{t("shipping")}</span><span className="tabnum">{shipCost === 0 ? <span className="text-volt-400">FREE</span> : fmt(shipCost)}</span></div>
            <div className="flex justify-between text-lg font-bold pt-3 border-t border-ink-700"><span>{t("total")}</span><span className="tabnum text-blaze-400">{fmt(total)}</span></div>
          </div>
          <div className="flex items-center gap-2 mt-5 font-mono text-[9px] tracking-[0.15em] text-ink-500 uppercase">
            <Ic.shield className="w-4 h-4 text-volt-400" /> Stripe · Razorpay · PayPal — tokenized
          </div>
        </aside>
      </div>
    </div>
  );
}
