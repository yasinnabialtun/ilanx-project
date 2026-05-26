import type { Canvas, FabricObject } from "fabric";
import { hexToRgba } from "@/features/editor/config/colors";

export type EnergyBeamConfig = {
  coreColor: string;
  outerColor: string;
  intensity: number;
  speed: number;
  glowRadius: number;
  trailLength: number;
  volumetricIntensity: number;
};

const DEFAULT_CONFIG: EnergyBeamConfig = {
  coreColor: "#00d4ff",
  outerColor: "#8b00ff",
  intensity: 7,
  speed: 5,
  glowRadius: 40,
  trailLength: 20,
  volumetricIntensity: 0.6,
};

type TrailPoint = {
  x: number;
  y: number;
  opacity: number;
  size: number;
  timestamp: number;
};

class EnergyBeamRenderer {
  private trailPoints: TrailPoint[] = [];
  private animationTime = 0;
  private lastUpdateTime = Date.now();

  constructor(private config: EnergyBeamConfig = DEFAULT_CONFIG) {}

  updateConfig(partial: Partial<EnergyBeamConfig>) {
    this.config = { ...this.config, ...partial };
  }

  addTrailPoint(x: number, y: number) {
    this.trailPoints.push({
      x,
      y,
      opacity: 1,
      size: this.config.glowRadius * 0.3,
      timestamp: Date.now(),
    });

    if (this.trailPoints.length > this.config.trailLength) {
      this.trailPoints.shift();
    }
  }

  private updateTrail() {
    const now = Date.now();
    const trailFadeTime = 400 / (this.config.speed / 5);

    this.trailPoints = this.trailPoints
      .map((p) => ({
        ...p,
        opacity: Math.max(
          0,
          1 - (now - p.timestamp) / trailFadeTime
        ),
      }))
      .filter((p) => p.opacity > 0.01);
  }

  private drawPlasmaCore(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    const time = this.animationTime * 0.02;

    const flicker = 0.7 + 0.3 * Math.sin(time * this.config.speed);
    const coreSize = size * 0.15 * flicker;

    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, coreSize);
    coreGradient.addColorStop(0, hexToRgba(this.config.coreColor, 1));
    coreGradient.addColorStop(0.5, hexToRgba(this.config.coreColor, 0.5));
    coreGradient.addColorStop(1, "rgba(0, 212, 255, 0)");

