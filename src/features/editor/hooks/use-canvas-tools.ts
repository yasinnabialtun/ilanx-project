"use client";

import {
  Canvas,
  Circle,
  Ellipse,
  FabricImage,
  IText,
  Line,
  PencilBrush,
  Point,
  Shadow,
  util,
  type FabricObject,
  type TPointerEventInfo,
} from "fabric";
import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

import {
  deleteEditorSelection,
  redoEditor,
  saveHistory,
  setEditorCanvas,
  undoEditor,
  copyEditorSelection,
  pasteEditorSelection,
  syncLayersFromCanvas,
} from "@/features/editor/utils/canvas-api";
import { createHistory, getHistory } from "@/features/editor/utils/history";
import {
  createArrow,
  createEllipse,
  createLineShape,
  createLocationMarker,
  createParcelPolygon,
  createParcelRect,
  createPlainText,
  createPolygonPreview,
  createPreviewRect,
  createVertexMarker,
  tagDrawingObject,
} from "@/features/editor/utils/shapes";
import { hexToRgba } from "@/features/editor/config/colors";
import { renderSaberGlow, removeSaberRenderer } from "@/features/animations/utils/energy-beam";
import { createText3D, updateText3D } from "@/features/animations/utils/text-3d";
import type { EditorTool, ObjectData } from "@/shared/types";
import { useEditorStore } from "@/features/editor/store/editorStore";
import { timelineRegistry } from "@/features/editor/utils/timeline-registry";
import { telemetry } from "@/core/utils/telemetry";

const CLOSE_DISTANCE = 14;

type DragState = {
  active: boolean;
  startX: number;
  startY: number;
  preview: FabricObject | null;
};

