import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/shared/lib/prisma";
import Replicate from "replicate";
import nodemailer from "nodemailer";
import { downloadAndSaveVideo } from "@/shared/lib/file-storage";

// Helper function to send email
async function sendVideoEmail(toEmail: string, videoUrl: string) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || "İlanX <info@ilanx.com.tr>",
      to: toEmail,
      subject: "🎉 Yapay Zeka Emlak Videonuz Hazır! - İlanX",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; background-color: #f9fafb; border-radius: 12px;">
          <h1 style="color: #4f46e5;">Tebrikler! Videonuz Hazır 🚀</h1>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">
            Stüdyoda oluşturduğunuz yapay zeka destekli emlak videonuz başarıyla tamamlandı. Aşağıdaki butona tıklayarak videonuzu indirebilir ve sosyal medyada paylaşabilirsiniz.
          </p>
          <a href="${videoUrl}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Videoyu İndir / İzle
          </a>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Bol satışlar dileriz!<br><strong>İlanX Ekibi</strong>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const prompt = searchParams.get("prompt") || "Yapay Zeka Videosu";

    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    const prediction = await replicate.predictions.get(jobId);

    if (prediction.status === "succeeded") {
      const videoUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;

      if (!videoUrl) {
        return NextResponse.json({ error: "Video URL not found in output" }, { status: 500 });
      }

      // Check if we already processed this job
      const existingVideo = await prisma.video.findUnique({
        where: { replicateId: jobId }
      });

      if (existingVideo) {
        // Already processed, just return the data
        return NextResponse.json({
          success: true,
          status: "succeeded",
          videoUrl: existingVideo.url,
          videoId: existingVideo.id,
        });
      }

      // First time seeing this succeed -> Save to DB and Send Email
      const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
      });

      if (user) {
        // Download the video to our own server to prevent link expiration
        const localVideoUrl = await downloadAndSaveVideo(videoUrl as string, jobId);

        const video = await prisma.video.create({
          data: {
            userId: user.id,
            url: localVideoUrl,
            prompt: prompt,
            replicateId: jobId, // Mark as processed
          },
        });

        // Fire and forget email
        if (user.email) {
          sendVideoEmail(user.email, localVideoUrl);
        }

        return NextResponse.json({
          success: true,
          status: "succeeded",
          videoUrl: localVideoUrl,
          videoId: video.id,
        });
      }
    } else if (prediction.status === "failed" || prediction.status === "canceled") {
      
      // We also need to make sure we only refund ONCE. 
      // If the job isn't in our DB, we can't easily track refund state without a new table or flag.
      // For simplicity, we assume client only triggers this once on failure, or we add a "FailedJob" table.
      // A quick fix is to write a dummy video record with url="failed" to track it.
      
      const existingFailed = await prisma.video.findUnique({
        where: { replicateId: jobId }
      });

      if (!existingFailed) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email as string },
        });
        if (user) {
          // Refund 1 credit
          await prisma.user.update({
            where: { email: user.email! },
            data: { credits: user.credits + 1 }, 
          });

          // Mark as processed (failed)
          await prisma.video.create({
            data: {
              userId: user.id,
              url: "FAILED",
              prompt: prompt,
              replicateId: jobId,
            },
          });
        }
      }

      return NextResponse.json({
        success: false,
        status: prediction.status,
        error: prediction.error,
      });
    }

    // Still processing
    return NextResponse.json({
      success: true,
      status: prediction.status, // "starting" | "processing"
    });

  } catch (error) {
    console.error("Video Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
