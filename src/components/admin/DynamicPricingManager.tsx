import React, { useState } from "react";
import { useStore } from "../../lib/store";
import { Ic } from "../ui";

export function DynamicPricingManager() {
  const { settings, updateSettings, toast, fmt } = useStore();
  const [flashSaleActive, setFlashSaleActive] = useState(true);
  const [flashDiscountPct, setFlashDiscountPct] = useState(15);
  const [flashStartTime, setFlashStartTime] = useState("21:00");
  const [flashEndTime, setFlashEndTime] = useState("01:30");

  const [thresholds, setThresholds] = useState([
    { hub: "Faridabad Kitchen HQ", minOrder: 299, freeDeliveryOver: 499, midnightSurge: 49 },
    { hub: "Noida & Gr. Noida Hub", minOrder: 349, freeDeliveryOver: 599, midnightSurge: 49 },
    { hub: "Gurgaon Cyber Hub", minOrder: 399, freeDeliveryOver: 699, midnightSurge: 69 },
    { hub: "South Delhi Hub", minOrder: 399, freeDeliveryOver: 699, midnightSurge: 69 },
    { hub: "Ghaziabad Hub", minOrder: 349, freeDeliveryOver: 599, midnightSurge: 49 },
  ]);

  const [celebrationBogo, setCelebrationBogo] = useState({
    enabled: true,
    code: "BOGO-PARTY",
    desc: "Buy 1 Celebration Cake (1kg+), Get 2 Free Dark Truffle Slices",
    minCart: 999,
  });

  const handleSaveThresholds = () => {
    toast("success", "City delivery thresholds & surge rules updated across all checkout routes!");
  };

  const handleToggleFlash = () => {
    setFlashSaleActive(!flashSaleActive);
    toast("info", flashSaleActive ? "Midnight flash sale paused" : `Midnight flash sale active (${flashDiscountPct}% OFF)`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-volt-400" />
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink-50">
              Flash Sales, Midnight Deals & Surge Rules
            </h2>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Configure late-night flash discount banners, city-wise free delivery thresholds, and BOGO deals
          </p>
        </div>

        <button
          onClick={handleSaveThresholds}
          className="px-4 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded clip-btn flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <span>💾 Save Surge & Deal Rules</span>
        </button>
      </div>

      {/* 1. Midnight Cravings Flash Deal Box */}
      <div className="bg-ink-850 border border-ink-700/60 p-4 sm:p-6 clip-tile space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌙</span>
            <div>
              <h3 className="font-display text-lg font-bold uppercase text-ink-50">
                Midnight Cravings Automated Flash Sale
              </h3>
              <p className="text-xs text-ink-400">
                Automatically activates 15-20% discount badge during late-night rush hours
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleFlash}
            className={`px-4 py-2 font-mono text-xs uppercase font-bold rounded transition-colors ${
              flashSaleActive
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-ink-900 text-ink-400 border border-ink-700"
            }`}
          >
            {flashSaleActive ? "● Flash Sale ACTIVE" : "○ Flash Sale PAUSED"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-ink-400 mb-1.5">
              Flash Discount Percentage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={flashDiscountPct}
                onChange={(e) => setFlashDiscountPct(Number(e.target.value))}
                className="w-full bg-ink-900 border border-ink-700 rounded p-2.5 text-sm font-mono text-ink-100"
              />
              <span className="font-mono text-sm text-ink-400">% OFF</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ink-400 mb-1.5">
              Active Hours Start
            </label>
            <input
              type="time"
              value={flashStartTime}
              onChange={(e) => setFlashStartTime(e.target.value)}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2.5 text-sm font-mono text-ink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-ink-400 mb-1.5">
              Active Hours End
            </label>
            <input
              type="time"
              value={flashEndTime}
              onChange={(e) => setFlashEndTime(e.target.value)}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2.5 text-sm font-mono text-ink-100"
            />
          </div>
        </div>

        {flashSaleActive && (
          <div className="bg-volt-400/10 border border-volt-400/30 p-3 rounded text-xs font-mono text-volt-300 flex items-center gap-2">
            <span>⚡ Live Banner:</span>
            <span className="font-bold">
              "🌙 Late Night Cravings? Get {flashDiscountPct}% OFF on all Midnight Cakes with code MIDNIGHT"
            </span>
          </div>
        )}
      </div>

      {/* 2. City-Wise Hyperlocal Free Delivery Thresholds */}
      <div className="bg-ink-850 border border-ink-700/60 p-4 sm:p-6 clip-tile space-y-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase text-ink-50">
            Delhi NCR City Delivery Thresholds & Midnight Surge
          </h3>
          <p className="text-xs font-mono text-ink-400">
            Set minimum order values and free delivery carts for Faridabad, Noida, Gurgaon & Delhi
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-ink-900 text-ink-400 uppercase tracking-wider border-b border-ink-800">
              <tr>
                <th className="p-3">Hyperlocal Hub</th>
                <th className="p-3">Min Order Value</th>
                <th className="p-3">Free Delivery Threshold</th>
                <th className="p-3">Midnight Slot Fee (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/60">
              {thresholds.map((t, idx) => (
                <tr key={t.hub} className="hover:bg-ink-900/40">
                  <td className="p-3 font-bold text-ink-100">{t.hub}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span>₹</span>
                      <input
                        type="number"
                        value={t.minOrder}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setThresholds((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, minOrder: val } : item))
                          );
                        }}
                        className="w-20 bg-ink-950 border border-ink-700 rounded p-1 text-ink-100 font-mono text-xs"
                      />
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span>₹</span>
                      <input
                        type="number"
                        value={t.freeDeliveryOver}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setThresholds((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, freeDeliveryOver: val } : item))
                          );
                        }}
                        className="w-24 bg-ink-950 border border-ink-700 rounded p-1 text-emerald-400 font-mono text-xs font-bold"
                      />
                      <span className="text-ink-500 text-[10px]">Free Ship</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span>+₹</span>
                      <input
                        type="number"
                        value={t.midnightSurge}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setThresholds((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, midnightSurge: val } : item))
                          );
                        }}
                        className="w-16 bg-ink-950 border border-ink-700 rounded p-1 text-purple-400 font-mono text-xs"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. BOGO & Free Gift Promotion Rules */}
      <div className="bg-ink-850 border border-ink-700/60 p-4 sm:p-6 clip-tile space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-display text-base font-bold uppercase text-ink-50">
            Celebration BOGO & Free Gift Rule
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 rounded">
            Active in Cart
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-mono text-ink-400 uppercase mb-1">Coupon Trigger Code</label>
            <input
              type="text"
              value={celebrationBogo.code}
              onChange={(e) => setCelebrationBogo({ ...celebrationBogo, code: e.target.value })}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2 text-xs font-mono text-ink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-400 uppercase mb-1">Min Cart Value (₹)</label>
            <input
              type="number"
              value={celebrationBogo.minCart}
              onChange={(e) => setCelebrationBogo({ ...celebrationBogo, minCart: Number(e.target.value) })}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2 text-xs font-mono text-ink-100"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-ink-400 uppercase mb-1">Gift / BOGO Description</label>
            <input
              type="text"
              value={celebrationBogo.desc}
              onChange={(e) => setCelebrationBogo({ ...celebrationBogo, desc: e.target.value })}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2 text-xs text-ink-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
