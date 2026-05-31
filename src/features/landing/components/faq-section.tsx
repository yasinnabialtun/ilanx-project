"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "Tasarım bilmem gerekiyor mu?",
    answer: "Hayır. Paint veya Word kullanabiliyorsanız İlanX'i de rahatça kullanırsınız. Her şey sürükle-bırak mantığıyla çalışır. Sisteme girer girmez hiçbir eğitim almadan ilk görselinizi hazırlayabilirsiniz.",
  },
  {
    question: "Mülk ziyaretindeyken cepten halledebilir miyim?",
    answer: "Evet, program indirmenize gerek yok. Telefondan sisteme girip mülkün fotoğrafını çeker çekmez sınırlarını çizebilir ve anında WhatsApp'tan müşterinize atabilirsiniz.",
  },
  {
    question: "Ajansla veya tasarımcıyla çalışmaktan farkı ne?",
    answer: "Ajansa her ilan için ayrı para öder ve günlerce beklersiniz. İlanX ile saniyeler içinde kimseye muhtaç olmadan aynı kalitede profesyonel görseller hazırlarsınız. Paranız ve zamanınız cebinizde kalır.",
  },
  {
    question: "Çıktıları nerelerde kullanabilirim?",
    answer: "Sahibinden, Emlakjet, Hepsiemlak gibi tüm ilan sitelerine direkt yükleyebilirsiniz. Ayrıca Instagram (Post/Reels) ve WhatsApp durumunuzda paylaşmanız için de formatlar her zaman hazırdır.",
  },
  {
    question: "Denemek ücretli mi? Kredi kartı girecek miyim?",
    answer: "Hayır, kredi kartı gerekmez. Sisteme girip hemen ücretsiz deneyebilirsiniz. Sadece tüm özellikleri limitsiz ve filigransız kullanmak istediğinizde lisans almanız gerekir.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="relative py-24 overflow-hidden border-t border-border bg-background">
      {/* Background decorations */}
      <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 h-96 w-96 rounded-full bg-chart-2/5 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <HelpCircle className="h-4 w-4 text-primary" />
            Merak Edilenler
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Sıkça Sorulan Sorular
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Aklınıza takılan tüm soruların cevapları burada. Satışa giden yolda engel bırakmıyoruz.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="glass-card rounded-2xl border border-border/50 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground transition-colors group-hover:text-foreground">
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 text-sm text-muted-foreground border-t border-border/30 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
