"use client";

import { useState, useCallback } from "react";

type ImageUploadAreaProps = {
  setBackgroundDataUrl: (dataUrl: string | null) => void;
};

export function ImageUploadArea({ setBackgroundDataUrl }: ImageUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith("image/") || file.name.match(/\.(jpg|jpeg|png|webp|heic|heif)$/i))) {
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setBackgroundDataUrl(dataUrl);
        };
        reader.readAsDataURL(file);
      } catch {
        alert("Görsel yüklenemedi. Lütfen JPG veya PNG deneyin.");
      }
    }
  }, [setBackgroundDataUrl]);

  return (
    <div
      className="absolute inset-0 z-20"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 border-4 border-dashed border-primary transition-all duration-300">
          <div className="text-center text-white scale-105 transform duration-300">
            <p className="text-lg sm:text-2xl font-bold tracking-tight">Arsa Görselini Buraya Bırakın</p>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-neutral-300">Resim otomatik olarak editöre yüklenecektir.</p>
          </div>
        </div>
      )}
    </div>
  );
}
