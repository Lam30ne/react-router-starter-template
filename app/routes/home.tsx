import { useState, useRef, useCallback } from "react";
import type { Route } from "./+types/home";
import { AudioEngine, type AudioMode } from "../components/audio-engine";
import { VisualCanvas } from "../components/visual-canvas";
import { Controls } from "../components/controls";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Regulate — Nervous System Music & Visuals" },
    {
      name: "description",
      content:
        "Binaural beats, warm drones, and flowing visuals for nervous system regulation",
    },
  ];
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || navigator.hardwareConcurrency <= 4;
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<AudioMode>("calm");
  const [volume, setVolume] = useState(0.7);
  const [brightness, setBrightness] = useState(0.7);
  const [visualIntensity] = useState(() => (isMobile() ? 0.5 : 0.65));
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
      audioRef.current = null;
      setIsPlaying(false);
      setShowUI(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      const engine = new AudioEngine();
      audioRef.current = engine;
      engine.setVolume(volume);
      await engine.start(mode);
      setIsPlaying(true);
      hideTimerRef.current = setTimeout(() => setShowUI(false), 5000);
    }
  }, [isPlaying, mode, volume]);

  const handleModeChange = useCallback(
    async (newMode: AudioMode) => {
      setMode(newMode);
      if (isPlaying && audioRef.current) {
        await audioRef.current.crossfadeTo(newMode);
      }
    },
    [isPlaying],
  );

  const handleVolumeChange = useCallback((level: number) => {
    setVolume(level);
    if (audioRef.current) {
      audioRef.current.setVolume(level);
    }
  }, []);

  const handleBrightnessChange = useCallback((level: number) => {
    setBrightness(level);
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      onMouseMove={resetHideTimer}
      onTouchStart={resetHideTimer}
      onKeyDown={resetHideTimer}
      onFocusCapture={resetHideTimer}
      style={{ cursor: showUI ? "default" : "none" }}
    >
      <VisualCanvas
        audioEngine={audioRef.current}
        isPlaying={isPlaying}
        mode={mode}
        brightness={brightness}
        visualIntensity={visualIntensity}
      />

      {/* Title */}
      <header
        className={`fixed top-0 left-0 right-0 z-10 flex flex-col items-center pt-4 sm:pt-8 pb-8 sm:pb-16 bg-gradient-to-b from-black/40 to-transparent transition-opacity duration-1000 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <h1 className="text-amber-50/70 text-base sm:text-lg font-extralight tracking-[0.3em] uppercase">
          Regulate
        </h1>
        <p className="text-amber-100/55 text-xs font-light tracking-wider mt-1">
          Nervous system music + visuals
        </p>
      </header>

      {/* Controls */}
      <div
        className={`transition-opacity duration-1000 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <Controls
          isPlaying={isPlaying}
          mode={mode}
          volume={volume}
          brightness={brightness}
          onToggle={handleToggle}
          onModeChange={handleModeChange}
          onVolumeChange={handleVolumeChange}
          onBrightnessChange={handleBrightnessChange}
        />
      </div>
    </div>
  );
}
