import { Smile } from "lucide-react";
import { memo } from "react";

export const StickerPanel = memo(function StickerPanel({
  addStickerToCanvas,
}: {
  addStickerToCanvas: (type: string) => void;
}) {
  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Smile className="size-4" /> Hazır Etiketler
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-amber-500">🏡 Emlak Etiketleri</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: "for_sale", emoji: "🔴", label: "Satılık" },
              { key: "for_rent", emoji: "🔵", label: "Kiralık" },
              { key: "sold", emoji: "✅", label: "Satıldı" },
              { key: "deed", emoji: "📜", label: "Tapu" },
              { key: "price", emoji: "💰", label: "Fiyat" },
              { key: "measure", emoji: "📐", label: "m² Ölçüm" },
              { key: "green", emoji: "🌳", label: "Yeşil Alan" },
              { key: "zoning", emoji: "⚠️", label: "İmar Durumu" },
            ] as { key: string; emoji: string; label: string }[]).map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => addStickerToCanvas(key)}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-2.5 hover:bg-muted hover:border-primary/50 transition-all hover:scale-[1.03]"
              >
                <span className="text-xl">{emoji}</span>
                <span className="mt-1 text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">📋 Yazılabilir Panolar</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: "glass", emoji: "🪟", label: "Cam Pano" },
              { key: "neon", emoji: "💡", label: "Neon Pano" },
              { key: "wooden", emoji: "🪵", label: "Ahşap Pano" },
            ] as { key: string; emoji: string; label: string }[]).map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => addStickerToCanvas(key)}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-2.5 hover:bg-muted hover:border-primary/50 transition-all hover:scale-[1.03]"
              >
                <span className="text-xl">{emoji}</span>
                <span className="mt-1 text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">🏗️ 3D Simgeler</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { key: "house", emoji: "🏡", label: "3D Villa" },
              { key: "coin", emoji: "🪙", label: "Altın Para" },
              { key: "compass", emoji: "🧭", label: "3D Pusula" },
              { key: "neon_arrow", emoji: "🏹", label: "Neon Ok" },
              { key: "classic_arrow", emoji: "➡️", label: "3D Ok" },
            ] as { key: string; emoji: string; label: string }[]).map(({ key, emoji, label }) => (
              <button
                key={key}
                onClick={() => addStickerToCanvas(key)}
                className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-2.5 hover:bg-muted hover:border-primary/50 transition-all hover:scale-[1.03]"
              >
                <span className="text-xl">{emoji}</span>
                <span className="mt-1 text-[11px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Çift tıklayarak metin içeriğini değiştirebilirsiniz.
      </p>
    </section>
  );
});
