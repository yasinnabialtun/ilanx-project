import {
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  MapPin,
  Palette,
  TextIcon,
  Trash2,
  Type,
  Sparkles,
  X,
  Smile,
  Layers,
  Image as ImageIcon,
  MousePointer2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import {
  getEditorCanvas,
  selectObjectById,
  toggleLayerVisibility,
  toggleLayerLock,
  deleteLayerById,
  moveLayerOrder,
} from "@/features/editor/utils/canvas-api";
import type { EditorTool } from "@/shared/types";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { useCanvasSync } from "@/features/editor/hooks/use-canvas-sync";

import { DrawSettingsPanel } from "./panels/DrawSettingsPanel";
import { TextSettingsPanel } from "./panels/TextSettingsPanel";
import { Text3DSettingsPanel } from "./panels/Text3DSettingsPanel";
import { LocationSettingsPanel } from "./panels/LocationSettingsPanel";
import { StickerPanel } from "./panels/StickerPanel";
import { AnimationSettingsPanel } from "./panels/AnimationSettingsPanel";
import { LogoPanel } from "./panels/LogoPanel";

type TabId = "draw" | "text" | "text3d" | "location" | "sticker" | "animation" | "logo" | "layers";

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "draw", label: "Çizimler", icon: Palette },
  { id: "text", label: "Yazı", icon: Type },
  { id: "text3d", label: "3D Tabela", icon: TextIcon },
  { id: "location", label: "Konum/Okul", icon: MapPin },
  { id: "sticker", label: "İkon/Rozet", icon: Smile },
  { id: "logo", label: "Kendi Logon", icon: ImageIcon },
  { id: "animation", label: "Neon Efekt", icon: Sparkles },
  { id: "layers", label: "Katmanlar", icon: Layers },
];

const TYPE_ICON: Record<string, any> = {
  parcel: MapPin,
  shape: Palette,
  drawing: Palette,
  text: Type,
  text3d: TextIcon,
  location: MapPin,
  logo: ImageIcon,
  sticker: Smile,
};

