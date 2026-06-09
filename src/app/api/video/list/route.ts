import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  try {
    // FAILED dışındaki videoları oluşturulma tarihine göre azalan şekilde getir
    const videos = await prisma.video.findMany({
      where: {
        NOT: {
          url: "FAILED",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Videoları listelerken hata oluştu:", error);
    return NextResponse.json(
      { error: "Videolar listelenirken sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
