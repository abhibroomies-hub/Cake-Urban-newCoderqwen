import { useState, useRef } from "react";
import { useStore } from "../../lib/store";
import { type Category } from "../../data/catalog";
import { Ic, Modal } from "../ui";

export function CategoriesManager() {
  const store = useStore();
  const { categories, addCategory, updateCategory, deleteCategory, reorderCategories, toast } = store;
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [newSubcat, setNewSubcat] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const moveCategory = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const newCats = [...categories];
    const temp = newCats[index];
    newCats[index] = newCats[targetIndex];
    newCats[targetIndex] = temp;
    reorderCategories(newCats);
  };

  const handleOpenNew = () => {
    setIsNew(true);
    const newId = `cat-${Date.now()}`;
    setEditingCat({
      id: newId,
      name: "",
      desc: "Freshly baked on order using 100% vegetarian artisan ingredients.",
      img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
      subs: ["Belgian Dark", "Truffle", "Fruit Sponge", "Celebration"],
      showInNav: true,
      showOnHome: true,
    });
  };

  const handleSave = () => {
    if (!editingCat || !editingCat.name.trim()) {
      toast("error", "Category name is required");
      return;
    }
    const finalCat: Category = {
      ...editingCat,
      name: editingCat.name.trim(),
    };

    if (isNew) {
      addCategory(finalCat);
    } else {
      updateCategory(finalCat);
    }
    setEditingCat(null);
  };

  return (
    <div className="anim-fade-up space-y-5">
      {/* Top Banner / Actions */}
      <div className="flex items-center justify-between gap-4 p-5 bg-ink-850 border border-ink-700/60 clip-tile flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-volt-400 animate-pulse" />
            <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
              Dynamic Taxonomy & Navigation
            </p>
          </div>
          <h2 className="font-display text-xl font-bold uppercase mt-1">
            Category Management ({categories.length})
          </h2>
          <p className="text-xs text-ink-400 mt-1 max-w-xl">
            Control category titles, image banners, subcategories, top navigation menu visibility, and homepage bakes showcase in real-time.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.15em] uppercase px-5 py-3 flex items-center gap-2 transition-colors font-bold shadow-lg shadow-blaze-500/25"
        >
          <Ic.plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* Category Grid / List */}
      <div className="grid md:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div
            key={cat.id || cat.name}
            className="border border-ink-700/60 bg-ink-850 p-5 clip-tile hover:border-blaze-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Category Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded overflow-hidden bg-ink-900 border border-ink-700 shrink-0 relative shadow-inner">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-lg text-ink-50 truncate">
                      {cat.name}
                    </h3>
                    <span className="font-mono text-[10px] text-ink-400 bg-ink-900 px-2 py-0.5 rounded border border-ink-800">
                      #{idx + 1}
                    </span>
                  </div>

                  <p className="text-xs text-ink-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.desc || "Artisan bake category"}
                  </p>
                </div>
              </div>

              {/* Subcategories */}
              <div className="mt-4 pt-3 border-t border-ink-800">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-500 font-bold mb-2">
                  Subcategories & Flavors ({cat.subs?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subs?.map((s: string) => (
                    <span
                      key={s}
                      className="bg-ink-900 border border-ink-700 text-ink-300 text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1"
                    >
                      {s}
                    </span>
                  ))}
                  {(!cat.subs || cat.subs.length === 0) && (
                    <span className="text-[11px] text-ink-500 italic">No subcategories defined</span>
                  )}
                </div>
              </div>

              {/* Display & Visibility Badges */}
              <div className="mt-4 flex items-center gap-2 flex-wrap text-[11px] font-mono">
                <button
                  onClick={() => {
                    updateCategory({ ...cat, showInNav: !cat.showInNav });
                  }}
                  className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                    cat.showInNav !== false
                      ? "bg-volt-400/10 border-volt-400/40 text-volt-400"
                      : "bg-ink-900 border-ink-700 text-ink-500"
                  }`}
                  title="Toggle top navigation bar visibility"
                >
                  <Ic.check className="w-3.5 h-3.5" />
                  {cat.showInNav !== false ? "In Header Nav" : "Hidden in Nav"}
                </button>

                <button
                  onClick={() => {
                    updateCategory({ ...cat, showOnHome: !cat.showOnHome });
                  }}
                  className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                    cat.showOnHome !== false
                      ? "bg-blaze-500/10 border-blaze-500/40 text-blaze-400"
                      : "bg-ink-900 border-ink-700 text-ink-500"
                  }`}
                  title="Toggle homepage category showcase grid visibility"
                >
                  <Ic.eye className="w-3.5 h-3.5" />
                  {cat.showOnHome !== false ? "On Homepage" : "Hidden on Home"}
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-5 pt-3 border-t border-ink-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveCategory(idx, "up")}
                  className="p-1.5 text-ink-400 hover:text-ink-100 disabled:opacity-30 disabled:hover:text-ink-400 bg-ink-900 border border-ink-700 rounded transition-colors"
                  title="Move Up in Order"
                >
                  <Ic.arrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === categories.length - 1}
                  onClick={() => moveCategory(idx, "down")}
                  className="p-1.5 text-ink-400 hover:text-ink-100 disabled:opacity-30 disabled:hover:text-ink-400 bg-ink-900 border border-ink-700 rounded transition-colors"
                  title="Move Down in Order"
                >
                  <span className="rotate-180 inline-block"><Ic.arrowUp className="w-3.5 h-3.5" /></span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsNew(false);
                    setEditingCat(cat);
                  }}
                  className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 text-ink-100 font-mono text-xs uppercase rounded border border-ink-600 transition-colors flex items-center gap-1.5"
                >
                  <Ic.edit className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                      deleteCategory(cat.name);
                    }
                  }}
                  className="p-1.5 text-ink-400 hover:text-danger-400 hover:bg-danger-500/10 rounded transition-colors"
                  title="Delete Category"
                >
                  <Ic.trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Category Modal */}
      {editingCat && (
        <Modal open onClose={() => setEditingCat(null)}>
          <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-ink-800 pb-3 mb-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
                  {isNew ? "✨ New Category" : `Edit Category — ${editingCat.name}`}
                </p>
                <h3 className="font-display text-xl font-bold uppercase mt-0.5">
                  {isNew ? "Create Store Category" : editingCat.name}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category Name */}
              <div>
                <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                  Category Name *
                </label>
                <input
                  value={editingCat.name}
                  onChange={(e) => setEditingCat({ ...editingCat, name: e.target.value })}
                  placeholder="e.g. Bento Cakes, Artisan Cheesecakes"
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2.5 text-xs font-semibold rounded transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                  Tagline / Description
                </label>
                <textarea
                  value={editingCat.desc || ""}
                  onChange={(e) => setEditingCat({ ...editingCat, desc: e.target.value })}
                  rows={2}
                  placeholder="Describe the highlight of this category..."
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2 text-xs rounded resize-none transition-colors"
                />
              </div>

              {/* Category Image */}
              <div>
                <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                  Banner Photo URL
                </label>
                <div className="grid sm:grid-cols-[80px_1fr] gap-3 items-start bg-ink-950 p-3 border border-ink-700/60 rounded">
                  <div className="w-20 h-20 bg-ink-900 border border-ink-700 rounded overflow-hidden">
                    <img
                      src={editingCat.img}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setEditingCat({ ...editingCat, img: evt.target.result as string });
                                toast("success", "Category photo loaded!");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-ink-800 hover:bg-ink-700 text-ink-100 font-mono text-[10px] uppercase px-3 py-1.5 border border-ink-600 rounded flex items-center gap-1.5 transition-colors"
                      >
                        📷 Upload Photo
                      </button>
                      <span className="text-[10px] text-ink-400 font-mono">or paste image link</span>
                    </div>

                    <input
                      value={editingCat.img}
                      onChange={(e) => setEditingCat({ ...editingCat, img: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-ink-900 border border-ink-700 focus:border-blaze-500 outline-none px-3 py-1.5 text-xs font-mono rounded"
                    />

                    {/* Quick presets */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {[
                        { name: "Cakes", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80" },
                        { name: "Cookies", url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80" },
                        { name: "Brownies", url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80" },
                        { name: "Pastries", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80" },
                        { name: "Hampers", url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80" },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setEditingCat({ ...editingCat, img: preset.url })}
                          className={`text-[9px] font-mono px-2 py-1 rounded border transition-colors ${
                            editingCat.img === preset.url
                              ? "bg-blaze-500/20 border-blaze-500 text-blaze-400"
                              : "bg-ink-900 border-ink-700 text-ink-400 hover:text-ink-200"
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subcategories Editor */}
              <div>
                <label className="block font-mono text-[9px] tracking-[0.15em] uppercase text-ink-400 font-bold mb-1">
                  Subcategories & Flavor Tags
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2 bg-ink-950 p-2.5 border border-ink-700/60 rounded min-h-12 items-center">
                  {editingCat.subs?.map((s: string, sIdx: number) => (
                    <span
                      key={sIdx}
                      className="bg-ink-850 border border-ink-700 text-ink-200 text-xs font-mono px-2 py-1 rounded flex items-center gap-1.5"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (editingCat.subs || []).filter((_: string, i: number) => i !== sIdx);
                          setEditingCat({ ...editingCat, subs: updated });
                        }}
                        className="text-ink-400 hover:text-danger-400"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {(!editingCat.subs || editingCat.subs.length === 0) && (
                    <span className="text-ink-500 font-mono text-xs">No subcategories yet. Type below and press Enter or Add.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    value={newSubcat}
                    onChange={(e) => setNewSubcat(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSubcat.trim()) {
                        e.preventDefault();
                        const val = newSubcat.trim();
                        if (!editingCat.subs?.includes(val)) {
                          setEditingCat({ ...editingCat, subs: [...(editingCat.subs || []), val] });
                        }
                        setNewSubcat("");
                      }
                    }}
                    placeholder="Type subcategory (e.g. Belgian Noir, Pinata, Sugarfree) & press Enter"
                    className="flex-1 bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-xs font-mono rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubcat.trim()) {
                        const val = newSubcat.trim();
                        if (!editingCat.subs?.includes(val)) {
                          setEditingCat({ ...editingCat, subs: [...(editingCat.subs || []), val] });
                        }
                        setNewSubcat("");
                      }
                    }}
                    className="bg-ink-800 hover:bg-ink-700 text-ink-100 font-mono text-xs uppercase px-4 py-2 rounded border border-ink-600"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2.5 p-3 bg-ink-950 border border-ink-700/60 rounded cursor-pointer hover:border-ink-500">
                  <input
                    type="checkbox"
                    checked={editingCat.showInNav !== false}
                    onChange={(e) => setEditingCat({ ...editingCat, showInNav: e.target.checked })}
                    className="w-4 h-4 accent-blaze-500 rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs text-ink-100">Show in Header Navbar</p>
                    <p className="text-[10px] text-ink-400">Included in top navigation category bar</p>
                  </div>
                </label>

                <label className="flex items-center gap-2.5 p-3 bg-ink-950 border border-ink-700/60 rounded cursor-pointer hover:border-ink-500">
                  <input
                    type="checkbox"
                    checked={editingCat.showOnHome !== false}
                    onChange={(e) => setEditingCat({ ...editingCat, showOnHome: e.target.checked })}
                    className="w-4 h-4 accent-blaze-500 rounded"
                  />
                  <div>
                    <p className="font-semibold text-xs text-ink-100">Show on Homepage Showcase</p>
                    <p className="text-[10px] text-ink-400">Visible in home category cards grid</p>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-ink-800">
                <button
                  type="button"
                  onClick={handleSave}
                  className="clip-btn flex-1 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.15em] uppercase py-3.5 font-bold transition-colors shadow-lg shadow-blaze-500/25 flex items-center justify-center gap-2"
                >
                  <Ic.check className="w-4 h-4" /> {isNew ? "Create Category" : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
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
