import { Group, Rect, IText, Text, Shadow, Path, Circle, Line, type FabricObject } from "fabric";
import { v4 as uuidv4 } from "uuid";

// ── Shared shadow helper ─────────────────────────────────────────────────
function makeShadow(color: string, blur: number, x = 0, y = 0) {
  return new Shadow({ color, blur, offsetX: x, offsetY: y });
}

// ── Signboard with stick at bottom ──────────────────────────────────────
// All sign boards follow this layout:
//   [ TABELA (rect/shape + centered IText) ]
//          |   (vertical pole)
//          |
// The group origin is center-bottom of the pole, so it can be planted anywhere.

/**
 * Build a "tabela on a stick" group.
 * @param boardW   board width
 * @param boardH   board height
 * @param rx       board corner radius
 * @param fillBg   board fill color (or gradient in SVG but we use solid here)
 * @param stroke   board stroke color
 * @param strokeW  board stroke width
 * @param text     editable center text
 * @param textColor text fill color
 * @param fontSize  font size
 * @param fontFamily font family
 * @param poleColor  pole color
 * @param poleH     pole height in px
 * @param extraObjects  additional fabric objects to put INSIDE the board (like emoji Text, inner frames)
 */
function buildSignboard(opts: {
  boardW: number;
  boardH: number;
  rx?: number;
  fillBg: string;
  stroke: string;
  strokeW?: number;
  text: string;
  textColor: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  poleColor: string;
  poleH?: number;
  poleW?: number;
  extraObjects?: FabricObject[];
  shadow?: Shadow;
  textShadow?: Shadow;
  label: string;
  x: number;
  y: number;
}): Group {
  const id = uuidv4();
  const {
    boardW, boardH, rx = 10,
    fillBg, stroke, strokeW = 2,
    text, textColor, fontSize = 16, fontFamily = "Montserrat, sans-serif", fontWeight = "bold",
    poleColor, poleH = 40, poleW = 4,
    extraObjects = [],
    shadow, textShadow,
    label, x, y,
  } = opts;

  const poleX = boardW / 2;

  // Board background
  const board = new Rect({
    left: 0,
    top: 0,
    width: boardW,
    height: boardH,
    rx,
    ry: rx,
    fill: fillBg,
    stroke,
    strokeWidth: strokeW,
    objectCaching: false,
  });

  // Centered editable IText
  const label_txt = new IText(text, {
    left: boardW / 2,
    top: boardH / 2,
    fontSize,
    fill: textColor,
    fontFamily,
    fontWeight: fontWeight as string,
    originX: "center",
    originY: "center",
    textAlign: "center",
    objectCaching: false,
    editable: true,
    ...(textShadow ? { shadow: textShadow } : {}),
  });

  // Vertical pole
  const pole = new Rect({
    left: poleX - poleW / 2,
    top: boardH,
    width: poleW,
    height: poleH,
    fill: poleColor,
    stroke: "rgba(0,0,0,0.2)",
    strokeWidth: 0.5,
    rx: poleW / 2,
    ry: poleW / 2,
    objectCaching: false,
  });

  // Base foot (small wider rectangle at bottom of pole)
  const foot = new Rect({
    left: poleX - poleW * 2,
    top: boardH + poleH - 4,
    width: poleW * 4,
    height: 6,
    fill: poleColor,
    rx: 2,
    ry: 2,
    objectCaching: false,
  });

  const children: FabricObject[] = [board, ...extraObjects, pole, foot, label_txt];

  const group = new Group(children, {
    left: x,
    top: y,
    originX: "center",
    originY: "center",
    objectCaching: false,
    ...(shadow ? { shadow } : {}),
  });

  group.set("data", { type: "sticker", id, label });
  return group;
}

// ────────────────────────────────────────────────────────────────────────
// EMLAK ETİKETLERİ — Tabelalar (Board + Stick)
// ────────────────────────────────────────────────────────────────────────

