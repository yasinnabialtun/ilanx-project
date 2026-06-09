"use client";

import React from "react";

interface UserData {
  email: string | null;
  name: string | null;
  image: string | null;
}

export function UserTable({ initialUsers }: { initialUsers: UserData[] }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Kullanıcı Listesi</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/70">
          <thead className="text-xs text-white/40 uppercase bg-black/20">
            <tr>
              <th className="px-6 py-4 rounded-tl-lg">İsim</th>
              <th className="px-6 py-4 rounded-tr-lg">Email</th>
            </tr>
          </thead>
          <tbody>
            {initialUsers.map((u, idx) => (
              <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                  {u.image && <img src={u.image} alt="Avatar" className="w-8 h-8 rounded-full" />}
                  {u.name || "İsimsiz"}
                </td>
                <td className="px-6 py-4">{u.email}</td>
              </tr>
            ))}
            {initialUsers.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-white/40">Henüz kullanıcı yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}