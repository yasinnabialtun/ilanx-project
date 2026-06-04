import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Yetkisiz erişim. Oturum açın." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // FAILED dışındaki videoları oluşturulma tarihine göre azalan şekilde getir
    const videos = await prisma.video.findMany({
      where: {
        userId: user.id,
        NOT: {
          url: "FAILED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Geçmiş videoları çekerken hata oluştu:", error);
    return NextResponse.json(
      { error: "Videolar listelenirken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