type PolygonState = {
  points: { x: number; y: number }[];
  previewLine: FabricObject | null;
  mouseLine: Line | null;
  markers: FabricObject[];
};

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getClientXY(e: TPointerEventInfo["e"]): { x: number; y: number } {
  if (e instanceof MouseEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  const t =
    (e as TouchEvent).touches?.[0] ?? (e as TouchEvent).changedTouches?.[0];
  return { x: t?.clientX ?? 0, y: t?.clientY ?? 0 };
}

const TOOL_HINTS: Partial<Record<EditorTool, { title: string; lines: string[] }>> = {
  polygon: {
    title: "Nokta ile parsel",
    lines: [
      "Her tıklama bir köşe noktası ekler",
      "İlk noktaya tıklayın veya Enter ile kapatın",
      "Esc: iptal · Backspace: son noktayı sil",
    ],
  },
  rect: {
    title: "Dikdörtgen parsel",
    lines: ["Sürükleyerek alan çizin"],
  },
  circle: {
    title: "Daire / elips",
    lines: ["Sürükleyerek şekil çizin"],
  },
  line: {
    title: "Çizgi",
    lines: ["Başlangıç ve bitiş noktasını sürükleyin"],
  },
  arrow: {
    title: "Ok",
    lines: ["Yön göstermek için sürükleyin"],
  },
  pencil: {
    title: "Serbest çizim",
    lines: ["Fare ile boyayın"],
  },
  text: {
    title: "Metin",
    lines: ["Tıklayın, yazın, Enter ile bitirin"],
  },
  text3d: {
    title: "3D metin",
    lines: ["Eklemek istediğiniz yere tıklayın"],
  },
  location: {
    title: "Lokasyon marker",
    lines: [
      "Haritaya tıklayın · marker ekler",
      "Pulsasyon efekti dikkat çeker",
    ],
  },
  pan: {
    title: "Kaydır",
    lines: ["Sürükleyerek görüntüyü taşıyın"],
  },
  select: {
    title: "Seçim",
    lines: ["Taşı, döndür, boyutlandır · Delete: sil"],
  },
};

export function useCanvasTools(
  canvasElRef: React.RefObject<HTMLCanvasElement | null>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  backgroundDataUrl: string | null,
  onCanvasReady?: (canvas: Canvas | null) => void,
) {
  const canvasRef = useRef<Canvas | null>(null);
  const dragRef = useRef<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    preview: null,
  });
  const polygonRef = useRef<PolygonState>({
    points: [],
    previewLine: null,
    mouseLine: null,
    markers: [],
  });
  const panRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const glowCursorRef = useRef<Circle | null>(null);
  const glowTrailRef = useRef<Circle[]>([]);
  const glowAnimRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function addGlowCursor(canvas: Canvas, x: number, y: number, color: string) {
    removeGlowCursor(canvas);
    const glow = new Circle({
      left: x, top: y,
      radius: 18,
      fill: hexToRgba(color, 0.08),
      stroke: hexToRgba(color, 0.55),
      strokeWidth: 1.5,
      originX: "center", originY: "center",
      selectable: false, evented: false, objectCaching: false,
    });
    glowCursorRef.current = glow;
    canvas.add(glow);
    canvas.requestRenderAll();
  }

  function removeGlowCursor(canvas: Canvas) {
    if (glowCursorRef.current) {
      canvas.remove(glowCursorRef.current);
      glowCursorRef.current = null;
      canvas.requestRenderAll();
    }
  }

  function addGlowTrailPoint(canvas: Canvas, x: number, y: number, color: string) {
    const r = 6 + Math.random() * 4;
    const glow = new Circle({
      left: x, top: y,
      radius: r,
      fill: hexToRgba(color, 0.25),
      stroke: hexToRgba(color, 0.6),
      strokeWidth: 1,
      originX: "center", originY: "center",
      selectable: false, evented: false, objectCaching: false,
      opacity: 1,
    });
    glowTrailRef.current.push(glow);
    canvas.add(glow);
    const startTime = Date.now();
    const fadeStep = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= 800) {
        canvas.remove(glow);
        glowTrailRef.current = glowTrailRef.current.filter(g => g !== glow);
        canvas.requestRenderAll();
        return;
      }
      const progress = elapsed / 800;
      glow.set({ opacity: 1 - progress, radius: r * (1 + progress * 0.8) });
      glow.set("dirty", true);
      canvas.requestRenderAll();
      requestAnimationFrame(fadeStep);
    };
    requestAnimationFrame(fadeStep);
  }

  function clearGlowTrail(canvas: Canvas) {
    for (const g of glowTrailRef.current) canvas.remove(g);
    glowTrailRef.current = [];
    canvas.requestRenderAll();
  }

  const activeTool = useEditorStore((s) => s.activeTool);
  const drawSettings = useEditorStore((s) => s.drawSettings);

  const clearPolygonPreview = (canvas: Canvas) => {
    const p = polygonRef.current;
    if (p.previewLine) canvas.remove(p.previewLine);
    if (p.mouseLine) canvas.remove(p.mouseLine);
    for (const m of p.markers) canvas.remove(m);
    p.points = [];
    p.previewLine = null;
    p.mouseLine = null;
    p.markers = [];
    useEditorStore.getState().setPolygonPointCount(0);
    canvas.requestRenderAll();
  };

  const updatePolygonPreview = (canvas: Canvas) => {
    const p = polygonRef.current;
    if (p.previewLine) canvas.remove(p.previewLine);
    if (p.points.length >= 2) {
      p.previewLine = createPolygonPreview(p.points, drawSettings);
      canvas.add(p.previewLine);
    } else {
      p.previewLine = null;
    }
    canvas.requestRenderAll();
  };

  const finishPolygon = (canvas: Canvas) => {
    const p = polygonRef.current;
    if (p.points.length < 3) return;

    const label = useEditorStore.getState().nextParcelLabel();
    const polygon = createParcelPolygon(p.points, drawSettings, label);
    const data = polygon.get("data") as ObjectData;

    clearPolygonPreview(canvas);
    clearGlowTrail(canvas);

    canvas.add(polygon);
    canvas.setActiveObject(polygon);
    useEditorStore.getState().addParcel({ id: data.id, label });
    useEditorStore.getState().incrementParcelCounter();
    saveHistory();
  };

  const addPolygonPoint = (canvas: Canvas, x: number, y: number) => {
    const p = polygonRef.current;

    if (p.points.length >= 3 && dist(p.points[0], { x, y }) < CLOSE_DISTANCE) {
      finishPolygon(canvas);
      return;
    }

    p.points.push({ x, y });
    const marker = createVertexMarker(
      x, y,
      drawSettings.strokeColor,
      p.points.length === 1,
    );
    p.markers.push(marker);
    canvas.add(marker);

    useEditorStore.getState().setPolygonPointCount(p.points.length);
    updatePolygonPreview(canvas);
  };

  // Canvas init
  useEffect(() => {
    if (!canvasElRef.current || !containerRef.current) return;

    const initW = Math.max(containerRef.current.clientWidth, 300);
    const initH = Math.max(containerRef.current.clientHeight, 200);

    const canvas = new Canvas(canvasElRef.current, {
      width: initW,
      height: initH,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    canvasRef.current = canvas;
    setEditorCanvas(canvas);

    const onAfterRender = () => {
      const isLicensed = useEditorStore.getState().isLicensed;
      const isDemoMode = useEditorStore.getState().isDemoMode;

      if (!isLicensed && isDemoMode) {
        const ctx = canvas.getContext();
        ctx.save();
        ctx.font = "bold 22px Montserrat, sans-serif";
        ctx.fillStyle = "rgba(244, 63, 94, 0.25)"; // rose-500 with low opacity
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const w = canvas.getWidth();
        const h = canvas.getHeight();
        const text = "İlanX Demo Modu";

        // Draw diagonal pattern
        for (let x = 120; x < w + 200; x += 280) {
          for (let y = 80; y < h + 200; y += 180) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 6); // -30 deg
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      }
    };
    canvas.on("after:render", onAfterRender);

    const historyManager = createHistory(canvas);
    useEditorStore.getState().setHistoryState(historyManager.getState());

    onCanvasReady?.(canvas);

    const fitImage = () => {
      if (!canvas.backgroundImage || typeof canvas.backgroundImage === "string") {
        return;
      }
      const img = canvas.backgroundImage;
      const w = canvas.getWidth();
      const h = canvas.getHeight();
      if (w < 10 || h < 10) return;
      const iw = (img.width ?? 1) * (img.scaleX ?? 1);
      const ih = (img.height ?? 1) * (img.scaleY ?? 1);
      if (iw < 1 || ih < 1) return;
      const scale = Math.min((w * 0.92) / iw, (h * 0.92) / ih);
      const tx = (w - iw * scale) / 2;
      const ty = (h - ih * scale) / 2;
      canvas.setViewportTransform([scale, 0, 0, scale, tx, ty] as import("fabric").TMat2D);
      canvas.requestRenderAll();
    };

    const resize = () => {
      if (useEditorStore.getState().isRecordingVideo) return;
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (w < 10 || h < 10) return;
      canvas.setDimensions({
        width: w,
        height: h,
      });
      fitImage();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);

    const onWheel = (opt: TPointerEventInfo<WheelEvent>) => {
      const e = opt.e;
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      e.stopPropagation();
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** e.deltaY;
      zoom = Math.min(Math.max(zoom, 0.2), 8);
      canvas.zoomToPoint(new Point(e.offsetX, e.offsetY), zoom);
    };

    const onPathCreated = (e: { path?: FabricObject }) => {
      if (e.path) {
        tagDrawingObject(e.path);
        saveHistory();
      }
    };

    let modifyTimer: ReturnType<typeof setTimeout> | null = null;
    const onModified = (opt: { target?: FabricObject }) => {
      const target = opt.target;
      if (target && target.get("data")?.type === "text3d") {
        const text3dSettings = target.get("data")?.text3dSettings;
        if (text3dSettings) {
          useEditorStore.getState().setText3dSettings(text3dSettings);
        }
      }
      if (modifyTimer) clearTimeout(modifyTimer);
      modifyTimer = setTimeout(() => saveHistory(), 300);
    };

    const clampObjectToBackground = (target: FabricObject) => {
      const bg = canvas.backgroundImage;
      if (!bg || typeof bg === "string") return;

      const iw = bg.width ?? 0;
      const ih = bg.height ?? 0;

      target.setCoords();
      let rect = target.getBoundingRect();

      let scaled = false;
      if (rect.width > iw) {
        const factor = iw / rect.width;
        target.set({
          scaleX: (target.scaleX ?? 1) * factor * 0.99,
        });
        scaled = true;
      }
      if (rect.height > ih) {
        const factor = ih / rect.height;
        target.set({
          scaleY: (target.scaleY ?? 1) * factor * 0.99,
        });
        scaled = true;
      }

      if (scaled) {
        target.setCoords();
        rect = target.getBoundingRect();
      }

      let dx = 0;
      if (rect.left < 0) {
        dx = -rect.left;
      } else if (rect.left + rect.width > iw) {
        dx = iw - (rect.left + rect.width);
      }

      let dy = 0;
      if (rect.top < 0) {
        dy = -rect.top;
      } else if (rect.top + rect.height > ih) {
        dy = ih - (rect.top + rect.height);
      }

      if (dx !== 0 || dy !== 0) {
        target.set({
          left: (target.left ?? 0) + dx,
          top: (target.top ?? 0) + dy,
        });
        target.setCoords();
      }
    };

    const onMoving = (opt: { target?: FabricObject }) => {
      if (opt.target) {
        clampObjectToBackground(opt.target);
      }
    };

    const onScaling = (opt: { target?: FabricObject }) => {
      if (opt.target) {
        clampObjectToBackground(opt.target);
      }
    };

    const onRotating = (opt: { target?: FabricObject }) => {
      if (opt.target) {
        clampObjectToBackground(opt.target);
      }
    };

    const onSelectionChanged = () => {
      const active = canvas.getActiveObject();
      if (active) {
        const data = active.get?.("data") as { type?: string; id?: string } | null;
        if (data?.id) {
          useEditorStore.getState().setSelectedObjectId(data.id);
          useEditorStore.getState().setSelectedObjectType(data.type ?? null);
        } else {
          useEditorStore.getState().setSelectedObjectId(null);
          useEditorStore.getState().setSelectedObjectType(null);
        }
      } else {
        useEditorStore.getState().setSelectedObjectId(null);
        useEditorStore.getState().setSelectedObjectType(null);
      }
    };

    const onDblClick = async (opt: { target?: FabricObject }) => {
      const isLicensed = useEditorStore.getState().isLicensed;
      if (!isLicensed) return;

      const target = opt.target;
      if (!target) return;
      const data = target.get?.("data") as { type?: string; label?: string; id?: string; text3dSettings?: any } | null;

      if (data?.type === "text" && target instanceof IText) {
        target.enterEditing();
        target.selectAll();
        canvas.setActiveObject(target);
        saveHistory();
        return;
      }
      if (data?.type === "text3d" && target instanceof FabricImage) {
        const image3D = target;
        const settings = data.text3dSettings || {};
        
        const tempText = new IText(settings.content || "Arsa", {
          left: image3D.left,
          top: image3D.top,
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          fill: settings.color,
          scaleX: image3D.scaleX,
          scaleY: image3D.scaleY,
          angle: image3D.angle,
          skewX: image3D.skewX,
          skewY: image3D.skewY,
          originX: "center",
          originY: "center",
          objectCaching: false,
        });

        image3D.visible = false;
        canvas.add(tempText);
        canvas.setActiveObject(tempText);
        
        tempText.enterEditing();
        tempText.selectAll();

        tempText.on("editing:exited", () => {
          const newContent = tempText.text || "";
          const updatedSettings = {
            ...settings,
            content: newContent,
          };

          useEditorStore.getState().setText3dSettings(updatedSettings);

          image3D.set({
            left: tempText.left,
            top: tempText.top,
            scaleX: tempText.scaleX,
            scaleY: tempText.scaleY,
            angle: tempText.angle,
            skewX: tempText.skewX,
            skewY: tempText.skewY,
          });
          
          updateText3D(image3D, updatedSettings);
          
          image3D.visible = true;
          canvas.remove(tempText);
          canvas.setActiveObject(image3D);
          canvas.requestRenderAll();
          saveHistory();
        });
        return;
      }
      if (data?.type === "location") {
        const currentLabel = data.label ?? "Lokasyon";
        const newLabel = window.prompt("Lokasyon etiketi:", currentLabel);
        if (newLabel !== null && newLabel.trim() !== "") {
          target.set?.({ label: newLabel });
          saveHistory();
        }
        return;
      }

      if (data?.type === "sticker" && target.type === "group") {
        const group = target as import("fabric").Group;
        const iTextChild = group.getObjects().find(o => o.type === "i-text") as import("fabric").IText | undefined;
        if (iTextChild) {
          const origLeft = group.left;
          const origTop = group.top;
          const origScaleX = group.scaleX;
          const origScaleY = group.scaleY;
          const origAngle = group.angle;

          const matrix = group.calcTransformMatrix();
          const localPt = { x: iTextChild.left ?? 0, y: iTextChild.top ?? 0 };
          const canvasPt = util.transformPoint(
            new Point(localPt.x, localPt.y),
            matrix
          );

          group.visible = false;

          const editProxy = new IText(iTextChild.text || "", {
            left: canvasPt.x,
            top: canvasPt.y,
            fontSize: (iTextChild.fontSize ?? 16) * (origScaleX ?? 1),
            fontFamily: iTextChild.fontFamily ?? "Montserrat, sans-serif",
            fontWeight: iTextChild.fontWeight ?? "bold",
            fill: iTextChild.fill as string,
            originX: "center",
            originY: "center",
            textAlign: "center",
            angle: origAngle,
          });

          canvas.add(editProxy);
          canvas.setActiveObject(editProxy);
          editProxy.enterEditing();
          editProxy.selectAll();

          editProxy.on("editing:exited", () => {
            const newText = editProxy.text || "";
            iTextChild.set({ text: newText });
            group.set({
              left: origLeft,
              top: origTop,
              scaleX: origScaleX,
              scaleY: origScaleY,
              angle: origAngle,
              dirty: true,
            });
            (group as any)._calcBounds?.(true);
            group.setCoords();
            group.visible = true;
            canvas.remove(editProxy);
            canvas.setActiveObject(group);
            canvas.requestRenderAll();
            saveHistory();
          });
        }
        return;
      }

      if (
        data?.type === "drawing" &&
        (data.label === "Cam Pano" || data.label === "Neon Pano" || data.label === "Ahşap Pano") &&
        target.type === "group"
      ) {
        const group = target as import("fabric").Group;
        const textChild = group.getObjects().find(o => o.type === "text" || o.type === "i-text") as import("fabric").Text | undefined;
        if (textChild) {
          const currentText = textChild.text === " " ? "" : (textChild.text || "");
          const newText = window.prompt("Pano metnini girin:", currentText);
          if (newText !== null) {
            const formatted = newText.trim() === "" ? " " : newText;
            textChild.set({ text: formatted });
            const bgObj = group.getObjects()[0];
            if (bgObj && bgObj.width && bgObj.height) {
              textChild.set({
                left: (bgObj.left ?? 0) + bgObj.width / 2,
                top: (bgObj.top ?? 0) + bgObj.height / 2,
              });
            }
            group.set("dirty", true);
            (group as any)._calcBounds?.(true);
            group.setCoords();
            canvas.requestRenderAll();
            saveHistory();
          }
        }
        return;
      }
    };

    const upperCanvas = canvas.upperCanvasEl;
    let startDist = 0;
    let startZoom = 1;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        startDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        startZoom = canvas.getZoom();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && startDist > 0 && upperCanvas) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const zoom = Math.min(Math.max((dist / startDist) * startZoom, 0.2), 8);
        
        const rect = upperCanvas.getBoundingClientRect();
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        
        canvas.zoomToPoint(new Point(centerX, centerY), zoom);
        canvas.requestRenderAll();
      }
    };

    const onTouchEnd = () => {
      startDist = 0;
    };

    if (upperCanvas) {
      upperCanvas.addEventListener("touchstart", onTouchStart, { passive: false });
      upperCanvas.addEventListener("touchmove", onTouchMove, { passive: false });
      upperCanvas.addEventListener("touchend", onTouchEnd);
      upperCanvas.addEventListener("touchcancel", onTouchEnd);
    }

    canvas.on("mouse:wheel", onWheel);
    canvas.on("path:created", onPathCreated);
    canvas.on("object:modified", onModified);
    canvas.on("selection:created", onSelectionChanged);
    canvas.on("selection:updated", onSelectionChanged);
    canvas.on("selection:cleared", onSelectionChanged);
    canvas.on("mouse:dblclick", onDblClick);
    canvas.on("object:moving", onMoving);
    canvas.on("object:scaling", onScaling);
    canvas.on("object:rotating", onRotating);

    const onLayerSync = () => syncLayersFromCanvas(canvas);
    canvas.on("object:added", onLayerSync);
    canvas.on("object:removed", onLayerSync);

    return () => {
      canvas.off("after:render", onAfterRender);
      ro.disconnect();
      if (modifyTimer) clearTimeout(modifyTimer);
      if (glowAnimRef.current) clearTimeout(glowAnimRef.current);
      clearGlowTrail(canvas);
      removeGlowCursor(canvas);
      
      if (upperCanvas) {
        upperCanvas.removeEventListener("touchstart", onTouchStart);
        upperCanvas.removeEventListener("touchmove", onTouchMove);
        upperCanvas.removeEventListener("touchend", onTouchEnd);
        upperCanvas.removeEventListener("touchcancel", onTouchEnd);
      }

      canvas.off("mouse:wheel", onWheel);
      canvas.off("path:created", onPathCreated);
      canvas.off("object:modified", onModified);
      canvas.off("selection:created", onSelectionChanged);
      canvas.off("selection:updated", onSelectionChanged);
      canvas.off("selection:cleared", onSelectionChanged);
      canvas.off("mouse:dblclick", onDblClick);
      canvas.off("object:moving", onMoving);
      canvas.off("object:scaling", onScaling);
      canvas.off("object:rotating", onRotating);
      canvas.off("object:added", onLayerSync);
      canvas.off("object:removed", onLayerSync);
      onCanvasReady?.(null);
      canvas.dispose();
      canvasRef.current = null;
      setEditorCanvas(null);
    };
  }, [canvasElRef, canvasRef, containerRef, onCanvasReady]);

  // Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundDataUrl) return;

    let active = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    void (async () => {
      const { FabricImage, Rect } = await import("fabric");
      const img = await FabricImage.fromURL(backgroundDataUrl, {
        crossOrigin: "anonymous",
      });

      if (!active) return;

      canvas.clear();
      canvas.backgroundColor = "#18181b";
      clearPolygonPreview(canvas);

      img.set({
        scaleX: 1,
        scaleY: 1,
        left: 0,
        top: 0,
        originX: "left",
        originY: "top",
        selectable: false,
        evented: false,
      });

      canvas.backgroundImage = img;

      const clipRect = new Rect({
        left: 0,
        top: 0,
        width: img.width ?? 0,
        height: img.height ?? 0,
        originX: "left",
        originY: "top",
        absolutePositioned: true,
      });
      canvas.clipPath = clipRect;

      const fitViewport = () => {
        if (!active) return;
        const currentCanvas = canvasRef.current;
        if (!currentCanvas || !containerRef.current) return;
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        if (cw < 10 || ch < 10) return;

        currentCanvas.setDimensions({ width: cw, height: ch });

        const iw = img.width ?? 1;
        const ih = img.height ?? 1;
        if (iw < 1 || ih < 1) return;

        const scale = Math.min((cw * 0.92) / iw, (ch * 0.92) / ih);
        const tx = (cw - iw * scale) / 2;
        const ty = (ch - ih * scale) / 2;
        currentCanvas.setViewportTransform([scale, 0, 0, scale, tx, ty] as import("fabric").TMat2D);
        currentCanvas.requestRenderAll();
      };

      fitViewport();
      timers.push(setTimeout(fitViewport, 50));
      timers.push(setTimeout(fitViewport, 200));
      timers.push(setTimeout(fitViewport, 500));
      timers.push(setTimeout(fitViewport, 1000));

      useEditorStore.setState({
        parcels: [],
        parcelCounter: 1,
        polygonPointCount: 0,
      });
      useEditorStore.getState().setHasBackground(true);
      getHistory()?.reset();

      if (typeof window !== "undefined") {
        localStorage.setItem("ilanx_bg_data", backgroundDataUrl);

        if ((window as any).__shouldRecoverCanvas) {
          const savedCanvas = localStorage.getItem("ilanx_canvas_data");
          if (savedCanvas) {
            try {
              const { syncParcelsFromCanvas } = await import("@/features/editor/utils/sync-parcels");
              await canvas.loadFromJSON(savedCanvas);
              canvas.requestRenderAll();
              syncParcelsFromCanvas(canvas);
            } catch (err) {
              console.error("Autosave canvas recovery failed:", err);
            }
          }
          (window as any).__shouldRecoverCanvas = false;
        }
      }
    })();

    return () => {
      active = false;
      timers.forEach(clearTimeout);
    };
  }, [backgroundDataUrl, canvasRef, containerRef]);

  // Tool mode
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    clearPolygonPreview(canvas);
    dragRef.current = { active: false, startX: 0, startY: 0, preview: null };

    const isLicensed = useEditorStore.getState().isLicensed;
    const isSelect = (activeTool === "select" || activeTool === "logo") && isLicensed;
    const isPan = activeTool === "pan";
    const isPencil = activeTool === "pencil" && isLicensed;

    canvas.selection = isSelect;
    canvas.isDrawingMode = isPencil;
    canvas.defaultCursor = isPan
      ? "grab"
      : activeTool === "polygon" || activeTool === "rect"
        ? "crosshair"
        : activeTool === "text" || activeTool === "text3d"
          ? "text"
          : "default";
    canvas.hoverCursor = isPan ? "grab" : canvas.defaultCursor;

    if (isPencil) {
      const brush = new PencilBrush(canvas);
      brush.color = drawSettings.strokeColor;
      brush.width = drawSettings.strokeWidth;
      canvas.freeDrawingBrush = brush;
    }

    useEditorStore.getState().setToolHint(TOOL_HINTS[activeTool] ?? null);
  }, [activeTool, canvasRef, drawSettings.strokeColor, drawSettings.strokeWidth]);

  // Mouse handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (opt: TPointerEventInfo) => {
      const nativeEvent = opt.e;
      if (nativeEvent && (nativeEvent as TouchEvent).touches && (nativeEvent as TouchEvent).touches.length > 1) {
        return;
      }

      const isLicensed = useEditorStore.getState().isLicensed;
      const tool = useEditorStore.getState().activeTool;

      if (!isLicensed && tool !== "pan") {
        return; // Block drawing & object creation in demo mode
      }

      const pointer = canvas.getScenePoint(opt.e);

      const bg = canvas.backgroundImage;
      if (bg && typeof bg !== "string") {
        const iw = bg.width ?? 0;
        const ih = bg.height ?? 0;
        pointer.x = Math.max(0, Math.min(pointer.x, iw));
        pointer.y = Math.max(0, Math.min(pointer.y, ih));
      }

      if (tool === "pan") {
        const { x, y } = getClientXY(opt.e);
        panRef.current = { active: true, lastX: x, lastY: y };
        canvas.defaultCursor = "grabbing";
        return;
      }

      if (opt.target && tool !== "polygon") return;

      if (tool === "polygon") {
        addPolygonPoint(canvas, pointer.x, pointer.y);
        return;
      }

      if (tool === "rect" || tool === "circle" || tool === "line" || tool === "arrow") {
        dragRef.current = {
          active: true,
          startX: pointer.x,
          startY: pointer.y,
          preview: null,
        };
        if (tool === "rect") {
          const preview = createPreviewRect(
            pointer.x,
            pointer.y,
            0,
            0,
            drawSettings,
          );
          dragRef.current.preview = preview;
          canvas.add(preview);
        } else if (tool === "circle") {
          const preview = new Ellipse({
            left: pointer.x,
            top: pointer.y,
            rx: 0,
            ry: 0,
            fill: hexToRgba(drawSettings.fillColor, drawSettings.fillOpacity),
            stroke: drawSettings.strokeColor,
            strokeWidth: drawSettings.strokeWidth,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
            objectCaching: false,
          });
          dragRef.current.preview = preview;
          canvas.add(preview);
        } else if (tool === "line") {
          const preview = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: drawSettings.strokeColor,
            strokeWidth: drawSettings.strokeWidth,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
            objectCaching: false,
          });
          dragRef.current.preview = preview;
          canvas.add(preview);
        } else if (tool === "arrow") {
          const preview = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: drawSettings.strokeColor,
            strokeWidth: drawSettings.strokeWidth,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
            objectCaching: false,
          });
          dragRef.current.preview = preview;
          canvas.add(preview);
        }
        return;
      }

      if (tool === "text" && !opt.target) {
        const t = useEditorStore.getState().textSettings;
        const text = createPlainText(
          t.content,
          pointer.x,
          pointer.y,
          t.fontSize,
          t.color,
          t.fontFamily,
          t.textBackgroundColor
        );
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        saveHistory();
        return;
      }

      if (tool === "text3d" && !opt.target) {
        const t = useEditorStore.getState().text3dSettings;
        const img = createText3D(
          t,
          { left: pointer.x, top: pointer.y },
          uuidv4(),
        );
        canvas.add(img);
        canvas.setActiveObject(img);
        saveHistory();
        return;
      }

      if (tool === "location" && !opt.target) {
        const ls = useEditorStore.getState().locationSettings;
        const marker = createLocationMarker(pointer.x, pointer.y, ls);
        canvas.add(marker);
        canvas.setActiveObject(marker);
        saveHistory();
        return;
      }
    };

    const onMouseMove = (opt: TPointerEventInfo) => {
      const nativeEvent = opt.e;
      if (nativeEvent && (nativeEvent as TouchEvent).touches && (nativeEvent as TouchEvent).touches.length > 1) {
        return;
      }

      const tool = useEditorStore.getState().activeTool;
      const pointer = canvas.getScenePoint(opt.e);

      const bg = canvas.backgroundImage;
      if (bg && typeof bg !== "string") {
        const iw = bg.width ?? 0;
        const ih = bg.height ?? 0;
        pointer.x = Math.max(0, Math.min(pointer.x, iw));
        pointer.y = Math.max(0, Math.min(pointer.y, ih));
      }

      removeGlowCursor(canvas);

      if (tool === "pan" && panRef.current.active) {
        const { x, y } = getClientXY(opt.e);
        const dx = x - panRef.current.lastX;
        const dy = y - panRef.current.lastY;
        panRef.current.lastX = x;
        panRef.current.lastY = y;
        canvas.relativePan(new Point(dx, dy));
        return;
      }

      const d = dragRef.current;
      if (d.active && d.preview) {
        const left = Math.min(d.startX, pointer.x);
        const top = Math.min(d.startY, pointer.y);
        const width = Math.abs(pointer.x - d.startX);
        const height = Math.abs(pointer.y - d.startY);

        if (tool === "rect") {
          d.preview.set({ left, top, width, height });
        } else if (tool === "circle") {
          d.preview.set({
            left: left + width / 2,
            top: top + height / 2,
            rx: width / 2,
            ry: height / 2,
            originX: "center",
            originY: "center",
          });
        } else if (tool === "line" || tool === "arrow") {
          (d.preview as Line).set({ x2: pointer.x, y2: pointer.y });
        }
        canvas.requestRenderAll();
      }

      if (tool === "polygon" && polygonRef.current.points.length > 0) {
        const p = polygonRef.current;
        const lastPoint = p.points[p.points.length - 1];
        if (p.mouseLine) {
          p.mouseLine.set({ x1: lastPoint.x, y1: lastPoint.y, x2: pointer.x, y2: pointer.y });
        } else {
          p.mouseLine = new Line([lastPoint.x, lastPoint.y, pointer.x, pointer.y], {
            stroke: drawSettings.strokeColor,
            strokeWidth: drawSettings.strokeWidth,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
            objectCaching: false,
          });
          canvas.add(p.mouseLine);
        }
        canvas.requestRenderAll();
      }
    };

    const onMouseUp = (opt: TPointerEventInfo) => {
      const nativeEvent = opt.e;
      if (nativeEvent && (nativeEvent as TouchEvent).touches && (nativeEvent as TouchEvent).touches.length > 1) {
        return;
      }

      const tool = useEditorStore.getState().activeTool;

      if (tool === "pan" && panRef.current.active) {
        panRef.current.active = false;
        canvas.defaultCursor = "grab";
        return;
      }

      const d = dragRef.current;
      if (!d.active) return;

      const pointer = canvas.getScenePoint(opt.e);
      const bg = canvas.backgroundImage;
      if (bg && typeof bg !== "string") {
        const iw = bg.width ?? 0;
        const ih = bg.height ?? 0;
        pointer.x = Math.max(0, Math.min(pointer.x, iw));
        pointer.y = Math.max(0, Math.min(pointer.y, ih));
      }

      const left = Math.min(d.startX, pointer.x);
      const top = Math.min(d.startY, pointer.y);
      const width = Math.abs(pointer.x - d.startX);
      const height = Math.abs(pointer.y - d.startY);

      if (d.preview) {
        canvas.remove(d.preview);
        d.preview = null;
      }
      d.active = false;

      if (width < 6 && height < 6) return;

      if (tool === "rect") {
        const label = useEditorStore.getState().nextParcelLabel();
        const rect = createParcelRect(
          left,
          top,
          width,
          height,
          drawSettings,
          label,
        );
        const data = rect.get("data") as ObjectData;
        canvas.add(rect);
        canvas.setActiveObject(rect);
        useEditorStore.getState().addParcel({ id: data.id, label });
        useEditorStore.getState().incrementParcelCounter();
        saveHistory();
      } else if (tool === "circle") {
        const ellipse = createEllipse(
          left,
          top,
          width / 2,
          height / 2,
          drawSettings,
        );
        canvas.add(ellipse);
        canvas.setActiveObject(ellipse);
        saveHistory();
      } else if (tool === "line") {
        const line = createLineShape(
          d.startX,
          d.startY,
          pointer.x,
          pointer.y,
          drawSettings,
        );
        canvas.add(line);
        canvas.setActiveObject(line);
        saveHistory();
      } else if (tool === "arrow") {
        const arrow = createArrow(
          d.startX,
          d.startY,
          pointer.x,
          pointer.y,
          drawSettings,
        );
        canvas.add(arrow);
        canvas.setActiveObject(arrow);
        saveHistory();
      }
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);

    return () => {
      canvas.off("mouse:down", onMouseDown);
      canvas.off("mouse:move", onMouseMove);
      canvas.off("mouse:up", onMouseUp);
    };
  }, [canvasRef, drawSettings]);

  // Keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const isMac = navigator.userAgent.toLowerCase().includes("mac");
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;
      const isLicensed = useEditorStore.getState().isLicensed;

      if (!isLicensed) {
        // Block all editor keyboard commands in Demo mode
        if (
          e.key === "Delete" ||
          e.key === "Backspace" ||
          e.key === "Escape" ||
          e.key === "Enter" ||
          (cmdKey && e.key.toLowerCase() === "z") ||
          (cmdKey && e.key.toLowerCase() === "y") ||
          (cmdKey && e.key.toLowerCase() === "c") ||
          (cmdKey && e.key.toLowerCase() === "v")
        ) {
          e.preventDefault();
          return;
        }
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const tool = useEditorStore.getState().activeTool;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (tool === "polygon" && polygonRef.current.points.length > 0) {
          e.preventDefault();
          const p = polygonRef.current;
          const last = p.markers.pop();
          if (last) canvas.remove(last);
          p.points.pop();
          useEditorStore.getState().setPolygonPointCount(p.points.length);
          updatePolygonPreview(canvas);
          return;
        }
        if (tool !== "polygon") {
          e.preventDefault();
          deleteEditorSelection();
          return;
        }
      }

      if (e.key === "Escape") {
        if (tool === "polygon" && polygonRef.current.points.length > 0) {
          e.preventDefault();
          clearPolygonPreview(canvas);
          return;
        }
      }

      if (cmdKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        import("@/features/editor/utils/canvas-api").then(({ copyEditorSelection }) => {
          copyEditorSelection();
        });
        return;
      }

      if (cmdKey && e.key.toLowerCase() === "v") {
        e.preventDefault();
        import("@/features/editor/utils/canvas-api").then(({ pasteEditorSelection }) => {
          pasteEditorSelection();
        });
        return;
      }

      if (e.key === "Enter" && tool === "polygon") {
        e.preventDefault();
        finishPolygon(canvas);
        return;
      }

      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undoEditor();
      }
      if (e.ctrlKey && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault();
        redoEditor();
      }
      if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        copyEditorSelection();
      }
      if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        pasteEditorSelection();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canvasRef]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const style = useEditorStore.getState().artistStyle;
    let rafId = 0;

    const applySelectionEffect = (obj: FabricObject, elapsed: number) => {
      if (!obj) return;
      const selStyle = style.selectionEffect;
      if (selStyle === "none") return;

      const intensity = style.effectIntensity / 10;
      const speed = 0.003 * (11 - style.effectSpeed);
      const t = elapsed * speed;

      if (selStyle === "pulse") {
        const origWidth = obj.get("strokeWidth") ?? 2;
        obj.set({
          strokeWidth: origWidth + 2 * intensity * Math.sin(t * 3.14159),
          stroke: hexToRgba(style.glowColor, 0.5 + 0.5 * Math.sin(t * 3.14159)),
        });
        obj.set("dirty", true);
      } else if (selStyle === "neon-scan") {
        const colors = [style.glowColor, "#ffffff", "#22d3ee", style.glowColor];
        const idx = Math.floor((t * 2) % colors.length);
        obj.set({
          stroke: colors[idx],
          strokeWidth: (obj.get("strokeWidth") ?? 2) + 1.5 * Math.sin(t * 2),
        });
        obj.set("dirty", true);
      } else if (selStyle === "border-spin") {
        const dashOffset = (elapsed * 0.1 * style.effectSpeed) % 20;
        obj.set({
          strokeDashArray: [4 + 2 * Math.abs(Math.sin(t)), 4],
          strokeDashOffset: dashOffset,
          stroke: hexToRgba(style.glowColor, 0.7 + 0.3 * Math.sin(t)),
        });
        obj.set("dirty", true);
      } else if (selStyle === "pen-draw") {
        const perimeter = ((obj.width ?? 100) + (obj.height ?? 100)) * 2;
        const cycleTime = 4000 / Math.max(1, style.effectSpeed);
        const progress = (elapsed % cycleTime) / cycleTime;
        const dashOffset = perimeter * (1 - progress);
        
        obj.set({
          strokeDashArray: [perimeter, perimeter],
          strokeDashOffset: dashOffset,
          stroke: style.glowColor,
        });
        obj.set("dirty", true);
      }
    };

    const resetSelectionEffect = (obj: FabricObject) => {
      if (!obj) return;
      const data = obj.get?.("data") as { type?: string } | null;
      if (data?.type === "parcel" || data?.type === "shape" || data?.type === "drawing") {
         const ds = useEditorStore.getState().drawSettings;
         obj.set({
           strokeDashArray: null as unknown as number[],
           strokeDashOffset: 0,
           stroke: ds.strokeColor,
           strokeWidth: ds.strokeWidth,
          });
          obj.set("dirty", true);
      }
    };

    let lastTime = Date.now();
    const initialStoreState = useEditorStore.getState();
    let totalElapsed = initialStoreState.animationTime;
    let lastStoreTime = totalElapsed;

    let lastGlowColor = initialStoreState.artistStyle.glowColor;
    let lastTextEffect = initialStoreState.artistStyle.textEffect;
    let lastSelectionEffect = initialStoreState.artistStyle.selectionEffect;
    let lastGlowEffect = initialStoreState.drawSettings.glowEffect;
    let lastGlowIntensity = initialStoreState.drawSettings.glowIntensity;
    let lastGlowRadius = initialStoreState.drawSettings.glowRadius;
    let lastStrokeColor = initialStoreState.drawSettings.strokeColor;

    const animate = () => {
      telemetry.registerFrame();
      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      const storeState = useEditorStore.getState();
      const isPlaying = storeState.isAnimationPlaying;
      const durationLimit = (storeState.exportOptions.duration || 5) * 1000;

      let hasTimelineMoved = false;
      if (storeState.animationTime !== lastStoreTime) {
        totalElapsed = storeState.animationTime;
        lastStoreTime = storeState.animationTime;
        hasTimelineMoved = true;
      }

      const isScrubbing = !isPlaying && hasTimelineMoved;

      const currentStyle = storeState.artistStyle;
      const currentDrawSettings = storeState.drawSettings;
      const settingsChanged = 
        currentStyle.glowColor !== lastGlowColor ||
        currentStyle.textEffect !== lastTextEffect ||
        currentStyle.selectionEffect !== lastSelectionEffect ||
        currentDrawSettings.glowEffect !== lastGlowEffect ||
        currentDrawSettings.glowIntensity !== lastGlowIntensity ||
        currentDrawSettings.glowRadius !== lastGlowRadius ||
        currentDrawSettings.strokeColor !== lastStrokeColor;

      if (settingsChanged) {
        lastGlowColor = currentStyle.glowColor;
        lastTextEffect = currentStyle.textEffect;
        lastSelectionEffect = currentStyle.selectionEffect;
        lastGlowEffect = currentDrawSettings.glowEffect;
        lastGlowIntensity = currentDrawSettings.glowIntensity;
        lastGlowRadius = currentDrawSettings.glowRadius;
        lastStrokeColor = currentDrawSettings.strokeColor;
      }

      if (!isPlaying && !isScrubbing && !settingsChanged) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      if (isPlaying) {
        if (storeState.isRecordingVideo) {
          totalElapsed += 1000 / 30;
        } else {
          totalElapsed += delta;
        }

        if (totalElapsed > durationLimit) {
          totalElapsed = totalElapsed % durationLimit;
        }
        const slider = timelineRegistry.slider;
        if (slider) {
          slider.value = totalElapsed.toString();
          const progress = (totalElapsed / durationLimit) * 100;
          slider.style.background = `linear-gradient(to right, #06b6d4 0%, #a855f7 ${progress}%, #3f3f46 ${progress}%, #3f3f46 100%)`;
        }
        const display = timelineRegistry.display;
        if (display) {
          display.textContent = `${(totalElapsed / 1000).toFixed(1)}s`;
        }
      } else if (isScrubbing) {
        totalElapsed = storeState.animationTime;
        const slider = timelineRegistry.slider;
        if (slider) {
          slider.value = totalElapsed.toString();
          const progress = (totalElapsed / durationLimit) * 100;
          slider.style.background = `linear-gradient(to right, #06b6d4 0%, #a855f7 ${progress}%, #3f3f46 ${progress}%, #3f3f46 100%)`;
        }
        const display = timelineRegistry.display;
        if (display) {
          display.textContent = `${(totalElapsed / 1000).toFixed(1)}s`;
        }
      }

      const elapsed = totalElapsed;
      const style = storeState.artistStyle;

      canvas.getObjects().forEach((obj) => {
        const data = obj.get?.("data") as { type?: string; _origText?: string } | null;

        if (data?.type === "text" && obj instanceof IText) {
          const effect = style.textEffect;
          if (effect === "none") return;

          const fullText = (obj as { _origText?: string })._origText ?? obj.text ?? "";
          if (!(obj as { _origText?: string })._origText) {
            (obj as unknown as { _origText: string })._origText = fullText;
          }
          const speed = 0.05 * style.effectSpeed;
          const intensity = style.effectIntensity / 10;

          if (effect === "typewriter") {
            const progress = (Math.sin(elapsed * speed) + 1) / 2;
            const showLen = Math.ceil(fullText.length * progress);
            obj.set({ text: fullText.slice(0, showLen) });
            if (progress > 0.98) (obj as unknown as { _typewriterDone?: boolean })._typewriterDone = true;

          } else if (effect === "neon-pulse") {
            const pulse = 1 + intensity * Math.sin(elapsed * speed * 2);
            obj.set({
              fontSize: (obj as unknown as { _origFontSize?: number })._origFontSize ?? obj.fontSize ?? 28,
              fill: hexToRgba(style.glowColor, 0.7 + 0.3 * Math.sin(elapsed * speed)),
            });
            const origFs = (obj as unknown as { _origFontSize?: number })._origFontSize;
            if (origFs) obj.set({ fontSize: origFs * pulse });
            obj.set("dirty", true);

          } else if (effect === "glow-flicker") {
            const flicker = intensity * Math.random() * 0.4;
            obj.set({
              opacity: 1 - flicker,
              fill: hexToRgba(style.glowColor, 0.7 + 0.3 * Math.sin(elapsed * speed * 3)),
            });
            obj.set("dirty", true);

          } else if (effect === "wave") {
            const baseTop = obj.top ?? 0;
            const waveAmp = intensity * 4;
            const waveSpeed = speed * 1.5;
            obj.set({
              top: baseTop + Math.sin(elapsed * waveSpeed) * waveAmp,
            });
            obj.set("dirty", true);
          }
        }
      });

      const active = canvas.getActiveObject();
      if (active) {
        if (style.selectionEffect !== "none") {
          applySelectionEffect(active, elapsed);
        } else {
          resetSelectionEffect(active);
        }
      }

      const drawSettings = storeState.drawSettings;
      canvas.getObjects().forEach((obj) => {
        const data = obj.get?.("data") as { type?: string } | null;
        if (data && (data.type === "parcel" || data.type === "shape" || data.type === "drawing")) {
          const effect = drawSettings.glowEffect;
          if (effect === "none") {
            if (obj.shadow) {
              obj.set("shadow", null as unknown as Shadow);
              obj.set("dirty", true);
            }
            return;
          }

          const intensity = (drawSettings.glowIntensity ?? 5) / 10;
          const glowRadius = drawSettings.glowRadius ?? 15;
          const pulseSpeed = drawSettings.pulseSpeed ?? 5;
          let blur = glowRadius;
          let alpha = 0.5 + 0.5 * intensity;

          if (effect === "pulse") {
            const wave = Math.sin(elapsed * 0.003 * pulseSpeed);
            blur = glowRadius * (0.85 + 0.35 * wave);
            alpha = (0.5 + 0.3 * wave) * intensity;
          } else if (effect === "flicker") {
            const rand = Math.random();
            blur = glowRadius * (0.8 + 0.35 * rand);
            alpha = (0.65 + 0.35 * rand) * intensity;
          } else if (effect === "saber" || effect === "neon" || effect === "bloom") {
            const wave = Math.sin(elapsed * 0.002 * pulseSpeed);
            blur = glowRadius * (0.9 + 0.25 * wave);
            alpha = (0.75 + 0.25 * wave) * intensity;
          }

          const shadowColor = hexToRgba(drawSettings.strokeColor, alpha);

          if (!obj.shadow || !(obj.shadow instanceof Shadow)) {
            obj.set("shadow", new Shadow({
              color: shadowColor,
              blur: blur,
              offsetX: 0,
              offsetY: 0,
            }));
          } else {
            const currentShadow = obj.shadow;
            if (currentShadow.color !== shadowColor || currentShadow.blur !== blur) {
              currentShadow.color = shadowColor;
              currentShadow.blur = blur;
            }
          }

          const groupLike = obj as FabricObject & {
            getObjects?: () => FabricObject[];
          };
          if (obj.type === "group" || Boolean(groupLike.getObjects)) {
            const group = obj as import("fabric").Group;
            group.getObjects().forEach((child) => {
              if (!child.shadow || !(child.shadow instanceof Shadow)) {
                child.set("shadow", new Shadow({
                  color: shadowColor,
                  blur: blur,
                  offsetX: 0,
                  offsetY: 0,
                }));
              } else {
                const childShadow = child.shadow;
                if (childShadow.color !== shadowColor || childShadow.blur !== blur) {
                  childShadow.color = shadowColor;
                  childShadow.blur = blur;
                }
              }
            });
          }

          obj.set("dirty", true);
        }
      });

      if (drawSettings.glowEffect !== "none") {
        renderSaberGlow(canvas, {
          color: drawSettings.strokeColor,
          coreWidth: drawSettings.strokeWidth,
          glowRadius: drawSettings.glowRadius,
          intensity: drawSettings.glowIntensity,
          flickerSpeed: drawSettings.flickerSpeed,
          pulseSpeed: drawSettings.pulseSpeed,
          enableFlicker: drawSettings.glowEffect === "flicker" || drawSettings.glowEffect === "saber",
          enablePulse: drawSettings.glowEffect === "pulse" || drawSettings.glowEffect === "saber",
        });
      }

      canvas.requestRenderAll();
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      canvas.getObjects().forEach((obj) => {
        const data = obj.get("data") as { id?: string } | undefined;
        if (data?.id) removeSaberRenderer(data.id);
      });
    };
  }, [canvasRef]);
}
