"use client"

import { motion } from "framer-motion"
import { 
  Pencil, 
  Palette, 
  Box, 
  Image as ImageIcon,
  MapPin, 
  Video 
} from "lucide-react"
import type { ContentData } from "@/core/db/content-db"

const features = [
  {
    icon: Palette,
    title: "Portallarda Öne Çıkan Neon Çizgiler",
    description: "Saber, Neon ve Bloom parlamalarıyla mülkünüzün en çarpıcı yönlerini, vitrinlerini veya sınırlarını aydınlatın. Gözleri doğrudan ilanınıza çekin.",
  },
  {
    icon: Box,
    title: "Değer Algısını Artıran 3D Tabelalar",
    description: "Derinlikli 3D yazılar, fiyat etiketleri ve 3D villa simgeleri yerleştirin. Konut ve arazi sunumlarınıza prestij katın.",
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
  {
    icon: ImageIcon,
    title: "Kendi Logonuzla Portföyü Koruyun",
    description: "Logonuzu veya filigranınızı yerleştirerek emeğinizin çalınmasını önleyin. Her paylaşımda kurumsal marka bilinirliğinizi artırın.",
  },
  {
    icon: Video,
    title: "WhatsApp, PDF ve MP4 Video Çıktısı",
    description: "Çalışmalarınızı yüksek çözünürlüklü PNG resim, sunum için profesyonel PDF veya ilan siteleri için hareketli MP4 videosu olarak indirin.",
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
  const title = content?.title || "Kendi Tasarım Stüdyonuz";
  const subtitle = content?.subtitle || "Gayrimenkul danışmanlığında profesyonel tasarımlar yapmak için ihtiyacınız olan her şey.";
  
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
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
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
