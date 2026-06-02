"use client";

import React, { useState } from "react";
import { Save, Check, X } from "lucide-react";

interface UserData {
  email: string | null;
  name: string | null;
  image: string | null;
  credits: number;
}

export function UserTable({ initialUsers }: { initialUsers: UserData[] }) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleCreditChange = (email: string | null, value: string) => {
    if (!email) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, credits: parseInt(value) || 0 } : u
      )
    );
  };

  const saveCredits = async (email: string | null, newCredits: number) => {
    if (!email) return;
    setLoadingEmail(email);
    try {
      const res = await fetch("/api/admin/users/update-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: email, newCredits }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Hata: " + data.error);
      }
    } catch (err) {
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Müşteri ve Kredi Yönetimi</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="text-xs text-white/40 uppercase bg-black/20">
            <tr>
              <th className="px-6 py-4 rounded-tl-lg">İsim</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4 rounded-tr-lg">Kredi (Düzenle)</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  {u.image && <img src={u.image} alt="Avatar" className="w-8 h-8 rounded-full" />}
                  {u.name || "İsimsiz"}
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={u.credits}
                      onChange={(e) => handleCreditChange(u.email, e.target.value)}
                      className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      onClick={() => saveCredits(u.email, u.credits)}
                      disabled={loadingEmail === u.email}
                      className="p-1.5 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 rounded-lg transition-colors disabled:opacity-50"
                      title="Kaydet"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-white/40">Henüz kullanıcı yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
