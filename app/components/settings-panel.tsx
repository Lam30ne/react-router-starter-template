import { useEffect, useRef } from "react";
import type { UserSettings } from "../lib/settings";
import { RHYTHM_PRESETS, type RhythmPresetId } from "../lib/regulation-clock";

interface SettingsPanelProps {
  settings: UserSettings;
  onUpdate: (update: Partial<UserSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ settings, onUpdate, isOpen, onClose }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [tabindex]:not([tabindex="-1"]), input, select',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    panel.addEventListener("keydown", trap);
    return () => panel.removeEventListener("keydown", trap);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Settings"
        aria-modal="true"
        className="relative w-full max-w-md rounded-t-2xl bg-[#1a1410] border-t border-amber-200/10 p-6 pb-8 space-y-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-amber-100/70 text-sm font-light tracking-wider uppercase">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-amber-100/50 hover:text-amber-100/80 hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
            aria-label="Close settings"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        {/* Rhythm */}
        <fieldset>
          <legend className="text-amber-100/50 text-xs tracking-wider uppercase mb-2">Rhythm</legend>
          <div className="flex gap-2">
            {(Object.keys(RHYTHM_PRESETS) as RhythmPresetId[]).map((id) => (
              <button
                key={id}
                onClick={() => onUpdate({ rhythmPreset: id })}
                aria-pressed={settings.rhythmPreset === id}
                className={`flex-1 min-h-[44px] px-3 py-2 rounded-full text-xs tracking-wider transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
                  settings.rhythmPreset === id
                    ? "bg-amber-200/12 text-amber-100/80 border border-amber-200/25"
                    : "text-amber-100/40 border border-transparent hover:text-amber-100/60 hover:bg-white/5"
                }`}
              >
                <span className="block">{RHYTHM_PRESETS[id].label}</span>
                <span className="block text-[10px] opacity-60">{RHYTHM_PRESETS[id].bpm} cpm</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Binaural */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-amber-100/60 text-xs tracking-wider">Binaural tones</span>
            <p className="text-amber-100/30 text-[10px] mt-0.5">Headphones recommended</p>
          </div>
          <button
            role="switch"
            aria-checked={settings.binauralEnabled}
            onClick={() => onUpdate({ binauralEnabled: !settings.binauralEnabled })}
            className={`relative w-10 h-6 rounded-full transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
              settings.binauralEnabled ? "bg-amber-200/25" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${
                settings.binauralEnabled ? "left-5 bg-amber-200/70" : "left-1 bg-amber-100/30"
              }`}
            />
          </button>
        </div>

        {/* Experience */}
        <fieldset>
          <legend className="text-amber-100/50 text-xs tracking-wider uppercase mb-2">Experience</legend>
          <div className="flex gap-2">
            {([
              { id: "audio-visuals" as const, label: "Audio + Visuals" },
              { id: "audio-only" as const, label: "Audio only" },
              { id: "visuals-only" as const, label: "Visuals only" },
            ]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onUpdate({ experienceMode: id })}
                aria-pressed={settings.experienceMode === id}
                className={`flex-1 min-h-[44px] px-2 py-2 rounded-full text-[11px] tracking-wider transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
                  settings.experienceMode === id
                    ? "bg-amber-200/12 text-amber-100/80 border border-amber-200/25"
                    : "text-amber-100/40 border border-transparent hover:text-amber-100/60 hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Motion */}
        <fieldset>
          <legend className="text-amber-100/50 text-xs tracking-wider uppercase mb-2">Motion</legend>
          <div className="flex gap-2">
            {([
              { id: "system" as const, label: "System" },
              { id: "full" as const, label: "Full" },
              { id: "reduced" as const, label: "Reduced" },
              { id: "static" as const, label: "Static" },
            ]).map(({ id, label }) => (
              <button
                key={id}
                onClick={() => onUpdate({ motionPreference: id })}
                aria-pressed={settings.motionPreference === id}
                className={`flex-1 min-h-[44px] px-2 py-2 rounded-full text-[11px] tracking-wider transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
                  settings.motionPreference === id
                    ? "bg-amber-200/12 text-amber-100/80 border border-amber-200/25"
                    : "text-amber-100/40 border border-transparent hover:text-amber-100/60 hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Keep controls visible */}
        <div className="flex items-center justify-between">
          <span className="text-amber-100/60 text-xs tracking-wider">Keep controls visible</span>
          <button
            role="switch"
            aria-checked={settings.keepControlsVisible}
            onClick={() => onUpdate({ keepControlsVisible: !settings.keepControlsVisible })}
            className={`relative w-10 h-6 rounded-full transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
              settings.keepControlsVisible ? "bg-amber-200/25" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${
                settings.keepControlsVisible ? "left-5 bg-amber-200/70" : "left-1 bg-amber-100/30"
              }`}
            />
          </button>
        </div>

        {/* General wellness note */}
        <p className="text-amber-100/20 text-[10px] text-center pt-2 border-t border-amber-200/5">
          Regulate is a general wellness tool, not a medical device.
        </p>
      </div>
    </div>
  );
}
