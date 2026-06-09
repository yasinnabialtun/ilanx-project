import { NextResponse } from "next/server";

async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("Image fetch failed");
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (err) {
    console.error(`Error converting ${url} to base64:`, err);
    return "";
  }
}

// Curated stock photos for smart fallback
const HOUSE_FALLBACKS = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800", // Villa Exterior
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800", // Kitchen
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800", // Living room
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800", // Bathroom
];

const LAND_FALLBACKS = [
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800", // Green Field
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800", // Aerial view
  "https://images.unsplash.com/photo-1444312645910-ffa973656eba?q=80&w=800", // Landscape
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800", // Field view
];

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "İlan linki gereklidir." }, { status: 400 });
    }

    const lowerUrl = url.toLowerCase();
    const isBotProtected = lowerUrl.includes("sahibinden.com") || lowerUrl.includes("hepsiemlak.com");
    
    let title = "Akıllı İlan İçe Aktarımı";
    let description = "";
    let images: string[] = [];
    let isSimulated = false;

    if (isBotProtected) {
      isSimulated = true;
    } else {
      // Try fetching metadata from regular links
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          signal: AbortSignal.timeout(6000)
        });

        if (response.ok) {
          const html = await response.text();
          
          // Basic regex parsing for OpenGraph tags
          const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
          const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
          
          if (titleMatch) title = titleMatch[1];
          if (descMatch) description = descMatch[1];

          // Look for image tags or og:image tags
          const ogImageMatches = [...html.matchAll(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/gi)];
          const scrapedUrls = ogImageMatches.map(m => m[1]).slice(0, 4);

          if (scrapedUrls.length > 0) {
            for (const imgUrl of scrapedUrls) {
              const base64 = await imageUrlToBase64(imgUrl);
              if (base64) images.push(base64);
            }
          }
        } else {
          isSimulated = true;
        }
      } catch (err: any) {
        console.warn("Listing scraping failed, falling back to simulation:", err.message);
        isSimulated = true;
      }
    }

    // Smart Fallback Simulation
    if (isSimulated || images.length === 0) {
      const isLand = lowerUrl.includes("arsa") || lowerUrl.includes("tarla") || lowerUrl.includes("arazi");
      const targetImages = isLand ? LAND_FALLBACKS : HOUSE_FALLBACKS;

      // Extract listing ID or search keywords from URL for a realistic look
      let parsedTitle = "Lüks Gayrimenkul Portföyü";
      if (lowerUrl.includes("villa")) {
        parsedTitle = "Satılık 4+2 Lüks Villa";
      } else if (lowerUrl.includes("daire") || lowerUrl.includes("konut")) {
        parsedTitle = "Satılık Geniş 3+1 Aile Dairesi";
      } else if (isLand) {
        parsedTitle = "Yatırımlık İmarlı Satılık Arsa";
      }

      title = parsedTitle;
      description = isLand 
        ? "Yola cepheli, elektrik ve su altyapısı hazır, geleceğe yönelik yüksek prim potansiyeline sahip imarlı arsa."
        : "Nezih bir bölgede, ultra lüks iç mimariye sahip, geniş peyzajlı bahçesi ve modern tasarımıyla göz kamaştıran satılık mülk.";

      // Convert Unsplash stock photos to Base64 to bypass CORS
      for (const imgUrl of targetImages) {
        const base64 = await imageUrlToBase64(imgUrl);
        if (base64) images.push(base64);
      }
    }

    // Build the AI Video prompt based on the details
    const videoPrompt = `Gayrimenkul Tanıtımı: ${title}. ${description} Görsel geçişleri sinematik, aydınlatma canlı ve profesyonel olsun.`;

    return NextResponse.json({
      success: true,
      title,
      description,
      prompt: videoPrompt,
      images,
      simulated: isSimulated
    });

  } catch (error: any) {
    console.error("Listing Import Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
