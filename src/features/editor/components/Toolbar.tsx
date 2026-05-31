"use client";

import {
  ArrowUpRight,
  Circle,
  Download,
  Hand,
  ImagePlus,
  LandPlot,
  Maximize2,
  Minus,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
  ZoomIn,
  ZoomOut,
  Boxes,
  MapPin,
  Video,
  SlidersHorizontal,
  Menu,
  ImageIcon,
  Keyboard,
} from "lucide-react";
import { useRef, useState } from "react";
import Link from "next/link";

import { ThemeToggle } from "@/core/components/theme-toggle";
import { Button } from "@/shared/components/ui/button";
import {
  deleteEditorSelection,
  exportEditorImage,
  exportEditorPdf,
  exportEditorVideo,
  fitCanvasToScreen,
  clearCanvasAnnotations,
  redoEditor,
  resetCanvasZoom,
  undoEditor,
  zoomCanvas,
} from "@/features/editor/utils/canvas-api";
import { resizeImageFile } from "@/features/export/utils/export-image";
import type { EditorTool } from "@/shared/types";
import { useEditorStore } from "@/features/editor/store/editorStore";

type ToolbarProps = {
  onImageLoaded: (dataUrl: string) => void;
};

type ToolDef = {
  id: EditorTool;
  label: string;
  icon: typeof MousePointer2;
  group: "navigate" | "draw" | "annotate";
};

const TOOLS: ToolDef[] = [
  { id: "select", label: "Seç", icon: MousePointer2, group: "navigate" },
  { id: "pan", label: "Kaydır", icon: Hand, group: "navigate" },
  { id: "polygon", label: "Parsel", icon: LandPlot, group: "draw" },
  { id: "rect", label: "Dikdörtgen", icon: Square, group: "draw" },
  { id: "circle", label: "Daire", icon: Circle, group: "draw" },
  { id: "line", label: "Çizgi", icon: Minus, group: "draw" },
  { id: "arrow", label: "Ok", icon: ArrowUpRight, group: "draw" },
  { id: "pencil", label: "Kalem", icon: Pencil, group: "draw" },
  { id: "text", label: "Metin", icon: Type, group: "annotate" },
  { id: "text3d", label: "3D Metin", icon: Boxes, group: "annotate" },
  { id: "location", label: "Lokasyon", icon: MapPin, group: "annotate" },
  { id: "logo", label: "Logo", icon: ImageIcon, group: "annotate" },
];

