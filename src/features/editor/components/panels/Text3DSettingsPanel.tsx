import { Type, Cuboid as Cube } from "lucide-react";
import { memo } from "react";

export const Text3DSettingsPanel = memo(function Text3DSettingsPanel({
  text3dSettings,
  handleText3dSettingsUpdate,
}: {
  text3dSettings: any;
  handleText3dSettingsUpdate: (updates: any) => void;
}) {
  return (
    <section className="space-y-3.5 animate-in fade-in slide-in-from-left-2 duration-200">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Cube className="size-4 text-primary" /> 3D Metin
      </h2>

      {/* Metin İçeriği */}
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">İçerik</span>
        <input
          type="text"
          value={text3dSettings.content ?? ""}
          onChange={(e) => handleText3dSettingsUpdate({ content: e.target.value })}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </label>

      {/* Font Boyutu */}
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">
          Boyut: {text3dSettings.fontSize ?? 48}px
        </span>
        <input
          type="range"
          min={24}
          max={150}
          step={1}
          value={text3dSettings.fontSize ?? 48}
          onChange={(e) => handleText3dSettingsUpdate({ fontSize: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        {/* Renk */}
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Renk</span>
          <input
            type="color"
            value={text3dSettings.color ?? "#fbbf24"}
            onChange={(e) => handleText3dSettingsUpdate({ color: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border-2 border-input bg-background p-0.5 overflow-hidden shadow-sm hover:border-primary/50 transition-colors [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
          />
        </label>

        {/* Yazı Tipi */}
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Yazı Tipi</span>
          <select
            value={text3dSettings.fontFamily ?? "Montserrat"}
            onChange={(e) => handleText3dSettingsUpdate({ fontFamily: e.target.value })}
            className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="Montserrat">Montserrat</option>
            <option value="Anton">Anton</option>
            <option value="Bebas Neue">Bebas Neue</option>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Impact">Impact</option>
          </select>
        </label>
      </div>

      {/* 3D Derinlik */}
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">
          3D Derinlik: {text3dSettings.depth ?? 10}px
        </span>
        <input
          type="range"
          min={1}
          max={40}
          step={1}
          value={text3dSettings.depth ?? 10}
          onChange={(e) => handleText3dSettingsUpdate({ depth: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      {/* Derinlik Açısı */}
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">
          Derinlik Açısı: {text3dSettings.extrusionAngle ?? 45}°
        </span>
        <input
          type="range"
          min={0}
          max={360}
          step={5}
          value={text3dSettings.extrusionAngle ?? 45}
          onChange={(e) => handleText3dSettingsUpdate({ extrusionAngle: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      {/* Bükme (Perspektif / Skew) */}
      <div className="grid grid-cols-2 gap-2 border-t border-border pt-3">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">
            Bükme X: {text3dSettings.skewX ?? 0}
          </span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={text3dSettings.skewX ?? 0}
            onChange={(e) => handleText3dSettingsUpdate({ skewX: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">
            Bükme Y: {text3dSettings.skewY ?? 0}
          </span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={text3dSettings.skewY ?? 0}
            onChange={(e) => handleText3dSettingsUpdate({ skewY: Number(e.target.value) })}
            className="w-full accent-primary"
          />
        </label>
      </div>
    </section>
  );
});
