"use client";

import { FabricCanvas } from "./FabricCanvas";

type EditorCanvasProps = {
  backgroundDataUrl: string | null;
};

export function EditorCanvas({ backgroundDataUrl }: EditorCanvasProps) {
  return (
    <FabricCanvas backgroundDataUrl={backgroundDataUrl} />
  );
}
