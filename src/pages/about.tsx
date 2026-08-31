import { Ic } from "../components/ui";

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 space-y-20">
      {/* Hero */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 uppercase">Urban Bakehouse Manifesto</p>
          <h1 className="font-display text-4xl sm:text-6xl font-black uppercase mt-3 leading-tight">Baked before the frosting sets.</h1>
          <p className="text-ink-300 text-base mt-6 leading-relaxed">
            Founded in 2021, CakeUrban was born out of a simple frustration: industrial bakeries relying on frozen sponge and artificial palm oil shortening. We set out to build an artisan urban bakehouse where 72% Belgian chocolate meets slow-set organic raspberry coulis, baked fresh every morning at 6 AM.
          </p>
        </div>
        <div className="relative aspect-video lg:aspect-square bg-ink-900 border border-ink-800 clip-tile overflow-hidden">
          <img src="https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png" alt="CakeUrban Kitchen" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Strengths */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Ic.cake, title: "100% Handcrafted", desc: "No mass production lines. Every sponge is folded by hand and frosted to order." },
          { icon: Ic.sparkle, title: "Pure Ingredients", desc: "Valrhona cocoa, Isigny Sainte-Mère butter, and organic Bourbon vanilla beans." },
          { icon: Ic.truck, title: "Same-Day Delivery", desc: "Temperature-controlled urban couriers ensure cakes arrive in pristine condition." },
          { icon: Ic.shield, title: "Zero Preservatives", desc: "Clean baking with zero chemical emulsifiers or artificial hydrogenated oils." },
        ].map((s) => (
          <div key={s.title} className="bg-ink-900 border border-ink-800 p-8 clip-tile">
            <s.icon className="w-8 h-8 text-blaze-500 mb-4" />
            <h3 className="font-display font-bold text-lg">{s.title}</h3>
            <p className="text-ink-400 text-sm mt-2 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Head Chefs */}
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 uppercase text-center">Master Artisans</p>
        <h2 className="font-display text-3xl font-black uppercase text-center mt-2 mb-10">The Hands Behind the Whisks</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Elena Rostova", role: "Executive Pastry Chef", exp: "14 yrs at Parisian 3-star patisseries", img: "https://image.qwenlm.ai/generated-images/3375943d-96a8-43e8-9ab9-dbf92467ce64/_result.png" },
            { name: "Marcus Vance", role: "Head of Chocolate Atelier", exp: "Valrhona Masterclass Alum", img: "https://image.qwenlm.ai/generated-images/31255ff8-a239-432f-8d31-296fe494f4c1/_result.png" },
            { name: "Siddharth Roy", role: "Custom Cake Sculptor", exp: "Architectural sugar & floral artist", img: "https://image.qwenlm.ai/generated-images/19868aa6-1a8b-4213-bf76-a00a5c538bec/_result.png" },
          ].map((c) => (
            <div key={c.name} className="bg-ink-900 border border-ink-800 clip-tile overflow-hidden">
              <div className="h-72 overflow-hidden"><img src={c.img} alt={c.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
              <div className="p-6">
                <p className="font-display font-bold text-xl">{c.name}</p>
                <p className="font-mono text-xs text-blaze-400 uppercase tracking-widest mt-1">{c.role}</p>
                <p className="text-sm text-ink-400 mt-2">{c.exp}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
