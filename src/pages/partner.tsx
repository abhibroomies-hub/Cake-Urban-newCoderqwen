import React, { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../lib/store";
import type { Product, PartnerOrderStatus } from "../data/catalog";
import { getDaysRemaining, isPartnerExpired } from "../components/admin/PartnersCommissionManager";
import { Ic, Modal } from "../components/ui";

export function PartnerPortal() {
  const store = useStore();
  const {
    user,
    partners,
    allProducts,
    categories,
    orders,
    fmt,
    login,
    socialLogin,
    addProduct,
    updateProduct,
    deleteProduct,
    updatePartnerOrderStatus,
    requestPartnerRenewal,
    renewPartner,
    toast,
  } = store;

  const [searchParams, setSearchParams] = useSearchParams();
  const queryPartnerId = searchParams.get("partnerId") || "";

  const [tab, setTab] = useState<"products" | "orders" | "earnings">("products");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [isNewProd, setIsNewProd] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Resolve active partner from either Admin query param or logged-in user's Gmail
  const matchedPartner = useMemo(() => {
    if (queryPartnerId) {
      const byQuery = partners.find((p) => p.id.toLowerCase() === queryPartnerId.toLowerCase());
      if (byQuery && (user?.role === "admin" || user?.email?.toLowerCase() === byQuery.email.toLowerCase())) {
        return byQuery;
      }
    }
    if (user?.email) {
      const byEmail = partners.find((p) => p.email.toLowerCase() === user.email.toLowerCase());
      if (byEmail) return byEmail;
    }
    if (user?.role === "admin" && partners.length > 0) {
      return partners[0];
    }
    return null;
  }, [partners, queryPartnerId, user]);

  const partnerProducts = useMemo(() => {
    if (!matchedPartner) return [];
    return allProducts.filter((p) => p.partnerId === matchedPartner.id);
  }, [allProducts, matchedPartner]);

  const partnerOrders = useMemo(() => {
    if (!matchedPartner) return [];
    return orders.filter((o) => o.assignedPartnerId === matchedPartner.id);
  }, [orders, matchedPartner]);

  const grossSales = useMemo(
    () => partnerOrders.reduce((s, o) => s + o.total, 0),
    [partnerOrders]
  );

  const adminCommissionTotal = useMemo(() => {
    if (!matchedPartner) return 0;
    return partnerOrders.reduce(
      (s, o) =>
        s +
        (o.adminCommissionAmount ??
          (o.total * (o.adminCommissionRate || matchedPartner.commissionRate || 30)) / 100),
      0
    );
  }, [partnerOrders, matchedPartner]);

  const netPartnerEarnings = useMemo(() => {
    return Math.max(0, grossSales - adminCommissionTotal);
  }, [grossSales, adminCommissionTotal]);

  const handlePartnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = loginEmail.trim().toLowerCase();
    const found = partners.find((p) => p.email.toLowerCase() === clean);
    if (!found && !clean.includes("admin") && clean !== "abhibroomies@gmail.com") {
      toast(
        "error",
        `Gmail "${clean}" does not have Partner Access yet. Ask Super Admin to grant access in Admin → Partners.`
      );
      return;
    }
    login(clean, loginPass || "partner123");
    if (found) {
      setSearchParams({ partnerId: found.id });
    }
  };

  // Gate 1: Strict Admin-Permission Check — Partner Portal is ONLY accessible when Super Admin grants access to the user's Gmail
  if (!matchedPartner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="border border-danger-500/40 bg-ink-900 clip-tile p-6 sm:p-10 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-danger-500/15 border border-danger-500/40 grid place-items-center text-danger-400">
            <Ic.shield className="w-7 h-7" />
          </div>
          <span className="inline-block px-3 py-1 bg-danger-500/15 border border-danger-500/40 text-danger-400 font-mono text-[10px] font-bold uppercase tracking-widest">
            RESTRICTED VENDOR PORTAL · ADMIN PERMISSION REQUIRED
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-ink-50">
            Partner Access Not Enabled
          </h1>
          {user ? (
            <p className="text-xs sm:text-sm text-ink-300 max-w-lg mx-auto leading-relaxed">
              Your signed-in account (<span className="font-mono text-ink-100 font-bold">{user.email}</span>) has not been granted Partner Store access yet. The Partner Portal only becomes visible and accessible after the CakeUrban Super Admin authorizes your Gmail in{" "}
              <span className="font-mono text-gold-400">Admin → Partners & 30% Fee</span>.
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-ink-300 max-w-lg mx-auto leading-relaxed">
              This portal is strictly reserved for authorized CakeUrban bakery partners. Please sign in with the Gmail address that has been granted Partner ID permission by the CakeUrban Super Admin.
            </p>
          )}

          {!user && (
            <div className="bg-ink-950 border border-ink-800 p-5 max-w-md mx-auto text-left space-y-3">
              <p className="font-mono text-[11px] uppercase tracking-wider text-ink-200 font-bold">
                Sign In with Admin-Authorized Gmail
              </p>
              <form onSubmit={handlePartnerLogin} className="space-y-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                    Authorized Partner Gmail *
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your-authorized-shop@gmail.com"
                    className="w-full bg-ink-900 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2.5 text-sm font-mono text-ink-100"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-ink-900 border border-ink-600 focus:border-blaze-500 outline-none px-3.5 py-2.5 text-sm text-ink-100"
                  />
                </div>
                <button
                  type="submit"
                  className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase tracking-widest py-3 font-bold transition-colors"
                >
                  Verify Partner Permission & Enter
                </button>
              </form>
              <button
                type="button"
                onClick={() => socialLogin("Google")}
                className="w-full py-2.5 border border-ink-600 hover:border-ink-400 text-ink-100 font-mono text-xs uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <span>Sign In with Google (Authorized Gmail)</span>
              </button>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="px-5 py-2.5 border border-ink-600 hover:border-ink-400 text-ink-200 font-mono text-xs uppercase tracking-wider transition-colors"
            >
              ← Back to CakeUrban Store
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="px-5 py-2.5 bg-gold-400 text-ink-950 font-mono text-xs uppercase tracking-wider font-bold transition-colors"
              >
                Manage Partners in Admin →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(matchedPartner.expiresAt);
  const isLocked = isPartnerExpired(matchedPartner);
  const partnerSharePct = 100 - (matchedPartner.commissionRate || 30);

  const openNewProductModal = () => {
    if (isLocked) {
      toast(
        "error",
        "Account Locked: Your Partner ID has expired. Request renewal from Super Admin to upload products."
      );
      return;
    }
    const nextNum = partnerProducts.length + 1;
    setIsNewProd(true);
    setEditingProd({
      id: `partner-${matchedPartner.id.toLowerCase()}-${Date.now()}`,
      name: "",
      brand: matchedPartner.shopName,
      category: categories[0]?.name || "Cakes",
      price: 8.5,
      compareAt: 10.5,
      img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
      tag: "PARTNER FRESH",
      rating: 4.9,
      ratingCount: 1,
      stock: 15,
      sku: `${matchedPartner.id}-${String(nextNum).padStart(2, "0")}`,
      colors: [{ name: "Signature", hex: "#e07a5f" }],
      sizes: ["0.5 KG", "1 KG", "2 KG"],
      desc: `100% Pure Eggless artisan bake prepared fresh at ${matchedPartner.shopName} (${matchedPartner.cityHub}).`,
      specs: [
        ["Dietary", "100% Pure Eggless Veg"],
        ["Partner Store", `${matchedPartner.shopName} (${matchedPartner.id})`],
      ],
      partnerId: matchedPartner.id,
      partnerShopName: matchedPartner.shopName,
      approvalStatus: "pending",
      submittedAt: new Date().toISOString(),
    });
    setEditModalOpen(true);
  };

  const openEditProductModal = (p: Product) => {
    if (isLocked) {
      toast(
        "error",
        "Account Locked: Your Partner ID has expired. Please renew your Partner ID to edit menu items."
      );
      return;
    }
    setIsNewProd(false);
    setEditingProd({ ...p });
    setEditModalOpen(true);
  };

  const handleSavePartnerProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;
    if (isLocked) {
      toast("error", "Partner ID is expired — edits are locked.");
      return;
    }
    if (!editingProd.name.trim()) {
      toast("error", "Please enter a product name");
      return;
    }

    const payload: Product = {
      ...editingProd,
      brand: matchedPartner.shopName,
      partnerId: matchedPartner.id,
      partnerShopName: matchedPartner.shopName,
      approvalStatus: "pending", // Always requires Admin approval on partner upload/edit
      submittedAt: new Date().toISOString(),
    };

    if (isNewProd) {
      addProduct(payload);
      toast("success", `"${payload.name}" submitted for Super Admin approval!`);
    } else {
      updateProduct(payload);
      toast("success", `"${payload.name}" updated & queued for Admin approval!`);
    }
    setEditModalOpen(false);
    setEditingProd(null);
  };

  const contactAdminOnWhatsAppForRenewal = () => {
    const text = `Hi CakeUrban Super Admin! 🙏\nPlease renew my Partner Store ID:\n\n🆔 *Partner ID:* ${matchedPartner.id}\n🏪 *Shop Name:* ${matchedPartner.shopName}\n📧 *Gmail:* ${matchedPartner.email}\n📅 *Expired On:* ${matchedPartner.expiresAt}\n\nPlease extend my Partner ID validity so I can receive new orders and update my menu.`;
    window.open(
      `https://wa.me/917318531953?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="max-w-[1480px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Store Switcher Bar (Visible when Super Admin is inspecting Partner Portal) */}
      {user?.role === "admin" && (
        <div className="bg-ink-900 border border-gold-400/50 p-3.5 rounded flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-gold-400 text-ink-950 font-mono text-[10px] font-bold uppercase">
              SUPER ADMIN PREVIEW MODE
            </span>
            <span className="text-xs text-ink-200 font-mono">
              Switch between any Partner Store to inspect or manage their dashboard:
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={matchedPartner.id}
              onChange={(e) => setSearchParams({ partnerId: e.target.value })}
              className="bg-ink-950 border border-gold-400/60 px-3 py-1.5 font-mono text-xs text-gold-400 font-bold outline-none cursor-pointer"
            >
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.shopName} ({p.email}){" "}
                  {isPartnerExpired(p) ? "[EXPIRED]" : "[ACTIVE]"}
                </option>
              ))}
            </select>
            {isLocked && (
              <button
                onClick={() => renewPartner(matchedPartner.id, 30, "Admin Instant Renewal from Partner View")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold"
              >
                ⚡ Unlock & Renew +30 Days Now
              </button>
            )}
            <Link
              to="/admin"
              className="px-3 py-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-600 text-ink-100 font-mono text-[10px] uppercase"
            >
              ← Back to Admin Console
            </Link>
          </div>
        </div>
      )}

      {/* STRICT EXPIRY LOCK GATE BANNER */}
      {isLocked && (
        <div className="border-2 border-danger-500 bg-danger-500/10 p-5 sm:p-6 clip-tile flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-danger-500 text-white font-mono text-xs font-bold uppercase tracking-wider">
                🔒 PARTNER ID EXPIRED — ACCOUNT LOCKED
              </span>
              <span className="font-mono text-xs text-danger-400 font-bold">
                Expired on {matchedPartner.expiresAt} ({Math.abs(daysLeft)} days ago)
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black uppercase text-ink-50">
              New Orders & Menu Uploads Are Temporarily Blocked
            </h2>
            <p className="text-xs sm:text-sm text-ink-200 max-w-3xl">
              Your Partner ID (<span className="font-mono font-bold">{matchedPartner.id}</span>) validity has ended. While expired, your store cannot receive new CakeUrban customer orders or upload/edit menu products. Request a renewal from the Super Admin to immediately unlock your store.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => requestPartnerRenewal(matchedPartner.id)}
              disabled={matchedPartner.renewalRequested}
              className={`px-4 py-3 font-mono text-xs uppercase font-bold tracking-wider transition-colors ${
                matchedPartner.renewalRequested
                  ? "bg-ink-800 border border-ink-600 text-gold-400"
                  : "bg-blaze-500 hover:bg-blaze-400 text-ink-50 shadow-lg"
              }`}
            >
              {matchedPartner.renewalRequested
                ? "✓ Renewal Request Sent to Admin"
                : "🔔 Request ID Renewal from Admin"}
            </button>
            <button
              onClick={contactAdminOnWhatsAppForRenewal}
              className="px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-mono text-xs uppercase font-bold tracking-wider transition-colors"
            >
              WhatsApp Admin to Renew
            </button>
          </div>
        </div>
      )}

      {/* Partner Store Header & KPI Summary */}
      <div className="border border-ink-700/70 bg-ink-850 p-5 sm:p-6 clip-tile">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-ink-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-ink-950 border border-gold-400/50 font-mono text-xs font-bold text-gold-400">
                PARTNER ID: {matchedPartner.id}
              </span>
              <span className="px-2.5 py-1 bg-ink-900 border border-ink-700 font-mono text-[10px] uppercase text-ink-200">
                📍 {matchedPartner.cityHub} Hub
              </span>
              <span className="px-2.5 py-1 bg-cobalt-500/15 border border-cobalt-500/40 font-mono text-[10px] text-cobalt-300">
                Gmail: {matchedPartner.email}
              </span>
              {!isLocked ? (
                <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/40 font-mono text-[10px] font-bold text-emerald-400 uppercase">
                  ● ID Active · Valid till {matchedPartner.expiresAt} ({daysLeft} days left)
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-danger-500/20 border border-danger-500/50 font-mono text-[10px] font-bold text-danger-400 uppercase">
                  ● ID Expired ({matchedPartner.expiresAt})
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase mt-2.5 text-ink-50">
              {matchedPartner.shopName}
            </h1>
            <p className="text-xs text-ink-400 mt-1">
              Owner: <span className="text-ink-200 font-semibold">{matchedPartner.ownerName}</span> ·{" "}
              {matchedPartner.address} · {matchedPartner.phone}
            </p>
          </div>

          <button
            onClick={openNewProductModal}
            disabled={isLocked}
            className={`clip-btn px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-2 transition-colors ${
              isLocked
                ? "bg-ink-800 text-ink-500 cursor-not-allowed border border-ink-700"
                : "bg-blaze-500 hover:bg-blaze-400 text-ink-50 shadow-lg"
            }`}
          >
            <Ic.plus className="w-4 h-4" />
            <span>{isLocked ? "🔒 Upload Locked (ID Expired)" : "+ Upload New Product / Cake"}</span>
          </button>
        </div>

        {/* 4 Partner KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          <div className="bg-ink-950 border border-ink-800 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              Your {partnerSharePct}% Net Earnings
            </p>
            <p className="font-display text-2xl font-black tabnum text-volt-400 mt-1">
              {fmt(netPartnerEarnings)}
            </p>
            <p className="font-mono text-[10px] text-ink-400 mt-1">
              After {matchedPartner.commissionRate}% CakeUrban platform fee
            </p>
          </div>

          <div className="bg-ink-950 border border-ink-800 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              CakeUrban {matchedPartner.commissionRate}% Fee
            </p>
            <p className="font-display text-2xl font-black tabnum text-gold-400 mt-1">
              {fmt(adminCommissionTotal)}
            </p>
            <p className="font-mono text-[10px] text-ink-400 mt-1">
              From {fmt(grossSales)} gross store sales
            </p>
          </div>

          <div className="bg-ink-950 border border-ink-800 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              Assigned Store Orders
            </p>
            <p className="font-display text-2xl font-black tabnum text-ink-50 mt-1">
              {partnerOrders.length}
            </p>
            <p className="font-mono text-[10px] text-emerald-400 mt-1">
              {partnerOrders.filter((o) => o.partnerStatus !== "delivered").length} active in kitchen
            </p>
          </div>

          <div className="bg-ink-950 border border-ink-800 p-4 rounded">
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
              My Uploaded Menu Items
            </p>
            <p className="font-display text-2xl font-black tabnum text-ink-50 mt-1">
              {partnerProducts.length}
            </p>
            <p className="font-mono text-[10px] text-gold-400 mt-1">
              {partnerProducts.filter((p) => p.approvalStatus === "pending").length} awaiting Admin approval
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-ink-800 pb-3">
        <button
          onClick={() => setTab("products")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded transition-colors ${
            tab === "products"
              ? "bg-blaze-500 text-ink-50 font-bold"
              : "bg-ink-850 border border-ink-700 text-ink-300 hover:text-ink-50"
          }`}
        >
          1. My Store Menu & Products ({partnerProducts.length})
        </button>
        <button
          onClick={() => setTab("orders")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded transition-colors ${
            tab === "orders"
              ? "bg-blaze-500 text-ink-50 font-bold"
              : "bg-ink-850 border border-ink-700 text-ink-300 hover:text-ink-50"
          }`}
        >
          2. Assigned Delivery Orders ({partnerOrders.length})
        </button>
        <button
          onClick={() => setTab("earnings")}
          className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider rounded transition-colors ${
            tab === "earnings"
              ? "bg-blaze-500 text-ink-50 font-bold"
              : "bg-ink-850 border border-ink-700 text-ink-300 hover:text-ink-50"
          }`}
        >
          3. 70% Payouts & ID Renewal Ledger
        </button>
      </div>

      {/* TAB 1: MY STORE MENU & PRODUCTS */}
      {tab === "products" && (
        <div className="space-y-4">
          {partnerProducts.length === 0 ? (
            <div className="border border-ink-700/60 bg-ink-850 p-12 text-center clip-tile space-y-3">
              <p className="font-display text-lg font-bold uppercase text-ink-200">
                No Products Uploaded Yet
              </p>
              <p className="text-xs text-ink-400 max-w-md mx-auto">
                Upload your bakery cakes, gourmet cookies, or gift hampers with photos and prices. Once approved by Super Admin, they appear live on CakeUrban.
              </p>
              {!isLocked && (
                <button
                  onClick={openNewProductModal}
                  className="clip-btn px-5 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold"
                >
                  + Upload First Menu Item
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {partnerProducts.map((p) => {
                const status = p.approvalStatus || "approved";
                return (
                  <div
                    key={p.id}
                    className="border border-ink-700/70 bg-ink-850 clip-tile overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-48 bg-ink-950 overflow-hidden">
                        <img
                          src={p.img}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          {status === "pending" && (
                            <span className="px-2.5 py-1 bg-ink-950/90 border border-gold-400 text-gold-400 font-mono text-[10px] font-bold uppercase">
                              ⏳ Pending Admin Approval
                            </span>
                          )}
                          {status === "approved" && (
                            <span className="px-2.5 py-1 bg-ink-950/90 border border-emerald-400 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                              ✓ Live on Storefront
                            </span>
                          )}
                          {status === "rejected" && (
                            <span className="px-2.5 py-1 bg-ink-950/90 border border-danger-400 text-danger-400 font-mono text-[10px] font-bold uppercase">
                              ✕ Rejected by Admin
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center justify-between font-mono text-[10px] text-ink-400 uppercase">
                          <span>{p.category}</span>
                          <span>SKU: {p.sku}</span>
                        </div>
                        <h3 className="font-display font-bold text-base text-ink-50 mt-1">
                          {p.name}
                        </h3>
                        <p className="text-xs text-ink-400 mt-1 line-clamp-2">{p.desc}</p>

                        <div className="mt-3 pt-3 border-t border-ink-800 flex items-center justify-between font-mono text-xs">
                          <div>
                            <span className="text-ink-400 text-[10px] block">SELLING PRICE</span>
                            <span className="text-volt-400 font-bold tabnum">{fmt(p.price)}</span>
                          </div>
                          <div>
                            <span className="text-ink-400 text-[10px] block">YOUR 70% EARNING</span>
                            <span className="text-emerald-400 font-bold tabnum">
                              {fmt((p.price * partnerSharePct) / 100)}
                            </span>
                          </div>
                          <div>
                            <span className="text-ink-400 text-[10px] block">STOCK</span>
                            <span className="text-ink-100 font-bold tabnum">{p.stock} left</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-ink-900/80 border-t border-ink-800 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openEditProductModal(p)}
                        disabled={isLocked}
                        className={`flex-1 py-2 font-mono text-[11px] uppercase font-bold border transition-colors ${
                          isLocked
                            ? "border-ink-700 text-ink-500 cursor-not-allowed"
                            : "border-ink-600 hover:border-blaze-500 text-ink-100 hover:text-blaze-400"
                        }`}
                      >
                        {isLocked ? "🔒 Edit Locked" : "✎ Edit Photo / Price / Menu"}
                      </button>
                      <button
                        onClick={() => {
                          if (isLocked) {
                            toast("error", "Partner ID expired — cannot modify products");
                            return;
                          }
                          deleteProduct(p.id);
                        }}
                        className="p-2 text-ink-500 hover:text-danger-400 transition-colors"
                        title="Remove Item"
                      >
                        <Ic.trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNED DELIVERY ORDERS */}
      {tab === "orders" && (
        <div className="space-y-4">
          {partnerOrders.length === 0 ? (
            <div className="border border-ink-700/60 bg-ink-850 p-12 text-center clip-tile">
              <p className="font-mono text-sm text-ink-400">
                No orders routed to {matchedPartner.shopName} yet.
              </p>
            </div>
          ) : (
            partnerOrders.map((o) => {
              const rate = o.adminCommissionRate || matchedPartner.commissionRate || 30;
              const adminFee = o.adminCommissionAmount ?? (o.total * rate) / 100;
              const myPayout = o.partnerPayoutAmount ?? o.total - adminFee;
              const currentSt = o.partnerStatus || "assigned";

              return (
                <div
                  key={o.id}
                  className="border border-ink-700/70 bg-ink-850 p-5 clip-tile space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink-800">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-1 bg-blaze-500/20 border border-blaze-500/40 font-mono text-xs font-bold text-blaze-400">
                        ORDER {o.id}
                      </span>
                      <span className="font-mono text-xs text-volt-400">
                        {o.deliverySlot || o.method}
                      </span>
                      <span className="font-mono text-xs text-ink-400">
                        · {new Date(o.date).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-ink-400">Order Total: {fmt(o.total)}</span>
                      <span className="text-gold-400">
                        · CakeUrban {rate}%: -{fmt(adminFee)}
                      </span>
                      <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold">
                        Your {100 - rate}% Payout: {fmt(myPayout)}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[1.2fr_1fr] gap-4">
                    <div className="space-y-2">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                        Items to Bake & Dispatch
                      </p>
                      {o.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-2.5 bg-ink-950 border border-ink-800"
                        >
                          <img
                            src={it.img}
                            alt={it.name}
                            className="w-12 h-12 object-cover rounded border border-ink-700"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-bold text-sm text-ink-50 truncate">
                              {it.qty}× {it.name}
                            </p>
                            <p className="font-mono text-[11px] text-ink-400">
                              Size: {it.size} · Flavor/Style: {it.color}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-ink-950 border border-ink-800 p-3.5 space-y-2 text-xs">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-gold-400 font-bold">
                        Customer Delivery & Cake Plaque Details
                      </p>
                      <p className="text-ink-100 font-semibold">
                        Customer: {o.customerName || o.email} ({o.customerPhone || "+91 98765 43210"})
                      </p>
                      <p className="text-ink-300">📍 Address: {o.address}</p>
                      {o.plaqueMessage && (
                        <p className="p-2 bg-ink-900 border border-gold-400/30 font-mono text-gold-400 text-[11px]">
                          ✍️ Write on Cake: "{o.plaqueMessage}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Kitchen & Rider Status Progression Bar */}
                  <div className="pt-3 border-t border-ink-800 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-ink-400">
                      Update Kitchen & Delivery Status:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          ["accepted", "1. Accept Order"],
                          ["baking", "2. Baking in Oven"],
                          ["ready", "3. Ready for Pickup"],
                          ["dispatched", "4. Out for Delivery"],
                          ["delivered", "5. Delivered ✓"],
                        ] as [PartnerOrderStatus, string][]
                      ).map(([stKey, label]) => (
                        <button
                          key={stKey}
                          disabled={isLocked}
                          onClick={() => updatePartnerOrderStatus(o.id, stKey)}
                          className={`px-3 py-1.5 font-mono text-[10px] uppercase transition-colors border ${
                            currentSt === stKey
                              ? "border-emerald-400 bg-emerald-500 text-ink-950 font-bold"
                              : "border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-500"
                          } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: 70% PAYOUTS & ID RENEWAL LEDGER */}
      {tab === "earnings" && (
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5">
          <div className="border border-ink-700/60 bg-ink-850 clip-tile overflow-hidden">
            <div className="p-4 border-b border-ink-800">
              <h3 className="font-display font-bold uppercase text-ink-50">
                Order-by-Order Commission & Payout Statement
              </h3>
              <p className="text-xs text-ink-400 mt-0.5">
                Transparent breakdown of every order routed to {matchedPartner.shopName}.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="font-mono text-[10px] uppercase text-ink-400 border-b border-ink-800 bg-ink-900/60">
                    <th className="text-left p-3.5">Order ID</th>
                    <th className="text-left p-3.5">Date</th>
                    <th className="text-left p-3.5">Gross Total</th>
                    <th className="text-left p-3.5">CakeUrban ({matchedPartner.commissionRate}%)</th>
                    <th className="text-right p-3.5">Your Net ({partnerSharePct}%)</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerOrders.map((o) => {
                    const rate = o.adminCommissionRate || matchedPartner.commissionRate || 30;
                    const fee = o.adminCommissionAmount ?? (o.total * rate) / 100;
                    const net = o.partnerPayoutAmount ?? o.total - fee;
                    return (
                      <tr key={o.id} className="border-b border-ink-800/60 font-mono text-xs">
                        <td className="p-3.5 font-bold text-ink-100">{o.id}</td>
                        <td className="p-3.5 text-ink-400">
                          {new Date(o.date).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 tabnum">{fmt(o.total)}</td>
                        <td className="p-3.5 tabnum text-gold-400">-{fmt(fee)}</td>
                        <td className="p-3.5 text-right tabnum font-bold text-volt-400">
                          +{fmt(net)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold-400 font-bold">
                Partner ID Subscription & Renewal History
              </p>
              <h3 className="font-display text-lg font-bold uppercase mt-1">
                ID: {matchedPartner.id}
              </h3>
              <p className="font-mono text-xs text-ink-300 mt-1">
                Current Expiry:{" "}
                <span className={isLocked ? "text-danger-400 font-bold" : "text-emerald-400 font-bold"}>
                  {matchedPartner.expiresAt}
                </span>
              </p>
            </div>

            <div className="space-y-2.5">
              {(matchedPartner.renewalHistory || []).map((log, i) => (
                <div key={i} className="p-3 bg-ink-950 border border-ink-800 font-mono text-xs">
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>+{log.daysAdded} Days Validity</span>
                    <span>{log.renewedAt}</span>
                  </div>
                  <p className="text-[11px] text-ink-300 mt-1">
                    Valid until: <span className="text-ink-50 font-bold">{log.newExpiry}</span>
                  </p>
                  {log.note && <p className="text-[10px] text-ink-500 mt-0.5">{log.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Partner Add / Edit Product */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        {editingProd && (
          <form onSubmit={handleSavePartnerProduct} className="p-6 space-y-4 max-w-xl mx-auto">
            <div className="border-b border-ink-800 pb-3">
              <p className="font-mono text-[10px] tracking-[0.25em] text-blaze-400 uppercase font-bold">
                {matchedPartner.shopName} ({matchedPartner.id})
              </p>
              <h3 className="font-display text-xl font-bold uppercase mt-1 text-ink-50">
                {isNewProd ? "Upload New Bakery Product" : `Edit ${editingProd.name}`}
              </h3>
              <p className="text-xs text-ink-400 mt-0.5">
                Submitted items are reviewed in the Super Admin Console before going live on the store.
              </p>
            </div>

            {/* Product Image Upload + URL */}
            <div className="grid sm:grid-cols-[110px_1fr] gap-4 items-center bg-ink-950 p-3.5 border border-ink-800">
              <div className="w-24 h-24 rounded overflow-hidden border border-ink-700 bg-ink-900 shrink-0">
                <img
                  src={editingProd.img}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (ev.target?.result) {
                          setEditingProd({ ...editingProd, img: ev.target.result as string });
                          toast("success", "Product photo uploaded!");
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-[10px] uppercase font-bold"
                  >
                    📷 Upload Product Photo
                  </button>
                  <span className="font-mono text-[10px] text-ink-400">or paste image URL</span>
                </div>
                <input
                  value={editingProd.img}
                  onChange={(e) => setEditingProd({ ...editingProd, img: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-ink-900 border border-ink-700 px-3 py-1.5 font-mono text-xs text-ink-100 outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                  Product / Cake Name *
                </label>
                <input
                  required
                  value={editingProd.name}
                  onChange={(e) => setEditingProd({ ...editingProd, name: e.target.value })}
                  placeholder="e.g. Belgian Truffle Celebration Cake"
                  className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-ink-100"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                  Category
                </label>
                <select
                  value={editingProd.category}
                  onChange={(e) => setEditingProd({ ...editingProd, category: e.target.value })}
                  className="w-full bg-ink-950 border border-ink-600 outline-none px-3 py-2 font-mono text-ink-100"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                  Selling Price (Base $)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={editingProd.price}
                  onChange={(e) => setEditingProd({ ...editingProd, price: Number(e.target.value) })}
                  className="w-full bg-ink-950 border border-ink-600 px-3 py-2 font-mono text-ink-100"
                />
                <span className="font-mono text-[10px] text-volt-400 mt-0.5 block">
                  Store Price: {fmt(editingProd.price)}
                </span>
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                  Daily Stock Qty
                </label>
                <input
                  type="number"
                  required
                  value={editingProd.stock}
                  onChange={(e) => setEditingProd({ ...editingProd, stock: Number(e.target.value) })}
                  className="w-full bg-ink-950 border border-ink-600 px-3 py-2 font-mono text-ink-100"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                  Sizes (comma separated)
                </label>
                <input
                  value={editingProd.sizes.join(", ")}
                  onChange={(e) =>
                    setEditingProd({
                      ...editingProd,
                      sizes: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="0.5 KG, 1 KG, 2 KG"
                  className="w-full bg-ink-950 border border-ink-600 px-3 py-2 font-mono text-ink-100"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
                Product Description & Ingredients
              </label>
              <textarea
                rows={3}
                value={editingProd.desc}
                onChange={(e) => setEditingProd({ ...editingProd, desc: e.target.value })}
                className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2 text-ink-100 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-ink-800">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2.5 bg-ink-800 text-ink-300 font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="clip-btn px-5 py-2.5 bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase font-bold"
              >
                {isNewProd ? "Submit Product for Admin Approval" : "Save & Resubmit for Approval"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
