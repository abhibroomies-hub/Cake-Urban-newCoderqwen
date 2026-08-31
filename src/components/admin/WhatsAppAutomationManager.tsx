import React, { useState } from "react";
import { useStore } from "../../lib/store";
import { Ic } from "../ui";

interface WhatsAppTemplate {
  id: string;
  name: string;
  category: "order_update" | "abandoned_cart" | "birthday_reminder" | "review_request" | "vip_promo";
  title: string;
  description: string;
  content: string;
  enabled: boolean;
}

const DEFAULT_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: "tmpl-order-confirm",
    name: "Order Confirmation & Baking Update",
    category: "order_update",
    title: "🎂 Live Baking Notification",
    description: "Sent immediately when customer places an order.",
    content: `Hello {{customer_name}}! 🎂\n\nYour artisan celebration cake order *#{{order_id}}* has been received at CakeUrban Bakehouse ({{hub_city}} Hub).\n\n👨‍🍳 Our pastry chef has started whipping your 100% pure eggless cake with fresh Belgian chocolate.\n\n📍 *Delivery Address:* {{delivery_address}}\n⏰ *Estimated Arrival:* 35-45 Minutes\n\nTrack your live delivery status here:\n{{tracking_url}}\n\nNeed to add a birthday name or sparklers? Reply to this message directly!`,
    enabled: true,
  },
  {
    id: "tmpl-rider-out",
    name: "Out For Delivery with Live Rider",
    category: "order_update",
    title: "🛵 Rider On The Way",
    description: "Sent when rider picks up cake in temperature-insulated cold box.",
    content: `Exciting news, {{customer_name}}! 🛵\n\nYour celebration cake is *Out For Delivery* from our {{hub_city}} hub!\n\n👤 *Delivery Partner:* {{rider_name}}\n📞 *Rider Contact:* {{rider_phone}}\n\nCake is secured in an insulated thermal box to keep frosting chilled and pristine.\n\nGet ready to cut the cake! 🎉`,
    enabled: true,
  },
  {
    id: "tmpl-cart-recovery",
    name: "Abandoned Cart 15% Recovery",
    category: "abandoned_cart",
    title: "🛒 Leftover Cake in Cart",
    description: "Automatically sent 2 hours after customer leaves without finishing checkout.",
    content: `Hi {{customer_name}}! 👋 We noticed you left the delicious *{{cake_name}}* in your cart.\n\nGood news: Fresh sponge layers are ready in the oven! Use special VIP code *URBAN15* to get *15% OFF + Free Midnight Delivery*.\n\n👉 Complete your order in 1-click:\n{{cart_url}}\n\nOffer valid for the next 2 hours only! ⏳`,
    enabled: true,
  },
  {
    id: "tmpl-birthday-reminder",
    name: "5-Day Advance Birthday / Anniversary",
    category: "birthday_reminder",
    title: "🎁 Upcoming Celebration Reminder",
    description: "Sent 5 days before past anniversary/birthday records.",
    content: `Hey {{customer_name}}! 🎂✨\n\nA special celebration is coming up in 5 days! Don't wait until the last minute.\n\nPre-book your custom photo cake or signature truffle cake today and get a *Complimentary Luxury Sparkler Candle + Cake Topper Set* with code *CELEBRATE*.\n\n👉 Browse fresh drops:\nhttps://cakeurban.com/shop\n\nGuaranteed 30-min express slot reserved for you!`,
    enabled: true,
  },
  {
    id: "tmpl-review-request",
    name: "Post-Celebration Photo & Review",
    category: "review_request",
    title: "⭐ Review & Win ₹250 Voucher",
    description: "Sent 3 hours after cake delivery.",
    content: `Hope the celebration was unforgettable, {{customer_name}}! 🎉🍰\n\nHow did everyone like the *{{cake_name}}*?\n\nShare a quick 5-star review or photo with the cake, and we'll credit *₹250 Urban Cash* straight to your wallet for your next party!\n\n⭐ Leave a quick review:\nhttps://cakeurban.com/review?id={{order_id}}`,
    enabled: true,
  },
];

