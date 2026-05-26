import { FabricImage } from "fabric";
import type { Text3DSettings } from "@/shared/types";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace("#", "");
  if (c.length !== 6) return { r: 51, g: 51, b: 51 };
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${Math.max(0, Math.min(255, r)).toString(16).padStart(2, "0")}${Math.max(0, Math.min(255, g)).toString(16).padStart(2, "0")}${Math.max(0, Math.min(255, b)).toString(16).padStart(2, "0")}`;
}

export function render3DTextToCanvas(
  canvas: HTMLCanvasElement,
  settings: Text3DSettings
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { content, fontSize, color, depth, fontFamily, extrusionAngle = 45 } = settings;
  const text = content.trim() || "Arsa";

  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;
  
  // High-definition text height calculation
  const textHeight = fontSize;

  // Extrusion offsets
  const angleRad = (extrusionAngle * Math.PI) / 180;
  const extX = depth * Math.cos(angleRad);
  const extY = depth * Math.sin(angleRad);

  // Padding to prevent clipping of shadows/strokes
  const padding = 24; 
  const canvasWidth = textWidth + Math.abs(extX) + padding * 2;
  const canvasHeight = textHeight + Math.abs(extY) + padding * 2;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Set font properties again after resize
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";

  // Base coordinates for front text (top face)
  // If extrusion goes left/up, we start front face on the right/bottom
  const startX = extX < 0 ? padding - extX : padding;
  const startY = extY < 0 ? padding - extY : padding;

  // 1. Draw Cast Shadow (at the bottom-most level of the extrusion)
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = extX + depth * 0.15;
  ctx.shadowOffsetY = extY + depth * 0.15;
  ctx.fillStyle = "black";
  ctx.fillText(text, startX, startY + textHeight / 2);
  ctx.restore();

  // 2. Draw Extrusion Layers (back to front)
  const baseColor = hexToRgb(color);
  for (let i = depth; i > 0; i--) {
    const ratio = i / depth; // 1 at back, 0 at front
    // Gradient shading: back layers are darker (ambient occlusion shadow)
    const shadowFactor = 0.45 + (1 - ratio) * 0.45;
    const layerColor = rgbToHex(
      Math.floor(baseColor.r * shadowFactor),
      Math.floor(baseColor.g * shadowFactor),
      Math.floor(baseColor.b * shadowFactor)
    );

    const stepX = (i / depth) * extX;
    const stepY = (i / depth) * extY;

    // Draw extrusion layer face
    ctx.fillStyle = layerColor;
    ctx.fillText(text, startX + stepX, startY + stepY + textHeight / 2);
    
    // Draw extrusion layer stroke for high-definition depth borders
    ctx.strokeStyle = rgbToHex(
      Math.floor(baseColor.r * shadowFactor * 0.75),
      Math.floor(baseColor.g * shadowFactor * 0.75),
      Math.floor(baseColor.b * shadowFactor * 0.75)
    );
    ctx.lineWidth = 1.5;
    ctx.strokeText(text, startX + stepX, startY + stepY + textHeight / 2);
  }

  // 3. Draw Front Face
  ctx.fillStyle = color;
  ctx.fillText(text, startX, startY + textHeight / 2);
  
  // Draw subtle highlight border on the front face
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 1;
  ctx.strokeText(text, startX, startY + textHeight / 2);
}

export function createText3D(
  settings: Text3DSettings,
  position: { left: number; top: number },
  id: string,
): FabricImage {
  const canvas = document.createElement("canvas");
  render3DTextToCanvas(canvas, settings);

  const img = new FabricImage(canvas, {
    left: position.left,
    top: position.top,
    originX: "center",
    originY: "center",
    cornerStyle: "circle",
    cornerColor: "#3b82f6",
    borderColor: "#3b82f6",
    transparentCorners: false,
    skewX: settings.skewX || 0,
    skewY: settings.skewY || 0,
  });

  img.set("data", {
    type: "text3d",
    id,
    text3dSettings: { ...settings, content: settings.content.trim() || "Arsa" }
  });

  // Attach canvas to image object so we can redraw directly on it on update
  (img as any)._3dCanvas = canvas;

  return img;
}

export function updateText3D(
  img: FabricImage,
  settings: Text3DSettings,
): void {
  const canvas = (img as any)._3dCanvas || document.createElement("canvas");
  (img as any)._3dCanvas = canvas;

  const safeText = settings.content.trim() || "Arsa";
  const newSettings = { ...settings, content: safeText };

  render3DTextToCanvas(canvas, newSettings);

  // Update canvas source on the image
  img.setElement(canvas);
  img.set({
    width: canvas.width,
    height: canvas.height,
    skewX: settings.skewX || 0,
    skewY: settings.skewY || 0,
  });

  const currentData = img.get("data") || {};
  img.set("data", {
    ...currentData,
    text3dSettings: newSettings,
  });

  img.setCoords();
}
