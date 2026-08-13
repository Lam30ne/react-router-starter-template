import { describe, it, expect, beforeEach } from "vitest";
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from "./settings";

beforeEach(() => {
  localStorage.clear();
});

describe("loadSettings", () => {
  it("returns defaults when localStorage is empty", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("returns defaults when stored value is invalid JSON", () => {
    localStorage.setItem("regulate-settings", "not json");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("returns defaults when stored value is null", () => {
    localStorage.setItem("regulate-settings", "null");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("merges partial saved data with defaults", () => {
    localStorage.setItem("regulate-settings", JSON.stringify({ volume: 0.3 }));
    const result = loadSettings();
    expect(result.volume).toBe(0.3);
    expect(result.brightness).toBe(DEFAULT_SETTINGS.brightness);
    expect(result.soundscape).toBe(DEFAULT_SETTINGS.soundscape);
  });

  it("ignores invalid field values", () => {
    localStorage.setItem(
      "regulate-settings",
      JSON.stringify({ soundscape: "invalid", volume: -5, binauralEnabled: "yes" }),
    );
    const result = loadSettings();
    expect(result.soundscape).toBe(DEFAULT_SETTINGS.soundscape);
    expect(result.volume).toBe(DEFAULT_SETTINGS.volume);
    expect(result.binauralEnabled).toBe(DEFAULT_SETTINGS.binauralEnabled);
  });

  it("loads all valid fields correctly", () => {
    const custom = {
      rhythmPreset: "slower" as const,
      binauralEnabled: false,
      experienceMode: "audio-only" as const,
      motionPreference: "reduced" as const,
      keepControlsVisible: true,
      volume: 0.5,
      brightness: 0.3,
      soundscape: "drift" as const,
    };
    localStorage.setItem("regulate-settings", JSON.stringify(custom));
    expect(loadSettings()).toEqual(custom);
  });
});

describe("saveSettings / loadSettings round-trip", () => {
  it("persists and retrieves settings", () => {
    const settings = { ...DEFAULT_SETTINGS, volume: 0.42, soundscape: "ground" as const };
    saveSettings(settings);
    expect(loadSettings()).toEqual(settings);
  });
});
