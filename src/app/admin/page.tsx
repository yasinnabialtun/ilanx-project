"use client";

import { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, Sparkles, Plus, Trash2, Calendar, HardDrive, RefreshCw, Type, Key } from "lucide-react";
import Link from "next/link";
import { ContentEditor } from "@/features/admin/components/ContentEditor";

type License = {
  id: string;
  licenseKey: string;
  status: "active" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  devices: string[];
  deviceLimit: number;
  customerName?: string;
};

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [durationDays, setDurationDays] = useState(365);
  const [deviceLimit, setDeviceLimit] = useState(3);
  const [customerName, setCustomerName] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"licenses" | "content">("licenses");

  // Load admin secret from localStorage if it exists
  useEffect(() => {
    const saved = localStorage.getItem("ilanx_admin_secret");
    if (saved) {
      setAdminSecret(saved);
      verifyAdmin(saved);
    }
  }, []);

  const verifyAdmin = async (secret: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/license/revoke", {
        headers: { "x-admin-secret": secret },
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthorized(true);
        setLicenses(data.licenses || []);
        localStorage.setItem("ilanx_admin_secret", secret);
      } else {
        setErrorMsg(data.error || "Şifre doğrulanamadı.");
        setIsAuthorized(false);
      }
    } catch {
      setErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    verifyAdmin(adminSecret);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    try {
      const res = await fetch("/api/license/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          expiresInDays: durationDays,
          deviceLimit: deviceLimit,
          customerName: customerName.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInfoMsg(`Lisans başarıyla üretildi: ${data.license.licenseKey}`);
        setLicenses([data.license, ...licenses]);
        setCustomerName(""); // Reset after success
      } else {
        setErrorMsg(data.error || "Lisans üretilemedi.");
      }
    } catch {
      setErrorMsg("Lisans üretilirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Bu lisansı iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/license/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setLicenses(licenses.map((l) => (l.id === id ? { ...l, status: "revoked" as const } : l)));
        setInfoMsg("Lisans başarıyla iptal edildi.");
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Lisans iptal edilemedi.");
      }
    } catch {
      setErrorMsg("Lisans iptal edilirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ilanx_admin_secret");
    setAdminSecret("");
    setIsAuthorized(false);
    setLicenses([]);
  };

  const getExpirationInfo = (expiresAt: string, status: string) => {
    if (status !== "active") return null;
    const expiry = new Date(expiresAt);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = expiry.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { text: "Süresi Doldu", class: "text-red-400 bg-red-500/10 border border-red-500/20" };
    if (days === 0) return { text: "Bugün Bitiyor!", class: "text-rose-400 bg-rose-500/10 border border-rose-500/20 animate-pulse font-semibold" };
    if (days === 1) return { text: "Yarın Bitiyor!", class: "text-rose-400 bg-rose-500/10 border border-rose-500/20 animate-pulse font-semibold" };
    if (days <= 7) return { text: `${days} gün kaldı (Yakında!)`, class: "text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold" };
    return { text: `${days} gün kaldı`, class: "text-zinc-500 border border-zinc-900 bg-zinc-900/20" };
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        {/* Background effects */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />
        
        <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold text-white">İlanX Admin Girişi</h1>
            <p className="text-xs text-zinc-500 mt-1">Lisans yönetim paneline erişmek için yetkilendirme şifresini girin.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin Secret Key"
              value={adminSecret}
              onChange={(e) => setAdminSecret(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center text-sm text-white placeholder-zinc-700 focus:border-cyan-500/50 focus:outline-none"
            />
            {errorMsg && (
              <p className="text-center text-xs text-red-400 font-medium">{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white hover:bg-cyan-600 active:scale-95 transition-all cursor-pointer"
            >
              {isLoading ? "Doğrulanıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative pb-12">
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary neon-cyan">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-primary-foreground" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l10 10-10 10L2 12 12 2z" />
              </svg>
            </Link>
            <h1 className="text-base font-bold">İlanX Lisans Kontrol Paneli</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/editor" className="rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-semibold">
              Editörü Aç
            </Link>
            <button onClick={handleLogout} className="rounded-lg bg-red-950/30 text-red-400 border border-red-900/40 hover:bg-red-950/50 px-3.5 py-1.5 text-xs font-semibold cursor-pointer">
              Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative">
        {/* Messages */}
        {infoMsg && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400">
            {infoMsg}
          </div>
        )}
        {errorMsg && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
          <button
            onClick={() => setActiveTab("licenses")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "licenses" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent"
            }`}
          >
            <Key className="size-4" /> Lisans Yönetimi
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "content" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border border-transparent"
            }`}
          >
            <Type className="size-4" /> Site Metinleri (CMS)
          </button>
        </div>

        {activeTab === "licenses" ? (
          <>
            {/* Stats Dashboard */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-4 backdrop-blur-md flex flex-col justify-between">
            <span className="text-xs text-zinc-500 font-medium">Aktif Lisanslar</span>
            <span className="text-2xl font-bold text-emerald-400 mt-2">
              {licenses.filter((l) => l.status === "active").length}
            </span>
          </div>
          
          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-4 backdrop-blur-md flex flex-col justify-between">
            <span className="text-xs text-zinc-500 font-medium">Bitişi Yaklaşanlar (≤ 7 Gün)</span>
            <span className="text-2xl font-bold text-amber-400 mt-2">
              {licenses.filter((l) => {
                if (l.status !== "active") return false;
                const diff = new Date(l.expiresAt).getTime() - new Date().getTime();
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                return days >= 0 && days <= 7;
              }).length}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-4 backdrop-blur-md flex flex-col justify-between">
            <span className="text-xs text-zinc-500 font-medium">Süresi Dolanlar</span>
            <span className="text-2xl font-bold text-amber-500/80 mt-2">
              {licenses.filter((l) => {
                if (l.status === "expired") return true;
                if (l.status === "active") {
                  return new Date(l.expiresAt).getTime() < new Date().getTime();
                }
                return false;
              }).length}
            </span>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-900/20 p-4 backdrop-blur-md flex flex-col justify-between">
            <span className="text-xs text-zinc-500 font-medium">İptal Edilenler</span>
            <span className="text-2xl font-bold text-red-500/80 mt-2">
              {licenses.filter((l) => l.status === "revoked").length}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Generate Panel */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 space-y-5 h-fit backdrop-blur-md">
            <h3 className="text-sm font-bold flex items-center gap-2 text-cyan-400">
              <Plus className="size-4" /> Yeni Lisans Oluştur
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs text-zinc-400">Geçerlilik Süresi (Gün)</span>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-zinc-400">Cihaz Sınırı (Max)</span>
                <input
                  type="number"
                  value={deviceLimit}
                  onChange={(e) => setDeviceLimit(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-cyan-500/50 focus:outline-none"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs text-zinc-400">Müşteri / Kurum Adı (İsteğe Bağlı)</span>
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-700 focus:border-cyan-500/50 focus:outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-cyan-500 py-2.5 text-xs font-semibold text-white hover:bg-cyan-600 transition-all cursor-pointer"
              >
                Yeni Lisans Anahtarı Üret
              </button>
            </form>
          </div>

          {/* Licenses List Panel */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-900 bg-zinc-900/40 p-6 space-y-5 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-300">
                <KeyRound className="size-4 text-cyan-400" /> Üretilen Lisanslar ({licenses.length})
              </h3>
              <button
                onClick={() => verifyAdmin(adminSecret)}
                className="text-xs text-zinc-500 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="size-3 animate-spin" /> Yenile
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {licenses.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">Kayıtlı lisans bulunamadı.</p>
              ) : (
                licenses.map((lic) => (
                  <div
                    key={lic.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-900/80 bg-zinc-950/60 hover:border-zinc-800 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white select-all">{lic.licenseKey}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                            lic.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : lic.status === "expired"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {lic.status === "active" ? "Aktif" : lic.status === "expired" ? "Süresi Doldu" : "İptal Edildi"}
                        </span>
                      </div>
                      {lic.customerName && (
                        <div className="text-xs font-medium text-cyan-400/80 mb-1">
                          👤 Müşteri: {lic.customerName}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-[10px] text-zinc-400">
                        <span className="flex items-center gap-1"><Calendar className="size-3" /> Son Gün: {lic.expiresAt}</span>
                        {lic.status === "active" && (() => {
                          const info = getExpirationInfo(lic.expiresAt, lic.status);
                          return info ? (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${info.class}`}>
                              {info.text}
                            </span>
                          ) : null;
                        })()}
                        <span className="flex items-center gap-1"><HardDrive className="size-3" /> Cihaz: {lic.devices.length}/{lic.deviceLimit}</span>
                      </div>
                    </div>

                    {lic.status === "active" && (
                      <button
                        onClick={() => handleRevoke(lic.id)}
                        className="rounded-lg bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 text-red-400 p-2 text-xs flex items-center justify-center gap-1.5 transition-colors self-end sm:self-auto cursor-pointer"
                        title="İptal Et"
                      >
                        <Trash2 className="size-3.5" />
                        İptal Et
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        </>
        ) : (
          <ContentEditor adminSecret={adminSecret} />
        )}
      </main>
    </div>
  );
}
