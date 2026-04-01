import { MODES, type AudioMode } from "./audio-engine";

export function Controls({
  isPlaying,
  mode,
  onToggle,
  onModeChange,
}: {
  isPlaying: boolean;
  mode: AudioMode;
  onToggle: () => void;
  onModeChange: (mode: AudioMode) => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-8 pt-16 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-1000">
      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(MODES) as AudioMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`px-4 py-2 rounded-full text-sm font-light tracking-wider transition-all duration-500 ${
              mode === m
                ? "bg-white/15 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                : "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/60"
            }`}
          >
            {MODES[m].label}
          </button>
        ))}
      </div>

      {/* Play/Stop */}
      <button
        onClick={onToggle}
        className="group relative w-16 h-16 rounded-full bg-white/10 border border-white/20 hover:bg-white/15 transition-all duration-500 flex items-center justify-center hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        aria-label={isPlaying ? "Stop" : "Play"}
      >
        {isPlaying ? (
          <div className="flex gap-1.5">
            <div className="w-1.5 h-5 bg-white/70 rounded-full" />
            <div className="w-1.5 h-5 bg-white/70 rounded-full" />
          </div>
        ) : (
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-white/70 ml-1" />
        )}
        {isPlaying && (
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
        )}
      </button>

      {/* Mode description */}
      <p className="mt-4 text-white/30 text-xs font-light tracking-widest uppercase">
        {MODES[mode].description}
      </p>

      {/* Headphones hint */}
      {!isPlaying && (
        <p className="mt-2 text-white/20 text-[10px] font-light tracking-wider">
          Headphones recommended for binaural beats
        </p>
      )}
    </div>
  );
}
