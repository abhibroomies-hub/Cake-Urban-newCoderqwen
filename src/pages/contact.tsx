import { useState } from "react";
import { useStore } from "../lib/store";
import { Ic } from "../components/ui";

const FAQS = [
  {
    q: "How fast is express delivery across Delhi NCR?",
    a: "We deliver within 30–45 minutes across Faridabad, Gurgaon, Noida, South Delhi, and Ghaziabad in chilled 4°C boxes.",
  },
  {
    q: "Are all cakes, cookies, and hampers 100% eggless?",
    a: "Yes! Every item at CakeUrban is 100% pure vegetarian and eggless, baked with pure butter and Belgian chocolate.",
  },
  {
    q: "Do you offer 12 AM midnight birthday & anniversary delivery?",
    a: "Yes, select our Midnight Surprise slot (11:30 PM – 12:15 AM) at checkout or message us on WhatsApp (+91 7318531953).",
  },
  {
    q: "Can I order custom corporate hampers in bulk?",
    a: "Yes! We offer custom company logo sleeves and bulk dispatch across India. Connect via WhatsApp for corporate catalogs.",
  },
];

export default function Contact() {
  const { toast } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      toast("error", "Please fill in all contact fields.");
      return;
    }
    setSent(true);
    toast("success", "Message received! Our concierge will reply shortly.");
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-10 py-6 sm:py-12 space-y-8 sm:space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-500 uppercase font-bold">
          24×7 Concierge · Delhi NCR
        </p>
        <h1 className="font-display text-2xl sm:text-5xl font-black uppercase mt-1.5">Get in Touch</h1>
        <p className="text-ink-300 text-xs sm:text-sm mt-2">
          Need a 30-min express cake, custom photo cake, or bulk corporate hamper quote?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Info & WhatsApp Direct Hotline (First on Mobile for instant action) */}
        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="bg-ink-900 border border-ink-800 p-5 sm:p-7 clip-tile space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg sm:text-2xl font-bold uppercase">Central Bakehouse HQ</h3>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                ● Open 24×7
              </span>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-ink-300">
              <div className="flex items-start gap-2.5">
                <Ic.map className="w-4 h-4 text-blaze-500 shrink-0 mt-0.5" />
                <span>Sector 15 Central Kitchen Hub, Faridabad, Haryana (Delhi NCR) — PIN 121007</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Ic.phone className="w-4 h-4 text-blaze-500 shrink-0 mt-0.5" />
                <a href="tel:+917318531953" className="hover:text-blaze-400 font-mono font-bold text-ink-100">
                  +91 7318531953 (Express & Midnight Hotline)
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Ic.mail className="w-4 h-4 text-blaze-500 shrink-0 mt-0.5" />
                <span>hello@cakeurban.com</span>
              </div>
            </div>

            <a
              href="https://wa.me/917318531953?text=Hi%20CakeUrban!%20I%20have%20a%20query%20regarding%20an%20order."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-ink-950 font-mono text-xs uppercase tracking-wider font-bold clip-btn flex items-center justify-center gap-2 transition-colors"
            >
              <Ic.whatsapp className="w-4 h-4 fill-current" /> Chat Instantly on WhatsApp
            </a>
          </div>

          <div className="bg-ink-900 border border-ink-800 p-5 sm:p-7 clip-tile">
            <h3 className="font-display text-lg sm:text-xl font-bold uppercase mb-3">Quick FAQs</h3>
            <div className="divide-y divide-ink-800">
              {FAQS.map((f, i) => (
                <div key={i} className="py-2.5">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left font-display font-semibold text-xs sm:text-sm flex justify-between items-center gap-2 hover:text-blaze-400 transition-colors"
                  >
                    <span>{f.q}</span>
                    <span className="font-mono text-blaze-500 shrink-0">{openFaq === i ? "−" : "+"}</span>
                  </button>
                  {openFaq === i && <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-ink-900 border border-ink-800 p-5 sm:p-7 clip-tile">
          <h3 className="font-display text-lg sm:text-2xl font-bold uppercase mb-4">Send a Message</h3>
          {sent ? (
            <div className="text-center py-10">
              <Ic.check className="w-10 h-10 text-volt-400 mx-auto mb-3" />
              <p className="font-display font-bold text-base sm:text-lg">Message Dispatched</p>
              <p className="text-xs sm:text-sm text-ink-400 mt-1">Our concierge team will reply shortly.</p>
              <button
                onClick={() => {
                  setSent(false);
                  setName("");
                  setEmail("");
                  setMsg("");
                }}
                className="mt-5 border border-ink-600 px-5 py-2 font-mono text-xs uppercase tracking-wider"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-700 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-blaze-500"
                  placeholder="Ananya Sharma"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-300 mb-1">Email or Phone</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-700 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-blaze-500"
                  placeholder="+91 9876543210 or email"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-300 mb-1">Message or Custom Inquiry</label>
                <textarea
                  rows={4}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full bg-ink-950 border border-ink-700 px-3.5 py-2.5 text-sm text-ink-100 outline-none focus:border-blaze-500"
                  placeholder="Tell us about your celebration, custom cake, or corporate gift hamper..."
                />
              </div>
              <button
                type="submit"
                className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs tracking-[0.2em] uppercase py-3.5 font-bold transition-colors"
              >
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
