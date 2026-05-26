import { Palette } from "lucide-react";
import { COLOR_PRESETS } from "@/features/editor/config/colors";

import { memo } from "react";

export const DrawSettingsPanel = memo(function DrawSettingsPanel({
  activeTool,
  drawSettings,
  handleDrawSettingsUpdate,
  setDrawSettings,
}: {
  activeTool: string;
  drawSettings: any;
  handleDrawSettingsUpdate: (updates: any) => void;
  setDrawSettings: (updates: any) => void;
}) {
  const strokeColor = drawSettings?.strokeColor ?? "#22d3ee";
  const fillColor = drawSettings?.fillColor ?? "#0ea5e9";
  const strokeWidth = drawSettings?.strokeWidth ?? 2;
  const strokeDashArray = drawSettings?.strokeDashArray;
  const fillOpacity = drawSettings?.fillOpacity ?? 0.15;
  const glowEffect = drawSettings?.glowEffect ?? "none";
  const glowIntensity = drawSettings?.glowIntensity ?? 5;
  const glowRadius = drawSettings?.glowRadius ?? 15;
  const flickerSpeed = drawSettings?.flickerSpeed ?? 5;
  const pulseSpeed = drawSettings?.pulseSpeed ?? 5;

  return (
    <section className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Palette className="size-4" />
        Çizim rengi
      </h2>
      <div className="grid grid-cols-3 gap-1.5">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            title={preset.name}
            onClick={() => handleDrawSettingsUpdate({ strokeColor: preset.stroke, fillColor: preset.fill })}
            className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-left text-[10px] hover:bg-muted"
          >
            <span className="size-4 shrink-0 rounded border border-white/20" style={{ background: preset.fill }} />
            <span className="truncate">{preset.name}</span>
          </button>
        ))}
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Çizgi rengi</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => handleDrawSettingsUpdate({ strokeColor: e.target.value })}
            className="h-9 w-12 cursor-pointer rounded-lg border-2 border-input bg-background p-0.5 overflow-hidden shadow-sm hover:border-primary/50 transition-colors [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
          />
          <span className="text-xs text-muted-foreground">{strokeColor}</span>
        </div>
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Dolgu rengi</span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={fillColor}
            onChange={(e) => handleDrawSettingsUpdate({ fillColor: e.target.value })}
            className="h-9 w-12 cursor-pointer rounded-lg border-2 border-input bg-background p-0.5 overflow-hidden shadow-sm hover:border-primary/50 transition-colors [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
          />
        </div>
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Çizgi kalınlığı: {strokeWidth}px</span>
        <input
          type="range"
          min={1} max={12} step={1}
          value={strokeWidth}
          onChange={(e) => handleDrawSettingsUpdate({ strokeWidth: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Çizgi Stili</span>
        <select
          value={strokeDashArray ? "dashed" : "solid"}
          onChange={(e) => handleDrawSettingsUpdate({ strokeDashArray: e.target.value === "dashed" ? [6, 6] : undefined })}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="solid">Düz Çizgi</option>
          <option value="dashed">Kesik Çizgi</option>
        </select>
      </label>
      {activeTool !== "pencil" && activeTool !== "line" && activeTool !== "arrow" && (
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Dolgu opaklığı: {Math.round(fillOpacity * 100)}%</span>
          <input
            type="range"
            min={5} max={80} step={5}
            value={Math.round(fillOpacity * 100)}
            onChange={(e) => handleDrawSettingsUpdate({ fillOpacity: Number(e.target.value) / 100 })}
            className="w-full accent-primary"
          />
        </label>
      )}

      {/* Glow Effect Controls */}
      <div className="border-t border-border pt-3">
        <h3 className="mb-2 text-xs font-semibold text-primary">Neon Glow Efekti</h3>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Efekt Türü</span>
          <select
            value={glowEffect}
            onChange={(e) => setDrawSettings({ glowEffect: e.target.value as any })}
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="none">Yok</option>
            <option value="saber">Saber (Beyaz + Glow)</option>
            <option value="neon">Neon</option>
            <option value="bloom">Bloom</option>
            <option value="flicker">Yanıp Sönme</option>
            <option value="pulse">Pulse</option>
          </select>
        </label>

        {glowEffect !== "none" && (
          <>
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Glow Yoğunluğu: {glowIntensity}</span>
              <input
                type="range"
                min={1} max={10} step={1}
                value={glowIntensity}
                onChange={(e) => setDrawSettings({ glowIntensity: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Glow Çapı: {glowRadius}px</span>
              <input
                type="range"
                min={5} max={50} step={1}
                value={glowRadius}
                onChange={(e) => setDrawSettings({ glowRadius: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </label>

            {(glowEffect === "flicker" || glowEffect === "saber") && (
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">Yanıp Sönme Hızı: {flickerSpeed}</span>
                <input
                  type="range"
                  min={1} max={10} step={1}
                  value={flickerSpeed}
                  onChange={(e) => setDrawSettings({ flickerSpeed: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </label>
            )}

            {(glowEffect === "pulse" || glowEffect === "saber") && (
              <label className="block space-y-1">
                <span className="text-xs text-muted-foreground">Pulse Hızı: {pulseSpeed}</span>
                <input
                  type="range"
                  min={1} max={10} step={1}
                  value={pulseSpeed}
                  onChange={(e) => setDrawSettings({ pulseSpeed: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </label>
            )}
          </>
        )}
      </div>
    </section>
  );
});
