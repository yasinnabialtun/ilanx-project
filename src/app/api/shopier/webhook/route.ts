import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/shared/lib/prisma';

// Shopier webhook'tan gelen verileri doğrulamak için (Üretime geçmeden gerçek API secret girilmeli)
const SHOPIER_API_SECRET = process.env.SHOPIER_API_SECRET || "MOCK_SECRET";

export async function POST(req: Request) {
  try {
    let body: any = {};
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      body = await req.json();
    } else {
      // Shopier webhook istekleri genellikle application/x-www-form-urlencoded gelir
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    }

    // Shopier'den gelen standart webhook parametreleri
    const { 
      status, 
      invoice_id, 
      order_no, 
      buyer_email, 
      custom_params, 
      hash 
    } = body;

    // 1. Ödeme Başarılı mı?
    if (status !== 'success') {
      return NextResponse.json({ message: 'Payment not successful' }, { status: 400 });
    }

    // 2. Hash Doğrulaması (Güvenlik)
    const signature = req.headers.get("x-shopier-signature") || body.hash || body.signature;
    const { random_nr, shop_order_id, total_order_value, currency } = body;

    // Sadece Canlı (Production) ortamda güvenlik duvarını aktif et
    if (process.env.NODE_ENV === "production") {
      if (!signature) {
        console.error("[SHOPIER] Güvenlik imzası bulunamadı.");
        return NextResponse.json({ message: 'Signature missing' }, { status: 400 });
      }

      // Shopier Standart Webhook Hash Algoritması
      const dataToHash = (random_nr || "") + (shop_order_id || invoice_id || "") + (total_order_value || "") + (currency || "");
      const expectedHash = crypto.createHmac('sha256', SHOPIER_API_SECRET).update(dataToHash).digest('base64');
      
      // Eğer imza eşleşmiyorsa, sahte bir istektir (Korsan engelleme)
      if (signature !== expectedHash) {
        console.error("[SHOPIER] Hatalı imza tespit edildi! Korsan girişim engellendi.");
        return NextResponse.json({ message: 'Invalid Signature' }, { status: 403 });
      }
    }

    // 3. Kullanıcıyı Bul ve Kredi Ekle
    // custom_params string (JSON) olarak gelirse parse edip alıyoruz
    let customParamsObj: any = {};
    if (typeof custom_params === "string") {
      try {
        customParamsObj = JSON.parse(custom_params);
      } catch (err) {
        console.warn("[SHOPIER WEBHOOK] custom_params parse edilemedi:", err);
      }
    } else if (custom_params && typeof custom_params === "object") {
      customParamsObj = custom_params;
    }

    const userEmail = customParamsObj.email || buyer_email;

    if (!userEmail) {
      return NextResponse.json({ message: 'User email not found in webhook payload' }, { status: 400 });
    }

    console.log(`[SHOPIER WEBHOOK] Payment received: ${userEmail}`);

    return NextResponse.json({ success: true, message: 'Payment processed successfully' });

  } catch (error) {
    console.error('[SHOPIER WEBHOOK ERROR]', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
