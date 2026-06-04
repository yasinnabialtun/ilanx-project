"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { LandingButton } from "@/shared/components/ui/landing-button";

const tiers = [
  {
    name: "10 Video",
    id: "pkg_1",
    price: "₺200",
    description: "Denemek veya az sayıda ilanı olan emlakçılar için ideal paket.",
    features: [
      "10 Yüksek Çözünürlüklü (HD) Video",
      "Tüm Sinematik Geçiş Efektleri",
      "Yapay Zeka Metin Vurgusu",
      "Logo ve Filigran Ekleme",
      "7/24 Destek",
    ],
    mostPopular: false,
  },
  {
    name: "50 Video",
    id: "pkg_2",
    price: "₺750",
    description: "Aktif çalışan ve her ilanı için Reels üreten profesyoneller için.",
    features: [
      "50 Yüksek Çözünürlüklü (HD) Video",
      "Tüm Sinematik Geçiş Efektleri",
      "Yapay Zeka Metin Vurgusu",
      "Logo ve Filigran Ekleme",
      "Öncelikli (Hızlı) Render Sırası",
      "7/24 Öncelikli Destek",
    ],
    mostPopular: true,
  },
  {
    name: "100 Video",
    id: "pkg_3",
    price: "₺1200",
    description: "Kurumsal ofisler ve çok sayıda portföyü olan ekipler için tasarlandı.",
    features: [
      "100 Yüksek Çözünürlüklü (HD) Video",
      "Tüm Şablonlara Sınırsız Erişim",
      "Yapay Zeka Metin Vurgusu",
      "Logo ve Filigran Ekleme",
      "En Hızlı Render Sırası",
      "Özel Müşteri Temsilcisi",
    ],
    mostPopular: false,
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
            İhtiyacınıza Göre Kredi Paketleri
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-4 text-lg text-zinc-400"
          >
            Aylık üyelik yok, taahhüt yok. Yalnızca üreteceğiniz videolar kadar kredi satın alın ve portföyünüzü hemen parlatın.
          </motion.p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-stretch max-w-5xl mx-auto">
          {tiers.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`flex flex-col rounded-3xl border bg-zinc-900/40 p-8 backdrop-blur-xl relative transition-all duration-300 hover:-translate-y-2 ${
                plan.mostPopular ? "border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : "border-white/10 hover:border-white/20"
              }`}
            >
              {plan.mostPopular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  En Çok Tercih Edilen
                </span>
              )}

              {/* Card Info */}
              <div className="flex-1 flex flex-col mt-2">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="text-4xl font-black text-white mb-6">{plan.price}</div>
                <p className="text-sm font-medium text-indigo-400 mb-8">{plan.description}</p>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <CheckCircle2 className="size-5 text-indigo-400 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <LandingButton 
                  size="default" 
                  variant={plan.mostPopular ? "default" : "outline"} 
                  className={`w-full h-12 text-base font-bold rounded-xl ${plan.mostPopular ? "bg-indigo-500 text-white hover:bg-indigo-600" : "bg-white/5 text-white border-white/10 hover:bg-white/10"}`}
                  asChild
                >
                  <a href={`/dashboard?buy=${plan.id}`} className="flex items-center justify-center gap-2">
                    Kredi Satın Al <ArrowUpRight className="size-4" />
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
