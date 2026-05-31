"use client"

import { motion } from "framer-motion"
import { AlertCircle, Clock, DollarSign, Ban } from "lucide-react"

const problems = [
  {
    icon: Ban,
    title: "İlan Sitelerinde Kaybolmak",
    description: "Satışa hazır muazzam bir portföy aldınız. Ancak fotoğrafı ilana koyduğunuzda, diğer 5.000 standart fotoğraf arasında kaybolup gidiyor. Tıklanma oranlarınız düşüyor.",
  },
  {
    icon: DollarSign,
    title: "Ajanslara Servet Ödemek",
    description: "Dikkat çekmek için ajansa veya grafikere verseniz, 3 gününüzü ve yüzlerce liranızı alacak. Kar marjınız erirken ilanlarınız gecikecek.",
  },
  {
    icon: Clock,
    title: "Kaçan Müşteriler ve Uzayan Süreç",
    description: "Alıcılar kötü sunulmuş portföyleri hızla geçer. Uzayan satış süreleri, sinirlenen mülk sahipleri ve kaçan komisyon fırsatlarıyla baş başa kalırsınız.",
  },
]

export function ProblemSection() {
  return (
    <section className="relative py-24 overflow-hidden border-t border-border bg-background/50">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-destructive/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-1.5 text-sm text-destructive-foreground mb-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            Acı Gerçek
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Sıradan İlanlarla <span className="text-destructive">Satışları Neden Kaybediyorsunuz?</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Portföyünüz ne kadar değerli olursa olsun, alıcılar ilk 3 saniyede görsele bakarak karar verir. Kötü sunum satış süresini haftalarca uzatır.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {problems.map((prob, index) => (
            <motion.div
              key={prob.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="glass-card rounded-2xl p-8 h-full border border-border/50 transition-all duration-300 hover:border-destructive/30 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                {/* Icon */}
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive group-hover:text-white">
                  <prob.icon className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-destructive transition-colors">
                  {prob.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prob.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