export function createStickerForSale(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 180, boardH: 70, rx: 10,
    fillBg: "#dc2626", stroke: "#fff", strokeW: 2.5,
    text: "SATILIK",
    textColor: "#ffffff", fontSize: 22, fontFamily: "Impact, sans-serif", fontWeight: "bold",
    poleColor: "#b91c1c", poleH: 44, poleW: 6,
    shadow: makeShadow("rgba(220,38,38,0.55)", 18, 0, 6),
    label: "Satılık",
  });
}

export function createStickerForRent(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 180, boardH: 70, rx: 10,
    fillBg: "#2563eb", stroke: "#fff", strokeW: 2.5,
    text: "KİRALIK",
    textColor: "#ffffff", fontSize: 22, fontFamily: "Impact, sans-serif", fontWeight: "bold",
    poleColor: "#1d4ed8", poleH: 44, poleW: 6,
    shadow: makeShadow("rgba(37,99,235,0.5)", 18, 0, 6),
    label: "Kiralık",
  });
}

export function createStickerSoldStamp(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 180, boardH: 70, rx: 10,
    fillBg: "#15803d", stroke: "#fff", strokeW: 2.5,
    text: "SATILDI",
    textColor: "#ffffff", fontSize: 22, fontFamily: "Impact, sans-serif", fontWeight: "bold",
    poleColor: "#166534", poleH: 44, poleW: 6,
    shadow: makeShadow("rgba(22,163,74,0.4)", 16, 0, 5),
    label: "Satıldı",
  });
}

export function createStickerPriceBadge(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 200, boardH: 70, rx: 35,
    fillBg: "#f59e0b", stroke: "#ffffff", strokeW: 2.5,
    text: "₺ 0.000.000",
    textColor: "#ffffff", fontSize: 18, fontFamily: "Montserrat, sans-serif", fontWeight: "bold",
    poleColor: "#b45309", poleH: 44, poleW: 6,
    shadow: makeShadow("rgba(245,158,11,0.55)", 16, 0, 5),
    label: "Fiyat",
  });
}

export function createStickerMeasureLabel(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 180, boardH: 64, rx: 8,
    fillBg: "#1e293b", stroke: "#38bdf8", strokeW: 2,
    text: "000 m²",
    textColor: "#38bdf8", fontSize: 20, fontFamily: "Montserrat, sans-serif", fontWeight: "bold",
    poleColor: "#0f172a", poleH: 40, poleW: 5,
    shadow: makeShadow("rgba(56,189,248,0.35)", 14, 0, 5),
    textShadow: makeShadow("rgba(56,189,248,0.7)", 8, 0, 0),
    label: "m² Ölçüm",
  });
}

export function createStickerGreenZone(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 200, boardH: 64, rx: 32,
    fillBg: "#16a34a", stroke: "#ffffff", strokeW: 2,
    text: "🌳 YEŞİL ALAN",
    textColor: "#ffffff", fontSize: 15, fontFamily: "Montserrat, sans-serif", fontWeight: "bold",
    poleColor: "#166534", poleH: 40, poleW: 5,
    shadow: makeShadow("rgba(22,163,74,0.4)", 14, 0, 5),
    label: "Yeşil Alan",
  });
}

export function createStickerZoning(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 200, boardH: 64, rx: 8,
    fillBg: "#78350f", stroke: "#fbbf24", strokeW: 2,
    text: "⚠️ İMAR DURUMU",
    textColor: "#fbbf24", fontSize: 14, fontFamily: "Montserrat, sans-serif", fontWeight: "bold",
    poleColor: "#451a03", poleH: 40, poleW: 5,
    shadow: makeShadow("rgba(251,191,36,0.3)", 12, 0, 4),
    label: "İmar Durumu",
  });
}

export function createStickerDeed(x: number, y: number): Group {
  return buildSignboard({
    x, y,
    boardW: 200, boardH: 64, rx: 8,
    fillBg: "#7c3aed", stroke: "#c4b5fd", strokeW: 2,
    text: "📜 TAPU KAYDI",
    textColor: "#c4b5fd", fontSize: 14, fontFamily: "Montserrat, sans-serif", fontWeight: "bold",
    poleColor: "#4c1d95", poleH: 40, poleW: 5,
    shadow: makeShadow("rgba(124,58,237,0.4)", 14, 0, 4),
    label: "Tapu",
  });
}

