import type { Metadata } from "next";
import { CTASection } from "@/features/landing/components/cta-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { Footer } from "@/features/landing/components/footer";
import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { InteractiveDemoSection } from "@/features/landing/components/interactive-demo-section";
import { Navbar } from "@/features/landing/components/navbar";
import { SocialProofSection } from "@/features/landing/components/social-proof-section";
import { TechStackSection } from "@/features/landing/components/tech-stack-section";
import { UseCasesSection } from "@/features/landing/components/use-cases-section";
import { ProblemSection } from "@/features/landing/components/problem-section";
import { FAQSection } from "@/features/landing/components/faq-section";
import { contentDb } from "@/core/db/content-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İlanX | Gayrimenkul İlan Görseli Hazırlama Aracı - Emlak Danışmanları İçin",
  description:
    "Arazi ve gayrimenkul fotoğrafları üzerine parsel çizin, metrekare ve fiyat etiketi ekleyin. Emlak danışmanları için profesyonel ilan görseli hazırlama platformu. Instagram, Sahibinden ve Hepsiemlak için optimize edilmiş çıktılar.",
  alternates: {
    canonical: "https://ilanx.com.tr",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": "https://ilanx.com.tr/#webapp",
      name: "İlanX",
      url: "https://ilanx.com.tr",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TRY",
        description: "Demo modu ücretsiz, tam sürüm lisans ile aktif olur.",
      },
      description:
        "Emlak danışmanları için geliştirilmiş gayrimenkul ilan görseli hazırlama platformu. Arazi sınırlarını çizin, fiyat etiketleri ekleyin ve profesyonel görseller oluşturun.",
      inLanguage: "tr-TR",
      audience: {
        "@type": "Audience",
        audienceType: "Emlak Danışmanları, Gayrimenkul Geliştiricileri",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://ilanx.com.tr/#organization",
      name: "İlanX",
      url: "https://ilanx.com.tr",
      logo: {
        "@type": "ImageObject",
        url: "https://ilanx.com.tr/og-image.png",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: "Turkish",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://ilanx.com.tr/#website",
      url: "https://ilanx.com.tr",
      name: "İlanX",
      publisher: { "@id": "https://ilanx.com.tr/#organization" },
      inLanguage: "tr-TR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://ilanx.com.tr/editor",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "İlanX nasıl çalışır?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Gayrimenkul veya arazi görselinizi sisteme yükleyin, akıllı çizim araçlarıyla sınırları belirleyin, metrekare ve fiyat gibi etiketler ekleyin ve yüksek çözünürlüklü görselinizi indirin.",
          },
        },
        {
          "@type": "Question",
          name: "Ücretsiz kullanabilir miyim?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Evet, demo modu tamamen ücretsizdir. Tam özellikli kullanım için lisans satın alabilirsiniz.",
          },
        },
        {
          "@type": "Question",
          name: "Hangi çıktı formatlarını destekliyor?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Instagram, Facebook, Sahibinden, Hepsiemlak ve WhatsApp için optimize edilmiş yüksek çözünürlüklü PNG görsel çıktısı desteklenmektedir.",
          },
        },
        {
          "@type": "Question",
          name: "Birden fazla cihazda kullanabilir miyim?",
          acceptedAnswer: {
            "@type": "Answer",
            text:
              "Lisans türünüze göre belirlenen cihaz limitine kadar farklı cihazlarda kullanabilirsiniz.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  const content = contentDb.get();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative min-h-screen overflow-x-hidden">
        <Navbar />
        <HeroSection content={content.hero} />
        <ProblemSection />
        <InteractiveDemoSection />
        <FeaturesSection content={content.features} />
        <HowItWorksSection content={content.howItWorks} />
        <UseCasesSection />
        <TechStackSection />
        <SocialProofSection />
        <FAQSection />
        <CTASection content={content.cta} />
        <Footer content={content.footer} />
      </main>
    </>
  );
}
