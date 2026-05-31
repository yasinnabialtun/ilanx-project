import type { Canvas } from "fabric";
import jsPDF from "jspdf";
import type { VideoExportQuality } from "@/shared/types";
import { telemetry } from "@/core/utils/telemetry";

export async function resizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        const maxSize = isMobile ? 1600 : 2400;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D context from canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function downloadCanvasImage(canvas: Canvas, filename?: string) {
  const stopTimer = telemetry.startTimer("PNG Image Export");
  // Discard selection so the handles/borders are not burned into the export
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  let dataUrl: string;
  const img = canvas.backgroundImage;

  if (img && typeof img !== 'string') {
    // Save current viewport transform to restore it later
    const origVpt = (canvas.viewportTransform
      ? [...canvas.viewportTransform]
      : [1, 0, 0, 1, 0, 0]) as import("fabric").TMat2D;

    // Reset viewport to identity so coordinates map 1-to-1 with image pixels
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.requestRenderAll();

    const left = img.left ?? 0;
    const top = img.top ?? 0;
    const width = img.width ?? 1;
    const height = img.height ?? 1;

    // Export at native image resolution (1:1 pixel mapping)
    dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1.0,
      left,
      top,
      width,
      height,
      multiplier: 1,
    });

    // Restore original viewport transform
    canvas.setViewportTransform(origVpt);
    canvas.requestRenderAll();
  } else {
    dataUrl = canvas.toDataURL({ format: "png", quality: 1.0, multiplier: 1 });
  }


  // Restore selection
  if (activeObject) {
    canvas.setActiveObject(activeObject);
    canvas.requestRenderAll();
  }

  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename ?? `arsa-isaretleme-${Date.now()}.png`;
  a.click();
  stopTimer();
}

export function downloadCanvasPdf(canvas: Canvas, filename?: string) {
  const stopTimer = telemetry.startTimer("PDF Export");
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  let dataUrl: string;
  const img = canvas.backgroundImage;
  let width = canvas.getWidth();
  let height = canvas.getHeight();

  if (img && typeof img !== 'string') {
    const origVpt = (canvas.viewportTransform
      ? [...canvas.viewportTransform]
      : [1, 0, 0, 1, 0, 0]) as import("fabric").TMat2D;

    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.requestRenderAll();

    const left = img.left ?? 0;
    const top = img.top ?? 0;
    width = img.width ?? 1;
    height = img.height ?? 1;

    dataUrl = canvas.toDataURL({
      format: "jpeg",
      quality: 0.95,
      left,
      top,
      width,
      height,
      multiplier: 1,
    });

    canvas.setViewportTransform(origVpt);
    canvas.requestRenderAll();
  } else {
    dataUrl = canvas.toDataURL({ format: "jpeg", quality: 0.95, multiplier: 1 });
  }

  if (activeObject) {
    canvas.setActiveObject(activeObject);
    canvas.requestRenderAll();
  }

  const orientation = width > height ? 'l' : 'p';
  const doc = new jsPDF(orientation, 'px', [width, height]);
  doc.addImage(dataUrl, 'JPEG', 0, 0, width, height);
  doc.save(filename ?? `arsa-isaretleme-${Date.now()}.pdf`);
  stopTimer();
}


/** Video olarak kaydet: MediaRecorder API → WebM */
export function downloadCanvasVideo(
  canvas: Canvas,
  durationMs: number = 3000,
  quality: VideoExportQuality = "medium",
  onDone?: (blob: Blob) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const stopTimer = telemetry.startTimer("Video Export");
    try {
      const el = canvas.getElement();
      if (!(el as HTMLCanvasElement).captureStream) {
        alert("Tarayıcınız video kaydını desteklemiyor.");
        resolve();
        return;
      }

      // 1. Save original canvas state
      const cw = canvas.getWidth();
      const ch = canvas.getHeight();
      const origVpt = (canvas.viewportTransform ? [...canvas.viewportTransform] : [1, 0, 0, 1, 0, 0]) as import("fabric").TMat2D;
      const origZoom = canvas.getZoom();

      const img = canvas.backgroundImage;
      let scale = 1;

      // 2. Resize canvas to match the background image size (capped based on quality & device constraints)
      if (img && typeof img !== 'string') {
        let targetWidth = img.width ?? 1;
        let targetHeight = img.height ?? 1;
        
        let maxSize = 1280; // default medium (720p)
        if (quality === "low") maxSize = 854;
        if (quality === "high") maxSize = 1920;
        if (quality === "lossless") maxSize = 2560;

        // Cap to 720p on mobile to prevent crashes
        const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
        if (isMobile) {
          maxSize = Math.min(maxSize, 1280);
        }

        if (targetWidth > maxSize || targetHeight > maxSize) {
          scale = Math.min(maxSize / targetWidth, maxSize / targetHeight);
          targetWidth = Math.round(targetWidth * scale);
          targetHeight = Math.round(targetHeight * scale);
        }
        
        // Force even dimensions to ensure encoder compatibility on all browsers
        if (targetWidth % 2 !== 0) targetWidth += 1;
        if (targetHeight % 2 !== 0) targetHeight += 1;
        
        canvas.setDimensions({ width: targetWidth, height: targetHeight });
        canvas.setViewportTransform([scale, 0, 0, scale, 0, 0]);
        canvas.setZoom(scale);
        canvas.requestRenderAll();
      }

      const bitrates: Record<VideoExportQuality, number> = {
        low: 1_000_000,
        medium: 3_000_000,
        high: 8_000_000,
        lossless: 16_000_000,
      };
      const bps = bitrates[quality] || 3_000_000;

      // Detect browser support for container/mime type (e.g. video/mp4 on iOS/Safari, video/webm elsewhere)
      let mimeType = "video/webm";
      let extension = "webm";

      if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")) {
        mimeType = "video/mp4;codecs=avc1";
        extension = "mp4";
      } else if (MediaRecorder.isTypeSupported("video/mp4")) {
        mimeType = "video/mp4";
        extension = "mp4";
      } else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        mimeType = "video/webm;codecs=vp9";
        extension = "webm";
      } else if (MediaRecorder.isTypeSupported("video/webm")) {
        mimeType = "video/webm";
        extension = "webm";
      }

      const stream = (el as HTMLCanvasElement).captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bps,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        // Restore original canvas size and zoom
        canvas.setDimensions({ width: cw, height: ch });
        canvas.setViewportTransform(origVpt);
        canvas.setZoom(origZoom);
        canvas.requestRenderAll();

        const blob = new Blob(chunks, { type: mimeType });
        if (onDone) onDone(blob);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `arsa-plan-${Date.now()}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
        stopTimer();
        resolve();
      };

      recorder.start();
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, durationMs);
    } catch (err) {
      telemetry.error("Video export failed", err);
      stopTimer();
      console.error(err);
      alert("Video kaydedilirken hata oluştu.");
      reject(err);
    }
  });
}
