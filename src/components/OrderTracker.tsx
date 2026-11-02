import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { useStore } from "../lib/store";
import type { Order, OrderStatus } from "../data/catalog";
import { Ic, PImg } from "./ui";

const STAGES: {
  id: OrderStatus;
  title: string;
  sub: string;
  etaText: string;
  progress: number;
  distanceKm: string;
}[] = [
  {
    id: "pending",
    title: "Order Confirmed",
    sub: "Assigned to nearest Delhi NCR Artisan Kitchen Hub",
    etaText: "38 mins remaining",
    progress: 15,
    distanceKm: "4.8 km away",
  },
  {
    id: "processing",
    title: "Artisan Kitchen Baking",
    sub: "100% pure eggless sponge glazing & chocolate plaque piping",
    etaText: "26 mins remaining",
    progress: 45,
    distanceKm: "4.8 km away",
  },
  {
    id: "shipped",
    title: "Insulated Carrier Dispatched",
    sub: "Rider en route with 4°C dry-ice cold pack protection",
    etaText: "12 mins away",
    progress: 78,
    distanceKm: "1.6 km away",
  },
  {
    id: "delivered",
    title: "Delivered to Doorstep",
    sub: "Handed over safely in temperature-controlled celebration box",
    etaText: "Arrived on time",
    progress: 100,
    distanceKm: "0.0 km · Arrived",
  },
];

