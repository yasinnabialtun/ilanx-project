import React from "react";
import { prisma } from "@/shared/lib/prisma";
import { Activity } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  
  if (!session || !session.user?.email || (!adminEmails.includes(session.user.email.toLowerCase()) && adminEmails[0] !== "")) {
    redirect("/");
  }

  // 1. Veritabanından İstatistikleri Çek
  const userCount = await prisma.user.count();
  const videoCount = await prisma.video.count();
  
  const users = await prisma.user.findMany({
    select: { credits: true }
  });
  const totalCreditsInSystem = users.reduce((acc, user) => acc + user.credits, 0);

  const stats = {
    userCount,
    videoCount,
    totalCreditsInSystem,
  };

  // 2. Sistemdeki Tüm Kullanıcıları Çek
  const allUsers = await prisma.user.findMany({
    orderBy: { email: 'asc' },
  });

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500" />
          İlanX Yönetim Paneli
        </h1>

        {/* Modüler Sekmeli Dashboard */}
        <AdminDashboard initialStats={stats} initialUsers={allUsers} />

      </div>
    </div>
  );
}
