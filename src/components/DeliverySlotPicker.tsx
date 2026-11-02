import React, { useState } from "react";
import { Ic } from "./ui";

export type DeliverySlotValue = {
  date: string;
  slotId: "express" | "standard" | "midnight";
  slotLabel: string;
  windowText: string;
  surcharge: number;
  plaqueMessage: string;
  includeKit: boolean;
};

export const DELIVERY_SLOTS = [
  {
    id: "express" as const,
    label: "⚡ 30-45 Min",
    window: "Express Dispatch",
    surcharge: 0,
  },
  {
    id: "standard" as const,
    label: "🕰 2-Hr Slot",
    window: "6 PM – 8 PM",
    surcharge: 0,
  },
  {
    id: "midnight" as const,
    label: "🌙 Midnight",
    window: "11:30 PM – 12:15 AM",
    surcharge: 4,
  },
];

export function DeliverySlotPicker({
  value,
  onChange,
  onWhatsAppOrder,
  fmt,
}: {
  value: DeliverySlotValue;
  onChange: (next: DeliverySlotValue) => void;
  onWhatsAppOrder?: () => void;
  fmt: (usd: number) => string;
}) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [showPlaque, setShowPlaque] = useState(Boolean(value.plaqueMessage));

  return (
    <div className="border border-ink-700/80 bg-ink-900/90 rounded-lg p-3.5 sm:p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-ink-100 uppercase tracking-wider">
          🚚 Delivery Slot
        </span>
        <input
          type="date"
          min={todayStr}
          value={value.date}
          onChange={(e) => onChange({ ...value, date: e.target.value })}
          className="bg-ink-950 border border-ink-700 focus:border-blaze-500 px-2 py-1 font-mono text-xs text-ink-100 rounded outline-none"
        />
      </div>

      {/* 3 Compact Slot Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {DELIVERY_SLOTS.map((s) => {
          const active = value.slotId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                onChange({
                  ...value,
                  slotId: s.id,
                  slotLabel: s.label,
                  windowText: s.window,
                  surcharge: s.surcharge,
                })
              }
              className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                active
                  ? "border-blaze-500 bg-blaze-500/15 text-ink-50"
                  : "border-ink-700/80 bg-ink-950/70 text-ink-300 hover:border-ink-500"
              }`}
            >
              <div>
                <span className="font-mono text-[11px] font-bold block truncate">{s.label}</span>
                <p className="text-[10px] text-ink-400 mt-0.5 truncate">{s.window}</p>
              </div>
              <p className="font-mono text-[9px] font-bold text-volt-400 mt-1.5 uppercase">
                {s.surcharge === 0 ? "Free" : `+${fmt(s.surcharge)}`}
              </p>
            </button>
          );
        })}
      </div>

      {/* Collapsible Plaque Input + WhatsApp CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={() => setShowPlaque(!showPlaque)}
          className="font-mono text-[11px] text-blaze-400 hover:underline flex items-center gap-1"
        >
          <span>{showPlaque ? "− Hide Cake Message" : "+ Add Free Name / Message on Cake"}</span>
        </button>

        {onWhatsAppOrder && (
          <button
            type="button"
            onClick={onWhatsAppOrder}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] uppercase font-bold tracking-wider rounded transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Ic.whatsapp className="w-3.5 h-3.5" />
            <span>Order on WhatsApp</span>
          </button>
        )}
      </div>

      {showPlaque && (
        <div className="pt-1 anim-fade-in">
          <input
            type="text"
            maxLength={32}
            value={value.plaqueMessage}
            onChange={(e) => onChange({ ...value, plaqueMessage: e.target.value })}
            placeholder="Write message on cake (e.g. Happy Birthday Rahul!)"
            className="w-full bg-ink-950 border border-ink-700 focus:border-blaze-500 px-3 py-2 text-xs text-ink-100 rounded outline-none"
          />
        </div>
      )}
    </div>
  );
}
export default DeliverySlotPicker;
