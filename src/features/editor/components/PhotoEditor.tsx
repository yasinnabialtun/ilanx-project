"use client";

import { useState, useEffect } from "react";
import { 
  Keyboard, 
  X, 
  Smartphone, 
  ShieldAlert, 
  Video,
  Cloud,
  Check,
  RefreshCw
} from "lucide-react";

import { EditorCanvas } from "./EditorCanvas";
import { ImageUploadArea } from "./ImageUploadArea";
import { SidePanel } from "./SidePanel";
import { Toolbar } from "./Toolbar";
import { EmptyState } from "./EmptyState";
import { TimelineControls } from "./TimelineControls";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { LicenseModal } from "./LicenseModal";
import { OnboardingTour } from "./OnboardingTour";
import { ReferralModal } from "./ReferralModal";

export function PhotoEditor() {
  const [backgroundDataUrl, setBackgroundDataUrl] = useState<string | null>(
    null,
  );
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [tabConflict, setTabConflict] = useState(false);
  const [showLandscapeTip, setShowLandscapeTip] = useState(false);
  const [panoModal, setPanoModal] = useState<{
    open: boolean;
    text: string;
    onSave: (newText: string) => void;
  }>({ open: false, text: "", onSave: () => {} });

  const isRecordingVideo = useEditorStore((s) => s.isRecordingVideo);
  const autosaveStatus = useEditorStore((s) => s.autosaveStatus);
  const exportOptions = useEditorStore((s) => s.exportOptions);
  const [videoProgress, setVideoProgress] = useState(0);

  // Video recording progress animator
  useEffect(() => {
    if (!isRecordingVideo) {
      setVideoProgress(0);
      return;
    }

    const durationMs = (exportOptions.duration || 5) * 1000;
    const intervalTime = 100;
    const step = (intervalTime / durationMs) * 100;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress = Math.min(99, currentProgress + step);
      setVideoProgress(Math.floor(currentProgress));
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isRecordingVideo, exportOptions.duration]);

  // License state from Zustand
  const isLicensed = useEditorStore((s) => s.isLicensed);
  const setLicensed = useEditorStore((s) => s.setLicensed);
  const setLicenseToken = useEditorStore((s) => s.setLicenseToken);
  const setLicenseStatus = useEditorStore((s) => s.setLicenseStatus);
  const setDemoMode = useEditorStore((s) => s.setDemoMode);
  const setLicenseModalOpen = useEditorStore((s) => s.setLicenseModalOpen);

  // Security Guard: Domain Lock & Anti-Debugging (DevTools Prevention)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    const allowedHosts = [
      "localhost", 
      "127.0.0.1", 
      "ilanx.com", 
      "www.ilanx.com", 
      "arsaisaretleme.vercel.app",
      "ynadijital.com",
      "ynadigitalsites.com",
      "ankaraustabul.com",
      "celenkdiyari.com",
      "tsukodesign.com"
    ];

    // 1. Domain Lock: Prevent running the application on copied/unauthorized domains
    const isAllowed = allowedHosts.some(host => hostname === host || hostname.endsWith("." + host));
    if (!isAllowed) {
      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background-color:#09090b;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;text-align:center;padding:20px;">
          <div style="margin-bottom:20px;padding:15px;background-color:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:16px;color:#ef4444;font-size:32px;font-weight:bold;">⚠️</div>
          <h1 style="color:#ef4444;font-size:24px;margin-bottom:10px;font-weight:700;">Yetkisiz Alan Adı Kullanımı</h1>
          <p style="color:#a1a1aa;font-size:14px;max-width:420px;line-height:1.6;margin:0 auto 24px auto;">
            Bu yazılımın lisanssız bir kopyasını kullanıyorsunuz. İlanX editörü bu alan adında çalıştırılmak üzere yetkilendirilmemiştir.
          </p>
          <a href="https://ilanx.com" style="display:inline-block;padding:12px 24px;background-color:#06b6d4;color:white;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;transition:all 0.2s;">
            ilanx.com Resmi Sayfasına Git
          </a>
        </div>
      `;
      return;
    }

    // 2. Anti-Debugging: Detect DevTools and auto-lock in production
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      const interval = setInterval(() => {
        const startTime = performance.now();
        debugger; // Halts browser if developer tools are open
        const endTime = performance.now();
        
        // If execution paused longer than 100ms, DevTools is active
        if (endTime - startTime > 100) {
          useEditorStore.getState().setLicensed(false);
          useEditorStore.getState().setDemoMode(true);
          useEditorStore.getState().setLicenseModalOpen(true);
        }
      }, 1500);

      return () => clearInterval(interval);
    }
  }, []);

  // App startup & verification logic
  useEffect(() => {
    if (typeof window === "undefined") return;

    const verifyExistingToken = async () => {
      const token = localStorage.getItem("ilanx_license_token");
      if (!token) {
        // No token, start a 7-second grace timer to display license modal
        const timer = setTimeout(() => {
          setLicenseModalOpen(true);
        }, 7000);
        return () => clearTimeout(timer);
      }

      try {
        const res = await fetch("/api/license/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.valid) {
          setLicensed(true);
          setLicenseToken(token);
          setLicenseStatus("active");
          setDemoMode(false);
        } else {
          // Token expired or invalid
          localStorage.removeItem("ilanx_license_token");
          localStorage.removeItem("ilanx_license_status");
          setLicensed(false);
          setDemoMode(true);
          setLicenseModalOpen(true);
        }
      } catch {
        // Network error, load cached values with 24h grace period
        const cachedStatus = localStorage.getItem("ilanx_license_status");
        if (cachedStatus === "active") {
          setLicensed(true);
          setDemoMode(false);
        } else {
          setLicenseModalOpen(true);
        }
      }
    };

    verifyExistingToken();
  }, [setLicensed, setLicenseToken, setLicenseStatus, setDemoMode, setLicenseModalOpen]);

  // Hourly re-validation interval (auto background check)
  useEffect(() => {
    if (!isLicensed) return;

    const interval = setInterval(async () => {
      const token = localStorage.getItem("ilanx_license_token");
      if (!token) {
        setLicensed(false);
        setDemoMode(true);
        setLicenseModalOpen(true);
        return;
      }

      try {
        const res = await fetch("/api/license/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok || !data.valid) {
          localStorage.removeItem("ilanx_license_token");
          localStorage.removeItem("ilanx_license_status");
          setLicensed(false);
          setDemoMode(true);
          setLicenseModalOpen(true);
        }
      } catch {
        // Ignore temporary network errors during background check
      }
    }, 3600000); // 1 hour

    return () => clearInterval(interval);
  }, [isLicensed, setLicensed, setDemoMode, setLicenseModalOpen]);

  // Check orientation for landscape advisor on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowLandscapeTip(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  // Multi-tab Conflict Guard & Recovery Check
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Generate unique tab ID if not exists
    if (!(window as any).__tabId) {
      (window as any).__tabId = Math.random().toString(36).substring(2, 9);
    }

    const checkTabConflict = () => {
      const activeTabId = localStorage.getItem("ilanx_active_tab_id");
      const activeTimestampStr = localStorage.getItem("ilanx_active_session_timestamp");
      
      if (activeTabId && activeTabId !== (window as any).__tabId && activeTimestampStr) {
        const activeTimestamp = parseInt(activeTimestampStr, 10);
        // If the other tab was active within the last 10 seconds
        if (Date.now() - activeTimestamp < 10000) {
          setTabConflict(true);
        }
      }
    };

    // Check periodically
    const interval = setInterval(checkTabConflict, 3000);

    const savedBg = localStorage.getItem("ilanx_bg_data");
    const savedCanvas = localStorage.getItem("ilanx_canvas_data");
    if (savedBg && savedCanvas) {
      setRecoveryAvailable(true);
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Global Keyboard listener for Help (?) Shortcuts Modal
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "?" || e.key === "/") && e.shiftKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          setShortcutsOpen((prev) => !prev);
        }
      }
    };

    // Expose shortcuts toggle on window object so toolbar can trigger it
    (window as any).__toggleShortcutsModal = () => {
      setShortcutsOpen((prev) => !prev);
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      delete (window as any).__toggleShortcutsModal;
    };
  }, []);

  // Expose pano text edit modal trigger
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__openPanoModal = (currentText: string, onSave: (newText: string) => void) => {
      setPanoModal({ open: true, text: currentText, onSave });
    };
    return () => {
      delete (window as any).__openPanoModal;
    };
  }, []);

  const handleRecover = () => {
    const savedBg = localStorage.getItem("ilanx_bg_data");
    if (savedBg) {
      if (typeof window !== "undefined") {
        (window as any).__shouldRecoverCanvas = true;
      }
      setBackgroundDataUrl(savedBg);
    }
    setRecoveryAvailable(false);
  };

  const handleDiscardRecovery = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ilanx_bg_data");
      localStorage.removeItem("ilanx_canvas_data");
    }
    setRecoveryAvailable(false);
  };

  return (
    <div 
      className="relative flex h-[100dvh] w-full max-w-full flex-col overflow-hidden"
    >
      <OnboardingTour />
      
      {/* Mobile Landscape Guidance bar */}
      {showLandscapeTip && (
        <div className="z-40 flex items-center justify-between gap-2 bg-gradient-to-r from-cyan-600 to-purple-600 px-3 py-1.5 text-white animate-in slide-in-from-top-1 duration-300 shrink-0">
          <div className="flex items-center gap-1.5">
            <Smartphone className="size-4 shrink-0 animate-bounce" />
            <span className="text-[10px] font-semibold">Daha iyi bir çizim deneyimi için cihazınızı yatay çevirin!</span>
          </div>
          <button 
            onClick={() => setShowLandscapeTip(false)}
            className="rounded p-0.5 hover:bg-white/10"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar onImageLoaded={setBackgroundDataUrl} />

      {/* Main Workspace */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        <main
          className="relative min-h-0 min-w-0 flex-1 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(128,128,128,0.25) 1.5px, transparent 1.5px)",
            backgroundSize: "24px 24px"
          }}
        >
          <div className="absolute inset-1.5 sm:inset-2 md:inset-3">
            <EditorCanvas backgroundDataUrl={backgroundDataUrl} />
            {!backgroundDataUrl && (
              <ImageUploadArea setBackgroundDataUrl={setBackgroundDataUrl} />
            )}
            {!backgroundDataUrl && <EmptyState setBackgroundDataUrl={setBackgroundDataUrl} />}
          </div>

          {/* Autosave Feedback Floating Indicator */}
          {backgroundDataUrl && (
            <div className="absolute top-3 right-3 pointer-events-none z-30 flex items-center gap-1.5 rounded-full border border-white/10 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm transition-all duration-300">
              {autosaveStatus === "saving" ? (
                <>
                  <RefreshCw className="size-3 text-cyan-500 animate-spin" />
                  <span className="text-zinc-500 dark:text-zinc-400">Kaydediliyor...</span>
                </>
              ) : autosaveStatus === "saved" ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Buluta Kaydedildi</span>
                </>
              ) : (
                <>
                  <Cloud className="size-3 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-zinc-400 dark:text-zinc-500">Bulut Eşitlemesi Aktif</span>
                </>
              )}
            </div>
          )}
        </main>
        <SidePanel />
      </div>

      {backgroundDataUrl && <TimelineControls />}

      {/* Project Recovery Prompt */}
      {recoveryAvailable && !backgroundDataUrl && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm rounded-2xl border border-white/10 dark:border-zinc-800/50 bg-white/75 dark:bg-zinc-900/75 p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-col gap-3">
            <div>
              <h4 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">Yarım Kalan Çalışma Bulundu</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Önceki oturumunuzdan kalan çizimleri geri yüklemek ister misiniz?</p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={handleDiscardRecovery}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Temizle
              </button>
              <button
                onClick={handleRecover}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Geri Yükle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {shortcutsOpen && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-white/95 dark:bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <Keyboard className="size-4 text-cyan-500" />
                Klavye Kısayolları
              </h3>
              <button 
                onClick={() => setShortcutsOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-muted hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Geri Al</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Ctrl + Z</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Yinele</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Ctrl + Y</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Kopyala</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Ctrl + C</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Yapıştır</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Ctrl + V</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Seçili Nesneyi Sil</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Delete / Backspace</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Çizim İptal (Parsel)</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Esc</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Çizimi Kapat (Parsel)</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Enter</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span>Yakınlaştır / Uzaklaştır</span>
                <kbd className="rounded bg-muted px-2 py-0.5 border border-border font-mono font-bold shadow-sm">Ctrl + Wheel</kbd>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShortcutsOpen(false)}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Export Progress Overlay */}
      {isRecordingVideo && (
        <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-[90%] max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <Video className="size-10 text-cyan-500 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-white">Video Dışa Aktarılıyor</h3>
            <p className="text-xs text-zinc-400 mt-2">Animasyon karesi kaydediliyor ve video dosyası kodlanıyor.</p>
            
            {/* Progress Bar & Percentage */}
            <div className="mt-5 w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-1.5 rounded-full transition-all duration-100 ease-out" 
                style={{ width: `${videoProgress}%` }}
              />
            </div>
            <p className="text-xs font-bold text-cyan-400 mt-2.5">Kayıt Durumu: %{videoProgress}</p>
            
            <p className="text-[10px] text-zinc-500 mt-3.5">Lütfen tarayıcı sekmesini kapatmayın.</p>
          </div>
        </div>
      )}

      {/* Multi-tab Conflict Warning Dialog */}
      {tabConflict && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[90%] max-w-md rounded-2xl border border-red-500/20 bg-white dark:bg-zinc-900 p-5 shadow-2xl text-center">
            <div className="flex justify-center mb-3">
              <ShieldAlert className="size-10 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">Çoklu Sekme Çakışması Algılandı</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Bu projeyi başka bir sekmede aktif olarak düzenlediğiniz tespit edildi. Veri kaybını ve çakışmaları önlemek için lütfen sadece tek bir sekme kullanın.
            </p>
            <div className="mt-5 flex gap-3 justify-center">
              <button
                onClick={() => setTabConflict(false)}
                className="rounded-lg border border-border px-3.5 py-1.5 text-xs font-semibold hover:bg-muted dark:text-white transition-colors cursor-pointer"
              >
                Yine de Düzenle
              </button>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") window.close();
                }}
                className="rounded-lg bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Sekmeyi Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Licensing Modal */}
      <LicenseModal />

      {/* Referral/Gift Modal */}
      <ReferralModal />

      {/* Pano Metni Düzenleme Modalı */}
      {panoModal.open && (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[90%] max-w-sm rounded-2xl border border-white/10 bg-zinc-900/95 p-5 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-200 text-white">
            <h3 className="text-sm font-semibold">Pano Metnini Düzenle</h3>
            <input
              type="text"
              value={panoModal.text}
              onChange={(e) => setPanoModal(prev => ({ ...prev, text: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  panoModal.onSave(panoModal.text);
                  setPanoModal(prev => ({ ...prev, open: false }));
                } else if (e.key === "Escape") {
                  setPanoModal(prev => ({ ...prev, open: false }));
                }
              }}
              className="mt-3 h-10 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500"
              autoFocus
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => setPanoModal(prev => ({ ...prev, open: false }))}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  panoModal.onSave(panoModal.text);
                  setPanoModal(prev => ({ ...prev, open: false }));
                }}
                className="rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
