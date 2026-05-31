import type { Canvas, FabricObject } from "fabric";
import { v4 as uuidv4 } from "uuid";

import { downloadCanvasImage, downloadCanvasVideo, downloadCanvasPdf } from "@/features/export/utils/export-image";
import { getHistory } from "@/features/editor/utils/history";
import { syncParcelsFromCanvas } from "@/features/editor/utils/sync-parcels";
import type { ObjectData } from "@/shared/types";
import { useEditorStore, type CanvasLayerItem } from "@/features/editor/store/editorStore";

export function getEditorCanvas(): Canvas | null {
  return typeof window !== "undefined" ? window.__arsaCanvas ?? null : null;
}

export function setEditorCanvas(canvas: Canvas | null) {
  if (typeof window === "undefined") return;
  
  if (canvas) {
    window.__arsaCanvas = canvas;
  } else {
    delete window.__arsaCanvas;
  }
}

const LABEL_BY_TYPE: Record<string, string> = {
  parcel: "Parsel",
  shape: "Şekil",
  drawing: "Çizim",
  text: "Metin",
  text3d: "3D Metin",
  location: "Lokasyon",
  logo: "Logo",
  sticker: "Etiket",
};

export function syncLayersFromCanvas(canvas: Canvas) {
  const objects = canvas.getObjects();
  // Filter out helper/preview objects (no data.id)
  const layers: CanvasLayerItem[] = objects
    .filter((obj) => {
      const d = obj.get("data") as ObjectData | undefined;
      return d?.id != null;
    })
    .map((obj) => {
      const d = obj.get("data") as ObjectData;
      const typeLabel = LABEL_BY_TYPE[d.type ?? ""] ?? d.type ?? "Nesne";
      const label = (d as any).label ?? typeLabel;
      return {
        id: d.id,
        label,
        type: d.type ?? "shape",
        visible: obj.visible !== false,
        locked: obj.lockMovementX === true && obj.lockMovementY === true,
      };
    })
    .reverse(); // top layer first
  useEditorStore.getState().setCanvasLayers(layers);
}

export function saveHistory() {
  getHistory()?.save();

  const canvas = getEditorCanvas();
  if (!canvas) return;

  // Sync layer list
  syncLayersFromCanvas(canvas);

  // Autosave canvas state
  if (typeof window !== "undefined") {
    useEditorStore.getState().setAutosaveStatus("saving");
    try {
      const json = JSON.stringify(canvas.toObject(["data"]));
      localStorage.setItem("ilanx_canvas_data", json);
      localStorage.setItem("ilanx_active_session_timestamp", Date.now().toString());
      
      if ((window as any).__tabId) {
        localStorage.setItem("ilanx_active_tab_id", (window as any).__tabId);
      }
      
      setTimeout(() => {
        useEditorStore.getState().setAutosaveStatus("saved");
      }, 500);
    } catch (err) {
      console.warn("Failed to autosave canvas to localStorage:", err);
      useEditorStore.getState().setAutosaveStatus("idle");
    }
  }
}

export function exportEditorImage(filename?: string) {
  const canvas = getEditorCanvas();
  if (!canvas) return false;
  downloadCanvasImage(canvas, filename);

  setTimeout(() => {
    if (typeof window !== "undefined") {
      const share = window.confirm("✅ Tasarım başarıyla indirildi!\n\nBu tasarımı hemen müşterinize veya ofis grubunuza WhatsApp üzerinden göndermek ister misiniz?");
      if (share) {
        window.open("https://wa.me/?text=" + encodeURIComponent("Merhaba, hazırladığım yeni gayrimenkul portföyünü inceleyebilirsiniz."), "_blank");
      }
    }
  }, 1500);

  return true;
}

export function exportEditorPdf(filename?: string) {
  const canvas = getEditorCanvas();
  if (!canvas) return false;
  downloadCanvasPdf(canvas, filename);

  setTimeout(() => {
    if (typeof window !== "undefined") {
      const share = window.confirm("✅ PDF belgesi başarıyla indirildi!\n\nMüşterinize WhatsApp üzerinden göndermek ister misiniz?");
      if (share) {
        window.open("https://wa.me/?text=" + encodeURIComponent("Merhaba, hazırladığım gayrimenkul sunum dosyasını (PDF) ekte görebilirsiniz."), "_blank");
      }
    }
  }, 1500);

  return true;
}

