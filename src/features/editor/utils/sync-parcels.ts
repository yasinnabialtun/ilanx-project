import type { Canvas } from "fabric";

import type { ObjectData, ParcelItem } from "@/shared/types";
import { useEditorStore } from "@/features/editor/store/editorStore";

export function syncParcelsFromCanvas(canvas: Canvas) {
  const parcels: ParcelItem[] = [];
  for (const obj of canvas.getObjects()) {
    const data = obj.get("data") as ObjectData | undefined;
    if (data?.type === "parcel" && data.id) {
      parcels.push({ id: data.id, label: data.label ?? "Parsel" });
    }
  }
  useEditorStore.setState({ parcels });
}
