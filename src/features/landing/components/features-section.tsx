"use client"

import { motion } from "framer-motion"
import { 
  Pencil, 
  Palette, 
  Box, 
  Image as ImageIcon,
  MapPin, 
  Video,
  Sparkles,
  Zap,
  Layout
} from "lucide-react"
import type { ContentData } from "@/core/db/content-db"

const features = [
  {
    title: "Akıllı Müzik Senkronizasyonu",
    description: "Trend Reels müziklerini videonuza otomatik olarak senkronize eder. Lüks emlak, enerjik veya kurumsal müziklerle tarzınızı belirleyin.",
    icon: Sparkles,
  },
  {
    title: "Yapay Zeka Destekli Metin",
    description: "Prompt (talimat) kutusuna yazdığınız 'Acil Satılık' veya 'Fırsat Daire' gibi yazıları yapay zeka analiz eder ve videonun en can alıcı noktasına estetik bir fontla yerleştirir.",
    icon: Zap,
  },
  {
    title: "Sinematik Geçişler (Transitions)",
    description: "Statik fotoğraflarınızı alır ve aralarına stüdyo kalitesinde sinematik geçiş (zoom, pan, slide) efektleri ekler.",
    icon: Layout,
  },
  {
    title: "Sosyal Medya Formatları",
    description: "Instagram Reels (9:16), YouTube (16:9) veya Kare (1:1) formatlarında, hiçbir kalite kaybı yaşamadan yüksek çözünürlüklü (HD) çıktılar alırsınız.",
    icon: Palette,
  },
  {
    icon: Pencil,
    title: "Karmaşık Sınırları Saniyeler İçinde Çizin",
    description: "Çokgen çizim aracıyla site sınırlarını, balkon manzaralarını veya arsa parselasyonlarını hızlıca işaretleyin ve anında anlaşılır kılın.",
  },
  {
    icon: MapPin,
    title: "Önemli Çevre Noktalarını Vurgulayın",
    description: "Yol, metro, okul veya AVM gibi konum pinleri yerleştirin ve pulsasyon (dalga) efektiyle mülkünüzün değer katan noktalarını öne çıkarın.",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function FeaturesSection({ content }: { content?: ContentData["features"] }) {
  const title = content?.title || "Neden İlanX Yapay Zeka Stüdyosu?";
  const subtitle = content?.subtitle || "Basit slayt gösterilerini unutun. Yapay zeka ile statik ilanlarınızı tıklanma rekorları kıran viral videolara çevirin.";
  
  // Merge dynamic text with static icons
  const displayFeatures = features.map((f, i) => {
    const dynamicItem = content?.items?.[i];
    return {
      ...f,
      title: dynamicItem?.title || f.title,
      description: dynamicItem?.description || f.description,
    };
  });

  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            {title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {displayFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative"
            >
              <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 hover:border-primary/50 hover:glow-primary">
                {/* Icon container */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover gradient effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
