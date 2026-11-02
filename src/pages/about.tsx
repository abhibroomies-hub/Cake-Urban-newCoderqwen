import { Link } from "react-router-dom";
import { Ic } from "../components/ui";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-14 space-y-8 sm:space-y-14">
      {/* Compact Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-center">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
            CakeUrban Bakehouse · Est. 2021 · Delhi NCR
          </p>
          <h1 className="font-display text-2xl sm:text-5xl font-black uppercase mt-2 leading-tight">
            100% Pure Eggless. <span className="text-blaze-500">Baked Fresh Daily.</span>
          </h1>
          <p className="text-ink-300 text-xs sm:text-base mt-3 leading-relaxed">
            Zero frozen sponges, zero palm oil. We craft 72% Belgian chocolate cakes, 72-hour cold-fermented cookies, and luxury gift hampers across Faridabad, Gurgaon, Noida, Delhi & Ghaziabad.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-5">
            <Link
              to="/shop"
              className="px-5 py-2.5 sm:py-3 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase tracking-wider clip-btn font-bold"
            >
              Explore Menu →
            </Link>
            <Link
              to="/delivery-locations"
              className="px-4 py-2.5 sm:py-3 bg-ink-900 border border-ink-700 text-ink-200 font-mono text-xs uppercase tracking-wider clip-btn"
            >
              5 NCR Kitchen Hubs
            </Link>
          </div>
        </div>
        <div className="relative h-52 sm:h-80 bg-ink-900 border border-ink-800 clip-tile overflow-hidden">
          <img
            src="https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png"
            alt="CakeUrban Delhi NCR Kitchen"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 2x2 Mobile Grid of Strengths */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {[
          { icon: Ic.cake, title: "100% Eggless", desc: "Dedicated vegetarian ovens & pure butter." },
          { icon: Ic.sparkle, title: "54% Couverture", desc: "Authentic Belgian dark chocolate & nuts." },
          { icon: Ic.truck, title: "30–45 Min Express", desc: "Chilled 4°C cold-box rider dispatch." },
          { icon: Ic.shield, title: "Baked to Order", desc: "Zero preservatives or frozen inventory." },
        ].map((s) => (
          <div key={s.title} className="bg-ink-900 border border-ink-800 p-4 sm:p-6 clip-tile">
            <s.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blaze-500 mb-2.5" />
            <h3 className="font-display font-bold text-sm sm:text-lg">{s.title}</h3>
            <p className="text-ink-400 text-xs mt-1 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