export function SidePanel() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const artistStyle = useEditorStore((s) => s.artistStyle);
  const setArtistStyle = useEditorStore((s) => s.setArtistStyle);
  const hasBackground = useEditorStore((s) => s.hasBackground);
  const polygonPointCount = useEditorStore((s) => s.polygonPointCount);
  const selectedObjectType = useEditorStore((s) => s.selectedObjectType);
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const isSidePanelOpen = useEditorStore((s) => s.isSidePanelOpen);
  const setSidePanelOpen = useEditorStore((s) => s.setSidePanelOpen);
  const canvasLayers = useEditorStore((s) => s.canvasLayers);
  const isLicensed = useEditorStore((s) => s.isLicensed);

  const drawSettings = useEditorStore((s) => s.drawSettings);
  const setDrawSettings = useEditorStore((s) => s.setDrawSettings);
  const textSettings = useEditorStore((s) => s.textSettings);
  const text3dSettings = useEditorStore((s) => s.text3dSettings);
  const locationSettings = useEditorStore((s) => s.locationSettings);

  const {
    readSelected,
    handleLogoUpload,
    handleDrawSettingsUpdate,
    handleTextSettingsUpdate,
    handleLocationSettingsUpdate,
    handleText3dSettingsUpdate,
    addStickerToCanvas,
  } = useCanvasSync();

  const showDrawSettings = [
    "polygon", "rect", "circle", "line", "arrow", "pencil",
  ].includes(activeTool) || (activeTool === "select" && (selectedObjectType === "parcel" || selectedObjectType === "shape" || selectedObjectType === "drawing"));

  const showTextSettings = activeTool === "text" || (activeTool === "select" && selectedObjectType === "text");
  const showText3dSettings = activeTool === "text3d" || (activeTool === "select" && selectedObjectType === "text3d");
  const showLocationSettings = activeTool === "location" || (activeTool === "select" && selectedObjectType === "location");

  const [activeTab, setActiveTab] = useState<TabId>("draw");

  // When user is on layers tab, keep it; otherwise follow visibleTab
  const displayedTab = useMemo<TabId>(() => {
    if (activeTab === "layers") return "layers";
    if (activeTool === "select" && selectedObjectType) {
      if (selectedObjectType === "text") return "text";
      if (selectedObjectType === "text3d") return "text3d";
      if (selectedObjectType === "location") return "location";
      if (selectedObjectType === "logo") return "logo";
      if (selectedObjectType === "sticker") return "sticker";
      return "draw";
    }
    if (activeTool === "text") return "text";
    if (activeTool === "text3d") return "text3d";
    if (activeTool === "location") return "location";
    if (activeTool === "logo") return "logo";
    if (showDrawSettings) return "draw";
    return activeTab;
  }, [activeTool, activeTab, selectedObjectType, showDrawSettings]);

  // Keep visibleTab for backward compat (used by content conditionals)
  const visibleTab = displayedTab;

  useEffect(() => { readSelected(); }, [activeTool, selectedObjectId, readSelected]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidePanelOpen(false);
    }
  }, [setSidePanelOpen]);

  return (
    <>
      {isSidePanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSidePanelOpen(false)}
        />
      )}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 flex shrink-0 flex-col gap-3 border-l border-border bg-card/98 backdrop-blur p-4 shadow-2xl transition-all duration-300 ease-in-out overflow-y-auto
          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full
          ${isSidePanelOpen ? "w-[85vw] sm:w-80 translate-x-0" : "w-0 translate-x-full lg:translate-x-0 lg:w-0 lg:p-0 lg:border-none opacity-0 lg:opacity-100"}
          lg:relative lg:inset-auto lg:z-0 lg:bg-card lg:shadow-none
        `}
      >
        {!isLicensed && (
          <div className="mx-0 mb-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-center flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="size-4 text-cyan-400 animate-pulse" />
              <p className="text-xs text-cyan-400 font-bold">🎁 Demo Modu Aktif</p>
            </div>
            <p className="text-[10px] text-zinc-300 leading-tight">
              Tüm özellikleri ücretsiz test edebilirsiniz. İndirilen çıktılarda filigran yer alacaktır.
            </p>
            <button
              type="button"
              onClick={() => useEditorStore.getState().setLicenseModalOpen(true)}
              className="mt-2 rounded-lg bg-cyan-500/20 px-3 py-1 text-[10px] font-semibold text-cyan-300 hover:bg-cyan-500/30 transition-colors w-full cursor-pointer border border-cyan-500/30"
            >
              Lisansı Etkinleştir / Kaldır
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-border pb-2 mb-1">
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary animate-pulse" />
            Özellikler
          </span>
          <button
            type="button"
            onClick={() => setSidePanelOpen(false)}
            className="rounded-md p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {!hasBackground && (
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 text-center mt-2 mb-2">
            <h4 className="text-sm font-bold text-primary mb-1">👋 İlanX'e Hoş Geldiniz!</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tasarım araçlarını görebilmek için önce üst menüdeki <strong>"Görsel"</strong> butonuna tıklayarak satacağınız dairenin veya arsanın fotoğrafını yükleyin.
            </p>
          </div>
        )}

      {/* Sekmeler */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar rounded-xl bg-muted/50 p-1 snap-x shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "sticker" || tab.id === "animation" || tab.id === "logo" || tab.id === "layers") {
                useEditorStore.getState().setTool("select");
                const canvas = getEditorCanvas();
                if (canvas) {
                  canvas.discardActiveObject();
                  canvas.requestRenderAll();
                }
                useEditorStore.getState().setSelectedObjectId(null);
                useEditorStore.getState().setSelectedObjectType(null);
              } else {
                useEditorStore.getState().setTool(tab.id as EditorTool);
              }
            }}
            className={`flex-1 min-w-[44px] shrink-0 snap-start flex flex-col items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[10px] sm:text-xs font-medium transition-colors ${
              displayedTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {visibleTab === "draw" && (
        <DrawSettingsPanel
          activeTool={activeTool}
          drawSettings={drawSettings}
          handleDrawSettingsUpdate={handleDrawSettingsUpdate}
          setDrawSettings={setDrawSettings}
        />
      )}

      {visibleTab === "text" && (
        <TextSettingsPanel
          textSettings={textSettings}
          handleTextSettingsUpdate={handleTextSettingsUpdate}
        />
      )}

      {visibleTab === "text3d" && (
        <Text3DSettingsPanel
          text3dSettings={text3dSettings}
          handleText3dSettingsUpdate={handleText3dSettingsUpdate}
        />
      )}

      {visibleTab === "location" && (
        <LocationSettingsPanel
          locationSettings={locationSettings}
          handleLocationSettingsUpdate={handleLocationSettingsUpdate}
        />
      )}

      {visibleTab === "logo" && (
        <LogoPanel handleLogoUpload={handleLogoUpload} />
      )}

      {visibleTab === "sticker" && (
        <StickerPanel addStickerToCanvas={addStickerToCanvas} />
      )}

      {visibleTab === "animation" && (
        <AnimationSettingsPanel artistStyle={artistStyle} setArtistStyle={setArtistStyle} />
      )}

      {/* ── Katman Paneli ── */}
      {activeTab === "layers" && (
        <section className="space-y-2 flex-1 min-h-0">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Layers className="size-4" />
            Katmanlar ({canvasLayers.length})
          </h2>
          {canvasLayers.length === 0 ? (
            <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 p-3">
              Tuvale nesne ekleyince burada listelenir.
            </p>
          ) : (
            <ul className="space-y-1 max-h-[400px] overflow-y-auto pr-0.5
              [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full">
              {canvasLayers.map((layer) => {
                const Icon = TYPE_ICON[layer.type] ?? MousePointer2;
                const isSelected = layer.id === selectedObjectId;
                return (
                  <li
                    key={layer.id}
                    className={`group flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "border-primary/50 bg-primary/10 text-foreground"
                        : "border-border bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground"
                    } ${!layer.visible ? "opacity-50" : ""}`}
                    onClick={() => selectObjectById(layer.id)}
                  >
                    {/* Type Icon */}
                    <Icon className="size-3.5 shrink-0 text-primary/70" />

                    {/* Label */}
                    <span className="flex-1 truncate font-medium">{layer.label}</span>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Move up (z+1) */}
                      <button
                        type="button"
                        title="Öne Taşı"
                        className="rounded p-0.5 hover:bg-background transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayerOrder(layer.id, "up");
                        }}
                      >
                        <ChevronUp className="size-3" />
                      </button>

                      {/* Move down (z-1) */}
                      <button
                        type="button"
                        title="Arkaya Taşı"
                        className="rounded p-0.5 hover:bg-background transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayerOrder(layer.id, "down");
                        }}
                      >
                        <ChevronDown className="size-3" />
                      </button>

                      {/* Visibility */}
                      <button
                        type="button"
                        title={layer.visible ? "Gizle" : "Göster"}
                        className="rounded p-0.5 hover:bg-background transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
                        }}
                      >
                        {layer.visible
                          ? <Eye className="size-3" />
                          : <EyeOff className="size-3 text-muted-foreground" />
                        }
                      </button>

                      {/* Lock */}
                      <button
                        type="button"
                        title={layer.locked ? "Kilidi Aç" : "Kilitle"}
                        className="rounded p-0.5 hover:bg-background transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerLock(layer.id);
                        }}
                      >
                        {layer.locked
                          ? <Lock className="size-3 text-amber-500" />
                          : <LockOpen className="size-3" />
                        }
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Sil"
                        className="rounded p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLayerById(layer.id);
                        }}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>

                    {/* Always-visible lock indicator */}
                    {layer.locked && (
                      <Lock className="size-3 text-amber-500 shrink-0 group-hover:hidden" />
                    )}
                    {!layer.visible && (
                      <EyeOff className="size-3 text-muted-foreground shrink-0 group-hover:hidden" />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* ── Parsel Nokta sayısı ── */}
      {activeTool === "polygon" && polygonPointCount > 0 && (
        <p className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-700 dark:text-emerald-300">
          {polygonPointCount} nokta eklendi. Enter veya ilk noktaya tıklayarak kapatın.
        </p>
      )}

      {/* ── Kısayollar ── */}
      <section className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground mt-auto">
        <p className="font-medium text-foreground">Kısayollar</p>
        <ul className="mt-2 space-y-1">
          <li>Ctrl + tekerlek — yakınlaştır</li>
          <li>Ctrl+Z / Ctrl+Y — geri / ileri</li>
          <li>Delete — sil</li>
          <li>Parsel: Enter kapat · Esc iptal</li>
          <li>Lokasyon: Çift tıklayınca etiket düzenle</li>
        </ul>
      </section>
    </aside>
    </>
  );
}
