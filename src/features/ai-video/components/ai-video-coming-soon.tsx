"use client";

import { motion } from "framer-motion";
import { Sparkles, Clock, Mail, Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useState } from "react";

export function AIVideoComingSoon() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNotify = () => {
    if (email) {
      // Here you could add API call to save email for notification
      setSubscribed(true);
    }
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs text-indigo-400 font-semibold tracking-wider uppercase mb-6">
            <Clock className="w-3.5 h-3.5" />
            Çok Yakında
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
        >
          Yapay Zeka Video Stüdyosu
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Çok Yakında!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10"
        >
          İlan görsellerinizi saniyeler içinde sinematik geçişler, profesyonel müzikler 
          ve akıllı metinlerle süslenmiş büyüleyici videolara dönüştürecek yapay zeka 
          stüdyomuz üzerinde son rötuşları yapıyoruz.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-md mx-auto"
        >
          {!subscribed ? (
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="E-posta adresiniz..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 transition"
              />
              <Button
                onClick={handleNotify}
                disabled={!email}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-6 rounded-xl gap-2"
              >
                <Bell className="w-4 h-4" />
                Haber Ver
              </Button>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-400 font-medium">
              🎉 Teşekkürler! Yayına geçtiğimizde size haber vereceğiz.
            </div>
          )}
          <p className="text-xs text-zinc-500 mt-3">
            Ücretsizdir, istediğiniz zaman abonelikten ayrılabilirsiniz.
          </p>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {[
            {
              emoji: "🎬",
              title: "AI Video Üretimi",
              desc: "Görsellerinizden saniyeler içinde profesyonel emlak videoları oluşturun."
            },
            {
              emoji: "🎵",
              title: "Akıllı Müzik & Efektler",
              desc: "Otomatik sinematik geçişler, arka plan müzikleri ve metin vurguları."
            },
            {
              emoji: "📱",
              title: "Sosyal Medya Formatları",
              desc: "Reels, YouTube ve Instagram için optimize edilmiş video formatları."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-left hover:bg-white/[0.06] transition">
              <div className="text-3xl mb-3">{feature.emoji}</div>
              <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}