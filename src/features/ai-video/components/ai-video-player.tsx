"use client";

import React from "react";
import { Bot, Sparkles, Download, Wand2 } from "lucide-react";
import { useAIVideoStore } from "../store/use-ai-video-store";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/shared/components/ui/button";

export const AIVideoPlayer = () => {
  const { isGenerating, generationProgress, generationStep, resultVideoUrl, format } = useAIVideoStore();

  // Determine aspect ratio for the preview box based on selected format
  const getAspectRatioClass = () => {
    switch (format) {
      case "16:9": return "aspect-video max-w-4xl";
      case "9:16": return "aspect-[9/16] max-w-sm";
      case "1:1": return "aspect-square max-w-lg";
      default: return "aspect-video max-w-4xl";
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black/20">
      
      {/* Central Display Area with Neon Glow during generation */}
      <div 
        className={cn(
          "w-full bg-black/40 border-2 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative transition-all duration-700",
          getAspectRatioClass(),
          isGenerating 
            ? "border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)] shadow-indigo-500/50" 
            : "border-white/10 shadow-2xl"
        )}
      >
        
        {/* State 1: Idle (Waiting for generation) */}
        {!isGenerating && !resultVideoUrl && (
          <div className="flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Wand2 className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-xl font-medium text-white/70 mb-2">Yapay Zeka Sizi Bekliyor</h3>
            <p className="text-sm text-white/40 max-w-sm">
              Sağ panelden görsellerinizi yükleyin, formatı seçin ve oluştur butonuna tıklayın. Gerisini yapay zekaya bırakın.
            </p>
          </div>
        )}

        {/* State 2: Generating (ChatGPT Style Loading) */}
        {isGenerating && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 z-10">
            <div className="relative w-24 h-24 mb-8">
              {/* Outer spinning ring with glow */}
              <div className="absolute inset-0 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              {/* Inner pulsing AI icon */}
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <Bot className="w-10 h-10 text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              </div>
            </div>

            <div className="w-full max-w-md space-y-4">
              {/* Progress Bar */}
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              
              {/* Status Text (ChatGPT style typing/thinking effect) */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-300 animate-pulse">{generationStep}</span>
                <span className="text-white/50 font-mono">{generationProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Finished Video */}
        {resultVideoUrl && !isGenerating && (
          <div className="w-full h-full relative group animate-in fade-in zoom-in duration-500">
            {/* We use a standard video tag for playback */}
            <video 
              src={resultVideoUrl} 
              autoPlay 
              loop 
              muted 
              controls 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <Button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20">
                <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
                Yeniden Oluştur
              </Button>
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Videoyu İndir
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
