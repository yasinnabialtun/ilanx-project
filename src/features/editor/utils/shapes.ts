import {
  Circle,
  Ellipse,
  Group,
  IText,
  Line,
  Polygon,
  Polyline,
  Rect,
  Textbox,
  Triangle,
  Path,
  Shadow,
  type FabricObject,
} from "fabric";
import { v4 as uuidv4 } from "uuid";

import { hexToRgba } from "@/features/editor/config/colors";
import type { DrawSettings, LocationSettings, ObjectData } from "@/shared/types";

export function getStyledFill(settings: DrawSettings): string {
  return hexToRgba(settings.fillColor, settings.fillOpacity);
}

export function createParcelPolygon(
  points: { x: number; y: number }[],
  settings: DrawSettings,
  label: string,
): Polygon {
  const id = uuidv4();
  const polygon = new Polygon(
    points.map((p) => ({ x: p.x, y: p.y })),
    {
      fill: getStyledFill(settings),
      stroke: settings.strokeColor,
      strokeWidth: settings.strokeWidth,
      strokeDashArray: settings.strokeDashArray,
      strokeUniform: true,
      objectCaching: false,
      cornerColor: settings.strokeColor,
      cornerStyle: "circle",
      transparentCorners: false,
    },
  );
  polygon.set("data", { type: "parcel", id, label } satisfies ObjectData);
  return polygon;
}

export function createParcelRect(
  left: number,
  top: number,
  width: number,
  height: number,
  settings: DrawSettings,
  label: string,
): Rect {
  const id = uuidv4();
  const rect = new Rect({
    left,
    top,
    width,
    height,
    originX: "left",
    originY: "top",
    fill: getStyledFill(settings),
    stroke: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    strokeDashArray: settings.strokeDashArray,
    strokeUniform: true,
    cornerColor: settings.strokeColor,
    cornerStyle: "circle",
    transparentCorners: false,
  });
  rect.set("data", { type: "parcel", id, label } satisfies ObjectData);
  return rect;
}

export function createPreviewRect(
  left: number,
  top: number,
  width: number,
  height: number,
  settings: DrawSettings,
): Rect {
  return new Rect({
    left,
    top,
    width,
    height,
    originX: "left",
    originY: "top",
    fill: getStyledFill(settings),
    stroke: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    strokeDashArray: [6, 4],
    selectable: false,
    evented: false,
    objectCaching: false,
  });
}

export function createEllipse(
  left: number,
  top: number,
  rx: number,
  ry: number,
  settings: DrawSettings,
): Ellipse {
  const id = uuidv4();
  const ellipse = new Ellipse({
    left: left + rx,
    top: top + ry,
    rx,
    ry,
    originX: "center",
    originY: "center",
    fill: getStyledFill(settings),
    stroke: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    strokeDashArray: settings.strokeDashArray,
    strokeUniform: true,
  });
  ellipse.set("data", { type: "shape", id } satisfies ObjectData);
  return ellipse;
}

export function createLineShape(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  settings: DrawSettings,
): Line {
  const id = uuidv4();
  const line = new Line([x1, y1, x2, y2], {
    stroke: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    strokeDashArray: settings.strokeDashArray,
    strokeUniform: true,
    fill: "",
  });
  line.set("data", { type: "shape", id } satisfies ObjectData);
  return line;
}

export function createArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  settings: DrawSettings,
): Group {
  const id = uuidv4();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = new Triangle({
    width: settings.strokeWidth * 5,
    height: settings.strokeWidth * 7,
    fill: settings.strokeColor,
    left: x2,
    top: y2,
    originX: "center",
    originY: "center",
    angle: (angle * 180) / Math.PI + 90,
  });
  const line = new Line([x1, y1, x2, y2], {
    stroke: settings.strokeColor,
    strokeWidth: settings.strokeWidth,
    strokeDashArray: settings.strokeDashArray,
    strokeUniform: true,
    fill: "",
  });
  const group = new Group([line, head], { subTargetCheck: false });
  group.set("data", { type: "shape", id } satisfies ObjectData);
  return group;
}

export function createVertexMarker(
  x: number,
  y: number,
  color: string,
  isFirst = false,
): Circle {
  return new Circle({
    left: x,
    top: y,
    radius: isFirst ? 7 : 5,
    fill: isFirst ? "#ffffff" : color,
    stroke: color,
    strokeWidth: 2,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
    objectCaching: false,
  });
}

export function createPolygonPreview(
  points: { x: number; y: number }[],
  settings: DrawSettings,
): Polyline {
  return new Polyline(
    points.map((p) => ({ x: p.x, y: p.y })),
    {
      fill: "transparent",
      stroke: settings.strokeColor,
      strokeWidth: settings.strokeWidth,
      strokeDashArray: [5, 5],
      selectable: false,
      evented: false,
      objectCaching: false,
    },
  );
}

