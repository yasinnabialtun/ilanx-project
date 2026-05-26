import { NextResponse } from "next/server";
import { contentDb } from "@/core/db/content-db";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "ilanx_admin_secret_key_2026_super_secure";

// GET: Read current content
export async function GET() {
  try {
    const data = contentDb.get();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Content GET error:", error);
    return NextResponse.json({ error: "İçerik okunamadı" }, { status: 500 });
  }
}

// POST: Update content (Requires admin secret)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminSecret, data } = body;

    if (adminSecret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    if (!data) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    contentDb.save(data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Content POST error:", error);
    return NextResponse.json({ error: "İçerik güncellenemedi" }, { status: 500 });
  }
}
