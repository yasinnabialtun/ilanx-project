import { Type } from "lucide-react";
import { memo } from "react";

export const TextSettingsPanel = memo(function TextSettingsPanel({
  textSettings,
  handleTextSettingsUpdate,
}: {
  textSettings: any;
  handleTextSettingsUpdate: (updates: any) => void;
}) {
  return (
    <section className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><Type className="size-4" /> Metin</h2>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">İçerik</span>
        <input
          type="text"
          value={textSettings.content ?? ""}
          onChange={(e) => handleTextSettingsUpdate({ content: e.target.value })}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Boyut: {textSettings.fontSize ?? 36}px</span>
        <input
          type="range" min={12} max={72} step={1}
          value={textSettings.fontSize ?? 36}
          onChange={(e) => handleTextSettingsUpdate({ fontSize: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Renk</span>
          <input
            type="color"
            value={textSettings.color ?? "#facc15"}
            onChange={(e) => handleTextSettingsUpdate({ color: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border-2 border-input bg-background p-0.5 overflow-hidden shadow-sm hover:border-primary/50 transition-colors [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Arka Plan</span>
          <input
            type="color"
            value={textSettings.textBackgroundColor === "transparent" ? "#000000" : (textSettings.textBackgroundColor ?? "#ffffff")}
            onChange={(e) => handleTextSettingsUpdate({ textBackgroundColor: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-lg border-2 border-input bg-background p-0.5 overflow-hidden shadow-sm hover:border-primary/50 transition-colors [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="bg-transparent"
          checked={textSettings.textBackgroundColor === "transparent"}
          onChange={(e) => handleTextSettingsUpdate({ textBackgroundColor: e.target.checked ? "transparent" : "#ffffff" })}
          className="h-4 w-4 accent-primary"
        />
        <label htmlFor="bg-transparent" className="text-xs text-muted-foreground cursor-pointer">
          Arka Planı Şeffaf Yap
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Yazı Tipi</span>
        <select
          value={textSettings.fontFamily ?? "Montserrat"}
          onChange={(e) => handleTextSettingsUpdate({ fontFamily: e.target.value })}
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Impact">Impact</option>
        </select>
      </label>
    </section>
  );
});
