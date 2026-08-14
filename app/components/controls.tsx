import { SOUNDSCAPES } from "./audio-engine";
import { SOUNDSCAPE_DESCRIPTIONS } from "../lib/constants";
import { SessionIndicator, SessionAnnouncer } from "./session-indicator";
import type { SoundscapeId, Pathway } from "../lib/settings";
import type { SessionState, SessionDuration } from "../lib/session-controller";

export function Controls({
  sessionState,
  sessionType,
  progress,
  soundscape,
  volume,
  brightness,
  pathway,
  onStartReset,
  onStartTenMinuteReset,
  onStartOpen,
  onStop,
  onReplay,
  onSoundscapeChange,
  onVolumeChange,
  onBrightnessChange,
  onPathwayChange,
  onOpenSettings,
}: {
  sessionState: SessionState;
  sessionType: SessionDuration;
  progress: number;
  soundscape: SoundscapeId;
  volume: number;
  brightness: number;
  pathway: Pathway;
  onStartReset: () => void;
  onStartTenMinuteReset: () => void;
  onStartOpen: () => void;
  onStop: () => void;
  onReplay: () => void;
  onSoundscapeChange: (s: SoundscapeId) => void;
  onVolumeChange: (level: number) => void;
  onBrightnessChange: (level: number) => void;
  onPathwayChange: (p: Pathway) => void;
  onOpenSettings: () => void;
}) {
  const isActive = sessionState !== "idle" && sessionState !== "completed";

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-4 sm:pb-8 pt-8 sm:pt-16 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-1000"
      role="toolbar"
      aria-label="Session and sound controls"
    >
      <SessionAnnouncer state={sessionState} />

      {/* Pathway selector */}
      <div className="flex gap-2 mb-3 px-4">
        {([
          { id: "ambient-rhythm" as const, label: "Ambient Rhythm" },
          { id: "external-focus" as const, label: "External Focus" },
        ]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onPathwayChange(id)}
            aria-pressed={pathway === id}
            className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-light tracking-wider transition-all duration-500 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
              pathway === id
                ? "bg-amber-200/12 text-amber-100/70 border border-amber-200/20"
                : "text-amber-100/30 border border-transparent hover:text-amber-100/50 hover:bg-white/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Soundscape selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-5 px-4">
        {(Object.keys(SOUNDSCAPES) as SoundscapeId[]).map((s) => (
          <button
            key={s}
            onClick={() => onSoundscapeChange(s)}
            aria-pressed={soundscape === s}
            className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-light tracking-wider transition-all duration-500 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
              soundscape === s
                ? "bg-amber-100/10 text-amber-50/80 border border-amber-200/20 shadow-[0_0_15px_rgba(251,191,36,0.08)]"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-amber-100/5 hover:text-amber-50/80"
            }`}
          >
            {SOUNDSCAPES[s].label}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-5 items-center">
        <label className="flex items-center gap-2">
          <span className="text-amber-100/60 text-xs font-light tracking-wider uppercase w-16 text-right">
            Volume
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
            className="slider"
            aria-label="Volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volume * 100)}
            aria-valuetext={`${Math.round(volume * 100)} percent`}
          />
        </label>
        <label className="flex items-center gap-2">
          <span className="text-amber-100/60 text-xs font-light tracking-wider uppercase w-16 text-right">
            Visuals
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(brightness * 100)}
            onChange={(e) => onBrightnessChange(Number(e.target.value) / 100)}
            className="slider"
            aria-label="Visual brightness"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(brightness * 100)}
            aria-valuetext={`${Math.round(brightness * 100)} percent`}
          />
        </label>
      </div>

      {/* Session controls */}
      {sessionState === "completed" ? (
        <SessionIndicator
          state={sessionState}
          sessionType={sessionType}
          progress={progress}
          onStartAgain={onReplay}
          onOpenSession={onStartOpen}
        />
      ) : isActive ? (
        <div className="flex flex-col items-center gap-3">
          <SessionIndicator
            state={sessionState}
            sessionType={sessionType}
            progress={progress}
            onStartAgain={onReplay}
            onOpenSession={onStartOpen}
          />
          <button
            onClick={onStop}
            className="min-h-[44px] group relative w-16 h-16 rounded-full bg-amber-100/8 border border-amber-200/15 hover:bg-amber-100/12 transition-all duration-500 flex items-center justify-center hover:shadow-[0_0_30px_rgba(251,191,36,0.06)] focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
            aria-label="Stop"
          >
            <div className="flex gap-1.5">
              <div className="w-1.5 h-5 bg-amber-100/60 rounded-full" />
              <div className="w-1.5 h-5 bg-amber-100/60 rounded-full" />
            </div>
            <div
              className="absolute inset-0 rounded-full border border-amber-200/15 animate-ping opacity-20"
              aria-hidden="true"
            />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onStartReset}
            className="min-h-[44px] px-6 py-3 rounded-full bg-amber-200/10 text-amber-100/80 text-sm font-light tracking-wider border border-amber-200/20 hover:bg-amber-200/15 transition-all duration-500 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
          >
            Start 5-Minute Reset
          </button>
          <div className="flex gap-3">
            <button
              onClick={onStartTenMinuteReset}
              className="min-h-[44px] px-5 py-2 rounded-full text-amber-100/40 text-xs font-light tracking-wider border border-amber-200/10 hover:text-amber-100/60 hover:bg-white/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
            >
              10-Minute Reset
            </button>
            <button
              onClick={onStartOpen}
              className="min-h-[44px] px-5 py-2 rounded-full text-amber-100/40 text-xs font-light tracking-wider border border-amber-200/10 hover:text-amber-100/60 hover:bg-white/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
            >
              Open session
            </button>
          </div>
        </div>
      )}

      {/* Soundscape description */}
      <p className="mt-4 text-amber-100/60 text-xs font-light tracking-widest uppercase">
        {SOUNDSCAPE_DESCRIPTIONS[soundscape]}
      </p>

      {/* Settings button */}
      <button
        onClick={onOpenSettings}
        className="mt-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-amber-100/30 hover:text-amber-100/60 hover:bg-white/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
        aria-label="Open settings"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="9" r="2.5" />
          <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.1 3.1l1.4 1.4M13.5 13.5l1.4 1.4M3.1 14.9l1.4-1.4M13.5 4.5l1.4-1.4" />
        </svg>
      </button>
    </div>
  );
}
