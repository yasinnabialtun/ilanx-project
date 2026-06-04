import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "ilanx_admin_secret_key_2026_super_secure";

// Helper function to check authorization (either Google Session or Admin Secret header)
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
      return NextResponse.json({ error: "Unauthorized. Admin credentials required." }, { status: 401 });
    }

    const userCount = await prisma.user.count();
    const videoCount = await prisma.video.count();
    const allUsers = await prisma.user.findMany({
      orderBy: { email: 'asc' },
    });
    const totalCreditsInSystem = allUsers.reduce((acc, user) => acc + user.credits, 0);

    return NextResponse.json({
      success: true,
      stats: {
        userCount,
        videoCount,
        totalCreditsInSystem,
      },
      users: allUsers
    });
  } catch (error: any) {
    console.error("Admin Fetch Users/Stats Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!await isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { userEmail, newCredits } = await req.json();

    if (!userEmail || typeof newCredits !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { credits: newCredits },
    });

    return NextResponse.json({ success: true, credits: updatedUser.credits });
  } catch (error) {
    console.error("Admin Update Credits Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
