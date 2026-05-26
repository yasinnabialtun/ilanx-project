export type EditorTool =
  | "select"
  | "pan"
  | "polygon"
  | "rect"
  | "circle"
  | "line"
  | "arrow"
  | "pencil"
  | "text"
  | "text3d"
  | "location"
  | "logo"
  | "scale";


export type TextSettings = {
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  textBackgroundColor: string;
};

export type Text3DSettings = {
  content: string;
  fontSize: number;
  color: string;
  depth: number;
  fontFamily: string;
  extrusionAngle: number;
  skewX?: number;
  skewY?: number;
};

export type DrawSettings = {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  fillOpacity: number;
  strokeDashArray?: number[];
  glowEffect?: "none" | "pulse" | "flicker" | "saber" | "bloom" | "neon";
  glowRadius?: number;
  glowIntensity?: number;
  flickerSpeed?: number;
  pulseSpeed?: number;
};

export type ParcelItem = {
  id: string;
  label: string;
};

export type ObjectDataType =
  | "parcel"
  | "text3d"
  | "text"
  | "shape"
  | "drawing"
  | "location"
  | "logo";

export type ObjectData = {
  type: ObjectDataType;
  id: string;
  label?: string;
  color?: string;
  size?: number;
  showPulse?: boolean;
  iconType?: string;
};

export type ToolHint = {
  title: string;
  lines: string[];
};

export type LocationIconType = "pin" | "drop" | "star" | "home" | "crosshair" | "flag" | "tree" | "building" | "key" | "money" | "parcel" | "ruler";

export type LocationSettings = {
  label: string;
  color: string;
  size: number;
  showPulse: boolean;
  iconType: LocationIconType;
};

// ─── Artist / After-Effects tarzı efektler ───────────────────

export type TextEffectType = "none" | "typewriter" | "wave" | "neon-pulse" | "glow-flicker";

export type SelectionEffectType = "none" | "pulse" | "border-spin" | "neon-scan" | "pen-draw";

export type ArtistStyleSettings = {
  textEffect: TextEffectType;
  selectionEffect: SelectionEffectType;
  effectSpeed: number;        // 1–10
  effectIntensity: number;    // 1–10
  glowColor: string;
};

export type VideoExportQuality = "low" | "medium" | "high" | "lossless";

export type ExportOptions = {
  format: "png" | "jpg" | "webm";
  quality: VideoExportQuality;
  includeBackground: boolean;
  duration: number;   // video için saniye
};


// ─── Global Canvas Storage ───────────────────────────────────────

declare global {
  interface Window {
    __arsaCanvas?: import("fabric").Canvas;
  }
}
