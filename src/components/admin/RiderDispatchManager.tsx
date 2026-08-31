import React, { useState, useMemo } from "react";
import { useStore } from "../../lib/store";
import { Ic, Modal } from "../ui";
import type { Order } from "../../data/catalog";

interface Rider {
  id: string;
  name: string;
  phone: string;
  hub: string;
  vehicle: string;
  status: "available" | "on_delivery" | "off_duty";
  rating: number;
  totalDeliveries: number;
}

const INITIAL_RIDERS: Rider[] = [
  { id: "rd-1", name: "Rahul Sharma", phone: "+919811223344", hub: "Faridabad HQ", vehicle: "HR 51 AB 2091", status: "available", rating: 4.9, totalDeliveries: 342 },
  { id: "rd-2", name: "Amit Verma", phone: "+919877665544", hub: "Noida Hub", vehicle: "UP 16 CD 8812", status: "on_delivery", rating: 4.8, totalDeliveries: 289 },
  { id: "rd-3", name: "Deepak Kumar", phone: "+919822334455", hub: "Gurgaon Hub", vehicle: "HR 26 EF 4319", status: "available", rating: 5.0, totalDeliveries: 412 },
  { id: "rd-4", name: "Vikas Singh", phone: "+919844556677", hub: "South Delhi Hub", vehicle: "DL 3S GH 9102", status: "available", rating: 4.9, totalDeliveries: 198 },
  { id: "rd-5", name: "Sunil Yadav", phone: "+919855667788", hub: "Ghaziabad Hub", vehicle: "UP 14 JK 1198", status: "available", rating: 4.7, totalDeliveries: 156 },
];

