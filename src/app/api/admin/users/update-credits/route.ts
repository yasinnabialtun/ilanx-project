import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "ilanx_admin_secret_key_2026_super_secure";

async function isAuthorized(req: Request) {
  const secretHeader = req.headers.get("x-admin-secret");
  if (secretHeader === ADMIN_SECRET) {
    return true;
  }
  const session = await getServerSession(authOptions);
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
  if (session && session.user?.email && (adminEmails.includes(session.user.email.toLowerCase()) || adminEmails[0] === "")) {
    return true;
  }
  return false;
}

export async function GET(req: Request) {
  try {
    if (!await isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCount = await prisma.user.count();
    const videoCount = await prisma.video.count();
    const allUsers = await prisma.user.findMany({
      orderBy: { email: 'asc' },
    });

    return NextResponse.json({
      success: true,
      stats: { userCount, videoCount },
      users: allUsers,
    });
  } catch (error: any) {
    console.error("Admin Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}