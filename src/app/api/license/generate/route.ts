import { NextResponse } from "next/server";
import { addLicense, License } from "@/core/db/license-db";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "ilanx_admin_secret_key_2026_super_secure";

function generateLicenseKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const genPart = (len: number) => {
    let part = "";
    const bytes = crypto.randomBytes(genPart.length);
    for (let i = 0; i < len; i++) {
      part += chars[bytes[i % bytes.length] % chars.length];
    }
    return part;
  };
  return `ILX-${genPart(4)}-${genPart(4)}-${genPart(4)}`;
}

export async function POST(req: Request) {
  const adminSecret = req.headers.get("x-admin-secret");

  if (adminSecret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Yetkisiz erişim. Admin anahtarı geçersiz." }, { status: 401 });
  }

  try {
    const { expiresInDays = 365, deviceLimit = 3 } = await req.json();

    const licenseKey = generateLicenseKey();
    
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + Number(expiresInDays));

    const newLicense: License = {
      id: uuidv4(),
      licenseKey,
      status: "active",
      expiresAt: expiresDate.toISOString().slice(0, 10), // YYYY-MM-DD
      createdAt: new Date().toISOString(),
      devices: [],
      deviceLimit: Number(deviceLimit),
    };

    addLicense(newLicense);

    return NextResponse.json({
      success: true,
      license: newLicense,
    });
  } catch (err) {
    console.error("Error in generate license route:", err);
    return NextResponse.json({ error: "Lisans üretilirken hata oluştu." }, { status: 500 });
  }
}
