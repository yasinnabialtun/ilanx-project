"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";
import { resizeImageFile } from "@/features/export/utils/export-image";

type EmptyStateProps = {
  setBackgroundDataUrl?: (dataUrl: string | null) => void;
};

export function EmptyState({ setBackgroundDataUrl }: EmptyStateProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !setBackgroundDataUrl) return;
    try {
      const dataUrl = await resizeImageFile(file);
      setBackgroundDataUrl(dataUrl);
    } catch {
      alert("Görsel yüklenemedi. Lütfen JPG veya PNG deneyin.");
    }
    e.target.value = "";
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
      <div className="w-full max-w-[min(22rem,calc(100vw-6rem))] rounded-xl border-2 border-dashed border-primary/50 bg-card/95 p-6 text-center shadow-2xl backdrop-blur-sm sm:p-8 pointer-events-auto transition-transform hover:scale-[1.02] duration-300 ease-out">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ImagePlus className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Arsa İşaretleme
        </h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Plan veya arsa fotoğrafı yükleyin ya da buraya sürükleyin. Nokta ile parsel çizin, etiket
          ve ok ekleyin.
        </p>
        
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
        
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <ImagePlus className="size-5" />
          Fotoğraf Yükle
        </button>
      </div>
    </div>
  );
}
