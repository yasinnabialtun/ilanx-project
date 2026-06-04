"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Film, Image as ImageIcon, Sparkles, LayoutTemplate, Clock, MessageSquare, Play, Music, Settings2, GripVertical, ChevronDown, ChevronUp, Link2, Loader2 } from "lucide-react";
import { useAIVideoStore, VideoFormat, VideoDuration, VideoTemplate, VideoMusic, SubtitleStyle } from "../store/use-ai-video-store";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";
import { PaywallModal } from "./paywall-modal";
import { LoginModal } from "@/features/auth/components/login-modal";
import { useSession, signIn } from "next-auth/react";

export const AIVideoSidebar = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const [importUrl, setImportUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  
  const { data: session } = useSession();
  const dbCredits = session?.user ? (session.user as any).credits : 0;
  
  const {
    images,
    format,
    duration,
    template,
    music,
    prompt,
    showLogo,
    subtitleStyle,
    isGenerating,
    addImages,
    removeImage,
    setFormat,
    setDuration,
    setTemplate,
    setMusic,
    setPrompt,
    setShowLogo,
    setSubtitleStyle,
    startGeneration,
    setGenerationProgress,
    setResultVideoUrl,
    reset
  } = useAIVideoStore();

  const handleImportListing = async () => {
    if (!importUrl) {
      alert("Lütfen bir ilan linki girin.");
      return;
    }
    
    setIsImporting(true);
    setImportMessage("İlan analiz ediliyor...");
    
    try {
      const response = await fetch("/api/video/import-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "İçe aktarım sırasında bir hata oluştu.");
      }
      
      setImportMessage("Görseller ve yapay zeka talimatı yerleştiriliyor...");
      
      // Clear previous states
      reset();
      
      if (data.images && data.images.length > 0) {
        addImages(data.images);
      }
      
      if (data.prompt) {
        setPrompt(data.prompt);
      }
      
      setImportMessage(data.simulated ? "İlan başarıyla simüle edilerek aktarıldı!" : "İlan başarıyla aktarıldı!");
      setImportUrl("");
      
      setTimeout(() => {
        setImportMessage(null);
      }, 4000);
      
    } catch (error: any) {
      console.error("Listing Import Client Error:", error);
      alert(error.message || "İlan aktarılırken bir hata oluştu.");
      setImportMessage(null);
    } finally {
      setIsImporting(false);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1080;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 8) {
        alert("En fazla 8 görsel yükleyebilirsiniz.");
        return;
      }
      
      const compressedImages = [];
      for (const file of newFiles) {
        const compressedBase64 = await compressImage(file);
        compressedImages.push(compressedBase64);
      }
      
      addImages(compressedImages);
    }
  };

  const handleGenerate = async () => {
    if (!session) {
      setShowLogin(true);
      return;
    }

    if (images.length === 0) {
      alert("Lütfen en az 1 görsel yükleyin.");
      return;
    }

    if (dbCredits <= 0) {
      setShowPaywall(true);
      return;
    }
    
    startGeneration();
    setGenerationProgress(10, "Görseller yükleniyor...");
    
    // Call the mock server API
    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          images,
          format,
          duration,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 403) {
          setShowPaywall(true);
        } else {
          alert("Bir hata oluştu: " + data.error);
        }
        setResultVideoUrl("");
        startGeneration(); // Toggle off
        return;
      }
      
      const jobId = data.jobId;
      if (!jobId) {
        alert("Video başlatılamadı.");
        return;
      }

      setGenerationProgress(20, "Yapay zeka motoru başlatılıyor...");

      // Start Polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/video/status?jobId=${jobId}&prompt=${encodeURIComponent(prompt)}`);
          const statusData = await statusRes.json();

          if (statusData.status === "succeeded") {
            clearInterval(pollInterval);
            // Note: Assuming setCredits is available or handled via session refresh
            setResultVideoUrl(statusData.videoUrl);
            setGenerationProgress(100, "Tamamlandı!");
            startGeneration(); // Toggle off
          } else if (statusData.status === "failed" || statusData.status === "canceled") {
            clearInterval(pollInterval);
            alert("Video üretimi başarısız oldu. Krediniz iade edildi.");
            setResultVideoUrl("");
            startGeneration(); // Toggle off
          } else {
            // Still processing
            // We just set to a static 50% for visual feedback during processing since we don't have access to prev state directly here
            setGenerationProgress(
              50,
              statusData.status === "processing" ? "Kareler işleniyor..." : "Sırada bekleniyor..."
            );
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 5000); // Check every 5 seconds

    } catch (error) {
      console.error(error);
      alert("Sunucuya bağlanılamadı.");
      setResultVideoUrl("");
      startGeneration(); // Toggle off
    }
  };

  return (
    <div className="flex flex-col h-full text-white/90 p-6 space-y-8 pb-32 relative">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Yapay Zeka Stüdyosu
        </h2>
        <p className="text-xs text-white/50 mt-1">İlan görsellerinizi saniyeler içinde dinamik videolara dönüştürün.</p>
      </div>

      {/* Akıllı İlan İçe Aktarımı */}
      <div className="relative group bg-neutral-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-indigo-500/30">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition duration-500"></div>
        <div className="relative space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2 text-indigo-300">
            <Link2 className="w-4 h-4" />
            🔗 Akıllı İlan Aktarımı (EmlakçıGPT)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Sahibinden veya Hepsiemlak linki..."
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                disabled={isImporting}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 transition duration-200"
              />
              {isImporting && (
                <Loader2 className="absolute right-2.5 top-3 w-4 h-4 text-indigo-400 animate-spin" />
              )}
            </div>
            <Button
              onClick={handleImportListing}
              disabled={isImporting || !importUrl}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 rounded-xl transition duration-200 shadow-md flex items-center gap-1.5"
            >
              {isImporting ? "Aktarılıyor" : "Aktar"}
            </Button>
          </div>
          {importMessage && (
            <p className={cn(
              "text-[11px] font-medium transition-all duration-300 animate-pulse",
              importMessage.includes("Hata") || importMessage.includes("başarısız") 
                ? "text-red-400" 
                : importMessage.includes("Başarıyla") 
                ? "text-emerald-400" 
                : "text-indigo-300"
            )}>
              {importMessage}
            </p>
          )}
          <p className="text-[10px] text-white/40 leading-relaxed">
            Desteklenenler: Sahibinden, Hepsiemlak, Emlakjet, Emlak acente siteleri vb.
          </p>
        </div>
      </div>

      {/* 1. Görsel Yükleme (Storyboard) */}
      <div className="space-y-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 shadow-inner">
        <label className="text-sm font-medium flex items-center gap-2 text-indigo-300">
          <ImageIcon className="w-4 h-4" />
          1. Görseller (Film Şeridi)
        </label>
        
        {images.length === 0 ? (
          <div 
            className="border-2 border-dashed border-indigo-500/30 rounded-xl p-6 flex flex-col items-center justify-center gap-3 bg-indigo-500/5 hover:bg-indigo-500/10 transition cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-indigo-400/70" />
            <span className="text-sm text-white/70 text-center">Görselleri sürükleyin veya <span className="text-indigo-400 font-medium">tıklayıp seçin</span></span>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-thin scrollbar-thumb-white/10">
              {images.map((img, idx) => (
                <div key={idx} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden group bg-black/50 snap-center border border-white/10 hover:border-indigo-500/50 transition-all">
                  <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center">
                    <button onClick={() => removeImage(idx)} className="bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 transition mb-1">
                      <X className="w-3 h-3" />
                    </button>
                    <GripVertical className="w-4 h-4 text-white/50 cursor-grab" />
                  </div>
                  <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 rounded text-[10px] font-mono text-white/70">{idx + 1}</div>
                </div>
              ))}
              {images.length < 8 && (
                <button onClick={() => fileInputRef.current?.click()} className="shrink-0 w-24 h-24 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-white/40 hover:text-white/80 hover:border-white/40 transition snap-center">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Ekle</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
          </div>
        )}
      </div>

      {/* 2. Format & Şablon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Film className="w-4 h-4 text-white/70" />
            Video Formatı
          </label>
          <div className="flex flex-col gap-2">
            {(['9:16', '16:9', '1:1'] as VideoFormat[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left flex justify-between items-center",
                  format === f ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                )}
              >
                <span>{f === '9:16' ? "📱 Reels/TikTok" : f === '16:9' ? "💻 YouTube" : "🟦 Instagram Post"}</span>
                <span className="text-[10px] opacity-50">{f}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-white/70" />
            Kurgu Şablonu
          </label>
          <div className="flex flex-col gap-2">
            {[
              { id: 'dynamic', label: 'Dinamik Slayt' },
              { id: 'cinematic', label: 'Sinematik Zoom' },
              { id: 'luxury', label: 'Lüks Emlak' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id as VideoTemplate)}
                className={cn(
                  "py-2 px-3 text-left rounded-lg text-xs font-medium border transition-all",
                  template === t.id ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Müzik Seçimi */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Music className="w-4 h-4 text-white/70" />
          Arka Plan Müziği
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'tiktok_trend', label: 'Trend Reels Beat' },
            { id: 'luxury_beat', label: 'Lüks & Modern' },
            { id: 'ambient', label: 'Sakin / Kurumsal' },
            { id: 'none', label: 'Müzik Yok' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMusic(m.id as VideoMusic)}
              className={cn(
                "py-2 px-3 text-left rounded-lg text-xs font-medium border transition-all",
                music === m.id ? "bg-purple-500/20 border-purple-500 text-purple-300" : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Süre Seçimi */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/70" />
          Video Süresi: <span className="text-indigo-400 font-bold">{duration} Saniye</span>
        </label>
        <input 
          type="range" min="5" max="30" step="5" value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) as VideoDuration)}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-white/40 px-1">
          <span>5s</span><span>15s</span><span>30s</span>
        </div>
      </div>

      {/* 5. Gelişmiş Ayarlar (Accordion) */}
      <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 text-sm font-medium text-white/80 hover:bg-white/5 transition"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-white/50" />
            Gelişmiş Ayarlar
          </div>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showAdvanced && (
          <div className="p-4 pt-0 space-y-4 border-t border-white/10 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Videoda Logo Gösterimi</span>
              <button 
                onClick={() => setShowLogo(!showLogo)}
                className={cn("w-10 h-5 rounded-full relative transition-colors", showLogo ? "bg-indigo-500" : "bg-white/20")}
              >
                <div className={cn("w-3 h-3 bg-white rounded-full absolute top-1 transition-all", showLogo ? "right-1" : "left-1")} />
              </button>
            </div>
            
            <div className="space-y-2">
              <span className="text-xs text-white/70">Metin/Etiket Stili</span>
              <select 
                value={subtitleStyle}
                onChange={(e) => setSubtitleStyle(e.target.value as SubtitleStyle)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="dynamic">Dinamik Çıkan Etiketler</option>
                <option value="cinematic">Sinematik Alt Yazı</option>
                <option value="none">Metin Yok (Sadece Görsel)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 6. ChatGPT Style Prompt Area (Prominent) */}
      <div className="space-y-3 pb-4">
        <label className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          Yapay Zekaya Talimat (Prompt)
        </label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <textarea 
            placeholder="Örn: 'Acil satılık' yazısını kırmızıyla vurgula, çok enerjik bir video olsun..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="relative w-full h-24 bg-neutral-900 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500 resize-none shadow-inner transition-all"
          />
        </div>
      </div>

      {/* Space for fixed bottom button */}
      <div className="h-10"></div>

      {/* Generate Button (Sticky Bottom) */}
      <div className="fixed bottom-0 right-0 w-full lg:w-[450px] p-5 bg-gradient-to-t from-neutral-950 via-neutral-950/90 to-transparent z-40">
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || images.length === 0}
          className="w-full h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all gap-2 text-lg relative overflow-hidden"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Üretiliyor...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 fill-current" />
              Yapay Zeka ile Video Üret
              {session && (
                <div className="absolute top-1 right-2 text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-mono">
                  {dbCredits} Kredi
                </div>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Modals */}
      <PaywallModal isOpen={showPaywall} onClose={() => setShowPaywall(false)} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />

    </div>
  );
};
