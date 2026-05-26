"use client"

import { motion } from "framer-motion"
import { Home, Building2, MapPin, Users } from "lucide-react"

const useCases = [
  {
    icon: Home,
    title: "Konut Arsaları",
    description: "Müşterilerinize konut arsalarının sınırlarını, 3D konumlarını ve neon sınır çizgilerini net bir şekilde gösterin.",
    bgColor: "bg-chart-4/10",
    textColor: "text-chart-4",
  },
  {
    icon: Building2,
    title: "Ticari Gayrimenkul",
    description: "İş yeri ve ticari alanlar için 3D ev, para ikonları ve cam/ahşap tabelalarla profesyonel sunumlar hazırlayın.",
    bgColor: "bg-chart-2/10",
    textColor: "text-chart-2",
  },
  {
    icon: MapPin,
    title: "Arazi Satışları",
    description: "Tarla ve bahçe gibi geniş arazilerde polygon çizimleri ve özel markalama (logo) ile güven verin.",
    bgColor: "bg-primary/10",
    textColor: "text-primary",
  },
  {
    icon: Users,
    title: "Sosyal Medya Sunumları",
    description: "Video export özelliğiyle sosyal medya hesaplarınız için hareketli ve animasyonlu ilan videoları oluşturun.",
    bgColor: "bg-chart-5/10",
    textColor: "text-chart-5",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
}

export function UseCasesSection() {
  return (
    <section id="use-cases" className="relative py-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-chart-4/10 blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Kullanım Alanları
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Her türlü gayrimenkul için profesyonel arsa çizim çözümleri.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2"
        >
          {useCases.map((useCase) => (
            <motion.div
              key={useCase.title}
              variants={item}
              className="group"
            >
              <div className="glass-card rounded-2xl p-6 h-full transition-all duration-300 hover:border-primary/50 flex gap-5">
                {/* Icon */}
                <div className={`flex-shrink-0 h-14 w-14 rounded-xl ${useCase.bgColor} flex items-center justify-center ${useCase.textColor} group-hover:scale-110 transition-transform`}>
                  <useCase.icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
