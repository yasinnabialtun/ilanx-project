"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, PlayCircle, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export const BeforeAfterShowcase = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden bg-neutral-950">
      {/* Background Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black text-white mb-6"
          >
            Sıradan Fotoğraflar, <br className="md:hidden" />
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Sıradışı Videolar
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Elinizdeki statik ilan fotoğraflarını İlanX'e yükleyin. Yapay zeka saniyeler içinde sinematik geçişler, müzik ve metinlerle süslenmiş büyüleyici bir video üretsin.
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          
          {/* Before (Static Image) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative group rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 aspect-[9/16] md:aspect-[4/5] shadow-2xl"
          >
            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 text-sm font-medium text-white/80">
              <ImageIcon className="w-4 h-4" />
              Sizin Yüklediğiniz
            </div>
            {/* Standard house interior photo mockup */}
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800" 
              alt="Before" 
              className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale-[20%]"
            />
          </motion.div>

          {/* Arrow / Transformation icon */}
          <div className="hidden md:flex flex-col items-center justify-center relative">
            <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full animate-ping" />
            <div className="w-16 h-16 bg-neutral-900 border border-indigo-500/30 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <ArrowRight className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          {/* After (Dynamic Video) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-indigo-500/50 bg-neutral-900 aspect-[9/16] md:aspect-[4/5] shadow-[0_0_50px_rgba(99,102,241,0.2)]"
          >
            <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4" />
              İlanX Sonucu
            </div>
            
            {/* The Video or Mockup */}
            <div className="absolute inset-0 w-full h-full bg-black group" onClick={() => setIsPlaying(!isPlaying)}>
              <img 
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800" 
                alt="After" 
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] ease-linear ${isPlaying ? 'scale-125' : 'scale-100'}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />
              
              {/* Fake UI Overlay simulating the reel output */}
              <div className="absolute bottom-12 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                  <h3 className="text-white font-bold text-xl mb-1">₺15.000.000</h3>
                  <p className="text-white/80 text-sm">3+1 Lüks Daire • Beşiktaş</p>
                </div>
              </div>

              {/* Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-pointer">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                    <PlayCircle className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
