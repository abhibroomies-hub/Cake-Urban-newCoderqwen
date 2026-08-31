import React, { useState, useMemo } from "react";
import { useStore } from "../../lib/store";
import { Ic, Modal } from "../ui";
import type { Order, OrderStatus } from "../../data/catalog";

const STATUS_FLOW: { key: OrderStatus; label: string; color: string; next?: OrderStatus; nextLabel?: string }[] = [
  { key: "pending", label: "New Order (Pending Bake)", color: "bg-amber-500/20 text-amber-300 border-amber-500/50", next: "processing", nextLabel: "Start Baking 🔥" },
  { key: "processing", label: "In Oven / Decorating", color: "bg-blue-500/20 text-blue-300 border-blue-500/50", next: "shipped", nextLabel: "Pack & Handover to Rider 🛵" },
  { key: "shipped", label: "Out for Delivery (Rider)", color: "bg-purple-500/20 text-purple-300 border-purple-500/50", next: "delivered", nextLabel: "Mark Delivered ✅" },
  { key: "delivered", label: "Delivered & Celebrated", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" },
  { key: "cancelled", label: "Cancelled", color: "bg-rose-500/20 text-rose-300 border-rose-500/50" },
];

export function KitchenKdsManager() {
  const { orders, setOrderStatus, toast, fmt } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [slotFilter, setSlotFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play audio chime simulation
  const playAlertChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      /* Audio context not allowed or supported */
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchEmail = (o.email || "").toLowerCase().includes(q);
        const matchAddress = (o.address || "").toLowerCase().includes(q);
        const matchItem = o.items.some((it) => it.name.toLowerCase().includes(q));
        if (!matchId && !matchEmail && !matchAddress && !matchItem) return false;
      }
      return true;
    });
  }, [orders, filterStatus, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  const handleNextStatus = (order: Order, nextStatus: OrderStatus) => {
    setOrderStatus(order.id, nextStatus);
    toast("success", `Order #${order.id.slice(-6).toUpperCase()} updated to ${nextStatus.toUpperCase()}`);
    if (soundEnabled) playAlertChime();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink-50">
              Kitchen Display System (KDS)
            </h2>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Real-time bakery dispatch pipeline & instant chef thermal token slips
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertChime();
              toast("info", soundEnabled ? "Kitchen chime muted" : "Kitchen chime alert enabled 🔔");
            }}
            className={`px-3 py-2 border rounded font-mono text-xs flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                : "bg-ink-900 border-ink-700 text-ink-400"
            }`}
          >
            <span>{soundEnabled ? "🔔 Chime Active" : "🔕 Chime Muted"}</span>
          </button>

          <button
            onClick={() => {
              playAlertChime();
              toast("success", "Kitchen order pipeline refreshed");
            }}
            className="px-3 py-2 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded clip-btn flex items-center gap-1.5 transition-all"
          >
            <span>↻ Refresh Pipeline</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          onClick={() => setFilterStatus("ALL")}
          className={`p-3 rounded border text-left transition-all ${
            filterStatus === "ALL"
              ? "bg-blaze-500 text-ink-50 font-bold border-blaze-500 shadow-md"
              : "bg-ink-850 border-ink-700/60 text-ink-300 hover:border-ink-600"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">All Orders</p>
          <p className="font-display text-xl font-bold mt-0.5">{counts.all}</p>
        </button>

        <button
          onClick={() => setFilterStatus("pending")}
          className={`p-3 rounded border text-left transition-all ${
            filterStatus === "pending"
              ? "bg-amber-500 text-ink-950 font-bold border-amber-500 shadow-md"
              : "bg-ink-850 border-ink-700/60 text-amber-400 hover:border-amber-500/50"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">🔥 Pending Bake</p>
          <p className="font-display text-xl font-bold mt-0.5">{counts.pending}</p>
        </button>

        <button
          onClick={() => setFilterStatus("processing")}
          className={`p-3 rounded border text-left transition-all ${
            filterStatus === "processing"
              ? "bg-blue-500 text-ink-50 font-bold border-blue-500 shadow-md"
              : "bg-ink-850 border-ink-700/60 text-blue-400 hover:border-blue-500/50"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">🎂 In Oven / Decorating</p>
          <p className="font-display text-xl font-bold mt-0.5">{counts.processing}</p>
        </button>

        <button
          onClick={() => setFilterStatus("shipped")}
          className={`p-3 rounded border text-left transition-all ${
            filterStatus === "shipped"
              ? "bg-purple-500 text-ink-50 font-bold border-purple-500 shadow-md"
              : "bg-ink-850 border-ink-700/60 text-purple-400 hover:border-purple-500/50"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">🛵 Out with Rider</p>
          <p className="font-display text-xl font-bold mt-0.5">{counts.shipped}</p>
        </button>

        <button
          onClick={() => setFilterStatus("delivered")}
          className={`p-3 rounded border text-left transition-all ${
            filterStatus === "delivered"
              ? "bg-emerald-500 text-ink-950 font-bold border-emerald-500 shadow-md"
              : "bg-ink-850 border-ink-700/60 text-emerald-400 hover:border-emerald-500/50"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-wider opacity-80">✅ Delivered</p>
          <p className="font-display text-xl font-bold mt-0.5">{counts.delivered}</p>
        </button>
      </div>

      {/* Search & Sub-Filter Bar */}
      <div className="flex items-center gap-3 bg-ink-900 border border-ink-700/70 p-3 rounded">
        <Ic.search className="w-4 h-4 text-ink-400 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by Order ID, customer name or cake flavor..."
          className="bg-transparent border-none outline-none text-sm text-ink-100 placeholder-ink-500 w-full"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-xs font-mono text-ink-400 hover:text-ink-100">
            Clear
          </button>
        )}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-ink-850 border border-dashed border-ink-700 rounded-lg">
          <p className="font-display text-lg font-bold text-ink-300">No active kitchen orders in this stage</p>
          <p className="text-xs font-mono text-ink-500 mt-1">All cakes are either baked or no filters match.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => {
            const statusConfig = STATUS_FLOW.find((s) => s.key === order.status) || STATUS_FLOW[0];
            return (
              <div
                key={order.id}
                className="bg-ink-850 border border-ink-700/70 clip-tile p-4 sm:p-5 flex flex-col justify-between hover:border-ink-600 transition-colors"
              >
                <div>
                  {/* Order Top Bar */}
                  <div className="flex items-center justify-between gap-2 border-b border-ink-800 pb-3 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-blaze-400">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-ink-400 ml-2">
                        {new Date(order.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded border ${statusConfig.color}`}>
                      {statusConfig.label.split("(")[0]}
                    </span>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="mb-3">
                    <p className="font-display text-sm font-bold text-ink-100">
                      {order.email.split("@")[0].toUpperCase() || "Celebration Customer"}
                    </p>
                    <p className="text-xs text-ink-400 line-clamp-1 font-mono">
                      📍 {order.address || "Delhi NCR Express Hub"}
                    </p>
                    <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                      ✉️ {order.email}
                    </p>
                  </div>

                  {/* Cake Items & Baking Specs */}
                  <div className="space-y-2 bg-ink-900/80 p-3 rounded border border-ink-800/80 mb-3">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-blaze-500/20 text-blaze-400 font-mono font-bold grid place-items-center text-[10px]">
                            {it.qty}x
                          </span>
                          <span className="font-medium text-ink-100 truncate max-w-[180px]">{it.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-ink-400">{it.size || "0.5 KG"}</span>
                      </div>
                    ))}
                  </div>

                  {/* Custom Message Badge */}
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 text-xs font-mono text-amber-300 mb-3">
                    <span className="font-bold">✍️ Cake Note:</span>{" "}
                    <span>"Happy Birthday! 100% Eggless pure veg"</span>
                  </div>
                </div>

                {/* Bottom Action Triggers */}
                <div className="pt-3 border-t border-ink-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveReceipt(order)}
                    className="px-2.5 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 hover:text-ink-100 font-mono text-[10px] uppercase rounded flex items-center gap-1 transition-colors"
                  >
                    <span>🖨️ POS Print</span>
                  </button>

                  {statusConfig.next && statusConfig.nextLabel && (
                    <button
                      onClick={() => handleNextStatus(order, statusConfig.next!)}
                      className="px-3.5 py-1.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] font-bold uppercase rounded clip-btn transition-colors active:scale-95 shadow-md"
                    >
                      {statusConfig.nextLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POS Kitchen Thermal Token Slip Modal */}
      {activeReceipt && (
        <Modal open={!!activeReceipt} onClose={() => setActiveReceipt(null)}>
          <div className="p-4 sm:p-6 bg-ink-900 max-w-sm mx-auto">
            {/* Printable Thermal Receipt Simulation */}
            <div className="bg-white text-black p-5 font-mono text-xs rounded shadow-lg space-y-3 leading-tight border border-gray-300">
              <div className="text-center pb-2 border-b border-black">
                <p className="text-base font-black tracking-widest uppercase">CAKEURBAN BAKEHOUSE</p>
                <p className="text-[10px] text-gray-700">HQ Kitchen: Faridabad · Delhi NCR</p>
                <p className="text-[10px] font-bold text-emerald-800 mt-0.5">🌱 100% PURE VEG / EGGLESS</p>
                <p className="text-[10px] text-gray-600 mt-1">Helpline: +91 7318531953</p>
              </div>

              <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold">
                  <span>ORDER #{activeReceipt.id.slice(-6).toUpperCase()}</span>
                  <span>{new Date(activeReceipt.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold">{activeReceipt.email.split("@")[0].toUpperCase()}</span>
                </div>
                <div>
                  <span>Address: {activeReceipt.address}</span>
                </div>
                <div>
                  <span>Email: {activeReceipt.email}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 py-1 border-b border-dashed border-black">
                <p className="font-bold text-[11px]">ITEMS / BAKING SPECS:</p>
                {activeReceipt.items.map((it, i) => (
                  <div key={i} className="flex justify-between">
                    <span>
                      {it.qty}x {it.name} ({it.size})
                    </span>
                    <span>{fmt(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Chef Notes */}
              <div className="bg-gray-100 p-2 rounded text-[10px]">
                <p className="font-bold">CHEF MESSAGE ON CAKE:</p>
                <p className="italic">"Happy Birthday & Many More Celebrations"</p>
                <p className="font-bold mt-1">INCLUDES: Golden Candle + Premium Knife Set</p>
              </div>

              {/* Total & Payment */}
              <div className="pt-2 border-t border-black space-y-1">
                <div className="flex justify-between font-black text-sm">
                  <span>NET TOTAL:</span>
                  <span>{fmt(activeReceipt.total)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>PAYMENT METHOD:</span>
                  <span className="uppercase font-bold">{activeReceipt.payment || "Online Prepaid"}</span>
                </div>
              </div>

              <div className="text-center pt-2 text-[9px] text-gray-600">
                <p>Thank you for celebrating with CakeUrban!</p>
                <p>www.cakeurban.com</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  window.print();
                  toast("success", "Kitchen slip sent to printer");
                }}
                className="w-full py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded transition-colors"
              >
                🖨️ Print Slip (58/80mm)
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2.5 bg-ink-800 text-ink-300 font-mono text-xs uppercase rounded hover:text-ink-100"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
