import type { Metadata } from "next";
import { AIVideoComingSoon } from "@/features/ai-video/components/ai-video-coming-soon";
import { Navbar } from "@/features/landing/components/navbar";

export const metadata: Metadata = {
  title: "AI Video Stüdyosu - Çok Yakında | İlanX",
  description:
    "İlanX yapay zeka video stüdyosu çok yakında! Emlak ilanlarınızı yapay zeka ile videoya dönüştürün.",
};

export default function AIVideoPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <AIVideoComingSoon />
      </div>
    </main>
  );
}