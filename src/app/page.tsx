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

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <InteractiveDemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <UseCasesSection />
      <TechStackSection />
      <SocialProofSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
