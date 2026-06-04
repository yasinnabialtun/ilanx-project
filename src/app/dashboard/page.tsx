"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Navbar } from "@/features/landing/components/navbar";
import { Video, CreditCard, PlayCircle, Download, ArrowRight, Gift, Copy, Sparkles, Loader2, Play, VideoIcon } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { PaywallModal } from "@/features/ai-video/components/paywall-modal";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [showPaywall, setShowPaywall] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchVideos();
    }
  }, [status]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const buyPkg = params.get("buy");

    if (buyPkg) {
      if (status === "authenticated") {
        const handleAutoPurchase = async () => {
          setCheckoutLoading(true);
          try {
            const response = await fetch("/api/shopier/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ packageId: buyPkg })
            });
            const data = await response.json();
            if (data.success && data.action && data.inputs) {
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
              setCheckoutLoading(false);
            }
          } catch (err) {
            console.error("Auto purchase error:", err);
            alert("Bir hata oluştu.");
            setCheckoutLoading(false);
          }
        };
        handleAutoPurchase();
      } else if (status === "unauthenticated") {
        // Automatically redirect to google login and preserve search query
        signIn("google", { callbackUrl: window.location.href });
      }
    }
  }, [status]);

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const res = await fetch("/api/video/list");
      const data = await res.json();
      if (data.success) {
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error("Videolar yüklenirken hata oluştu:", err);
    } finally {
      setLoadingVideos(false);
    }
  };

  if (status === "loading" || checkoutLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        {checkoutLoading && (
          <p className="text-white/60 text-sm animate-pulse">Ödeme sayfasına güvenli bir şekilde yönlendiriliyorsunuz...</p>
        )}
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col h-screen bg-neutral-950 overflow-hidden">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Panele Erişmek İçin Giriş Yapın</h1>
            <Button onClick={() => signIn("google")} className="bg-white text-black hover:bg-white/90">
              Google ile Giriş Yap
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const credits = session?.user ? (session.user as any).credits : 0;
  const user = session?.user as any;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <div className="h-16 shrink-0 border-b border-white/10 z-50 bg-neutral-950">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-8">
        
        {/* Header */}
        <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Hoş Geldin, {session?.user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-white/60">Yapay zeka video stüdyonuza ve geçmiş çalışmalarınıza buradan ulaşabilirsiniz.</p>
          </div>

          {/* Stats & Referral Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            
            {/* Credits Card */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                  <CreditCard className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm font-medium">Kalan Krediniz</h3>
                  <div className="text-3xl font-black text-white">{credits}</div>
                </div>
              </div>
              <Button onClick={() => window.location.href = "/ai-video"} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold gap-2">
                Stüdyoya Git <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Buy Credits Card */}
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm font-medium">Kredi Yükle</h3>
                  <div className="text-sm font-medium text-white/60 mt-1">Shopier ile güvenle</div>
                </div>
              </div>
              <Button onClick={() => setShowPaywall(true)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold gap-2 border border-white/10">
                Paketleri İncele
              </Button>
            </div>

            {/* Referral / Gift Card */}
            <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden group flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                    <Gift className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded">BEDAVA KREDİ</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1 mt-2">Arkadaşını Davet Et</h3>
                <p className="text-emerald-100/60 text-xs mb-4">
                  Bu linkle kayıt olan her arkadaşınız için siz de o da <strong>+1 Kredi</strong> kazanırsınız.
                </p>
              </div>
              
              <div className="flex items-center gap-2 bg-black/40 border border-emerald-500/20 rounded-lg p-2 mt-auto">
                <code className="text-[10px] text-emerald-300 font-mono truncate flex-1">
                  https://ilanx.com/?ref={user?.id?.substring(0, 8) || "demo"}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://ilanx.com/?ref=${user?.id?.substring(0, 8) || "demo"}`);
                    alert("Kopyalandı!");
                  }}
                  className="p-1.5 hover:bg-emerald-500/20 rounded-md transition-colors text-emerald-400 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        {/* Video History */}
        <div>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Play className="w-5 h-5 text-indigo-400" />
            Geçmiş Videolarım
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingVideos ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/50">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <span>Videolarınız yükleniyor...</span>
              </div>
            ) : videos.map((video) => (
              <div key={video.id} className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden group">
                <div className="aspect-[9/16] relative bg-neutral-900">
                  <video 
                    src={video.url} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    muted loop playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button size="sm" className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20">
                        <Download className="w-4 h-4 mr-2" /> İndir
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-white line-clamp-2 mb-2">"{video.prompt}"</p>
                  <p className="text-xs text-white/40">
                    {new Date(video.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            ))}
            
            {!loadingVideos && videos.length === 0 && (
              /* Empty State placeholder */
              <div className="col-span-full aspect-[9/16] max-w-sm mx-auto border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center bg-white/[0.02]">
                <VideoIcon className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-sm text-white/50">Daha fazla video ürettikçe burada listelenecektir.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
