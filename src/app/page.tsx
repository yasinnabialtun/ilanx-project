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

export const dynamic = 'force-dynamic';

export default function Home() {
  const content = contentDb.get();

  return (
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
  );
}