    ctx.fillStyle = coreGradient;
    ctx.fillRect(x - coreSize * 2, y - coreSize * 2, coreSize * 4, coreSize * 4);
  }

  private drawVolumetricGlow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    const time = this.animationTime * 0.01;
    const intensity = this.config.volumetricIntensity;

    const layers = 12;
    for (let i = layers; i > 0; i--) {
      const layerSize = size * (i / layers);
      const alpha = (1 - i / layers) * intensity * 0.3;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerSize);
      const innerColor = hexToRgba(this.config.coreColor, alpha);
      const outerColor = hexToRgba(this.config.outerColor, alpha * 0.3);

      gradient.addColorStop(0, innerColor);
      gradient.addColorStop(0.7, outerColor);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, layerSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawElectricEdges(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    const time = this.animationTime * 0.015;

    const lineCount = 6;
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2 + time;
      const wave = Math.sin(time * this.config.speed + i) * 0.3;

      ctx.strokeStyle = hexToRgba(
        this.config.outerColor,
        0.6 * (0.5 + 0.5 * Math.sin(time + i))
      );
      ctx.lineWidth = 1 + wave;

      ctx.beginPath();
      const startRadius = size * 0.3;
      const startX = x + Math.cos(angle) * startRadius;
      const startY = y + Math.sin(angle) * startRadius;

      const endRadius = size * (0.8 + wave);
      const endX = x + Math.cos(angle) * endRadius;
      const endY = y + Math.sin(angle) * endRadius;

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  private drawTrail(ctx: CanvasRenderingContext2D) {
    this.trailPoints.forEach((point, index) => {
      const sizeFade = point.opacity;
      const size = point.size * sizeFade;

      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        size
      );

      gradient.addColorStop(
        0,
        hexToRgba(this.config.coreColor, 0.8 * point.opacity)
      );
      gradient.addColorStop(
        0.6,
        hexToRgba(this.config.outerColor, 0.4 * point.opacity)
      );
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  render(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number
  ) {
    this.animationTime++;
    this.updateTrail();

    this.drawTrail(ctx);
    this.drawVolumetricGlow(ctx, x, y, size);
    this.drawElectricEdges(ctx, x, y, size);
    this.drawPlasmaCore(ctx, x, y, size);

    ctx.globalAlpha = 0.3;
    this.drawVolumetricGlow(ctx, x, y, size * 1.2);
    ctx.globalAlpha = 1;
  }
}

const renderers = new Map<string, EnergyBeamRenderer>();

export function getOrCreateBeamRenderer(
  id: string,
  config?: Partial<EnergyBeamConfig>
): EnergyBeamRenderer {
  if (!renderers.has(id)) {
    renderers.set(id, new EnergyBeamRenderer(config ? { ...DEFAULT_CONFIG, ...config } : DEFAULT_CONFIG));
  }
  return renderers.get(id)!;
}

export function removeBeamRenderer(id: string) {
  renderers.delete(id);
}

export function renderEnergyBeams(
  canvas: Canvas,
  config: Partial<EnergyBeamConfig> = {}
) {
  const ctx = canvas.contextContainer;
  if (!ctx) return;

  const activeObjects = canvas.getActiveObjects();

  activeObjects.forEach((obj) => {
    const data = obj.get("data") as { id?: string; type?: string } | undefined;
    if (!data?.id || data.type !== "parcel") return;

    const renderer = getOrCreateBeamRenderer(data.id, {
      ...DEFAULT_CONFIG,
      ...config,
    });

    const { left = 0, top = 0, width = 100, height = 100 } = obj;
    const centerX = left + width / 2;
    const centerY = top + height / 100;
    const beamSize = Math.max(width, height) * 0.5;

    if (Math.random() > 0.5) {
      const offsetX = (Math.random() - 0.5) * width * 0.3;
      const offsetY = (Math.random() - 0.5) * height * 0.3;
      renderer.addTrailPoint(centerX + offsetX, centerY + offsetY);
    }

    renderer.render(ctx, centerX, centerY, beamSize);
  });
}

// ─── SABER GLOW RENDERER FOR PENCIL PATHS ────────────────────────────────

export type SaberGlowConfig = {
  color: string;
  coreWidth: number;
  glowRadius: number;
  intensity: number;
  flickerSpeed: number;
  pulseSpeed: number;
  enableFlicker: boolean;
  enablePulse: boolean;
};

const DEFAULT_SABER_CONFIG: SaberGlowConfig = {
  color: "#00d4ff",
  coreWidth: 4,
  glowRadius: 25,
  intensity: 8,
  flickerSpeed: 5,
  pulseSpeed: 5,
  enableFlicker: true,
  enablePulse: true,
};

class SaberGlowRenderer {
  private animationTime = 0;

  constructor(private config: SaberGlowConfig = DEFAULT_SABER_CONFIG) {}

  updateConfig(partial: Partial<SaberGlowConfig>) {
    this.config = { ...this.config, ...partial };
  }

  renderPathGlow(ctx: CanvasRenderingContext2D, pathData: unknown, pathBounds: { left: number; top: number; width: number; height: number }) {
    this.animationTime++;

    const time = this.animationTime * 0.016;
    const { color, glowRadius, intensity, enableFlicker, enablePulse, flickerSpeed, pulseSpeed } = this.config;

    const flicker = enableFlicker
      ? 0.85 + 0.15 * Math.sin(time * flickerSpeed * 0.5) * Math.random()
      : 1;

    const pulse = enablePulse
      ? 1 + 0.15 * Math.sin(time * pulseSpeed * 0.3)
      : 1;

    const alpha = (intensity / 10) * flicker * pulse;
    const currentGlowRadius = glowRadius * pulse;

    ctx.save();
    ctx.translate(pathBounds.left, pathBounds.top);

    // Draw glow effect using shadow for bloom effect
    ctx.strokeStyle = hexToRgba(color, alpha);
    ctx.lineWidth = this.config.coreWidth + currentGlowRadius;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = hexToRgba(color, alpha);
    ctx.shadowBlur = currentGlowRadius;

    // Use beginPath + custom path drawing for fabric Path data
    if (typeof pathData === "string") {
      ctx.beginPath();
      const cmds = pathData.slice(1, -1).split(",");
      for (let i = 0; i < cmds.length; i += 3) {
        const cmd = cmds[i].trim().replace(/"/g, "");
        const x = parseFloat(cmds[i + 1]);
        const y = parseFloat(cmds[i + 2]);
        if (cmd === "M") ctx.moveTo(x, y);
        else if (cmd === "L") ctx.lineTo(x, y);
        else if (cmd === "Q") {
          const x1 = parseFloat(cmds[i + 1]);
          const y1 = parseFloat(cmds[i + 2]);
          const x2 = parseFloat(cmds[i + 3]);
          const y2 = parseFloat(cmds[i + 4]);
          ctx.quadraticCurveTo(x1, y1, x2, y2);
          i += 2;
        }
      }
      ctx.stroke();
    }

    // Reset shadow and draw white core
    ctx.shadowBlur = 0;
    ctx.strokeStyle = hexToRgba("#ffffff", alpha * 0.9);
    ctx.lineWidth = this.config.coreWidth;
    ctx.globalAlpha = alpha * 0.9;

    if (typeof pathData === "string") {
      ctx.beginPath();
      const cmds = pathData.slice(1, -1).split(",");
      for (let i = 0; i < cmds.length; i += 3) {
        const cmd = cmds[i].trim().replace(/"/g, "");
        const x = parseFloat(cmds[i + 1]);
        const y = parseFloat(cmds[i + 2]);
        if (cmd === "M") ctx.moveTo(x, y);
        else if (cmd === "L") ctx.lineTo(x, y);
        else if (cmd === "Q") {
          const x1 = parseFloat(cmds[i + 1]);
          const y1 = parseFloat(cmds[i + 2]);
          const x2 = parseFloat(cmds[i + 3]);
          const y2 = parseFloat(cmds[i + 4]);
          ctx.quadraticCurveTo(x1, y1, x2, y2);
          i += 2;
        }
      }
      ctx.stroke();
    }

    // Colored core
    ctx.strokeStyle = hexToRgba(color, alpha * 0.7);
    ctx.lineWidth = this.config.coreWidth * 0.6;
    ctx.globalAlpha = alpha * 0.7;

    if (typeof pathData === "string") {
      ctx.beginPath();
      const cmds = pathData.slice(1, -1).split(",");
      for (let i = 0; i < cmds.length; i += 3) {
        const cmd = cmds[i].trim().replace(/"/g, "");
        const x = parseFloat(cmds[i + 1]);
        const y = parseFloat(cmds[i + 2]);
        if (cmd === "M") ctx.moveTo(x, y);
        else if (cmd === "L") ctx.lineTo(x, y);
        else if (cmd === "Q") {
          const x1 = parseFloat(cmds[i + 1]);
          const y1 = parseFloat(cmds[i + 2]);
          const x2 = parseFloat(cmds[i + 3]);
          const y2 = parseFloat(cmds[i + 4]);
          ctx.quadraticCurveTo(x1, y1, x2, y2);
          i += 2;
        }
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}

const saberRenderers = new Map<string, SaberGlowRenderer>();

export function getOrCreateSaberRenderer(
  id: string,
  config?: Partial<SaberGlowConfig>
): SaberGlowRenderer {
  if (!saberRenderers.has(id)) {
    saberRenderers.set(id, new SaberGlowRenderer(config ? { ...DEFAULT_SABER_CONFIG, ...config } : DEFAULT_SABER_CONFIG));
  }
  return saberRenderers.get(id)!;
}

export function removeSaberRenderer(id: string) {
  saberRenderers.delete(id);
}

export function renderSaberGlow(
  canvas: Canvas,
  config: Partial<SaberGlowConfig> = {}
) {
  const ctx = canvas.contextContainer;
  if (!ctx) return;

  const objects = canvas.getObjects();

  objects.forEach((obj) => {
    const data = obj.get("data") as { type?: string; id?: string } | undefined;

    if (data?.type !== "drawing" && data?.type !== "shape") return;
    if (!data?.id) return;

    const renderer = getOrCreateSaberRenderer(data.id, {
      ...DEFAULT_SABER_CONFIG,
      ...config,
    });

    const pathData = (obj as FabricObject).toJSON().path;

    if (!pathData) return;

    const bounds = {
      left: (obj.left ?? 0),
      top: (obj.top ?? 0),
      width: (obj.width ?? 100),
      height: (obj.height ?? 100),
    };

    renderer.renderPathGlow(ctx, pathData, bounds);
  });
}