// ────────────────────────────────────────────────────────────────────────
// YAZILABILIR PANOLAR — Glass, Neon, Ahşap (Board + Stick)
// ────────────────────────────────────────────────────────────────────────

export function createStickerGlassPanel(x: number, y: number): Group {
  const id = uuidv4();
  const boardW = 200, boardH = 80;
  const poleH = 44, poleW = 5;

  const board = new Rect({
    left: 0, top: 0, width: boardW, height: boardH,
    rx: 18, ry: 18,
    fill: "rgba(255,255,255,0.12)",
    stroke: "rgba(255,255,255,0.5)", strokeWidth: 1.5,
    objectCaching: false,
  });

  // Inner highlight streak
  const highlight = new Rect({
    left: 16, top: 12, width: boardW - 32, height: 14,
    rx: 7, ry: 7,
    fill: "rgba(255,255,255,0.18)",
    stroke: "transparent", strokeWidth: 0,
    objectCaching: false,
  });

  const txt = new IText("Yazınızı girin", {
    left: boardW / 2, top: boardH / 2,
    fontSize: 15, fill: "#ffffff",
    fontFamily: "Montserrat, sans-serif", fontWeight: "bold",
    originX: "center", originY: "center",
    textAlign: "center",
    objectCaching: false, editable: true,
  });

  const pole = new Rect({
    left: boardW / 2 - poleW / 2, top: boardH,
    width: poleW, height: poleH,
    fill: "rgba(255,255,255,0.35)",
    stroke: "rgba(255,255,255,0.1)", strokeWidth: 0.5,
    rx: poleW / 2, ry: poleW / 2,
    objectCaching: false,
  });

  const foot = new Rect({
    left: boardW / 2 - poleW * 2, top: boardH + poleH - 4,
    width: poleW * 4, height: 6,
    fill: "rgba(255,255,255,0.3)", rx: 2, ry: 2, objectCaching: false,
  });

  const group = new Group([board, highlight, pole, foot, txt], {
    left: x, top: y, originX: "center", originY: "center",
    shadow: makeShadow("rgba(0,0,0,0.25)", 18, 0, 8),
    objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "Cam Pano" });
  return group;
}

export function createStickerNeonBoard(x: number, y: number): Group {
  const id = uuidv4();
  const boardW = 200, boardH = 80;
  const poleH = 44, poleW = 5;

  const board = new Rect({
    left: 0, top: 0, width: boardW, height: boardH,
    rx: 10, ry: 10,
    fill: "#0c0c14", stroke: "#38bdf8", strokeWidth: 2,
    objectCaching: false,
  });

  // Neon inner border glow lines
  const innerBorder = new Rect({
    left: 5, top: 5, width: boardW - 10, height: boardH - 10,
    rx: 7, ry: 7,
    fill: "transparent", stroke: "rgba(56,189,248,0.3)", strokeWidth: 1,
    objectCaching: false,
  });

  const txt = new IText("NEON PANO", {
    left: boardW / 2, top: boardH / 2,
    fontSize: 15, fill: "#38bdf8",
    fontFamily: "Montserrat, sans-serif", fontWeight: "800",
    originX: "center", originY: "center",
    textAlign: "center",
    objectCaching: false, editable: true,
    shadow: makeShadow("rgba(56,189,248,0.85)", 12, 0, 0),
  });

  const pole = new Rect({
    left: boardW / 2 - poleW / 2, top: boardH,
    width: poleW, height: poleH,
    fill: "#1e293b", stroke: "#38bdf8", strokeWidth: 0.5,
    rx: poleW / 2, ry: poleW / 2, objectCaching: false,
  });

  const foot = new Rect({
    left: boardW / 2 - poleW * 2, top: boardH + poleH - 4,
    width: poleW * 4, height: 6,
    fill: "#1e293b", rx: 2, ry: 2, objectCaching: false,
  });

  const group = new Group([board, innerBorder, pole, foot, txt], {
    left: x, top: y, originX: "center", originY: "center",
    shadow: makeShadow("rgba(56,189,248,0.4)", 22, 0, 0),
    objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "Neon Pano" });
  return group;
}

