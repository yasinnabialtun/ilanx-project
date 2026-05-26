"use client";

import { motion } from "framer-motion"
import { Play, ArrowRight } from "lucide-react"
import Link from "next/link"

import { LandingButton } from "@/shared/components/ui/landing-button"

import { CanvasMockup } from "./canvas-mockup"
import { PlotDrawingAnimation } from "./plot-drawing-animation"
import type { ContentData } from "@/core/db/content-db"

export function HeroSection({ content }: { content?: ContentData["hero"] }) {
  // Use provided content or fallback to hardcoded text during development if missing
  const title = content?.title || "Arsa İlanlarınızı 10 Kat Daha Hızlı Satın";
  const description = content?.description || "Tasarımcı tutmadan, sadece 2 dakikada dikkat çeken neon sınırlar, 3D satılık tabelaları ve animasyonlu video sunumları hazırlayın. Sıradan görsellerle ilan sitelerinde kaybolmayın.";
  const btn1 = content?.buttonPrimary || "Ücretsiz Çizmeye Başla";
  const btn2 = content?.buttonSecondary || "Nasıl Çalışır?";

  return (
    <section className="relative min-h-screen overflow-hidden pt-24 pb-16">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-chart-2/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center min-h-[calc(100vh-8rem)]">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Gayrimenkul danışmanları için
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: title.replace(/(10 Kat Daha Hızlı Satın)/g, '<span class="text-gradient">$1</span>') }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <LandingButton size="lg" className="glow-primary group" asChild>
                <Link href="/editor">
                  <Play className="mr-2 h-4 w-4" />
                  {btn1}
                </Link>
              </LandingButton>
              <LandingButton size="lg" variant="outline" className="group" asChild>
                <Link href="#demo">
                  {btn2}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </LandingButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mt-12 flex items-center gap-8"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-background bg-gradient-to-br from-primary/80 to-chart-2/80"
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">1.200+ Emlak Danışmanı</p>
                <p className="text-sm text-muted-foreground">İlanX ile satış sürelerini %40 hızlandırdı</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Canvas Mockup or Plot Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative lg:pl-8"
          >
            <div className="hidden lg:block">
              <PlotDrawingAnimation />
            </div>
            <div className="lg:hidden">
              <CanvasMockup />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}