export function exportProjectJson(filename?: string) {
  const canvas = getEditorCanvas();
  if (!canvas) return false;
  
  // toObject includes default properties. We need to explicitly include "data"
  const json = JSON.stringify(canvas.toObject(["data"]));
  
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `arsa-proje-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  return true;
}

export function loadProjectJson(file: File) {
  const canvas = getEditorCanvas();
  if (!canvas) return false;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const json = e.target?.result as string;
      // Pre-validate JSON syntax to recover from corrupted files safely
      JSON.parse(json);
      await canvas.loadFromJSON(json);
      
      // Rescale viewport if necessary and re-render
      canvas.requestRenderAll();
      syncParcelsFromCanvas(canvas);
      
      // Update background loaded state if it contains a background image
      if (canvas.backgroundImage) {
        useEditorStore.getState().setHasBackground(true);
      }
      
      saveHistory();
    } catch (err) {
      console.error("Proje yüklenirken hata:", err);
      alert("Proje yüklenemedi. Dosya bozuk olabilir.");
    }
  };
  reader.readAsText(file);
  return true;
}

export function deleteEditorSelection() {
  const canvas = getEditorCanvas();
  if (!canvas) return;

  const active = canvas.getActiveObjects();
  if (active.length === 0) return;

  const removeParcel = useEditorStore.getState().removeParcel;

  for (const obj of active) {
    const data = obj.get("data") as ObjectData | undefined;
    if (data?.type === "parcel" && data.id) {
      removeParcel(data.id);
    }
  }

  canvas.remove(...active);
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  saveHistory();
}

let _clipboard: FabricObject | null = null;

export function copyEditorSelection() {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    activeObject.clone(["data"]).then((cloned: any) => {
      _clipboard = cloned;
    });
  }
}

export function pasteEditorSelection() {
  const canvas = getEditorCanvas();
  if (!canvas || !_clipboard) return;

  _clipboard.clone(["data"]).then((clonedObj: any) => {
    canvas.discardActiveObject();
    
    clonedObj.set({
      left: (clonedObj.left ?? 0) + 20,
      top: (clonedObj.top ?? 0) + 20,
      evented: true,
    });
    
    if (clonedObj.type === 'activeSelection') {
      clonedObj.canvas = canvas;
      clonedObj.forEachObject(function(obj: FabricObject) {
        const data = obj.get('data') as ObjectData | undefined;
        if (data && typeof data === 'object') {
          const newData = { ...data, id: uuidv4() };
          if (newData.type === 'parcel') {
            const label = useEditorStore.getState().nextParcelLabel();
            newData.label = label;
            useEditorStore.getState().addParcel({ id: newData.id, label });
            useEditorStore.getState().incrementParcelCounter();
          }
          obj.set('data', newData);
        }
        canvas.add(obj);
      });
      clonedObj.setCoords();
    } else {
      const data = clonedObj.get('data') as ObjectData | undefined;
      if (data && typeof data === 'object') {
        const newData = { ...data, id: uuidv4() };
        clonedObj.set('data', newData);
        
        if (newData.type === 'parcel') {
          const label = useEditorStore.getState().nextParcelLabel();
          newData.label = label;
          useEditorStore.getState().addParcel({ id: newData.id, label });
          useEditorStore.getState().incrementParcelCounter();
        }
      }
      canvas.add(clonedObj);
    }
    
    _clipboard!.top = (clonedObj.top ?? 0);
    _clipboard!.left = (clonedObj.left ?? 0);
    
    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
    saveHistory();
  });
}

export function selectObjectById(id: string) {
  const canvas = getEditorCanvas();
  if (!canvas) return;

  const obj = canvas.getObjects().find((o) => {
    const data = o.get("data") as ObjectData | undefined;
    return data?.id === id;
  });

  if (obj) {
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    useEditorStore.getState().setTool("select");
  }
}

export function undoEditor() {
  void getHistory()?.undo();
}

export function redoEditor() {
  void getHistory()?.redo();
}

export function zoomCanvas(delta: number) {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  let zoom = canvas.getZoom();
  zoom = Math.min(Math.max(zoom + delta, 0.2), 8);
  canvas.setZoom(zoom);
  canvas.requestRenderAll();
}

export function resetCanvasZoom() {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setZoom(1);
  canvas.requestRenderAll();
}

export function fitCanvasToScreen() {
  const canvas = getEditorCanvas();
  if (!canvas || !canvas.backgroundImage) return;

  const img = canvas.backgroundImage;
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  const iw = (img.width ?? 1) * (img.scaleX ?? 1);
  const ih = (img.height ?? 1) * (img.scaleY ?? 1);
  const scale = Math.min((cw * 0.95) / iw, (ch * 0.95) / ih);

  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setZoom(scale);
  const vpt = canvas.viewportTransform;
  if (vpt) {
    vpt[4] = (cw - iw * scale) / 2;
    vpt[5] = (ch - ih * scale) / 2;
    canvas.setViewportTransform(vpt);
  }
  canvas.requestRenderAll();
}

export function clearCanvasAnnotations() {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  const keep = canvas.backgroundImage;
  canvas.clear();
  canvas.backgroundImage = keep;
  canvas.requestRenderAll();
  syncParcelsFromCanvas(canvas);
  useEditorStore.setState({ parcels: [], parcelCounter: 1 });
  saveHistory();
}

export function toggleLayerVisibility(id: string) {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  const obj = canvas.getObjects().find((o) => (o.get("data") as ObjectData | undefined)?.id === id);
  if (!obj) return;
  obj.visible = !obj.visible;
  canvas.requestRenderAll();
  syncLayersFromCanvas(canvas);
}

export function toggleLayerLock(id: string) {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  const obj = canvas.getObjects().find((o) => (o.get("data") as ObjectData | undefined)?.id === id);
  if (!obj) return;
  const isLocked = obj.lockMovementX === true && obj.lockMovementY === true;
  const newLocked = !isLocked;
  obj.set({
    lockMovementX: newLocked,
    lockMovementY: newLocked,
    lockRotation: newLocked,
    lockScalingX: newLocked,
    lockScalingY: newLocked,
    selectable: !newLocked,
    evented: !newLocked,
  });
  canvas.requestRenderAll();
  syncLayersFromCanvas(canvas);
}

export function deleteLayerById(id: string) {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  const obj = canvas.getObjects().find((o) => (o.get("data") as ObjectData | undefined)?.id === id);
  if (!obj) return;
  const data = obj.get("data") as ObjectData | undefined;
  if (data?.type === "parcel" && data.id) {
    useEditorStore.getState().removeParcel(data.id);
  }
  canvas.remove(obj);
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  saveHistory();
}

export function moveLayerOrder(id: string, direction: "up" | "down" | "top" | "bottom") {
  const canvas = getEditorCanvas();
  if (!canvas) return;
  const obj = canvas.getObjects().find((o) => (o.get("data") as ObjectData | undefined)?.id === id);
  if (!obj) return;

  switch (direction) {
    case "up":    canvas.bringObjectForward(obj); break;
    case "down":  canvas.sendObjectBackwards(obj); break;
    case "top":   canvas.bringObjectToFront(obj); break;
    case "bottom": canvas.sendObjectToBack(obj); break;
  }

  canvas.requestRenderAll();
  syncLayersFromCanvas(canvas);
  saveHistory();
}

export async function exportEditorVideo(durationMs?: number): Promise<boolean> {
  const canvas = getEditorCanvas();
  if (!canvas) return false;
  const store = useEditorStore.getState();
  const { quality, duration } = store.exportOptions;

  // Save current play/pause states and time
  const origPlaying = store.isAnimationPlaying;
  const origTime = store.animationTime;

  // Discard selection so the handles are not recorded
  const activeObject = canvas.getActiveObject();
  if (activeObject) {
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  }

  // Force animation to play from start (time = 0s)
  store.setAnimationPlaying(true);
  store.setAnimationTime(0);
  store.setRecordingVideo(true);

  try {
    await downloadCanvasVideo(canvas, durationMs ?? duration * 1000, quality);
  } finally {
    // Restore states and time
    store.setRecordingVideo(false);
    store.setAnimationPlaying(origPlaying);
    store.setAnimationTime(origTime);

    // Restore selection
    if (activeObject) {
      canvas.setActiveObject(activeObject);
      canvas.requestRenderAll();
    }
  }
  return true;
}
