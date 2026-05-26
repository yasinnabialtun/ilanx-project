export const COLOR_PRESETS = [
  { name: "Parsel yeşil", stroke: "#16a34a", fill: "#22c55e" },
  { name: "Satılık kırmızı", stroke: "#dc2626", fill: "#ef4444" },
  { name: "Rezerve sarı", stroke: "#ca8a04", fill: "#eab308" },
  { name: "Bilgi mavi", stroke: "#2563eb", fill: "#3b82f6" },
  { name: "Mor vurgu", stroke: "#7c3aed", fill: "#8b5cf6" },
  { name: "Beyaz", stroke: "#ffffff", fill: "#f4f4f5" },
] as const;

export function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return `rgba(34,197,94,${alpha})`;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}