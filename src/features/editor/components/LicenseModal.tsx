"use client";

import { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, Sparkles, ShoppingBag, Check, Gift, Users } from "lucide-react";
import { useEditorStore } from "@/features/editor/store/editorStore";

export function LicenseModal() {
  const [keyInput, setKeyInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setLicensed = useEditorStore((s) => s.setLicensed);
  const setLicenseToken = useEditorStore((s) => s.setLicenseToken);
  const setLicenseStatus = useEditorStore((s) => s.setLicenseStatus);
  const setDemoMode = useEditorStore((s) => s.setDemoMode);
  const isOpen = useEditorStore((s) => s.licenseModalOpen);
  const setOpen = useEditorStore((s) => s.setLicenseModalOpen);

  // Initialize key formatting and filter out unwanted characters
  const handleKeyChange = (val: string) => {
    let formatted = val.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    
    // Automatically insert dashes for format: ILX-XXXX-XXXX-XXXX
    if (formatted.length > 4 && !formatted.includes("-", 3)) {
      formatted = formatted.slice(0, 3) + "-" + formatted.slice(3);
    }
    if (formatted.length > 9 && formatted.split("-").length < 3) {
      formatted = formatted.slice(0, 8) + "-" + formatted.slice(8);
    }
    if (formatted.length > 14 && formatted.split("-").length < 4) {
      formatted = formatted.slice(0, 13) + "-" + formatted.slice(13);
    }
    // Max length limit (supports ILX-TEST-1234-DEMO and standard keys)
    setKeyInput(formatted.slice(0, 20));
    setErrorMsg(null);
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput || keyInput.length < 12) {
      setErrorMsg("Lütfen geçerli formatta bir lisans anahtarı girin (Örn: ILX-XXXX-XXXX-XXXX)");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    // Retrieve or generate a local UUID for device binding
    let deviceId = localStorage.getItem("ilanx_license_device_id");
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("ilanx_license_device_id", deviceId);
    }

    try {
      const res = await fetch("/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: keyInput, deviceId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Lisans doğrulaması başarısız oldu.");
        setIsLoading(false);
        return;
      }

      // Save valid token and active state
      localStorage.setItem("ilanx_license_token", data.token);
      localStorage.setItem("ilanx_license_status", "active");

      setLicensed(true);
      setLicenseToken(data.token);
      setLicenseStatus("active");
      setDemoMode(false);
      setOpen(false);
    } catch {
      setErrorMsg("Sunucu ile bağlantı kurulamadı. İnternetinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    setLicensed(false);
    setDemoMode(true);
    setOpen(false); // Close modal, let user explore view-only Mode
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl shadow-cyan-500/5 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Sol Kolon - Neden Almalısın? (Sadece Tablet/PC) */}
        <div className="hidden md:flex md:w-5/12 bg-zinc-900/50 p-6 md:p-8 border-r border-white/5 flex-col justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 mb-5">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Neden Lisans Almalısınız?</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              İlanX Tasarım Stüdyosu'nun tüm premium özelliklerini açın, vitrindeki ilanlarınızla fark yaratın.
            </p>
            
            <ul className="space-y-4 text-xs text-zinc-300">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/20 p-0.5 text-emerald-400 shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Filigransız Yüksek Çözünürlüklü Çıktı (PNG/PDF)</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/20 p-0.5 text-emerald-400 shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Hareketli MP4 İlan Videoları Oluşturma</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/20 p-0.5 text-emerald-400 shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Premium 3D Tabelalar ve Özel Logolar</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-emerald-500/20 p-0.5 text-emerald-400 shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <span>Sınırsız İlan Görseli Tasarlama Hakkı</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-8 rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent p-4 border border-cyan-500/20">
            <p className="text-[11px] font-medium text-cyan-400 italic">
              "İlanX sayesinde ajanslara para ödemeyi bıraktık. İlk aydan dönüşüm oranımız 4 kat arttı!"
            </p>
          </div>
        </div>

        {/* Sağ Kolon - Lisans Doğrulama Formu */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 md:hidden">
            <KeyRound className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
            İlanX Lisans Sistemi
          </h3>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed md:px-4">
            Editörü tam kapasiteyle kullanmak için geçerli bir lisans anahtarı girin.
          </p>

          <form onSubmit={handleValidate} className="mt-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="ILX-XXXX-XXXX-XXXX"
                value={keyInput}
                onChange={(e) => handleKeyChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-center text-sm font-mono tracking-wider text-white placeholder-zinc-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                disabled={isLoading}
              />
            </div>

            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-left text-xs text-red-400 border border-red-500/20">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-semibold text-white shadow-md hover:bg-cyan-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Lisansı Doğrula"
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-left">
              <p className="text-[11px] text-emerald-400 font-medium flex items-start gap-1.5 leading-relaxed">
                <Gift className="size-3.5 shrink-0 mt-0.5" />
                Bir arkadaşınızın davet koduna (REF-XXX) sahipseniz, lisans alımı sırasında WhatsApp hattımıza ileterek +1 Ay hediye kullanım kazanabilirsiniz!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <a
                href="https://wa.me/905421367056?text=Merhaba%2C%20Bireysel%20%C4%B0lanX%20lisans%C4%B1%20sat%C4%B1n%20almak%20istiyorum.%20(Varsa%20Referans%20Kodunuz:%20)"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/30 py-2.5 text-[11px] font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all"
              >
                <ShoppingBag className="size-3.5 shrink-0" />
                Bireysel Lisans Al
              </a>

              <a
                href="https://wa.me/905421367056?text=Merhaba%2C%20T%C3%BCm%20ekibim%20i%C3%A7in%20Ofis%20Paketi%20sat%C4%B1n%20almak%20istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/20 bg-purple-500/10 py-2.5 text-[11px] font-medium text-purple-400 hover:bg-purple-500/20 hover:text-purple-300 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Users className="size-3.5 shrink-0" />
                Ofis Paketi (İndirimli)
              </a>
            </div>

            <button
              onClick={handleDemoMode}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-all cursor-pointer border border-transparent hover:border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 mt-2"
            >
              <Sparkles className="size-3.5" />
              Tüm Özellikleri Dene (Ücretsiz & Filigranlı)
            </button>
          </div>

          <p className="mt-6 text-[9px] text-zinc-600">
            * Bir lisans anahtarı en fazla 3 cihazda aktif edilebilir.
          </p>
        </div>
      </div>
    </div>
  );
}
