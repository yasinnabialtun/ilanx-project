"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Navbar } from "@/features/landing/components/navbar";
import { Video, PlayCircle, Download, ArrowRight, Copy, Sparkles, Loader2, Play, VideoIcon, PenTool } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchVideos();
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

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
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

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            
            {/* AI Studio Card */}
            <Link href="/ai-video">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">AI Video Stüdyosu</h3>
                    <div className="text-sm text-white/50">Görsellerden video oluşturun</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Stüdyoya Git <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Editor Card */}
            <Link href="/editor">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20">
                    <PenTool className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Arsa İşaretleme</h3>
                    <div className="text-sm text-white/50">3D etiketlerle profesyonel görseller</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium group-hover:gap-3 transition-all">
                  Düzenleyiciye Git <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

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
                <p className="text-sm text-white/50">Henüz hiç video oluşturmadınız. Hemen stüdyoya gidin ve ilk videonuzu oluşturun.</p>
                <Link href="/ai-video" className="mt-4">
                  <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                    AI Video Stüdyosuna Git <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}