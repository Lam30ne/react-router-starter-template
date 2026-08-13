import { useState, useEffect, useCallback } from "react";
import type { RhythmPresetId } from "./regulation-clock";

export type SoundscapeId = "calm" | "ground" | "drift";
export type ExperienceMode = "audio-visuals" | "audio-only" | "visuals-only";
export type MotionPreference = "system" | "full" | "reduced" | "static";

export interface UserSettings {
  rhythmPreset: RhythmPresetId;
  binauralEnabled: boolean;
  experienceMode: ExperienceMode;
  motionPreference: MotionPreference;
  keepControlsVisible: boolean;
  volume: number;
  brightness: number;
  soundscape: SoundscapeId;
}

const STORAGE_KEY = "regulate-settings";

export const DEFAULT_SETTINGS: UserSettings = {
  rhythmPreset: "steady",
  binauralEnabled: true,
  experienceMode: "audio-visuals",
  motionPreference: "system",
  keepControlsVisible: false,
  volume: 0.7,
  brightness: 0.7,
  soundscape: "calm",
};

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { ...DEFAULT_SETTINGS };
    return {
      rhythmPreset: isValidPreset(parsed.rhythmPreset) ? parsed.rhythmPreset : DEFAULT_SETTINGS.rhythmPreset,
      binauralEnabled: typeof parsed.binauralEnabled === "boolean" ? parsed.binauralEnabled : DEFAULT_SETTINGS.binauralEnabled,
      experienceMode: isValidExperience(parsed.experienceMode) ? parsed.experienceMode : DEFAULT_SETTINGS.experienceMode,
      motionPreference: isValidMotion(parsed.motionPreference) ? parsed.motionPreference : DEFAULT_SETTINGS.motionPreference,
      keepControlsVisible: typeof parsed.keepControlsVisible === "boolean" ? parsed.keepControlsVisible : DEFAULT_SETTINGS.keepControlsVisible,
      volume: isValidNumber(parsed.volume) ? parsed.volume : DEFAULT_SETTINGS.volume,
      brightness: isValidNumber(parsed.brightness) ? parsed.brightness : DEFAULT_SETTINGS.brightness,
      soundscape: isValidSoundscape(parsed.soundscape) ? parsed.soundscape : DEFAULT_SETTINGS.soundscape,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage may be unavailable
  }
}

function isValidPreset(v: unknown): v is RhythmPresetId {
  return v === "slower" || v === "steady" || v === "faster";
}

function isValidSoundscape(v: unknown): v is SoundscapeId {
  return v === "calm" || v === "ground" || v === "drift";
}

function isValidExperience(v: unknown): v is ExperienceMode {
  return v === "audio-visuals" || v === "audio-only" || v === "visuals-only";
}

function isValidMotion(v: unknown): v is MotionPreference {
  return v === "system" || v === "full" || v === "reduced" || v === "static";
}

function isValidNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 1;
}

export function useSettings(): [UserSettings, (update: Partial<UserSettings>) => void] {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  const updateSettings = useCallback((update: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...update };
      saveSettings(next);
      return next;
    });
  }, []);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  return [settings, updateSettings];
}
