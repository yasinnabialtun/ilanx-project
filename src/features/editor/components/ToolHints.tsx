"use client";

import { useEditorStore } from "@/features/editor/store/editorStore";

export function ToolHints() {
  const toolHint = useEditorStore((s) => s.toolHint);
  const polygonPointCount = useEditorStore((s) => s.polygonPointCount);
  const activeTool = useEditorStore((s) => s.activeTool);

  if (!toolHint) return null;

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 sm:bottom-3 sm:left-3 max-w-[200px] sm:max-w-xs rounded-lg bg-black/75 px-2.5 py-1.5 sm:px-3 sm:py-2 text-white shadow-lg backdrop-blur-sm">
      <p className="text-[11px] sm:text-xs font-semibold">{toolHint.title}</p>
      <ul className="mt-0.5 sm:mt-1 space-y-0.5 text-[10px] sm:text-[11px] text-white/85">
        {toolHint.lines.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>
      {activeTool === "polygon" && polygonPointCount > 0 && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-white/15 pt-2 pointer-events-auto">
          <p className="text-[10px] sm:text-[11px] font-medium text-emerald-400">
            {polygonPointCount} nokta eklendi {polygonPointCount < 3 && "(min. 3)"}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={polygonPointCount < 3}
              onClick={() => (window as any).__finishDrawing?.()}
              className="flex-1 rounded bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800/40 disabled:text-white/40 disabled:cursor-not-allowed text-white py-1 text-[10px] font-bold shadow-sm transition-colors cursor-pointer"
            >
              Tamamla
            </button>
            <button
              type="button"
              onClick={() => (window as any).__cancelDrawing?.()}
              className="flex-1 rounded bg-red-600 hover:bg-red-700 text-white py-1 text-[10px] font-bold shadow-sm transition-colors cursor-pointer"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
