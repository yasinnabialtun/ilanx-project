import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import Replicate from "replicate";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    const body = await req.json();
    const { prompt, images, format, duration } = body;
    
    // We expect at least one image (Base64) from the frontend for Image-to-Video
    const firstImage = images && images.length > 0 ? images[0] : undefined;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Only send webhook if we are on a public domain (not localhost)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const webhookUrl = appUrl.includes("localhost") 
      ? undefined 
      : `${appUrl}/api/video/replicate-webhook?userId=${user.id}&prompt=${encodeURIComponent(prompt || "Emlak Videosu")}`;

    // Create a prediction using minimax/video-01 model
    const prediction = await replicate.predictions.create({
      model: "minimax/video-01",
      input: {
        prompt: prompt || "Luxury real estate, cinematic camera pan, beautiful lighting",
        prompt_optimizer: true,
        first_frame_image: firstImage, // Pass the base64 image data URI
      },
      webhook: webhookUrl,
      webhook_events_filter: ["completed"],
    });

    return NextResponse.json({
      success: true,
      jobId: prediction.id,
      status: prediction.status, // "starting" or "processing"
    });

  } catch (error) {
    console.error("Video Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
