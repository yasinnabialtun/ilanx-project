import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "ilanx_admin_secret_key_2026_super_secure";

function isAuthorized(req: Request): boolean {
  return req.headers.get("x-admin-secret") === ADMIN_SECRET;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
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
