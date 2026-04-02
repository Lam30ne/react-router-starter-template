import { useEffect, useRef } from "react";
import type { AudioEngine, AudioMode } from "./audio-engine";
import { getTimeOfDayShift } from "./time-palette";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FlowField {
  cols: number;
  rows: number;
  resolution: number;
  field: number[];
}

const MODE_PALETTES: Record<
  AudioMode,
  { hueRange: [number, number]; saturation: number; brightness: number }
> = {
  calm: { hueRange: [30, 50], saturation: 55, brightness: 65 },
  ground: { hueRange: [15, 40], saturation: 45, brightness: 55 },
  drift: { hueRange: [25, 55], saturation: 40, brightness: 60 },
};

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || navigator.hardwareConcurrency <= 4;
}

function createParticle(
  width: number,
  height: number,
  palette: (typeof MODE_PALETTES)[AudioMode],
): Particle {
  const hue =
    palette.hueRange[0] +
    Math.random() * (palette.hueRange[1] - palette.hueRange[0]);
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0,
    radius: 1 + Math.random() * 2.5,
    hue,
    alpha: 0,
    life: 0,
    maxLife: 300 + Math.random() * 500,
  };
}

export function VisualCanvas({
  audioEngine,
  isPlaying,
  mode,
  brightness = 0.7,
}: {
  audioEngine: AudioEngine | null;
  isPlaying: boolean;
  mode: AudioMode;
  brightness?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Store props in refs so animation loop always reads current values
  const audioRef = useRef(audioEngine);
  const isPlayingRef = useRef(isPlaying);
  const modeRef = useRef(mode);
  const brightnessRef = useRef(brightness);

  // Update refs when props change
  audioRef.current = audioEngine;
  isPlayingRef.current = isPlaying;
  brightnessRef.current = brightness;

  // When mode changes, update ref and request particle refresh
  const particleRefreshRef = useRef(false);
  const prevModeRef = useRef(mode);
  if (mode !== prevModeRef.current) {
    prevModeRef.current = mode;
    modeRef.current = mode;
    particleRefreshRef.current = true;
  }

  // Single animation loop — created once, torn down on unmount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const mobile = isMobile();
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const skipAurora = mobile || reducedMotion;
    const flowResolution = mobile ? 30 : 20;

    let flowField: FlowField | null = null;
    let particles: Particle[] = [];
    let startTime = performance.now();
    let timeShift = getTimeOfDayShift();
    let frameCount = 0;
    const glowCache = new Map<string, HTMLCanvasElement>();

    const initFlowField = (w: number, h: number) => {
      const cols = Math.ceil(w / flowResolution);
      const rows = Math.ceil(h / flowResolution);
      flowField = { cols, rows, resolution: flowResolution, field: new Array(cols * rows).fill(0) };
    };

    const initParticles = (w: number, h: number) => {
      const palette = MODE_PALETTES[modeRef.current];
      const fullCount = Math.min(200, Math.floor((w * h) / 5000));
      const count = reducedMotion ? Math.min(30, fullCount) : mobile ? Math.min(80, fullCount) : fullCount;
      particles = Array.from({ length: count }, () => createParticle(w, h, palette));
      glowCache.clear();
      startTime = performance.now();
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFlowField(canvas.width, canvas.height);
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const getGlowSprite = (
      radius: number, hue: number, saturation: number,
      brightnessVal: number, alpha: number,
    ): HTMLCanvasElement => {
      const qRadius = Math.round(radius);
      const qHue = Math.round(hue / 5) * 5;
      const qBrightness = Math.round(brightnessVal);
      const qAlpha = Math.round(alpha * 10) / 10;
      const key = `${qRadius}-${qHue}-${saturation}-${qBrightness}-${qAlpha}`;

      const cached = glowCache.get(key);
      if (cached) return cached;

      const size = qRadius * 8 + 2;
      const offscreen = document.createElement("canvas");
      offscreen.width = size;
      offscreen.height = size;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return offscreen;

      const cx = size / 2;
      const gradient = offCtx.createRadialGradient(cx, cx, 0, cx, cx, qRadius * 4);
      gradient.addColorStop(0, `hsla(${qHue}, ${saturation}%, ${brightnessVal}%, ${qAlpha * 0.8})`);
      gradient.addColorStop(0.5, `hsla(${qHue}, ${saturation}%, ${brightnessVal}%, ${qAlpha * 0.2})`);
      gradient.addColorStop(1, `hsla(${qHue}, ${saturation}%, ${brightnessVal}%, 0)`);

      offCtx.beginPath();
      offCtx.arc(cx, cx, qRadius * 4, 0, Math.PI * 2);
      offCtx.fillStyle = gradient;
      offCtx.fill();

      offCtx.beginPath();
      offCtx.arc(cx, cx, qRadius, 0, Math.PI * 2);
      offCtx.fillStyle = `hsla(${qHue}, ${saturation - 10}%, ${brightnessVal + 20}%, ${qAlpha})`;
      offCtx.fill();

      glowCache.set(key, offscreen);
      return offscreen;
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const curMode = modeRef.current;
      const curBrightness = brightnessRef.current;
      const curPlaying = isPlayingRef.current;
      const curAudio = audioRef.current;

      // Refresh particles on mode change
      if (particleRefreshRef.current) {
        particleRefreshRef.current = false;
        const palette = MODE_PALETTES[curMode];
        for (let i = 0; i < particles.length; i++) {
          if (particles[i].life > particles[i].maxLife * 0.5) {
            particles[i] = createParticle(w, h, palette);
          }
        }
        glowCache.clear();
      }

      // Refresh time-of-day shift every ~60s
      frameCount++;
      if (frameCount % 3600 === 0) {
        timeShift = getTimeOfDayShift();
      }

      const basePal = MODE_PALETTES[curMode];
      const pal = {
        hueRange: [
          basePal.hueRange[0] + timeShift.hueShift,
          basePal.hueRange[1] + timeShift.hueShift,
        ] as [number, number],
        saturation: Math.round(basePal.saturation * timeShift.saturationMult),
        brightness: Math.round(basePal.brightness * timeShift.brightnessMult),
      };

      const elapsedSeconds = (performance.now() - startTime) / 1000;
      const t = elapsedSeconds * (reducedMotion ? 0.03 : 0.15);

      let audioLevel = 0;
      if (curAudio && curPlaying) {
        audioLevel = curAudio.getAverageFrequency();
      }

      // Trail fade
      ctx.fillStyle = `rgba(15, 10, 5, ${0.06 + audioLevel * 0.02})`;
      ctx.fillRect(0, 0, w, h);

      const centerX = w / 2;
      const centerY = h / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

      // Update flow field (every 2nd frame on mobile)
      if (flowField && (!mobile || frameCount % 2 === 0)) {
        for (let y = 0; y < flowField.rows; y++) {
          for (let x = 0; x < flowField.cols; x++) {
            const idx = y * flowField.cols + x;
            const nx = x * 0.02 + t * 0.5;
            const ny = y * 0.02 + t * 0.3;
            flowField.field[idx] =
              Math.sin(nx * 1.5 + ny * 0.8) * 2 +
              Math.sin(nx * 0.7 - ny * 1.3 + t) * 1.5 +
              Math.cos(nx * 0.5 + ny * 0.5 + t * 0.7) * 1 +
              audioLevel * Math.sin(t * 3 + x * 0.1) * 0.5;
          }
        }
      }

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.1) {
          p.alpha = lifeRatio / 0.1;
        } else if (lifeRatio > 0.85) {
          p.alpha = (1 - lifeRatio) / 0.15;
        } else {
          p.alpha = 1;
        }

        if (flowField) {
          const col = Math.floor(p.x / flowField.resolution);
          const row = Math.floor(p.y / flowField.resolution);
          if (col >= 0 && col < flowField.cols && row >= 0 && row < flowField.rows) {
            const angle = flowField.field[row * flowField.cols + col];
            p.vx += Math.cos(angle) * 0.15;
            p.vy += Math.sin(angle) * 0.15;
          }
        }

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        if (p.life >= p.maxLife) {
          particles[i] = createParticle(w, h, pal);
          continue;
        }

        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        const horizonFactor = 1 - (distFromCenter / maxDist) * 0.6;

        const effectiveAlpha =
          p.alpha * (0.4 + audioLevel * 0.6) * horizonFactor * curBrightness;
        const effectiveRadius = p.radius * (1 + audioLevel * 1.5);
        const effectiveSaturation = Math.round(
          pal.saturation * (0.7 + horizonFactor * 0.3),
        );

        const sprite = getGlowSprite(
          effectiveRadius,
          p.hue + timeShift.hueShift,
          effectiveSaturation,
          pal.brightness,
          effectiveAlpha,
        );
        ctx.drawImage(sprite, p.x - sprite.width / 2, p.y - sprite.height / 2);
      }

      // Aurora — skip on mobile and reduced motion
      if (!skipAurora) {
        drawAurora(ctx, w, h, t, pal, audioLevel, curBrightness);
      }

      // Breathing circle
      if (curPlaying) {
        drawBreathingCircle(
          ctx, w, h, elapsedSeconds, pal,
          reducedMotion ? 0 : audioLevel,
          curBrightness,
        );
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Created once, reads from refs

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: "#0f0a05" }}
      role="img"
      aria-label="Ambient visualization with flowing particles and a breathing circle"
    />
  );
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, t: number,
  palette: { hueRange: [number, number]; saturation: number; brightness: number },
  audioLevel: number,
  brightnessMultiplier: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = (0.04 + audioLevel * 0.03) * brightnessMultiplier;

  for (let i = 0; i < 3; i++) {
    const yBase = h * (0.3 + i * 0.15);
    const hue =
      palette.hueRange[0] +
      ((palette.hueRange[1] - palette.hueRange[0]) * i) / 3;

    ctx.beginPath();
    ctx.moveTo(0, yBase);

    for (let x = 0; x <= w; x += 10) {
      const y =
        yBase +
        Math.sin(x * 0.003 + t * (0.4 + i * 0.1)) * 60 +
        Math.sin(x * 0.007 - t * 0.3) * 30 +
        Math.cos(x * 0.001 + t * 0.2) * 40 * (1 + audioLevel);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, yBase - 100, 0, yBase + 200);
    grad.addColorStop(0, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, 0)`);
    grad.addColorStop(0.3, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, 0.3)`);
    grad.addColorStop(1, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, 0)`);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.restore();
}

function drawBreathingCircle(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, elapsedSeconds: number,
  palette: { hueRange: [number, number]; saturation: number; brightness: number },
  audioLevel: number,
  brightnessMultiplier: number,
) {
  const cx = w / 2;
  const cy = h / 2;

  const BREATHS_PER_MINUTE = 5.5;
  const breathPhase = Math.sin(
    elapsedSeconds * ((2 * Math.PI * BREATHS_PER_MINUTE) / 60),
  );

  const baseRadius = Math.min(w, h) * 0.08;
  const radius = baseRadius * (0.8 + breathPhase * 0.2 + audioLevel * 0.3);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const hue = (palette.hueRange[0] + palette.hueRange[1]) / 2;

  const outerGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 3);
  const outerAlpha = (0.06 + audioLevel * 0.04) * brightnessMultiplier;
  outerGrad.addColorStop(0, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, ${outerAlpha})`);
  outerGrad.addColorStop(0.5, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, ${outerAlpha * 0.33})`);
  outerGrad.addColorStop(1, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, 0)`);

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
  ctx.fillStyle = outerGrad;
  ctx.fill();

  const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  const innerAlpha = (0.15 + audioLevel * 0.1) * brightnessMultiplier;
  innerGrad.addColorStop(0, `hsla(${hue}, ${palette.saturation - 20}%, ${palette.brightness + 20}%, ${innerAlpha})`);
  innerGrad.addColorStop(0.7, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, ${innerAlpha * 0.33})`);
  innerGrad.addColorStop(1, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, 0)`);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();

  ctx.restore();
}
