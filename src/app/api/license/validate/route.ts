import { NextResponse } from "next/server";
import { findLicenseByKey, updateLicense } from "@/core/db/license-db";
import { signJwt } from "@/core/lib/jwt";
import crypto from "crypto";

// Simple in-memory rate limiter to protect against brute-force attacks
const rateLimitMap = new Map<string, { attempts: number; firstAttempt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit) {
    rateLimitMap.set(ip, { attempts: 1, firstAttempt: now });
    return false;
  }

  // Reset window if more than 1 minute has passed since the first attempt of this window
  if (now - limit.firstAttempt > 60000) {
    rateLimitMap.set(ip, { attempts: 1, firstAttempt: now });
    return false;
  }

  limit.attempts += 1;

  // Block if more than 5 attempts within the 1-minute window
  return limit.attempts > 5;
}

export async function POST(req: Request) {
  // Get client IP for rate limiting
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Çok fazla deneme yaptınız. Lütfen 1 dakika sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  try {
    const { licenseKey, deviceId } = await req.json();

    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json({ error: "Lisans anahtarı gereklidir." }, { status: 400 });
    }

    const license = findLicenseByKey(licenseKey.toUpperCase().trim());

    if (!license) {
      return NextResponse.json({ error: "Geçersiz lisans anahtarı." }, { status: 403 });
    }

    if (license.status === "expired") {
      return NextResponse.json({ error: "Bu lisansın süresi dolmuş." }, { status: 403 });
    }

    if (license.status === "revoked") {
      return NextResponse.json({ error: "Bu lisans iptal edilmiş." }, { status: 403 });
    }

    // Check expiration date
    const expiry = new Date(license.expiresAt);
    if (isNaN(expiry.getTime()) || expiry < new Date()) {
      license.status = "expired";
      updateLicense(license);
      return NextResponse.json({ error: "Bu lisansın süresi dolmuş." }, { status: 403 });
    }

    // Generate unique device identifier if not sent
    const ua = req.headers.get("user-agent") || "";
    const computedDeviceId = deviceId || crypto.createHash("md5").update(`${ip}-${ua}`).digest("hex");

    // Device binding logic
    if (!license.devices.includes(computedDeviceId)) {
      if (license.devices.length >= license.deviceLimit) {
        return NextResponse.json(
          { error: "Bu lisans için maksimum cihaz sınırına ulaşıldı." },
          { status: 403 }
        );
      }
      license.devices.push(computedDeviceId);
      updateLicense(license);
    }

    // Generate JWT Token containing license validation status
    const token = signJwt({
      licenseId: license.id,
      licenseKey: license.licenseKey,
      status: license.status,
      deviceId: computedDeviceId,
    });

    return NextResponse.json({
      valid: true,
      status: license.status,
      expiresAt: license.expiresAt,
      token,
    });
  } catch (err) {
    console.error("Error in validate license route:", err);
    return NextResponse.json({ error: "Doğrulama hatası oluştu." }, { status: 500 });
  }
}
