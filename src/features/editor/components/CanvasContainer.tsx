"use client";

import { forwardRef, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useEditorStore } from "@/features/editor/store/editorStore";

type CanvasContainerProps = {
  children: ReactNode;
};

export const CanvasContainer = forwardRef<HTMLDivElement, CanvasContainerProps>(
  function CanvasContainer({ children }, ref) {
    const isRecordingVideo = useEditorStore((s) => s.isRecordingVideo);

    return (
      <div
        ref={ref}
        className="relative h-full min-h-[280px] w-full overflow-hidden rounded-lg border border-border/60 bg-white/55 shadow-sm dark:bg-zinc-950/60 touch-none select-none"
      >
        {children}

        {isRecordingVideo && (
          <div className="absolute inset-0 z-[999] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md transition-all duration-300">
            <div className="flex flex-col items-center gap-4 text-center p-6 mx-4 max-w-sm rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl text-white">
              <Loader2 className="h-10 w-10 animate-spin text-cyan-400" />
              <div className="space-y-1.5">
                <p className="text-sm font-semibold tracking-wide">Video Oluşturuluyor...</p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Lütfen bekleyin, animasyonunuz en yüksek çözünürlükte ve kayıpsız olarak hazırlanıyor.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
