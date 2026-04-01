import { useState, useRef, useCallback } from "react";
import type { Route } from "./+types/home";
import { AudioEngine, type AudioMode } from "../components/audio-engine";
import { VisualCanvas } from "../components/visual-canvas";
import { Controls } from "../components/controls";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Regulate - Nervous System Music & Visuals" },
    {
      name: "description",
      content:
        "Binaural beats, ambient drones, and flowing visuals for nervous system regulation",
    },
  ];
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<AudioMode>("calm");
  const [showUI, setShowUI] = useState(true);
  const audioRef = useRef<AudioEngine | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const resetHideTimer = useCallback(() => {
    setShowUI(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowUI(false), 5000);
    }
  }, [isPlaying]);

  const handleToggle = useCallback(async () => {
    if (isPlaying) {
      if (audioRef.current) {
        await audioRef.current.stop();
      }
      setIsPlaying(false);
      setShowUI(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      const engine = new AudioEngine();
      audioRef.current = engine;
      await engine.start(mode);
      setIsPlaying(true);
      hideTimerRef.current = setTimeout(() => setShowUI(false), 5000);
    }
  }, [isPlaying, mode]);

  const handleModeChange = useCallback(
    async (newMode: AudioMode) => {
      setMode(newMode);
      if (isPlaying && audioRef.current) {
        await audioRef.current.stop();
        const engine = new AudioEngine();
        audioRef.current = engine;
        await engine.start(newMode);
      }
    },
    [isPlaying],
  );

  return (
    <div
      className="fixed inset-0 overflow-hidden cursor-none select-none"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      style={{ cursor: showUI ? "default" : "none" }}
    >
      <VisualCanvas
        audioEngine={audioRef.current}
        isPlaying={isPlaying}
        mode={mode}
      />

      {/* Title */}
      <div
        className={`fixed top-0 left-0 right-0 z-10 flex flex-col items-center pt-8 pb-16 bg-gradient-to-b from-black/40 to-transparent transition-opacity duration-1000 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <h1 className="text-white/50 text-lg font-extralight tracking-[0.3em] uppercase">
          Regulate
        </h1>
        <p className="text-white/20 text-xs font-light tracking-wider mt-1">
          Nervous system music + visuals
        </p>
      </div>

      {/* Controls */}
      <div
        className={`transition-opacity duration-1000 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <Controls
          isPlaying={isPlaying}
          mode={mode}
          onToggle={handleToggle}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  );
}
