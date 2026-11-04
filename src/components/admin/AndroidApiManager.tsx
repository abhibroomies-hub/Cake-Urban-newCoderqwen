import React, { useState } from "react";
import { useStore } from "../../lib/store";
import type { AndroidApiKey } from "../../data/catalog";
import { Ic } from "../ui";

const SAMPLE_ENDPOINTS = [
  {
    label: "1. System & Sync Health Check",
    method: "GET",
    path: "/api/v1/health",
    desc: "Verify Android API gateway status, active partner count, and real-time sync latency.",
  },
  {
    label: "2. Live Bakery Catalog (Customer & Partner App)",
    method: "GET",
    path: "/api/v1/products",
    desc: "Fetch live approved 100% eggless cakes, cookies, hampers, stock counts, and prices.",
  },
  {
    label: "3. Partner Stores & ID Expiry Directory",
    method: "GET",
    path: "/api/v1/partners",
    desc: "List all registered partner bakeries, Gmail bindings, 30% commission rates, and ID expiry status.",
  },
  {
    label: "4. Partner Store Specific Dashboard (CUP-1001)",
    method: "GET",
    path: "/api/v1/partner/CUP-1001/dashboard",
    desc: "Fetch store-specific products, assigned delivery orders, ID lock state, and 70% net earnings.",
  },
  {
    label: "5. Live Orders & Partner Fulfillment Feed",
    method: "GET",
    path: "/api/v1/orders",
    desc: "Retrieve customer orders with 30% Admin commission and 70% Partner payout breakdown.",
  },
  {
    label: "6. Admin 30% Commission Financial Ledger",
    method: "GET",
    path: "/api/v1/commission-summary",
    desc: "Real-time financial aggregation of total Partner GMV, 30% CakeUrban profit, and 70% vendor payouts.",
  },
];