export function createPlainText(
  text: string,
  left: number,
  top: number,
  fontSize: number,
  color: string,
  fontFamily: string = "Arial",
  textBackgroundColor: string = "transparent"
): IText {
  const id = uuidv4();
  const itext = new IText(text, {
    left,
    top,
    fontSize,
    fill: color,
    textBackgroundColor,
    fontFamily: `${fontFamily}, sans-serif`,
    fontWeight: "600",
    originX: "center",
    originY: "center",
    objectCaching: false,
  });
  itext.set("data", { type: "text", id } satisfies ObjectData);
  return itext;
}

export function createEditableTextbox(
  text: string,
  left: number,
  top: number,
  fontSize: number,
  color: string,
  fontFamily: string = "Arial",
  textBackgroundColor: string = "transparent"
): Textbox {
  const id = uuidv4();
  const tbox = new Textbox(text, {
    left,
    top,
    fontSize,
    fill: color,
    textBackgroundColor,
    fontFamily: `${fontFamily}, sans-serif`,
    fontWeight: "600",
    originX: "center",
    originY: "center",
    editable: true,
    borderColor: color,
    editingBorderColor: color,
    cornerColor: color,
    cornerStyle: "circle",
    transparentCorners: false,
    cornerSize: 6,
    objectCaching: false,
  });
  tbox.set("data", { type: "text", id } satisfies ObjectData);
  return tbox;
}

