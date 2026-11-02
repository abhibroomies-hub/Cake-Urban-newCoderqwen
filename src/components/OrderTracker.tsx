import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useStore } from "../lib/store";
import { Ic, PImg } from "./ui";
import type { Order, OrderStatus } from "../data/catalog";

const STAGES: {
  key: OrderStatus;
  title: string;
  subtitle: string;
  desc: string;
  etaOffsetMins: number;
  icon: "check" | "cake" | "sparkle" | "truck";
}[] = [
  {
    key: "pending",
    title: "1. Order Confirmed",
    subtitle: "Kitchen Queue",
    desc: "Fresh 100% eggless sponge queued in our oven.",
    etaOffsetMins: 38,
    icon: "cake",
  },
  {
    key: "processing",
    title: "2. Frosting & QC",
    subtitle: "Chilled at 4°C",
    desc: "Hand-frosted, plaque piped & sealed in cold box.",
    etaOffsetMins: 24,
    icon: "sparkle",
  },
  {
    key: "shipped",
    title: "3. Out for Delivery",
    subtitle: "GPS Rider Live",
    desc: "Rider en route with insulated 4°C cold-chain box.",
    etaOffsetMins: 12,
    icon: "truck",
  },
  {
    key: "delivered",
    title: "4. Delivered Fresh",
    subtitle: "Enjoy Your Bake!",
    desc: "Handed over chilled at your doorstep.",
    etaOffsetMins: 0,
    icon: "check",
  },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

export function OrderTracker({ initialOrderId, compact = false }: { initialOrderId?: string; compact?: boolean }) {
  const { orders, fmt, toast } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = initialOrderId || searchParams.get("id") || "";

  const [lookupInput, setLookupInput] = useState(queryId);
  const [selectedId, setSelectedId] = useState(queryId || (orders[0]?.id ?? "CU-9100"));
  const [simStepOverride, setSimStepOverride] = useState<number | null>(null);
  const [waOptIn, setWaOptIn] = useState(false);
  const [waPhone, setWaPhone] = useState("+91 ");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (queryId) {
      setSelectedId(queryId);
      setLookupInput(queryId);
    }
  }, [queryId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => (s + 1) % 3600);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrder: Order | undefined = useMemo(() => {
    const clean = selectedId.trim().toUpperCase();
    return (
      orders.find((o) => o.id.toUpperCase() === clean) ||
      orders.find((o) => o.id.toUpperCase().includes(clean)) ||
      orders[0]
    );
  }, [orders, selectedId]);

  if (!activeOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 text-center">
        <Ic.box className="w-10 h-10 mx-auto text-ink-500 mb-3" />
        <h2 className="font-display text-xl sm:text-2xl font-bold uppercase">No Active Orders Found</h2>
        <p className="text-ink-400 text-xs sm:text-sm mt-1.5">Place a fresh bake order first to track it live.</p>
        <Link to="/shop" className="inline-block mt-5 px-6 py-3 bg-blaze-500 text-ink-50 font-mono text-xs uppercase clip-btn">
          Browse Menu →
        </Link>
      </div>
    );
  }

  const baseStep = STATUS_INDEX[activeOrder.status] ?? 0;
  const currentStep = simStepOverride !== null ? simStepOverride : Math.max(0, baseStep);
  const isCancelled = activeOrder.status === "cancelled" && simStepOverride === null;

  const stageObj = STAGES[currentStep] || STAGES[0];
  const remainingMins = Math.max(0, stageObj.etaOffsetMins - Math.floor(elapsedSeconds / 60));
  const remainingSecs = 59 - (elapsedSeconds % 60);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    const found = orders.find((o) => o.id.toUpperCase() === lookupInput.trim().toUpperCase());
    if (!found) {
      toast("error", `Order "${lookupInput.toUpperCase()}" not found. Showing latest order.`);
    } else {
      setSimStepOverride(null);
      setSelectedId(found.id);
      if (!compact) setSearchParams({ id: found.id });
      toast("success", `Loaded live telemetry for Order ${found.id}`);
    }
  };

  const handleWhatsAppOptIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (waPhone.replace(/\D/g, "").length < 10) {
      toast("error", "Enter a valid 10-digit WhatsApp number");
      return;
    }
    setWaOptIn(true);
    toast("success", `Live WhatsApp alerts enabled for ${waPhone}`);
  };

  const riderProgressPct =
    currentStep === 0 ? 18 : currentStep === 1 ? 48 : currentStep === 2 ? 78 : 100;

  return (
    <div className={compact ? "" : "max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-10 py-5 sm:py-10"}>
      {/* Header & Order Lookup Bar */}
      {!compact && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blaze-500/15 border border-blaze-500/30 rounded text-blaze-400 font-mono text-[10px] tracking-[0.2em] uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-blaze-500 animate-ping" />
              Live Kitchen & Rider Telemetry
            </div>
            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight">
              Track Your <span className="text-blaze-500">Order</span>
            </h1>
            <p className="text-ink-300 text-xs sm:text-sm mt-1">
              Real-time oven temperature, cold-box packing & GPS rider status across Delhi NCR.
            </p>
          </div>

          {/* Search Lookup Input */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Order ID (e.g. CU-9104)"
              className="bg-ink-900 border border-ink-700 focus:border-blaze-500 px-3.5 py-2.5 text-xs sm:text-sm font-mono uppercase text-ink-100 outline-none flex-1 min-w-0 md:w-52 clip-tag"
            />
            <button
              type="submit"
              className="px-4 sm:px-5 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-wider uppercase font-bold clip-btn transition-colors shrink-0"
            >
              Track →
            </button>
          </form>
        </div>
      )}

      {/* Quick Order Switcher Pills */}
      {!compact && orders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-4 sm:mb-6">
          <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400 shrink-0">Recent:</span>
          {orders.slice(0, 5).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setSimStepOverride(null);
                setSelectedId(o.id);
                setLookupInput(o.id);
                setSearchParams({ id: o.id });
              }}
              className={`px-2.5 py-1 font-mono text-[11px] rounded border transition-colors shrink-0 ${
                o.id === activeOrder.id
                  ? "bg-blaze-500 text-ink-50 border-blaze-500 font-bold"
                  : "bg-ink-900 text-ink-300 border-ink-700 hover:border-ink-500"
              }`}
            >
              {o.id}
            </button>
          ))}
        </div>
      )}

      {/* Main Telemetry Card */}
      <div className="border border-ink-700/70 bg-ink-850 clip-tile overflow-hidden shadow-2xl">
        {/* Top Summary Banner */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 border-b border-ink-700/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 bg-ink-950 border border-ink-700 text-gold-400">
                ORDER #{activeOrder.id}
              </span>
              <span className="font-mono text-[11px] text-ink-400 truncate">
                {new Date(activeOrder.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {activeOrder.deliverySlot || activeOrder.method}
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-2xl font-black uppercase text-ink-50">
              {isCancelled ? (
                <span className="text-danger-400">Order Cancelled</span>
              ) : (
                <>
                  {stageObj.title} — <span className="text-volt-400">{stageObj.subtitle}</span>
                </>
              )}
            </h2>
            <p className="text-xs text-ink-300 line-clamp-1 sm:line-clamp-none">{stageObj.desc}</p>
          </div>

          {/* Live Countdown Clock + WhatsApp Rider CTA (2-col on mobile) */}
          {!isCancelled && (
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-ink-950 border border-ink-700/80 rounded text-center">
                <p className="font-mono text-[9px] tracking-[0.15em] text-ink-400 uppercase">
                  {currentStep === 3 ? "Delivered" : "Est. Arrival"}
                </p>
                {currentStep === 3 ? (
                  <p className="font-mono text-sm sm:text-lg font-bold text-volt-400 mt-0.5">✓ COMPLETED</p>
                ) : (
                  <p className="font-mono text-base sm:text-xl font-black text-blaze-400 tabnum mt-0.5">
                    {String(remainingMins).padStart(2, "0")}m : {String(remainingSecs).padStart(2, "0")}s
                  </p>
                )}
              </div>

              <a
                href={`https://wa.me/917318531953?text=${encodeURIComponent(
                  `Hi CakeUrban! Please share live location for my Order #${activeOrder.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Ic.whatsapp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <div className="text-left min-w-0">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-ink-300 truncate">Need Help?</span>
                  <span className="block font-mono text-[11px] sm:text-xs font-bold truncate">WhatsApp Rider</span>
                </div>
              </a>
            </div>
          )}
        </div>

        {/* Interactive 4-Stage Visual Stepper (2x2 on Phone, 4-col on Desktop) */}
        <div className="p-3.5 sm:p-6 border-b border-ink-700/60">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
            <span className="font-mono text-[10px] tracking-[0.18em] text-ink-400 uppercase">
              Live Journey Progress ({riderProgressPct}%)
            </span>
            {/* Interactive Stage Preview Switcher */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <span className="font-mono text-[9px] text-ink-500 uppercase mr-1 hidden sm:inline">Preview:</span>
              {STAGES.map((st, idx) => (
                <button
                  key={st.key}
                  type="button"
                  onClick={() => setSimStepOverride(idx)}
                  className={`px-2 py-0.5 font-mono text-[9px] uppercase rounded border transition-colors ${
                    currentStep === idx
                      ? "bg-blaze-500/20 border-blaze-500 text-blaze-300 font-bold"
                      : "bg-ink-900 border-ink-700 text-ink-400 hover:text-ink-200"
                  }`}
                >
                  S{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative h-2 bg-ink-950 rounded-full overflow-hidden border border-ink-800 mb-4 sm:mb-6">
            <div
              className="h-full bg-gradient-to-r from-blaze-500 via-gold-400 to-volt-400 transition-all duration-700 rounded-full"
              style={{ width: `${riderProgressPct}%` }}
            />
          </div>

          {/* 4 Stage Cards — 2x2 Grid on Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {STAGES.map((stage, i) => {
              const isDone = i < currentStep;
              const isActive = i === currentStep;
              const IconComp = Ic[stage.icon];

              return (
                <div
                  key={stage.key}
                  onClick={() => setSimStepOverride(i)}
                  className={`cursor-pointer p-3 sm:p-4 rounded border transition-all relative ${
                    isActive
                      ? "bg-blaze-500/12 border-blaze-500 shadow-[0_0_25px_-6px_rgba(226,62,95,0.4)]"
                      : isDone
                      ? "bg-ink-900/90 border-volt-400/40"
                      : "bg-ink-950/60 border-ink-800 opacity-60 hover:opacity-90"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded grid place-items-center border ${
                        isActive
                          ? "bg-blaze-500 text-ink-50 border-blaze-400 animate-pulse"
                          : isDone
                          ? "bg-volt-400 text-ink-950 border-volt-400"
                          : "bg-ink-900 text-ink-500 border-ink-700"
                      }`}
                    >
                      {isDone ? <Ic.check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </span>

                    <span
                      className={`font-mono text-[8px] sm:text-[9px] tracking-[0.12em] uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-blaze-500 text-ink-50 font-bold"
                          : isDone
                          ? "bg-volt-400/15 text-volt-400"
                          : "bg-ink-900 text-ink-500"
                      }`}
                    >
                      {isActive ? "● LIVE" : isDone ? "DONE" : "NEXT"}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xs sm:text-sm uppercase text-ink-50 truncate">{stage.title}</h3>
                  <p className="font-mono text-[9px] sm:text-[10px] text-gold-400 uppercase tracking-wider mt-0.5 truncate">
                    {stage.subtitle}
                  </p>
                  <p className="text-[11px] text-ink-400 mt-1.5 leading-snug line-clamp-2 hidden sm:block">{stage.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lower Split: Simulated GPS Route & Order Details */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-ink-800">
          {/* Left: Simulated Rider & Cold-Chain Telemetry */}
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-mono text-[10px] tracking-[0.18em] text-cobalt-400 uppercase font-bold">
                  Live Cold-Chain & GPS Route
                </p>
                <h3 className="font-display text-base sm:text-lg font-bold uppercase mt-0.5 truncate">
                  Sector 15 Hub → {activeOrder.address.split(",")[0]}
                </h3>
              </div>
              <span className="font-mono text-[10px] sm:text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded shrink-0">
                ❄️ 3.8°C Box
              </span>
            </div>

            {/* Simulated Map Visualization */}
            <div className="relative h-36 sm:h-44 rounded bg-ink-950 border border-ink-800 overflow-hidden p-3 sm:p-5 flex flex-col justify-between">
              <div className="absolute inset-0 grid-lines opacity-30 pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between gap-2 text-xs font-mono">
                <div className="bg-ink-900/90 border border-ink-700 px-2.5 py-1.5 rounded min-w-0 flex-1 max-w-[46%]">
                  <span className="text-gold-400 block text-[9px] uppercase truncate">🏪 Kitchen Hub</span>
                  <span className="text-ink-100 font-bold text-[11px] truncate block">Faridabad Sec-15</span>
                </div>

                <div className="bg-ink-900/90 border border-ink-700 px-2.5 py-1.5 rounded text-right min-w-0 flex-1 max-w-[46%]">
                  <span className="text-blaze-400 block text-[9px] uppercase truncate">🏠 Destination</span>
                  <span className="text-ink-100 font-bold text-[11px] truncate block">
                    {activeOrder.address}
                  </span>
                </div>
              </div>

              {/* Route Line & Animated Rider Pin */}
              <div className="relative z-10 my-auto py-2">
                <div className="h-1 bg-ink-800 w-full rounded relative">
                  <div
                    className="h-1 bg-volt-400 rounded transition-all duration-700"
                    style={{ width: `${riderProgressPct}%` }}
                  />
                  <div
                    className="absolute -top-3.5 -translate-x-1/2 transition-all duration-700 flex flex-col items-center"
                    style={{ left: `${Math.min(94, Math.max(6, riderProgressPct))}%` }}
                  >
                    <span className="px-2 py-0.5 rounded bg-blaze-500 text-ink-50 font-mono text-[9px] font-bold shadow-lg whitespace-nowrap">
                      🛵 {currentStep === 3 ? "Arrived" : "Vikram S."}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-ink-400 gap-2">
                <span className="truncate">Rider: Vikram Singh (★ 4.9)</span>
                <span className="text-ink-300 shrink-0">Sealed Tamper-Proof</span>
              </div>
            </div>

            {/* Instant WhatsApp SMS Notification Opt-in */}
            <div className="p-3.5 sm:p-4 rounded bg-ink-900/80 border border-ink-700/70">
              {waOptIn ? (
                <div className="flex items-center justify-between text-xs text-emerald-400 font-mono gap-2">
                  <span>✓ Live WhatsApp alerts active for {waPhone}</span>
                  <button onClick={() => setWaOptIn(false)} className="text-ink-400 hover:text-ink-200 underline shrink-0">
                    Edit
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWhatsAppOptIn} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <label className="block font-mono text-[10px] uppercase tracking-wider text-ink-300">
                      Get Cake Photo & Rider Link on WhatsApp
                    </label>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="bg-ink-950 border border-ink-700 px-3 py-2 text-xs font-mono text-ink-100 rounded outline-none focus:border-blaze-500 flex-1 min-w-0 sm:w-36"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] uppercase font-bold rounded transition-colors shrink-0"
                    >
                      Enable
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: Order Items & Plaque Details */}
          <div className="p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-ink-400 uppercase font-bold mb-3">
                Order Items ({activeOrder.items.reduce((s, i) => s + i.qty, 0)})
              </p>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded bg-ink-900/90 border border-ink-800">
                    <div className="w-12 h-12 rounded overflow-hidden shrink-0 border border-ink-700">
                      <PImg src={it.img} crop={it.crop} filter={it.imgFilter} alt={it.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${it.productId}`} className="font-display font-semibold text-xs sm:text-sm text-ink-100 hover:text-blaze-400 truncate block">
                        {it.name}
                      </Link>
                      <p className="font-mono text-[10px] text-ink-400 mt-0.5 truncate">
                        {it.color} · {it.size} × {it.qty}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-ink-100 tabnum shrink-0">
                      {fmt(it.price * it.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {activeOrder.plaqueMessage && (
                <div className="mt-3 p-2.5 rounded bg-ink-950 border border-gold-400/30">
                  <p className="font-mono text-[9px] text-gold-400 uppercase">Hand-Piped Plaque Message</p>
                  <p className="font-display italic text-xs sm:text-sm text-ink-100 mt-0.5">"{activeOrder.plaqueMessage}"</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3.5 border-t border-ink-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-ink-400">
                <span>Subtotal</span>
                <span className="tabnum">{fmt(activeOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-400">
                <span>Chilled Express Delivery</span>
                <span className="tabnum">{activeOrder.shipping === 0 ? "FREE" : fmt(activeOrder.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-ink-50 pt-2 border-t border-ink-800">
                <span>Total Paid</span>
                <span className="tabnum text-volt-400">{fmt(activeOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OrderTracker;
