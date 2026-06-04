"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Video, 
  CreditCard, 
  Key, 
  FileText, 
  Activity, 
  Settings, 
  ShieldAlert, 
  Plus, 
  RefreshCw, 
  Trash2, 
  PlusCircle,
  Copy,
  CheckCircle,
  RotateCcw,
  Calendar
} from "lucide-react";
import { UserTable } from "./user-table";
import { ContentEditor } from "@/features/admin/components/ContentEditor";
import { Button } from "@/shared/components/ui/button";

interface UserData {
  email: string | null;
  name: string | null;
  image: string | null;
  credits: number;
}

interface AdminDashboardProps {
  initialStats: {
    userCount: number;
    videoCount: number;
    totalCreditsInSystem: number;
  };
  initialUsers: UserData[];
  isGoogleAdmin: boolean;
  dbError: boolean;
}

export function AdminDashboard({ initialStats, initialUsers, isGoogleAdmin, dbError }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "credits" | "licenses" | "cms">("stats");
  const [adminSecret, setAdminSecret] = useState("");
  
  // Custom states for DB resilience & Client login
  const [stats, setStats] = useState(initialStats);
  const [users, setUsers] = useState(initialUsers);
  const [isUnlocked, setIsUnlocked] = useState(isGoogleAdmin);
  const [unlockSecret, setUnlockSecret] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // License Tab States
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  
  // Generate License Form States
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deviceLimit, setDeviceLimit] = useState(3);
  const [expiresInDays, setExpiresInDays] = useState(365);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Verification and Dynamic Data Loading
  const verifyAndFetch = async (secret: string) => {
    if (!secret) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      // 1. Verify adminSecret using licenses API (which uses JSON file and works even if MySQL is down)
      const verifyRes = await fetch("/api/license/revoke", {
        method: "GET",
        headers: {
          "x-admin-secret": secret,
        }
      });
      
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setUnlockError(data.error || "Hatalı yönetici şifresi (ADMIN_SECRET).");
        setIsUnlocked(false);
        return;
      }

      // Secret is valid! Unlock Dashboard.
      setIsUnlocked(true);
      setAdminSecret(secret);
      localStorage.setItem("ilanx_admin_secret", secret);

      // 2. Try to fetch stats/users from DB. If it fails, it will just show database error but dashboard remains unlocked!
      try {
        const res = await fetch("/api/admin/users/update-credits", {
          method: "GET",
          headers: {
            "x-admin-secret": secret,
          }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.stats);
          setUsers(data.users);
        }
      } catch (dbErr) {
        console.warn("Could not load users/stats due to DB failure", dbErr);
      }

    } catch (err: any) {
      setUnlockError("Sunucuya bağlanılamadı.");
      setIsUnlocked(false);
    } finally {
      setUnlocking(false);
    }
  };

  // Load adminSecret from localStorage on mount
  useEffect(() => {
    const savedSecret = localStorage.getItem("ilanx_admin_secret");
    if (savedSecret && !isGoogleAdmin) {
      verifyAndFetch(savedSecret);
    } else if (savedSecret) {
      setAdminSecret(savedSecret);
    }
  }, [isGoogleAdmin]);

  // Save adminSecret to localStorage when changed
  const handleSecretChange = (val: string) => {
    setAdminSecret(val);
    localStorage.setItem("ilanx_admin_secret", val);
  };

  // Fetch all licenses
  const fetchLicenses = async () => {
    if (!adminSecret) {
      setLicenseError("Lisansları listelemek için lütfen Yönetici Şifresi girin.");
      return;
    }
    setLoadingLicenses(true);
    setLicenseError(null);
    try {
      const res = await fetch("/api/license/revoke", {
        method: "GET",
        headers: {
          "x-admin-secret": adminSecret,
        },
      });
      const data = await res.json();
      if (res.ok && data.licenses) {
        setLicenses(data.licenses);
      } else {
        setLicenseError(data.error || "Lisans listesi alınamadı. Şifreyi kontrol edin.");
      }
    } catch (err) {
      setLicenseError("Bağlantı hatası oluştu.");
    } finally {
      setLoadingLicenses(false);
    }
  };

  // Auto-fetch licenses when switching to licenses tab if secret is filled
  useEffect(() => {
    if (activeTab === "licenses" && adminSecret) {
      fetchLicenses();
    }
  }, [activeTab, adminSecret]);

  // Generate License Key
  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSecret) {
      alert("Lisans üretmek için önce Yönetici Şifresi girmelisiniz.");
      return;
    }
    setGenerating(true);
    setNewlyCreatedKey(null);
    try {
      const res = await fetch("/api/license/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          deviceLimit,
          expiresInDays,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewlyCreatedKey(data.license.licenseKey);
        setCustomerName("");
        setCustomerPhone("");
        // Reload licenses list
        fetchLicenses();
      } else {
        alert("Hata: " + (data.error || "Lisans üretilemedi."));
      }
    } catch (err) {
      alert("Lisans üretilirken bağlantı hatası oluştu.");
    } finally {
      setGenerating(false);
    }
  };

  // Revoke License
  const handleRevokeLicense = async (id: string) => {
    if (!confirm("Bu lisansı iptal etmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/license/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Lisans başarıyla iptal edildi.");
        fetchLicenses();
      } else {
        alert("Hata: " + (data.error || "Lisans iptal edilemedi."));
      }
    } catch (err) {
      alert("Lisans iptal edilirken hata oluştu.");
    }
  };

  // Reset Devices
  const handleResetDevices = async (id: string) => {
    if (!confirm("Lisansın bağlı olduğu cihazları sıfırlamak istiyor musunuz?")) return;
    try {
      const res = await fetch("/api/license/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ id, resetDevices: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Cihazlar sıfırlandı.");
        fetchLicenses();
      } else {
        alert("Hata: " + (data.error || "Cihazlar sıfırlanamadı."));
      }
    } catch (err) {
      alert("Cihazlar sıfırlanırken hata oluştu.");
    }
  };

  // Extend License Expiry (Add 30 Days)
  const handleExtendExpiry = async (id: string) => {
    try {
      const res = await fetch("/api/license/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ id, addDays: 30 }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Lisans süresi +30 gün uzatıldı.");
        fetchLicenses();
      } else {
        alert("Hata: " + (data.error || "Süre uzatılamadı."));
      }
    } catch (err) {
      alert("Lisans süresi uzatılırken hata oluştu.");
    }
  };

  // If client-side secret is not verified and user is not a Google Admin, render a sleek password lock screen
  if (!isUnlocked) {
    return (
      <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md mx-auto text-center space-y-6 shadow-2xl relative overflow-hidden my-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
          <Key className="w-8 h-8 text-indigo-400 -rotate-3" />
        </div>
        <h2 className="text-xl font-bold text-white">Yönetici Girişi</h2>
        <p className="text-sm text-white/60">
          İlanX yönetim paneline erişmek için lütfen Yönetici Şifresini (ADMIN_SECRET) girin.
        </p>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            verifyAndFetch(unlockSecret);
          }}
          className="space-y-4"
        >
          <input
            type="password"
            required
            value={unlockSecret}
            onChange={(e) => setUnlockSecret(e.target.value)}
            placeholder="Yönetici şifresini girin..."
            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-center"
          />
          {unlockError && (
            <p className="text-xs text-red-400 font-semibold">{unlockError}</p>
          )}
          <Button 
            type="submit" 
            disabled={unlocking}
            className="w-full h-12 bg-white text-black hover:bg-white/90 font-bold rounded-xl"
          >
            {unlocking ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : "Giriş Yap"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Secret Verification Bar */}
      <div className="bg-neutral-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-400" />
            Yönetici Doğrulama Şifresi
          </h2>
          <p className="text-xs text-white/50">
            CMS metinlerini düzenlemek ve lisans işlemleri yapmak için şifrenizi girmelisiniz.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => handleSecretChange(e.target.value)}
            placeholder="ADMIN_SECRET değerini girin"
            className="w-full md:w-80 bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/10 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "stats"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/[0.02]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          Genel Özet
        </button>
        <button
          onClick={() => setActiveTab("credits")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "credits"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/[0.02]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Müşteri Kredi Yönetimi
        </button>
        <button
          onClick={() => setActiveTab("licenses")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "licenses"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/[0.02]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Key className="w-4 h-4" />
          Lisans Yönetimi
        </button>
        <button
          onClick={() => setActiveTab("cms")}
          className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === "cms"
              ? "border-indigo-500 text-indigo-400 bg-indigo-500/[0.02]"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          Landing Sayfa Editörü
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {/* STATS TAB */}
        {activeTab === "stats" && (
          dbError ? (
            <div className="py-8 text-center text-white/40 border border-white/10 rounded-2xl bg-neutral-900">
              <ShieldAlert className="w-10 h-10 text-red-500 mx-auto animate-pulse mb-3" />
              <h4 className="font-bold text-white text-base">İstatistikler Yüklenemedi</h4>
              <p className="text-xs max-w-sm mx-auto mt-1">Veritabanı bağlantı hatası oluştuğu için bu istatistikler alınamıyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <Users className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-white/60 text-sm font-medium">Toplam Kullanıcı</h3>
                </div>
                <div className="text-4xl font-black text-white">{stats.userCount}</div>
              </div>

              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-white/60 text-sm font-medium">Üretilen Video</h3>
                </div>
                <div className="text-4xl font-black text-white">{stats.videoCount}</div>
              </div>

              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                    <CreditCard className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-white/60 text-sm font-medium">Piyasadaki Toplam Kredi</h3>
                </div>
                <div className="text-4xl font-black text-white">{stats.totalCreditsInSystem}</div>
              </div>
            </div>
          )
        )}

        {/* CREDITS TAB */}
        {activeTab === "credits" && (
          dbError ? (
            <div className="py-12 text-center text-white/40 space-y-4 border border-white/10 rounded-2xl bg-neutral-900">
              <ShieldAlert className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
              <h4 className="font-bold text-white text-lg">Veritabanı Bağlantısı Bulunmuyor</h4>
              <p className="text-sm max-w-md mx-auto">
                Kullanıcı listesi ve kredi yönetimi için aktif bir veritabanı bağlantısı gereklidir. Lütfen sunucudaki .env dosyasında DATABASE_URL değişkeninin doğru yapılandırıldığından emin olun.
              </p>
            </div>
          ) : (
            <UserTable initialUsers={users} />
          )
        )}

        {/* LICENSES TAB */}
        {activeTab === "licenses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Generate License Form */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 h-fit space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-400" />
                  Yeni Lisans Üret
                </h3>
                <p className="text-xs text-white/50 mt-1">Görsel/Video düzenleyici için offline lisans anahtarı oluşturun.</p>
              </div>

              <form onSubmit={handleGenerateLicense} className="space-y-4">
                <label className="block space-y-1.5">
                  <span className="text-xs text-white/60 font-medium">Müşteri Adı</span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs text-white/60 font-medium">Müşteri Telefonu</span>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Örn: 05551234567"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs text-white/60 font-medium">Cihaz Limiti</span>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={deviceLimit}
                      onChange={(e) => setDeviceLimit(parseInt(e.target.value) || 3)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs text-white/60 font-medium">Geçerlilik (Gün)</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 365)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </label>
                </div>

                <Button 
                  type="submit" 
                  disabled={generating || !adminSecret}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 font-bold gap-2 text-white mt-2"
                >
                  {generating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Lisans Anahtarı Üret
                </Button>
              </form>

              {newlyCreatedKey && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-2 animate-in fade-in duration-300">
                  <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    Lisans Başarıyla Üretildi!
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/20 rounded-lg p-2.5">
                    <code className="text-xs text-white font-mono font-bold flex-1 select-all">{newlyCreatedKey}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(newlyCreatedKey);
                        alert("Lisans anahtarı kopyalandı!");
                      }}
                      className="p-1 hover:bg-emerald-500/20 rounded-md text-emerald-400"
                      title="Kopyala"
                    >
                      <Copy className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Licenses Table / List */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Lisans Havuzu</h3>
                  <p className="text-xs text-white/50">Mevcut lisansları listeleyin, iptal edin veya sürelerini uzatın.</p>
                </div>
                <button
                  onClick={fetchLicenses}
                  disabled={loadingLicenses || !adminSecret}
                  className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-white/80 hover:text-white transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLicenses ? 'animate-spin' : ''}`} />
                  Yenile
                </button>
              </div>

              {licenseError && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-xl text-xs">
                  {licenseError}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-white/70">
                  <thead className="text-[10px] text-white/40 uppercase bg-black/20">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Lisans Anahtarı</th>
                      <th className="px-4 py-3">Müşteri</th>
                      <th className="px-4 py-3">Cihazlar</th>
                      <th className="px-4 py-3">Durum</th>
                      <th className="px-4 py-3">Son Gün</th>
                      <th className="px-4 py-3 rounded-tr-lg text-right">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.map((l) => (
                      <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-white select-all">{l.licenseKey}</td>
                        <td className="px-4 py-3 max-w-[120px] truncate">
                          <div className="font-semibold text-white/90">{l.customerName || "-"}</div>
                          <div className="text-[10px] text-white/40">{l.customerPhone || "-"}</div>
                        </td>
                        <td className="px-4 py-3">
                          {l.devices?.length || 0} / {l.deviceLimit}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === "active" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : l.status === "revoked"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-white/5 text-white/50 border border-white/10"
                          }`}>
                            {l.status === "active" ? "Aktif" : l.status === "revoked" ? "İptal" : "Süresi Dolmuş"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{l.expiresAt}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {l.status === "active" && (
                              <>
                                <button
                                  onClick={() => handleResetDevices(l.id)}
                                  className="p-1.5 bg-yellow-500/10 hover:bg-yellow-500/25 border border-yellow-500/20 text-yellow-400 rounded-md transition"
                                  title="Cihazları Sıfırla"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleExtendExpiry(l.id)}
                                  className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-md transition"
                                  title="Süreyi Uzat (+30 Gün)"
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRevokeLicense(l.id)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 rounded-md transition"
                                  title="İptal Et"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {licenses.length === 0 && !loadingLicenses && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-white/40">Henüz üretilmiş lisans bulunmuyor.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* CMS TAB */}
        {activeTab === "cms" && (
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
            {adminSecret ? (
              <ContentEditor adminSecret={adminSecret} />
            ) : (
              <div className="py-12 text-center text-white/40 space-y-4">
                <ShieldAlert className="w-12 h-12 text-yellow-500 mx-auto" />
                <h4 className="font-bold text-white text-lg">Yönetici Yetkilendirmesi Gerekli</h4>
                <p className="text-sm max-w-md mx-auto">
                  Landing sayfasındaki metin ve görselleri düzenlemek için sayfanın en üstündeki giriş kutusuna doğru Yönetici Şifresini (ADMIN_SECRET) yazmalısınız.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
