import { NextResponse } from "next/server";
import { verifyJwt } from "@/core/lib/jwt";
import { findLicenseByKey } from "@/core/db/license-db";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ valid: false, error: "Yetkilendirme başlığı eksik." }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyJwt(token);

    if (!payload || !payload.licenseKey) {
      return NextResponse.json({ valid: false, error: "Geçersiz veya süresi dolmuş oturum." }, { status: 401 });
    }

    // Double check with database status to prevent offline token bypasses of revoked keys
    const license = findLicenseByKey(payload.licenseKey);
    if (!license) {
      return NextResponse.json({ valid: false, error: "Lisans bulunamadı." }, { status: 403 });
    }

    if (license.status !== "active") {
      return NextResponse.json({ valid: false, error: `Lisans aktif değil: ${license.status}` }, { status: 403 });
    }

    // Check expiry
    const expiry = new Date(license.expiresAt);
    if (isNaN(expiry.getTime()) || expiry < new Date()) {
      return NextResponse.json({ valid: false, error: "Lisans süresi dolmuş." }, { status: 403 });
    }

    return NextResponse.json({
      valid: true,
      status: license.status,
      expiresAt: license.expiresAt,
    });
  } catch (err) {
    console.error("Error in status check API:", err);
    return NextResponse.json({ valid: false, error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}
