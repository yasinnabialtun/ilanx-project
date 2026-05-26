import { NextResponse } from "next/server";
import { findLicenseByKey, updateLicense, readLicenses, writeLicenses } from "@/core/db/license-db";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "ilanx_admin_secret_key_2026_super_secure";

export async function POST(req: Request) {
  const adminSecret = req.headers.get("x-admin-secret");

  if (adminSecret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Yetkisiz erişim. Admin anahtarı geçersiz." }, { status: 401 });
  }

  try {
    const { licenseKey, id } = await req.json();

    if (id) {
      const licenses = readLicenses();
      const license = licenses.find((l) => l.id === id);
      if (!license) {
        return NextResponse.json({ error: "Lisans bulunamadı." }, { status: 404 });
      }
      license.status = "revoked";
      writeLicenses(licenses);
      return NextResponse.json({ success: true, license });
    }

    if (licenseKey) {
      const license = findLicenseByKey(licenseKey.toUpperCase().trim());
      if (!license) {
        return NextResponse.json({ error: "Lisans bulunamadı." }, { status: 404 });
      }
      license.status = "revoked";
      updateLicense(license);
      return NextResponse.json({ success: true, license });
    }

    return NextResponse.json({ error: "Lisans anahtarı veya kimliği gereklidir." }, { status: 400 });
  } catch (err) {
    console.error("Error in revoke license route:", err);
    return NextResponse.json({ error: "Lisans iptal edilirken hata oluştu." }, { status: 500 });
  }
}
export async function GET(req: Request) {
  // Bonus: Let admin fetch list of all licenses
  const adminSecret = req.headers.get("x-admin-secret");

  if (adminSecret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  try {
    const licenses = readLicenses();
    return NextResponse.json({ licenses });
  } catch {
    return NextResponse.json({ error: "Listelenemedi" }, { status: 500 });
  }
}
