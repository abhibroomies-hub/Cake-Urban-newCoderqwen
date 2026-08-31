import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../lib/store";
import { Ic, ImgX } from "../components/ui";

const SIZES = [
  { id: "6", name: '6" (Serves 4-6)', price: 35 },
  { id: "8", name: '8" (Serves 8-12)', price: 50 },
  { id: "10", name: '10" (Serves 15-20)', price: 75 },
  { id: "12", name: '12" (Serves 25-30)', price: 110 },
];

const BASES = [
  { id: "vanilla", name: "Madagascar Vanilla Bean", desc: "Light, buttery sponge with real vanilla pods", add: 0 },
  { id: "chocolate", name: "72% Belgian Dark Chocolate", desc: "Rich, velvety cocoa sponge", add: 5 },
  { id: "redvelvet", name: "Southern Red Velvet", desc: "Subtle cocoa with cream cheese undertones", add: 4 },
  { id: "matcha", name: "Kyoto Uji Matcha", desc: "Aromatic ceremonial-grade green tea", add: 8 },
  { id: "carrot", name: "Spiced Walnut Carrot", desc: "Fresh grated carrots, cinnamon & toasted walnuts", add: 6 },
];

const CREAMS = [
  { id: "whipped", name: "Light Whipped Chantilly", add: 0 },
  { id: "butter", name: "Silky Swiss Buttercream", add: 4 },
  { id: "mousse", name: "Belgian Chocolate Mousse", add: 6 },
  { id: "ganache", name: "Glossy Dark Ganache", add: 7 },
];

const FILLINGS = [
  { id: "strawberry", name: "Fresh Strawberry Coulis", add: 4 },
  { id: "mango", name: "Alphonso Mango Purée", add: 5 },
  { id: "blueberry", name: "Wild Blueberry Compote", add: 4 },
  { id: "nuts", name: "Roasted Praline & Pecans", add: 6 },
  { id: "oreo", name: "Crushed Oreo Fudge", add: 4 },
];

const STYLES = [
  { id: "minimalist", name: "Modern Minimalist", desc: "Clean smooth finish with delicate gold leaf", add: 0 },
  { id: "floral", name: "Botanical Edible Florals", desc: "Crowned with organic dried petals & herbs", add: 8 },
  { id: "drip", name: "Signature Ganache Drip", desc: "Luxurious cascading chocolate or caramel drip", add: 6 },
  { id: "luxury", name: "Opulent Gold & Pearl", desc: "Edible 24k gold leaf and sugar pearls", add: 15 },
];

