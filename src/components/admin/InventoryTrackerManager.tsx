import React, { useState } from "react";
import { useStore } from "../../lib/store";
import { Ic, Modal } from "../ui";

interface Ingredient {
  id: string;
  name: string;
  category: "chocolate" | "dairy" | "dry_goods" | "fruit_puree" | "packaging" | "decorations";
  stock: number;
  unit: string;
  minThreshold: number;
  supplier: string;
  costPerUnit: number;
  lastRestocked: string;
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: "ing-1", name: "Callebaut 70.5% Belgian Dark Chocolate Couverture", category: "chocolate", stock: 48, unit: "kg", minThreshold: 15, supplier: "Barry Callebaut India", costPerUnit: 1150, lastRestocked: "2026-08-28" },
  { id: "ing-2", name: "French Dairy Whipping Cream (35.1% Fat)", category: "dairy", stock: 12, unit: "litres", minThreshold: 20, supplier: "President India", costPerUnit: 420, lastRestocked: "2026-08-30" },
  { id: "ing-3", name: "Organic Low-Protein Cake Flour", category: "dry_goods", stock: 120, unit: "kg", minThreshold: 30, supplier: "Punjab Milling Corp", costPerUnit: 65, lastRestocked: "2026-08-25" },
  { id: "ing-4", name: "Wild Raspberry & Strawberry Macerated Purée", category: "fruit_puree", stock: 8, unit: "kg", minThreshold: 10, supplier: "Boiron Gourmet", costPerUnit: 980, lastRestocked: "2026-08-29" },
  { id: "ing-5", name: "Madagascar Bourbon Pure Vanilla Extract", category: "dry_goods", stock: 4.5, unit: "litres", minThreshold: 2, supplier: "Nielsen Massey", costPerUnit: 4800, lastRestocked: "2026-08-20" },
  { id: "ing-6", name: "Luxury Matte Black & Gold Cake Boxes (0.5kg)", category: "packaging", stock: 240, unit: "boxes", minThreshold: 50, supplier: "PackUrban Faridabad", costPerUnit: 38, lastRestocked: "2026-08-27" },
  { id: "ing-7", name: "Luxury Matte Black & Gold Cake Boxes (1.0kg)", category: "packaging", stock: 35, unit: "boxes", minThreshold: 50, supplier: "PackUrban Faridabad", costPerUnit: 52, lastRestocked: "2026-08-27" },
  { id: "ing-8", name: "Gold Metallic Celebration Sparkler Candles", category: "decorations", stock: 420, unit: "sets", minThreshold: 80, supplier: "PartyGlow Hub", costPerUnit: 24, lastRestocked: "2026-08-26" },
];

