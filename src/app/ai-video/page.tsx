"use client";

import React, { useEffect, useState } from "react";
import { AIVideoSidebar } from "@/features/ai-video/components/ai-video-sidebar";
import { AIVideoPlayer } from "@/features/ai-video/components/ai-video-player";
import { Navbar } from "@/features/landing/components/navbar";
import { useSession, signIn } from "next-auth/react";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function AIVideoPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-950">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
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
