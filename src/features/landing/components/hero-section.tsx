"use client";

import { motion } from "framer-motion"
import { Play, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"

import { LandingButton } from "@/shared/components/ui/landing-button"

import { CanvasMockup } from "./canvas-mockup"
import { PlotDrawingAnimation } from "./plot-drawing-animation"
import type { ContentData } from "@/core/db/content-db"

export function HeroSection({ content }: { content?: ContentData["hero"] }) {
  // Use provided content or fallback to hardcoded text during development if missing
  const title = content?.title || "Gayrimenkul İlanlarınızı Saniyeler İçinde Tasarlayın";
  const description = content?.description || "Daire, villa ve arazi fotoğraflarınıza 3D tabelalar, kurumsal logonuz ve neon çizgiler ekleyerek ilan sitelerinde fark yaratın. Tasarımcıya ihtiyaç duymadan kendi profesyonel stüdyonuzu kurun.";
  const btn1 = content?.buttonPrimary || "Hemen Ücretsiz Dene";
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
              <Link
                href="/ai-video"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground"
              >
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Gayrimenkul danışmanları için
              </Link>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance whitespace-pre-wrap"
            >
              Emlak Fotoğraflarınızı Saniyeler İçinde
              <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                Yapay Zeka Videolarına Çevirin
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl"
            >
              Statik ilan fotoğraflarınızı yükleyin, saniyeler içinde lüks geçiş efektleri, müzik senkronizasyonu ve yapay zeka destekli metinlerle donatılmış profesyonel Reels ve TikTok videolarına dönüştürün.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link href="/ai-video">
                <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 glow-primary rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ücretsiz Video Oluştur
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 rounded-xl border-white/20 hover:bg-white/10">
                  Panelime Git
                </Button>
              </Link>
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