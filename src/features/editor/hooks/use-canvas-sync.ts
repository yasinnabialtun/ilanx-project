import { useCallback } from "react";
import { getEditorCanvas } from "@/features/editor/utils/canvas-api";
import { createLocationMarker } from "@/features/editor/utils/shapes";
import {
  createStickerGlassPanel,
  createStickerNeonBoard,
  createStickerWoodenBoard,
  createSticker3DHouse,
  createSticker3DGoldCoin,
  createSticker3DCompass,
  createStickerNeonArrow,
  createStickerClassic3DArrow,
  createStickerForSale,
  createStickerPriceBadge,
  createStickerSoldStamp,
  createStickerMeasureLabel,
  createStickerForRent,
  createStickerGreenZone,
  createStickerZoning,
  createStickerDeed,
} from "@/features/editor/utils/stickers";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { getHistory } from "@/features/editor/utils/history";
import { updateText3D } from "@/features/animations/utils/text-3d";

function rgbaToHexAndOpacity(rgba: string) {
  if (rgba.startsWith('#')) return { hex: rgba, opacity: 1 };
  const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return { hex: '#000000', opacity: 1 };
  const r = parseInt(m[1]).toString(16).padStart(2, '0');
  const g = parseInt(m[2]).toString(16).padStart(2, '0');
  const b = parseInt(m[3]).toString(16).padStart(2, '0');
  return { hex: `#${r}${g}${b}`, opacity: m[4] ? parseFloat(m[4]) : 1 };
}

