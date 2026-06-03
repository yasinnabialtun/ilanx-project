import type { Metadata } from "next";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { Navbar } from "@/features/landing/components/navbar";

export const metadata: Metadata = {
  title: "Fiyatlandırma | İlanX",
  description:
    "İlanX fiyatlandırma paketleri: 10 video, 50 video veya sınırsız lisans seçenekleri. Emlak ilanlarınız için yapay zeka video stüdyosunu hemen deneyin.",
  alternates: {
    canonical: "https://www.tsukodesign.com/pricing",
  },
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <PricingSection />
      </div>
    </main>
  );
}