export function createLocationMarker(
  x: number,
  y: number,
  settings: LocationSettings,
): Group {
  const id = uuidv4();
  const r = settings.size;
  const iconType = settings.iconType || "pin";

  const iconPaths: Record<string, string> = {
    pin: "M 0,-10 C -4.42,-10 -8,-6.42 -8,-2 C -8,3.25 0,10 0,10 C 0,10 8,3.25 8,-2 C 8,-6.42 4.42,-10 0,-10 Z M 0,-5 C -1.66,-5 -3,-3.66 -3,-2 C -3,-0.34 -1.66,1 0,1 C 1.66,1 3,-0.34 3,-2 C 3,-3.66 1.66,-5 0,-5 Z",
    drop: "M 0,-11 C -4.9,-11 -9,-6.9 -9,-2 C -9,2.9 0,11 0,11 C 0,11 9,2.9 9,-2 C 9,-6.9 4.9,-11 0,-11 Z M 0,-5 C -1.66,-5 -3,-3.66 -3,-2 C -3,-0.34 -1.66,1 0,1 C 1.66,1 3,-0.34 3,-2 C 3,-3.66 1.66,-5 0,-5 Z",
    star: "M 0,-8 L 2.3,-3.3 L 7.5,-2.5 L 3.7,1.2 L 4.6,6.3 L 0,3.9 L -4.6,6.3 L -3.7,1.2 L -7.5,-2.5 L -2.3,-3.3 Z",
    home: "M 0,-8 L 8,-1 L 5,-1 L 5,7 L 2,7 L 2,2 L -2,2 L -2,7 L -5,7 L -5,-1 L -8,-1 Z",
    crosshair: "M 0,-9 L 0,9 M -9,0 L 9,0 M 0,-4 A 4,4 0 1 1 0,4 A 4,4 0 1 1 0,-4 Z",
    flag: "M -5,-8 L 5,-8 L 2,-4 L 5,0 L -5,0 L -5,8",
    tree: "M 0,-9 C -3.5,-6 -4.5,-4 -3,-2 C -4.5,-1 -3.5,1 -2,1 L -2,7 L 2,7 L 2,1 C 3.5,1 4.5,-1 3,-2 C 4.5,-4 3.5,-6 0,-9 Z",
    building: "M -7,-9 L 7,-9 L 7,9 L -7,9 Z M -4,-9 L -4,-6 M 0,-9 L 0,-6 M 4,-9 L 4,-6 M -4,-3 L -2,-3 M 2,-3 L 4,-3 M -4,0 L -2,0 M 2,0 L 4,0 M -4,3 L -2,3 M 2,3 L 4,3 M -2,9 L -2,5 L 2,5 L 2,9",
    key: "M -2,-7 C -5.3,-7 -8,-4.3 -8,-1 C -8,2.3 -5.3,5 -2,5 C 1.3,5 4,2.3 4,-1 C 4,-4.3 1.3,-7 -2,-7 Z M -2,-4 C -0.3,-4 1,-2.7 1,-1 C 1,0.7 -0.3,2 -2,2 C -3.7,2 -5,0.7 -5,-1 C -5,-2.7 -3.7,-4 -2,-4 Z M 4,-1 L 9,-1 M 7,-3 L 7,1 M 9,-3 L 9,0",
    money: "M 0,-8 C -4.4,-8 -8,-4.4 -8,0 C -8,4.4 -4.4,8 0,8 C 4.4,8 8,4.4 8,0 C 8,-4.4 4.4,-8 0,-8 Z M 0,-5 L 0,5 M -3,-2 C -3,-3.7 -1.7,-5 0,-5 C 1.7,-5 3,-3.7 3,-2 C 3,-0.3 1.7,1 0,1 C 1.7,1 3,2.3 3,4 C 3,5.7 1.7,7 0,7 C -1.7,7 -3,5.7 -3,4",
    parcel: "M 0,-9 L 9,-4.5 L 9,4.5 L 0,9 L -9,4.5 L -9,-4.5 Z M 0,-9 L 0,9 M -9,-4.5 L 9,4.5 M -9,4.5 L 9,-4.5",
    ruler: "M -8,-3 L 8,-3 L 8,3 L -8,3 Z M -5,-3 L -5,0 M -2,-3 L -2,1 M 1,-3 L 1,0 M 4,-3 L 4,1",
  };

  const pathString = iconPaths[iconType] || iconPaths.pin;

  // Modern distinct colors for each icon type
  const iconColors: Record<string, string> = {
    pin: "#ef4444", // Red
    drop: "#3b82f6", // Blue
    star: "#f59e0b", // Amber/Gold
    home: "#8b5cf6", // Purple
    building: "#64748b", // Slate
    crosshair: "#f97316", // Orange
    flag: "#ec4899", // Pink
    tree: "#10b981", // Emerald/Green
    key: "#eab308", // Yellow
    money: "#22c55e", // Green
    parcel: "#06b6d4", // Cyan
    ruler: "#6366f1", // Indigo
  };

  const iconColor = iconColors[iconType] || "#ef4444";

  // Helper to darken color for premium strokes
  const darken = (hex: string, amount: number) => {
    const c = hex.replace("#", "");
    if (c.length !== 6) return "#333333";
    const r = Math.max(0, Math.floor(parseInt(c.slice(0, 2), 16) * (1 - amount)));
    const g = Math.max(0, Math.floor(parseInt(c.slice(2, 4), 16) * (1 - amount)));
    const b = Math.max(0, Math.floor(parseInt(c.slice(4, 6), 16) * (1 - amount)));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  };

  const scale = r / 20;

  // Premium Teardrop Pin Body
  // Origin is (0,0) at the sharp tip. 
  const pinPathStr = "M 0, 0 C 16, -16 24, -28 24, -40 A 24, 24 0 1, 0 -24, -40 C -24, -28 -16, -16 0, 0 Z";
  
  const pinBody = new Path(pinPathStr, {
    left: 0,
    top: 0, // Tip at 0
    fill: iconColor,
    stroke: darken(iconColor, 0.15),
    strokeWidth: 1.5,
    originX: "center",
    originY: "bottom", // The bottom of the path is the tip (0,0)
    scaleX: scale,
    scaleY: scale,
    shadow: new Shadow({
      color: "rgba(0,0,0,0.45)",
      blur: 12,
      offsetX: 0,
      offsetY: 8,
    }),
  });

  // Inner white circle for the icon
  const pinCutout = new Circle({
    left: 0,
    top: -40 * scale, // Center of the bulb
    radius: 14 * scale,
    fill: "#ffffff",
    originX: "center",
    originY: "center",
  });

  const isCrosshair = iconType === "crosshair";
  const icon = new Path(pathString, {
    left: 0,
    top: -40 * scale, // Center of the bulb
    fill: isCrosshair ? "transparent" : iconColor,
    stroke: isCrosshair ? iconColor : iconColor,
    strokeWidth: isCrosshair ? 1.5 : 0.5,
    originX: "center",
    originY: "center",
    scaleX: scale * 0.85,
    scaleY: scale * 0.85,
    selectable: false,
    evented: false,
  });

  const pulse = new Circle({
    left: 0,
    top: 0, // Pulse at the tip
    radius: r * 0.8,
    fill: hexToRgba(iconColor, 0.15),
    stroke: hexToRgba(iconColor, 0.5),
    strokeWidth: 2,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
    objectCaching: false,
    visible: settings.showPulse,
  });

  const group = new Group([pulse, pinBody, pinCutout, icon], {
    left: x,
    top: y,
    originX: "center",
    originY: "bottom", // Anchor the group at the bottom (tip of the pin)
    subTargetCheck: false,
    hasControls: true,
    hasBorders: true,
  });

  group.set("data", {
    type: "location",
    id,
    label: settings.label,
    color: settings.color,
    size: settings.size,
    showPulse: settings.showPulse,
    iconType: settings.iconType || "pin",
  } satisfies ObjectData);
  return group;
}


export function tagDrawingObject(obj: FabricObject) {
  const id = uuidv4();
  obj.set("data", { type: "drawing", id } satisfies ObjectData);
}
