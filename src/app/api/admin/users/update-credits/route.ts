import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    
    if (!session || !session.user?.email || !adminEmails.includes(session.user.email.toLowerCase())) {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
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
