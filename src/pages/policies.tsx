import { useParams } from "react-router-dom";

export default function PolicyPage() {
  const { type } = useParams();

  const titles: Record<string, string> = {
    shipping: "Shipping & Delivery Policy",
    refund: "Return & Refund Policy",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
  };

  const currentTitle = titles[type || "shipping"] || "Store Policy";

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-8">
      <div>
        <p className="font-mono text-[11px] tracking-[0.3em] text-blaze-500 uppercase">Legal & Compliance</p>
        <h1 className="font-display text-4xl font-black uppercase mt-2">{currentTitle}</h1>
        <p className="font-mono text-xs text-ink-500 mt-2">Last updated: August 2026 · CakeUrban Artisanal Systems</p>
      </div>

      <div className="bg-ink-900 border border-ink-800 p-8 sm:p-12 clip-tile space-y-6 text-sm text-ink-300 leading-relaxed">
        <h3 className="font-display text-xl font-bold text-ink-50 uppercase">1. Overview & Commitment</h3>
        <p>
          At CakeUrban, every masterpiece is baked fresh to order using premium organic ingredients. Because our products are perishable food items, we maintain strict quality control standards from our temperature-controlled bakehouse directly to your doorstep.
        </p>

        <h3 className="font-display text-xl font-bold text-ink-50 uppercase">2. Delivery Protocols & Timing</h3>
        <p>
          Our urban couriers use climate-controlled refrigerated vans to guarantee that frostings and ganaches remain intact. Same-day delivery orders must be submitted before 4 PM local time. Customers must ensure someone is available at the delivery address during the selected 2-hour time slot.
        </p>

        <h3 className="font-display text-xl font-bold text-ink-50 uppercase">3. Refunds & Quality Guarantee</h3>
        <p>
          If your cake arrives damaged or fails to meet our uncompromising quality standards, please photograph the item immediately upon receipt and notify our concierge within 2 hours. Verified claims are eligible for a full refund or replacement bake.
        </p>

        <h3 className="font-display text-xl font-bold text-ink-50 uppercase">4. Data Privacy & GDPR Compliance</h3>
        <p>
          We respect your personal privacy. Customer data, delivery addresses, and order histories are encrypted and stored securely in compliance with global data protection regulations. We never sell or share your information with third-party advertisers.
        </p>
      </div>
    </div>
  );
}
