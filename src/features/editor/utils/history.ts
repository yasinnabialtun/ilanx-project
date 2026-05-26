import { Canvas } from "fabric";

import { syncParcelsFromCanvas } from "@/features/editor/utils/sync-parcels";
import { useEditorStore } from "@/features/editor/store/editorStore";


export interface HistoryState {
  history: string[];
  future: string[];
}

const HISTORY_SIZE = 50;

export class HistoryManager {
  private canvas: Canvas;
  private history: string[] = [];
  private future: string[] = [];

  constructor(canvas: Canvas) {
    this.canvas = canvas;
  }

  private saveState(): string {
    return JSON.stringify(this.canvas.toObject(["data"]));
  }

  private publishState() {
    useEditorStore.getState().setHistoryState(this.getState());
  }

  public reset() {
    this.history = [];
    this.future = [];
    this.saveInitialState();
    this.publishState();
  }

  private saveInitialState() {
    this.history = [this.saveState()];
  }

  public undo() {
    if (this.history.length > 1) {
      const currentState = this.history.pop();
      if (currentState) {
        this.future.push(currentState);
      }
      const previousState = this.history[this.history.length - 1];
      if (previousState) {
        this.loadState(previousState);
      }
      this.publishState();
    }
  }

  public redo() {
    const nextState = this.future.pop();
    if (nextState) {
      this.loadState(nextState);
      this.history.push(nextState);
      this.publishState();
    }
  }

  public getState(): HistoryState {
    return { history: this.history, future: this.future };
  }

  public recordState() {
    const state = this.saveState();
    if (this.history[this.history.length - 1] === state) {
      this.publishState();
      return;
    }
    if (this.future.length > 0) {
      this.future = [];
    }
    this.history.push(state);
    if (this.history.length > HISTORY_SIZE) {
      this.history.shift();
    }
    this.publishState();
  }

  public save() {
    this.recordState();
  }

  private loadState(state: string) {
    void this.canvas.loadFromJSON(state).then(() => {
      this.canvas.renderAll();
      syncParcelsFromCanvas(this.canvas);
    });
  }
}

export function getHistory(): HistoryManager | null {
  if (typeof window === "undefined") return null;
  const canvas = window.__arsaCanvas;
  return canvas ? (canvas as any).history ?? null : null;
}

export function createHistory(canvas: Canvas): HistoryManager {
  const manager = new HistoryManager(canvas);
  (canvas as any).history = manager;
  return manager;
}

export function resetHistory(): void {
  if (typeof window !== "undefined" && window.__arsaCanvas) {
    delete (window.__arsaCanvas as any).history;
  }
}