export function InventoryTrackerManager() {
  const { toast } = useStore();
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [catFilter, setCatFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [logModal, setLogModal] = useState<Ingredient | null>(null);
  const [usageDelta, setUsageDelta] = useState<number>(1);
  const [newModal, setNewModal] = useState(false);
  const [newIng, setNewIng] = useState({
    name: "",
    category: "chocolate" as Ingredient["category"],
    stock: 20,
    unit: "kg",
    minThreshold: 10,
    supplier: "",
    costPerUnit: 500,
  });

  const lowStockItems = ingredients.filter((i) => i.stock <= i.minThreshold);

  const handleAdjustStock = (ing: Ingredient, delta: number) => {
    const nextVal = Math.max(0, Number((ing.stock + delta).toFixed(1)));
    setIngredients((prev) =>
      prev.map((item) => (item.id === ing.id ? { ...item, stock: nextVal, lastRestocked: delta > 0 ? new Date().toISOString().slice(0, 10) : item.lastRestocked } : item))
    );
    toast("success", `Updated ${ing.name} stock to ${nextVal} ${ing.unit}`);
    setLogModal(null);
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIng.name) return;
    const item: Ingredient = {
      id: `ing-${Date.now()}`,
      name: newIng.name,
      category: newIng.category,
      stock: Number(newIng.stock),
      unit: newIng.unit,
      minThreshold: Number(newIng.minThreshold),
      supplier: newIng.supplier || "Delhi NCR Supplier",
      costPerUnit: Number(newIng.costPerUnit),
      lastRestocked: new Date().toISOString().slice(0, 10),
    };
    setIngredients([...ingredients, item]);
    setNewModal(false);
    toast("success", `Added ${item.name} to bakery inventory`);
  };

  const exportInventoryCSV = () => {
    const rows = [["ID", "Ingredient Name", "Category", "Current Stock", "Unit", "Min Threshold", "Status", "Cost/Unit (INR)"].join(",")];
    ingredients.forEach((i) => {
      const status = i.stock <= i.minThreshold ? "CRITICAL REORDER" : "HEALTHY";
      rows.push([i.id, `"${i.name}"`, i.category, i.stock, i.unit, i.minThreshold, status, i.costPerUnit].join(","));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cakeurban-kitchen-inventory.csv";
    a.click();
    toast("success", "Inventory sheet exported to CSV");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400" />
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink-50">
              Kitchen Raw Material & Stock Tracker
            </h2>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Real-time tracking of Belgian couverture chocolate, dairy cream, berry glazes, and cake packaging
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportInventoryCSV}
            className="px-3 py-2 bg-ink-900 border border-ink-700 hover:border-ink-500 text-ink-300 hover:text-ink-100 font-mono text-xs uppercase rounded flex items-center gap-1.5 transition-colors"
          >
            <span>📥 Export CSV</span>
          </button>
          <button
            onClick={() => setNewModal(true)}
            className="px-4 py-2 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded clip-btn flex items-center gap-1.5 transition-colors"
          >
            <span>+ Add Material</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-display text-sm font-bold text-amber-300 uppercase">
                {lowStockItems.length} Materials Below Kitchen Reorder Level!
              </p>
              <p className="text-xs font-mono text-amber-400/80">
                {lowStockItems.map((i) => `${i.name} (${i.stock} ${i.unit})`).join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => toast("info", "Purchase order email draft created for supplier replenishment")}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-ink-950 font-mono text-xs font-bold uppercase rounded self-start sm:self-auto transition-colors"
          >
            1-Click Reorder PO
          </button>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-ink-900 border border-ink-700/70 p-3 rounded">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {["ALL", "chocolate", "dairy", "dry_goods", "fruit_puree", "packaging", "decorations"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-1 font-mono text-xs uppercase rounded transition-colors whitespace-nowrap ${
                catFilter === cat
                  ? "bg-blaze-500 text-ink-50 font-bold"
                  : "bg-ink-950 text-ink-400 hover:text-ink-100"
              }`}
            >
              {cat.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search material or supplier..."
            className="bg-ink-950 border border-ink-700 rounded px-3 py-1.5 text-xs text-ink-100 placeholder-ink-500 outline-none w-44 sm:w-56"
          />
        </div>
      </div>

      {/* Ingredients Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {ingredients
          .filter((i) => catFilter === "ALL" || i.category === catFilter)
          .filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.supplier.toLowerCase().includes(search.toLowerCase()))
          .map((ing) => {
            const isLow = ing.stock <= ing.minThreshold;
            return (
              <div
                key={ing.id}
                className={`bg-ink-850 border p-4 clip-tile flex flex-col justify-between transition-colors ${
                  isLow ? "border-amber-500/70 bg-amber-950/10" : "border-ink-700/60 hover:border-ink-600"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 bg-ink-900 px-2 py-0.5 rounded">
                      {ing.category.replace("_", " ")}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isLow
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {isLow ? "Low Stock" : "In Stock"}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-ink-100 leading-snug">{ing.name}</h3>
                  <p className="text-xs text-ink-400 font-mono mt-1">Supplier: {ing.supplier}</p>
                  <p className="text-xs text-ink-400 font-mono">Cost: ₹{ing.costPerUnit} / {ing.unit}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-800">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-display text-2xl font-bold text-ink-50">
                      {ing.stock} <span className="text-xs font-mono text-ink-400 font-normal">{ing.unit}</span>
                    </span>
                    <span className="text-[10px] font-mono text-ink-500">Min: {ing.minThreshold} {ing.unit}</span>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAdjustStock(ing, -1)}
                      className="flex-1 py-1 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-200 text-xs font-mono rounded"
                      title="Log 1 unit used in kitchen"
                    >
                      -1 Used
                    </button>
                    <button
                      onClick={() => handleAdjustStock(ing, 5)}
                      className="flex-1 py-1 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-200 text-xs font-mono rounded"
                      title="Restock 5 units"
                    >
                      +5 Restock
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add New Material Modal */}
      {newModal && (
        <Modal open={newModal} onClose={() => setNewModal(false)}>
          <form onSubmit={handleAddIngredient} className="p-4 sm:p-6 bg-ink-900 max-w-md mx-auto space-y-3">
            <div className="border-b border-ink-800 pb-2 mb-2">
              <h3 className="font-display text-base font-bold uppercase text-ink-50">Add Kitchen Material</h3>
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Material Name *</label>
              <input
                required
                type="text"
                value={newIng.name}
                onChange={(e) => setNewIng({ ...newIng, name: e.target.value })}
                placeholder="e.g. Belgian White Chocolate 32%"
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-sm text-ink-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Category</label>
                <select
                  value={newIng.category}
                  onChange={(e) => setNewIng({ ...newIng, category: e.target.value as Ingredient["category"] })}
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-xs font-mono text-ink-100"
                >
                  <option value="chocolate">Chocolate</option>
                  <option value="dairy">Dairy & Cream</option>
                  <option value="dry_goods">Flour & Sugars</option>
                  <option value="fruit_puree">Fruit Purée</option>
                  <option value="packaging">Packaging Box</option>
                  <option value="decorations">Decorations</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Unit</label>
                <input
                  type="text"
                  value={newIng.unit}
                  onChange={(e) => setNewIng({ ...newIng, unit: e.target.value })}
                  placeholder="kg / litres / boxes"
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-xs text-ink-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Initial Stock</label>
                <input
                  type="number"
                  value={newIng.stock}
                  onChange={(e) => setNewIng({ ...newIng, stock: Number(e.target.value) })}
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-xs text-ink-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Min Threshold</label>
                <input
                  type="number"
                  value={newIng.minThreshold}
                  onChange={(e) => setNewIng({ ...newIng, minThreshold: Number(e.target.value) })}
                  className="w-full bg-ink-950 border border-ink-700 rounded p-2 text-xs text-ink-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">Supplier Name</label>
              <input
                type="text"
                value={newIng.supplier}
                onChange={(e) => setNewIng({ ...newIng, supplier: e.target.value })}
                placeholder="e.g. Barry Callebaut India"
                className="w-full bg-ink-950 border border-ink-700 rounded p-2.5 text-sm text-ink-100"
              />
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold rounded transition-colors"
              >
                Save Material
              </button>
              <button
                type="button"
                onClick={() => setNewModal(false)}
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