export function createStickerWoodenBoard(x: number, y: number): Group {
  const id = uuidv4();
  const boardW = 200, boardH = 80;
  const poleH = 50, poleW = 10;

  const board = new Rect({
    left: 0, top: 0, width: boardW, height: boardH,
    rx: 5, ry: 5,
    fill: "#78350f", stroke: "#b45309", strokeWidth: 3,
    objectCaching: false,
  });

  // Wood grain lines
  const grains = [20, 40, 60].map((ty) =>
    new Line([8, ty, boardW - 8, ty], {
      stroke: "rgba(69,26,3,0.5)", strokeWidth: 1.5, objectCaching: false,
    })
  );

  // Pole - wooden posts (two thin poles like a real sign)
  const poleL = new Rect({
    left: boardW / 2 - 20 - poleW / 2, top: boardH,
    width: poleW, height: poleH,
    fill: "#92400e", stroke: "#451a03", strokeWidth: 1,
    rx: 2, ry: 2, objectCaching: false,
  });

  const poleR = new Rect({
    left: boardW / 2 + 20 - poleW / 2, top: boardH,
    width: poleW, height: poleH,
    fill: "#92400e", stroke: "#451a03", strokeWidth: 1,
    rx: 2, ry: 2, objectCaching: false,
  });

  const txt = new IText("AHŞAP PANO", {
    left: boardW / 2, top: boardH / 2,
    fontSize: 14, fill: "#fef3c7",
    fontFamily: "Cinzel Decorative, serif", fontWeight: "bold",
    originX: "center", originY: "center",
    textAlign: "center",
    objectCaching: false, editable: true,
    shadow: makeShadow("rgba(0,0,0,0.6)", 2, 1, 1),
  });

  const group = new Group([board, ...grains, poleL, poleR, txt], {
    left: x, top: y, originX: "center", originY: "center",
    shadow: makeShadow("rgba(0,0,0,0.4)", 14, 0, 6),
    objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "Ahşap Pano" });
  return group;
}

// ────────────────────────────────────────────────────────────────────────
// 3D SIMGELER (değiştirilmedi — bunlar dekoratif, metin isteyen değil)
// ────────────────────────────────────────────────────────────────────────

function createPremiumShadow(color: string, blur: number, x: number, y: number) {
  return new Shadow({ color, blur, offsetX: x, offsetY: y });
}

export function createSticker3DHouse(x: number, y: number): Group {
  const id = uuidv4();
  const leftWall = new Path("M 0,0 L -25,-12 L -25,18 L 0,30 Z", { fill: "#475569", stroke: "#334155", strokeWidth: 0.5 });
  const rightWall = new Path("M 0,30 L 25,18 L 25,-12 L 0,0 Z", { fill: "#64748b", stroke: "#475569", strokeWidth: 0.5 });
  const roofLeft = new Path("M 0,-15 L -28,-3 L -25,-12 L 0,-24 Z", { fill: "#ef4444", stroke: "#b91c1c", strokeWidth: 0.5 });
  const roofRight = new Path("M 0,-24 L 25,-12 L 28,-3 L 0,-15 Z", { fill: "#f87171", stroke: "#dc2626", strokeWidth: 0.5 });
  const door = new Path("M 6,14 L 14,10 L 14,24 L 6,28 Z", { fill: "#1e293b" });
  const group = new Group([leftWall, rightWall, roofLeft, roofRight, door], {
    left: x, top: y, originX: "center", originY: "center", scaleX: 1.6, scaleY: 1.6,
    shadow: createPremiumShadow("rgba(0,0,0,0.3)", 15, 0, 10), objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "3D Villa" });
  return group;
}

