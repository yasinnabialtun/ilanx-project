"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Video,
  FileText,
  Activity,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { UserTable } from "./user-table";
import { ContentEditor } from "@/features/admin/components/ContentEditor";
import { Button } from "@/shared/components/ui/button";

interface UserData {
  email: string | null;
  name: string | null;
  image: string | null;
}

interface AdminDashboardProps {
  initialStats: {
    userCount: number;
    videoCount: number;
  };
  initialUsers: UserData[];
  isGoogleAdmin: boolean;
  dbError: boolean;
}

export function AdminDashboard({ initialStats, initialUsers, isGoogleAdmin, dbError }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stats" | "cms">("stats");
  const [adminSecret, setAdminSecret] = useState("");

  // Custom states for DB resilience & Client login
  const [stats, setStats] = useState(initialStats);
  const [users, setUsers] = useState(initialUsers);
  const [isUnlocked, setIsUnlocked] = useState(isGoogleAdmin);
  const [unlockSecret, setUnlockSecret] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);

  // Verification and Dynamic Data Loading
  const verifyAndFetch = async (secret: string) => {
    if (!secret) return;
    setUnlocking(true);
    setUnlockError(null);
    try {
      // Verify adminSecret via users API (uses MySQL but still reachable with secret)
      const verifyRes = await fetch("/api/admin/users/update-credits", {
        method: "GET",
        headers: {
          "x-admin-secret": secret,
        },
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        setUnlockError(data.error || "Hatalı yönetici şifresi (ADMIN_SECRET).");
        setIsUnlocked(false);
        return;
      }

      // Secret is valid! Unlock Dashboard.
      setIsUnlocked(true);
      setAdminSecret(secret);
      localStorage.setItem("ilanx_admin_secret", secret);

      // Try to fetch stats/users from DB. If it fails, it will just show database error but dashboard remains unlocked.
      try {
        const data = await verifyRes.json();
        if (data.success) {
          setStats(data.stats);
          setUsers(data.users);
        }
      } catch (dbErr) {
        console.warn("Could not load users/stats due to DB failure", dbErr);
      }

    } catch {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGoogleAdmin]);

  // Save adminSecret to localStorage when changed
  const handleSecretChange = (val: string) => {
    setAdminSecret(val);
    localStorage.setItem("ilanx_admin_secret", val);
  };

  // If client-side secret is not verified and user is not a Google Admin, render a sleek password lock screen
  if (!isUnlocked) {
    return (
      <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md mx-auto text-center space-y-6 shadow-2xl relative overflow-hidden my-12">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
          <ShieldAlert className="w-8 h-8 text-indigo-400 -rotate-3" />
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
            CMS metinlerini düzenlemek için şifrenizi girmelisiniz.
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              {users.length > 0 && (
                <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                  <h3 className="text-base font-bold text-white mb-4">Son Kullanıcılar</h3>
                  <UserTable initialUsers={users} />
                </div>
              )}
            </div>
          )
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