export default function CustomBuilder() {
  const { cartAdd, fmt, toast } = useStore();
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [size, setSize] = useState(SIZES[1]);
  const [base, setBase] = useState(BASES[0]);
  const [cream, setCream] = useState(CREAMS[0]);
  const [filling, setFilling] = useState(FILLINGS[0]);
  const [style, setStyle] = useState(STYLES[0]);
  const [msg, setMsg] = useState("Happy Birthday!");
  const [msgColor, setMsgColor] = useState("#e23e5f");
  const [imgUrl, setImgUrl] = useState("");

  const totalPrice = size.price + base.add + cream.add + filling.add + style.add;

  const handleAddToCart = () => {
    const customName = `Custom ${size.name} Cake (${base.name} + ${style.name})`;
    // We add as a custom item
    cartAdd("custom-cake", cream.name, size.name, 1);
    toast("success", "Custom masterpiece added to cart!");
    nav("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 uppercase">Bespoke Atelier</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase mt-2">Custom Cake Builder</h1>
        <p className="text-ink-300 text-sm mt-3">Design your dream celebration cake step by step. Handcrafted in our urban bakehouse.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_420px] gap-10 items-start">
        {/* Steps container */}
        <div className="bg-ink-900 border border-ink-800 p-8 clip-tile">
          {/* Step tabs header */}
          <div className="flex items-center justify-between border-b border-ink-800 pb-6 mb-8 overflow-x-auto gap-2">
            {[
              { n: 1, label: "Size" },
              { n: 2, label: "Base" },
              { n: 3, label: "Cream" },
              { n: 4, label: "Filling" },
              { n: 5, label: "Style" },
              { n: 6, label: "Message" },
            ].map((s) => (
              <button key={s.n} onClick={() => setStep(s.n)} className={`flex items-center gap-2 font-mono text-xs tracking-wider uppercase whitespace-nowrap px-3 py-2 transition-colors ${step === s.n ? "text-blaze-400 border-b-2 border-blaze-500" : "text-ink-400 hover:text-ink-100"}`}>
                <span className={`w-5 h-5 rounded-full grid place-items-center text-[10px] ${step === s.n ? "bg-blaze-500 text-ink-50" : "bg-ink-800 text-ink-300"}`}>{s.n}</span>
                {s.label}
              </button>
            ))}
          </div>

          {/* STEP 1: SIZE */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold uppercase">1. Select Cake Size</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {SIZES.map((s) => (
                  <button key={s.id} onClick={() => setSize(s)} className={`p-5 text-left border transition-all ${size.id === s.id ? "border-blaze-500 bg-blaze-500/10 shadow-glow" : "border-ink-700 bg-ink-850 hover:border-ink-500"}`}>
                    <div className="flex justify-between items-center"><span className="font-display font-bold text-lg">{s.name}</span><span className="font-mono text-blaze-400 font-bold">{fmt(s.price)}</span></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: BASE */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold uppercase">2. Select Cake Base Sponge</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {BASES.map((b) => (
                  <button key={b.id} onClick={() => setBase(b)} className={`p-5 text-left border transition-all ${base.id === b.id ? "border-blaze-500 bg-blaze-500/10 shadow-glow" : "border-ink-700 bg-ink-850 hover:border-ink-500"}`}>
                    <div className="flex justify-between items-center"><span className="font-display font-bold">{b.name}</span><span className="font-mono text-blaze-400">{b.add > 0 ? `+${fmt(b.add)}` : "Included"}</span></div>
                    <p className="text-xs text-ink-400 mt-2">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CREAM */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold uppercase">3. Select Cream & Frosting</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {CREAMS.map((c) => (
                  <button key={c.id} onClick={() => setCream(c)} className={`p-5 text-left border transition-all ${cream.id === c.id ? "border-blaze-500 bg-blaze-500/10 shadow-glow" : "border-ink-700 bg-ink-850 hover:border-ink-500"}`}>
                    <div className="flex justify-between items-center"><span className="font-display font-bold">{c.name}</span><span className="font-mono text-blaze-400">{c.add > 0 ? `+${fmt(c.add)}` : "Included"}</span></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: FILLING */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold uppercase">4. Select Filling & Fruits</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {FILLINGS.map((f) => (
                  <button key={f.id} onClick={() => setFilling(f)} className={`p-5 text-left border transition-all ${filling.id === f.id ? "border-blaze-500 bg-blaze-500/10 shadow-glow" : "border-ink-700 bg-ink-850 hover:border-ink-500"}`}>
                    <div className="flex justify-between items-center"><span className="font-display font-bold">{f.name}</span><span className="font-mono text-blaze-400">{f.add > 0 ? `+${fmt(f.add)}` : "Included"}</span></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: STYLE */}
          {step === 5 && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold uppercase">5. Decoration & Finish</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s)} className={`p-5 text-left border transition-all ${style.id === s.id ? "border-blaze-500 bg-blaze-500/10 shadow-glow" : "border-ink-700 bg-ink-850 hover:border-ink-500"}`}>
                    <div className="flex justify-between items-center"><span className="font-display font-bold">{s.name}</span><span className="font-mono text-blaze-400">{s.add > 0 ? `+${fmt(s.add)}` : "Included"}</span></div>
                    <p className="text-xs text-ink-400 mt-2">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: MESSAGE */}
          {step === 6 && (
            <div className="space-y-6">
              <h3 className="font-display text-2xl font-bold uppercase">6. Greeting Inscription & Reference</h3>
              <div>
                <label className="block font-mono text-xs uppercase text-ink-300 mb-2">Cake Plaque Message</label>
                <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={40} className="w-full bg-ink-950 border border-ink-700 px-4 py-3 text-ink-100 outline-none focus:border-blaze-500" placeholder="e.g. Happy 30th Birthday Alex!" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block font-mono text-xs uppercase text-ink-300 mb-2">Plaque Text Color</label>
                  <div className="flex gap-3">
                    {["#e23e5f", "#d69740", "#f1e0bd", "#ffffff", "#3f2417"].map((col) => (
                      <button key={col} onClick={() => setMsgColor(col)} className={`w-8 h-8 rounded-full border-2 ${msgColor === col ? "border-ink-50 scale-110" : "border-transparent"}`} style={{ backgroundColor: col }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase text-ink-300 mb-2">Reference Image URL (Optional)</label>
                  <input type="text" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://..." className="w-full bg-ink-950 border border-ink-700 px-4 py-3 text-sm text-ink-100 outline-none focus:border-blaze-500" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-ink-800">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="border border-ink-600 px-6 py-3 font-mono text-xs tracking-widest uppercase hover:border-ink-300 transition-colors">← Previous</button>
            ) : <div />}
            {step < 6 ? (
              <button onClick={() => setStep(step + 1)} className="bg-blaze-500 hover:bg-blaze-400 text-ink-50 px-8 py-3 font-mono text-xs tracking-widest uppercase transition-colors">Next Step →</button>
            ) : (
              <button onClick={handleAddToCart} className="bg-volt-500 hover:bg-volt-400 text-ink-950 font-bold px-8 py-3 font-mono text-xs tracking-widest uppercase transition-colors flex items-center gap-2">
                <Ic.bag className="w-4 h-4" /> Add to Cart — {fmt(totalPrice)}
              </button>
            )}
          </div>
        </div>

        {/* Live Summary Card */}
        <div className="bg-ink-900 border border-ink-800 p-6 clip-tile sticky top-28">
          <h3 className="font-display font-bold uppercase text-lg border-b border-ink-800 pb-4">Masterpiece Summary</h3>
          <div className="space-y-4 py-4 border-b border-ink-800 text-sm">
            <div className="flex justify-between"><span className="text-ink-400">Size</span><span className="font-semibold">{size.name}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Base Sponge</span><span className="font-semibold">{base.name}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Cream</span><span className="font-semibold">{cream.name}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Filling</span><span className="font-semibold">{filling.name}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Style</span><span className="font-semibold">{style.name}</span></div>
            {msg && (
              <div className="p-3 bg-ink-950 border border-ink-800 text-center">
                <p className="font-mono text-[10px] text-ink-500 uppercase">Plaque Message</p>
                <p className="font-display font-bold text-lg mt-1" style={{ color: msgColor }}>{msg}</p>
              </div>
            )}
          </div>
          <div className="pt-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] text-ink-400 uppercase tracking-widest">Total Investment</p>
              <p className="font-mono tabnum text-2xl font-black text-blaze-400 mt-0.5">{fmt(totalPrice)}</p>
            </div>
            <button onClick={handleAddToCart} className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.18em] uppercase px-6 py-3.5 transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
