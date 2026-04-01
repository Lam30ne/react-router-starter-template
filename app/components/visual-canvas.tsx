import { useEffect, useRef, useCallback } from "react";
import type { AudioEngine, AudioMode } from "./audio-engine";

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
  time: number;
}

const MODE_PALETTES: Record<AudioMode, { hueRange: [number, number]; saturation: number; brightness: number }> = {
  calm: { hueRange: [200, 260], saturation: 60, brightness: 70 },    // Cool blues/purples
  ground: { hueRange: [20, 60], saturation: 40, brightness: 60 },     // Warm earth tones
  drift: { hueRange: [260, 320], saturation: 50, brightness: 65 },    // Deep purples/magentas
};

export function VisualCanvas({
  audioEngine,
  isPlaying,
  mode,
}: {
  audioEngine: AudioEngine | null;
  isPlaying: boolean;
  mode: AudioMode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const flowFieldRef = useRef<FlowField | null>(null);
  const timeRef = useRef(0);

  const initFlowField = useCallback((width: number, height: number) => {
    const resolution = 20;
    const cols = Math.ceil(width / resolution);
    const rows = Math.ceil(height / resolution);
    flowFieldRef.current = {
      cols,
      rows,
      resolution,
      field: new Array(cols * rows).fill(0),
      time: 0,
    };
  }, []);

  const createParticle = useCallback((width: number, height: number, palette: typeof MODE_PALETTES.calm): Particle => {
    const hue = palette.hueRange[0] + Math.random() * (palette.hueRange[1] - palette.hueRange[0]);
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
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initFlowField(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles
    const palette = MODE_PALETTES[mode];
    const particleCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 5000));
    particlesRef.current = Array.from({ length: particleCount }, () =>
      createParticle(canvas.width, canvas.height, palette)
    );

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const ff = flowFieldRef.current;
      const particles = particlesRef.current;
      const pal = MODE_PALETTES[mode];
      timeRef.current += 0.003;
      const t = timeRef.current;

      // Audio reactivity
      let audioLevel = 0;
      if (audioEngine && isPlaying) {
        audioLevel = audioEngine.getAverageFrequency();
      }

      // Semi-transparent overlay for trails
      ctx.fillStyle = `rgba(5, 5, 15, ${0.06 + audioLevel * 0.02})`;
      ctx.fillRect(0, 0, w, h);

      // Update flow field
      if (ff) {
        ff.time = t;
        for (let y = 0; y < ff.rows; y++) {
          for (let x = 0; x < ff.cols; x++) {
            const idx = y * ff.cols + x;
            const nx = x * 0.02 + t * 0.5;
            const ny = y * 0.02 + t * 0.3;
            // Perlin-like noise approximation using sine combinations
            ff.field[idx] =
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

        // Fade in/out
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.1) {
          p.alpha = lifeRatio / 0.1;
        } else if (lifeRatio > 0.85) {
          p.alpha = (1 - lifeRatio) / 0.15;
        } else {
          p.alpha = 1;
        }

        // Flow field influence
        if (ff) {
          const col = Math.floor(p.x / ff.resolution);
          const row = Math.floor(p.y / ff.resolution);
          if (col >= 0 && col < ff.cols && row >= 0 && row < ff.rows) {
            const angle = ff.field[row * ff.cols + col];
            p.vx += Math.cos(angle) * 0.15;
            p.vy += Math.sin(angle) * 0.15;
          }
        }

        // Damping
        p.vx *= 0.96;
        p.vy *= 0.96;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Reset dead particles
        if (p.life >= p.maxLife) {
          const newP = createParticle(w, h, pal);
          particles[i] = newP;
          continue;
        }

        // Draw
        const effectiveAlpha = p.alpha * (0.4 + audioLevel * 0.6);
        const effectiveRadius = p.radius * (1 + audioLevel * 1.5);

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, effectiveRadius * 4);
        gradient.addColorStop(0, `hsla(${p.hue}, ${pal.saturation}%, ${pal.brightness}%, ${effectiveAlpha * 0.8})`);
        gradient.addColorStop(0.5, `hsla(${p.hue}, ${pal.saturation}%, ${pal.brightness}%, ${effectiveAlpha * 0.2})`);
        gradient.addColorStop(1, `hsla(${p.hue}, ${pal.saturation}%, ${pal.brightness}%, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, effectiveRadius * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, effectiveRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${pal.saturation - 10}%, ${pal.brightness + 20}%, ${effectiveAlpha})`;
        ctx.fill();
      }

      // Slow aurora/nebula overlay
      drawAurora(ctx, w, h, t, pal, audioLevel);

      // Central breathing circle
      if (isPlaying) {
        drawBreathingCircle(ctx, w, h, t, pal, audioLevel);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, mode, audioEngine, initFlowField, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ background: "#05050f" }}
    />
  );
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  palette: typeof MODE_PALETTES.calm,
  audioLevel: number,
) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.04 + audioLevel * 0.03;

  for (let i = 0; i < 3; i++) {
    const yBase = h * (0.3 + i * 0.15);
    const hue = palette.hueRange[0] + (palette.hueRange[1] - palette.hueRange[0]) * (i / 3);

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
  w: number,
  h: number,
  t: number,
  palette: typeof MODE_PALETTES.calm,
  audioLevel: number,
) {
  const cx = w / 2;
  const cy = h / 2;

  // Breathing rhythm ~6 breaths per minute
  const breathPhase = Math.sin(t * 3.14); // ~6 BPM
  const baseRadius = Math.min(w, h) * 0.08;
  const radius = baseRadius * (0.8 + breathPhase * 0.2 + audioLevel * 0.3);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  // Outer glow
  const outerGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 3);
  const hue = (palette.hueRange[0] + palette.hueRange[1]) / 2;
  outerGrad.addColorStop(0, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, ${0.06 + audioLevel * 0.04})`);
  outerGrad.addColorStop(0.5, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, ${0.02 + audioLevel * 0.02})`);
  outerGrad.addColorStop(1, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, 0)`);

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 3, 0, Math.PI * 2);
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // Inner core
  const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  innerGrad.addColorStop(0, `hsla(${hue}, ${palette.saturation - 20}%, ${palette.brightness + 20}%, ${0.15 + audioLevel * 0.1})`);
  innerGrad.addColorStop(0.7, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, ${0.05 + audioLevel * 0.05})`);
  innerGrad.addColorStop(1, `hsla(${hue}, ${palette.saturation}%, ${palette.brightness}%, 0)`);

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = innerGrad;
  ctx.fill();

  ctx.restore();
}