export function RiderDispatchManager() {
  const { orders, toast, fmt } = useStore();
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [selectedHub, setSelectedHub] = useState<string>("ALL");
  const [assignModal, setAssignModal] = useState<{ order: Order; riderId: string } | null>(null);
  const [newRiderModal, setNewRiderModal] = useState(false);
  const [newRider, setNewRider] = useState({ name: "", phone: "", hub: "Faridabad HQ", vehicle: "" });

  const activeDeliveries = useMemo(() => {
    return orders.filter((o) => o.status === "processing" || o.status === "shipped");
  }, [orders]);

  const generateDriverWhatsAppLink = (order: Order, rider: Rider) => {
    const itemsText = order.items.map((it) => `${it.qty}x ${it.name} (${it.size || "0.5kg"})`).join(", ");
    const customer = order.email.split("@")[0].toUpperCase();
    const text = encodeURIComponent(
      `🛵 *CAKEURBAN RIDER DISPATCH NOTICE*\n\n` +
      `👤 *Customer:* ${customer}\n` +
      `✉️ *Email:* ${order.email}\n` +
      `📍 *Delivery Address:* ${order.address}\n` +
      `🎂 *Cakes to Handover:* ${itemsText}\n` +
      `✍️ *Message on Cake:* "Happy Birthday"\n` +
      `💵 *Order Value / Collect:* ${order.payment === "cod" ? `Collect Cash ${fmt(order.total)}` : "ALREADY PREPAID (Do not collect cash)"}\n` +
      `⏰ *Target ETA:* Within 35-45 Minutes\n\n` +
      `Please ensure the insulated cold bag is zipped during transit.`
    );
    return `https://api.whatsapp.com/send?phone=${rider.phone.replace(/[^0-9]/g, "")}&text=${text}`;
  };

  const handleAssignRider = (order: Order, riderId: string) => {
    const rider = riders.find((r) => r.id === riderId);
    if (!rider) return;
    setRiders((prev) =>
      prev.map((r) => (r.id === riderId ? { ...r, status: "on_delivery", totalDeliveries: r.totalDeliveries + 1 } : r))
    );
    toast("success", `Order #${order.id.slice(-6).toUpperCase()} assigned to ${rider.name}`);
    // Open WhatsApp link
    const waUrl = generateDriverWhatsAppLink(order, rider);
    window.open(waUrl, "_blank");
    setAssignModal(null);
  };

  const handleCreateRider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRider.name || !newRider.phone) {
      toast("error", "Please provide Rider Name and Phone number");
      return;
    }
    const r: Rider = {
      id: `rd-${Date.now()}`,
      name: newRider.name,
      phone: newRider.phone.startsWith("+91") ? newRider.phone : `+91${newRider.phone}`,
      hub: newRider.hub,
      vehicle: newRider.vehicle || "Motorcycle",
      status: "available",
      rating: 5.0,
      totalDeliveries: 0,
    };
    setRiders([...riders, r]);
    setNewRider({ name: "", phone: "", hub: "Faridabad HQ", vehicle: "" });
    setNewRiderModal(false);
    toast("success", `Rider ${r.name} added to ${r.hub} fleet!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blaze-400" />
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink-50">
              Hyperlocal Rider & Driver Dispatch
            </h2>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Dispatch orders to delivery boys across Delhi NCR with 1-click WhatsApp navigation briefs
          </p>
        </div>

        <button
          onClick={() => setNewRiderModal(true)}
          className="px-4 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded clip-btn flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <span>+ Add Delivery Rider</span>
        </button>
      </div>

      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-ink-850 border border-ink-700/60 p-4 clip-tile">
          <p className="font-mono text-[10px] uppercase text-ink-400 tracking-wider">Active Fleet</p>
          <p className="font-display text-2xl font-bold text-ink-50 mt-1">{riders.length} Riders</p>
          <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
            {riders.filter((r) => r.status === "available").length} Available for dispatch
          </p>
        </div>

        <div className="bg-ink-850 border border-ink-700/60 p-4 clip-tile">
          <p className="font-mono text-[10px] uppercase text-ink-400 tracking-wider">Active Deliveries</p>
          <p className="font-display text-2xl font-bold text-blaze-400 mt-1">{activeDeliveries.length}</p>
          <p className="text-[11px] font-mono text-ink-400 mt-0.5">Avg Transit: 28 Mins</p>
        </div>

        <div className="bg-ink-850 border border-ink-700/60 p-4 clip-tile">
          <p className="font-mono text-[10px] uppercase text-ink-400 tracking-wider">Fleet On-Time Rate</p>
          <p className="font-display text-2xl font-bold text-emerald-400 mt-1">98.6%</p>
          <p className="text-[11px] font-mono text-ink-400 mt-0.5">Cold bag insulated delivery</p>
        </div>

        <div className="bg-ink-850 border border-ink-700/60 p-4 clip-tile">
          <p className="font-mono text-[10px] uppercase text-ink-400 tracking-wider">Midnight Squad</p>
          <p className="font-display text-2xl font-bold text-purple-400 mt-1">Ready</p>
          <p className="text-[11px] font-mono text-ink-400 mt-0.5">11:30 PM - 12:15 AM slots</p>
        </div>
      </div>

      {/* Orders Ready for Rider Dispatch */}
      <div className="bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold uppercase text-ink-50">
              Orders Pending Rider Assignment ({activeDeliveries.length})
            </h3>
            <p className="text-xs font-mono text-ink-400">Click "Dispatch to WhatsApp" to assign rider and generate GPS slip</p>
          </div>
        </div>

        {activeDeliveries.length === 0 ? (
          <p className="text-xs font-mono text-ink-400 py-6 text-center border border-dashed border-ink-700 rounded">
            No orders pending delivery right now. All orders have been completed!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeDeliveries.map((ord) => (
              <div key={ord.id} className="bg-ink-900 border border-ink-700/70 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs font-bold text-blaze-400">
                      ORDER #{ord.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      {ord.payment === "cod" ? "Cash On Delivery" : "Prepaid Online"}
                    </span>
                  </div>

                  <p className="font-display text-sm font-bold text-ink-100">{ord.email.split("@")[0].toUpperCase()}</p>
                  <p className="text-xs text-ink-400 line-clamp-1 font-mono">📍 {ord.address}</p>

                  <div className="text-xs text-ink-300 mt-2 bg-ink-950/60 p-2 rounded">
                    {ord.items.map((it, i) => (
                      <span key={i} className="mr-2">
                        {it.qty}x {it.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-800 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-ink-100">{fmt(ord.total)}</span>
                  <button
                    onClick={() => setAssignModal({ order: ord, riderId: riders[0].id })}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-ink-50 font-mono text-[11px] font-bold uppercase rounded flex items-center gap-1.5 transition-colors"
                  >
                    <span>💬 WhatsApp Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fleet Roster List */}
      <div className="bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-display text-base font-bold uppercase text-ink-50">
            Delhi NCR Registered Fleet ({riders.length})
          </h3>

          <div className="flex gap-1.5 flex-wrap">
            {["ALL", "Faridabad HQ", "Noida Hub", "Gurgaon Hub", "South Delhi Hub"].map((hub) => (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  selectedHub === hub ? "bg-blaze-500 text-ink-50 font-bold" : "bg-ink-900 text-ink-400 hover:text-ink-100"
                }`}
              >
                {hub}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {riders
            .filter((r) => selectedHub === "ALL" || r.hub === selectedHub)
            .map((rider) => (
              <div key={rider.id} className="bg-ink-900 border border-ink-700/70 p-4 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-display text-sm font-bold text-ink-50">{rider.name}</span>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded ${
                        rider.status === "available"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : rider.status === "on_delivery"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-ink-800 text-ink-400"
                      }`}
                    >
                      {rider.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-blaze-400">{rider.hub}</p>
                  <p className="text-xs font-mono text-ink-400 mt-1">📞 {rider.phone}</p>
                  <p className="text-xs font-mono text-ink-400">🛵 {rider.vehicle}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-ink-800 flex justify-between items-center text-xs font-mono text-ink-400">
                  <span>⭐ {rider.rating.toFixed(1)} Rating</span>
                  <span>{rider.totalDeliveries} Delivered</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Assign Rider WhatsApp Modal */}
      {assignModal && (
        <Modal open={!!assignModal} onClose={() => setAssignModal(null)}>
          <div className="p-4 sm:p-6 bg-ink-900 max-w-md mx-auto space-y-4">
            <div className="border-b border-ink-800 pb-2">
              <h3 className="font-display text-base font-bold uppercase text-ink-50">Dispatch Rider via WhatsApp</h3>
            </div>
            <p className="text-xs font-mono text-ink-300">
              Select the rider for Order <span className="text-blaze-400 font-bold">#{assignModal.order.id.slice(-6).toUpperCase()}</span>.
              Clicking dispatch will automatically open WhatsApp with the address, cake specs, and customer contact.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-ink-400">Select Available Rider:</label>
              <select
                value={assignModal.riderId}
                onChange={(e) => setAssignModal({ ...assignModal, riderId: e.target.value })}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-sm font-mono text-ink-100"
              >
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.hub} ({r.phone}) [{r.status}]
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-ink-950 p-3 rounded border border-ink-800 text-xs font-mono space-y-1">
              <p className="text-ink-400 font-bold uppercase">Dispatch Details Preview:</p>
              <p className="text-ink-200">Customer: {assignModal.order.email.split("@")[0].toUpperCase()}</p>
              <p className="text-ink-200 line-clamp-1">Address: {assignModal.order.address}</p>
              <p className="text-ink-200">Amount: {fmt(assignModal.order.total)}</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleAssignRider(assignModal.order, assignModal.riderId)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-ink-50 font-mono text-xs uppercase font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>💬 Open in WhatsApp & Dispatch</span>
              </button>
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2.5 bg-ink-800 text-ink-300 font-mono text-xs uppercase rounded hover:text-ink-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add New Rider Modal */}
      {newRiderModal && (
        <Modal open={newRiderModal} onClose={() => setNewRiderModal(false)}>
          <form onSubmit={handleCreateRider} className="p-4 sm:p-6 bg-ink-900 max-w-md mx-auto space-y-3">
            <div className="border-b border-ink-800 pb-2 mb-2">
              <h3 className="font-display text-base font-bold uppercase text-ink-50">Register Delivery Rider</h3>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Rider Full Name *</label>
              <input
                required
                type="text"
                value={newRider.name}
                onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                placeholder="e.g. Sunil Sharma"
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-sm text-ink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">WhatsApp Phone Number *</label>
              <input
                required
                type="tel"
                value={newRider.phone}
                onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                placeholder="e.g. 9811223344"
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-sm text-ink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Assigned Kitchen Hub *</label>
              <select
                value={newRider.hub}
                onChange={(e) => setNewRider({ ...newRider, hub: e.target.value })}
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-sm font-mono text-ink-100"
              >
                <option value="Faridabad HQ">Faridabad HQ Hub</option>
                <option value="Noida Hub">Noida & Gr. Noida Hub</option>
                <option value="Gurgaon Hub">Gurgaon (Gurugram) Hub</option>
                <option value="South Delhi Hub">South Delhi Hub</option>
                <option value="Ghaziabad Hub">Ghaziabad Hub</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Vehicle / Bike Number</label>
              <input
                type="text"
                value={newRider.vehicle}
                onChange={(e) => setNewRider({ ...newRider, vehicle: e.target.value })}
                placeholder="e.g. HR 51 BC 4091"
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-sm text-ink-100"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded transition-colors"
              >
                Save Rider
              </button>
              <button
                type="button"
                onClick={() => setNewRiderModal(false)}
                className="px-4 py-2.5 bg-ink-800 text-ink-300 font-mono text-xs uppercase rounded hover:text-ink-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
