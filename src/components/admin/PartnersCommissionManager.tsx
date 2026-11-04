import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../../lib/store";
import type { VendorPartner, PartnerOrderStatus } from "../../data/catalog";
import { Ic, Modal } from "../ui";

const NCR_CITIES = ["Faridabad", "Gurgaon", "Noida", "Delhi", "Ghaziabad"];

export function getDaysRemaining(expiresAt: string): number {
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp.setHours(23, 59, 59, 999) - now.getTime();
  return Math.ceil(diffMs / 86400000);
}

export function isPartnerExpired(partner: VendorPartner): boolean {
  return getDaysRemaining(partner.expiresAt) < 0 || partner.status === "expired" || partner.status === "suspended";
}

export function PartnersCommissionManager() {
  const store = useStore();
  const {
    partners,
    allProducts,
    orders,
    fmt,
    addPartner,
    updatePartner,
    deletePartner,
    renewPartner,
    expirePartnerNow,
    approvePartnerProduct,
    assignOrderToPartner,
    updatePartnerOrderStatus,
    toast,
  } = store;

  const [subTab, setSubTab] = useState<"partners" | "approvals" | "routing">("partners");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<VendorPartner | null>(null);
  const [historyPartner, setHistoryPartner] = useState<VendorPartner | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Form state for adding/editing partner
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [cityHub, setCityHub] = useState("Faridabad");
  const [address, setAddress] = useState("");
  const [commissionRate, setCommissionRate] = useState(30);
  const [validityDays, setValidityDays] = useState(30);
  const [customExpiry, setCustomExpiry] = useState("");

  const partnerProducts = useMemo(
    () => allProducts.filter((p) => Boolean(p.partnerId)),
    [allProducts]
  );

  const pendingProducts = useMemo(
    () => partnerProducts.filter((p) => p.approvalStatus === "pending"),
    [partnerProducts]
  );

  const filteredPartnerProducts = useMemo(() => {
    if (approvalFilter === "all") return partnerProducts;
    return partnerProducts.filter((p) => (p.approvalStatus || "approved") === approvalFilter);
  }, [partnerProducts, approvalFilter]);

  const routedOrders = useMemo(
    () => orders.filter((o) => Boolean(o.assignedPartnerId)),
    [orders]
  );

  const totalPartnerGmv = useMemo(
    () => routedOrders.reduce((s, o) => s + o.total, 0),
    [routedOrders]
  );

  const totalAdminCommission = useMemo(
    () =>
      routedOrders.reduce(
        (s, o) => s + (o.adminCommissionAmount ?? (o.total * (o.adminCommissionRate || 30)) / 100),
        0
      ),
    [routedOrders]
  );

  const totalPartnerPayout = useMemo(
    () =>
      routedOrders.reduce(
        (s, o) => s + (o.partnerPayoutAmount ?? (o.total * (100 - (o.adminCommissionRate || 30))) / 100),
        0
      ),
    [routedOrders]
  );

  const activePartnersCount = useMemo(
    () => partners.filter((p) => !isPartnerExpired(p)).length,
    [partners]
  );

  const openCreateModal = () => {
    setEditingPartner(null);
    setShopName("");
    setOwnerName("");
    setEmail("");
    setPhone("+91 98");
    setCityHub("Faridabad");
    setAddress("");
    setCommissionRate(30);
    setValidityDays(30);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setCustomExpiry(d.toISOString().slice(0, 10));
    setModalOpen(true);
  };

  const openEditModal = (p: VendorPartner) => {
    setEditingPartner(p);
    setShopName(p.shopName);
    setOwnerName(p.ownerName);
    setEmail(p.email);
    setPhone(p.phone);
    setCityHub(p.cityHub);
    setAddress(p.address);
    setCommissionRate(p.commissionRate);
    setCustomExpiry(p.expiresAt);
    setModalOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!shopName.trim() || !cleanEmail.includes("@")) {
      toast("error", "Please enter Shop Name and a valid Gmail address");
      return;
    }

    if (editingPartner) {
      const daysLeft = getDaysRemaining(customExpiry);
      updatePartner({
        ...editingPartner,
        shopName: shopName.trim(),
        ownerName: ownerName.trim() || "Store Partner",
        email: cleanEmail,
        phone: phone.trim(),
        cityHub,
        address: address.trim(),
        commissionRate: Math.min(90, Math.max(1, Number(commissionRate) || 30)),
        expiresAt: customExpiry,
        status: daysLeft >= 0 ? "active" : "expired",
      });
      setModalOpen(false);
      return;
    }

    const nums = partners.map((p) => {
      const m = p.id.match(/CUP-(\d+)/);
      return m ? parseInt(m[1], 10) : 1000;
    });
    const nextNum = (nums.length ? Math.max(...nums) : 1000) + 1;
    const newId = `CUP-${nextNum}`;
    const today = new Date().toISOString().slice(0, 10);

    const newPartner: VendorPartner = {
      id: newId,
      shopName: shopName.trim(),
      ownerName: ownerName.trim() || "Store Partner",
      email: cleanEmail,
      phone: phone.trim(),
      cityHub,
      address: address.trim() || `${cityHub} Main Market`,
      commissionRate: Math.min(90, Math.max(1, Number(commissionRate) || 30)),
      createdAt: today,
      expiresAt: customExpiry,
      status: getDaysRemaining(customExpiry) >= 0 ? "active" : "expired",
      renewalRequested: false,
      renewalHistory: [
        {
          renewedAt: today,
          previousExpiry: today,
          newExpiry: customExpiry,
          daysAdded: validityDays,
          note: `Granted Gmail Partner Access (${commissionRate}% Commission)`,
        },
      ],
    };
    addPartner(newPartner);
    setModalOpen(false);
  };

  const sendWhatsAppPartnerAccess = (p: VendorPartner) => {
    const cleanPhone = p.phone.replace(/\D/g, "");
    const targetPhone = cleanPhone.length >= 10 ? cleanPhone : "917318531953";
    const portalUrl = `${window.location.origin}/partner?partnerId=${p.id}`;
    const text = `Namaste ${p.ownerName}! 🎉\nYour *CakeUrban Partner Store ID* is now active:\n\n🆔 *Partner ID:* ${p.id}\n🏪 *Store:* ${p.shopName} (${p.cityHub})\n📧 *Authorized Gmail:* ${p.email}\n💰 *Payout Split:* 70% Partner / ${p.commissionRate}% CakeUrban Platform Fee\n📅 *Valid Until:* ${p.expiresAt}\n\n🔗 *Open Partner Dashboard:* ${portalUrl}\nLog in with your Gmail (${p.email}) to upload your menu, cake photos, and receive direct delivery orders!`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const sendWhatsAppOrderToPartner = (orderId: string) => {
    const o = orders.find((x) => x.id === orderId);
    if (!o || !o.assignedPartnerId) return;
    const p = partners.find((x) => x.id === o.assignedPartnerId);
    if (!p) return;
    const cleanPhone = p.phone.replace(/\D/g, "");
    const targetPhone = cleanPhone.length >= 10 ? cleanPhone : "917318531953";
    const itemsList = o.items.map((it) => `• ${it.qty}x ${it.name} (${it.size})`).join("\n");
    const comm = o.adminCommissionAmount ?? (o.total * p.commissionRate) / 100;
    const payout = o.partnerPayoutAmount ?? o.total - comm;
    const text = `🚨 *NEW CAKEURBAN PARTNER ORDER — ${o.id}*\n🏪 *Partner Store:* ${p.shopName} (${p.id})\n\n📦 *Items to Prepare & Dispatch:*\n${itemsList}\n\n📍 *Customer Delivery Address:* ${o.address}\n⏰ *Slot:* ${o.deliverySlot || o.method}\n✍️ *Cake Message:* ${o.plaqueMessage || "None"}\n📞 *Customer Phone:* ${o.customerPhone || "N/A"}\n\n💵 *Order Total:* ${fmt(o.total)}\n🏛 *CakeUrban Fee (${p.commissionRate}%):* ${fmt(comm)}\n✅ *Your Net 70% Payout:* ${fmt(payout)}\n\nUpdate live preparation status in your Partner Portal: ${window.location.origin}/partner?partnerId=${p.id}`;
    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const filteredPartners = partners.filter((p) =>
    `${p.id} ${p.shopName} ${p.email} ${p.cityHub} ${p.ownerName}`
      .toLowerCase()
      .includes(searchQ.toLowerCase())
  );

  return (
    <div className="space-y-6 anim-fade-up">
      {/* Top Banner + KPIs */}
      <div className="border border-gold-400/40 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 p-5 clip-tile">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-gold-400/20 text-gold-400 border border-gold-400/40 font-mono text-[10px] font-bold uppercase tracking-widest">
                VENDOR NETWORK & 30% COMMISSION ENGINE
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 font-mono text-[10px] uppercase">
                ● Live Gmail Access Control
              </span>
            </div>
            <h2 className="font-display text-2xl font-black uppercase mt-2 text-ink-50">
              Partner Stores, ID Expiry & 30% Order Commission
            </h2>
            <p className="text-xs text-ink-300 mt-1 max-w-3xl">
              Grant Gmail access to bakery vendors, manage Partner ID expiry & renewals, approve vendor-uploaded products before they go live, and route orders directly to partner stores while earning 30% commission on every order.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/partner"
              className="px-4 py-2.5 border border-cobalt-400/60 bg-cobalt-500/15 hover:bg-cobalt-500 hover:text-ink-50 text-cobalt-300 font-mono text-[11px] uppercase tracking-wider font-bold transition-colors flex items-center gap-2"
            >
              <span>Open Partner Portal (/partner)</span>
              <span>→</span>
            </Link>
            <button
              onClick={openCreateModal}
              className="clip-btn bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[11px] tracking-[0.15em] uppercase px-4 py-2.5 font-bold transition-colors flex items-center gap-2 shadow-lg"
            >
              <Ic.plus className="w-3.5 h-3.5" /> + Grant Gmail Partner Access
            </button>
          </div>
        </div>

        {/* 4 Financial & Network KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t border-ink-800">
          <div className="bg-ink-950/90 border border-ink-800 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              Active Partner Stores
            </p>
            <p className="font-display text-2xl font-black tabnum mt-1 text-ink-50">
              {activePartnersCount}{" "}
              <span className="text-xs font-mono font-normal text-ink-400">
                / {partners.length} total
              </span>
            </p>
            <p className="font-mono text-[10px] text-emerald-400 mt-1">
              {partners.filter((p) => p.renewalRequested).length} renewal requests pending
            </p>
          </div>

          <div className="bg-ink-950/90 border border-gold-400/40 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-gold-400 font-bold">
              Your 30% Admin Commission
            </p>
            <p className="font-display text-2xl font-black tabnum mt-1 text-gold-400">
              {fmt(totalAdminCommission)}
            </p>
            <p className="font-mono text-[10px] text-ink-400 mt-1">
              Earned across {routedOrders.length} partner-routed orders
            </p>
          </div>

          <div className="bg-ink-950/90 border border-ink-800 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              Partner 70% Net Payouts
            </p>
            <p className="font-display text-2xl font-black tabnum mt-1 text-volt-400">
              {fmt(totalPartnerPayout)}
            </p>
            <p className="font-mono text-[10px] text-ink-400 mt-1">
              From {fmt(totalPartnerGmv)} gross partner GMV
            </p>
          </div>

          <div className="bg-ink-950/90 border border-ink-800 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              Partner Menu Approvals
            </p>
            <p className="font-display text-2xl font-black tabnum mt-1 text-blaze-400">
              {pendingProducts.length}{" "}
              <span className="text-xs font-mono font-normal text-ink-400">pending</span>
            </p>
            <p className="font-mono text-[10px] text-ink-400 mt-1">
              {partnerProducts.filter((p) => p.approvalStatus === "approved").length} live on storefront
            </p>
          </div>
        </div>
      </div>

      {/* Sub-navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubTab("partners")}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors rounded ${
              subTab === "partners"
                ? "bg-blaze-500 text-ink-50 font-bold"
                : "bg-ink-850 border border-ink-700 text-ink-300 hover:text-ink-50"
            }`}
          >
            1. Partner IDs, Gmail Access & Expiry ({partners.length})
          </button>
          <button
            onClick={() => setSubTab("approvals")}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors rounded flex items-center gap-2 ${
              subTab === "approvals"
                ? "bg-blaze-500 text-ink-50 font-bold"
                : "bg-ink-850 border border-ink-700 text-ink-300 hover:text-ink-50"
            }`}
          >
            <span>2. Partner Product Approval Queue</span>
            {pendingProducts.length > 0 && (
              <span className="px-1.5 py-0.5 bg-gold-400 text-ink-950 font-bold text-[10px] rounded-full">
                {pendingProducts.length} NEW
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab("routing")}
            className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors rounded ${
              subTab === "routing"
                ? "bg-blaze-500 text-ink-50 font-bold"
                : "bg-ink-850 border border-ink-700 text-ink-300 hover:text-ink-50"
            }`}
          >
            3. Direct Order Routing & 30% Commission Ledger ({orders.length})
          </button>
        </div>

        {subTab === "partners" && (
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search Partner ID, Gmail, City…"
            className="bg-ink-950 border border-ink-700 focus:border-blaze-500 outline-none px-3 py-2 font-mono text-xs w-64"
          />
        )}
      </div>

      {/* SUBTAB 1: PARTNERS & EXPIRY / RENEWAL */}
      {subTab === "partners" && (
        <div className="grid xl:grid-cols-2 gap-4">
          {filteredPartners.map((p) => {
            const daysLeft = getDaysRemaining(p.expiresAt);
            const expired = isPartnerExpired(p);
            const expiringSoon = !expired && daysLeft <= 7;
            const pOrders = orders.filter((o) => o.assignedPartnerId === p.id);
            const pGmv = pOrders.reduce((s, o) => s + o.total, 0);
            const pAdminCut = pOrders.reduce(
              (s, o) => s + (o.adminCommissionAmount ?? (o.total * p.commissionRate) / 100),
              0
            );
            const pProductsCount = partnerProducts.filter((x) => x.partnerId === p.id).length;

            return (
              <div
                key={p.id}
                className={`border bg-ink-850 p-5 clip-tile flex flex-col justify-between transition-all ${
                  expired
                    ? "border-danger-500/60 bg-danger-500/5"
                    : expiringSoon
                    ? "border-gold-400/60"
                    : "border-ink-700/70"
                }`}
              >
                <div>
                  {/* Top row: ID + Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ink-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-ink-950 border border-ink-600 font-mono text-xs font-bold text-gold-400">
                        {p.id}
                      </span>
                      <span className="px-2 py-0.5 bg-ink-900 border border-ink-700 font-mono text-[10px] uppercase text-ink-300">
                        📍 {p.cityHub}
                      </span>
                      <span className="px-2 py-0.5 bg-gold-400/15 text-gold-400 font-mono text-[10px] font-bold">
                        {p.commissionRate}% ADMIN CUT
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {p.renewalRequested && (
                        <span className="px-2 py-0.5 bg-blaze-500 text-ink-50 font-mono text-[9px] font-bold uppercase animate-pulse">
                          🔔 Renewal Requested
                        </span>
                      )}
                      {expired ? (
                        <span className="px-2.5 py-1 bg-danger-500/20 border border-danger-500/60 text-danger-400 font-mono text-[10px] font-bold uppercase">
                          🔒 EXPIRED ({Math.abs(daysLeft)}d ago) — LOCKED
                        </span>
                      ) : expiringSoon ? (
                        <span className="px-2.5 py-1 bg-gold-400/20 border border-gold-400/60 text-gold-400 font-mono text-[10px] font-bold uppercase">
                          ⚠ EXPIRING IN {daysLeft} DAYS
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                          ✓ ACTIVE · {daysLeft}d left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Store & Gmail Details */}
                  <div className="mt-3.5 grid sm:grid-cols-[1.3fr_1fr] gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-50">{p.shopName}</h3>
                      <p className="text-xs text-ink-400 mt-0.5">
                        Owner: <span className="text-ink-200 font-medium">{p.ownerName}</span> · {p.phone}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5 truncate">{p.address}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-ink-950 border border-ink-700 rounded">
                        <span className="font-mono text-[10px] text-ink-400 uppercase">Gmail Access:</span>
                        <span className="font-mono text-xs text-cobalt-300 font-bold">{p.email}</span>
                      </div>
                    </div>

                    <div className="bg-ink-950/80 border border-ink-800 p-3 rounded font-mono text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-ink-400 text-[10px]">ID EXPIRY:</span>
                        <span className={expired ? "text-danger-400 font-bold" : "text-ink-100 font-bold"}>
                          {p.expiresAt}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400 text-[10px]">MENU ITEMS:</span>
                        <span className="text-ink-200 tabnum">{pProductsCount} products</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-ink-400 text-[10px]">ROUTED ORDERS:</span>
                        <span className="text-ink-200 tabnum">{pOrders.length} ({fmt(pGmv)})</span>
                      </div>
                      <div className="flex justify-between border-t border-ink-800 pt-1">
                        <span className="text-gold-400 text-[10px] font-bold">YOUR 30% PROFIT:</span>
                        <span className="text-gold-400 font-bold tabnum">{fmt(pAdminCut)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Renewal & Management Action Bar */}
                <div className="mt-4 pt-3.5 border-t border-ink-800 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400 mr-1">
                      ⚡ Quick ID Renewal:
                    </span>
                    <button
                      onClick={() => renewPartner(p.id, 30, "Admin 30-Day Renewal")}
                      className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500 hover:text-ink-950 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold uppercase transition-colors"
                    >
                      +30 Days
                    </button>
                    <button
                      onClick={() => renewPartner(p.id, 90, "Admin 90-Day Quarter Renewal")}
                      className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500 hover:text-ink-950 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold uppercase transition-colors"
                    >
                      +90 Days
                    </button>
                    <button
                      onClick={() => renewPartner(p.id, 365, "Admin 1-Year Annual Renewal")}
                      className="px-2.5 py-1 bg-gold-400/15 hover:bg-gold-400 hover:text-ink-950 border border-gold-400/40 text-gold-400 font-mono text-[10px] font-bold uppercase transition-colors"
                    >
                      +1 Year
                    </button>
                    {!expired && (
                      <button
                        onClick={() => expirePartnerNow(p.id)}
                        title="Simulate ID Expiry to test Partner Account Lock"
                        className="px-2.5 py-1 bg-danger-500/15 hover:bg-danger-500 hover:text-ink-50 border border-danger-500/40 text-danger-400 font-mono text-[10px] uppercase transition-colors ml-auto"
                      >
                        Expire Now (Lock)
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      <Link
                        to={`/partner?partnerId=${p.id}`}
                        className="px-3 py-1.5 bg-cobalt-500/20 hover:bg-cobalt-500 text-cobalt-300 hover:text-ink-50 border border-cobalt-500/40 font-mono text-[10px] uppercase font-bold transition-colors"
                      >
                        Open Partner Dashboard →
                      </Link>
                      <button
                        onClick={() => sendWhatsAppPartnerAccess(p)}
                        className="px-3 py-1.5 bg-[#25D366]/15 hover:bg-[#25D366] text-emerald-400 hover:text-white border border-[#25D366]/40 font-mono text-[10px] uppercase font-bold transition-colors"
                      >
                        WhatsApp Access Link
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setHistoryPartner(p)}
                        className="px-2.5 py-1.5 border border-ink-700 hover:border-ink-500 text-ink-300 font-mono text-[10px] uppercase"
                      >
                        History ({p.renewalHistory?.length || 0})
                      </button>
                      <button
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1.5 border border-ink-700 hover:border-blaze-500 text-ink-200 font-mono text-[10px] uppercase"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deletePartner(p.id)}
                        className="p-1.5 text-ink-500 hover:text-danger-400 transition-colors"
                        title="Delete Partner"
                      >
                        <Ic.trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBTAB 2: PARTNER PRODUCT APPROVAL QUEUE */}
      {subTab === "approvals" && (
        <div className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
          <div className="p-4 border-b border-ink-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold uppercase text-ink-50">
                Partner-Submitted Products & Menu Approval Queue
              </h3>
              <p className="text-xs text-ink-400 mt-0.5">
                Partner uploads and edits require Super Admin approval before going live on the customer storefront.
              </p>
            </div>
            <div className="flex gap-1.5 font-mono text-[10px] uppercase">
              {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setApprovalFilter(st)}
                  className={`px-3 py-1.5 border transition-colors ${
                    approvalFilter === st
                      ? "border-blaze-500 bg-blaze-500/20 text-ink-50 font-bold"
                      : "border-ink-700 bg-ink-900 text-ink-400 hover:text-ink-200"
                  }`}
                >
                  {st} (
                  {st === "all"
                    ? partnerProducts.length
                    : partnerProducts.filter((p) => (p.approvalStatus || "approved") === st).length}
                  )
                </button>
              ))}
            </div>
          </div>

          {filteredPartnerProducts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-mono text-sm text-ink-400">No partner products match "{approvalFilter}".</p>
            </div>
          ) : (
            <div className="divide-y divide-ink-800">
              {filteredPartnerProducts.map((p) => {
                const status = p.approvalStatus || "approved";
                return (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-ink-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={p.img}
                        alt={p.name}
                        className="w-20 h-20 object-cover rounded border border-ink-700 shrink-0 bg-ink-900"
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-ink-950 border border-ink-700 font-mono text-[10px] text-gold-400 font-bold">
                            {p.partnerId} · {p.partnerShopName || p.brand}
                          </span>
                          <span className="font-mono text-[10px] text-ink-400 uppercase">
                            Category: {p.category}
                          </span>
                          {status === "pending" && (
                            <span className="px-2 py-0.5 bg-gold-400/20 border border-gold-400/50 text-gold-400 font-mono text-[10px] font-bold uppercase">
                              ⏳ Pending Admin Approval
                            </span>
                          )}
                          {status === "approved" && (
                            <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                              ✓ Approved & Live on Shop
                            </span>
                          )}
                          {status === "rejected" && (
                            <span className="px-2 py-0.5 bg-danger-500/20 border border-danger-500/50 text-danger-400 font-mono text-[10px] font-bold uppercase">
                              ✕ Rejected
                            </span>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-base text-ink-50 mt-1">{p.name}</h4>
                        <p className="text-xs text-ink-300 mt-0.5 max-w-2xl line-clamp-2">{p.desc}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 font-mono text-xs">
                          <span className="text-volt-400 font-bold tabnum">Price: {fmt(p.price)}</span>
                          <span className="text-ink-400">Stock: {p.stock}</span>
                          <span className="text-ink-400">Sizes: {p.sizes.join(", ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {status !== "approved" && (
                        <button
                          onClick={() => approvePartnerProduct(p.id, "approved")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase font-bold rounded transition-colors flex items-center gap-1.5 shadow"
                        >
                          <Ic.check className="w-4 h-4" /> Approve & Publish
                        </button>
                      )}
                      {status !== "rejected" && (
                        <button
                          onClick={() => approvePartnerProduct(p.id, "rejected")}
                          className="px-3.5 py-2 border border-danger-500/60 hover:bg-danger-500 hover:text-white text-danger-400 font-mono text-xs uppercase rounded transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: DIRECT ORDER ROUTING & 30% COMMISSION LEDGER */}
      {subTab === "routing" && (
        <div className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
          <div className="p-4 border-b border-ink-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold uppercase text-ink-50">
                Direct Order Dispatch to Partner Stores & 30% Commission Split
              </h3>
              <p className="text-xs text-ink-400 mt-0.5">
                Assign any customer order to a partner bakery for direct fulfillment. Expired Partner IDs are automatically locked from receiving orders.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[980px]">
              <thead>
                <tr className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-400 border-b border-ink-800 bg-ink-900/60">
                  <th className="text-left p-3.5">Order & Slot</th>
                  <th className="text-left p-3.5">Customer & Address</th>
                  <th className="text-left p-3.5">Order Total</th>
                  <th className="text-left p-3.5">30% Admin Profit</th>
                  <th className="text-left p-3.5">70% Partner Payout</th>
                  <th className="text-left p-3.5">Route to Partner Store</th>
                  <th className="text-left p-3.5">Partner Status</th>
                  <th className="text-right p-3.5">Dispatch Alert</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 20).map((o) => {
                  const rate = o.adminCommissionRate || 30;
                  const adminCut = o.adminCommissionAmount ?? (o.total * rate) / 100;
                  const partnerCut = o.partnerPayoutAmount ?? o.total - adminCut;

                  return (
                    <tr
                      key={o.id}
                      className="border-b border-ink-800/70 hover:bg-ink-800/30 transition-colors"
                    >
                      <td className="p-3.5 font-mono text-xs">
                        <span className="font-bold text-ink-50">{o.id}</span>
                        <span className="block text-[10px] text-blaze-400 mt-0.5">
                          {o.deliverySlot || o.method}
                        </span>
                      </td>
                      <td className="p-3.5 text-xs max-w-[230px]">
                        <span className="font-semibold text-ink-100 block truncate">
                          {o.customerName || o.email}
                        </span>
                        <span className="text-[11px] text-ink-400 block truncate">{o.address}</span>
                      </td>
                      <td className="p-3.5 font-mono tabnum text-xs font-bold text-ink-50">
                        {fmt(o.total)}
                      </td>
                      <td className="p-3.5 font-mono tabnum text-xs font-bold text-gold-400">
                        +{fmt(adminCut)}{" "}
                        <span className="text-[10px] font-normal text-ink-400">({rate}%)</span>
                      </td>
                      <td className="p-3.5 font-mono tabnum text-xs font-bold text-volt-400">
                        {fmt(partnerCut)}{" "}
                        <span className="text-[10px] font-normal text-ink-400">
                          ({100 - rate}%)
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={o.assignedPartnerId || ""}
                          onChange={(e) => {
                            if (e.target.value) {
                              assignOrderToPartner(o.id, e.target.value);
                            }
                          }}
                          className="bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-2.5 py-1.5 font-mono text-xs text-ink-100 cursor-pointer w-56"
                        >
                          <option value="">-- CakeUrban In-House --</option>
                          {partners.map((p) => {
                            const locked = isPartnerExpired(p);
                            return (
                              <option key={p.id} value={p.id} disabled={locked}>
                                {p.id} · {p.shopName} ({p.cityHub})
                                {locked ? " [LOCKED - EXPIRED]" : ""}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                      <td className="p-3.5">
                        {o.assignedPartnerId ? (
                          <select
                            value={o.partnerStatus || "assigned"}
                            onChange={(e) =>
                              updatePartnerOrderStatus(o.id, e.target.value as PartnerOrderStatus)
                            }
                            className="bg-ink-900 border border-ink-700 px-2.5 py-1 font-mono text-[11px] uppercase text-emerald-400 cursor-pointer"
                          >
                            <option value="assigned">Assigned</option>
                            <option value="accepted">Accepted by Partner</option>
                            <option value="baking">Baking in Oven</option>
                            <option value="ready">Ready for Rider</option>
                            <option value="dispatched">Out for Delivery</option>
                            <option value="delivered">Delivered ✓</option>
                          </select>
                        ) : (
                          <span className="font-mono text-[10px] text-ink-500 uppercase">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {o.assignedPartnerId ? (
                          <button
                            onClick={() => sendWhatsAppOrderToPartner(o.id)}
                            className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-mono text-[10px] uppercase font-bold rounded transition-colors inline-flex items-center gap-1"
                          >
                            <span>WhatsApp Vendor</span>
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-ink-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Grant Gmail Partner Access / Edit Partner */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSavePartner} className="p-6 space-y-4 max-w-lg mx-auto">
          <div className="border-b border-ink-800 pb-3">
            <p className="font-mono text-[10px] tracking-[0.25em] text-gold-400 uppercase font-bold">
              {editingPartner ? `Edit Partner ${editingPartner.id}` : "New Vendor Onboarding"}
            </p>
            <h3 className="font-display text-xl font-bold uppercase mt-1 text-ink-50">
              {editingPartner
                ? `Update ${editingPartner.shopName}`
                : "Grant Gmail Access & Generate Partner ID"}
            </h3>
            <p className="text-xs text-ink-400 mt-0.5">
              When this vendor logs in with their authorized Gmail address, they automatically unlock their Partner Dashboard (`/partner`).
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                Partner Shop / Bakery Name *
              </label>
              <input
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Sweet Cravings Bakehouse"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-ink-100"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                Shop Owner Name *
              </label>
              <input
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Rajesh Gupta"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-ink-100"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-mono text-[10px] uppercase text-cobalt-300 font-bold mb-1">
                Authorized Partner Gmail *
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor.shop@gmail.com"
                className="w-full bg-ink-950 border border-cobalt-500/60 focus:border-cobalt-400 outline-none px-3 py-2 font-mono text-ink-100"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                WhatsApp / Mobile Number *
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 font-mono text-ink-100"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                Delhi NCR Delivery Hub
              </label>
              <select
                value={cityHub}
                onChange={(e) => setCityHub(e.target.value)}
                className="w-full bg-ink-950 border border-ink-600 outline-none px-3 py-2 font-mono text-ink-100"
              >
                {NCR_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase text-gold-400 font-bold mb-1">
                Admin Commission % (Default 30%)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full bg-ink-950 border border-gold-400/50 outline-none px-3 py-2 font-mono font-bold text-gold-400"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
              Full Shop Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop #14, Sector 18 Main Market..."
              className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-ink-100"
            />
          </div>

          <div className="bg-ink-950 border border-ink-800 p-3.5 rounded space-y-2.5 text-xs">
            <label className="block font-mono text-[10px] uppercase text-emerald-400 font-bold">
              Partner ID Validity & Expiry Date
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "7 Days Trial", days: 7 },
                { label: "30 Days (1 Month)", days: 30 },
                { label: "90 Days (Quarter)", days: 90 },
                { label: "365 Days (1 Year)", days: 365 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => {
                    setValidityDays(preset.days);
                    const d = new Date();
                    d.setDate(d.getDate() + preset.days);
                    setCustomExpiry(d.toISOString().slice(0, 10));
                  }}
                  className={`px-2.5 py-1 font-mono text-[10px] uppercase border transition-colors ${
                    validityDays === preset.days
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 font-bold"
                      : "border-ink-700 bg-ink-900 text-ink-400"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-1">
              <span className="font-mono text-[11px] text-ink-400">Exact Expiry Date:</span>
              <input
                type="date"
                required
                value={customExpiry}
                onChange={(e) => setCustomExpiry(e.target.value)}
                className="bg-ink-900 border border-ink-600 px-3 py-1.5 font-mono text-xs text-ink-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-ink-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 bg-ink-800 text-ink-300 font-mono text-xs uppercase"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="clip-btn px-5 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold"
            >
              {editingPartner ? "Save Partner Changes" : "Generate Partner ID & Grant Access"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Renewal History Log */}
      <Modal open={!!historyPartner} onClose={() => setHistoryPartner(null)}>
        {historyPartner && (
          <div className="p-6 space-y-4 max-w-lg mx-auto">
            <div className="border-b border-ink-800 pb-3">
              <p className="font-mono text-[10px] tracking-[0.2em] text-gold-400 uppercase">
                Partner ID Renewal Ledger
              </p>
              <h3 className="font-display text-xl font-bold uppercase mt-1">
                {historyPartner.id} — {historyPartner.shopName}
              </h3>
            </div>
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {(historyPartner.renewalHistory || []).map((log, i) => (
                <div key={i} className="p-3 bg-ink-950 border border-ink-800 font-mono text-xs">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>+{log.daysAdded} Days Renewed</span>
                    <span>{log.renewedAt}</span>
                  </div>
                  <p className="text-ink-300 text-[11px] mt-1">
                    Expiry extended: {log.previousExpiry} →{" "}
                    <span className="text-ink-50 font-bold">{log.newExpiry}</span>
                  </p>
                  {log.note && <p className="text-ink-500 text-[10px] mt-0.5">{log.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
