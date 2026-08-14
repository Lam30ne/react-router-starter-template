export type RhythmPresetId = "slower" | "steady" | "faster";
export type CycleShape = "longer-release" | "balanced";

export interface RhythmPreset {
  readonly label: string;
  readonly bpm: number;
  readonly hz: number;
  readonly cycleDurationMs: number;
}

export const RHYTHM_PRESETS = {
  slower: {
    label: "Slower",
    bpm: 5.1,
    hz: 5.1 / 60,
    cycleDurationMs: (60 / 5.1) * 1000,
  },
  steady: {
    label: "Steady",
    bpm: 5.7,
    hz: 5.7 / 60,
    cycleDurationMs: (60 / 5.7) * 1000,
  },
  faster: {
    label: "Faster",
    bpm: 6.1,
    hz: 6.1 / 60,
    cycleDurationMs: (60 / 6.1) * 1000,
  },
} as const satisfies Record<RhythmPresetId, RhythmPreset>;

export function getBreathHz(preset: RhythmPresetId): number {
  return RHYTHM_PRESETS[preset].hz;
}

export function getBreathPhase(elapsedMs: number, hz: number): number {
  const elapsedSeconds = elapsedMs / 1000;
  return 0.5 + 0.5 * Math.sin(elapsedSeconds * Math.PI * 2 * hz);
}

export function getShapedBreathPhase(
  elapsedMs: number,
  hz: number,
  shape: CycleShape,
): number {
  if (shape === "balanced") {
    return getBreathPhase(elapsedMs, hz);
  }

  const cycleDuration = 1 / hz;
  const elapsedSeconds = elapsedMs / 1000;
  const cyclePosition =
    ((elapsedSeconds % cycleDuration) + cycleDuration) % cycleDuration;
  const t = cyclePosition / cycleDuration;

  const riseFraction = 0.4;

  if (t < riseFraction) {
    return 0.5 - 0.5 * Math.cos((Math.PI * t) / riseFraction);
  }
  return 0.5 + 0.5 * Math.cos((Math.PI * (t - riseFraction)) / (1 - riseFraction));
}

export function getBreathPulse(phase: number): number {
  return 0.85 + phase * 0.15;
}

export function getCycleDurationMs(hz: number): number {
  return 1000 / hz;
}
