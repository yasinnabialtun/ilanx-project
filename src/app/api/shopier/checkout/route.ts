import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import crypto from "crypto";

const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY || "MOCK_KEY";
const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET || "MOCK_SECRET";

const PACKAGES: Record<string, { credits: number; price: number; name: string }> = {
  pkg_1: { credits: 10, price: 200, name: "IlanX - 10 Video Kredisi" },
  pkg_2: { credits: 50, price: 750, name: "IlanX - 50 Video Kredisi" },
  pkg_3: { credits: 100, price: 1200, name: "IlanX - 100 Video Kredisi" },
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, message: "Ödeme başlatmak için giriş yapmalısınız." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageId } = body;

    const selectedPkg = PACKAGES[packageId];
    if (!selectedPkg) {
      return NextResponse.json(
        { success: false, message: "Geçersiz paket seçimi." },
        { status: 400 }
      );
    }

    const email = session.user.email;
    const fullName = session.user.name || "Bilinmeyen Müşteri";
    const nameParts = fullName.trim().split(" ");
    const buyer_name = nameParts[0] || "Bilinmeyen";
    const buyer_surname = nameParts.slice(1).join(" ") || "Müşteri";

    const platform_order_id = `ILX-${Date.now()}`;
    const total_order_value = selectedPkg.price.toFixed(2); // Shopier formatı (örn: "200.00")
    const currency = "0"; // Shopier para birimi: 0 = TRY
    const random_nr = Math.floor(100000 + Math.random() * 900000).toString();

    // Shopier Standart Signature Oluşturma Algoritması:
    // random_nr + platform_order_id + total_order_value + currency
    const signatureData = random_nr + platform_order_id + total_order_value + currency;
    const signature = crypto
      .createHmac("sha256", SHOPIER_API_SECRET)
      .update(signatureData)
      .digest("base64");

    // Webhook'ta krediyi kime ekleyeceğimizi bilmek için custom_params dizisini dolduruyoruz
    const custom_params = JSON.stringify({
      email,
      packageCredits: selectedPkg.credits.toString(),
    });

    const inputs = {
      API_key: SHOPIER_API_KEY,
      website_index: "1",
      platform_order_id,
      product_name: selectedPkg.name,
      product_type: "1", // 1 = Dijital / Hizmet Ürünü
      total_order_value,
      currency,
      random_nr,
      signature,
      buyer_name,
      buyer_surname,
      buyer_email: email,
      buyer_phone: "05555555555", // Varsayılan değer (veri tabanında yoksa)
      buyer_address: "Istanbul, Turkiye", // Dijital hizmet olduğu için varsayılan adres
      buyer_city: "Istanbul",
      buyer_country: "Turkiye",
      buyer_postcode: "34000",
      custom_params,
    };

    return NextResponse.json({
      success: true,
      action: "https://www.shopier.com/ShowProduct/api_pay4.php",
      inputs,
    });
  } catch (error) {
    console.error("Shopier checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Ödeme başlatılamadı." },
      { status: 500 }
    );
  }
}
