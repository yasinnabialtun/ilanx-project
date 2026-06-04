"use client";

import React, { useEffect, useState } from "react";
import { AIVideoSidebar } from "@/features/ai-video/components/ai-video-sidebar";
import { AIVideoPlayer } from "@/features/ai-video/components/ai-video-player";
import { Navbar } from "@/features/landing/components/navbar";
import { useSession, signIn } from "next-auth/react";
import { Sparkles, Lock, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function AIVideoPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

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
  }, [status, mounted]);

  if (!mounted || status === "loading" || checkoutLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 gap-4">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        {checkoutLoading && (
          <p className="text-white/60 text-sm animate-pulse">Ödeme sayfasına güvenli bir şekilde yönlendiriliyorsunuz...</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 overflow-hidden">
      {/* Header */}
      <div className="h-16 shrink-0 border-b border-white/10 z-50 bg-neutral-950">
        <Navbar />
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Video Player & Output */}
        <div className="flex-1 relative flex flex-col bg-neutral-900 overflow-hidden lg:order-1 order-2">
          <AIVideoPlayer />
        </div>

        {/* Right Side: Controls (Adobe Firefly Style Sidebar) */}
        <div className="w-full lg:w-[450px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 bg-neutral-950/80 backdrop-blur-xl flex flex-col lg:h-full h-[50vh] overflow-y-auto lg:order-2 order-1 shadow-2xl">
          <AIVideoSidebar />
        </div>
      </div>
    </div>
  );
}
