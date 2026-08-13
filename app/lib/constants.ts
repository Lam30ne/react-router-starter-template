import type { SoundscapeId } from "./settings";

export const RESET_DURATION_MS = 300_000;
export const FADE_IN_MS = 5_000;
export const WIND_DOWN_AT_MS = 255_000;
export const FADE_OUT_AT_MS = 295_000;

export const APP_TITLE = "Regulate";
export const APP_SUBTITLE = "Ambient sound & visuals";

export const SOUNDSCAPE_DESCRIPTIONS: Record<SoundscapeId, string> = {
  calm: "Warm tones for settling",
  ground: "Earthy tones for presence",
  drift: "Airy tones for drifting",
};