export function createSticker3DGoldCoin(x: number, y: number): Group {
  const id = uuidv4();
  const shadowBase = new Circle({ left: 0, top: 4, radius: 20, fill: "#78350f" });
  const base = new Circle({ left: 0, top: 0, radius: 20, fill: "#fbbf24", stroke: "#d97706", strokeWidth: 1.5 });
  const innerRim = new Circle({ left: 3, top: 3, radius: 17, fill: "transparent", stroke: "#f59e0b", strokeWidth: 1, strokeDashArray: [3, 2] });
  const txt = new Text("TL", { left: 20, top: 20, fontSize: 14, fill: "#78350f", fontFamily: "Montserrat, sans-serif", fontWeight: "900", originX: "center", originY: "center", shadow: createPremiumShadow("rgba(255,255,255,0.6)", 1, 0, 1) });
  const group = new Group([shadowBase, base, innerRim, txt], {
    left: x, top: y, originX: "center", originY: "center", scaleX: 1.5, scaleY: 1.5,
    shadow: createPremiumShadow("rgba(0,0,0,0.25)", 10, 0, 6), objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "Altın Para" });
  return group;
}

export function createSticker3DCompass(x: number, y: number): Group {
  const id = uuidv4();
  const outerRing = new Circle({ left: 0, top: 0, radius: 24, fill: "#1e293b", stroke: "#94a3b8", strokeWidth: 2.5 });
  const face = new Circle({ left: 3, top: 3, radius: 21, fill: "#0f172a" });
  const northNeedle = new Path("M 24,24 L 21,9 L 24,3 L 27,9 Z", { fill: "#ef4444", originX: "center", originY: "center" });
  const southNeedle = new Path("M 24,24 L 21,39 L 24,45 L 27,39 Z", { fill: "#3b82f6", originX: "center", originY: "center" });
  const centerPin = new Circle({ left: 22.5, top: 22.5, radius: 3, fill: "#ffffff" });
  const group = new Group([outerRing, face, northNeedle, southNeedle, centerPin], {
    left: x, top: y, originX: "center", originY: "center", scaleX: 1.4, scaleY: 1.4,
    shadow: createPremiumShadow("rgba(0,0,0,0.3)", 12, 0, 8), objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "3D Pusula" });
  return group;
}

export function createStickerNeonArrow(x: number, y: number): Group {
  const id = uuidv4();
  const arrow = new Path("M 0,0 C 20,-10 40,0 50,20 L 40,20 M 50,20 L 50,8", { fill: "transparent", stroke: "#f43f5e", strokeWidth: 4, strokeLineCap: "round", strokeLineJoin: "round" });
  const glow = new Path("M 0,0 C 20,-10 40,0 50,20 L 40,20 M 50,20 L 50,8", { fill: "transparent", stroke: "#f43f5e", strokeWidth: 8, opacity: 0.45, strokeLineCap: "round", strokeLineJoin: "round" });
  const group = new Group([glow, arrow], {
    left: x, top: y, originX: "center", originY: "center", scaleX: 1.5, scaleY: 1.5,
    shadow: createPremiumShadow("rgba(244,63,94,0.7)", 15, 0, 0), objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "Neon Ok" });
  return group;
}

export function createStickerClassic3DArrow(x: number, y: number): Group {
  const id = uuidv4();
  const arrowDepth = new Path("M 10,25 L 30,25 L 30,35 L 55,20 L 30,5 L 30,15 L 10,15 Z", { fill: "#0369a1", left: 2, top: 2 });
  const arrowFace = new Path("M 10,25 L 30,25 L 30,35 L 55,20 L 30,5 L 30,15 L 10,15 Z", { fill: "#0ea5e9", stroke: "#ffffff", strokeWidth: 1, left: 0, top: 0 });
  const group = new Group([arrowDepth, arrowFace], {
    left: x, top: y, originX: "center", originY: "center", scaleX: 1.6, scaleY: 1.6,
    shadow: createPremiumShadow("rgba(0,0,0,0.3)", 10, 0, 5), objectCaching: false,
  });
  group.set("data", { type: "sticker", id, label: "3D Ok" });
  return group;
}
