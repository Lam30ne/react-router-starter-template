import { useState, useRef, useCallback, useEffect } from "react";
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
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    { name: "theme-color", content: "#0f0a05" },
  ];
}

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<AudioMode>("calm");
  const [volume, setVolume] = useState(0.7);
  const [brightness, setBrightness] = useState(0.7);
  const [showUI, setShowUI] = useState(true);
  const audioRef = useRef<AudioEngine | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      audioRef.current?.dispose();
    };
  }, []);

  const toggleUI = useCallback(() => {
    setShowUI((prev) => {
      const next = !prev;
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (next && isPlaying) {
        hideTimerRef.current = setTimeout(() => setShowUI(false), 5000);
      }
      return next;
    });
  }, [isPlaying]);

  const resetHideTimer = useCallback(() => {
    setShowUI(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => setShowUI(false), 5000);
    }
  }, [isPlaying]);

  const handleToggle = useCallback(async () => {
    if (isPlaying) {
      // Optimistic: update UI immediately, fade audio in background
      setIsPlaying(false);
      setShowUI(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      audioRef.current?.stop();
    } else {
      if (!audioRef.current) {
        audioRef.current = new AudioEngine();
      }
      audioRef.current.setVolume(volume);
      await audioRef.current.start(mode);
      setIsPlaying(true);
      hideTimerRef.current = setTimeout(() => setShowUI(false), 5000);
    }
  }, [isPlaying, mode, volume]);

  const handleModeChange = useCallback(
    (newMode: AudioMode) => {
      // Optimistic: update mode in UI immediately
      setMode(newMode);
      if (isPlaying && audioRef.current) {
        audioRef.current.crossfadeTo(newMode);
      }
    },
    [isPlaying],
  );

  const handleVolumeChange = useCallback((level: number) => {
    setVolume(level);
    audioRef.current?.setVolume(level);
  }, []);

  const handleBrightnessChange = useCallback((level: number) => {
    setBrightness(level);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      onMouseMove={resetHideTimer}
      onClick={toggleUI}
      onKeyDown={resetHideTimer}
      onFocusCapture={resetHideTimer}
      style={{ cursor: showUI ? "default" : "none" }}
    >
      <VisualCanvas
        audioEngine={audioRef.current}
        isPlaying={isPlaying}
        mode={mode}
        brightness={brightness}
      />

      {/* Title */}
      <header
        className={`fixed top-0 left-0 right-0 z-10 flex items-start justify-between pt-4 sm:pt-8 pb-8 sm:pb-16 px-4 sm:px-8 bg-gradient-to-b from-black/40 to-transparent transition-opacity duration-1000 ${showUI ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="w-10" />
        <div className="flex flex-col items-center">
          <h1 className="text-amber-50/70 text-base sm:text-lg font-extralight tracking-[0.3em] uppercase">
            Regulate
          </h1>
          <p className="text-amber-100/55 text-xs font-light tracking-wider mt-1">
            Nervous system music + visuals
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          className="w-10 h-10 flex items-center justify-center rounded-full text-amber-100/50 hover:text-amber-100/80 hover:bg-white/5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-200/60 focus-visible:outline-none"
          aria-label="Toggle fullscreen"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 6V1h5M17 6V1h-5M1 12v5h5M17 12v5h-5" />
          </svg>
        </button>
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
