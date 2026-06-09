import React from "react";
import { prisma } from "@/shared/lib/prisma";
import { Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AdminDashboard } from "./components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  
  // Check if current session email is an authorized Google admin
  const isGoogleAdmin = !!(session?.user?.email && (adminEmails.includes(session.user.email.toLowerCase()) || adminEmails[0] === ""));

  let userCount = 0;
  let videoCount = 0;
  let allUsers: any[] = [];
  let dbError: string | null = null;

  // Attempt database queries safely so a database connection error won't crash the server component.
  try {
    userCount = await prisma.user.count();
    videoCount = await prisma.video.count();

    allUsers = await prisma.user.findMany({
      orderBy: { email: 'asc' },
    });
  } catch (err: any) {
    console.error("Database connection error in Admin page:", err);
    dbError = err.message || "Veritabanı bağlantı hatası. .env dosyasındaki DATABASE_URL'i kontrol edin.";
  }

  const stats = {
    userCount,
    videoCount,
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500" />
          İlanX Yönetim Paneli
        </h1>

        {dbError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-sm mb-6">
            <strong>⚠️ Veritabanı Bağlantı Hatası:</strong> {dbError}
          </div>
        )}

        {/* Modüler Sekmeli Dashboard */}
        <AdminDashboard 
          initialStats={stats} 
          initialUsers={allUsers} 
          isGoogleAdmin={isGoogleAdmin}
          dbError={!!dbError}
        />

      </div>
    </div>
  );
}
