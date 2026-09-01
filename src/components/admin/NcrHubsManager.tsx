import { useState } from "react";
import { useStore } from "../../lib/store";
import { type NcrHub, SEED_NCR_HUBS } from "../../data/catalog";
import { Ic, Modal } from "../ui";

export function NcrHubsManager() {
  const store = useStore();
  const { settings, updateNcrHub, toast } = store;
  const hubs: NcrHub[] = settings.ncrHubs || SEED_NCR_HUBS;

  const [editingHub, setEditingHub] = useState<NcrHub | null>(null);

  const handleSave = () => {
    if (!editingHub) return;
    updateNcrHub(editingHub);
    setEditingHub(null);
  };

  return (
    <div className="anim-fade-up space-y-6">
      {/* Header Banner */}
      <div className="p-5 bg-ink-850 border border-ink-700/60 clip-tile flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="font-mono text-[10px] tracking-[0.25em] text-emerald-400 uppercase font-bold">
              Hyper-Local Logistics & Dispatch
            </p>
          </div>
          <h2 className="font-display text-xl font-bold uppercase mt-1">
            Delhi NCR Delivery Hubs & ETA Control
          </h2>
          <p className="text-xs text-ink-400 mt-1 max-w-xl">
            Manage dispatch hubs across Faridabad, Noida, Gurgaon, Delhi, and Ghaziabad. Adjust live delivery estimates, minimum orders, and dispatch radii.
          </p>
        </div>
      </div>

      {/* Hub Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hubs.map((hub) => (
          <div
            key={hub.id}
            className={`border p-5 clip-tile transition-all flex flex-col justify-between ${
              hub.active !== false
                ? "bg-ink-850 border-ink-700/60 hover:border-blaze-500/50"
                : "bg-ink-950/80 border-ink-800 opacity-60"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded bg-blaze-500/15 border border-blaze-500/40 text-blaze-400 font-mono text-xs flex items-center justify-center font-bold">
                    📍
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-base text-ink-50">
                      {hub.city}
                    </h3>
                    <p className="font-mono text-[10px] text-ink-400">{hub.zone}</p>
                  </div>
                </div>

                <span
                  className={`font-mono text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${
                    hub.active !== false
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                      : "bg-ink-900 border-ink-700 text-ink-500"
                  }`}
                >
                  {hub.active !== false ? "Live / Active" : "Paused"}
                </span>
              </div>

              <div className="mt-4 bg-ink-900/90 border border-ink-800 p-3 rounded space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-ink-300">
                  <span className="text-ink-500 text-[11px]">⚡ Express ETA:</span>
                  <span className="font-bold text-volt-400">{hub.time}</span>
                </div>
                <div className="flex justify-between items-center text-ink-300">
                  <span className="text-ink-500 text-[11px]">💰 Min. Order:</span>
                  <span>₹{hub.minOrder}</span>
                </div>
                <div className="flex justify-between items-center text-ink-300">
                  <span className="text-ink-500 text-[11px]">🏷️ Hub Badge:</span>
                  <span className="text-blaze-400 font-bold">{hub.badge}</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-ink-500 font-bold mb-1">
                  Key Coverage Areas:
                </p>
                <p className="text-xs text-ink-300 font-mono bg-ink-900/50 p-2 border border-ink-800 rounded line-clamp-3">
                  {hub.topAreas}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-ink-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  updateNcrHub({ ...hub, active: hub.active === false });
                  toast("info", `${hub.city} is now ${hub.active === false ? "Active" : "Paused"}`);
                }}
                className={`text-[10px] font-mono px-3 py-1.5 rounded border uppercase transition-colors ${
                  hub.active !== false
                    ? "border-danger-500/40 text-danger-400 hover:bg-danger-500 hover:text-white"
                    : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-ink-950"
                }`}
              >
                {hub.active !== false ? "Pause Hub" : "Activate Hub"}
              </button>

              <button
                type="button"
                onClick={() => setEditingHub(hub)}
                className="px-3.5 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-100 font-mono text-xs uppercase rounded border border-ink-600 transition-colors flex items-center gap-1.5"
              >
                <Ic.edit className="w-3.5 h-3.5" /> Edit Hub
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Hub Modal */}
      {editingHub && (
        <Modal open onClose={() => setEditingHub(null)}>
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-800 pb-3 mb-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
                  📍 Delivery Dispatch Hub
                </p>
                <h3 className="font-display text-xl font-bold uppercase mt-0.5">
                  Edit {editingHub.city} ({editingHub.zone})
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                    City / Territory Name
                  </label>
                  <input
                    value={editingHub.city}
                    onChange={(e) => setEditingHub({ ...editingHub, city: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-semibold rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                    Route / Zone Label
                  </label>
                  <input
                    value={editingHub.zone}
                    onChange={(e) => setEditingHub({ ...editingHub, zone: e.target.value })}
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                    Express ETA
                  </label>
                  <input
                    value={editingHub.time}
                    onChange={(e) => setEditingHub({ ...editingHub, time: e.target.value })}
                    placeholder="30-45 Mins"
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono font-bold text-volt-400 rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    value={editingHub.minOrder}
                    onChange={(e) => setEditingHub({ ...editingHub, minOrder: Number(e.target.value) })}
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                    Hub Badge Tag
                  </label>
                  <input
                    value={editingHub.badge}
                    onChange={(e) => setEditingHub({ ...editingHub, badge: e.target.value })}
                    placeholder="e.g. ULTRA EXPRESS"
                    className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono font-bold text-blaze-400 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase tracking-[0.15em] text-ink-400 font-bold mb-1">
                  Key Coverage Sectors & Localities
                </label>
                <textarea
                  rows={3}
                  value={editingHub.topAreas}
                  onChange={(e) => setEditingHub({ ...editingHub, topAreas: e.target.value })}
                  placeholder="e.g. Sector 15, Sector 16, NIT, Green Field..."
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs font-mono rounded resize-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 bg-ink-950 border border-ink-700/60 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingHub.active !== false}
                    onChange={(e) => setEditingHub({ ...editingHub, active: e.target.checked })}
                    className="w-4 h-4 accent-blaze-500 rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs text-ink-100">Active Delivery Hub</p>
                    <p className="text-[10px] text-ink-400">Accepting orders with live rider dispatch</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-ink-800">
                <button
                  type="button"
                  onClick={handleSave}
                  className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase py-3.5 font-bold transition-colors shadow-lg shadow-blaze-500/25 flex items-center justify-center gap-2"
                >
                  <Ic.check className="w-4 h-4" /> Save Hub Configuration
                </button>
                <button
                  type="button"
                  onClick={() => setEditingHub(null)}
                  className="px-5 py-3.5 bg-ink-800 hover:bg-ink-700 text-ink-300 font-mono text-xs uppercase rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