export function AndroidApiManager() {
  const { apiKeys, addApiKey, toggleApiKey, deleteApiKey, toast } = useStore();
  const [keyName, setKeyName] = useState("");
  const [appType, setAppType] = useState<AndroidApiKey["appType"]>("Partner Vendor App");
  const [selectedEndpoint, setSelectedEndpoint] = useState(SAMPLE_ENDPOINTS[0].path);
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<number | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testOutput, setTestOutput] = useState<string>("");
  const [activeCodeTab, setActiveCodeTab] = useState<"kotlin" | "curl">("kotlin");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.cakeurban.com";
  const activeKey = apiKeys.find((k) => k.active)?.key || "cu_live_android_admin_master_1a2b3c4d5e6f7a8b";

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) {
      toast("error", "Enter a label for the new Android API key");
      return;
    }
    const randomHex = Array.from({ length: 20 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const prefix =
      appType === "Customer Android App"
        ? "cust"
        : appType === "Partner Vendor App"
        ? "partner"
        : appType === "Delivery Rider App"
        ? "rider"
        : "admin";

    const newKey: AndroidApiKey = {
      id: `ak_${Date.now()}`,
      name: keyName.trim(),
      appType,
      key: `cu_live_android_${prefix}_${randomHex}`,
      scopes:
        appType === "Admin Command App"
          ? ["admin:all", "catalog:read", "orders:read", "orders:write", "partner:read", "partner:write"]
          : appType === "Partner Vendor App"
          ? ["catalog:read", "partner:read", "partner:write", "orders:read", "orders:write"]
          : ["catalog:read", "orders:read", "orders:write"],
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: "Never",
      active: true,
      requestsCount: 0,
    };
    addApiKey(newKey);
    setKeyName("");
  };

  const runLiveTest = async (endpointPath?: string) => {
    const target = endpointPath || selectedEndpoint;
    setSelectedEndpoint(target);
    setTestLoading(true);
    const t0 = performance.now();
    try {
      const res = await fetch(target, {
        headers: {
          "X-API-Key": activeKey,
          Accept: "application/json",
        },
      });
      const elapsed = Math.round(performance.now() - t0);
      setTestStatus(res.status);
      setTestLatency(elapsed);
      const data = await res.json();
      setTestOutput(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestStatus(500);
      setTestOutput(JSON.stringify({ error: err?.message || "Request failed" }, null, 2));
    } finally {
      setTestLoading(false);
    }
  };

  const copyText = (txt: string, label: string) => {
    navigator.clipboard?.writeText(txt);
    toast("success", `${label} copied to clipboard!`);
  };

  const kotlinSnippet = `// build.gradle.kts (Module :app)
// implementation("com.squareup.retrofit2:retrofit:2.11.0")
// implementation("com.squareup.retrofit2:converter-gson:2.11.0")

package com.cakeurban.android.network

import okhttp3.Interceptor
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

interface CakeUrbanApiService {
    @GET("api/v1/products")
    suspend fun getCatalog(@Query("category") category: String? = null): CatalogResponse

    @GET("api/v1/partner/{partnerId}/dashboard")
    suspend fun getPartnerDashboard(@Path("partnerId") partnerId: String): PartnerDashboardResponse

    @POST("api/v1/partner/{partnerId}/products")
    suspend fun uploadPartnerProduct(
        @Path("partnerId") partnerId: String,
        @Body product: PartnerProductRequest
    ): ApiMutationResponse

    @PATCH("api/v1/orders/{orderId}/status")
    suspend fun updateOrderStatus(
        @Path("orderId") orderId: String,
        @Body statusUpdate: OrderStatusPatch
    ): ApiMutationResponse
}

object CakeUrbanClient {
    private const val BASE_URL = "${baseUrl}/"
    private const val API_KEY = "${activeKey}"

    private val authInterceptor = Interceptor { chain ->
        val req = chain.request().newBuilder()
            .addHeader("X-API-Key", API_KEY)
            .addHeader("Accept", "application/json")
            .build()
        chain.proceed(req)
    }

    val api: CakeUrbanApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(OkHttpClient.Builder().addInterceptor(authInterceptor).build())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(CakeUrbanApiService::class.java)
    }
}`;

  const curlSnippet = `# 1. Fetch Live Products Catalog
curl -X GET "${baseUrl}/api/v1/products" \\
  -H "X-API-Key: ${activeKey}"

# 2. Fetch Partner Dashboard & Expiry Status (CUP-1001)
curl -X GET "${baseUrl}/api/v1/partner/CUP-1001/dashboard" \\
  -H "X-API-Key: ${activeKey}"

# 3. Upload New Product from Partner Android App (Requires Active Partner ID)
curl -X POST "${baseUrl}/api/v1/partner/CUP-1001/products" \\
  -H "X-API-Key: ${activeKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Belgian Choco Truffle 1KG","category":"Cakes","price":9.5,"stock":20,"img":"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800"}'`;

  return (
    <div className="space-y-6 anim-fade-up">
      {/* Top Overview Banner */}
      <div className="border border-cobalt-500/40 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 p-5 clip-tile">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-[10px] font-bold uppercase tracking-widest">
                ● ANDROID REST API GATEWAY v1.0 ONLINE
              </span>
              <span className="font-mono text-[10px] text-ink-400">
                JSON · CORS Enabled · Real-time Sync
              </span>
            </div>
            <h2 className="font-display text-2xl font-black uppercase mt-2 text-ink-50">
              Android App & API Integration Hub
            </h2>
            <p className="text-xs text-ink-300 mt-1 max-w-3xl">
              Connect your native Android applications (Customer APK, Partner Store APK, Delivery Rider APK, and Admin APK) directly to CakeUrban using authenticated `/api/v1/*` endpoints.
            </p>
          </div>
          <div className="bg-ink-950 border border-ink-700 p-3 rounded font-mono text-xs">
            <span className="text-[10px] text-ink-400 uppercase block">Production Base URL:</span>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-volt-400 font-bold">{baseUrl}/api/v1</code>
              <button
                onClick={() => copyText(`${baseUrl}/api/v1`, "Base API URL")}
                className="px-2 py-0.5 bg-ink-800 hover:bg-ink-700 text-ink-200 text-[10px] uppercase border border-ink-600"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Generate & Manage Android API Keys */}
      <div className="grid xl:grid-cols-[1fr_1.5fr] gap-5">
        <form
          onSubmit={handleGenerateKey}
          className="border border-ink-700/60 bg-ink-850 p-5 clip-tile space-y-4"
        >
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-blaze-400 font-bold">
            Generate New Android App Key
          </p>
          <div>
            <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
              Key Label / Device Build *
            </label>
            <input
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g. Partner Android App v2.4 Release"
              className="w-full bg-ink-950 border border-ink-600 focus:border-blaze-500 outline-none px-3 py-2.5 text-xs text-ink-100"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase text-ink-400 mb-1">
              Target Android Application Type
            </label>
            <select
              value={appType}
              onChange={(e) => setAppType(e.target.value as AndroidApiKey["appType"])}
              className="w-full bg-ink-950 border border-ink-600 outline-none px-3 py-2.5 font-mono text-xs text-ink-100"
            >
              <option value="Customer Android App">Customer Android App (Catalog + Checkout)</option>
              <option value="Partner Vendor App">Partner Vendor App (Menu Upload + Orders)</option>
              <option value="Delivery Rider App">Delivery Rider App (GPS + Order Status)</option>
              <option value="Admin Command App">Admin Command App (Full Master Access)</option>
            </select>
          </div>
          <button
            type="submit"
            className="clip-btn w-full bg-blaze-500 hover:bg-blaze-400 text-ink-50 font-mono text-xs uppercase tracking-wider py-3 font-bold transition-colors"
          >
            + Generate Live API Key
          </button>
        </form>

        <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-400 mb-3">
            Active Android API Keys ({apiKeys.length})
          </p>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className={`p-3.5 border bg-ink-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  k.active ? "border-ink-700" : "border-ink-800 opacity-50"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-sm text-ink-50">{k.name}</span>
                    <span className="px-2 py-0.5 bg-cobalt-500/20 text-cobalt-300 font-mono text-[9px] uppercase">
                      {k.appType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 font-mono text-xs">
                    <code className="text-gold-400 bg-ink-900 px-2 py-0.5 border border-ink-800 truncate">
                      {k.key}
                    </code>
                    <button
                      onClick={() => copyText(k.key, "API Key")}
                      className="text-[10px] text-blaze-400 hover:underline uppercase"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="font-mono text-[10px] text-ink-500 mt-1">
                    Scopes: {k.scopes.join(", ")} · {k.requestsCount.toLocaleString()} reqs
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleApiKey(k.id)}
                    className={`px-2.5 py-1 font-mono text-[10px] uppercase border ${
                      k.active
                        ? "border-emerald-500/50 text-emerald-400"
                        : "border-ink-600 text-ink-400"
                    }`}
                  >
                    {k.active ? "Active" : "Paused"}
                  </button>
                  <button
                    onClick={() => deleteApiKey(k.id)}
                    className="p-1.5 text-ink-500 hover:text-danger-400"
                  >
                    <Ic.trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Interactive Live Endpoint Tester */}
      <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-volt-400 font-bold">
              Interactive Android REST Endpoint Tester
            </p>
            <h3 className="font-display text-lg font-bold uppercase text-ink-50 mt-0.5">
              Test Live `/api/v1/*` Endpoints
            </h3>
          </div>
          <button
            onClick={() => runLiveTest()}
            disabled={testLoading}
            className="clip-btn bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase tracking-wider px-5 py-2.5 font-bold transition-colors"
          >
            {testLoading ? "Executing Request…" : "▶ Send Live API Request"}
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-4">
          <div className="space-y-2">
            {SAMPLE_ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                onClick={() => runLiveTest(ep.path)}
                className={`w-full text-left p-3 border transition-all ${
                  selectedEndpoint === ep.path
                    ? "border-blaze-500 bg-blaze-500/10"
                    : "border-ink-800 bg-ink-950 hover:border-ink-600"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-ink-100">{ep.label}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                    {ep.method}
                  </span>
                </div>
                <code className="block font-mono text-[11px] text-gold-400 mt-1">{ep.path}</code>
                <p className="text-[11px] text-ink-400 mt-0.5">{ep.desc}</p>
              </button>
            ))}
          </div>

          <div className="bg-ink-950 border border-ink-800 rounded flex flex-col h-[420px]">
            <div className="px-4 py-2.5 border-b border-ink-800 flex items-center justify-between font-mono text-xs">
              <span className="text-ink-300">
                GET <span className="text-volt-400">{selectedEndpoint}</span>
              </span>
              {testStatus !== null && (
                <span className="text-emerald-400 font-bold">
                  HTTP {testStatus} OK · {testLatency}ms
                </span>
              )}
            </div>
            <pre className="flex-1 p-4 overflow-auto font-mono text-[11px] text-emerald-300 leading-relaxed">
              {testOutput ||
                `// Click any endpoint on the left or press "Send Live API Request"\n// to inspect real-time JSON payload for the Android App.`}
            </pre>
          </div>
        </div>
      </div>

      {/* Section 3: Android Studio Kotlin / Retrofit Code Blueprint */}
      <div className="border border-ink-700/60 bg-ink-850 p-5 clip-tile">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-cobalt-300 font-bold">
              Android Studio SDK Integration
            </p>
            <h3 className="font-display text-lg font-bold uppercase text-ink-50">
              Ready-to-Paste Kotlin (Retrofit2 + OkHttp) & cURL
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCodeTab("kotlin")}
              className={`px-3 py-1.5 font-mono text-xs uppercase border ${
                activeCodeTab === "kotlin"
                  ? "border-blaze-500 bg-blaze-500 text-ink-50 font-bold"
                  : "border-ink-700 bg-ink-900 text-ink-300"
              }`}
            >
              Kotlin / Retrofit2
            </button>
            <button
              onClick={() => setActiveCodeTab("curl")}
              className={`px-3 py-1.5 font-mono text-xs uppercase border ${
                activeCodeTab === "curl"
                  ? "border-blaze-500 bg-blaze-500 text-ink-50 font-bold"
                  : "border-ink-700 bg-ink-900 text-ink-300"
              }`}
            >
              cURL Examples
            </button>
            <button
              onClick={() =>
                copyText(
                  activeCodeTab === "kotlin" ? kotlinSnippet : curlSnippet,
                  activeCodeTab === "kotlin" ? "Kotlin Retrofit code" : "cURL commands"
                )
              }
              className="px-3 py-1.5 bg-ink-900 hover:bg-ink-800 border border-ink-600 font-mono text-xs uppercase text-gold-400"
            >
              Copy Code
            </button>
          </div>
        </div>
        <pre className="bg-ink-950 border border-ink-800 p-4 overflow-x-auto font-mono text-xs text-ink-200 leading-relaxed">
          {activeCodeTab === "kotlin" ? kotlinSnippet : curlSnippet}
        </pre>
      </div>
    </div>
  );
}