export function OrderTracker({ initialOrderId, compact = false }: { initialOrderId?: string; compact?: boolean }) {
  const { orders, setOrderStatus, fmt, toast, settings } = useStore();
  const [searchParams] = useSearchParams();
  const queryOrderId = initialOrderId || searchParams.get("id") || "";

  const [lookupInput, setLookupInput] = useState(queryOrderId);
  const [selectedOrderId, setSelectedOrderId] = useState<string>(() => {
    if (queryOrderId && orders.some((o) => o.id.toLowerCase() === queryOrderId.toLowerCase())) {
      return orders.find((o) => o.id.toLowerCase() === queryOrderId.toLowerCase())!.id;
    }
    return orders[0]?.id || "CU-9100";
  });
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappSubscribed, setWhatsappSubscribed] = useState(false);

  useEffect(() => {
    if (queryOrderId) {
      const found = orders.find((o) => o.id.toLowerCase() === queryOrderId.toLowerCase());
      if (found) {
        setSelectedOrderId(found.id);
        setLookupInput(found.id);
      }
    }
  }, [queryOrderId, orders]);

  const activeOrder: Order | undefined = useMemo(
    () => orders.find((o) => o.id.toLowerCase() === selectedOrderId.toLowerCase()) || orders[0],
    [orders, selectedOrderId]
  );

  const currentStageIndex = useMemo(() => {
    if (!activeOrder) return 1;
    const idx = STAGES.findIndex((s) => s.id === activeOrder.status);
    return idx >= 0 ? idx : 1;
  }, [activeOrder]);

  const stageMeta = STAGES[currentStageIndex] || STAGES[1];

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = lookupInput.trim().replace(/^#/, "");
    if (!cleaned) return;
    const match = orders.find((o) => o.id.toLowerCase() === cleaned.toLowerCase());
    if (match) {
      setSelectedOrderId(match.id);
      toast("success", `Loaded live tracking for Order ${match.id}`);
    } else {
      toast("info", `Order "${cleaned}" not found — showing demo Order ${orders[0]?.id || "CU-9100"}`);
      if (orders[0]) setSelectedOrderId(orders[0].id);
    }
  };

  const handleStageChange = (status: OrderStatus) => {
    if (!activeOrder) return;
    setOrderStatus(activeOrder.id, status);
    if (status === "delivered") {
      try {
        confetti({
          particleCount: 70,
          spread: 65,
          origin: { y: 0.65 },
          colors: ["#e23e5f", "#d69740", "#aacb78"],
        });
      } catch {}
    }
  };

  const handleWhatsAppPing = () => {
    if (!activeOrder) return;
    const hubPhone = (settings.header?.whatsappNumber || "917318531953").replace(/\D/g, "");
    const itemNames = activeOrder.items.map((i) => `${i.qty}x ${i.name} (${i.size})`).join(", ");
    const msg = encodeURIComponent(
      `Hi CakeUrban! 🎂\nI am tracking my Order *#${activeOrder.id}*\n` +
        `• Status: *${stageMeta.title}* (${stageMeta.etaText})\n` +
        `• Items: ${itemNames}\n` +
        `• Delivery Slot: ${activeOrder.deliverySlot || activeOrder.method}\n` +
        `• Address: ${activeOrder.address}\n\nPlease share live rider location updates on my WhatsApp!`
    );
    window.open(`https://wa.me/${hubPhone}?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  const handleSubscribeAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = whatsappPhone.replace(/\D/g, "");
    if (clean.length < 10) {
      toast("error", "Please enter a valid 10-digit WhatsApp mobile number");
      return;
    }
    setWhatsappSubscribed(true);
    toast("success", `Live WhatsApp alerts activated for +91 ${clean.slice(-10)}!`);
  };

  if (!activeOrder) return null;

  return (
    <div className={compact ? "" : "max-w-6xl mx-auto px-6 lg:px-10 py-12"}>
      {!compact && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-blaze-400 uppercase font-semibold">
              Delhi NCR Express Dispatch Radar
            </p>
            <h1 className="font-display text-3xl sm:text-5xl font-black uppercase mt-2">
              Live Order Tracking
            </h1>
            <p className="text-sm text-ink-300 mt-2 max-w-xl">
              Real-time kitchen telemetry, cold-chain carrier temperature, and direct WhatsApp rider status updates across Faridabad, Noida, Gurgaon & Delhi NCR.
            </p>
          </div>

          {/* Order ID Lookup Bar */}
          <form onSubmit={handleLookup} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="Order ID (e.g. CU-9100)"
              className="flex-1 md:w-52 bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3.5 py-2.5 font-mono text-xs text-ink-100 outline-none rounded"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold tracking-wider rounded transition-colors shrink-0"
            >
              Track Order
            </button>
          </form>
        </div>
      )}

      {/* Quick Switch Recent Orders Strip */}
      {!compact && orders.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6 border-b border-ink-800">
          <span className="font-mono text-[11px] text-ink-400 shrink-0 mr-1">Recent Orders:</span>
          {orders.slice(0, 5).map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setSelectedOrderId(o.id);
                setLookupInput(o.id);
              }}
              className={`px-3 py-1 rounded font-mono text-xs transition-colors shrink-0 ${
                o.id === activeOrder.id
                  ? "bg-blaze-500 text-ink-50 font-bold"
                  : "bg-ink-900 border border-ink-700 text-ink-300 hover:border-ink-500"
              }`}
            >
              #{o.id} · {o.status.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Main Tracking Card */}
      <div className="border border-ink-700/80 bg-ink-850 clip-tile overflow-hidden shadow-2xl">
        {/* Top Summary Banner */}
        <div className="p-5 sm:p-7 bg-ink-900/90 border-b border-ink-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-ink-300">
              <span className="text-ink-50 font-bold text-base">Order #{activeOrder.id}</span>
              <span>·</span>
              <span>{new Date(activeOrder.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span>·</span>
              <span className="text-volt-400 font-semibold">{activeOrder.deliverySlot || activeOrder.method}</span>
              <span>·</span>
              <span>{activeOrder.payment}</span>
            </div>
            <p className="text-xs text-ink-400 mt-1.5 font-mono">
              Delivering to: <span className="text-ink-200">{activeOrder.address}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-2 bg-ink-950 border border-ink-700 rounded text-right">
              <p className="font-mono text-[10px] text-ink-400 uppercase">Estimated Arrival</p>
              <p className="font-mono text-sm font-bold text-volt-400 tabnum">{stageMeta.etaText}</p>
            </div>
            <button
              type="button"
              onClick={handleWhatsAppPing}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-2 shadow-lg"
            >
              <Ic.whatsapp className="w-4 h-4" />
              <span>Send Status to WhatsApp</span>
            </button>
          </div>
        </div>

        {/* 4-Stage Visual Progress Stepper */}
        <div className="p-6 sm:p-8 border-b border-ink-800">
          <div className="flex items-center justify-between mb-3 font-mono text-xs">
            <span className="text-blaze-400 font-bold uppercase tracking-wider">
              Live Stage: {stageMeta.title}
            </span>
            <span className="text-ink-400 tabnum">{stageMeta.progress}% Complete</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-ink-950 rounded-full overflow-hidden border border-ink-800 mb-8">
            <div
              className="h-full bg-gradient-to-r from-blaze-500 via-gold-400 to-volt-400 transition-all duration-500"
              style={{ width: `${stageMeta.progress}%` }}
            />
          </div>

          {/* 4 Stages Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES.map((st, idx) => {
              const isCompleted = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStageChange(st.id)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    isCurrent
                      ? "border-blaze-500 bg-blaze-500/10 shadow-glow"
                      : isCompleted
                      ? "border-volt-500/40 bg-ink-900/90 hover:border-volt-400"
                      : "border-ink-800 bg-ink-950/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-full grid place-items-center font-mono text-xs font-bold ${
                        isCurrent
                          ? "bg-blaze-500 text-ink-50"
                          : isCompleted
                          ? "bg-volt-400 text-ink-950"
                          : "bg-ink-800 text-ink-400"
                      }`}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </span>
                    <span className="font-mono text-[10px] text-ink-400 uppercase">
                      {isCurrent ? "ACTIVE STAGE" : isCompleted ? "COMPLETED" : "UPCOMING"}
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm text-ink-50">{st.title}</p>
                  <p className="text-xs text-ink-400 mt-1 leading-relaxed">{st.sub}</p>
                </button>
              );
            })}
          </div>
          <p className="font-mono text-[10px] text-ink-500 mt-3 text-right">
            Tip: Click any stage card above to preview live status updates & notifications
          </p>
        </div>

        {/* Simulated GPS Route & Cold-Chain Telemetry + Order Items */}
        <div className="grid lg:grid-cols-[1.2fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-ink-800">
          {/* Left: GPS Dispatch & Rider Card */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-blaze-400 uppercase font-bold">
                  Insulated Cold-Chain Telemetry
                </p>
                <h3 className="font-display font-bold text-lg text-ink-50 mt-0.5">
                  Faridabad Sector 15 Hub → Your Doorstep
                </h3>
              </div>
              <span className="font-mono text-xs text-volt-400 font-bold tabnum">
                {stageMeta.distanceKm}
              </span>
            </div>

            {/* Simulated Visual Route Map */}
            <div className="relative h-44 rounded-lg bg-ink-950 border border-ink-800 overflow-hidden p-5 flex flex-col justify-between">
              <div className="absolute inset-0 grid-lines opacity-40" />
              <div className="relative flex items-center justify-between text-xs font-mono z-10">
                <div className="bg-ink-900/90 border border-ink-700 px-3 py-1.5 rounded">
                  <span className="text-blaze-400 font-bold">🏪 Kitchen Hub</span>
                  <span className="block text-[10px] text-ink-400">Faridabad HQ · Oven #2</span>
                </div>
                <div className="bg-ink-900/90 border border-ink-700 px-3 py-1.5 rounded text-right">
                  <span className="text-volt-400 font-bold">🏠 Destination</span>
                  <span className="block text-[10px] text-ink-400 truncate max-w-[160px]">{activeOrder.address}</span>
                </div>
              </div>

              {/* Animated Route Line */}
              <div className="relative my-auto py-4">
                <div className="h-1 w-full bg-ink-800 rounded-full relative">
                  <div
                    className="h-1 bg-blaze-500 rounded-full transition-all duration-500"
                    style={{ width: `${stageMeta.progress}%` }}
                  />
                  <div
                    className="absolute -top-3.5 -translate-x-1/2 px-2.5 py-1 rounded bg-blaze-500 text-ink-50 font-mono text-[10px] font-bold shadow-lg transition-all duration-500 whitespace-nowrap"
                    style={{ left: `${Math.min(92, Math.max(8, stageMeta.progress))}%` }}
                  >
                    🛵 Rider Vikram
                  </div>
                </div>
              </div>

              {/* Telemetry Metrics Row */}
              <div className="relative z-10 grid grid-cols-3 gap-2 pt-2 border-t border-ink-800/80 font-mono text-[11px]">
                <div>
                  <span className="text-ink-500 block text-[9px] uppercase">Carrier Temp</span>
                  <span className="text-volt-400 font-bold tabnum">4.2°C Chilled</span>
                </div>
                <div>
                  <span className="text-ink-500 block text-[9px] uppercase">Kitchen Cert</span>
                  <span className="text-ink-100 font-bold">100% Pure Eggless</span>
                </div>
                <div className="text-right">
                  <span className="text-ink-500 block text-[9px] uppercase">Rider Hygiene</span>
                  <span className="text-gold-400 font-bold">4.9★ Verified</span>
                </div>
              </div>
            </div>

            {/* Live WhatsApp Notification Opt-In */}
            <div className="p-4 rounded-lg bg-ink-900 border border-ink-700/80">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-ink-100 flex items-center gap-2">
                  <Ic.whatsapp className="w-4 h-4 text-emerald-400" />
                  Automatic WhatsApp Stage Alerts
                </span>
                <span className="font-mono text-[10px] text-emerald-400">Instant Push</span>
              </div>
              {whatsappSubscribed ? (
                <p className="text-xs text-emerald-300 font-mono">
                  ✓ Subscribed! You will receive automated WhatsApp alerts at every bake & delivery milestone.
                </p>
              ) : (
                <form onSubmit={handleSubscribeAlerts} className="flex gap-2 mt-2">
                  <span className="px-2.5 py-2 bg-ink-950 border border-ink-700 font-mono text-xs text-ink-400 rounded flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={whatsappPhone}
                    onChange={(e) => setWhatsappPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit WhatsApp number"
                    className="flex-1 bg-ink-950 border border-ink-700 focus:border-emerald-500 px-3 py-2 font-mono text-xs text-ink-100 outline-none rounded"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold rounded transition-colors shrink-0"
                  >
                    Enable Alerts
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Order Items & Plaque Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-ink-400 uppercase font-bold mb-4">
                Celebration Box Contents ({activeOrder.items.reduce((s, i) => s + i.qty, 0)} Items)
              </p>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {activeOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 p-2.5 rounded bg-ink-900/90 border border-ink-800">
                    <div className="w-14 h-14 rounded overflow-hidden shrink-0 border border-ink-700">
                      <PImg src={it.img} crop={it.crop} filter={it.imgFilter} alt={it.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${it.productId}`} className="font-display font-semibold text-sm text-ink-100 hover:text-blaze-400 truncate block">
                        {it.name}
                      </Link>
                      <p className="font-mono text-[10px] text-ink-400 mt-0.5">
                        {it.color} · {it.size} · Qty {it.qty}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-bold text-ink-100 tabnum">
                      {fmt(it.price * it.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {activeOrder.plaqueMessage && (
                <div className="mt-4 p-3 rounded bg-ink-950 border border-gold-400/30">
                  <p className="font-mono text-[10px] text-gold-400 uppercase">Hand-Piped Chocolate Plaque Message</p>
                  <p className="font-display italic text-sm text-ink-100 mt-0.5">"{activeOrder.plaqueMessage}"</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-ink-800 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-ink-400">
                <span>Subtotal</span>
                <span className="tabnum">{fmt(activeOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-400">
                <span>Insulated Express Delivery</span>
                <span className="tabnum">{activeOrder.shipping === 0 ? "FREE" : fmt(activeOrder.shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-ink-50 pt-2 border-t border-ink-800">
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