export function WhatsAppAutomationManager() {
  const { toast } = useStore();
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>(DEFAULT_TEMPLATES[0]);
  const [testPhone, setTestPhone] = useState("+91 7318531953");
  const [testName, setTestName] = useState("Pooja Sharma");
  const [testCake, setTestCake] = useState("Belgian Truffle Signature Cake");

  const formattedPreview = selectedTemplate.content
    .replace(/\{\{customer_name\}\}/g, testName)
    .replace(/\{\{order_id\}\}/g, "CU-98124")
    .replace(/\{\{hub_city\}\}/g, "Faridabad")
    .replace(/\{\{delivery_address\}\}/g, "Sector 15, Near Crown Plaza")
    .replace(/\{\{tracking_url\}\}/g, "https://cakeurban.com/track/CU-98124")
    .replace(/\{\{rider_name\}\}/g, "Rahul Sharma")
    .replace(/\{\{rider_phone\}\}/g, "+91 9811223344")
    .replace(/\{\{cake_name\}\}/g, testCake)
    .replace(/\{\{cart_url\}\}/g, "https://cakeurban.com/cart?recover=1");

  const toggleTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
    toast("success", "Template status updated");
  };

  const handleSendTest = () => {
    const cleanPhone = testPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      toast("error", "Please enter a valid phone number");
      return;
    }
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(formattedPreview)}`;
    window.open(url, "_blank");
    toast("success", `Opening WhatsApp test for ${testPhone}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase text-ink-50">
              WhatsApp Marketing & Automation Engine
            </h2>
          </div>
          <p className="text-xs font-mono text-ink-400 mt-1">
            Automate order milestones, abandoned cart recovery, and advance birthday reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-mono text-xs">
            ● WhatsApp Business API Ready
          </span>
        </div>
      </div>

      {/* Main 2-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Template Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-mono text-xs tracking-wider uppercase text-ink-400 mb-2">
            Automated Trigger Templates ({templates.length})
          </h3>

          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => setSelectedTemplate(tmpl)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedTemplate.id === tmpl.id
                  ? "bg-ink-850 border-emerald-500 shadow-md shadow-emerald-500/10"
                  : "bg-ink-900 border-ink-700/70 hover:border-ink-600"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-display text-sm font-bold text-ink-100">{tmpl.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTemplate(tmpl.id);
                  }}
                  className={`px-2 py-0.5 text-[9px] font-mono uppercase rounded ${
                    tmpl.enabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-ink-800 text-ink-400"
                  }`}
                >
                  {tmpl.enabled ? "Active" : "Paused"}
                </button>
              </div>
              <p className="text-xs text-ink-400">{tmpl.description}</p>
            </div>
          ))}
        </div>

        {/* Right: Live Interactive WhatsApp Preview & Editor */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-ink-850 border border-ink-700/60 p-4 sm:p-5 clip-tile space-y-4">
            <div className="flex items-center justify-between border-b border-ink-800 pb-3">
              <div>
                <h3 className="font-display text-base font-bold uppercase text-ink-50">
                  {selectedTemplate.title}
                </h3>
                <p className="text-xs font-mono text-ink-400">Template ID: {selectedTemplate.id}</p>
              </div>

              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Ic.check className="w-4 h-4" /> Real-time preview
              </span>
            </div>

            {/* Template Edit Area */}
            <div>
              <label className="block text-xs font-mono uppercase text-ink-400 mb-1">
                Template Message Content (Supports markdown & variables)
              </label>
              <textarea
                rows={6}
                value={selectedTemplate.content}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTemplate({ ...selectedTemplate, content: val });
                  setTemplates((prev) =>
                    prev.map((t) => (t.id === selectedTemplate.id ? { ...t, content: val } : t))
                  );
                }}
                className="w-full bg-ink-950 border border-ink-700 rounded p-3 text-xs font-mono text-ink-100 focus:border-emerald-500 outline-none leading-relaxed"
              />
              <p className="text-[10px] font-mono text-ink-500 mt-1">
                Available placeholders: <code className="text-emerald-400">{"{{customer_name}}"}</code>, <code className="text-emerald-400">{"{{order_id}}"}</code>, <code className="text-emerald-400">{"{{hub_city}}"}</code>, <code className="text-emerald-400">{"{{cake_name}}"}</code>, <code className="text-emerald-400">{"{{rider_name}}"}</code>
              </p>
            </div>

            {/* Simulated WhatsApp Chat Bubble */}
            <div className="bg-[#0b141a] p-4 rounded-lg border border-emerald-950/60 space-y-2">
              <div className="flex items-center gap-2 border-b border-emerald-950 pb-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-emerald-400 font-bold">CakeUrban Verified Business</span>
              </div>

              <div className="bg-[#005c4b] text-white p-3.5 rounded-lg text-xs leading-relaxed whitespace-pre-wrap font-sans max-w-md shadow">
                {formattedPreview}
                <div className="text-right text-[9px] text-emerald-200 mt-1">11:45 AM ✓✓</div>
              </div>
            </div>

            {/* Test Send Dispatcher */}
            <div className="pt-2 border-t border-ink-800 space-y-3">
              <p className="text-xs font-mono uppercase text-ink-400 font-bold">Test Send Message via WhatsApp Web/App:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Customer Name"
                  className="bg-ink-900 border border-ink-700 rounded p-2 text-xs text-ink-100"
                />
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+91 9811223344"
                  className="bg-ink-900 border border-ink-700 rounded p-2 text-xs text-ink-100"
                />
                <button
                  onClick={handleSendTest}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>💬 Test Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
