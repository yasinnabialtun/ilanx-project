"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Sparkles, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { signIn } from "next-auth/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4"
          >
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                <Sparkles className="w-10 h-10 text-indigo-400 -rotate-3" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Harika Bir Seçim!</h2>
              <p className="text-white/60 mb-8 text-sm px-4">
                Videonuzu render etmeye başlamak ve <strong className="text-indigo-400">1 Ücretsiz Kredi</strong> kazanmak için tek tıkla giriş yapın.
              </p>
              
              <Button 
                onClick={() => signIn("google")} 
                className="w-full h-14 bg-white text-black hover:bg-white/90 font-bold text-lg gap-3 rounded-xl"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Google ile Devam Et
              </Button>
              
              <p className="text-xs text-white/40 mt-6 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Güvenli Google Kimlik Doğrulaması
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
