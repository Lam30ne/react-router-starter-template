import { memo } from "react";
import { MODES, type AudioMode } from "./audio-engine";

export const Controls = memo(function Controls({
  isPlaying,
  mode,
  volume,
  brightness,
  onToggle,
  onModeChange,
  onVolumeChange,
  onBrightnessChange,
}: {
  isPlaying: boolean;
  mode: AudioMode;
  volume: number;
  brightness: number;
  onToggle: () => void;
  onModeChange: (mode: AudioMode) => void;
  onVolumeChange: (level: number) => void;
  onBrightnessChange: (level: number) => void;
}) {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-4 sm:pb-8 pt-8 sm:pt-16 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-1000"
      role="toolbar"
      aria-label="Audio and visual controls"
    >
      {/* Mode selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-5 px-4">
        {(Object.keys(MODES) as AudioMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            aria-pressed={mode === m}
            className={`px-4 py-2 rounded-full text-sm font-light tracking-wider transition-all duration-500 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none ${
              mode === m
                ? "bg-amber-100/10 text-amber-50/80 border border-amber-200/20 shadow-[0_0_15px_rgba(251,191,36,0.08)]"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-amber-100/5 hover:text-amber-50/80"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Intensity sliders */}
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
          />
        </label>
      </div>

      {/* Play/Stop */}
      <button
        onClick={onToggle}
        className="group relative w-16 h-16 rounded-full bg-amber-100/8 border border-amber-200/15 hover:bg-amber-100/12 transition-all duration-500 flex items-center justify-center hover:shadow-[0_0_30px_rgba(251,191,36,0.06)] focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
        aria-label={isPlaying ? "Stop" : "Play"}
      >
        {isPlaying ? (
          <div className="flex gap-1.5">
            <div className="w-1.5 h-5 bg-amber-100/60 rounded-full" />
            <div className="w-1.5 h-5 bg-amber-100/60 rounded-full" />
          </div>
        ) : (
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-amber-100/60 ml-1" />
        )}
        {isPlaying && (
          <div
            className="absolute inset-0 rounded-full border border-amber-200/15 animate-ping opacity-20"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Mode description */}
      <p className="mt-4 text-amber-100/60 text-xs font-light tracking-widest uppercase">
        {MODES[mode].description}
      </p>

      {/* Headphones hint */}
      {!isPlaying && (
        <p className="mt-2 text-amber-100/50 text-xs font-light tracking-wider">
          Headphones recommended for binaural beats
        </p>
      )}
    </div>
  );
});
