"use client"

import { motion } from "framer-motion"
import { Upload, MousePointer2, FileOutput } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Görsel Yükle",
    description: "Arsa fotoğrafınızı veya harita görselinizi platforma yükleyin.",
  },
  {
    number: "02",
    icon: MousePointer2,
    title: "Düzenle ve Efekt Ekle",
    description: "Sınırları çizin, 3D metinler, lokasyon pinleri ve kendi logonuzu ekleyerek kişiselleştirin.",
  },
  {
    number: "03",
    icon: FileOutput,
    title: "Paylaş & Video Çıktısı Al",
    description: "Projenizi isterseniz yüksek kaliteli fotoğraf, isterseniz animasyonlu video (MP4) olarak indirin.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Nasıl Çalışır?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Sadece 3 adımda profesyonel arsa çizimleri oluşturun.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Connector dot */}
                <div className="hidden lg:flex absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary z-10">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                </div>

                <div className="glass-card rounded-2xl p-8 text-center lg:mt-8">
                  {/* Step number */}
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>

                  <div className="text-sm font-mono text-primary mb-2">{step.number}</div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector - mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <svg className="h-8 w-8 text-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14m-7-7l7 7 7-7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
