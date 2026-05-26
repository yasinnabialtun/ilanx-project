"use client";

import dynamic from "next/dynamic";

import { ErrorBoundary } from "@/core/components/ErrorBoundary";

const PhotoEditor = dynamic(
  () => import("./PhotoEditor").then((m) => m.PhotoEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[100dvh] items-center justify-center bg-background text-muted-foreground">
        Editör yükleniyor…
      </div>
    ),
  },
);

export function EditorLoader() {
  return (
    <ErrorBoundary>
      <PhotoEditor />
    </ErrorBoundary>
  );
}
