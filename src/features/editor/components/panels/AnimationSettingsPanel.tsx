import { Sparkles } from "lucide-react";
import type { SelectionEffectType } from "@/shared/types";
import { memo } from "react";

export const AnimationSettingsPanel = memo(function AnimationSettingsPanel({
  artistStyle,
  setArtistStyle,
}: {
  artistStyle: any;
  setArtistStyle: (style: any) => void;
}) {
  return (
    <section className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4" />
        Çizim Efektleri
      </h2>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Kenar Animasyonu</span>
        <select
          value={artistStyle.selectionEffect ?? "none"}
          onChange={(e) => setArtistStyle({ selectionEffect: e.target.value as SelectionEffectType })}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="none">Yok</option>
          <option value="pulse">Yanıp Sönen</option>
          <option value="border-spin">Dönen Kenar</option>
          <option value="neon-scan">Neon Tarama</option>
          <option value="pen-draw">Kalemle Çizim</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Efekt Hızı: {artistStyle.effectSpeed ?? 5}</span>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={artistStyle.effectSpeed ?? 5}
          onChange={(e) => setArtistStyle({ effectSpeed: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Efekt Yoğunluğu: {artistStyle.effectIntensity ?? 5}</span>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={artistStyle.effectIntensity ?? 5}
          onChange={(e) => setArtistStyle({ effectIntensity: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Glow Rengi</span>
        <input
          type="color"
          value={artistStyle.glowColor ?? "#ffffff"}
          onChange={(e) => setArtistStyle({ glowColor: e.target.value })}
          className="h-9 w-full cursor-pointer rounded-lg border-2 border-input bg-background p-0.5 overflow-hidden shadow-sm hover:border-primary/50 transition-colors [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
        />
      </label>

      <p className="text-[11px] text-muted-foreground">
        Seçili çizimler üzerinde uygulanacak efektleri belirleyin.
      </p>
    </section>
  );
});
