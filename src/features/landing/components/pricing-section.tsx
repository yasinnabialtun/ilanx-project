"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { LandingButton } from "@/shared/components/ui/landing-button";

const pricingPlans = [
  {
    id: "weekly",
    name: "Haftalık Lisans",
    image: "/pricing-1.png",
    description: "7 Gün Boyunca Geçerli Tam Sürüm",
    features: [
      "Tüm parsel ve neon çizim araçları",
      "3D tabela ve konum pinleri",
      "Kendi logonuzu ekleme",
      "Video (MP4) ve PDF çıktısı",
      "3 Cihaz sınırı",
    ],
  },
  {
    id: "monthly",
    name: "Aylık Lisans",
    image: "/pricing-2.png",
    description: "30 Gün Boyunca Geçerli Tam Sürüm",
    features: [
      "Haftalık paketteki tüm özellikler",
      "30 gün boyunca kesintisiz kullanım",
      "Hızlı teknik destek",
      "Öncelikli yeni özellik güncellemeleri",
      "3 Cihaz sınırı",
    ],
    popular: true,
  },
  {
    id: "annual",
    name: "Yıllık Lisans",
    image: "/pricing-3.png",
    description: "365 Gün Boyunca Geçerli En Avantajlı Sürüm",
    features: [
      "Aylık paketteki tüm özellikler",
      "365 gün boyunca kesintisiz kullanım",
      "Yarı fiyatına gelen yıllık fiyat avantajı",
      "Kişiye özel kurumsal marka entegrasyonu",
      "3 Cihaz sınırı",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-20 overflow-hidden border-t border-zinc-900 bg-zinc-950/20">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800/80 bg-zinc-900/30 px-4 py-1.5 text-xs text-cyan-400 font-semibold tracking-wider uppercase">
              💰 Lisans Seçenekleri
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Size En Uygun Planı Seçin
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-4 text-lg text-zinc-400"
          >
            Kredi kartı gerekmeden demo modunda deneyin, işiniz büyüdükçe Shopier üzerinden anında lisansınızı aktif edin.
          </motion.p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-stretch max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`flex flex-col rounded-2xl border bg-zinc-900/25 p-5 backdrop-blur-md relative transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)] ${
                plan.popular ? "border-cyan-500/30 ring-1 ring-cyan-500/20" : "border-zinc-900 bg-zinc-900/10"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-md">
                  En Popüler
                </span>
              )}

              {/* Card Image Display */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-950 mb-6 group cursor-pointer shadow-lg border border-zinc-900">
                <a href="https://www.shopier.com/ilanx" target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <Image
                    src={plan.image}
                    alt={plan.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="rounded-xl bg-white text-black text-xs font-semibold px-4 py-2.5 shadow-xl flex items-center gap-1.5 active:scale-95 transition-transform">
                      Satın Al <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </a>
              </div>

              {/* Card Info */}
              <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-zinc-400 mb-6">{plan.description}</p>

                <ul className="space-y-3.5 mb-8 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <LandingButton 
                  size="default" 
                  variant={plan.popular ? "default" : "outline"} 
                  className={`w-full ${plan.popular ? "glow-primary bg-cyan-500 text-black hover:bg-cyan-600" : ""}`}
                  asChild
                >
                  <a href="https://www.shopier.com/ilanx" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                    Lisans Satın Al <ArrowUpRight className="size-4" />
                  </a>
                </LandingButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