export function Toolbar({ onImageLoaded }: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const activeTool = useEditorStore((s) => s.activeTool);
  const hasBackground = useEditorStore((s) => s.hasBackground);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const isRecordingVideo = useEditorStore((s) => s.isRecordingVideo);
  const setTool = useEditorStore((s) => s.setTool);
  const isSidePanelOpen = useEditorStore((s) => s.isSidePanelOpen);
  const setSidePanelOpen = useEditorStore((s) => s.setSidePanelOpen);
  const isLicensed = useEditorStore((s) => s.isLicensed);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Lütfen geçerli bir görsel dosyası (JPEG, PNG, WEBP) seçin.");
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await resizeImageFile(file);
      onImageLoaded(dataUrl);
    } catch {
      alert("Görsel yüklenemedi. Lütfen JPG veya PNG deneyin.");
    }
    e.target.value = "";
  };

  const handleSave = () => {
    if (!hasBackground) {
      alert("Önce bir fotoğraf yükleyin.");
      return;
    }
    exportEditorImage(
      `arsa-isaretleme-${new Date().toISOString().slice(0, 10)}.png`,
    );
  };

  const handleSavePdf = () => {
    if (!hasBackground) {
      alert("Önce bir fotoğraf yükleyin.");
      return;
    }
    exportEditorPdf(
      `arsa-isaretleme-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };

  const handleSaveVideo = async () => {
    if (!hasBackground) {
      alert("Önce bir fotoğraf yükleyin.");
      return;
    }
    await exportEditorVideo();
  };

  const renderTool = (tool: ToolDef) => (
    <Button
      key={tool.id}
      type="button"
      variant={activeTool === tool.id ? "default" : "outline"}
      size="sm"
      onClick={() => {
        setTool(tool.id);
        if (["text", "text3d", "location", "logo", "polygon", "rect", "circle", "line", "arrow", "pencil"].includes(tool.id)) {
          setSidePanelOpen(true);
        }
        setMobileToolsOpen(false);
      }}
      disabled={
        (!hasBackground && tool.id !== "select") ||
        isRecordingVideo
      }
      title={tool.label}
      aria-label={tool.label}
      className="min-h-[44px] min-w-[44px] shrink-0 touch-manipulation"
    >
      <tool.icon className="size-4" />
      <span className="hidden md:inline">{tool.label}</span>
    </Button>
  );

  return (
    <header className="flex max-w-full flex-col gap-1.5 overflow-hidden border-b border-border bg-card px-2 py-2 sm:px-3 sm:gap-2">
      {/* ── Row 1: Actions ── */}
      <div className="flex max-w-full flex-wrap items-center gap-1 sm:gap-1.5 pb-0.5 sm:pb-0">
        {/* İlanX Branding */}
        <Link href="/" className="flex items-center gap-1.5 mr-2 sm:mr-4 shrink-0 transition-opacity hover:opacity-90">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary neon-cyan">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l10 10-10 10L2 12 12 2z" />
            </svg>
          </div>
          <span className="text-base font-bold text-foreground">
            İlanX
          </span>
        </Link>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={handleFile}
        />

        {/* 1. Görsel Yükleme */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          aria-label="Görsel Yükle"
          className="min-h-[44px] touch-manipulation"
        >
          <ImagePlus className="size-4" />
          <span className="hidden xs:inline sm:inline">Görsel</span>
        </Button>

        {/* 2. Mobil Araçlar Tetikleyici */}
        <Button
          type="button"
          variant={mobileToolsOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
          className="md:hidden min-h-[44px] touch-manipulation"
          title="Araçları Göster/Gizle"
          aria-label="Araçları Göster veya Gizle"
        >
          <Menu className="size-4" />
          <span className="hidden xs:inline">Araçlar</span>
        </Button>

        {/* 3. Panel Tetikleyici */}
        <Button
          type="button"
          variant={isSidePanelOpen ? "default" : "outline"}
          size="sm"
          onClick={() => setSidePanelOpen(!isSidePanelOpen)}
          className="min-h-[44px] touch-manipulation"
          title="Ayarlar/Özellikler Paneli"
          aria-label="Özellikler Panelini Aç veya Kapat"
        >
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Panel</span>
        </Button>

        <div className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden />

        {/* 4. Geri / İleri Al */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => undoEditor()}
          disabled={!canUndo}
          title="Geri al (Ctrl+Z)"
          aria-label="Son yapılan işlemi geri al"
          className="min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <Undo2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => redoEditor()}
          disabled={!canRedo}
          title="Yinele (Ctrl+Y)"
          aria-label="Geri alınan işlemi yinele"
          className="min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <Redo2 className="size-4" />
        </Button>

        {/* 5. Sil Butonu */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => deleteEditorSelection()}
          disabled={!hasBackground}
          aria-label="Seçili nesneyi sil"
          className="min-h-[44px] touch-manipulation"
        >
          <Trash2 className="size-4" />
          <span className="hidden sm:inline">Sil</span>
        </Button>

        <div className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden />

        {/* 6. İndir / Dışa Aktar Kontrolleri */}
        <Button
          type="button"
          size="sm"
          onClick={handleSave}
          disabled={!hasBackground || isRecordingVideo}
          className="min-h-[44px] touch-manipulation"
          title="PNG olarak indir"
          aria-label="Tasarımı PNG görseli olarak indir"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">PNG</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={handleSavePdf}
          disabled={!hasBackground || isRecordingVideo}
          className="min-h-[44px] touch-manipulation"
          title="PDF olarak indir"
          aria-label="Tasarımı PDF belgesi olarak indir"
        >
          <Download className="size-4" />
          <span className="hidden sm:inline">PDF</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant={isRecordingVideo ? "destructive" : "outline"}
          onClick={handleSaveVideo}
          disabled={!hasBackground || isRecordingVideo}
          aria-label="Tasarımı canlandırmalı WebM videosu olarak indir"
          className={`min-h-[44px] touch-manipulation ${isRecordingVideo ? "animate-pulse" : ""}`}
        >
          <Video className={`size-4 ${isRecordingVideo ? "text-red-500" : ""}`} />
          <span className="hidden md:inline">
            {isRecordingVideo ? "Kayıt Yapılıyor..." : "Video İndir"}
          </span>
        </Button>

        <div className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden />

        {/* 7. Zoom Kontrolleri */}
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => zoomCanvas(0.15)}
          disabled={!hasBackground}
          title="Yakınlaştır"
          aria-label="Tuali yakınlaştır"
          className="min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => zoomCanvas(-0.15)}
          disabled={!hasBackground}
          title="Uzaklaştır"
          aria-label="Tuali uzaklaştır"
          className="min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => fitCanvasToScreen()}
          disabled={!hasBackground}
          title="Sığdır"
          aria-label="Görseli ekrana sığdır"
          className="min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <Maximize2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => resetCanvasZoom()}
          disabled={!hasBackground}
          title="Zoom sıfırla"
          aria-label="Yakınlaştırmayı bire bir oranına sıfırla"
          className="hidden lg:inline-flex min-h-[44px] min-w-[44px]"
        >
          1:1
        </Button>

        <div className="hidden sm:block sm:flex-1" />
        
        <ThemeToggle />

        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => {
            if (typeof window !== "undefined" && (window as any).__toggleShortcutsModal) {
              (window as any).__toggleShortcutsModal();
            }
          }}
          title="Klavye Kısayolları (?)"
          aria-label="Klavye kısayolları listesini aç"
          className="min-h-[44px] min-w-[44px]"
        >
          <Keyboard className="size-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            if (confirm("Tüm işaretlemeler silinsin mi?")) {
              clearCanvasAnnotations();
            }
          }}
          disabled={!hasBackground}
          aria-label="Tüm çizimleri temizle"
          className="hidden md:inline-flex"
        >
          Temizle
        </Button>
      </div>

      {/* ── Row 2: Drawing tools ── */}
      {/* Desktop: always visible, horizontally scrollable */}
      <div className="hidden md:flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin">
        {TOOLS.filter((t) => t.group === "navigate").map(renderTool)}
        <div className="mx-0.5 w-px shrink-0 self-stretch bg-border" />
        {TOOLS.filter((t) => t.group === "draw").map(renderTool)}
        <div className="mx-0.5 w-px shrink-0 self-stretch bg-border" />
        {TOOLS.filter((t) => t.group === "annotate").map(renderTool)}
      </div>

      {/* Mobile: collapsible tool grid — 4 columns for comfortable touch targets */}
      {mobileToolsOpen && (
        <div className="md:hidden grid grid-cols-4 gap-1.5 animate-in slide-in-from-top-1 fade-in duration-200">
          {TOOLS.map(renderTool)}
        </div>
      )}
    </header>
  );
}
