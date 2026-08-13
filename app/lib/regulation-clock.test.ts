import { describe, it, expect } from "vitest";
import {
  RHYTHM_PRESETS,
  getBreathHz,
  getBreathPhase,
  getBreathPulse,
  getCycleDurationMs,
} from "./regulation-clock";

describe("RHYTHM_PRESETS", () => {
  it("has three presets with correct bpm values", () => {
    expect(RHYTHM_PRESETS.slower.bpm).toBe(5.1);
    expect(RHYTHM_PRESETS.steady.bpm).toBe(5.7);
    expect(RHYTHM_PRESETS.faster.bpm).toBe(6.1);
  });

  it("computes hz from bpm", () => {
    expect(RHYTHM_PRESETS.slower.hz).toBeCloseTo(5.1 / 60, 6);
    expect(RHYTHM_PRESETS.steady.hz).toBeCloseTo(5.7 / 60, 6);
    expect(RHYTHM_PRESETS.faster.hz).toBeCloseTo(6.1 / 60, 6);
  });

  it("computes cycle duration from bpm", () => {
    expect(RHYTHM_PRESETS.steady.cycleDurationMs).toBeCloseTo((60 / 5.7) * 1000, 1);
  });
});

describe("getBreathHz", () => {
  it("returns correct hz for each preset", () => {
    expect(getBreathHz("slower")).toBeCloseTo(5.1 / 60, 6);
    expect(getBreathHz("steady")).toBeCloseTo(5.7 / 60, 6);
    expect(getBreathHz("faster")).toBeCloseTo(6.1 / 60, 6);
  });
});

describe("getBreathPhase", () => {
  it("returns 0.5 at t=0", () => {
    expect(getBreathPhase(0, 0.095)).toBe(0.5);
  });

  it("peaks at quarter cycle", () => {
    const hz = 0.095;
    const quarterCycleMs = (1 / hz / 4) * 1000;
    expect(getBreathPhase(quarterCycleMs, hz)).toBeCloseTo(1.0, 5);
  });

  it("returns to 0.5 at half cycle", () => {
    const hz = 0.095;
    const halfCycleMs = (1 / hz / 2) * 1000;
    expect(getBreathPhase(halfCycleMs, hz)).toBeCloseTo(0.5, 5);
  });

  it("reaches minimum at three-quarter cycle", () => {
    const hz = 0.095;
    const threeQuarterMs = ((1 / hz) * 3 / 4) * 1000;
    expect(getBreathPhase(threeQuarterMs, hz)).toBeCloseTo(0.0, 5);
  });

  it("is periodic", () => {
    const hz = 0.095;
    const cycleMs = (1 / hz) * 1000;
    const t = 2345;
    expect(getBreathPhase(t, hz)).toBeCloseTo(getBreathPhase(t + cycleMs, hz), 5);
  });

  it("stays within 0..1 range", () => {
    const hz = 0.095;
    for (let t = 0; t < 100_000; t += 100) {
      const phase = getBreathPhase(t, hz);
      expect(phase).toBeGreaterThanOrEqual(0);
      expect(phase).toBeLessThanOrEqual(1);
    }
  });
});

describe("getBreathPulse", () => {
  it("returns 0.85 at phase 0", () => {
    expect(getBreathPulse(0)).toBe(0.85);
  });

  it("returns 1.0 at phase 1", () => {
    expect(getBreathPulse(1)).toBe(1.0);
  });

  it("returns midpoint at phase 0.5", () => {
    expect(getBreathPulse(0.5)).toBeCloseTo(0.925, 5);
  });
});

describe("getCycleDurationMs", () => {
  it("returns correct duration for default hz", () => {
    const hz = 5.7 / 60;
    expect(getCycleDurationMs(hz)).toBeCloseTo((60 / 5.7) * 1000, 1);
  });
});
