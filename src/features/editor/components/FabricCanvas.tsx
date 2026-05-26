"use client";

import type { Canvas } from "fabric";
import { useRef } from "react";

import { useCanvasTools } from "@/features/editor/hooks/use-canvas-tools";
import { CanvasContainer } from "./CanvasContainer";
import { ToolHints } from "./ToolHints";
type FabricCanvasProps = {
  backgroundDataUrl: string | null;
  onCanvasReady?: (canvas: Canvas | null) => void;
};

export function FabricCanvas({
  backgroundDataUrl,
  onCanvasReady,
}: FabricCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  useCanvasTools(canvasElRef, containerRef, backgroundDataUrl, onCanvasReady);

  return (
    <CanvasContainer ref={containerRef}>
      <canvas ref={canvasElRef} />
      <ToolHints />
    </CanvasContainer>
  );
}
