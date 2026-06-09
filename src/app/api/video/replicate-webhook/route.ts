import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import nodemailer from "nodemailer";
import { downloadAndSaveVideo } from "@/shared/lib/file-storage";

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
    console.error("Webhook Email send error:", error);
  }
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const prompt = searchParams.get("prompt") || "Yapay Zeka Videosu";

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const body = await req.json();
    const jobId = body.id;
    const status = body.status;

    if (!jobId) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Check if we already processed this job (maybe the client-side polling beat the webhook)
    const existingVideo = await prisma.video.findUnique({
      where: { replicateId: jobId }
    });

    if (existingVideo) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    if (status === "succeeded") {
      const videoUrl = Array.isArray(body.output) ? body.output[0] : body.output;

      if (!videoUrl) return NextResponse.json({ success: true });

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (user) {
        // Download the video to our own server to prevent link expiration
        const localVideoUrl = await downloadAndSaveVideo(videoUrl, jobId);

        await prisma.video.create({
          data: {
            userId: user.id,
            url: localVideoUrl,
            prompt: prompt,
            replicateId: jobId,
          },
        });

        if (user.email) {
          await sendVideoEmail(user.email, localVideoUrl);
        }
      }
    } else if (status === "failed" || status === "canceled") {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        // Mark as failed
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Replicate Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
