import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId } = body;

    // TODO: Initialize real Shopier API here
    // 1. Create a unique order ID
    // 2. Hash the secret key and order details according to Shopier docs
    // 3. Generate the Shopier payment page URL
    
    // MOCK RESPONSE FOR DEMO PURPOSES:
    // In a real scenario, this URL would be the actual Shopier payment gateway URL.
    // The browser agent created a real product link for us.
    const realShopierUrl = `https://www.shopier.com/ilanx/47712832`;

    return NextResponse.json({ 
      success: true, 
      checkoutUrl: realShopierUrl 
    });

  } catch (error) {
    console.error('Shopier checkout error:', error);
    return NextResponse.json(
      { success: false, message: 'Ödeme başlatılamadı' },
      { status: 500 }
    );
  }
}
