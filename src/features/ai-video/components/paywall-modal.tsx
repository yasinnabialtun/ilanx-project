"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PACKAGES = [
  {
    id: "pkg_1",
    title: "10 Video",
    price: "₺200",
    features: ["10 Yüksek Çözünürlüklü Video", "Filigransız İndirme", "Tüm Şablonlar"],
    popular: false,
  },
  {
    id: "pkg_2",
    title: "50 Video",
    price: "₺750",
    features: ["50 Yüksek Çözünürlüklü Video", "Filigransız İndirme", "Tüm Şablonlar", "Öncelikli Render (Hızlı)"],
    popular: true,
  },
  {
    id: "pkg_3",
    title: "100 Video",
    price: "₺1200",
    features: ["100 Yüksek Çözünürlüklü Video", "Filigransız İndirme", "Tüm Şablonlar", "Öncelikli Render (Hızlı)", "7/24 Öncelikli Destek"],
    popular: false,
  }
];

export const PaywallModal = ({ isOpen, onClose }: PaywallModalProps) => {
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (pkgId: string) => {
    setLoadingPkg(pkgId);
    
    try {
      // API call to our Shopier checkout route
      const response = await fetch("/api/shopier/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkgId })
      });
      
      const data = await response.json();
      
      if (data.success && data.action && data.inputs) {
        // Shopier expects a form POST to redirect to checkout page
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.action;
        
        Object.entries(data.inputs).forEach(([key, val]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = val as string;
          form.appendChild(input);
        });
        
        document.body.appendChild(form);
        form.submit();
      } else {
        alert(data.message || "Ödeme altyapısına bağlanırken bir sorun oluştu.");
        setLoadingPkg(null);
      }
    } catch (error) {
      console.error(error);
      alert("Bir hata oluştu.");
      setLoadingPkg(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Sparkles className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Yetersiz Kredi</h2>
          <p className="text-white/60 max-w-lg mx-auto">
            Video oluşturmak için krediniz bulunmuyor. Stüdyo kalitesinde, sosyal medya uyumlu videolar üretmek için bir kredi paketi seçin.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-0">
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.id} 
              className={cn(
                "relative bg-black/40 border rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1",
                pkg.popular 
                  ? "border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.2)]" 
                  : "border-white/10 hover:border-white/20"
              )}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  En Çok Tercih Edilen
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{pkg.title}</h3>
              <div className="text-3xl font-black text-white mb-6">{pkg.price}</div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handlePurchase(pkg.id)}
                disabled={loadingPkg !== null}
                className={cn(
                  "w-full h-12 font-bold rounded-xl gap-2",
                  pkg.popular 
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                {loadingPkg === pkg.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Satın Al
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
        
        {/* Security Footer */}
        <div className="bg-black/50 p-4 border-t border-white/10 text-center flex items-center justify-center gap-2 text-xs text-white/40">
          <CreditCard className="w-4 h-4" />
          Ödemeleriniz <strong className="text-white/60">Shopier</strong> güvencesiyle 256-bit SSL ile şifrelenerek gerçekleşir.
        </div>

      </div>
    </div>
  );
};
