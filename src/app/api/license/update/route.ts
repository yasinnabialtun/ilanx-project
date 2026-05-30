import { NextResponse } from "next/server";
import { readLicenses, writeLicenses, updateLicense } from "@/core/db/license-db";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "ilanx_admin_secret_key_2026_super_secure";

export async function POST(req: Request) {
  const adminSecret = req.headers.get("x-admin-secret");

  if (adminSecret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Yetkisiz erişim. Admin anahtarı geçersiz." }, { status: 401 });
  }

  try {
    const { id, expiresAt, deviceLimit, status, customerName, customerPhone, resetDevices, addDays } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Lisans ID gereklidir." }, { status: 400 });
    }

    const licenses = readLicenses();
    const license = licenses.find((l) => l.id === id);

    if (!license) {
      return NextResponse.json({ error: "Lisans bulunamadı." }, { status: 404 });
    }

    // Extend days if requested
    if (addDays && !isNaN(Number(addDays))) {
      const currentExpiry = new Date(license.expiresAt);
      const baseDate = isNaN(currentExpiry.getTime()) || currentExpiry < new Date() ? new Date() : currentExpiry;
      baseDate.setDate(baseDate.getDate() + Number(addDays));
      license.expiresAt = baseDate.toISOString().slice(0, 10);
    } else if (expiresAt) {
      license.expiresAt = expiresAt;
    }

    if (deviceLimit !== undefined) {
      license.deviceLimit = Number(deviceLimit);
    }

    if (status) {
      license.status = status;
    }

    if (customerName !== undefined) {
      license.customerName = customerName || undefined;
    }

    if (customerPhone !== undefined) {
      license.customerPhone = customerPhone || undefined;
    }

    if (resetDevices) {
      license.devices = [];
    }

    updateLicense(license);

    return NextResponse.json({
      success: true,
      license,
    });
  } catch (err) {
    console.error("Error in update license route:", err);
    return NextResponse.json({ error: "Lisans güncellenirken hata oluştu." }, { status: 500 });
  }
}
