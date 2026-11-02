import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useStore } from "../lib/store";
import type { Order } from "../data/catalog";
import { Ic, PImg } from "../components/ui";
import { useAuth } from "../components/chrome";
import { DeliverySlotPicker, type DeliverySlotValue, DELIVERY_SLOTS } from "../components/DeliverySlotPicker";
import { OrderTracker } from "../components/OrderTracker";

const STEPS = ["Information", "Delivery Slot", "Payment"];

export default function Checkout() {
  const { cart, products, fmt, t, cartSubtotal, couponFor, placeOrder, user, addresses, settings, toast } = useStore();
  const { openAuth } = useAuth();
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
  const [slotChoice, setSlotChoice] = useState<DeliverySlotValue>({
    date: new Date().toISOString().slice(0, 10),
    slotId: "express",
    slotLabel: DELIVERY_SLOTS[0].label,
    windowText: DELIVERY_SLOTS[0].window,
    surcharge: DELIVERY_SLOTS[0].surcharge,
    plaqueMessage: "",
    includeKit: true,
  });
  const [payTab, setPayTab] = useState<"card" | "razorpay" | "paypal" | "cod">("card");
  const [card, setCard] = useState({ num: "", exp: "", cvc: "" });
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; type: string; value: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<Order | null>(null);
  const [err, setErr] = useState("");

  const shipMethods = [
    { label: "⚡ 30-45 Min Express Rider", eta: "Hyperlocal insulated cold-box dispatch", cost: cartSubtotal >= (settings.zones[0]?.freeOver ?? 49) ? 0 : settings.zones[0]?.rate ?? 4.9 },
    { label: "🕰 Scheduled 2-Hour Window", eta: "Delivered chilled in your chosen slot", cost: 0 },
    { label: "🌙 12 AM Midnight Surprise", eta: "11:30 PM – 12:15 AM celebration courier", cost: 4 },
  ];
  const discount = applied?.type === "percent" ? (cartSubtotal * applied.value) / 100 : applied?.type === "fixed" ? Math.min(applied.value, cartSubtotal) : 0;
  const shipCost = applied?.type === "ship" ? 0 : slotChoice.surcharge;
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
      if (card.num.replace(/\s/g, "").length < 12 || !card.exp || card.cvc.length < 3) {
        setErr("Enter valid card details (any test numbers work).");
        return;
      }
    }
    setProcessing(true);
    setTimeout(() => {
      const formattedSlot = `${slotChoice.slotLabel} (${slotChoice.date} · ${slotChoice.windowText})`;

      const order = placeOrder({
        address: `${info.addr}, ${info.city} ${info.zip}, ${info.country}`,
        method: formattedSlot,
        shipCost,
        payment:
          payTab === "card"
            ? `Card •••• ${card.num.slice(-4) || "4242"}`
            : payTab === "razorpay"
            ? "Razorpay UPI"
            : payTab === "cod"
            ? "Cash on Delivery"
            : "PayPal",
        coupon: applied?.code,
        email: info.email,
        customerName: info.name,
        customerPhone: info.phone,
        deliverySlot: formattedSlot,
        plaqueMessage: slotChoice?.plaqueMessage || undefined,
      });
      setProcessing(false);
      setDone(order);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Celebratory Confetti Blast!
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#e23e5f", "#d69740", "#aacb78", "#ffffff"],
        });
      } catch {
        // ignore if confetti fails
      }
    }, 1200);
  };

  /* ---------- success ---------- */
  if (done) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="max-w-2xl mx-auto text-center">
          <div className="anim-check inline-grid place-items-center w-20 h-20 border-2 border-volt-400 text-volt-400 clip-tile bg-volt-400/10">
            <Ic.check className="w-10 h-10" strokeWidth={2.4} />
          </div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-volt-400 uppercase mt-6">{t("orderPlaced")}</p>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase mt-2">Order <span className="text-blaze-500">{done.id}</span></h1>
          <p className="text-ink-300 mt-3 max-w-md mx-auto">Confirmation sent to <span className="text-ink-100">{done.email}</span>. Track your live baking and rider dispatch below.</p>
          <div className="mt-8 border border-ink-700/60 bg-ink-850 clip-tile p-6 text-left">
            <div className="flex justify-between font-mono text-sm"><span className="text-ink-400">Items</span><span>{done.items.reduce((s, i) => s + i.qty, 0)}</span></div>
            <div className="flex justify-between font-mono text-sm mt-2"><span className="text-ink-400">Delivery Slot</span><span className="text-volt-400">{done.deliverySlot || done.method}</span></div>
            {done.plaqueMessage && (
              <div className="flex justify-between font-mono text-sm mt-2"><span className="text-ink-400">Cake Plaque</span><span className="text-blaze-400">"{done.plaqueMessage}"</span></div>
            )}
            <div className="flex justify-between font-mono text-sm mt-2"><span className="text-ink-400">Payment</span><span>{done.payment}</span></div>
            <div className="flex justify-between font-mono text-lg font-bold mt-4 pt-4 border-t border-ink-700"><span>{t("total")}</span><span className="tabnum">{fmt(done.total)}</span></div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-7">
            <Link to={`/track?id=${done.id}`} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase px-7 py-3.5 transition-colors font-bold">
              Open Full Live Tracker
            </Link>
            <Link to="/shop" className="clip-btn border border-ink-600 hover:border-ink-300 font-mono text-xs tracking-[0.2em] uppercase px-7 py-3.5 transition-colors">
              {t("continueShopping")}
            </Link>
          </div>
        </div>

        {/* Embedded Live Order Tracker */}
        <div className="mt-10">
          <OrderTracker initialOrderId={done.id} compact />
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
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-12">
      <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase">SECURE CHECKOUT</p>
      <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase mt-1">{t("checkout")}</h1>

      {/* step indicator */}
      <div className="flex items-center gap-0 mt-5 sm:mt-8 mb-6 sm:mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button onClick={() => i < step && setStep(i)} className={`flex items-center gap-1.5 sm:gap-2.5 ${i < step ? "cursor-pointer" : "cursor-default"}`}>
              <span className={`w-7 h-7 sm:w-8 sm:h-8 grid place-items-center font-mono text-xs border transition-colors ${i < step ? "bg-volt-400 text-ink-950 border-volt-400" : i === step ? "bg-blaze-500 text-ink-50 border-blaze-500" : "border-ink-600 text-ink-500"}`}>
                {i < step ? <Ic.check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : i + 1}
              </span>
              <span className={`font-mono text-[9px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.2em] uppercase ${i === step ? "text-ink-100 font-bold" : "text-ink-500 hidden xs:block sm:block"}`}>{s}</span>
            </button>
            {i < 2 && <span className={`flex-1 h-px mx-2 sm:mx-4 ${i < step ? "bg-volt-400" : "bg-ink-700"}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 sm:gap-10 items-start">
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
              <div className="space-y-4">
                <DeliverySlotPicker
                  value={slotChoice}
                  fmt={fmt}
                  onChange={(choice) => {
                    setSlotChoice(choice);
                    setShipIdx(choice.slotId === "express" ? 0 : choice.slotId === "standard" ? 1 : 2);
                  }}
                />
                <p className="font-mono text-[10px] text-ink-500 tracking-wide flex items-center gap-2 pt-1">
                  <Ic.truck className="w-4 h-4 text-blaze-500" /> Dispatched in insulated cold-chain boxes (4°C) from your nearest Delhi NCR Hub
                </p>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="flex border border-ink-600 font-mono text-[11px] tracking-[0.15em] uppercase overflow-x-auto no-scrollbar">
                  {([["card", "Card"], ["razorpay", "UPI / Razorpay"], ["cod", "Cash on Delivery"], ["paypal", "PayPal"]] as const).filter(([k]) => k === "card" ? settings.payments.card : k === "razorpay" ? settings.payments.razorpay : k === "cod" ? (settings.payments.cod !== false) : settings.payments.paypal).map(([k, label]) => (
                    <button key={k} onClick={() => setPayTab(k)} className={`flex-1 px-4 py-3.5 transition-colors whitespace-nowrap shrink-0 ${payTab === k ? "bg-blaze-500 text-ink-50 font-bold" : "text-ink-400 hover:text-ink-100"}`}>{label}</button>
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
                      <p className="font-display font-bold text-lg text-ink-50">Razorpay & UPI Instant</p>
                      <p className="text-sm text-ink-300 mt-2">GPay · PhonePe · Paytm · Netbanking · All Debit & Credit Cards. Instant celebration confirmation with zero surcharge.</p>
                      <p className="font-mono text-[10px] text-volt-400 mt-4 tracking-wider">✓ INSTANT VERIFIED DISPATCH</p>
                    </div>
                  )}
                  {payTab === "cod" && (
                    <div className="text-center py-6">
                      <p className="font-display font-bold text-lg text-ink-50">Cash on Delivery (Delhi NCR)</p>
                      <p className="text-sm text-ink-300 mt-2">Pay cash or scan rider's UPI QR code upon arrival at your doorstep. Handled by our dedicated refrigerated express couriers.</p>
                      <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded">
                        ✓ 100% Guaranteed Fresh On Arrival
                      </div>
                    </div>
                  )}
                  {payTab === "paypal" && (
                    <div className="text-center py-6">
                      <p className="font-display font-bold text-lg text-ink-50">PayPal Express</p>
                      <p className="text-sm text-ink-300 mt-2">Pay with your PayPal balance or international cards. Buyer protection included.</p>
                    </div>
                  )}
                  <p className="font-mono text-[10px] text-ink-500 flex items-center gap-2"><Ic.lock className="w-3.5 h-3.5 text-volt-400" /> Encrypted end-to-end — payment data never touches our servers.</p>
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
