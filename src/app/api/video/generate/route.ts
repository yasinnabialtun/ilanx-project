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

    // Get user from DB to check credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!user || user.credits <= 0) {
      return NextResponse.json({ error: "Yetersiz kredi." }, { status: 403 });
    }

    const body = await req.json();
    const { prompt, images, format, duration } = body;
    
    // We expect at least one image (Base64) from the frontend for Image-to-Video
    const firstImage = images && images.length > 0 ? images[0] : undefined;

    // Deduct 1 credit immediately
    await prisma.user.update({
      where: { email: user.email! },
      data: { credits: user.credits - 1 },
    });

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
      version: "10b809a7b9736fdb354978ab7c0eec7ce1dd427a149a4f4dcfbc00d720b0051e", // Minimax/video-01 current version ID (or use model name if supported directly)
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
      remainingCredits: user.credits - 1
    });

  } catch (error) {
    console.error("Video Generation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
