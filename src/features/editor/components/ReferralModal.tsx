"use client";

import { useEffect, useState } from "react";
import { Copy, Gift, Send, Sparkles, X, CheckCircle2 } from "lucide-react";
import { useEditorStore } from "@/features/editor/store/editorStore";

function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "REF-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function ReferralModal() {
  const isOpen = useEditorStore((s) => s.referralModalOpen);
  const setOpen = useEditorStore((s) => s.setReferralModalOpen);
  
  const [refCode, setRefCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let code = localStorage.getItem("ilanx_referral_code");
      if (!code) {
        code = generateReferralCode();
        localStorage.setItem("ilanx_referral_code", code);
      }
      setRefCode(code);
    }
  }, []);

  if (!isOpen) return null;

  const shareText = `Merhaba! Emlak ilan görsellerimi artık saniyeler içinde hazırlıyorum. Sen de benim davet kodumla ( ${refCode} ) lisans satın alırsan, ikimiz de +1 Ay Ücretsiz kullanım kazanacağız! İncelemek için: https://siteniz.com`;

  const handleCopy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/?text=" + encodeURIComponent(shareText), "_blank");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-emerald-500/10 animate-in zoom-in-95 duration-200 overflow-hidden relative">
        
        {/* Kapat Butonu */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header/Hero */}
        <div className="bg-gradient-to-b from-emerald-500/20 to-transparent p-8 text-center border-b border-white/5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
            <Gift className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Arkadaşını Getir,<br/>İkiniz de Kazanın!</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Meslektaşlarınızı İlanX'e davet edin. Arkadaşınız sizin kodunuzla lisans aldığında, **hem sizin hem de onun** mevcut lisansına <span className="text-emerald-400 font-semibold">+1 Ay Ücretsiz Kullanım</span> hediye edelim!
          </p>
        </div>

        {/* Davet Kodu Alanı */}
        <div className="p-8">
          <div className="mb-6">
            <label className="block text-xs font-medium text-zinc-500 mb-2 text-center uppercase tracking-wider">
              Size Özel Davet Kodunuz
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/5 px-4 py-3 text-center">
                <span className="text-xl font-mono font-bold tracking-widest text-emerald-400">
                  {refCode || "YÜKLENİYOR..."}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
                title="Kodu Kopyala"
              >
                {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <Send className="h-4 w-4" />
            WhatsApp ile Arkadaşına Gönder
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
            <Sparkles className="h-3 w-3" />
            Ne kadar çok davet, o kadar çok hediye ay! Sınır yok.
          </div>
        </div>
        
      </div>
    </div>
  );
}
