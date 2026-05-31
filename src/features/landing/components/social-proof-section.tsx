"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const stats = [
  { value: "1.200+", label: "Emlak Profesyoneli" },
  { value: "25.000+", label: "Hazırlanan Çizim" },
  { value: "%40", label: "Daha Hızlı Satış Süresi" },
  { value: "150+", label: "Emlak Ofisi Üyesi" },
]

const testimonials = [
  {
    name: "Ahmet Y.",
    role: "Broker / Ofis Kurucusu",
    company: "Century 21",
    content: "İlanX'e geçmeden önce ayda 6.000 TL grafik tasarım bütçemiz vardı ve ilanlar hep gecikiyordu. Şu an 12 kişilik ekibimiz kendi bilgisayarlarından tüm ilanları saniyeler içinde tasarlıyor. Tıklanma oranlarımız %40 arttı, maliyetimiz sıfırlandı.",
    rating: 5,
  },
  {
    name: "Zeynep Kaya",
    role: "Lüks Konut Uzmanı",
    company: "Keller Williams",
    content: "Özellikle milyon dolarlık portföylerde kalite çok önemli. İlanX'in sunduğu 3D altın etiketler ve neon sınırlar, lüks portföylerimize inanılmaz bir prestij ve güven kattı. Sadece 15 saniyede ajans kalitesinde iş çıkarıyoruz.",
    rating: 5,
  },
  {
    name: "Mehmet Demir",
    role: "Senior Emlak Danışmanı",
    company: "Remax Türkiye",
    content: "Sahibinden'e dümdüz fotoğraf koyma devri bitti. Kurumsal logomuzu ve hareketli pinleri videolu (MP4) olarak WhatsApp'tan gönderdiğim an müşterilerin tepkisi inanılmaz oluyor. Dönüşüm oranım zirvede.",
    rating: 5,
  },
]

export function SocialProofSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-6 md:grid-cols-4 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-gradient sm:text-4xl lg:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Başarılı Ofislerin Ortak Tercihi
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="glass-card rounded-2xl p-6"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-chart-4 text-chart-4" />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6">
                {`"${testimonial.content}"`}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-chart-2" />
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
