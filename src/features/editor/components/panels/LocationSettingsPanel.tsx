import { MapPin, Droplet, Star, Home, Building2, Target, Flag, Trees, Key, Banknote, Hexagon, Ruler } from "lucide-react";
import type { LocationIconType } from "@/shared/types";
import { memo } from "react";

export const LocationSettingsPanel = memo(function LocationSettingsPanel({
  locationSettings,
  handleLocationSettingsUpdate,
}: {
  locationSettings: any;
  handleLocationSettingsUpdate: (updates: any) => void;
}) {
  return (
    <section className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-200">
      <h2 className="flex items-center gap-2 text-sm font-semibold"><MapPin className="size-4" /> Lokasyon Marker</h2>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Etiket</span>
        <input
          type="text"
          value={locationSettings.label ?? ""}
          onChange={(e) => handleLocationSettingsUpdate({ label: e.target.value })}
          placeholder="Örn: Ana Giriş"
          className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
        />
      </label>

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Sembol Tipi</span>
        <div className="grid grid-cols-4 gap-2">
          {([
            { key: "pin", Icon: MapPin, label: "Pin", color: "#ef4444" },
            { key: "drop", Icon: Droplet, label: "Damla", color: "#3b82f6" },
            { key: "star", Icon: Star, label: "Yıldız", color: "#f59e0b" },
            { key: "home", Icon: Home, label: "Ev", color: "#8b5cf6" },
            { key: "building", Icon: Building2, label: "Bina", color: "#64748b" },
            { key: "crosshair", Icon: Target, label: "Hedef", color: "#f97316" },
            { key: "flag", Icon: Flag, label: "Bayrak", color: "#ec4899" },
            { key: "tree", Icon: Trees, label: "Ağaç", color: "#10b981" },
            { key: "key", Icon: Key, label: "Anahtar", color: "#eab308" },
            { key: "money", Icon: Banknote, label: "Fiyat", color: "#22c55e" },
            { key: "parcel", Icon: Hexagon, label: "Parsel", color: "#06b6d4" },
            { key: "ruler", Icon: Ruler, label: "Ölçüm", color: "#6366f1" },
          ] as { key: LocationIconType; Icon: any; label: string; color: string }[]).map(({ key, Icon, label, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleLocationSettingsUpdate({ iconType: key })}
              className={`flex flex-col items-center justify-center rounded-lg border p-2 transition-all hover:scale-105 ${
                locationSettings.iconType === key
                  ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/50"
                  : "border-border bg-muted/30 hover:bg-muted"
              }`}
              title={label}
            >
              <Icon className="size-6 mb-1" style={{ color }} />
              <span className="text-[9px] font-medium truncate w-full text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-muted-foreground">Boyut: {locationSettings.size ?? 32}px</span>
        <input
          type="range" min={14} max={40} step={2}
          value={locationSettings.size ?? 32}
          onChange={(e) => handleLocationSettingsUpdate({ size: Number(e.target.value) })}
          className="w-full accent-primary"
        />
      </label>

      <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
        <input
          type="checkbox"
          checked={locationSettings.showPulse}
          onChange={(e) => handleLocationSettingsUpdate({ showPulse: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
        <span className="text-xs text-muted-foreground">Pulsasyon efekti</span>
      </label>

      <p className="text-[11px] text-muted-foreground">
        Lokasyon aracını seçip haritaya tıklayarak marker ekleyin. Çift tıklayınca etiketi düzenleyin.
      </p>
    </section>
  );
});
