import { useState } from "react";
import { useStore } from "../lib/store";
import { Ic } from "../components/ui";

const FAQS = [
  { q: "How far in advance should I order a custom wedding cake?", a: "We recommend booking at least 2 weeks in advance for bespoke wedding cakes to allow our artisans to source rare florals and custom molds." },
  { q: "Are your cakes eggless?", a: "Yes! We offer 100% eggless options across our entire layer cake and cookie collection without sacrificing texture or moisture." },
  { q: "What is your delivery radius and same-day cut-off?", a: "We deliver across the metropolitan area within 90 minutes. Same-day orders must be placed before 4 PM." },
  { q: "How should I store leftover cake?", a: "Keep refrigerated in an airtight cake dome for up to 48 hours. Bring to room temperature 30 minutes before serving for optimal frosting texture." },
];

export default function Contact() {
  const { toast } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) { toast("error", "Please fill in all contact fields."); return; }
    setSent(true);
    toast("success", "Message received! Our concierge will reply within 2 hours.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 space-y-20">
      <div className="text-center max-w-2xl mx-auto">
        <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 uppercase">Concierge & Support</p>
        <h1 className="font-display text-4xl sm:text-5xl font-black uppercase mt-2">Get in Touch</h1>
        <p className="text-ink-300 text-sm mt-3">Have questions about a custom order, allergen ingredients, or corporate gifting? We're here to help.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-ink-900 border border-ink-800 p-8 clip-tile">
          <h3 className="font-display text-2xl font-bold uppercase mb-6">Send a Message</h3>
          {sent ? (
            <div className="text-center py-12">
              <Ic.check className="w-12 h-12 text-volt-400 mx-auto mb-4" />
              <p className="font-display font-bold text-lg">Message Dispatched</p>
              <p className="text-sm text-ink-400 mt-2">Our concierge team has received your note and will reply shortly.</p>
              <button onClick={() => { setSent(false); setName(""); setEmail(""); setMsg(""); }} className="mt-6 border border-ink-600 px-6 py-2.5 font-mono text-xs uppercase tracking-wider">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase text-ink-300 mb-2">Your Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-ink-950 border border-ink-700 px-4 py-3 text-sm text-ink-100 outline-none focus:border-blaze-500" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-ink-300 mb-2">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-ink-950 border border-ink-700 px-4 py-3 text-sm text-ink-100 outline-none focus:border-blaze-500" placeholder="jane@example.com" />
              </div>
              <div>
                <label className="block font-mono text-xs uppercase text-ink-300 mb-2">Message or Inquiry</label>
                <textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} className="w-full bg-ink-950 border border-ink-700 px-4 py-3 text-sm text-ink-100 outline-none focus:border-blaze-500" placeholder="Tell us about your celebration or custom cake requirements..." />
              </div>
              <button type="submit" className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-sm tracking-[0.2em] uppercase py-4 transition-colors">
                Transmit Message
              </button>
            </form>
          )}
        </div>

        {/* Info & Hotline */}
        <div className="space-y-8">
          <div className="bg-ink-900 border border-ink-800 p-8 clip-tile space-y-6">
            <h3 className="font-display text-2xl font-bold uppercase">Bakehouse HQ</h3>
            <div className="space-y-4 text-sm text-ink-300">
              <div className="flex items-start gap-3"><Ic.map className="w-5 h-5 text-blaze-500 shrink-0 mt-0.5" /><span>42 Granary Street, Artisan District, Suite 104</span></div>
              <div className="flex items-start gap-3"><Ic.phone className="w-5 h-5 text-blaze-500 shrink-0 mt-0.5" /><span>+1 (800) CAKE-URBAN (Hotline 8am – 8pm)</span></div>
              <div className="flex items-start gap-3"><Ic.mail className="w-5 h-5 text-blaze-500 shrink-0 mt-0.5" /><span>concierge@cakeurban.com</span></div>
            </div>
          </div>

          <div className="bg-ink-900 border border-ink-800 p-8 clip-tile">
            <h3 className="font-display text-2xl font-bold uppercase mb-4">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <div key={i} className="border-b border-ink-800 pb-3">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left font-display font-semibold flex justify-between items-center py-2 hover:text-blaze-400 transition-colors">
                    <span>{f.q}</span>
                    <span className="font-mono text-blaze-500">{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && <p className="text-sm text-ink-400 mt-2 leading-relaxed">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
