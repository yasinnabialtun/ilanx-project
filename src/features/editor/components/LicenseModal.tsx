"use client";

import { useState, useEffect } from "react";
import { KeyRound, ShieldAlert, Sparkles, ShoppingBag, Eye } from "lucide-react";
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="w-[90%] max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 text-center shadow-2xl shadow-cyan-500/5 animate-in zoom-in-95 duration-200">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          <KeyRound className="h-7 w-7" />
        </div>

        <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="size-4 text-cyan-400 animate-pulse" />
          İlanX Lisans Sistemi
        </h3>
        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          İlanX Arsa İşaretleme Editörü'nü kullanmaya devam etmek için geçerli bir lisans anahtarı girmeniz gerekmektedir.
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
          <a
            href="https://ilanx.com/satinal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/30 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all"
          >
            <ShoppingBag className="size-3.5" />
            Lisans Satın Al
          </a>

          <button
            onClick={handleDemoMode}
            className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
          >
            <Eye className="size-3.5" />
            Demo Modunda İncele (Sadece İzleme)
          </button>
        </div>

        <p className="mt-6 text-[9px] text-zinc-600">
          * Bir lisans anahtarı en fazla 3 cihazda aktif edilebilir.
        </p>
      </div>
    </div>
  );
}
