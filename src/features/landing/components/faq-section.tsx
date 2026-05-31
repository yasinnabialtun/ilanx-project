"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "Tasarım bilgisine sahip olmam veya ekibime eğitim vermem gerekiyor mu?",
    answer: "Kesinlikle hayır. İlanX'i Word veya Paint kullanabilen herkesin ustalaşabileceği şekilde 'sıfır öğrenme eğrisiyle' tasarladık. Ofisinizdeki tüm danışmanlar sisteme girdikleri ilk 10 saniyede profesyonel tasarım yapmaya başlayabilir.",
  },
  {
    question: "Portföyün yanındayken mobilden yapabilir miyim?",
    answer: "Evet! Kurulum veya indirme (Setup) süresi 0 saniyedir. Tamamen bulut tabanlıdır. İster bilgisayardan ister akıllı telefonunuzdan girin, saniyeler içinde çiziminizi yapıp WhatsApp'tan müşterinize gönderin.",
  },
  {
    question: "Tasarım ajansına göre avantajı nedir?",
    answer: "Bir ajansla çalışmak hem yüksek bütçe gerektirir hem de günlerce revizyon beklemenize neden olur. İlanX ile ajans kalitesinde (3D tabelalar, neon sınırlar) çıktıyı 15 saniyede, dışarıda bir kahve içeceğiniz fiyata üretirsiniz. Zamanınız ve paranız size kalır.",
  },
  {
    question: "Dışa aktardığım videoları hangi platformlarda paylaşabilirim?",
    answer: "Çıktılarınızı yüksek çözünürlüklü görsel (PNG) veya dikkat çeken hareketli video (MP4) olarak anında indirebilirsiniz. Sahibinden, Emlakjet, Instagram Reels veya WhatsApp durumları için kusursuz optimize edilmiştir.",
  },
  {
    question: "Kredi kartı girmem gerekiyor mu? Gizli maliyetler var mı?",
    answer: "Kredi kartı bilgisine veya peşin ödemeye ihtiyacınız yok. Sistemi hemen şimdi ücretsiz test edebilirsiniz. Sonuçların satışlarınızı nasıl hızlandırdığını kendi gözlerinizle gördükten sonra sınırsız lisansa geçiş yapabilirsiniz.",
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
