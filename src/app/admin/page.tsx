import React from "react";
import { prisma } from "@/shared/lib/prisma";
import { Users, Video, CreditCard, Activity, Lock } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { UserTable } from "./components/user-table";

// In Next.js App Router, we can force dynamic rendering for admin pages
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  
  if (!session || !session.user?.email || (!adminEmails.includes(session.user.email.toLowerCase()) && adminEmails[0] !== "")) {
    redirect("/");
  }
  // 1. Fetch Stats from DB
  const userCount = await prisma.user.count();
  const videoCount = await prisma.video.count();
  
  // Aggregate credits
  const users = await prisma.user.findMany({
    select: { credits: true }
  });
  const totalCreditsInSystem = users.reduce((acc, user) => acc + user.credits, 0);

  // Recent Users
  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { email: 'desc' }, // just a fallback since we don't have createdAt on User model right now
  });

  return (
    <div className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-500" />
          İlanX Yönetim Paneli
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white/80">Toplam Kullanıcı</h2>
            </div>
            <div className="text-4xl font-black text-white">{userCount}</div>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                <Video className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-white/80">Üretilen Video</h2>
            </div>
            <div className="text-4xl font-black text-white">{videoCount}</div>
          </div>

          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                <CreditCard className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white/80">Piyasadaki Kredi</h2>
            </div>
            <div className="text-4xl font-black text-white">{totalCreditsInSystem}</div>
          </div>

        </div>

        {/* Recent Users Table */}
        <UserTable initialUsers={recentUsers} />

      </div>
    </div>
  );
}