export function useCanvasSync() {
  const setSelectedObjectId = useEditorStore((s) => s.setSelectedObjectId);
  const setSelectedObjectType = useEditorStore((s) => s.setSelectedObjectType);
  const setDrawSettings = useEditorStore((s) => s.setDrawSettings);
  const setTextSettings = useEditorStore((s) => s.setTextSettings);
  const setText3dSettings = useEditorStore((s) => s.setText3dSettings);
  const setLocationSettings = useEditorStore((s) => s.setLocationSettings);
  const setSidePanelOpen = useEditorStore((s) => s.setSidePanelOpen);

  const drawSettings = useEditorStore((s) => s.drawSettings);
  const locationSettings = useEditorStore((s) => s.locationSettings);
  const text3dSettings = useEditorStore((s) => s.text3dSettings);
  
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const selectedObjectType = useEditorStore((s) => s.selectedObjectType);

  const readSelected = useCallback(() => {
    const canvas = getEditorCanvas();
    const obj = canvas?.getActiveObject?.();
    if (!obj) { 
      setSelectedObjectId(null); 
      setSelectedObjectType(null);
      return; 
    }
    const data = obj.get?.("data");
    if (data?.id) {
      setSelectedObjectId(data.id);
      setSelectedObjectType(data.type ?? null);
      setSidePanelOpen(true);

      if (data.type === "parcel" || data.type === "shape" || data.type === "drawing") {
        if (obj.stroke && typeof obj.stroke === "string") {
          setDrawSettings({ strokeColor: obj.stroke });
        }
        if (obj.strokeWidth !== undefined) {
          setDrawSettings({ strokeWidth: obj.strokeWidth });
        }
        if (obj.strokeDashArray) {
          setDrawSettings({ strokeDashArray: obj.strokeDashArray });
        } else {
          setDrawSettings({ strokeDashArray: undefined });
        }
        if (obj.fill && typeof obj.fill === "string") {
          const parsed = rgbaToHexAndOpacity(obj.fill);
          setDrawSettings({ fillColor: parsed.hex, fillOpacity: parsed.opacity });
        }
       } else if (data.type === "text") {
         const rawFont = (obj as import("fabric").IText).fontFamily || "Arial";
         const fontFamily = rawFont.replace(", sans-serif", "").replace(/'/g, "").replace(/"/g, "").trim();
         setTextSettings({
           content: (obj as import("fabric").IText).text || "",
           fontSize: (obj as import("fabric").IText).fontSize || 28,
           color: (obj as import("fabric").IText).fill as string,
           fontFamily,
           textBackgroundColor: (obj as import("fabric").IText).textBackgroundColor || "transparent",
         });
       } else if (data.type === "text3d") {
         const settings = data.text3dSettings || {};
         const rawFont = settings.fontFamily || "Montserrat";
         const fontFamily = rawFont.replace(", sans-serif", "").replace(/'/g, "").replace(/"/g, "").trim();
         setText3dSettings({
           content: settings.content || "Arsa",
           fontSize: settings.fontSize || 84,
           color: settings.color || "#fbbf24",
           depth: settings.depth || 10,
           fontFamily,
           extrusionAngle: settings.extrusionAngle || 45,
           skewX: settings.skewX || 0,
           skewY: settings.skewY || 0,
         });
       } else if (data.type === "location") {
         setLocationSettings({
           label: data.label ?? "Lokasyon",
           color: data.color ?? "#ef4444",
           size: data.size ?? 24,
           showPulse: data.showPulse ?? true,
           iconType: data.iconType ?? "pin",
         });
      }
    }
  }, [setSelectedObjectId, setSelectedObjectType, setDrawSettings, setTextSettings, setText3dSettings, setLocationSettings, setSidePanelOpen]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      alert("Lütfen sadece geçerli bir görsel formatı (PNG, JPEG, WEBP) yükleyin. SVG formatı güvenlik nedeniyle desteklenmemektedir.");
      e.target.value = "";
      return;
    }

    const canvas = getEditorCanvas();
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = (f) => {
      const dataUrl = f.target?.result as string;
      import("fabric").then(({ FabricImage }) => {
        FabricImage.fromURL(dataUrl).then((img) => {
          img.set({
            left: canvas.width / 2,
            top: canvas.height / 2,
            originX: "center",
            originY: "center",
            data: { type: "logo" },
            cornerStyle: "circle",
            cornerColor: "#3b82f6",
            borderColor: "#3b82f6",
            transparentCorners: false,
          });
          
          if (img.width > 200 || img.height > 200) {
            const scale = 200 / Math.max(img.width, img.height);
            img.scale(scale);
          }

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          import("@/features/editor/utils/history").then(({ getHistory }) => getHistory()?.save());
        });
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDrawSettingsUpdate = (updates: Partial<typeof drawSettings>) => {
    setDrawSettings(updates);
    const canvas = getEditorCanvas();
    const obj = canvas?.getActiveObject?.();
    if (canvas && obj && selectedObjectId && (selectedObjectType === "parcel" || selectedObjectType === "shape" || selectedObjectType === "drawing")) {
      const groupLike = obj as import("fabric").FabricObject & {
        getObjects?: () => import("fabric").FabricObject[];
      };
      const isGroup = obj.type === "group" || Boolean(groupLike.getObjects);
      if (isGroup) {
        const group = obj as import("fabric").Group;
        const items = group.getObjects?.() || [];
        items.forEach((child) => {
          if (updates.strokeColor !== undefined) {
            if (child.type === "line") {
              child.set("stroke", updates.strokeColor);
            } else if (child.type === "triangle") {
              child.set("fill", updates.strokeColor);
            }
          }
          if (updates.strokeWidth !== undefined) {
            if (child.type === "line") {
              child.set("strokeWidth", updates.strokeWidth);
            } else if (child.type === "triangle") {
              child.set("width", updates.strokeWidth * 5);
              child.set("height", updates.strokeWidth * 7);
            }
          }
          if (updates.strokeDashArray !== undefined) {
            if (child.type === "line") {
              child.set("strokeDashArray", updates.strokeDashArray);
            }
          }
        });
      } else {
        if (updates.strokeColor !== undefined) {
          obj.set("stroke", updates.strokeColor);
          obj.set("cornerColor", updates.strokeColor);
        }
        if (updates.fillColor !== undefined || updates.fillOpacity !== undefined) {
          const c = updates.fillColor ?? drawSettings.fillColor;
          const o = updates.fillOpacity ?? drawSettings.fillOpacity;
          const rgba = `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${o})`;
          obj.set("fill", rgba);
        }
        if (updates.strokeWidth !== undefined) {
          obj.set("strokeWidth", updates.strokeWidth);
        }
        if (updates.strokeDashArray !== undefined) {
          obj.set("strokeDashArray", updates.strokeDashArray);
        }
      }
      obj.set("dirty", true);
      canvas.requestRenderAll();
      getHistory()?.save();
    }
  };

  const handleTextSettingsUpdate = (updates: any) => {
    setTextSettings(updates);
    const canvas = getEditorCanvas();
    const obj = canvas?.getActiveObject?.();
    if (canvas && obj && selectedObjectId && selectedObjectType === "text") {
      if (updates.content !== undefined) {
        (obj as import("fabric").IText).set("text", updates.content);
      }
      if (updates.fontSize !== undefined) obj.set("fontSize", updates.fontSize);
      if (updates.fontFamily !== undefined) {
        obj.set("fontFamily", `${updates.fontFamily}, sans-serif`);
      }
      if (updates.textBackgroundColor !== undefined) {
        obj.set("textBackgroundColor", updates.textBackgroundColor);
      }
      if (updates.color !== undefined) {
        obj.set("fill", updates.color);
        obj.set("borderColor", updates.color);
        obj.set("editingBorderColor", updates.color);
        obj.set("cornerColor", updates.color);
      }
      obj.set("dirty", true);
      canvas.requestRenderAll();
      getHistory()?.save();
    }

    if (updates.fontFamily && typeof window !== "undefined" && "fonts" in document) {
      document.fonts.load(`1em ${updates.fontFamily}`).then(() => {
        canvas?.requestRenderAll();
      });
    }
  };

  const handleLocationSettingsUpdate = (updates: Partial<typeof locationSettings>) => {
    const nextSettings = { ...locationSettings, ...updates };
    setLocationSettings(updates);
    const canvas = getEditorCanvas();
    const obj = canvas?.getActiveObject?.();
    if (canvas && obj && selectedObjectId && selectedObjectType === "location") {
      const group = obj as import("fabric").Group;
      const left = group.left;
      const top = group.top;
      
      const newMarker = createLocationMarker(left, top, nextSettings);
      newMarker.set("data", {
        type: "location",
        id: selectedObjectId,
        label: nextSettings.label,
        color: nextSettings.color,
        size: nextSettings.size,
        showPulse: nextSettings.showPulse,
        iconType: nextSettings.iconType,
      });
      
      canvas.remove(group);
      canvas.add(newMarker);
      canvas.setActiveObject(newMarker);
      canvas.requestRenderAll();
      
      if (updates.label !== undefined) {
        useEditorStore.getState().updateParcelLabel(selectedObjectId, updates.label);
      }
      
      getHistory()?.save();
    }
  };

  const handleText3dSettingsUpdate = (updates: Partial<typeof text3dSettings>) => {
    const nextSettings = { ...text3dSettings, ...updates };
    setText3dSettings(updates);

    const canvas = getEditorCanvas();
    const obj = canvas?.getActiveObject?.();
    if (!canvas || !obj || !selectedObjectId || selectedObjectType !== "text3d") return;

    const img = obj as import("fabric").FabricImage;
    updateText3D(img, nextSettings);
    
    if (updates.content !== undefined) {
      useEditorStore.getState().updateParcelLabel(selectedObjectId, updates.content);
    }
    
    canvas.requestRenderAll();
    getHistory()?.save();

    if (updates.fontFamily && typeof window !== "undefined" && "fonts" in document) {
      document.fonts.load(`1em ${updates.fontFamily}`).then(() => {
        canvas?.requestRenderAll();
      });
    }
  };

  const addStickerToCanvas = (type: string) => {
    const canvas = getEditorCanvas();
    if (!canvas) return;

    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform;
    if (!vpt) return;
    
    // Count existing stickers to stagger positions and prevent perfect overlap
    const stickerCount = canvas.getObjects().filter(o => {
      const d = o.get?.("data") as any;
      return d?.type === "sticker";
    }).length;
    const offset = (stickerCount * 25) % 150;

    const centerX = (canvas.getWidth() / 2 - vpt[4]) / zoom + offset;
    const centerY = (canvas.getHeight() / 2 - vpt[5]) / zoom + offset;

    let sticker: import("fabric").Group | null = null;
    switch (type) {
      case "glass": sticker = createStickerGlassPanel(centerX, centerY); break;
      case "neon": sticker = createStickerNeonBoard(centerX, centerY); break;
      case "wooden": sticker = createStickerWoodenBoard(centerX, centerY); break;
      case "house": sticker = createSticker3DHouse(centerX, centerY); break;
      case "coin": sticker = createSticker3DGoldCoin(centerX, centerY); break;
      case "compass": sticker = createSticker3DCompass(centerX, centerY); break;
      case "neon_arrow": sticker = createStickerNeonArrow(centerX, centerY); break;
      case "classic_arrow": sticker = createStickerClassic3DArrow(centerX, centerY); break;
      case "for_sale": sticker = createStickerForSale(centerX, centerY); break;
      case "price": sticker = createStickerPriceBadge(centerX, centerY); break;
      case "sold": sticker = createStickerSoldStamp(centerX, centerY); break;
      case "measure": sticker = createStickerMeasureLabel(centerX, centerY); break;
      case "for_rent": sticker = createStickerForRent(centerX, centerY); break;
      case "green": sticker = createStickerGreenZone(centerX, centerY); break;
      case "zoning": sticker = createStickerZoning(centerX, centerY); break;
      case "deed": sticker = createStickerDeed(centerX, centerY); break;
    }

    if (sticker) {
      canvas.add(sticker);
      canvas.setActiveObject(sticker);
      canvas.requestRenderAll();
      getHistory()?.save();
    }
  };

  return {
    readSelected,
    handleLogoUpload,
    handleDrawSettingsUpdate,
    handleTextSettingsUpdate,
    handleLocationSettingsUpdate,
    handleText3dSettingsUpdate,
    addStickerToCanvas,
  };
}
