"use client";

import { Play, Pause, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { timelineRegistry } from "@/features/editor/utils/timeline-registry";

export function TimelineControls() {
  const isPlaying = useEditorStore((s) => s.isAnimationPlaying);
  const setPlaying = useEditorStore((s) => s.setAnimationPlaying);
  const animationTime = useEditorStore((s) => s.animationTime);
  const setAnimationTime = useEditorStore((s) => s.setAnimationTime);
  const duration = useEditorStore((s) => s.exportOptions.duration); // in seconds
  const maxMs = duration * 1000;

  const sliderRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    timelineRegistry.slider = sliderRef.current;
    timelineRegistry.display = displayRef.current;
    return () => {
      timelineRegistry.slider = null;
      timelineRegistry.display = null;
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      // Pause: sync the 60fps DOM value back to the store
      const slider = timelineRegistry.slider;
      if (slider) {
        setAnimationTime(parseFloat(slider.value));
      }
      setPlaying(false);
    } else {
      setPlaying(true);
    }
  };

  const handleReset = () => {
    setAnimationTime(0);
    const slider = timelineRegistry.slider;
    if (slider) {
      slider.value = "0";
    }
  };

  const handleSliderStart = () => {
    if (isPlaying) {
      const slider = timelineRegistry.slider;
      if (slider) {
        setAnimationTime(parseFloat(slider.value));
      }
      setPlaying(false);
    }
  };

  const handleSkipBack = () => {
    const slider = timelineRegistry.slider;
    const current = slider ? parseFloat(slider.value) : animationTime;
    const next = Math.max(0, current - 1000);
    setAnimationTime(next);
    if (slider) {
      slider.value = next.toString();
    }
  };

  const handleSkipForward = () => {
    const slider = timelineRegistry.slider;
    const current = slider ? parseFloat(slider.value) : animationTime;
    const next = Math.min(maxMs, current + 1000);
    setAnimationTime(next);
    if (slider) {
      slider.value = next.toString();
    }
  };

  const currentPercent = maxMs > 0 ? (animationTime / maxMs) * 100 : 0;

  return (
    <footer className="flex items-center justify-between border-t border-border bg-card/60 px-4 py-3 backdrop-blur-md select-none shrink-0">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button 
          variant="ghost" 
          size="icon-sm" 
          title="Sıfırla" 
          onClick={handleReset}
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          title="Geri Sar (1s)" 
          onClick={handleSkipBack}
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button 
          variant="default" 
          size="icon-sm" 
          onClick={handlePlayPause}
          className="h-9 w-9 rounded-full bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white shadow-md hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-white text-white" />
          ) : (
            <Play className="h-4 w-4 fill-white text-white translate-x-[1px]" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon-sm" 
          title="İleri Sar (1s)" 
          onClick={handleSkipForward}
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-95"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 px-4 sm:px-6">
        <div className="relative flex items-center w-full">
          <input
            ref={sliderRef}
            type="range"
            id="timeline-slider"
            min={0}
            max={maxMs}
            value={isPlaying ? undefined : animationTime}
            defaultValue={isPlaying ? undefined : animationTime}
            onInput={(e) => {
              const val = parseFloat((e.target as HTMLInputElement).value);
              setAnimationTime(val);
            }}
            onMouseDown={handleSliderStart}
            onTouchStart={handleSliderStart}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-zinc-800 focus:outline-none transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125"
            style={{
              background: `linear-gradient(to right, #06b6d4 0%, #a855f7 ${currentPercent.toFixed(2)}%, #3f3f46 ${currentPercent.toFixed(2)}%, #3f3f46 100%)`
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground min-w-[70px] justify-end">
        <span ref={displayRef} id="timeline-time-display">{(animationTime / 1000).toFixed(1)}s</span>
        <span className="text-zinc-600 dark:text-zinc-700">/</span>
        <span>{duration.toFixed(1)}s</span>
      </div>
    </footer>
  );
}