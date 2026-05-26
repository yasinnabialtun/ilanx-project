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
        <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] font-medium text-emerald-300">
          {polygonPointCount} nokta · min. 3
        </p>
      )}
    </div>
  );
}
