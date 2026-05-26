"use client";

export type LogLevel = "info" | "warn" | "error" | "perf";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
}

class TelemetrySystem {
  private logBuffer: LogEntry[] = [];
  private readonly bufferSize = 100;
  private fpsValues: number[] = [];
  private lastFpsTime = 0;
  private frameCount = 0;

  constructor() {
    if (typeof window !== "undefined") {
      this.lastFpsTime = performance.now();
      this.info("Telemetry initialized", { userAgent: navigator.userAgent });
    }
  }

  private log(level: LogLevel, message: string, context?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    // Add to ring buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.bufferSize) {
      this.logBuffer.shift();
    }

    // Output to console with styled headers
    const colors = {
      info: "#3b82f6",
      warn: "#eab308",
      error: "#ef4444",
      perf: "#10b981",
    };

    console.log(
      `%c[ilanxTelemetry - ${level.toUpperCase()}]%c ${message}`,
      `color: ${colors[level]}; font-weight: bold;`,
      "color: inherit;",
      context ? context : ""
    );
  }

  public info(message: string, context?: any) {
    this.log("info", message, context);
  }

  public warn(message: string, context?: any) {
    this.log("warn", message, context);
  }

  public error(message: string, context?: any) {
    this.log("error", message, context);
  }

  public perf(message: string, context?: any) {
    this.log("perf", message, context);
  }

  // FPS tracking inside animation ticks
  public registerFrame() {
    const now = performance.now();
    this.frameCount++;

    if (now - this.lastFpsTime >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.fpsValues.push(fps);
      if (this.fpsValues.length > 30) this.fpsValues.shift();

      this.frameCount = 0;
      this.lastFpsTime = now;

      // Log if FPS drops significantly
      if (fps < 24) {
        this.warn(`FPS drop detected: ${fps} fps`, { currentFps: fps });
      }
    }
  }

  public getAverageFps(): number {
    if (this.fpsValues.length === 0) return 60;
    const sum = this.fpsValues.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsValues.length);
  }

  // Profile operations
  public startTimer(name: string): () => void {
    const start = performance.now();
    this.info(`Operation started: ${name}`);
    return () => {
      const duration = performance.now() - start;
      this.perf(`Operation finished: ${name}`, { durationMs: duration.toFixed(2) });
    };
  }

  // Get diagnostics report to send to support/crash tracker
  public getDiagnosticsReport() {
    return {
      appName: "ilanx",
      time: new Date().toISOString(),
      avgFps: this.getAverageFps(),
      logs: [...this.logBuffer],
      screen: typeof window !== "undefined" ? {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      } : null,
      memory: typeof window !== "undefined" && (performance as any).memory ? {
        usedJSHeapSize: ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
        totalJSHeapSize: ((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + "MB",
      } : "Not available",
    };
  }
}

export const telemetry = new TelemetrySystem();
